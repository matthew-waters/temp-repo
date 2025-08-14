import type { Catalog, DatasetInfo } from "./types";

/**
 * Backend runs in Docker. Expose it as e.g. http://localhost:8000 and set:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/** Single round-trip for the whole registry */
export async function fetchCatalog(): Promise<Catalog> {
	const url = `${API_BASE}/catalog`;
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) throw new Error(`/catalog -> ${res.status}`);
	return (await res.json()) as Catalog;
}

/** Optional: keep dataset discovery if you implemented it */
export async function fetchDatasets(): Promise<DatasetInfo[]> {
	const url = `${API_BASE}/catalog/datasets`;
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) return []; // graceful if not implemented yet
	return (await res.json()) as DatasetInfo[];
}

export async function runExperiment(payload: {
	id?: string;
	name?: string;
	config: ExperimentConfig;
}) {
	const res = await fetch(`${BASE}/experiments/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(
			`Run request failed (${res.status}): ${text || res.statusText}`
		);
	}
	return res.json() as Promise<{ status: string; message: string; echo: any }>;
}

export async function fetchDatasetPaths(datasetId: string) {
	const res = await fetch(
		`${BASE}/datasets/${encodeURIComponent(datasetId)}/paths`,
		{
			cache: "no-store",
		}
	);
	if (!res.ok)
		throw new Error(`Failed to resolve dataset "${datasetId}" (${res.status})`);
	return (await res.json()) as { corpus_path: string; test_set_path: string };
}
