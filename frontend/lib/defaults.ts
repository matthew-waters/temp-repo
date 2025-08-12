import type { Agent, ExperimentConfig } from "./types";

export const makeDefaultAgent = (n: number): Agent => ({
	id: `agent-${n}`,
	name: `Agent ${n}`,
	agent_type: "",
	retriever: { retriever_type: "", top_k: 5 },
	llm: { llm_type: "", model: "", region: "", temperature: 0.0 },
	overrides: { chunking: null, qdrant_db: null },
});

export const emptyConfig = (): ExperimentConfig => ({
	name: "",
	data_ingestion: {
		ingestion_corpus: {
			dataset_id: undefined,
			data_path: "",
			document_type: "json",
		},
		test_set: { dataset_id: undefined, data_path: "", document_type: "json" },
	},
	chunking: {
		chunking_type: "",
		parameters: { chunk_size: 1000, chunk_overlap: 200 },
	},
	qdrant_db: {
		parameters: {
			embedding: {
				embedding_type: "",
				embedding_model: "",
				embedding_length: 0,
				distance_metric: "cosine",
			},
		},
	},
	agents: [], // will be set when creating a config using available agents
	evaluation: {
		output_dir: "results",
		metrics: {
			agent: [] as string[],
			retrieval: [] as string[],
			generation: [] as string[],
			aggregate: [] as string[],
		},
		llm_override: {
			enabled: false,
			llm_type: "",
			model: "",
			region: "",
			temperature: 0.0,
		},
		run: { include_agents: [] as string[] },
	},
});
