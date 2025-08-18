// src/components/ResultsRunDetail.tsx
"use client";

import React from "react";
import SectionCard from "./SectionCard";
import { fetchResultById, reportDownloadUrl } from "../lib/api";
import type { Report } from "../lib/types/results";
import type { IngestionDataset, TestSetData } from "../lib/types/dataset";
import { Download } from "lucide-react";
import { fetchDatasetCorpus, fetchDatasetTestSet } from "../lib/api";

type Props = {
	runId: string;
	onBack: () => void;
};

export default function ResultsRunDetail({ runId, onBack }: Props) {
	const [report, setReport] = React.useState<Report | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Top-level results tabs (we’ll add more later; for now only "dataset")
	const [tab, setTab] = React.useState<"dataset">("dataset");

	// Dataset sub-tabs
	const [dsTab, setDsTab] = React.useState<"corpus" | "test">("corpus");

	// Dataset data
	const [corpus, setCorpus] = React.useState<IngestionDataset | null>(null);
	const [testSet, setTestSet] = React.useState<TestSetData | null>(null);
	const [dsError, setDsError] = React.useState<string | null>(null);
	const [dsLoading, setDsLoading] = React.useState(false);

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

	// Load dataset content when we have report + we are on the dataset tab
	React.useEffect(() => {
		let mounted = true;
		const loadDataset = async (datasetId: string) => {
			try {
				setDsLoading(true);
				setDsError(null);
				const [cor, tst] = await Promise.all([
					fetchDatasetCorpus(datasetId),
					fetchDatasetTestSet(datasetId),
				]);
				if (!mounted) return;
				setCorpus(cor);
				setTestSet(tst);
			} catch (e: any) {
				if (!mounted) return;
				setDsError(e?.message || "Failed to load dataset content");
			} finally {
				if (mounted) setDsLoading(false);
			}
		};
		if (tab === "dataset" && report?.experiment?.dataset_id) {
			loadDataset(report.experiment.dataset_id);
		}
		return () => {
			mounted = false;
		};
	}, [tab, report?.experiment?.dataset_id]);

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
			{/* Header + back */}
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

			{/* Experiment metadata */}
			<SectionCard
				title={exp.name}
				icon={<span>🧪</span>}
				actions={
					<a
						href={reportDownloadUrl(exp.experiment_id)}
						className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						<Download size={14} /> report.json
					</a>
				}
			>
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

			{/* Top-level tabs */}
			<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				<div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
					<nav className="flex items-center gap-1 p-1">
						<TabBtn
							active={tab === "dataset"}
							onClick={() => setTab("dataset")}
						>
							Dataset
						</TabBtn>
						{/* Future tabs: Agents, Aggregate, Per-Query, Traces... */}
					</nav>
				</div>

				<div className="p-4">
					{tab === "dataset" && (
						<div className="space-y-4">
							{/* Dataset sub-tabs */}
							<div className="flex items-center gap-2">
								<SubTabBtn
									active={dsTab === "corpus"}
									onClick={() => setDsTab("corpus")}
								>
									Corpus
								</SubTabBtn>
								<SubTabBtn
									active={dsTab === "test"}
									onClick={() => setDsTab("test")}
								>
									Test Queries
								</SubTabBtn>
							</div>

							{/* Content */}
							{dsLoading && (
								<div className="text-sm text-zinc-500">Loading dataset…</div>
							)}
							{dsError && <div className="text-sm text-red-600">{dsError}</div>}

							{!dsLoading && !dsError && dsTab === "corpus" && (
								<CorpusTable corpus={corpus} />
							)}

							{!dsLoading && !dsError && dsTab === "test" && (
								<TestSetTable testSet={testSet} />
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function TabBtn({
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
			className={`px-3 py-1.5 text-sm rounded-lg ${
				active
					? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
					: "hover:bg-zinc-100 dark:hover:bg-zinc-800"
			}`}
		>
			{children}
		</button>
	);
}

function SubTabBtn({
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

/* ---------------- Corpus table ---------------- */
function CorpusTable({ corpus }: { corpus: IngestionDataset | null }) {
	const [limit, setLimit] = React.useState(50);
	if (!corpus)
		return <div className="text-sm text-zinc-500">No corpus loaded.</div>;

	const rows = corpus.data.slice(0, limit);
	return (
		<div className="space-y-3">
			<div className="text-sm text-zinc-500">
				Documents:{" "}
				<span className="font-medium text-zinc-700 dark:text-zinc-300">
					{corpus.data.length}
				</span>{" "}
				• Collections:{" "}
				<span className="font-medium">{corpus.collections.length}</span>
			</div>

			<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
						<tr>
							<th className="text-left px-3 py-2">Doc ID</th>
							<th className="text-left px-3 py-2">Collection</th>
							<th className="text-left px-3 py-2">Content (preview)</th>
							<th className="text-left px-3 py-2">Metadata keys</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((d, i) => (
							<tr
								key={`${d.doc_id}-${i}`}
								className="border-t border-zinc-200 dark:border-zinc-800 align-top"
							>
								<td className="px-3 py-2 font-mono text-xs">{d.doc_id}</td>
								<td className="px-3 py-2">{d.collection}</td>
								<td
									className="px-3 py-2 max-w-[520px] truncate"
									title={d.content}
								>
									{truncate(d.content, 180)}
								</td>
								<td className="px-3 py-2 text-xs">
									{Object.keys(d.metadata || {})
										.slice(0, 6)
										.join(", ")}
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={4} className="px-3 py-3 text-sm text-zinc-500">
									No documents.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{limit < corpus.data.length && (
				<div>
					<button
						type="button"
						onClick={() =>
							setLimit((n) => Math.min(n + 50, corpus.data.length))
						}
						className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						Show more
					</button>
				</div>
			)}
		</div>
	);
}

/* ---------------- Test set table ---------------- */
function TestSetTable({ testSet }: { testSet: TestSetData | null }) {
	const [limit, setLimit] = React.useState(50);
	if (!testSet)
		return <div className="text-sm text-zinc-500">No test set loaded.</div>;

	const rows = testSet.data.slice(0, limit);

	return (
		<div className="space-y-3">
			<div className="text-sm text-zinc-500">
				Queries:{" "}
				<span className="font-medium text-zinc-700 dark:text-zinc-300">
					{testSet.data.length}
				</span>
			</div>

			<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
						<tr>
							<th className="text-left px-3 py-2">Query ID</th>
							<th className="text-left px-3 py-2">Query</th>
							<th className="text-left px-3 py-2">Ground Truth</th>
							<th className="text-left px-3 py-2">Evidence #</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((q) => (
							<tr
								key={q.query_id}
								className="border-t border-zinc-200 dark:border-zinc-800 align-top"
							>
								<td className="px-3 py-2 font-mono text-xs">{q.query_id}</td>
								<td
									className="px-3 py-2 max-w-[420px] truncate"
									title={q.query}
								>
									{truncate(q.query, 160)}
								</td>
								<td
									className="px-3 py-2 max-w-[420px] truncate"
									title={q.ground_truth_answer?.query_answer}
								>
									{truncate(q.ground_truth_answer?.query_answer || "", 160)}
								</td>
								<td className="px-3 py-2 text-xs">
									{q.ground_truth_answer?.supporting_evidence?.length ?? 0}
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={4} className="px-3 py-3 text-sm text-zinc-500">
									No test queries.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{limit < testSet.data.length && (
				<div>
					<button
						type="button"
						onClick={() =>
							setLimit((n) => Math.min(n + 50, testSet.data.length))
						}
						className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						Show more
					</button>
				</div>
			)}
		</div>
	);
}

function truncate(s: string, n: number) {
	if (!s) return "";
	return s.length > n ? s.slice(0, n - 1) + "…" : s;
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
