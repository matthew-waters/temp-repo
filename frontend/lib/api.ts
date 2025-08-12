import type {
	Agent,
	DatasetInfo,
	ChunkingType,
	EmbeddingModelInfo,
	DistanceMetric,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// Prefer Next proxy /api/* during dev; fallback to API_BASE if set
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
