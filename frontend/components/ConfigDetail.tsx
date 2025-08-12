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

	return (
		<div className="space-y-6">
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

			<SectionCard title="Overview" icon={<span>🧪</span>}>
				<div className="grid md:grid-cols-3 gap-4">
					<div>
						<div className="text-xs text-zinc-500">Experiment Name</div>
						<div className="font-medium">{config.name || "—"}</div>
					</div>
					<div>
						<div className="text-xs text-zinc-500">Output Dir</div>
						<div className="font-medium">
							{config.evaluation.output_dir || "results"}
						</div>
					</div>
					<div>
						<div className="text-xs text-zinc-500">Agents Included</div>
						<div className="font-medium">
							{(config.evaluation.run.include_agents?.length
								? config.evaluation.run.include_agents
								: config.agents.map((a) => a.id)
							).join(", ") || "—"}
						</div>
					</div>
				</div>
			</SectionCard>

			<SectionCard title="Datasets" icon={<span>🗃️</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					{(["ingestion_corpus", "test_set"] as const).map((k) => (
						<div
							key={k}
							className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
						>
							<div className="text-xs text-zinc-500">
								{k === "ingestion_corpus" ? "Ingestion Corpus" : "Test Set"}
							</div>
							<div className="text-sm mt-1 break-all">
								{config.data_ingestion[k].data_path || "—"}{" "}
								{config.data_ingestion[k].document_type
									? `(${config.data_ingestion[k].document_type})`
									: ""}
							</div>
						</div>
					))}
				</div>
			</SectionCard>

			<SectionCard title="Chunking & Embedding" icon={<span>🧩</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
						<div className="text-xs text-zinc-500">Chunking</div>
						<div className="text-sm mt-1">
							{config.chunking.chunking_type || "—"} • size{" "}
							{config.chunking.parameters.chunk_size}, overlap{" "}
							{config.chunking.parameters.chunk_overlap}
						</div>
					</div>
					<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
						<div className="text-xs text-zinc-500">Embedding</div>
						<div className="text-sm mt-1">
							{config.qdrant_db.parameters.embedding.embedding_type || "—"}{" "}
							{config.qdrant_db.parameters.embedding.embedding_model
								? `(${config.qdrant_db.parameters.embedding.embedding_model})`
								: ""}
							, dim {config.qdrant_db.parameters.embedding.embedding_length} •{" "}
							{config.qdrant_db.parameters.embedding.distance_metric || "—"}
						</div>
					</div>
				</div>
			</SectionCard>

			<SectionCard title="Evaluation Metrics" icon={<span>📊</span>}>
				<div className="grid md:grid-cols-4 gap-4">
					{[
						["Agent", metrics.agent],
						["Retrieval", metrics.retrieval],
						["Generation", metrics.generation],
						["Aggregate", metrics.aggregate],
					].map(([label, arr]) => (
						<div
							key={label as string}
							className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
						>
							<div className="text-xs text-zinc-500">{label}</div>
							<div className="text-sm mt-1 break-words">
								{(arr as string[]).join(", ") || "—"}
							</div>
						</div>
					))}
				</div>
			</SectionCard>

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
								{a.agent_type} • {a.retriever.retriever_type} (k=
								{a.retriever.top_k}) • {a.llm.llm_type}/{a.llm.model} • T=
								{a.llm.temperature}
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
