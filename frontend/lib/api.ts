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

// ---- Types ----
export type RunResponse = {
	status: string; // "ok"
	message: string; // "Experiment started."
	job_id: string;
	name?: string;
};

export type StatusResponse = {
	job_id: string;
	status: "queued" | "running" | "completed" | "failed";
	name?: string;
	start_time?: string;
	result_path?: string;
	error?: string;
};

export type LogEvent =
	| { type: "log"; timestamp: string; message: string }
	| { type: "complete"; timestamp: string; result_path: string }
	| { type: "error"; timestamp: string; error: string }
	| { type: "heartbeat"; ts: string };

// ---- Calls ----
export async function runExperiment(payload: {
	id?: string;
	name?: string;
	config: ExperimentConfig;
}): Promise<RunResponse> {
	const res = await fetch(`${BASE}/experiments/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		// If you still have legacy fields in saved configs and want to strip them:
		// body: JSON.stringify({ ...payload, config: sanitizeConfig(payload.config) }),
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(
			`Run request failed (${res.status}): ${text || res.statusText}`
		);
	}
	return res.json();
}

export function openLogsStream(jobId: string): EventSource {
	const url = `${BASE}/experiments/logs/${encodeURIComponent(jobId)}`;
	// Server-Sent Events (auto-reconnect is minimal; you can enhance if desired)
	return new EventSource(url);
}

export async function getJobStatus(jobId: string): Promise<StatusResponse> {
	const res = await fetch(
		`${BASE}/experiments/status/${encodeURIComponent(jobId)}`,
		{
			cache: "no-store",
		}
	);
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Status failed (${res.status}): ${text || res.statusText}`);
	}
	return res.json();
}
