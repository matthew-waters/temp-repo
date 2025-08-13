"use client";
import React, { useState } from "react";
import SectionCard from "./SectionCard";
import type {
	Agent,
	DatasetInfo,
	ExperimentConfig,
	SavedConfig,
	Option,
} from "../lib/types";
import { emptyConfig } from "../lib/defaults";
import yaml from "js-yaml";
import { FileJson, Save } from "lucide-react";
import AgentsConfigurator from "./AgentsConfigurator";

type Props = {
	datasets: DatasetInfo[];
	// Catalog options from /catalog
	agentTypes: Option[];
	retrieverTypes: Option[];
	llmInterfaces: Option[];
	chunkingStrategies: Option[];
	embeddingModels: Option[];
	evaluationMetrics: Option[];
	onCancel: () => void;
	onSave: (saved: SavedConfig) => void;
	saveConfig: (cfg: ExperimentConfig) => SavedConfig;
};

export default function ConfigEditor({
	datasets,
	agentTypes,
	retrieverTypes,
	llmInterfaces,
	chunkingStrategies,
	embeddingModels,
	evaluationMetrics,
	onCancel,
	onSave,
	saveConfig,
}: Props) {
	const [cfg, setCfg] = useState<ExperimentConfig>(() => emptyConfig());

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

	const parseCSV = (s: string): string[] =>
		s
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);

	const onSelectDataset = (
		key: "ingestion_corpus" | "test_set",
		id: string
	) => {
		const ds = datasets.find((d) => d.id === id);
		if (!ds) return;
		update(["data_ingestion", key, "dataset_id"], id);
		update(["data_ingestion", key, "data_path"], ds.data_path);
		update(["data_ingestion", key, "document_type"], ds.document_type);
	};

	const onSelectEmbeddingModel = (id: string) => {
		// Registry only gives id + label. We'll store id as embedding_model; leave type/length for backend to resolve.
		update(["qdrant_db", "parameters", "embedding", "embedding_model"], id);
		// Optional heuristics if you want:
		// update(["qdrant_db","parameters","embedding","embedding_type"], id.split(":")[0] ?? "");
	};

	const downloadYAML = () => {
		const include = cfg.evaluation.run.include_agents?.length
			? cfg.evaluation.run.include_agents
			: cfg.agents.map((a) => a.id);
		const out = {
			experiment: {
				...cfg,
				evaluation: { ...cfg.evaluation, run: { include_agents: include } },
			},
		};
		const y = yaml.dump(out, { noRefs: true, lineWidth: 120 });
		const blob = new Blob([y], { type: "text/yaml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${cfg.name || "experiment"}.yaml`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const addMetric = (
		field: "agent" | "retrieval" | "generation" | "aggregate",
		id: string
	) => {
		const arr = new Set([...(cfg.evaluation.metrics[field] ?? []), id]);
		update(["evaluation", "metrics", field], Array.from(arr));
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
						onClick={() => {
							const include = cfg.evaluation.run.include_agents?.length
								? cfg.evaluation.run.include_agents
								: cfg.agents.map((a) => a.id);
							const saved = saveConfig({
								...cfg,
								evaluation: {
									...cfg.evaluation,
									run: { include_agents: include },
								},
							});
							onSave(saved);
						}}
						className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-2 text-sm shadow hover:opacity-90"
					>
						<Save size={14} /> Save Config
					</button>
				</div>
			</div>

			{/* Basics */}
			<SectionCard
				title="Basics"
				icon={<span>🧾</span>}
				actions={
					<button
						onClick={downloadYAML}
						className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
						type="button"
					>
						<FileJson size={14} /> Download YAML
					</button>
				}
			>
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

			{/* Datasets */}
			<SectionCard title="Datasets" icon={<span>🗃️</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					{(["ingestion_corpus", "test_set"] as const).map((k) => (
						<div key={k} className="space-y-2">
							<label className="text-sm font-medium">
								{k === "ingestion_corpus" ? "Ingestion Corpus" : "Test Set"}
							</label>
							<select
								className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
								value={cfg.data_ingestion[k].dataset_id ?? ""}
								onChange={(e) => onSelectDataset(k, e.target.value)}
							>
								<option value="" disabled>
									{datasets.length
										? "Select dataset…"
										: "No datasets available"}
								</option>
								{datasets.map((d) => (
									<option key={d.id} value={d.id}>
										{d.name}
									</option>
								))}
							</select>
							<div className="text-xs text-zinc-500">
								{cfg.data_ingestion[k].data_path || "—"}
								{cfg.data_ingestion[k].document_type
									? ` (${cfg.data_ingestion[k].document_type})`
									: ""}
							</div>
						</div>
					))}
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
							Stored as model id. (Type/length resolved backend-side)
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

					<div className="space-y-2 md:col-span-1">
						<label className="text-sm font-medium">Distance Metric</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.qdrant_db.parameters.distance_metric}
							onChange={(e) =>
								update(
									["qdrant_db", "parameters", "distance_metric"],
									e.target.value
								)
							}
							placeholder="e.g., cosine / dot / euclidean"
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
				llmInterfaces={llmInterfaces}
			/>

			{/* Evaluation */}
			<SectionCard title="Evaluation" icon={<span>📊</span>}>
				<div className="grid md:grid-cols-3 gap-4">
					{(["retrieval", "generation", "aggregate", "agent"] as const).map(
						(field) => (
							<div key={field} className="space-y-2">
								<label className="text-sm font-medium">
									{field[0].toUpperCase() + field.slice(1)} Metrics
								</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={cfg.evaluation.metrics[field].join(", ")}
									onChange={(e) =>
										update(
											["evaluation", "metrics", field],
											parseCSV(e.target.value)
										)
									}
									placeholder="Comma-separated"
								/>
								{/* Suggestions from registry */}
								{evaluationMetrics.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{evaluationMetrics.slice(0, 12).map((m) => (
											<button
												key={`${field}-${m.id}`}
												type="button"
												onClick={() => addMetric(field, m.id)}
												className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
												title={m.label}
											>
												+ {m.id}
											</button>
										))}
									</div>
								)}
							</div>
						)
					)}
				</div>

				{/* Optional subset by ID */}
				{cfg.agents.length > 0 && (
					<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mt-4">
						<div className="text-sm font-medium mb-2">
							Run Plan (choose agents)
						</div>
						<div className="grid md:grid-cols-3 gap-2">
							{cfg.agents.map((a) => {
								const list = cfg.evaluation.run.include_agents || [];
								const checked = list.includes(a.id);
								return (
									<label
										key={a.id}
										className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border ${
											checked
												? "border-zinc-400 bg-zinc-50 dark:bg-zinc-900"
												: "border-zinc-200 dark:border-zinc-800"
										}`}
									>
										<input
											type="checkbox"
											checked={checked}
											onChange={() => {
												const curr = cfg.evaluation.run.include_agents || [];
												const exists = curr.includes(a.id);
												const next = exists
													? curr.filter((x) => x !== a.id)
													: [...curr, a.id];
												update(["evaluation", "run", "include_agents"], next);
											}}
										/>
										<span className="truncate">{a.id}</span>
									</label>
								);
							})}
						</div>
						<div className="text-xs text-zinc-500 mt-2">
							Leave empty to run all agents.
						</div>
					</div>
				)}
			</SectionCard>
		</div>
	);
}
