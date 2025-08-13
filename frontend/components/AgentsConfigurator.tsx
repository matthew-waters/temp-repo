// src/components/AgentsConfigurator.tsx
"use client";
import React from "react";
import SectionCard from "./SectionCard";
import type { Agent, Option } from "../lib/types";
import { Plus, Trash2, SplitSquareHorizontal } from "lucide-react";

type Props = {
	agents: Agent[];
	setAgents: (next: Agent[]) => void;
	agentTypes: Option[];
	retrieverTypes: Option[];
	llmInterfaces: Option[];
	llmModels: Option[]; // id = provider model id (value), label = friendly name (shown)
};

const makeAgentForType = (t: Option): Agent => ({
	id: t.id,
	name: t.label,
	agent_type: t.id,
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
	llmModels,
}: Props) {
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const selected = agents[selectedIndex];

	const usedTypes = new Set(agents.map((a) => a.agent_type).filter(Boolean));
	const labelFor = (id: string) =>
		agentTypes.find((o) => o.id === id)?.label || id;
	const unusedAgentTypes = agentTypes.filter((o) => !usedTypes.has(o.id));
	const selectableFor = (currentType: string) =>
		agentTypes.filter((o) => o.id === currentType || !usedTypes.has(o.id));

	const add = () => {
		if (unusedAgentTypes.length === 0) return;
		const t = unusedAgentTypes[0];
		const next = [...agents, makeAgentForType(t)];
		setAgents(next);
		setSelectedIndex(next.length - 1);
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
					disabled={unusedAgentTypes.length === 0}
					className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow ${
						unusedAgentTypes.length === 0
							? "bg-zinc-300 text-zinc-600 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
							: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
					}`}
					title={
						unusedAgentTypes.length === 0
							? "All agent types added"
							: "Add agent"
					}
				>
					<Plus size={14} /> Add agent
				</button>
			}
		>
			<div className="grid md:grid-cols-[260px_1fr] gap-4">
				{/* List */}
				<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
					{agents.length === 0 && (
						<div className="px-3 py-3 text-sm text-zinc-500">
							No agents yet. Add one.
						</div>
					)}
					{agents.map((a, i) => (
						<div
							key={a.id || i}
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
								{labelFor(a.agent_type)}{" "}
								<span className="text-xs text-zinc-500">({a.agent_type})</span>
							</span>
							<span className="flex items-center gap-2">
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
						{/* Agent Type */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Agent Type</label>
							<select
								className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
								value={selected.agent_type}
								onChange={(e) => {
									const newType = e.target.value;
									update(selectedIndex, ["agent_type"], newType);
									update(selectedIndex, ["id"], newType);
									update(selectedIndex, ["name"], labelFor(newType));
								}}
							>
								{selectableFor(selected.agent_type).map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
							<p className="text-xs text-zinc-500">
								Each agent type can be selected only once. ID and Name follow
								the type.
							</p>
						</div>

						{/* Retriever */}
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

						{/* LLM */}
						<div className="grid md:grid-cols-4 gap-4">
							<div className="space-y-2 md:col-span-1">
								<label className="text-sm font-medium">LLM Interface</label>
								<select
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.llm_type}
									onChange={(e) => {
										update(selectedIndex, ["llm", "llm_type"], e.target.value);
										// Optional: clear model when interface changes
										// update(selectedIndex, ["llm", "model"], "");
									}}
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

							{/* MODEL DROPDOWN (simple list from registry) */}
							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium">Model</label>
								<select
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
									value={selected.llm.model}
									onChange={(e) =>
										update(selectedIndex, ["llm", "model"], e.target.value)
									}
								>
									<option value="">
										{llmModels.length ? "Select model…" : "No models available"}
									</option>
									{llmModels.map((m) => (
										<option key={m.id} value={m.id}>
											{m.label}
										</option>
									))}
								</select>
								<p className="text-xs text-zinc-500">
									Stores the provider model ID in config (e.g., Bedrock id).
								</p>
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
