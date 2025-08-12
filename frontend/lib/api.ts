import type {
	Agent,
	DatasetInfo,
	ChunkingType,
	EmbeddingModelInfo,
	DistanceMetric,
	AgentTypeInfo,
	RetrieverSpec,
	LLMProviderSpec,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const urls = {
	agents: ["/api/catalog/agents", `${API_BASE}/catalog/agents`].filter(Boolean),
	datasets: ["/api/catalog/datasets", `${API_BASE}/catalog/datasets`].filter(
		Boolean
	),
	chunking: [
		"/api/catalog/chunking-types",
		`${API_BASE}/catalog/chunking-types`,
	].filter(Boolean),
	embedding: [
		"/api/catalog/embedding-models",
		`${API_BASE}/catalog/embedding-models`,
	].filter(Boolean),
	distances: [
		"/api/catalog/distance-metrics",
		`${API_BASE}/catalog/distance-metrics`,
	].filter(Boolean),

	// NEW
	agentTypes: [
		"/api/catalog/agent-types",
		`${API_BASE}/catalog/agent-types`,
	].filter(Boolean),
	retrievers: [
		"/api/catalog/retrievers",
		`${API_BASE}/catalog/retrievers`,
	].filter(Boolean),
	llms: ["/api/catalog/llms", `${API_BASE}/catalog/llms`].filter(Boolean),
};

async function tryFetch<T>(u: string[]): Promise<T> {
	let lastErr: any;
	for (const url of u) {
		try {
			const res = await fetch(url, { cache: "no-store" });
			if (!res.ok) throw new Error(`${url} -> ${res.status}`);
			return (await res.json()) as T;
		} catch (e) {
			lastErr = e;
		}
	}
	throw lastErr ?? new Error("fetch failed");
}

export const fetchAgents = (): Promise<Agent[]> =>
	tryFetch<Agent[]>(urls.agents);
export const fetchDatasets = (): Promise<DatasetInfo[]> =>
	tryFetch<DatasetInfo[]>(urls.datasets);
export const fetchChunkingTypes = (): Promise<ChunkingType[]> =>
	tryFetch<ChunkingType[]>(urls.chunking);
export const fetchEmbeddingModels = (): Promise<EmbeddingModelInfo[]> =>
	tryFetch<EmbeddingModelInfo[]>(urls.embedding);
export const fetchDistanceMetrics = (): Promise<DistanceMetric[]> =>
	tryFetch<DistanceMetric[]>(urls.distances);

// NEW
export const fetchAgentTypes = (): Promise<AgentTypeInfo[]> =>
	tryFetch<AgentTypeInfo[]>(urls.agentTypes);
export const fetchRetrieverSpecs = (): Promise<RetrieverSpec[]> =>
	tryFetch<RetrieverSpec[]>(urls.retrievers);
export const fetchLLMProviders = (): Promise<LLMProviderSpec[]> =>
	tryFetch<LLMProviderSpec[]>(urls.llms);
