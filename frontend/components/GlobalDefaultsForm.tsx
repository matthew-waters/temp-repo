"use client";
import React from "react";
import SectionCard from "./SectionCard";
import type { ExperimentConfig, DatasetInfo } from "../lib/types";

type Props = {
	cfg: ExperimentConfig;
	updateCfg: (path: (string | number)[], value: any) => void;
	datasets: DatasetInfo[];
};

export default function GlobalDefaultsForm({
	cfg,
	updateCfg,
	datasets,
}: Props) {
	const onSelectDataset = (
		key: "ingestion_corpus" | "test_set",
		id: string
	) => {
		const ds = datasets.find((d) => d.id === id);
		if (!ds) return;
		updateCfg(["data_ingestion", key, "dataset_id"], id);
		updateCfg(["data_ingestion", key, "data_path"], ds.data_path);
		updateCfg(["data_ingestion", key, "document_type"], ds.document_type);
	};

	return (
		<SectionCard title="Global Defaults" icon={<span className="i">⚙️</span>}>
			<div className="grid gap-6">
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Experiment Name</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
							placeholder="My Experiment"
							value={cfg.name}
							onChange={(e) => updateCfg(["name"], e.target.value)}
						/>
					</div>
				</div>

				{/* Data ingestion via selectable datasets */}
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">
							Ingestion Corpus – Dataset
						</label>
						<select
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.data_ingestion.ingestion_corpus.dataset_id ?? ""}
							onChange={(e) =>
								onSelectDataset("ingestion_corpus", e.target.value)
							}
						>
							<option value="" disabled>
								{datasets.length ? "Select dataset…" : "No datasets available"}
							</option>
							{datasets.map((d) => (
								<option key={d.id} value={d.id}>
									{d.name}
								</option>
							))}
						</select>
						<div className="text-xs text-zinc-500">
							{cfg.data_ingestion.ingestion_corpus.data_path || "—"}
							{cfg.data_ingestion.ingestion_corpus.document_type
								? ` (${cfg.data_ingestion.ingestion_corpus.document_type})`
								: ""}
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Test Set – Dataset</label>
						<select
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.data_ingestion.test_set.dataset_id ?? ""}
							onChange={(e) => onSelectDataset("test_set", e.target.value)}
						>
							<option value="" disabled>
								{datasets.length ? "Select dataset…" : "No datasets available"}
							</option>
							{datasets.map((d) => (
								<option key={d.id} value={d.id}>
									{d.name}
								</option>
							))}
						</select>
						<div className="text-xs text-zinc-500">
							{cfg.data_ingestion.test_set.data_path || "—"}
							{cfg.data_ingestion.test_set.document_type
								? ` (${cfg.data_ingestion.test_set.document_type})`
								: ""}
						</div>
					</div>
				</div>

				{/* Chunking */}
				<div className="grid md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Chunking Type</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.chunking.chunking_type}
							onChange={(e) =>
								updateCfg(["chunking", "chunking_type"], e.target.value)
							}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Chunk Size</label>
						<input
							type="number"
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.chunking.parameters.chunk_size}
							onChange={(e) =>
								updateCfg(
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
								updateCfg(
									["chunking", "parameters", "chunk_overlap"],
									Number(e.target.value)
								)
							}
						/>
					</div>
				</div>

				{/* Qdrant */}
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Qdrant – Local Path</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.qdrant_db.connection.local_path}
							onChange={(e) =>
								updateCfg(
									["qdrant_db", "connection", "local_path"],
									e.target.value
								)
							}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Embedding Model</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.qdrant_db.parameters.embedding.embedding_model}
							onChange={(e) =>
								updateCfg(
									["qdrant_db", "parameters", "embedding", "embedding_model"],
									e.target.value
								)
							}
						/>
						<div className="grid grid-cols-3 gap-2">
							<input
								placeholder="Type"
								className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
								value={cfg.qdrant_db.parameters.embedding.embedding_type}
								onChange={(e) =>
									updateCfg(
										["qdrant_db", "parameters", "embedding", "embedding_type"],
										e.target.value
									)
								}
							/>
							<input
								type="number"
								placeholder="Length"
								className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
								value={cfg.qdrant_db.parameters.embedding.embedding_length}
								onChange={(e) =>
									updateCfg(
										[
											"qdrant_db",
											"parameters",
											"embedding",
											"embedding_length",
										],
										Number(e.target.value)
									)
								}
							/>
							<input
								placeholder="Distance"
								className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
								value={cfg.qdrant_db.parameters.embedding.distance_metric}
								onChange={(e) =>
									updateCfg(
										["qdrant_db", "parameters", "embedding", "distance_metric"],
										e.target.value
									)
								}
							/>
						</div>
					</div>
				</div>
			</div>
		</SectionCard>
	);
}
