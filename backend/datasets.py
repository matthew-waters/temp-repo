# app/routers/datasets_content.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from pathlib import Path
import json

from app.routers.dataset_registry import DatasetRegistry  # adjust import path to your project

router = APIRouter(prefix="/datasets", tags=["datasets"])

# --- Models (align with your earlier Python definitions) ---

class Evidence(BaseModel):
    doc_id: int
    collection: str
    fact_excerpt: str
    other: Optional[Dict[str, Any]] = None

class GroundTruthAnswer(BaseModel):
    query_answer: str
    supporting_evidence: List[Evidence]

class TestQuery(BaseModel):
    query_id: str
    query: str
    ground_truth_answer: GroundTruthAnswer
    other: Optional[Dict[str, Any]] = None

class TestSetData(BaseModel):
    data: List[TestQuery]

class IngestionDocument(BaseModel):
    content: str
    collection: str
    doc_id: str
    metadata: Dict[str, Any]

class IngestionCollection(BaseModel):
    collection_name: str
    collection_description: str

class IngestionDataset(BaseModel):
    data: List[IngestionDocument]
    collections: List[IngestionCollection]

def _read_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/{dataset_id}/corpus", response_model=IngestionDataset)
def get_corpus(dataset_id: str):
    try:
        paths = DatasetRegistry.resolve(dataset_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown dataset_id")
    p = Path(paths.corpus_path)
    if not p.exists():
        raise HTTPException(status_code=404, detail="corpus.json not found")
    data = _read_json(p)
    return data

@router.get("/{dataset_id}/test_set", response_model=TestSetData)
def get_test_set(dataset_id: str):
    try:
        paths = DatasetRegistry.resolve(dataset_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown dataset_id")
    p = Path(paths.test_set_path)
    if not p.exists():
        raise HTTPException(status_code=404, detail="test_set.json not found")
    data = _read_json(p)
    return data
