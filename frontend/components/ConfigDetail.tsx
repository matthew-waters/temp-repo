"use client";

import React from "react";
import SectionCard from "./SectionCard";
import type { SavedConfig, Option, MetricGroups } from "../lib/types";

type Props = {
	item: SavedConfig;
	onBack: () => void;

	// Lookup options from catalog so we can render labels (not ids)
	datasetOptions: Option[];
	agentTypes: Option[];
	retrieverTypes: Option[];
	llmModels: Option[]; // provider model id -> label
	embeddingModels: Option[]; // provider model id -> label
	chunkingStrategies: Option[];
	evaluationMetricGroups: MetricGroups; // includes descriptions
};

const toLabelMap = (opts: Option[]) =>
	Object.fromEntries(opts.map((o) => [o.id, o.label]));

export default function ConfigDetail({
	item,
	onBack,
	datasetOptions,
	agentTypes,
	retrieverTypes,
	llmModels,
	embeddingModels,
	chunkingStrategies,
	evaluationMetricGroups,
}: Props) {
	const { config } = item;

	// Build lookup maps
	const datasetLabel = toLabelMap(datasetOptions);
	const agentTypeLabel = toLabelMap(agentTypes);
	const retrieverTypeLabel = toLabelMap(retrieverTypes);
	const llmModelLabel = toLabelMap(llmModels);
	const embeddingModelLabel = toLabelMap(embeddingModels);
	const chunkingLabel = toLabelMap(chunkingStrategies);

	// Metric maps: id -> {label, description}
	const metricMap = {
		retrieval: Object.fromEntries(
			evaluationMetricGroups.retrieval.map((m) => [
				m.id,
				{ label: m.label, description: m.description },
			])
		),
		agent: Object.fromEntries(
			evaluationMetricGroups.agent.map((m) => [
				m.id,
				{ label: m.label, description: m.description },
			])
		),
		generation: Object.fromEntries(
			evaluationMetricGroups.generation.map((m) => [
				m.id,
				{ label: m.label, description: m.description },
			])
		),
		aggregate: Object.fromEntries(
			evaluationMetricGroups.aggregate.map((m) => [
				m.id,
				{ label: m.label, description: m.description },
			])
		),
	} as const;

	const labelOf = (
		id: string | undefined | null,
		map: Record<string, string>
	) => (id && map[id]) || id || "—";

	const datasetId =
		config.data_ingestion.ingestion_corpus.dataset_id ||
		config.data_ingestion.test_set.dataset_id ||
		"";

	const chunk = config.chunking;
	const emb = config.qdrant_db.parameters.embedding;

	const MetricList: React.FC<{
		ids: string[];
		category: keyof typeof metricMap;
	}> = ({ ids, category }) => {
		if (!ids?.length) return <div className="text-sm text-zinc-500">—</div>;
		const mm = metricMap[category];
		return (
			<div className="space-y-2">
				{ids.map((id) => {
					const info = mm[id];
					const label = info?.label || id;
					const desc = info?.description;
					return (
						<div
							key={id}
							className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
							title={desc || ""}
						>
							<div className="text-sm font-medium">{label}</div>
							{desc && <div className="text-xs text-zinc-500 mt-1">{desc}</div>}
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">
					Config: {config.name || "(unnamed experiment)"}
				</h2>
				<button
					onClick={onBack}
					className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					type="button"
				>
					← Back to list
				</button>
			</div>

			{/* Overview (labels only, no agent list here) */}
			<SectionCard title="Overview" icon={<span>🧪</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					<div>
						<div className="text-xs text-zinc-500">Experiment Name</div>
						<div className="font-medium">{config.name || "—"}</div>
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
					<div className="font-medium mt-1">
						{labelOf(datasetId, datasetLabel)}
					</div>
					<div className="text-xs text-zinc-500 mt-2">
						Paths are resolved on the backend during run time.
					</div>
				</div>
			</SectionCard>

			{/* Chunking (separate card) */}
			<SectionCard title="Chunking" icon={<span>🧩</span>}>
				<div className="grid md:grid-cols-3 gap-4">
					<div>
						<div className="text-xs text-zinc-500">Chunking Strategy</div>
						<div className="text-sm font-medium mt-1">
							{labelOf(chunk.chunking_type, chunkingLabel)}
						</div>
					</div>
					<div>
						<div className="text-xs text-zinc-500">Chunk Size</div>
						<div className="text-sm font-medium mt-1">
							{chunk.parameters.chunk_size}
						</div>
					</div>
					<div>
						<div className="text-xs text-zinc-500">Chunk Overlap</div>
						<div className="text-sm font-medium mt-1">
							{chunk.parameters.chunk_overlap}
						</div>
					</div>
				</div>
			</SectionCard>

			{/* Embedding (separate card) */}
			<SectionCard title="Embedding" icon={<span>🧠</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					<div>
						<div className="text-xs text-zinc-500">Embedding Model</div>
						<div className="text-sm font-medium mt-1">
							{labelOf(emb.embedding_model, embeddingModelLabel)}
						</div>
					</div>
					<div>
						<div className="text-xs text-zinc-500">Dimensionality</div>
						<div className="text-sm font-medium mt-1">
							{emb.embedding_length || "—"}
						</div>
					</div>
				</div>
			</SectionCard>

			{/* Evaluation (labels + descriptions) */}
			<SectionCard title="Evaluation" icon={<span>📊</span>}>
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<div className="text-sm font-medium mb-2">Retrieval Metrics</div>
						<MetricList
							ids={config.evaluation.metrics.retrieval}
							category="retrieval"
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">Agent Metrics</div>
						<MetricList
							ids={config.evaluation.metrics.agent}
							category="agent"
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">Generation Metrics</div>
						<MetricList
							ids={config.evaluation.metrics.generation}
							category="generation"
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">Aggregate Metrics</div>
						<MetricList
							ids={config.evaluation.metrics.aggregate}
							category="aggregate"
						/>
					</div>
				</div>

				{/* Evaluator model (label) */}
				<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mt-6">
					<div className="text-xs text-zinc-500">
						Evaluator Model (LLM-as-a-judge)
					</div>
					<div className="text-sm mt-1">
						{labelOf(config.evaluation.judge_llm?.model, llmModelLabel)}
					</div>
				</div>
			</SectionCard>

			{/* Agents — each with its own options */}
			<SectionCard title="Agents" icon={<span>🧠</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					{config.agents.length === 0 && (
						<div className="text-sm text-zinc-500">No agents selected.</div>
					)}
					{config.agents.map((a) => (
						<div
							key={a.id}
							className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
						>
							<div className="font-medium">
								{labelOf(a.agent_type, agentTypeLabel)}{" "}
								<span className="text-xs text-zinc-500">({a.id})</span>
							</div>
							<div className="mt-2 grid grid-cols-1 gap-2 text-sm">
								<div>
									<div className="text-xs text-zinc-500">Retriever</div>
									<div className="font-medium mt-0.5">
										{labelOf(a.retriever.retriever_type, retrieverTypeLabel)}{" "}
										<span className="text-xs text-zinc-500">
											(k={a.retriever.top_k})
										</span>
									</div>
								</div>
								<div>
									<div className="text-xs text-zinc-500">Model</div>
									<div className="font-medium mt-0.5">
										{labelOf(a.llm?.model, llmModelLabel)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</SectionCard>
		</div>
	);
}
