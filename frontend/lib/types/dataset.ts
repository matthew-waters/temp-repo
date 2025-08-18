export interface Evidence {
	doc_id: number;
	collection: string;
	fact_excerpt: string;
	other?: Record<string, any> | null;
}

export interface GroundTruthAnswer {
	query_answer: string;
	supporting_evidence: Evidence[];
}

export interface TestQuery {
	query_id: string;
	query: string;
	ground_truth_answer: GroundTruthAnswer;
	other?: Record<string, any> | null;
}

export interface TestSetData {
	data: TestQuery[];
}

export interface IngestionDocument {
	content: string;
	collection: string;
	doc_id: string;
	metadata: Record<string, any>;
}

export interface IngestionCollection {
	collection_name: string;
	collection_description: string;
}

export interface IngestionDataset {
	data: IngestionDocument[];
	collections: IngestionCollection[];
}
