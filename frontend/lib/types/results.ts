// src/lib/types/results.ts

export interface Report {
	experiment: ExperimentMetadata;
	/** key = agent name */
	results: Record<string, EvaluationData>;
}

export interface ExperimentMetadata {
	experiment_id: string;
	name: string;
	description?: string | null;
	start_time: string; // ISO datetime
	end_time: string; // ISO datetime
	duration_seconds: number;
	dataset_id: string;
	experiment_dir: string;
}

export interface EvaluationData {
	per_query_results: QueryEvaluationResult[];
	aggregate_results: MetricResult[];
}

export interface QueryEvaluationResult {
	/** Your test set uses string ids, but some code has int. Use a union to be safe. */
	query_id: string | number;
	query: string;
	final_agent_state?: CoreAgentState | null;
	error?: string | null;
	metrics: MetricResult[];
}

export interface MetricResult {
	name: string;
	value?: any;
	passed?: boolean;
	error?: string | null;
	message?: string | null;
	metadata?: Record<string, any> | null;
}

export interface CoreAgentState {
	original_query: string;
	answer?: string | null;

	aggregate_retrieved_chunks: Document[];
	llm_calls: LLMCall[];
	retriever_calls: RetrieverCall[];
	other_tool_calls: Array<Record<string, any>>; // generic for now

	steps_run: number;

	start_time: string; // ISO datetime
	end_time: string; // ISO datetime
	exit_reason?: string | null;
	error_msg?: string | null;
}

export interface LLMCall {
	prompt: string;
	response: string;
	model_name?: string | null;
	timestamp?: string | null; // ISO datetime
}

export interface RetrieverCall {
	query: string;
	collection_name: string;
	results: Document[];
	top_k: number;
}

export interface Document {
	// Your ingestion model had doc_id: string and collection: string; retrieved docs might differ.
	doc_id?: string | number;
	collection?: string;
	content?: string;
	metadata?: Record<string, any>;
	// keep loose to accommodate retrieved chunk shapes
	[k: string]: any;
}
