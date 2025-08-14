"use client";

import React from "react";
import SectionCard from "./SectionCard";
import { Download, RefreshCcw, Eye } from "lucide-react";
import {
	fetchResultsIndex,
	reportDownloadUrl,
	type ResultSummary,
} from "../lib/api";

type Props = {
	onOpen: (resultId: string) => void; // future detail view
};

export default function ResultsList({ onOpen }: Props) {
	const [items, setItems] = React.useState<ResultSummary[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [q, setQ] = React.useState("");

	const load = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchResultsIndex();
			setItems(data);
		} catch (e: any) {
			setError(e?.message || "Failed to load results");
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		load();
	}, []);

	const filtered = items.filter((it) => {
		if (!q.trim()) return true;
		const hay = `${it.name} ${it.dataset_id} ${it.agents.join(
			" "
		)}`.toLowerCase();
		return hay.includes(q.toLowerCase());
	});

	return (
		<SectionCard
			title="Experiment Results"
			icon={<span>📈</span>}
			actions={
				<div className="flex gap-2">
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Search name, dataset, agent…"
						className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-white dark:bg-zinc-950"
					/>
					<button
						type="button"
						onClick={load}
						disabled={loading}
						className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
						title="Refresh"
					>
						<RefreshCcw size={14} className={loading ? "animate-spin" : ""} />{" "}
						Refresh
					</button>
				</div>
			}
		>
			<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				{loading && (
					<div className="p-6 text-sm text-zinc-500 text-center">Loading…</div>
				)}
				{error && <div className="p-6 text-sm text-red-600">{error}</div>}
				{!loading && !error && filtered.length === 0 && (
					<div className="p-6 text-sm text-zinc-500 text-center">
						{items.length === 0 ? "No results found." : "No matches."}
					</div>
				)}

				{filtered.map((r) => {
					const end = new Date(r.end_time);
					const dur = formatDuration(r.duration_seconds);
					return (
						<div
							key={r.experiment_id + r.dir_name}
							className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-zinc-200 dark:border-zinc-800"
						>
							<div className="min-w-0">
								<div className="font-medium truncate">{r.name}</div>
								<div className="text-xs text-zinc-500">
									Dataset: <span className="font-medium">{r.dataset_id}</span> •
									Ended {end.toLocaleString()} • Duration {dur}
								</div>
								<div className="mt-1 flex flex-wrap gap-1">
									{r.agents.map((a) => (
										<span
											key={a}
											className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
										>
											{a}
										</span>
									))}
								</div>
							</div>
							<div className="flex items-center gap-2">
								<a
									href={reportDownloadUrl(r.experiment_id)}
									className="px-2 py-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
									title="Download report.json"
								>
									<Download size={14} /> Report
								</a>
								<button
									type="button"
									onClick={() => onOpen(r.experiment_id)}
									className="px-2 py-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
									title="Open details"
								>
									<Eye size={14} /> View
								</button>
							</div>
						</div>
					);
				})}
			</div>
		</SectionCard>
	);
}

function formatDuration(seconds: number) {
	if (!seconds && seconds !== 0) return "—";
	const s = Math.floor(seconds % 60);
	const m = Math.floor((seconds / 60) % 60);
	const h = Math.floor(seconds / 3600);
	const parts = [];
	if (h) parts.push(`${h}h`);
	if (m) parts.push(`${m}m`);
	parts.push(`${s}s`);
	return parts.join(" ");
}
