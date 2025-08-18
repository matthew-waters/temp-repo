"use client";

import React from "react";
import SectionCard from "../SectionCard";
import Modal from "../ui/Modal";
import { Download } from "lucide-react";

import {
	fetchResultById,
	reportDownloadUrl,
	fetchDatasetCorpus,
	fetchDatasetTestSet,
} from "../../lib/api";
import type { Report } from "../../lib/types/results";
import type {
	IngestionDataset,
	TestSetData,
	IngestionDocument,
} from "../../lib/types/dataset";

import CorpusTable from "./dataset/CorpusTable";
import TestSetTable from "./dataset/TestSetTable";

type Props = {
	runId: string;
	onBack: () => void;
};

export default function ResultsRunDetail({ runId, onBack }: Props) {
	const [report, setReport] = React.useState<Report | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const [tab, setTab] = React.useState<"dataset">("dataset");
	const [dsTab, setDsTab] = React.useState<"corpus" | "test">("corpus");

	const [corpus, setCorpus] = React.useState<IngestionDataset | null>(null);
	const [testSet, setTestSet] = React.useState<TestSetData | null>(null);
	const [dsError, setDsError] = React.useState<string | null>(null);
	const [dsLoading, setDsLoading] = React.useState(false);

	// Modal state for corpus doc details
	const [selectedDoc, setSelectedDoc] =
		React.useState<IngestionDocument | null>(null);

	const openCorpusDocById = React.useCallback(
		(docId: string | number) => {
			if (!corpus?.data?.length) return;
			const target = String(docId);
			const doc = corpus.data.find((d) => String(d.doc_id) === target);
			if (doc) {
				setSelectedDoc(doc);
			} else {
				// optional: toast or console.warn
				console.warn("Doc not found in corpus:", docId);
			}
		},
		[corpus]
	);

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

							{dsLoading && (
								<div className="text-sm text-zinc-500">Loading dataset…</div>
							)}
							{dsError && <div className="text-sm text-red-600">{dsError}</div>}

							{!dsLoading && !dsError && dsTab === "corpus" && (
								<CorpusTable
									corpus={corpus}
									onSelectDoc={(doc) => setSelectedDoc(doc)}
								/>
							)}

							{!dsLoading && !dsError && dsTab === "test" && (
								<TestSetTable
									testSet={testSet}
									onOpenDocById={openCorpusDocById}
								/>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Document detail modal */}
			<Modal
				open={!!selectedDoc}
				onClose={() => setSelectedDoc(null)}
				title={
					<div className="truncate">
						{extractTitle(selectedDoc) || (
							<span className="text-zinc-500">Untitled document</span>
						)}
					</div>
				}
			>
				{selectedDoc && <DocDetail doc={selectedDoc} />}
			</Modal>
		</div>
	);
}

/* ---------- helpers & subcomponents ---------- */

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

function DocDetail({ doc }: { doc: IngestionDocument }) {
	const meta = doc.metadata || {};
	const title = extractTitle(doc);
	const author =
		meta.author || meta.author_name || meta.by || meta.creator || null;
	const source =
		meta.source || meta.source_site || meta.publisher || meta.outlet || null;
	const published = meta.published_at || meta.date || meta.published || null;
	const url = meta.url || meta.source_url || meta.link || null;

	return (
		<div className="space-y-4 text-sm">
			<div className="grid md:grid-cols-2 gap-4">
				<div>
					<div className="text-zinc-500">Title</div>
					<div>
						{title || <span className="text-zinc-500 italic">Unknown</span>}
					</div>
				</div>
				<div>
					<div className="text-zinc-500">Collection</div>
					<div>
						{doc.collection || (
							<span className="text-zinc-500 italic">Unknown</span>
						)}
					</div>
				</div>
				<div>
					<div className="text-zinc-500">Author</div>
					<div>
						{author || <span className="text-zinc-500 italic">Unknown</span>}
					</div>
				</div>
				<div>
					<div className="text-zinc-500">Source</div>
					<div>
						{source || <span className="text-zinc-500 italic">Unknown</span>}
					</div>
				</div>
				<div>
					<div className="text-zinc-500">Published at</div>
					<div>
						{published ? (
							new Date(published).toLocaleString()
						) : (
							<span className="text-zinc-500 italic">Unknown</span>
						)}
					</div>
				</div>
				<div>
					<div className="text-zinc-500">URL</div>
					<div>
						{url ? (
							<a
								href={url}
								target="_blank"
								rel="noreferrer"
								className="text-blue-600 hover:underline break-all"
							>
								{url}
							</a>
						) : (
							<span className="text-zinc-500 italic">Unknown</span>
						)}
					</div>
				</div>
				<div>
					<div className="text-zinc-500">Doc ID</div>
					<div className="font-mono">{doc.doc_id}</div>
				</div>
			</div>

			<div>
				<div className="text-zinc-500 mb-1">Full content</div>
				<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 whitespace-pre-wrap">
					{doc.content || (
						<span className="text-zinc-500 italic">No content</span>
					)}
				</div>
			</div>

			{Object.keys(doc.metadata || {}).length > 0 && (
				<div>
					<div className="text-zinc-500 mb-1">Raw metadata</div>
					<pre className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-xs overflow-auto">
						{JSON.stringify(doc.metadata, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}

function extractTitle(doc?: IngestionDocument | null): string | null {
	if (!doc) return null;
	const m = doc.metadata || {};
	return (
		(m.title as string) ||
		(m.headline as string) ||
		(m.document_title as string) ||
		null
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
