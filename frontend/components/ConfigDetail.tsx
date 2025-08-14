"use client";

import React from "react";
import SectionCard from "./SectionCard";
import type { SavedConfig } from "../lib/types";

type Props = {
	item: SavedConfig;
	onBack: () => void;
};

export default function ConfigDetail({ item, onBack }: Props) {
	const { config } = item;
	const metrics = config.evaluation.metrics;

	const datasetId =
		config.data_ingestion.ingestion_corpus.dataset_id ||
		config.data_ingestion.test_set.dataset_id ||
		"";

	const chunk = config.chunking;
	const emb = config.qdrant_db.parameters.embedding;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">
					Config: {item.name || "(unnamed experiment)"}
				</h2>
				<button
					onClick={onBack}
					className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					type="button"
				>
					← Back to list
				</button>
			</div>

			{/* Overview */}
			<SectionCard title="Overview" icon={<span>🧪</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					<div>
						<div className="text-xs text-zinc-500">Experiment Name</div>
						<div className="font-medium">{config.name || "—"}</div>
					</div>
					<div>
						<div className="text-xs text-zinc-500">Agents (by id)</div>
						<div className="font-medium">
							{config.agents.map((a) => a.id).join(", ") || "—"}
						</div>
					</div>
					{config.description && (
						<div className="md:col-span-2">
							<div className="text-xs text-zinc-500">Description</div>
							<div className="text-sm mt-1">{config.description}</div>
						</div>
					)}
				</div>
			</SectionCard>

			{/* Dataset */}
			<SectionCard title="Dataset" icon={<span>🗃️</span>}>
				<div className="text-sm">
					<div className="text-xs text-zinc-500">Selected dataset</div>
					<div className="font-medium mt-1">{datasetId || "—"}</div>
					<div className="text-xs text-zinc-500 mt-2">
						Paths are resolved on the backend during run time.
					</div>
				</div>
			</SectionCard>

			{/* Chunking & Embedding */}
			<SectionCard title="Chunking & Embedding" icon={<span>🧩</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
						<div className="text-xs text-zinc-500">Chunking</div>
						<div className="text-sm mt-1">
							{chunk.chunking_type || "—"} • size {chunk.parameters.chunk_size},
							overlap {chunk.parameters.chunk_overlap}
						</div>
					</div>
					<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
						<div className="text-xs text-zinc-500">Embedding</div>
						<div className="text-sm mt-1">
							model id: {emb.embedding_model || "—"}
							{", dim "}
							{emb.embedding_length || "—"}
						</div>
					</div>
				</div>
			</SectionCard>

			{/* Evaluation */}
			<SectionCard title="Evaluation" icon={<span>📊</span>}>
				<div className="grid md:grid-cols-4 gap-4">
					{(
						[
							["Agent", metrics.agent],
							["Retrieval", metrics.retrieval],
							["Generation", metrics.generation],
							["Aggregate", metrics.aggregate],
						] as const
					).map(([label, arr]) => (
						<div
							key={label}
							className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
						>
							<div className="text-xs text-zinc-500">{label}</div>
							<div className="text-sm mt-1 break-words">
								{(arr as string[]).join(", ") || "—"}
							</div>
						</div>
					))}
				</div>

				<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mt-4">
					<div className="text-xs text-zinc-500">
						Evaluator Model (LLM-as-a-judge)
					</div>
					<div className="text-sm mt-1">
						{config.evaluation.judge_llm?.model || "—"}
					</div>
				</div>
			</SectionCard>

			{/* Agents snapshot */}
			<SectionCard title="Agents (snapshot)" icon={<span>🧠</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					{config.agents.map((a) => (
						<div
							key={a.id}
							className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
						>
							<div className="font-medium">
								{a.name} <span className="text-xs text-zinc-500">({a.id})</span>
							</div>
							<div className="text-xs text-zinc-500 mt-1">
								{a.agent_type} • {a.retriever.retriever_type || "—"} (k=
								{a.retriever.top_k}){" • "}
								model={a.llm?.model || "—"}
							</div>
						</div>
					))}
					{config.agents.length === 0 && (
						<div className="text-sm text-zinc-500">No agents captured.</div>
					)}
				</div>
			</SectionCard>
		</div>
	);
}
