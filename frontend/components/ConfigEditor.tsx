"use client";
import React, { useMemo, useState } from "react";
import SectionCard from "./SectionCard";
import type {
	Agent,
	DatasetInfo,
	ExperimentConfig,
	SavedConfig,
	ChunkingType,
	EmbeddingModelInfo,
	DistanceMetric,
} from "../lib/types";
import { emptyConfig } from "../lib/defaults";
import yaml from "js-yaml";
import { FileJson, Save } from "lucide-react";

type Props = {
	agents: Agent[];
	datasets: DatasetInfo[];
	chunkingTypes: ChunkingType[];
	embeddingModels: EmbeddingModelInfo[];
	distanceMetrics: DistanceMetric[];
	onCancel: () => void;
	onSave: (saved: SavedConfig) => void;
	saveConfig: (cfg: ExperimentConfig) => SavedConfig;
};

export default function ConfigEditor({
	agents,
	datasets,
	chunkingTypes,
	embeddingModels,
	distanceMetrics,
	onCancel,
	onSave,
	saveConfig,
}: Props) {
	const [cfg, setCfg] = useState<ExperimentConfig>(() => {
		const c = emptyConfig();
		c.agents = agents; // snapshot of available agents
		return c;
	});

	const update = (path: (string | number)[], value: any) => {
		setCfg((prev) => {
			const next = JSON.parse(JSON.stringify(prev)) as ExperimentConfig;
			let ref: any = next;
			for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
			ref[path[path.length - 1]] = value;
			return next;
		});
	};

	const allAgentIds = useMemo(() => agents.map((a) => a.id), [agents]);
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

	const onSelectChunking = (type: string) => {
		update(["chunking", "chunking_type"], type);
	};

	const onSelectEmbeddingModel = (id: string) => {
		const m = embeddingModels.find((x) => x.id === id);
		if (!m) return;
		update(
			["qdrant_db", "parameters", "embedding", "embedding_type"],
			m.embedding_type
		);
		update(
			["qdrant_db", "parameters", "embedding", "embedding_model"],
			m.model
		);
		update(
			["qdrant_db", "parameters", "embedding", "embedding_length"],
			m.embedding_length
		);
	};

	const onSelectDistance = (dm: string) => {
		update(["qdrant_db", "parameters", "embedding", "distance_metric"], dm);
	};

	const downloadYAML = () => {
		const out = { experiment: cfg };
		const y = yaml.dump(out, { noRefs: true, lineWidth: 120 });
		const blob = new Blob([y], { type: "text/yaml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${cfg.name || "experiment"}.yaml`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			{/* Header actions */}
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
						onClick={() => onSave(saveConfig(cfg))}
						className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-2 text-sm shadow hover:opacity-90"
					>
						<Save size={14} /> Save Config
					</button>
				</div>
			</div>

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

					<div className="space-y-2">
						<label className="text-sm font-medium">Chunking Type</label>
						<select
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.chunking.chunking_type}
							onChange={(e) => onSelectChunking(e.target.value)}
						>
							<option value="">
								{chunkingTypes.length
									? "Select chunker…"
									: "No chunkers available"}
							</option>
							{chunkingTypes.map((ct) => (
								<option key={ct} value={ct}>
									{ct}
								</option>
							))}
						</select>
					</div>
				</div>
			</SectionCard>

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

			<SectionCard title="Embedding" icon={<span>🧠</span>}>
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Embedding Model</label>
						<select
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={
								// try to find a matching catalog item; otherwise fallback to empty
								embeddingModels.find(
									(m) =>
										m.embedding_type ===
											cfg.qdrant_db.parameters.embedding.embedding_type &&
										m.model ===
											cfg.qdrant_db.parameters.embedding.embedding_model
								)?.id ?? ""
							}
							onChange={(e) => onSelectEmbeddingModel(e.target.value)}
						>
							<option value="">
								{embeddingModels.length
									? "Select embedding…"
									: "No embeddings available"}
							</option>
							{embeddingModels.map((m) => (
								<option key={m.id} value={m.id}>
									{m.name}
								</option>
							))}
						</select>
						<div className="text-xs text-zinc-500">
							Type: {cfg.qdrant_db.parameters.embedding.embedding_type || "—"} •
							Model: {cfg.qdrant_db.parameters.embedding.embedding_model || "—"}
						</div>
					</div>

					<div className="space-y-2">
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
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Distance Metric</label>
						<select
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.qdrant_db.parameters.embedding.distance_metric}
							onChange={(e) => onSelectDistance(e.target.value)}
						>
							<option value="">
								{distanceMetrics.length
									? "Select distance…"
									: "No metrics available"}
							</option>
							{distanceMetrics.map((dm) => (
								<option key={dm} value={dm}>
									{dm}
								</option>
							))}
						</select>
					</div>
				</div>
			</SectionCard>

			<SectionCard title="Chunking Parameters" icon={<span>🧩</span>}>
				<div className="grid md:grid-cols-2 gap-4">
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

			<SectionCard title="Evaluation" icon={<span>📊</span>}>
				<div className="grid md:grid-cols-3 gap-4">
					<div className="space-y-2 md:col-span-1">
						<label className="text-sm font-medium">Retrieval Metrics</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.evaluation.metrics.retrieval.join(", ")}
							onChange={(e) =>
								update(
									["evaluation", "metrics", "retrieval"],
									parseCSV(e.target.value)
								)
							}
						/>
					</div>
					<div className="space-y-2 md:col-span-1">
						<label className="text-sm font-medium">Generation Metrics</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.evaluation.metrics.generation.join(", ")}
							onChange={(e) =>
								update(
									["evaluation", "metrics", "generation"],
									parseCSV(e.target.value)
								)
							}
						/>
					</div>
					<div className="space-y-2 md:col-span-1">
						<label className="text-sm font-medium">Aggregate Metrics</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.evaluation.metrics.aggregate.join(", ")}
							onChange={(e) =>
								update(
									["evaluation", "metrics", "aggregate"],
									parseCSV(e.target.value)
								)
							}
						/>
					</div>
					<div className="space-y-2 md:col-span-3">
						<label className="text-sm font-medium">Agent Metrics</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.evaluation.metrics.agent.join(", ")}
							onChange={(e) =>
								update(
									["evaluation", "metrics", "agent"],
									parseCSV(e.target.value)
								)
							}
						/>
					</div>
				</div>

				<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mt-4">
					<div className="text-sm font-medium mb-2">
						Run Plan (choose agents)
					</div>
					<div className="grid md:grid-cols-3 gap-2">
						{allAgentIds.map((id) => {
							const checked = (
								cfg.evaluation.run.include_agents || []
							).includes(id);
							return (
								<label
									key={id}
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
											const current = cfg.evaluation.run.include_agents || [];
											const exists = current.includes(id);
											const next = exists
												? current.filter((x) => x !== id)
												: [...current, id];
											update(["evaluation", "run", "include_agents"], next);
										}}
									/>
									<span className="truncate">{id}</span>
								</label>
							);
						})}
					</div>
				</div>
			</SectionCard>
		</div>
	);
}
