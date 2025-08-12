import type { Agent, DatasetInfo } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// Swap these to your real backend endpoints.
// For now they try a Next.js proxy (/api/*) first, then fall back to API_BASE.
const AGENTS_URLS = [
	"/api/catalog/agents",
	`${API_BASE}/catalog/agents`,
].filter(Boolean);
const DATASETS_URLS = [
	"/api/catalog/datasets",
	`${API_BASE}/catalog/datasets`,
].filter(Boolean);

async function tryFetch<T>(urls: string[]): Promise<T> {
	let lastErr: any;
	for (const u of urls) {
		try {
			const res = await fetch(u, { cache: "no-store" });
			if (!res.ok) throw new Error(`${u} -> ${res.status}`);
			return (await res.json()) as T;
		} catch (e) {
			lastErr = e;
		}
	}
	throw lastErr ?? new Error("fetch failed");
}

export async function fetchAgents(): Promise<Agent[]> {
	return tryFetch<Agent[]>(AGENTS_URLS);
}

export async function fetchDatasets(): Promise<DatasetInfo[]> {
	return tryFetch<DatasetInfo[]>(DATASETS_URLS);
}
