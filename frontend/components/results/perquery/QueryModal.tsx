"use client";

import React from "react";
import type { MetricResult } from "../../../lib/types/results";
import type { QueryRow } from "./PerQueryTab";

type Props = {
	row: QueryRow;
	agents: string[];
};

type AgentTabKey = string;

export default function QueryModal({ row, agents }: Props) {
	const [tab, setTab] = React.useState<AgentTabKey>(agents[0] || "");

	React.useEffect(() => {
		// If agent list changes or first agent missing, reset tab
		if (!tab || !agents.includes(tab)) {
			setTab(agents[0] || "");
		}
	}, [agents, tab]);

	const active = tab ? row.agents[tab] : undefined;

	return (
		<div className="space-y-4">
			{/* Query header: make the query itself clear */}
			<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
				<div className="text-xs text-zinc-500 mb-1">
					Query ID: <span className="font-mono">{String(row.query_id)}</span>
				</div>
				<div className="text-sm md:text-base whitespace-pre-wrap">
					{row.query || (
						<span className="text-zinc-500 italic">No query text</span>
					)}
				</div>
			</div>

			{/* Agent tabs */}
			<div className="flex flex-wrap items-center gap-2">
				{agents.map((a) => (
					<AgentTab key={a} active={tab === a} onClick={() => setTab(a)}>
						{a}
					</AgentTab>
				))}
			</div>

			{/* Active agent content */}
			{!active ? (
				<div className="text-sm text-zinc-500">No data for this agent.</div>
			) : (
				<div className="space-y-4">
					{/* Answer / Error */}
					<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
						<div className="text-sm font-medium mb-2">Answer</div>
						{active.error ? (
							<div className="text-sm text-red-600">
								Error:{" "}
								<span className="font-mono text-[12px]">{active.error}</span>
							</div>
						) : (
							<div className="text-sm whitespace-pre-wrap max-h-64 overflow-auto">
								{active.answer || (
									<span className="text-zinc-500 italic">No answer</span>
								)}
							</div>
						)}
					</div>

					{/* Metrics table */}
					<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
								<tr>
									<th className="text-left px-3 py-2 w-56">Metric</th>
									<th className="text-left px-3 py-2">Value</th>
									<th className="text-left px-3 py-2">Pass/Fail</th>
									<th className="text-left px-3 py-2">Message</th>
								</tr>
							</thead>
							<tbody>
								{(active.metrics || []).map((m) => (
									<tr
										key={m.name}
										className="border-t border-zinc-200 dark:border-zinc-800 align-top"
									>
										<td className="px-3 py-2 font-mono text-xs">{m.name}</td>
										<td className="px-3 py-2">{renderMetricValue(m)}</td>
										<td className="px-3 py-2">
											{m.passed === undefined ? (
												<span className="text-zinc-400">—</span>
											) : m.passed ? (
												<span className="text-[11px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">
													pass
												</span>
											) : (
												<span className="text-[11px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
													fail
												</span>
											)}
										</td>
										<td className="px-3 py-2 text-xs text-zinc-600">
											{m.message ? (
												<span title={m.message}>
													{truncate(m.message, 120)}
												</span>
											) : (
												<span className="text-zinc-400">—</span>
											)}
										</td>
									</tr>
								))}
								{(!active.metrics || active.metrics.length === 0) && (
									<tr>
										<td colSpan={4} className="px-3 py-3 text-sm text-zinc-500">
											No metrics recorded for this agent on this query.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* (Optional) raw metadata/debug later: traces, retrieved chunks, etc. */}
				</div>
			)}
		</div>
	);
}

function AgentTab({
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

function renderMetricValue(m: MetricResult) {
	if (m.value === null || m.value === undefined) {
		return m.passed === undefined ? "—" : m.passed ? "✅" : "❌";
	}
	if (typeof m.value === "number") {
		const v = m.value;
		if (Math.abs(v) >= 100) return v.toFixed(0);
		if (Math.abs(v) >= 10) return v.toFixed(1);
		return v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
	}
	if (typeof m.value === "boolean") {
		return m.value ? "✅" : "❌";
	}
	return String(m.value);
}

function truncate(s: string, n: number) {
	if (!s) return "";
	return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
