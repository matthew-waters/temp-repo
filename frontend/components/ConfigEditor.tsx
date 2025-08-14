"use client";

import React, { useMemo, useState } from "react";
import SectionCard from "./SectionCard";
import type {
	Agent,
	ExperimentConfig,
	SavedConfig,
	Option,
	MetricGroups,
} from "../lib/types";
import { emptyConfig } from "../lib/defaults";
import { Save, Play } from "lucide-react";
import AgentsConfigurator from "./AgentsConfigurator";
import { runExperiment } from "../lib/api";

/** Checkbox list for metrics WITH descriptions */
const MetricCheckboxes: React.FC<{
	options: { id: string; label: string; description?: string }[];
	value: string[];
	onChange: (next: string[]) => void;
}> = ({ options, value, onChange }) => {
	const toggle = (id: string) => {
		const set = new Set(value);
		set.has(id) ? set.delete(id) : set.add(id);
		onChange(Array.from(set));
	};
	const allIds = options.map((o) => o.id);

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => onChange(allIds)}
					className="text-xs px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					disabled={!options.length}
				>
					Select all
				</button>
				<button
					type="button"
					onClick={() => onChange([])}
					className="text-xs px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					disabled={!value.length}
				>
					Clear
				</button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto pr-1">
				{options.map((opt) => {
					const checked = value.includes(opt.id);
					return (
						<div
							key={opt.id}
							className={`rounded-lg border p-3 ${
								checked
									? "border-zinc-400 bg-zinc-50 dark:bg-zinc-900"
									: "border-zinc-200 dark:border-zinc-800"
							}`}
							title={opt.description || ""}
						>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={checked}
									onChange={() => toggle(opt.id)}
								/>
								<span className="truncate">{opt.label}</span>
								{opt.description && (
									<span className="ml-auto text-xs text-zinc-500">ℹ️</span>
								)}
							</label>
							{opt.description && (
								<div className="mt-2 text-xs leading-snug text-zinc-500 line-clamp-3">
									{opt.description}
								</div>
							)}
						</div>
					);
				})}
				{!options.length && (
					<div className="text-xs text-zinc-500">No metrics available</div>
				)}
			</div>
		</div>
	);
};

type Props = {
	datasetOptions: Option[];

	agentTypes: Option[];
	retrieverTypes: Option[];
	chunkingStrategies: Option[];
	embeddingModels: Option[];
	evaluationMetricGroups: MetricGroups;
	llmModels: Option[]; // provider model-id list

	onCancel: () => void;
	onSave: (saved: SavedConfig) => void;
	saveConfig: (cfg: ExperimentConfig) => SavedConfig;
};

export default function ConfigEditor({
	datasetOptions,
	agentTypes,
	retrieverTypes,
	chunkingStrategies,
	embeddingModels,
	evaluationMetricGroups,
	llmModels,
	onCancel,
	onSave,
	saveConfig,
}: Props) {
	const [cfg, setCfg] = useState<ExperimentConfig>(() => emptyConfig());
	const [isRunning, setIsRunning] = useState(false);

	const setAgents = (next: Agent[]) =>
		setCfg((prev) => ({ ...prev, agents: next }));

	const update = (path: (string | number)[], value: any) => {
		setCfg((prev) => {
			const next = JSON.parse(JSON.stringify(prev)) as ExperimentConfig;
			let ref: any = next;
			for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
			ref[path[path.length - 1]] = value;
			return next;
		});
	};

	const onSelectDatasetId = (id: string) => {
		update(["data_ingestion", "dataset_id"], id);
	};

	const onSelectEmbeddingModel = (id: string) => {
		update(["qdrant_db", "parameters", "embedding", "embedding_model"], id);
	};

	// ---------- Validation ----------
	type Validation = { ok: boolean; errors: string[] };

	const validate = (c: ExperimentConfig): Validation => {
		const errs: string[] = [];

		// Basic
		if (!c.name?.trim()) errs.push("Experiment name is required.");
		if (!c.data_ingestion?.dataset_id) errs.push("Select a dataset.");

		// Embedding
		if (!c.qdrant_db.parameters.embedding.embedding_model)
			errs.push("Select an embedding model.");

		// Chunking
		if (!c.chunking.chunking_type) errs.push("Select a chunking strategy.");

		// Agents
		if (!c.agents?.length) errs.push("Add at least one agent.");
		(c.agents || []).forEach((a, idx) => {
			if (!a.retriever.retriever_type)
				errs.push(`Agent ${idx + 1}: select a retriever type.`);
			if (!(typeof a.retriever.top_k === "number") || a.retriever.top_k <= 0)
				errs.push(`Agent ${idx + 1}: set Top K (> 0).`);
			if (!a.llm?.model) errs.push(`Agent ${idx + 1}: select an LLM model.`);
		});

		// Metrics
		const totalMetrics =
			(c.evaluation.metrics.agent?.length || 0) +
			(c.evaluation.metrics.retrieval?.length || 0) +
			(c.evaluation.metrics.generation?.length || 0) +
			(c.evaluation.metrics.aggregate?.length || 0);
		if (totalMetrics < 1) errs.push("Select at least one evaluation metric.");

		// Judge model
		if (!c.evaluation.judge_llm?.model)
			errs.push("Select an evaluator (judge) model.");

		return { ok: errs.length === 0, errors: errs };
	};

	const { ok: isValid, errors } = useMemo(() => validate(cfg), [cfg]);

	const doSave = () => {
		if (!isValid) return;
		const saved = saveConfig({ ...cfg });
		onSave(saved);
	};

	const doSaveAndRun = async () => {
		if (!isValid) return;
		const saved = saveConfig({ ...cfg });
		try {
			setIsRunning(true);
			await runExperiment({
				id: saved.id,
				name: saved.name,
				config: saved.config,
			});
			onSave(saved); // e.g., navigate to detail
		} catch (err: any) {
			console.error(err);
			alert(err?.message || "Failed to start run");
		} finally {
			setIsRunning(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Create New Experiment Config</h2>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onCancel}
						className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={doSave}
						disabled={!isValid || isRunning}
						className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow ${
							!isValid || isRunning
								? "bg-zinc-300 text-zinc-600 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
								: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
						}`}
						title={
							!isValid ? "Complete required fields to enable save" : "Save"
						}
					>
						<Save size={14} /> Save
					</button>

					<button
						type="button"
						onClick={doSaveAndRun}
						disabled={!isValid || isRunning}
						className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow ${
							!isValid || isRunning
								? "bg-emerald-400/60 text-white cursor-not-allowed"
								: "bg-emerald-600 text-white hover:opacity-90"
						}`}
						title={
							!isValid ? "Complete required fields to enable run" : "Save & Run"
						}
					>
						<Play size={14} />
						{isRunning ? "Running…" : "Save & Run"}
					</button>
				</div>
			</div>

			{/* Basics */}
			<SectionCard title="Basics" icon={<span>🧾</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Experiment Name</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.name}
							onChange={(e) => update(["name"], e.target.value)}
							placeholder="My Experiment"
						/>
					</div>
					<div className="space-y-2 md:col-span-2">
						<label className="text-sm font-medium">Description</label>
						<textarea
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							rows={3}
							value={cfg.description ?? ""}
							onChange={(e) => update(["description"], e.target.value)}
							placeholder="What are you testing or comparing?"
						/>
					</div>
				</div>
			</SectionCard>

			{/* Dataset */}
			<SectionCard title="Dataset" icon={<span>🗃️</span>}>
				<div className="space-y-2 md:w-[420px]">
					<label className="text-sm font-medium">Select dataset</label>
					<select
						className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
						value={cfg.data_ingestion.dataset_id ?? ""}
						onChange={(e) => onSelectDatasetId(e.target.value)}
					>
						<option value="" disabled>
							{datasetOptions.length
								? "Choose dataset…"
								: "No datasets available"}
						</option>
						{datasetOptions.map((opt) => (
							<option key={opt.id} value={opt.id}>
								{opt.label}
							</option>
						))}
					</select>
					<p className="text-xs text-zinc-500">
						Only the <code>dataset_id</code> is stored. The backend resolves
						paths when running.
					</p>
				</div>
			</SectionCard>

			{/* Embedding */}
			<SectionCard title="Embedding" icon={<span>🧠</span>}>
				<div className="grid md:grid-cols-3 gap-4">
					<div className="space-y-2 md:col-span-2">
						<label className="text-sm font-medium">Embedding Model</label>
						<select
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.qdrant_db.parameters.embedding.embedding_model || ""}
							onChange={(e) => onSelectEmbeddingModel(e.target.value)}
						>
							<option value="">
								{embeddingModels.length
									? "Select embedding…"
									: "No embeddings available"}
							</option>
							{embeddingModels.map((m) => (
								<option key={m.id} value={m.id}>
									{m.label}
								</option>
							))}
						</select>
						<div className="text-xs text-zinc-500">
							Stores the provider model ID (e.g.,{" "}
							<code>amazon.titan-embed-text-v1</code>).
						</div>
					</div>

					<div className="space-y-2 md:col-span-1">
						<label className="text-sm font-medium">Dimensionality</label>
						<input
							type="number"
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.qdrant_db.parameters.embedding.embedding_length}
							onChange={(e) =>
								update(
									["qdrant_db", "parameters", "embedding", "embedding_length"],
									Number(e.target.value)
								)
							}
							placeholder="optional"
						/>
					</div>
				</div>
			</SectionCard>

			{/* Chunking */}
			<SectionCard title="Chunking Parameters" icon={<span>🧩</span>}>
				<div className="grid md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Chunking Type</label>
						<select
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.chunking.chunking_type}
							onChange={(e) =>
								update(["chunking", "chunking_type"], e.target.value)
							}
						>
							<option value="">
								{chunkingStrategies.length
									? "Select chunker…"
									: "No chunkers available"}
							</option>
							{chunkingStrategies.map((ct) => (
								<option key={ct.id} value={ct.id}>
									{ct.label}
								</option>
							))}
						</select>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Chunk Size</label>
						<input
							type="number"
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.chunking.parameters.chunk_size}
							onChange={(e) =>
								update(
									["chunking", "parameters", "chunk_size"],
									Number(e.target.value)
								)
							}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Chunk Overlap</label>
						<input
							type="number"
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.chunking.parameters.chunk_overlap}
							onChange={(e) =>
								update(
									["chunking", "parameters", "chunk_overlap"],
									Number(e.target.value)
								)
							}
						/>
					</div>
				</div>
			</SectionCard>

			{/* Agents */}
			<AgentsConfigurator
				agents={cfg.agents}
				setAgents={setAgents}
				agentTypes={agentTypes}
				retrieverTypes={retrieverTypes}
				llmModels={llmModels}
			/>

			{/* Evaluation — metrics + evaluator model */}
			<SectionCard title="Evaluation" icon={<span>📊</span>}>
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<div className="text-sm font-medium mb-2">Retrieval Metrics</div>
						<MetricCheckboxes
							value={cfg.evaluation.metrics.retrieval}
							options={evaluationMetricGroups.retrieval}
							onChange={(next) =>
								update(["evaluation", "metrics", "retrieval"], next)
							}
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">Agent Metrics</div>
						<MetricCheckboxes
							value={cfg.evaluation.metrics.agent}
							options={evaluationMetricGroups.agent}
							onChange={(next) =>
								update(["evaluation", "metrics", "agent"], next)
							}
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">Generation Metrics</div>
						<MetricCheckboxes
							value={cfg.evaluation.metrics.generation}
							options={evaluationMetricGroups.generation}
							onChange={(next) =>
								update(["evaluation", "metrics", "generation"], next)
							}
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">Aggregate Metrics</div>
						<MetricCheckboxes
							value={cfg.evaluation.metrics.aggregate}
							options={evaluationMetricGroups.aggregate}
							onChange={(next) =>
								update(["evaluation", "metrics", "aggregate"], next)
							}
						/>
					</div>
				</div>

				{/* Evaluator Model (LLM-as-a-judge) */}
				<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mt-6">
					<div className="text-sm font-medium mb-2">Evaluator Model</div>
					<p className="text-xs text-zinc-500 mb-3">
						Some metrics use an LLM as a judge (e.g., grading answers or
						checking factuality). Select the model to be used for those
						evaluations. If none of your chosen metrics use a model, you can
						leave this blank.
					</p>
					<div className="md:w-[420px]">
						<select
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.evaluation.judge_llm.model || ""}
							onChange={(e) =>
								update(["evaluation", "judge_llm", "model"], e.target.value)
							}
						>
							<option value="">
								{llmModels.length
									? "Select evaluator model…"
									: "No models available"}
							</option>
							{llmModels.map((m) => (
								<option key={m.id} value={m.id}>
									{m.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</SectionCard>

			{/* Validation checklist */}
			{!isValid && (
				<SectionCard title="Requirements" icon={<span>✅</span>}>
					<ul className="list-disc pl-5 space-y-1 text-sm">
						{errors.map((e, i) => (
							<li key={i} className="text-red-600 dark:text-red-400">
								{e}
							</li>
						))}
					</ul>
				</SectionCard>
			)}
		</div>
	);
}
