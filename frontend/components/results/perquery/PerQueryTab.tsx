"use client";

import React from "react";
import type { Report, MetricResult } from "../../../lib/types/results";
import Modal from "../../ui/Modal";
import QueryModal from "./QueryModal";

type AgentPerQuery = {
	answer?: string | null;
	error?: string | null;
	metrics: MetricResult[];
	final?: any; // CoreAgentState (ignored typing per your instruction)
};

export type QueryRow = {
	query_id: string | number;
	query: string;
	agents: Record<string, AgentPerQuery>;
};

type Props = {
	report: Report;
};

export default function PerQueryTab({ report }: Props) {
	const [filter, setFilter] = React.useState("");
	const [selected, setSelected] = React.useState<QueryRow | null>(null);
	const [baseline, setBaseline] = React.useState<string | null>(null);

	const agentNames = React.useMemo(
		() => Object.keys(report.results || {}),
		[report]
	);

	// Build per-query rows across all agents
	const rows = React.useMemo<QueryRow[]>(() => {
		const byId = new Map<string, QueryRow>();
		for (const agent of agentNames) {
			const pqs = report.results[agent]?.per_query_results || [];
			for (const r of pqs) {
				const key = String(r.query_id);
				if (!byId.has(key)) {
					byId.set(key, {
						query_id: r.query_id,
						query: r.query,
						agents: {},
					});
				}
				const row = byId.get(key)!;
				row.query = row.query || r.query;
				row.agents[agent] = {
					answer: (r.final_agent_state as any)?.answer ?? null,
					error: r.error ?? null,
					metrics: r.metrics || [],
					final: r.final_agent_state as any,
				};
			}
		}
		// Sort by numeric-ish id if possible, else lexicographically
		return Array.from(byId.values()).sort((a, b) => {
			const ax = Number(a.query_id),
				bx = Number(b.query_id);
			if (!Number.isNaN(ax) && !Number.isNaN(bx)) return ax - bx;
			return String(a.query_id).localeCompare(String(b.query_id));
		});
	}, [agentNames, report]);

	React.useEffect(() => {
		if (!baseline && agentNames.length) setBaseline(agentNames[0] || null);
	}, [agentNames, baseline]);

	const filtered = React.useMemo(() => {
		if (!filter.trim()) return rows;
		const f = filter.toLowerCase();
		return rows.filter(
			(r) =>
				String(r.query_id).toLowerCase().includes(f) ||
				(r.query || "").toLowerCase().includes(f)
		);
	}, [rows, filter]);

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="flex flex-wrap items-center gap-2">
				<input
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					placeholder="Search by query id or text…"
					className="w-full md:w-80 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
				/>
				<div className="ml-auto flex items-center gap-2 text-sm">
					<span className="text-zinc-500">Baseline:</span>
					<select
						className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm"
						value={baseline ?? ""}
						onChange={(e) => setBaseline(e.target.value || null)}
					>
						{agentNames.map((a) => (
							<option key={a} value={a}>
								{a}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
						<tr>
							<th className="text-left px-3 py-2 w-32">Query ID</th>
							<th className="text-left px-3 py-2">Query</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((r) => (
							<tr
								key={String(r.query_id)}
								className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
								onClick={() => setSelected(r)}
								title="Click to compare agents for this query"
							>
								<td className="px-3 py-2 font-mono text-xs">
									{String(r.query_id)}
								</td>
								<td
									className="px-3 py-2 max-w-[900px] truncate"
									title={r.query}
								>
									{r.query}
								</td>
							</tr>
						))}
						{filtered.length === 0 && (
							<tr>
								<td colSpan={2} className="px-3 py-4 text-sm text-zinc-500">
									No queries match your filter.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Modal */}
			<Modal
				open={!!selected}
				onClose={() => setSelected(null)}
				title={
					selected ? (
						<div className="truncate">Query {String(selected.query_id)}</div>
					) : null
				}
			>
				{selected && baseline && (
					<QueryModal
						row={selected}
						agents={agentNames}
						baseline={baseline}
						onChangeBaseline={setBaseline}
					/>
				)}
			</Modal>
		</div>
	);
}
