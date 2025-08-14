# backend/app/routers/catalog_registry.py
from typing import Dict, List, Mapping
from fastapi import APIRouter
from pydantic import BaseModel
from your_package.registry import ComponentRegistry

router = APIRouter(prefix="/catalog", tags=["catalog"])

class Option(BaseModel):
    id: str
    label: str

class MetricOption(BaseModel):
    id: str
    label: str
    description: str

class MetricGroups(BaseModel):
    retrieval: List[MetricOption]
    agent: List[MetricOption]
    generation: List[MetricOption]
    aggregate: List[MetricOption]

class CatalogResponse(BaseModel):
    agent_types: List[Option]
    chunking_strategies: List[Option]
    embedding_models: List[Option]          # id = provider id, label = friendly name
    llm_interfaces: List[Option]            # (ok if unused by UI)
    retriever_types: List[Option]
    evaluation_metrics_grouped: MetricGroups
    llm_models: List[Option]                # id = provider id, label = friendly name

def _map_options(d: Mapping[str, str]) -> List[Option]:
    return [Option(id=k, label=v) for k, v in sorted(d.items(), key=lambda kv: kv[1].lower())]

@router.get("", response_model=CatalogResponse)
def get_full_catalog():
    ui = ComponentRegistry.get_ui_registry()
    grouped = ComponentRegistry.get_metrics_ui_grouped()

    # If you already have functions for these, use them (kept inline here for brevity)
    embedding_models = [
        Option(id=model_id, label=name)
        for name, model_id in sorted(ComponentRegistry.get_embedding_models().items(), key=lambda kv: kv[0].lower())
    ]
    llm_models = [
        Option(id=model_id, label=name)
        for name, model_id in sorted(ComponentRegistry.get_llm_models().items(), key=lambda kv: kv[0].lower())
    ]

    return CatalogResponse(
        agent_types=_map_options(ui.get("agent_types", {})),
        chunking_strategies=_map_options(ui.get("chunking_strategies", {})),
        embedding_models=embedding_models,
        llm_interfaces=_map_options(ui.get("llm_interfaces", {})),
        retriever_types=_map_options(ui.get("retriever_types", {})),
        evaluation_metrics_grouped=MetricGroups(
            retrieval=[MetricOption(**m) for m in grouped.get("retrieval", [])],
            agent=[MetricOption(**m) for m in grouped.get("agent", [])],
            generation=[MetricOption(**m) for m in grouped.get("generation", [])],
            aggregate=[MetricOption(**m) for m in grouped.get("aggregate", [])],
        ),
        llm_models=llm_models,
    )
