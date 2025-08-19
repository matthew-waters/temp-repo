export interface LCOriginDocInfo {
	collection: string;
	doc_id: string | number;
	title?: string;
	author?: string;
	source?: string;
	published_at?: string; // ISO string if present
	url?: string;
}

export interface LCRetrievalInfo {
	score?: number;
	search_query?: string;
}

export interface LCDocument {
	id?: string; // unique id for the chunk
	page_content: string; // the retrieved text
	metadata?: {
		retrieval_info?: LCRetrievalInfo;
		origin_doc_info?: LCOriginDocInfo;
		[key: string]: any; // tolerate extra keys
	};
}

export interface RetrieverCall {
	query: string; // the embedded query
	collection_name: string; // chosen collection
	results: LCDocument[]; // retrieved chunks
	top_k: number;
	timestamp?: string;
	retriever_type?: string;
}
