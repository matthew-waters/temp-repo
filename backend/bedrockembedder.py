from __future__ import annotations
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Iterable, Optional, Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
import time, random, threading, sys

# ---- optional tqdm ----
try:
    from tqdm import tqdm  # pip install tqdm
    _HAS_TQDM = True
except Exception:
    _HAS_TQDM = False

class BaseEmbeddingModel(ABC):
    @property
    @abstractmethod
    def embedding_length(self) -> int: ...
    @abstractmethod
    def embed_query(self, text: str) -> List[float]: ...
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]: ...

# ---------- utils ----------
def _chunks(seq: List[str], n: int):
    for i in range(0, len(seq), n):
        yield seq[i:i+n]

def _retry(fn, *, tries=4, min_delay=0.5, max_delay=4.0, jitter=0.25):
    for attempt in range(1, tries + 1):
        try:
            return fn()
        except Exception:
            if attempt == tries:
                raise
            sleep = min(max_delay, min_delay * (2 ** (attempt - 1))) + random.uniform(0, jitter)
            time.sleep(sleep)

class _Progress:
    """Thread-safe progress printer with optional tqdm + callback."""
    def __init__(
        self,
        total: int,
        desc: str = "Embedding",
        use_tqdm: Optional[bool] = None,
        file = sys.stderr,
        every: int = 10,
        on_progress: Optional[Callable[[int, int], None]] = None,  # (completed, total)
    ):
        self.total = total
        self.completed = 0
        self.file = file
        self.every = max(1, every)
        self.on_progress = on_progress
        self._lock = threading.Lock()
        self._use_tqdm = _HAS_TQDM if use_tqdm is None else bool(use_tqdm)
        self._bar = tqdm(total=total, desc=desc, file=file) if (self._use_tqdm and total > 0) else None

    def update(self, n: int = 1):
        with self._lock:
            self.completed += n
            if self._bar:
                self._bar.update(n)
            else:
                # print every `every` steps and at the end
                if self.completed % self.every == 0 or self.completed == self.total:
                    print(f"[{time.strftime('%H:%M:%S')}] {self.completed}/{self.total} embedded", file=self.file)
            if self.on_progress:
                try:
                    self.on_progress(self.completed, self.total)
                except Exception:
                    pass

    def close(self):
        if self._bar:
            self._bar.close()

# ---------- Bedrock embedder with progress ----------
class BedrockEmbedder(BaseEmbeddingModel):
    def __init__(
        self,
        model_name: str,
        embedding_length: int,
        *,
        region: str = "us-east-1",
        batch_size: int = 128,
        max_concurrency: int = 8,
        provider_has_batch_api: bool = False,
        retries: int = 4,
        # progress options:
        show_progress: bool = True,
        progress_every: int = 10,                        # print every N items (when not using tqdm)
        progress_desc: str = "Embedding",
        use_tqdm: Optional[bool] = None,                 # None=auto, True/False to force
        on_progress: Optional[Callable[[int,int],None]] = None,
    ):
        from langchain_community.embeddings import BedrockEmbeddings
        self.model_name = model_name
        self._embedding_length = embedding_length
        self.model = BedrockEmbeddings(model_id=self.model_name, region_name=region)
        self.batch_size = batch_size
        self.max_concurrency = max_concurrency
        self.provider_has_batch_api = provider_has_batch_api
        self.retries = retries
        self.show_progress = show_progress
        self.progress_every = progress_every
        self.progress_desc = progress_desc
        self.use_tqdm = use_tqdm
        self.on_progress = on_progress

    # ---- Base interface ----
    @property
    def embedding_length(self) -> int:
        return self._embedding_length

    def embed_query(self, text: str) -> List[float]:
        return self._embed_one(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        # de-dupe
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

        unique_vectors: List[List[float]] = [None] * len(unique)  # type: ignore

        prog = _Progress(
            total=len(unique),
            desc=self.progress_desc,
            use_tqdm=self.use_tqdm if self.show_progress else False,
            every=self.progress_every,
            on_progress=self.on_progress,
        )

        try:
            if self.provider_has_batch_api:
                pos = 0
                for batch in _chunks(unique, self.batch_size):
                    vecs = _retry(lambda b=batch: self._embed_many_via_provider(b), tries=self.retries)
                    for j, v in enumerate(vecs):
                        unique_vectors[pos + j] = v
                    pos += len(batch)
                    if self.show_progress:
                        prog.update(len(batch))
            else:
                # parallel single-text calls
                def work(i: int, t: str):
                    vec = _retry(lambda: self._embed_one(t), tries=self.retries)
                    return i, vec

                with ThreadPoolExecutor(max_workers=self.max_concurrency) as pool:
                    futures = [pool.submit(work, i, t) for i, t in enumerate(unique)]
                    for fut in as_completed(futures):
                        i, vec = fut.result()
                        unique_vectors[i] = vec
                        if self.show_progress:
                            prog.update(1)
        finally:
            prog.close()

        return [unique_vectors[m] for m in mapping]

    # ---- Provider-specific primitives ----
    def _embed_one(self, text: str) -> List[float]:
        return self.model.embed_query(text)

    def _embed_many_via_provider(self, texts: List[str]) -> List[List[float]]:
        # If your specific Bedrock model supports multi-text in a single request,
        # call that here. Otherwise LangChain's embed_documents may loop internally.
        return self.model.embed_documents(texts)
