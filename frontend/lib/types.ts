export type Retriever = {
	retriever_type: string;
	top_k: number;
};

export type LLMConfig = {
	llm_type: string;
	model: string;
	region: string;
	temperature: number;
};

export type Agent = {
	id: string;
	name: string;
	agent_type: string;
	retriever: Retriever;
	llm: LLMConfig;
	overrides: {
		chunking: any | null;
		qdrant_db: any | null;
	};
};

export type DatasetInfo = {
	id: string;
	name: string;
	data_path: string;
	document_type: string;
};

export type ChunkingType = string;

export type EmbeddingModelInfo = {
	id: string;
	name: string;
	embedding_type: string;
	model: string;
	embedding_length: number;
};

export type DistanceMetric = string;

/** NEW: catalogs for agent configuration */
export type AgentTypeInfo = {
	id: string; // e.g., "rag_orchestrator"
	name: string; // human label
};

export type RetrieverSpec = {
	id: string; // retriever_type value
	name: string; // label
	agent_types?: string[]; // if provided, restricts to these agent types
};

export type LLMProviderSpec = {
	llm_type: string; // e.g., "openai", "anthropic"
	name: string; // label
	models: string[]; // e.g., ["gpt-4o-mini", "gpt-4.1"]
	regions?: string[]; // optional list if your backend cares
};

export type ExperimentConfig = {
	name: string;
	description?: string;
	data_ingestion: {
		ingestion_corpus: {
			dataset_id?: string;
			data_path: string;
			document_type: string;
		};
		test_set: { dataset_id?: string; data_path: string; document_type: string };
	};
	chunking: {
		chunking_type: string;
		parameters: { chunk_size: number; chunk_overlap: number };
	};
	qdrant_db: {
		parameters: {
			embedding: {
				embedding_type: string;
				embedding_model: string;
				embedding_length: number; // Dimensionality
			};
			distance_metric: string; // at qdrant_db.parameters
		};
	};
	/** Agents you want to evaluate against each other */
	agents: Agent[];
	evaluation: {
		metrics: {
			agent: string[];
			retrieval: string[];
			generation: string[];
			aggregate: string[];
		};
		llm_override: { enabled: boolean } & LLMConfig;
		/**
		 * If empty -> run all agents in this config.
		 * Otherwise, only run the listed agent IDs.
		 */
		run: { include_agents: string[] };
	};
};

export type SavedConfig = {
	id: string;
	name: string;
	config: ExperimentConfig;
	createdAt: string;
	updatedAt: string;
};
