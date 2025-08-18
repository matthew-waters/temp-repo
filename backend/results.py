# app/routers/results.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import json, os

router = APIRouter(prefix="/results", tags=["results"])
RESULTS_ROOT = Path(os.environ.get("RESULTS_DIR", "results"))

# ------- Report schemas (minimal load) -------
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
    results: Dict[str, Any]  # agent name -> EvaluationData (opaque here)

# ------- Response models -------
class ResultRunSummary(BaseModel):
    experiment_id: str
    start_time: datetime
    end_time: datetime
    duration_seconds: float
    agents: List[str]
    dir_name: str
    report_path: str

class ResultGroup(BaseModel):
    experiment_name: str
    # optional: latest description/dataset as a convenience
    latest_description: Optional[str] = None
    latest_dataset_id: Optional[str] = None
    runs: List[ResultRunSummary]

# ------- Helpers -------
def _load_report(path: Path) -> Report:
    with path.open("r", encoding="utf-8") as f:
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
            rep = _load_report(rp)
            yield d.name, d, rp, rep
        except Exception:
            # skip malformed report
            continue

# ------- Endpoints -------
@router.get("/grouped", response_model=List[ResultGroup])
def list_results_grouped():
    groups: Dict[str, ResultGroup] = {}

    for dir_name, dpath, rpath, rep in _iter_reports():
        name = rep.experiment.name
        agents = sorted(list(rep.results.keys()))
        run = ResultRunSummary(
            experiment_id=rep.experiment.experiment_id,
            start_time=rep.experiment.start_time,
            end_time=rep.experiment.end_time,
            duration_seconds=rep.experiment.duration_seconds,
            agents=agents,
            dir_name=dir_name,
            report_path=str(rpath.as_posix()),
        )
        grp = groups.get(name)
        if not grp:
            groups[name] = ResultGroup(
                experiment_name=name,
                latest_description=rep.experiment.description,
                latest_dataset_id=rep.experiment.dataset_id,
                runs=[run],
            )
        else:
            grp.runs.append(run)
            # keep latest metadata convenience fields based on end_time
            if run.end_time > max(r.end_time for r in grp.runs[:-1]):
                grp.latest_description = rep.experiment.description
                grp.latest_dataset_id = rep.experiment.dataset_id

    # sort runs (newest first) and groups (alphabetical, or by latest end_time if preferred)
    out = list(groups.values())
    for g in out:
        g.runs.sort(key=lambda r: r.end_time, reverse=True)
    out.sort(key=lambda g: g.experiment_name.lower())
    return out

@router.get("/{result_id}")
def get_result(result_id: str):
    for dir_name, _, rpath, rep in _iter_reports():
        if rep.experiment.experiment_id == result_id or dir_name == result_id:
            with open(rpath, "r", encoding="utf-8") as f:
                return json.load(f)
    raise HTTPException(status_code=404, detail="Result not found")

@router.get("/{result_id}/report")
def download_report(result_id: str):
    for dir_name, _, rpath, rep in _iter_reports():
        if rep.experiment.experiment_id == result_id or dir_name == result_id:
            # Let frontend use the URL directly; returning path is fine or use FileResponse
            return {"path": str(rpath.as_posix())}
    raise HTTPException(status_code=404, detail="Result not found")
