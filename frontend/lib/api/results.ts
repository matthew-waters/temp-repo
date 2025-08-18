export type ResultRunSummary = {
	experiment_id: string;
	start_time: string;
	end_time: string;
	duration_seconds: number;
	agents: string[];
	dir_name: string;
	report_path: string;
};

export type ResultGroup = {
	experiment_name: string;
	latest_description?: string | null;
	latest_dataset_id?: string | null;
	runs: ResultRunSummary[];
};

export async function fetchResultsGrouped(): Promise<ResultGroup[]> {
	const res = await fetch(`${BASE}/results/grouped`, { cache: "no-store" });
	if (!res.ok) throw new Error(`Failed to load results (${res.status})`);
	return res.json();
}

export function reportDownloadUrl(resultId: string) {
	// you can wire this to a direct download endpoint if you switch to FileResponse
	return `${BASE}/results/${encodeURIComponent(resultId)}/report`;
}
