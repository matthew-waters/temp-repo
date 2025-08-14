// frontend/src/lib/types/option.ts
export type Option = { id: string; label: string };

export type MetricOption = {
	id: string;
	label: string;
	description: string;
};

export type MetricGroups = {
	retrieval: MetricOption[];
	agent: MetricOption[];
	generation: MetricOption[];
	aggregate: MetricOption[];
};

export type Catalog = {
	agent_types: Option[];
	chunking_strategies: Option[];
	embedding_models: Option[]; // provider id
	llm_interfaces: Option[]; // safe to ignore in UI
	retriever_types: Option[];
	evaluation_metrics_grouped: MetricGroups; // ← includes descriptions
	llm_models: Option[]; // provider id
};
