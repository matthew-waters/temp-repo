"use client";

import React from "react";
import SectionCard from "./SectionCard";
import type { Agent } from "../lib/types";
import { SplitSquareHorizontal } from "lucide-react";

type Props = {
	agents: Agent[];
	selectedIndex: number;
	onSelect: (i: number) => void;
};

export default function AgentsManager({
	agents,
	selectedIndex,
	onSelect,
}: Props) {
	const selected = agents[selectedIndex];

	return (
		<SectionCard
			title="Agents (from backend)"
			icon={<SplitSquareHorizontal className="text-zinc-500" size={16} />}
		>
			<div className="grid md:grid-cols-[260px_1fr] gap-4">
				{/* List */}
				<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
					{agents.length === 0 && (
						<div className="px-3 py-3 text-sm text-zinc-500">
							No agents found.
						</div>
					)}
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
						</div>
					))}
				</div>

				{/* Details (read-only) */}
				{selected && (
					<div className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Agent ID</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.id}
									readOnly
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.name}
									readOnly
								/>
							</div>
						</div>

						<div className="grid md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Agent Type</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.agent_type}
									readOnly
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Retriever Type</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.retriever.retriever_type}
									readOnly
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Top K</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.retriever.top_k}
									readOnly
								/>
							</div>
						</div>

						<div className="grid md:grid-cols-4 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">LLM Type</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.llm.llm_type}
									readOnly
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Model</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.llm.model}
									readOnly
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Region</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.llm.region}
									readOnly
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Temperature</label>
								<input
									className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm"
									value={selected.llm.temperature}
									readOnly
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</SectionCard>
	);
}
