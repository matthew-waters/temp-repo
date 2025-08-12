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

export type ExperimentConfig = {
	name: string;
	description?: string; // NEW
	data_ingestion: {
		ingestion_corpus: {
			dataset_id?: string;
			data_path: string;
			document_type: string;
		};
		test_set: { dataset_id?: string; data_path: string; document_type: string };
	};
	chunking: {
		chunking_type: string; // chosen from backend list
		parameters: { chunk_size: number; chunk_overlap: number };
	};
	qdrant_db: {
		parameters: {
			embedding: {
				embedding_type: string;
				embedding_model: string;
				embedding_length: number; // “Dimensionality”
			};
			distance_metric: string; // MOVED here (not under embedding)
		};
	};
	agents: Agent[];
	evaluation: {
		metrics: {
			agent: string[];
			retrieval: string[];
			generation: string[];
			aggregate: string[];
		};
		llm_override: { enabled: boolean } & LLMConfig;
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
