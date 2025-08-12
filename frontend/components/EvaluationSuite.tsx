"use client";
import React from "react";
import SectionCard from "./SectionCard";
import type { ExperimentConfig } from "../lib/types";
import yaml from "js-yaml";
import { FileJson, Copy } from "lucide-react";

type Props = {
	cfg: ExperimentConfig;
	updateCfg: (path: (string | number)[], value: any) => void;
	allAgentIds: string[];
};

export default function EvaluationSuite({
	cfg,
	updateCfg,
	allAgentIds,
}: Props) {
	const included = cfg.evaluation.run.include_agents?.length
		? cfg.evaluation.run.include_agents
		: allAgentIds;

	const toggleIncludeAgent = (id: string) => {
		const current = cfg.evaluation.run.include_agents || [];
		const exists = current.includes(id);
		const next = exists ? current.filter((x) => x !== id) : [...current, id];
		updateCfg(["evaluation", "run", "include_agents"], next);
	};

	const selectAll = () =>
		updateCfg(["evaluation", "run", "include_agents"], [...allAgentIds]);
	const clear = () => updateCfg(["evaluation", "run", "include_agents"], []);

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

	const copyJSON = async () => {
		const out = { experiment: cfg };
		await navigator.clipboard.writeText(JSON.stringify(out, null, 2));
	};

	const parseCSV = (s: string): string[] =>
		s
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);

	return (
		<SectionCard
			title="Evaluation Suite"
			icon={<span>📊</span>}
			actions={
				<div className="flex gap-2">
					<button
						onClick={downloadYAML}
						className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						<FileJson size={14} /> Download YAML
					</button>
					<button
						onClick={copyJSON}
						className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-2 text-sm shadow hover:opacity-90"
					>
						<Copy size={14} /> Copy JSON
					</button>
				</div>
			}
		>
			<div className="grid gap-6">
				<div className="grid md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Output Dir</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.evaluation.output_dir}
							onChange={(e) =>
								updateCfg(["evaluation", "output_dir"], e.target.value)
							}
						/>
					</div>
					<div className="space-y-2 md:col-span-2">
						<label className="text-sm font-medium">
							Agent Metrics (comma-separated)
						</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.evaluation.metrics.agent.join(", ")}
							onChange={(e) =>
								updateCfg(
									["evaluation", "metrics", "agent"],
									parseCSV(e.target.value)
								)
							}
						/>
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-4">
					<div className="space-y-2 md:col-span-1">
						<label className="text-sm font-medium">Retrieval Metrics</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.evaluation.metrics.retrieval.join(", ")}
							onChange={(e) =>
								updateCfg(
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
								updateCfg(
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
								updateCfg(
									["evaluation", "metrics", "aggregate"],
									parseCSV(e.target.value)
								)
							}
						/>
					</div>
				</div>

				<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm font-medium">Run Plan</div>
							<div className="text-xs text-zinc-500">
								Choose which agents to include (empty = all).
							</div>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() =>
									updateCfg(
										["evaluation", "run", "include_agents"],
										[...allAgentIds]
									)
								}
								className="text-xs px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800"
							>
								Select all
							</button>
							<button
								onClick={() =>
									updateCfg(["evaluation", "run", "include_agents"], [])
								}
								className="text-xs px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800"
							>
								Clear
							</button>
						</div>
					</div>

					<div className="mt-3 grid md:grid-cols-3 gap-2">
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
										onChange={() => toggleIncludeAgent(id)}
									/>
									<span className="truncate">{id}</span>
								</label>
							);
						})}
					</div>

					<div className="mt-4 text-xs text-zinc-500">
						Will run on:{" "}
						<span className="font-medium text-zinc-700 dark:text-zinc-300">
							{included.join(", ")}
						</span>
					</div>
				</div>
			</div>
		</SectionCard>
	);
}
