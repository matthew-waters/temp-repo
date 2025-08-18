# app/routers/datasets.py
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import List
import json, os

router = APIRouter(prefix="/datasets", tags=["datasets"])

DATASETS_ROOT = Path(os.environ.get("DATASETS_DIR", "data/datasets")).resolve()


def _dataset_dir(dataset_id: str) -> Path:
    p = (DATASETS_ROOT / dataset_id).resolve()
    # prevent path traversal & ensure inside root
    if DATASETS_ROOT not in p.parents and p != DATASETS_ROOT:
        raise HTTPException(status_code=400, detail="Invalid dataset_id")
    if not p.exists() or not p.is_dir():
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")
    return p


def _load_json_file(path: Path):
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {path.name}")
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load {path.name}: {e}")


@router.get("", response_model=List[str])
def list_datasets():
    """
    Lists dataset IDs by scanning DATASETS_DIR for directories
    containing both corpus.json and test_set.json.
    """
    if not DATASETS_ROOT.exists():
        return []
    ids: List[str] = []
    for d in DATASETS_ROOT.iterdir():
        if d.is_dir() and (d / "corpus.json").exists() and (d / "test_set.json").exists():
            ids.append(d.name)
    ids.sort(key=str.lower)
    return ids


@router.get("/{dataset_id}/corpus")
def get_corpus(dataset_id: str):
    d = _dataset_dir(dataset_id)
    return _load_json_file(d / "corpus.json")


@router.get("/{dataset_id}/test_set")
def get_test_set(dataset_id: str):
    d = _dataset_dir(dataset_id)
    return _load_json_file(d / "test_set.json")
