# app/routers/results.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import os

router = APIRouter(prefix="/results", tags=["results"])

RESULTS_ROOT = Path(os.environ.get("RESULTS_DIR", "results"))

# ---- Schemas (subset for listing) ----
class ExperimentMetadata(BaseModel):
    experiment_id: str
    name: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_seconds: float
    dataset_id: str
    experiment_dir: str

class Report(BaseModel):
    experiment: ExperimentMetadata
    results: Dict[str, Any]  # keys = agent names; value = EvaluationData (opaque here)

class ResultSummary(BaseModel):
    experiment_id: str
    name: str
    dataset_id: str
    start_time: datetime
    end_time: datetime
    duration_seconds: float
    agents: List[str]
    dir_name: str           # folder under results/
    report_path: str        # absolute or relative path

# ---- Helpers ----
def _load_report(report_path: Path) -> Report:
    with report_path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return Report.model_validate(data)

def _iter_reports():
    if not RESULTS_ROOT.exists():
        return
    for d in RESULTS_ROOT.iterdir():
        if not d.is_dir():
            continue
        rp = d / "report.json"
        if not rp.exists():
            continue
        try:
            report = _load_report(rp)
            yield d.name, d, rp, report
        except Exception:
            # Skip corrupted/malformed reports silently
            continue

# ---- Endpoints ----
@router.get("", response_model=List[ResultSummary])
def list_results():
    items: List[ResultSummary] = []
    for dir_name, dpath, rpath, rep in _iter_reports():
        items.append(ResultSummary(
            experiment_id=rep.experiment.experiment_id,
            name=rep.experiment.name,
            dataset_id=rep.experiment.dataset_id,
            start_time=rep.experiment.start_time,
            end_time=rep.experiment.end_time,
            duration_seconds=rep.experiment.duration_seconds,
            agents=sorted(list(rep.results.keys())),
            dir_name=dir_name,
            report_path=str(rpath.as_posix()),
        ))
    # newest first
    items.sort(key=lambda x: x.end_time, reverse=True)
    return items

@router.get("/{result_id}")
def get_result(result_id: str):
    """
    result_id can be either experiment_id (preferred) OR the folder name.
    """
    for dir_name, _, rpath, rep in _iter_reports():
        if rep.experiment.experiment_id == result_id or dir_name == result_id:
            # return full report.json contents
            with open(rpath, "r", encoding="utf-8") as f:
                return json.load(f)
    raise HTTPException(status_code=404, detail="Result not found")

@router.get("/{result_id}/report", response_class=FileResponse)
def download_report(result_id: str):
    for dir_name, _, rpath, rep in _iter_reports():
        if rep.experiment.experiment_id == result_id or dir_name == result_id:
            return FileResponse(rpath, media_type="application/json", filename=f"{dir_name}.report.json")
    raise HTTPException(status_code=404, detail="Result not found")
