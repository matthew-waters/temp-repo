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
