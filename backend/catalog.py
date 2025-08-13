from typing import Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

# 👇 Adjust this import to wherever your registry lives
# e.g. from mypkg.registry import ComponentRegistry
from your_package.registry import ComponentRegistry


# ---------- Pydantic shapes the frontend can consume ----------
class Option(BaseModel):
    id: str
    label: str  # human-readable name/description

class CatalogResponse(BaseModel):
    agent_types: List[Option]
    chunking_strategies: List[Option]
    embedding_models: List[Option]
    llm_interfaces: List[Option]
    retriever_types: List[Option]
    evaluation_metrics: List[Option]


router = APIRouter(prefix="/catalog", tags=["catalog"])


def _map_options(d: Dict[str, str]) -> List[Option]:
    """
    Turn {"id":"Label", ...} into sorted [{id, label}, ...]
    We sort by label for nicer dropdown UX.
    """
    return [Option(id=k, label=v) for k, v in sorted(d.items(), key=lambda kv: kv[1].lower())]


def _ui() -> Dict[str, Dict[str, str]]:
    """
    ComponentRegistry.get_ui_registry() is expected to return:
    {
      "agent_types":        { "<id>": "<label>", ... },
      "chunking_strategies":{ "<id>": "<label>", ... },
      "embedding_models":   { "<id>": "<label>", ... },
      "llm_interfaces":     { "<id>": "<label>", ... },
      "retriever_types":    { "<id>": "<label>", ... },
      "evaluation_metrics": { "<id>": "<label>", ... }
    }
    """
    return ComponentRegistry.get_ui_registry()


# -------------- All-in-one (reduces round-trips) --------------
@router.get("", response_model=CatalogResponse)
def get_full_catalog():
    ui = _ui()
    return CatalogResponse(
        agent_types=_map_options(ui.get("agent_types", {})),
        chunking_strategies=_map_options(ui.get("chunking_strategies", {})),
        embedding_models=_map_options(ui.get("embedding_models", {})),
        llm_interfaces=_map_options(ui.get("llm_interfaces", {})),
        retriever_types=_map_options(ui.get("retriever_types", {})),
        evaluation_metrics=_map_options(ui.get("evaluation_metrics", {})),
    )


# -------------- Granular endpoints (optional but handy) --------------
@router.get("/agent-types", response_model=List[Option])
def get_agent_types():
    return _map_options(_ui().get("agent_types", {}))

@router.get("/chunking-strategies", response_model=List[Option])
def get_chunking_strategies():
    return _map_options(_ui().get("chunking_strategies", {}))

@router.get("/embedding-models", response_model=List[Option])
def get_embedding_models():
    return _map_options(_ui().get("embedding_models", {}))

@router.get("/llm-interfaces", response_model=List[Option])
def get_llm_interfaces():
    return _map_options(_ui().get("llm_interfaces", {}))

@router.get("/retriever-types", response_model=List[Option])
def get_retriever_types():
    return _map_options(_ui().get("retriever_types", {}))

@router.get("/evaluation-metrics", response_model=List[Option])
def get_evaluation_metrics():
    return _map_options(_ui().get("evaluation_metrics", {}))
