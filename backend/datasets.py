from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.registries.dataset_registry import DatasetRegistry

router = APIRouter(prefix="/catalog", tags=["catalog"])


class Option(BaseModel):
    id: str
    label: str


@router.get("/datasets", response_model=List[Option])
def get_dataset_options():
    """
    Return only dataset ids + labels for the UI dropdown.
    The frontend will save dataset_id in the experiment config.
    Paths are resolved server-side later (no need to send JSON or paths to UI).
    """
    return [Option(id=i, label=i) for i in DatasetRegistry.list_ids()]


# (Optional) If your runner wants to resolve ids -> paths via API (not needed by the UI):
class ResolveResp(BaseModel):
    corpus_path: str
    test_set_path: str

@router.get("/datasets/resolve", response_model=ResolveResp)
def resolve_dataset(dataset_id: str):
    try:
        paths = DatasetRegistry.resolve(dataset_id)
        return ResolveResp(corpus_path=paths.corpus_path, test_set_path=paths.test_set_path)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
