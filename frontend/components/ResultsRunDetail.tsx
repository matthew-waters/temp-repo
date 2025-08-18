// src/components/ResultsRunDetail.tsx
"use client";

import React from "react";
import SectionCard from "./SectionCard";
import { fetchResultById } from "../lib/api";

type Props = {
	runId: string;
	onBack: () => void;
};

type Report = {
	experiment: {
		experiment_id: string;
		name: string;
		description?: string | null;
		start_time: string; // ISO
		end_time: string; // ISO
		duration_seconds: number;
		dataset_id: string;
		experiment_dir: string;
	};
	results: Record<string, unknown>; // agent name -> EvaluationData (opaque for now)
};

export default function ResultsRunDetail({ runId, onBack }: Props) {
	const [report, setReport] = React.useState<Report | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const data = (await fetchResultById(runId)) as Report;
				if (!mounted) return;
				setReport(data);
			} catch (e: any) {
				if (!mounted) return;
				setError(e?.message || "Failed to load report");
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [runId]);

	if (loading) {
		return (
			<SectionCard title="Run Details" icon={<span>📄</span>}>
				<div className="text-sm text-zinc-500">Loading…</div>
			</SectionCard>
		);
	}
	if (error || !report) {
		return (
			<SectionCard title="Run Details" icon={<span>📄</span>}>
				<div className="text-sm text-red-600 mb-3">{error || "No data."}</div>
				<button
					type="button"
					onClick={onBack}
					className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
				>
					← Back to results
				</button>
			</SectionCard>
		);
	}

	const exp = report.experiment;
	const agents = Object.keys(report.results || {});
	const start = new Date(exp.start_time);
	const end = new Date(exp.end_time);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Run Details</h2>
				<button
					type="button"
					onClick={onBack}
					className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
				>
					← Back to results
				</button>
			</div>

			<SectionCard title={exp.name} icon={<span>🧪</span>}>
				<div className="grid md:grid-cols-2 gap-4 text-sm">
					<div>
						<div className="text-zinc-500">Experiment ID</div>
						<div className="font-mono">{exp.experiment_id}</div>
					</div>
					<div>
						<div className="text-zinc-500">Dataset</div>
						<div>
							<code>{exp.dataset_id}</code>
						</div>
					</div>
					<div>
						<div className="text-zinc-500">Start</div>
						<div>{start.toLocaleString()}</div>
					</div>
					<div>
						<div className="text-zinc-500">End</div>
						<div>{end.toLocaleString()}</div>
					</div>
					<div>
						<div className="text-zinc-500">Duration</div>
						<div>{formatDuration(exp.duration_seconds)}</div>
					</div>
					<div>
						<div className="text-zinc-500">Results Directory</div>
						<div className="font-mono truncate" title={exp.experiment_dir}>
							{exp.experiment_dir}
						</div>
					</div>
				</div>

				{exp.description && (
					<div className="mt-4">
						<div className="text-sm text-zinc-500 mb-1">Description</div>
						<div className="text-sm">{exp.description}</div>
					</div>
				)}

				<div className="mt-4">
					<div className="text-sm text-zinc-500 mb-1">Agents in this run</div>
					<div className="flex flex-wrap gap-2">
						{agents.length ? (
							agents.map((a) => (
								<span
									key={a}
									className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
								>
									{a}
								</span>
							))
						) : (
							<span className="text-sm text-zinc-500">—</span>
						)}
					</div>
				</div>
			</SectionCard>

			{/* Placeholder for later: metrics tables/graphs */}
			<SectionCard title="Metrics (coming soon)" icon={<span>📊</span>}>
				<div className="text-sm text-zinc-500">
					This section will display per-agent aggregate metrics and per-query
					metrics.
				</div>
			</SectionCard>
		</div>
	);
}

function formatDuration(seconds: number) {
	if (!seconds && seconds !== 0) return "—";
	const s = Math.floor(seconds % 60);
	const m = Math.floor((seconds / 60) % 60);
	const h = Math.floor(seconds / 3600);
	const parts: string[] = [];
	if (h) parts.push(`${h}h`);
	if (m) parts.push(`${m}m`);
	parts.push(`${s}s`);
	return parts.join(" ");
}
