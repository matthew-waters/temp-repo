// frontend/src/components/AgentsManager.tsx
"use client";

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
						type="button"
					>
						<Plus size={14} /> Add agent
					</button>
				</div>
			}
		>
			<div className="grid md:grid-cols-[260px_1fr] gap-4">
				{/* List */}
				<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
					{agents.map((a, i) => (
						<div
							key={a.id}
							role="button"
							tabIndex={0}
							onClick={() => onSelect(i)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onSelect(i);
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
						</div>
					))}
				</div>

				{/* Editor */}
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
											Number((e.target as HTMLInputElement).value)
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
