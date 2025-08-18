import type { IngestionDataset, TestSetData } from "./types/dataset";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchDatasetCorpus(
	datasetId: string
): Promise<IngestionDataset> {
	const res = await fetch(
		`${BASE}/datasets/${encodeURIComponent(datasetId)}/corpus`,
		{ cache: "no-store" }
	);
	if (!res.ok) throw new Error(`Failed to load corpus (${res.status})`);
	return res.json();
}

export async function fetchDatasetTestSet(
	datasetId: string
): Promise<TestSetData> {
	const res = await fetch(
		`${BASE}/datasets/${encodeURIComponent(datasetId)}/test_set`,
		{ cache: "no-store" }
	);
	if (!res.ok) throw new Error(`Failed to load test set (${res.status})`);
	return res.json();
}
