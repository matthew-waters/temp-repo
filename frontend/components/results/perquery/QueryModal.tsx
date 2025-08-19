"use client";

import React from "react";
import type { MetricResult } from "../../../lib/types/results";
import type { QueryRow } from "./PerQueryTab";

type Props = {
	row: QueryRow;
	agents: string[];
	baseline: string; // agent name
	onChangeBaseline: (a: string) => void;
};

type TabKey = "compare" | "metrics" | "traces";

export default function QueryModal({
	row,
	agents,
	baseline,
	onChangeBaseline,
}: Props) {
	const [tab, setTab] = React.useState<TabKey>("compare");

	// Union of metric names across agents for this query
	const metricNames = React.useMemo(() => {
		const set = new Set<string>();
		for (const a of agents) {
			row.agents[a]?.metrics?.forEach((m) => m?.name && set.add(m.name));
		}
		return Array.from(set).sort((x, y) => x.localeCompare(y));
	}, [row, agents]);

	const baselineMetrics = React.useMemo(() => {
		const ms = row.agents[baseline]?.metrics || [];
		const map = new Map<string, MetricResult>();
		ms.forEach((m) => map.set(m.name, m));
		return map;
	}, [row, baseline]);

	return (
		<div className="space-y-4">
			{/* Header controls inside modal */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="text-sm text-zinc-500">
					Query ID: <span className="font-mono">{String(row.query_id)}</span>
				</div>
				<div className="text-sm truncate" title={row.query}>
					{row.query}
				</div>
				<div className="ml-auto flex items-center gap-2 text-sm">
					<span className="text-zinc-500">Baseline:</span>
					<select
						className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm"
						value={baseline}
						onChange={(e) => onChangeBaseline(e.target.value)}
					>
						{agents.map((a) => (
							<option key={a} value={a}>
								{a}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-2">
				<SubTab active={tab === "compare"} onClick={() => setTab("compare")}>
					Compare
				</SubTab>
				<SubTab active={tab === "metrics"} onClick={() => setTab("metrics")}>
					Metrics
				</SubTab>
				<SubTab active={tab === "traces"} onClick={() => setTab("traces")}>
					Traces
				</SubTab>
			</div>

			{/* Content */}
			{tab === "compare" && <CompareView row={row} agents={agents} />}

			{tab === "metrics" && (
				<MetricsMatrix
					row={row}
					agents={agents}
					metricNames={metricNames}
					baseline={baseline}
					baselineMetrics={baselineMetrics}
				/>
			)}

			{tab === "traces" && (
				<div className="text-sm text-zinc-500">
					Traces view coming soon (LLM calls, retrieval calls, tool calls).
				</div>
			)}
		</div>
	);
}

function SubTab({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-2.5 py-1 text-xs rounded-lg ${
				active
					? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
					: "hover:bg-zinc-100 dark:hover:bg-zinc-800"
			}`}
		>
			{children}
		</button>
	);
}

/* ---------------- Compare view ---------------- */

function CompareView({ row, agents }: { row: QueryRow; agents: string[] }) {
	const cols = Math.min(3, Math.max(1, agents.length));
	return (
		<div className="space-y-3">
			<div className="grid md:grid-cols-3 gap-3">
				{agents.map((a) => {
					const ap = row.agents[a];
					const hasError = !!ap?.error;
					const answer = ap?.answer;
					return (
						<div
							key={a}
							className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
						>
							<div className="text-sm font-semibold mb-1">{a}</div>
							{hasError ? (
								<div className="text-sm text-red-600">
									Error:{" "}
									<span className="font-mono text-[12px]">{ap?.error}</span>
								</div>
							) : (
								<div className="text-sm whitespace-pre-wrap max-h-48 overflow-auto">
									{answer || (
										<span className="text-zinc-500 italic">No answer</span>
									)}
								</div>
							)}
							{/* Mini chips for top 3 metrics (by name) */}
							<div className="mt-2 flex flex-wrap gap-1">
								{(ap?.metrics || []).slice(0, 3).map((m) => (
									<span
										key={m.name}
										className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800"
									>
										{m.name}: {renderMetricValue(m)}
									</span>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ---------------- Metrics matrix ---------------- */

function MetricsMatrix({
	row,
	agents,
	metricNames,
	baseline,
	baselineMetrics,
}: {
	row: QueryRow;
	agents: string[];
	metricNames: string[];
	baseline: string;
	baselineMetrics: Map<string, any>;
}) {
	return (
		<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
			<table className="w-full text-sm">
				<thead className="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
					<tr>
						<th className="text-left px-3 py-2 w-56">Metric</th>
						{agents.map((a) => (
							<th key={a} className="text-left px-3 py-2">
								{a}
							</th>
						))}
						<th className="text-left px-3 py-2">Δ vs {baseline}</th>
					</tr>
				</thead>
				<tbody>
					{metricNames.map((name) => (
						<tr
							key={name}
							className="border-t border-zinc-200 dark:border-zinc-800 align-top"
						>
							<td className="px-3 py-2 font-mono text-xs">{name}</td>
							{agents.map((a) => {
								const cell = (row.agents[a]?.metrics || []).find(
									(m) => m.name === name
								);
								return (
									<td key={a} className="px-3 py-2">
										{cell ? (
											<div className="flex items-center gap-2">
												<span>{renderMetricValue(cell)}</span>
												{cell.passed !== undefined && (
													<span
														className={`text-[10px] px-1.5 py-0.5 rounded ${
															cell.passed
																? "bg-green-100 text-green-700"
																: "bg-red-100 text-red-700"
														}`}
													>
														{cell.passed ? "pass" : "fail"}
													</span>
												)}
												{cell.message && (
													<span
														className="text-[11px] text-zinc-500"
														title={cell.message}
													>
														ℹ︎
													</span>
												)}
											</div>
										) : (
											<span className="text-zinc-400">—</span>
										)}
									</td>
								);
							})}
							{/* Δ vs baseline (numeric only; shows first agent with numeric value minus baseline) */}
							<td className="px-3 py-2">
								{renderDeltaVsBaseline(
									row,
									agents,
									name,
									baseline,
									baselineMetrics
								)}
							</td>
						</tr>
					))}
					{metricNames.length === 0 && (
						<tr>
							<td
								colSpan={agents.length + 2}
								className="px-3 py-3 text-sm text-zinc-500"
							>
								No metrics recorded for this query.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

/* ---------------- helpers ---------------- */

function renderMetricValue(m: MetricResult) {
	if (m.value === null || m.value === undefined) {
		return m.passed === undefined ? "—" : m.passed ? "✅" : "❌";
	}
	if (typeof m.value === "number") {
		// format 0.### sensibly
		const v = m.value;
		if (Math.abs(v) >= 100) return v.toFixed(0);
		if (Math.abs(v) >= 10) return v.toFixed(1);
		return v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
	}
	if (typeof m.value === "boolean") {
		return m.value ? "✅" : "❌";
	}
	// string or other
	return String(m.value);
}

function asNum(v: any): number | null {
	if (typeof v === "number") return v;
	if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)))
		return Number(v);
	return null;
}

function renderDeltaVsBaseline(
	row: QueryRow,
	agents: string[],
	metricName: string,
	baseline: string,
	baselineMetrics: Map<string, MetricResult>
) {
	const b = baselineMetrics.get(metricName);
	const bVal = b ? asNum(b.value) : null;
	if (bVal === null) return <span className="text-zinc-400">—</span>;

	// For simplicity, show Δ for the first *non-baseline* agent with a numeric value.
	// (You can expand to one Δ per agent if you prefer.)
	for (const a of agents) {
		if (a === baseline) continue;
		const m = (row.agents[a]?.metrics || []).find((x) => x.name === metricName);
		const v = m ? asNum(m.value) : null;
		if (v === null) continue;
		const delta = v - bVal;
		const sign = delta > 0 ? "+" : "";
		const cls =
			delta > 0
				? "text-green-600"
				: delta < 0
				? "text-red-600"
				: "text-zinc-600";
		return (
			<span className={`font-mono ${cls}`}>
				{sign}
				{formatDelta(delta)}
			</span>
		);
	}
	return <span className="text-zinc-400">—</span>;
}

function formatDelta(x: number) {
	const ax = Math.abs(x);
	if (ax >= 100) return x.toFixed(0);
	if (ax >= 10) return x.toFixed(1);
	const s = x.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
	return s === "-0" ? "0" : s;
}
