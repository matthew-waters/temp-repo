// =============================
// File: frontend/src/lib/types.ts
// =============================
export type Retriever = {
	retriever_type: string;
	top_k: number;
};

export type LLMConfig = {
	llm_type: string;
	model: string;
	region: string;
	temperature: number;
};

export type Agent = {
	id: string;
	name: string;
	agent_type: string;
	retriever: Retriever;
	llm: LLMConfig;
	overrides: {
		chunking: any | null;
		qdrant_db: any | null;
	};
};

export type ExperimentConfig = {
	name: string;
	data_ingestion: {
		ingestion_corpus: { data_path: string; document_type: string };
		test_set: { data_path: string; document_type: string };
	};
	chunking: {
		chunking_type: string;
		parameters: { chunk_size: number; chunk_overlap: number };
	};
	qdrant_db: {
		connection: { local_path: string };
		parameters: {
			embedding: {
				embedding_type: string;
				embedding_model: string;
				embedding_length: number;
				distance_metric: string;
			};
		};
	};
	agents: Agent[];
	evaluation: {
		output_dir: string;
		metrics: {
			agent: string[];
			retrieval: string[];
			generation: string[];
			aggregate: string[];
		};
		llm_override: { enabled: boolean } & LLMConfig;
		run: { include_agents: string[] };
	};
};

// =============================
// File: frontend/src/lib/defaults.ts
// =============================
import type { Agent, ExperimentConfig } from "../lib/types";

export const makeDefaultAgent = (n: number): Agent => ({
	id: `agent-${n}`,
	name: `Agent ${n}`,
	agent_type: "",
	retriever: { retriever_type: "", top_k: 5 },
	llm: { llm_type: "", model: "", region: "", temperature: 0.0 },
	overrides: { chunking: null, qdrant_db: null },
});

export const defaultConfig: ExperimentConfig = {
	name: "",
	data_ingestion: {
		ingestion_corpus: { data_path: "", document_type: "json" },
		test_set: { data_path: "", document_type: "json" },
	},
	chunking: {
		chunking_type: "",
		parameters: { chunk_size: 1000, chunk_overlap: 200 },
	},
	qdrant_db: {
		connection: { local_path: "" },
		parameters: {
			embedding: {
				embedding_type: "",
				embedding_model: "",
				embedding_length: 0,
				distance_metric: "cosine",
			},
		},
	},
	agents: [makeDefaultAgent(1)],
	evaluation: {
		output_dir: "results",
		metrics: { agent: [], retrieval: [], generation: [], aggregate: [] },
		llm_override: {
			enabled: false,
			llm_type: "",
			model: "",
			region: "",
			temperature: 0.0,
		},
		run: { include_agents: [] },
	},
};

// =============================
// File: frontend/src/lib/update.ts
// =============================
export function updateAtPath<T extends object>(
	obj: T,
	path: (string | number)[],
	value: any
): T {
	const next: any = JSON.parse(JSON.stringify(obj));
	let ref: any = next;
	for (let i = 0; i < path.length - 1; i++) {
		ref = ref[path[i]];
	}
	ref[path[path.length - 1]] = value;
	return next as T;
}

// =============================
// File: frontend/src/components/SectionCard.tsx
// =============================
import React from "react";

type Props = {
	title: string;
	icon?: React.ReactNode;
	actions?: React.ReactNode;
	children: React.ReactNode;
};

export default function SectionCard({ title, icon, actions, children }: Props) {
	return (
		<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
			<div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center gap-2">
					{icon}
					<h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
						{title}
					</h3>
				</div>
				{actions}
			</div>
			<div className="p-4">{children}</div>
		</div>
	);
}

// =============================
// File: frontend/src/components/Sidebar.tsx
// =============================
("use client");
import React from "react";
import { FlaskConical, BarChart3, Settings, Rocket } from "lucide-react";

const navItemBase =
	"flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm transition-colors";

type SidebarProps = {
	active: "configs" | "results";
	onSelect: (key: "configs" | "results") => void;
};

export default function Sidebar({ active, onSelect }: SidebarProps) {
	return (
		<aside className="md:min-h-screen border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
			<div className="p-4">
				<div className="flex items-center gap-3 mb-4">
					<div className="h-9 w-9 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 grid place-items-center shadow">
						<Rocket size={18} />
					</div>
					<div>
						<div className="text-sm font-semibold leading-tight">Agent Lab</div>
						<div className="text-xs text-zinc-500">Experiments & Results</div>
					</div>
				</div>

				<nav className="space-y-1">
					<button
						onClick={() => onSelect("configs")}
						className={`${navItemBase} ${
							active === "configs"
								? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
								: "hover:bg-zinc-100 dark:hover:bg-zinc-800"
						}`}
					>
						<FlaskConical size={16} />
						<span>Experiment Configs</span>
					</button>

					<button
						onClick={() => onSelect("results")}
						className={`${navItemBase} ${
							active === "results"
								? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
								: "hover:bg-zinc-100 dark:hover:bg-zinc-800"
						}`}
					>
						<BarChart3 size={16} />
						<span>Results</span>
					</button>
				</nav>

				<div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4">
					<div className="flex items-center gap-2 text-xs text-zinc-500">
						<Settings size={14} />
						<span>Wiring to backend coming soon</span>
					</div>
				</div>
			</div>
		</aside>
	);
}

// =============================
// File: frontend/src/components/GlobalDefaultsForm.tsx
// =============================
("use client");
import React from "react";
import SectionCard from "./SectionCard";
import type { ExperimentConfig } from "../lib/types";

type Props = {
	cfg: ExperimentConfig;
	updateCfg: (path: (string | number)[], value: any) => void;
};

export default function GlobalDefaultsForm({ cfg, updateCfg }: Props) {
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

				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">
							Ingestion Corpus – Data Path
						</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400/40"
							value={cfg.data_ingestion.ingestion_corpus.data_path}
							onChange={(e) =>
								updateCfg(
									["data_ingestion", "ingestion_corpus", "data_path"],
									e.target.value
								)
							}
						/>
						<label className="text-sm font-medium">Document Type</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.data_ingestion.ingestion_corpus.document_type}
							onChange={(e) =>
								updateCfg(
									["data_ingestion", "ingestion_corpus", "document_type"],
									e.target.value
								)
							}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Test Set – Data Path</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.data_ingestion.test_set.data_path}
							onChange={(e) =>
								updateCfg(
									["data_ingestion", "test_set", "data_path"],
									e.target.value
								)
							}
						/>
						<label className="text-sm font-medium">Document Type</label>
						<input
							className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
							value={cfg.data_ingestion.test_set.document_type}
							onChange={(e) =>
								updateCfg(
									["data_ingestion", "test_set", "document_type"],
									e.target.value
								)
							}
						/>
					</div>
				</div>

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

// =============================
// File: frontend/src/components/AgentsManager.tsx
// =============================
("use client");
import React from "react";
import SectionCard from "./SectionCard";
import type { Agent } from "../lib/types";
import { Plus, Copy, Trash2, SplitSquareHorizontal } from "lucide-react";

type Props = {
	agents: Agent[];
	selectedIndex: number;
	onSelect: (i: number) => void;
	onAdd: () => void;
	onDuplicate: (i: number) => void;
	onDelete: (i: number) => void;
	updateAgent: (idx: number, path: (string | number)[], value: any) => void;
};

export default function AgentsManager({
	agents,
	selectedIndex,
	onSelect,
	onAdd,
	onDuplicate,
	onDelete,
	updateAgent,
}: Props) {
	const selected = agents[selectedIndex];
	return (
		<SectionCard
			title="Agents"
			icon={<SplitSquareHorizontal className="text-zinc-500" size={16} />}
			actions={
				<div className="flex items-center gap-2">
					<button
						onClick={onAdd}
						className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-2 text-sm shadow hover:opacity-90"
					>
						<Plus size={14} /> Add agent
					</button>
				</div>
			}
		>
			<div className="grid md:grid-cols-[260px_1fr] gap-4">
				<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
					{agents.map((a, i) => (
						<button
							key={a.id}
							onClick={() => onSelect(i)}
							className={`w-full text-left px-3 py-3 text-sm flex items-center justify-between ${
								i === selectedIndex
									? "bg-zinc-100 dark:bg-zinc-800"
									: "hover:bg-zinc-50 dark:hover:bg-zinc-900"
							}`}
						>
							<span className="truncate">
								{a.name} <span className="text-xs text-zinc-500">({a.id})</span>
							</span>
							<span className="flex items-center gap-2">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onDuplicate(i);
									}}
									title="Duplicate"
									className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
								>
									<Copy size={14} />
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onDelete(i);
									}}
									title="Delete"
									className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
								>
									<Trash2 size={14} />
								</button>
							</span>
						</button>
					))}
				</div>

				{selected && (
					<div className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Agent ID</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.id}
									onChange={(e) =>
										updateAgent(selectedIndex, ["id"], e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.name}
									onChange={(e) =>
										updateAgent(selectedIndex, ["name"], e.target.value)
									}
								/>
							</div>
						</div>

						<div className="grid md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Agent Type</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.agent_type}
									onChange={(e) =>
										updateAgent(selectedIndex, ["agent_type"], e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Retriever Type</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.retriever.retriever_type}
									onChange={(e) =>
										updateAgent(
											selectedIndex,
											["retriever", "retriever_type"],
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Top K</label>
								<input
									type="number"
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.retriever.top_k}
									onChange={(e) =>
										updateAgent(
											selectedIndex,
											["retriever", "top_k"],
											Number(e.target.value)
										)
									}
								/>
							</div>
						</div>

						<div className="grid md:grid-cols-4 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">LLM Type</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.llm_type}
									onChange={(e) =>
										updateAgent(
											selectedIndex,
											["llm", "llm_type"],
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Model</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.model}
									onChange={(e) =>
										updateAgent(selectedIndex, ["llm", "model"], e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Region</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.region}
									onChange={(e) =>
										updateAgent(
											selectedIndex,
											["llm", "region"],
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Temperature</label>
								<input
									type="number"
									step="0.1"
									min={0}
									max={2}
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.temperature}
									onChange={(e) =>
										updateAgent(
											selectedIndex,
											["llm", "temperature"],
											Number(e.target.value)
										)
									}
								/>
							</div>
						</div>

						<div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4 text-sm text-zinc-600 dark:text-zinc-400">
							Optional per-agent overrides (chunking, qdrant) could go here.
						</div>
					</div>
				)}
			</div>
		</SectionCard>
	);
}

// =============================
// File: frontend/src/components/EvaluationSuite.tsx
// =============================
("use client");
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

	const metricsText = (arr?: string[]) =>
		arr && arr.length ? arr.join(", ") : "—";

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
									e.target.value
										.split(",")
										.map((s) => s.trim())
										.filter(Boolean)
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
									e.target.value
										.split(",")
										.map((s) => s.trim())
										.filter(Boolean)
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
									e.target.value
										.split(",")
										.map((s) => s.trim())
										.filter(Boolean)
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
									e.target.value
										.split(",")
										.map((s) => s.trim())
										.filter(Boolean)
								)
							}
						/>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm font-medium">Evaluation LLM Override</div>
							<div className="text-xs text-zinc-500">
								Use a different LLM for metric evaluations only.
							</div>
						</div>
						<label className="inline-flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								className="h-4 w-4"
								checked={cfg.evaluation.llm_override.enabled}
								onChange={(e) =>
									updateCfg(
										["evaluation", "llm_override", "enabled"],
										e.target.checked
									)
								}
							/>
							<span>Enabled</span>
						</label>
					</div>
					<div className="grid md:grid-cols-4 gap-4 mt-4 opacity-100">
						{(["llm_type", "model", "region", "temperature"] as const).map(
							(k) => (
								<div key={k} className="space-y-2">
									<label className="text-sm font-medium capitalize">
										{k.replace("_", " ")}
									</label>
									{k === "temperature" ? (
										<input
											disabled={!cfg.evaluation.llm_override.enabled}
											type="number"
											step="0.1"
											min={0}
											max={2}
											className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
											value={cfg.evaluation.llm_override.temperature}
											onChange={(e) =>
												updateCfg(
													["evaluation", "llm_override", "temperature"],
													Number(e.target.value)
												)
											}
										/>
									) : (
										<input
											disabled={!cfg.evaluation.llm_override.enabled}
											className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
											value={cfg.evaluation.llm_override[k]}
											onChange={(e) =>
												updateCfg(
													["evaluation", "llm_override", k],
													(e.target as HTMLInputElement).value
												)
											}
										/>
									)}
								</div>
							)
						)}
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
								onClick={selectAll}
								className="text-xs px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800"
							>
								Select all
							</button>
							<button
								onClick={clear}
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

				<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm">
					<div className="font-medium mb-1">Summary</div>
					<div className="grid md:grid-cols-3 gap-2">
						<div>
							<span className="text-zinc-500">Agents:</span> {cfg.agents.length}
						</div>
						<div>
							<span className="text-zinc-500">Agent Metrics:</span>{" "}
							{metricsText(cfg.evaluation.metrics.agent)}
						</div>
						<div>
							<span className="text-zinc-500">Output Dir:</span>{" "}
							{cfg.evaluation.output_dir || "—"}
						</div>
					</div>
				</div>
			</div>
		</SectionCard>
	);
}

// =============================
// File: frontend/src/components/ResultsView.tsx
// =============================
("use client");
import React from "react";
import SectionCard from "./SectionCard";
import { BarChart3, FileJson } from "lucide-react";

export default function ResultsView() {
	return (
		<div className="space-y-6">
			<SectionCard
				title="Load Results"
				icon={<FileJson className="text-zinc-500" size={16} />}
			>
				<div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
					<div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center">
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Drop your <code>results/results.json</code> here or wire a file
							picker.
						</p>
						<div className="mt-3 text-xs text-zinc-500">
							(Parsing & visualization coming soon)
						</div>
					</div>
					<button className="h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
						Choose file (stub)
					</button>
				</div>
			</SectionCard>

			<SectionCard
				title="Overview"
				icon={<BarChart3 className="text-zinc-500" size={16} />}
			>
				<div className="grid md:grid-cols-3 gap-4">
					{["Queries", "Pass Rate", "Duration"].map((label) => (
						<div
							key={label}
							className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
						>
							<div className="text-xs text-zinc-500">{label}</div>
							<div className="text-xl font-semibold mt-1">—</div>
						</div>
					))}
				</div>
				<div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
					<div className="text-sm text-zinc-600 dark:text-zinc-400">
						Per-query table and trace timeline will render here after loading a
						file.
					</div>
				</div>
			</SectionCard>
		</div>
	);
}

// =============================
// File: frontend/src/app/page.tsx
// =============================
("use client");
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import GlobalDefaultsForm from "../components/GlobalDefaultsForm";
import AgentsManager from "../components/AgentsManager";
import EvaluationSuite from "../components/EvaluationSuite";
import ResultsView from "../components/ResultsView";
import { defaultConfig, makeDefaultAgent } from "../lib/defaults";
import { updateAtPath } from "../lib/update";
import type { ExperimentConfig } from "../lib/types";

export default function Page() {
	const [active, setActive] = useState<"configs" | "results">("configs");
	const [cfg, setCfg] = useState<ExperimentConfig>(defaultConfig);
	const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);

	const updateCfg = (path: (string | number)[], value: any) =>
		setCfg((prev) => updateAtPath(prev, path, value));

	const updateAgent = (idx: number, path: (string | number)[], value: any) =>
		setCfg((prev) => {
			const next = JSON.parse(JSON.stringify(prev)) as ExperimentConfig;
			let ref: any = next.agents[idx];
			for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
			ref[path[path.length - 1]] = value;
			return next;
		});

	const addAgent = () =>
		setCfg((prev) => ({
			...prev,
			agents: [...prev.agents, makeDefaultAgent(prev.agents.length + 1)],
		}));

	const duplicateAgent = (idx: number) =>
		setCfg((prev) => {
			const base = prev.agents[idx];
			const n = prev.agents.length + 1;
			const clone = JSON.parse(JSON.stringify(base));
			clone.id = `agent-${n}`;
			clone.name = `${base.name} Copy`;
			return { ...prev, agents: [...prev.agents, clone] };
		});

	const deleteAgent = (idx: number) =>
		setCfg((prev) => ({
			...prev,
			agents: prev.agents.filter((_, i) => i !== idx),
		}));

	const allAgentIds = cfg.agents.map((a) => a.id);

	return (
		<div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
			<div className="mx-auto max-w-screen-2xl grid grid-cols-1 md:grid-cols-[260px_1fr]">
				<Sidebar active={active} onSelect={setActive} />

				<main className="p-4 md:p-8">
					<header className="mb-6">
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
							{active === "configs" ? "Experiment Configs" : "Results"}
						</h1>
						<p className="text-sm text-zinc-500 mt-1">
							{active === "configs"
								? "Define global defaults, add multiple agent configs, and pick one evaluation suite to run across them."
								: "Load and explore results.json outputs from your runs."}
						</p>
					</header>

					<AnimatePresence mode="wait">
						{active === "configs" ? (
							<motion.div
								key="configs"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.2 }}
								className="space-y-6"
							>
								<GlobalDefaultsForm cfg={cfg} updateCfg={updateCfg} />
								<AgentsManager
									agents={cfg.agents}
									selectedIndex={selectedAgentIndex}
									onSelect={setSelectedAgentIndex}
									onAdd={addAgent}
									onDuplicate={duplicateAgent}
									onDelete={(i) => {
										deleteAgent(i);
										setSelectedAgentIndex((prev) =>
											Math.max(0, Math.min(prev, cfg.agents.length - 2))
										);
									}}
									updateAgent={updateAgent}
								/>
								<EvaluationSuite
									cfg={cfg}
									updateCfg={updateCfg}
									allAgentIds={allAgentIds}
								/>
							</motion.div>
						) : (
							<motion.div
								key="results"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.2 }}
							>
								<ResultsView />
							</motion.div>
						)}
					</AnimatePresence>
				</main>
			</div>
		</div>
	);
}
