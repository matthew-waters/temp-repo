"use client";
import React from "react";
import SectionCard from "./SectionCard";
import type { SavedConfig } from "../lib/types";
import { Plus, Eye, Trash2 } from "lucide-react";

type Props = {
	items: SavedConfig[];
	onCreate: () => void;
	onOpen: (id: string) => void;
	onDelete: (id: string) => void;
};

export default function ConfigList({
	items,
	onCreate,
	onOpen,
	onDelete,
}: Props) {
	return (
		<SectionCard
			title="Saved Experiment Configs"
			icon={<span>🗂️</span>}
			actions={
				<button
					type="button"
					onClick={onCreate}
					className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-2 text-sm shadow hover:opacity-90"
				>
					<Plus size={14} /> New Config
				</button>
			}
		>
			<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				{items.length === 0 && (
					<div className="p-6 text-sm text-zinc-500 text-center">
						No configs yet. Create one to get started.
					</div>
				)}
				{items.map((c) => (
					<div
						key={c.id}
						className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-zinc-200 dark:border-zinc-800"
					>
						<div className="min-w-0">
							<div className="font-medium truncate">
								{c.name || "(unnamed experiment)"}
							</div>
							<div className="text-xs text-zinc-500">
								Updated {new Date(c.updatedAt).toLocaleString()} • Agents:{" "}
								{c.config.agents.length} • Output:{" "}
								{c.config.evaluation.output_dir || "results"}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => onOpen(c.id)}
								className="px-2 py-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
								title="Open"
							>
								<Eye size={14} /> Open
							</button>
							<button
								type="button"
								onClick={() => onDelete(c.id)}
								className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
								title="Delete"
							>
								<Trash2 size={16} />
							</button>
						</div>
					</div>
				))}
			</div>
		</SectionCard>
	);
}
