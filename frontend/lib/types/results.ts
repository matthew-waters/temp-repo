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
	final_agent_state?: any | null;
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
