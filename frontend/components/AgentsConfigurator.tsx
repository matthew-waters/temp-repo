"use client";
import React from "react";
import SectionCard from "./SectionCard";
import type { Agent, Option } from "../lib/types";
import { Plus, Copy, Trash2, SplitSquareHorizontal } from "lucide-react";

type Props = {
	agents: Agent[];
	setAgents: (next: Agent[]) => void;
	agentTypes: Option[];
	retrieverTypes: Option[];
	llmInterfaces: Option[];
};

const makeAgent = (n: number): Agent => ({
	id: `agent-${n}`,
	name: `Agent ${n}`,
	agent_type: "",
	retriever: { retriever_type: "", top_k: 5 },
	llm: { llm_type: "", model: "", region: "", temperature: 0.0 },
	overrides: { chunking: null, qdrant_db: null },
});

export default function AgentsConfigurator({
	agents,
	setAgents,
	agentTypes,
	retrieverTypes,
	llmInterfaces,
}: Props) {
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const selected = agents[selectedIndex];

	const add = () => setAgents([...agents, makeAgent(agents.length + 1)]);
	const duplicate = (i: number) => {
		const clone: Agent = JSON.parse(JSON.stringify(agents[i]));
		const n = agents.length + 1;
		clone.id = `agent-${n}`;
		clone.name = `${clone.name} Copy`;
		setAgents([...agents, clone]);
		setSelectedIndex(agents.length);
	};
	const remove = (i: number) => {
		const next = agents.filter((_, idx) => idx !== i);
		setAgents(next);
		setSelectedIndex((prev) => Math.max(0, Math.min(prev, next.length - 1)));
	};

	const update = (i: number, path: (string | number)[], value: any) => {
		const next = JSON.parse(JSON.stringify(agents)) as Agent[];
		let ref: any = next[i];
		for (let k = 0; k < path.length - 1; k++) ref = ref[path[k]];
		ref[path[path.length - 1]] = value;
		setAgents(next);
	};

	return (
		<SectionCard
			title="Agents to evaluate"
			icon={<SplitSquareHorizontal className="text-zinc-500" size={16} />}
			actions={
				<button
					type="button"
					onClick={add}
					className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-2 text-sm shadow hover:opacity-90"
				>
					<Plus size={14} /> Add agent
				</button>
			}
		>
			<div className="grid md:grid-cols-[260px_1fr] gap-4">
				<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
					{agents.length === 0 && (
						<div className="px-3 py-3 text-sm text-zinc-500">
							No agents yet. Add one.
						</div>
					)}
					{agents.map((a, i) => (
						<div
							key={a.id}
							role="button"
							tabIndex={0}
							onClick={() => setSelectedIndex(i)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setSelectedIndex(i);
								}
							}}
							className={`w-full px-3 py-3 text-sm flex items-center justify-between cursor-pointer ${
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
										duplicate(i);
									}}
									className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
									title="Duplicate"
								>
									<Copy size={14} />
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										remove(i);
									}}
									className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
									title="Delete"
								>
									<Trash2 size={14} />
								</button>
							</span>
						</div>
					))}
				</div>

				{/* Editor */}
				{selected && (
					<div className="space-y-6">
						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Agent ID</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.id}
									onChange={(e) =>
										update(selectedIndex, ["id"], e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.name}
									onChange={(e) =>
										update(selectedIndex, ["name"], e.target.value)
									}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Agent Type</label>
							<select
								className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
								value={selected.agent_type}
								onChange={(e) =>
									update(selectedIndex, ["agent_type"], e.target.value)
								}
							>
								<option value="">
									{agentTypes.length
										? "Select agent type…"
										: "No agent types available"}
								</option>
								{agentTypes.map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
						</div>

						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Retriever Type</label>
								<select
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.retriever.retriever_type}
									onChange={(e) =>
										update(
											selectedIndex,
											["retriever", "retriever_type"],
											e.target.value
										)
									}
								>
									<option value="">
										{retrieverTypes.length
											? "Select retriever…"
											: "No retrievers available"}
									</option>
									{retrieverTypes.map((r) => (
										<option key={r.id} value={r.id}>
											{r.label}
										</option>
									))}
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Top K</label>
								<input
									type="number"
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.retriever.top_k}
									onChange={(e) =>
										update(
											selectedIndex,
											["retriever", "top_k"],
											Number(e.target.value)
										)
									}
								/>
							</div>
						</div>

						<div className="grid md:grid-cols-4 gap-4">
							<div className="space-y-2 md:col-span-1">
								<label className="text-sm font-medium">LLM Interface</label>
								<select
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.llm_type}
									onChange={(e) =>
										update(selectedIndex, ["llm", "llm_type"], e.target.value)
									}
								>
									<option value="">
										{llmInterfaces.length
											? "Select interface…"
											: "No LLM interfaces"}
									</option>
									{llmInterfaces.map((p) => (
										<option key={p.id} value={p.id}>
											{p.label}
										</option>
									))}
								</select>
							</div>

							{/* Model/Region left free-text since registry doesn't provide per-interface models */}
							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium">Model</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.model}
									onChange={(e) =>
										update(selectedIndex, ["llm", "model"], e.target.value)
									}
									placeholder="e.g., gpt-4o-mini / claude-3-5-sonnet"
								/>
							</div>

							<div className="space-y-2 md:col-span-1">
								<label className="text-sm font-medium">Region</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.region}
									onChange={(e) =>
										update(selectedIndex, ["llm", "region"], e.target.value)
									}
									placeholder="optional"
								/>
							</div>

							<div className="space-y-2 md:col-span-1">
								<label className="text-sm font-medium">Temperature</label>
								<input
									type="number"
									step={0.1}
									min={0}
									max={2}
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.temperature}
									onChange={(e) =>
										update(
											selectedIndex,
											["llm", "temperature"],
											Number(e.target.value)
										)
									}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</SectionCard>
	);
}
