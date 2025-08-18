"use client";

import React from "react";
import SectionCard from "./SectionCard";
import {
	ChevronDown,
	ChevronRight,
	Download,
	RefreshCcw,
	Eye,
} from "lucide-react";
import {
	fetchResultsGrouped,
	reportDownloadUrl,
	type ResultGroup,
} from "../lib/api";

type Props = {
	onOpenRun?: (experimentId: string) => void; // optional: open a detail pane for a specific run
};

export default function ResultsGroupedList({ onOpenRun }: Props) {
	const [groups, setGroups] = React.useState<ResultGroup[]>([]);
	const [open, setOpen] = React.useState<Record<string, boolean>>({});
	const [loading, setLoading] = React.useState(false);
	const [q, setQ] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);

	const load = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchResultsGrouped();
			setGroups(data);
			// auto-open groups with few runs
			const initial: Record<string, boolean> = {};
			for (const g of data) initial[g.experiment_name] = g.runs.length <= 1;
			setOpen(initial);
		} catch (e: any) {
			setError(e?.message || "Failed to load results");
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		load();
	}, []);

	const filtered = React.useMemo(() => {
		if (!q.trim()) return groups;
		const needle = q.toLowerCase();
		return groups.filter((g) => {
			const hay = `${g.experiment_name} ${
				g.latest_dataset_id || ""
			}`.toLowerCase();
			return hay.includes(needle);
		});
	}, [groups, q]);

	const toggle = (name: string) => setOpen((o) => ({ ...o, [name]: !o[name] }));

	return (
		<SectionCard
			title="Experiment Results"
			icon={<span>📈</span>}
			actions={
				<div className="flex gap-2">
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Search experiments…"
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
						No results.
					</div>
				)}

				{filtered.map((g) => {
					const isOpen = !!open[g.experiment_name];
					const latest = g.runs[0]; // runs sorted newest first by backend
					return (
						<div
							key={g.experiment_name}
							className="border-b last:border-b-0 border-zinc-200 dark:border-zinc-800"
						>
							{/* Group header */}
							<button
								type="button"
								onClick={() => toggle(g.experiment_name)}
								className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
								aria-expanded={isOpen}
							>
								<div className="min-w-0 flex items-center gap-2">
									{isOpen ? (
										<ChevronDown size={16} />
									) : (
										<ChevronRight size={16} />
									)}
									<div className="truncate">
										<div className="font-medium truncate">
											{g.experiment_name}
										</div>
										<div className="text-xs text-zinc-500">
											{g.latest_dataset_id ? (
												<>
													Dataset: <code>{g.latest_dataset_id}</code> •{" "}
												</>
											) : null}
											Runs: {g.runs.length}
											{latest ? (
												<>
													{" "}
													• Last: {new Date(latest.end_time).toLocaleString()}
												</>
											) : null}
										</div>
									</div>
								</div>
							</button>

							{/* Runs list */}
							{isOpen && (
								<div className="px-4 pb-3">
									{g.runs.map((r) => {
										const dur = formatDuration(r.duration_seconds);
										return (
											<div
												key={r.experiment_id + r.dir_name}
												className="flex items-center justify-between py-2 border-t first:border-t-0 border-zinc-200 dark:border-zinc-800"
											>
												<div className="min-w-0">
													<div className="text-sm">
														<span className="font-medium">
															{new Date(r.end_time).toLocaleString()}
														</span>
														<span className="text-zinc-500">
															{" "}
															• Duration {dur}
														</span>
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
												<div className="flex items-center gap-2 shrink-0">
													<a
														href={reportDownloadUrl(r.experiment_id)}
														className="px-2 py-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
														title="Download report.json"
													>
														<Download size={14} /> Report
													</a>
													{onOpenRun && (
														<button
															type="button"
															onClick={() => onOpenRun(r.experiment_id)}
															className="px-2 py-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
															title="View details"
														>
															<Eye size={14} /> View
														</button>
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
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
