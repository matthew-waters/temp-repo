from __future__ import annotations
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Iterable
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import random

# ---- Base interface ----
class BaseEmbeddingModel(ABC):
    @property
    @abstractmethod
    def embedding_length(self) -> int: ...

    @abstractmethod
    def embed_query(self, text: str) -> List[float]: ...

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]: ...

# ---- Helpers ----
def _chunks(seq: List[str], n: int) -> Iterable[List[str]]:
    for i in range(0, len(seq), n):
        yield seq[i:i+n]

def _retry(fn, *, tries=4, min_delay=0.5, max_delay=4.0, jitter=0.25):
    """Simple exponential backoff with jitter."""
    for attempt in range(1, tries + 1):
        try:
            return fn()
        except Exception as e:
            if attempt == tries:
                raise
            sleep = min(max_delay, min_delay * (2 ** (attempt - 1))) + random.uniform(0, jitter)
            time.sleep(sleep)

# ---- Your Bedrock-backed embedder (LangChain's BedrockEmbeddings under the hood) ----
class BedrockEmbedder(BaseEmbeddingModel):
    def __init__(
        self,
        model_name: str,
        embedding_length: int,
        *,
        region: str = "us-east-1",
        batch_size: int = 128,
        max_concurrency: int = 8,
        provider_has_batch_api: bool = False,   # flip to True if your model supports multi-text inputs
        retries: int = 4,
    ):
        from langchain_community.embeddings import BedrockEmbeddings  # or langchain_aws if you use that
        self.model_name = model_name
        self._embedding_length = embedding_length
        self.model = BedrockEmbeddings(model_id=self.model_name, region_name=region)
        self.batch_size = batch_size
        self.max_concurrency = max_concurrency
        self.provider_has_batch_api = provider_has_batch_api
        self.retries = retries

    # ---- Base interface ----
    @property
    def embedding_length(self) -> int:
        return self._embedding_length

    def embed_query(self, text: str) -> List[float]:
        return self._embed_one(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        # 1) De-dupe to avoid recomputation
        index_of: Dict[str, int] = {}
        unique: List[str] = []
        mapping: List[int] = []
        for t in texts:
            if t in index_of:
                mapping.append(index_of[t])
            else:
                idx = len(unique)
                index_of[t] = idx
                mapping.append(idx)
                unique.append(t)

        # 2) Embed uniques (batch API if available; else threaded)
        unique_vectors: List[List[float]] = [None] * len(unique)  # type: ignore

        if self.provider_has_batch_api:
            # Preferred: fewer HTTP round-trips
            pos = 0
            for batch in _chunks(unique, self.batch_size):
                vecs = _retry(lambda b=batch: self._embed_many_via_provider(b), tries=self.retries)
                for j, v in enumerate(vecs):
                    unique_vectors[pos + j] = v
                pos += len(batch)
        else:
            # Fallback: parallelize single-text calls (I/O bound => threads OK)
            def work(i: int, t: str):
                vec = _retry(lambda: self._embed_one(t), tries=self.retries)
                return i, vec

            with ThreadPoolExecutor(max_workers=self.max_concurrency) as pool:
                futures = [pool.submit(work, i, t) for i, t in enumerate(unique)]
                for fut in as_completed(futures):
                    i, vec = fut.result()
                    unique_vectors[i] = vec

        # 3) Reconstruct in original order
        return [unique_vectors[m] for m in mapping]

    # ---- Provider-specific primitives ----
    def _embed_one(self, text: str) -> List[float]:
        # LangChain's BedrockEmbeddings.embed_query is single-text; wrap with retry above
        return self.model.embed_query(text)

    def _embed_many_via_provider(self, texts: List[str]) -> List[List[float]]:
        """
        If your Bedrock model supports multi-text input, use it here.
        For example, Cohere-on-Bedrock supports a 'texts' array.
        Titan embeddings typically take one text at a time, so leave provider_has_batch_api=False.
        """
        # If your model supports it via LangChain:
        # return self.model.embed_documents(texts)
        # Otherwise, call the bedrock-runtime client directly with a batch payload.
        return self.model.embed_documents(texts)  # falls back to per-item loop if LC doesn’t batch
