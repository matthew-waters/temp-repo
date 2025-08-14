"use client";
import React from "react";
import SectionCard from "./SectionCard";
import type { SavedConfig } from "../lib/types";
import { Plus, Eye, Trash2, Play } from "lucide-react";
import { runExperiment } from "../lib/api";
import RunLogsModal from "./RunLogsModal";

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
	const [runningId, setRunningId] = React.useState<string | null>(null);
	const [logJob, setLogJob] = React.useState<{
		jobId: string;
		name?: string;
	} | null>(null);

	const handleRun = async (c: SavedConfig) => {
		try {
			setRunningId(c.id);
			const res = await runExperiment({
				id: c.id,
				name: c.name,
				config: c.config,
			});
			// Open logs modal
			setLogJob({ jobId: res.job_id, name: c.name });
		} catch (err: any) {
			console.error(err);
			alert(err?.message || "Failed to start run");
		} finally {
			setRunningId(null);
		}
	};

	return (
		<>
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
					{items.map((c) => {
						const isRunning = runningId === c.id;
						return (
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
										{c.config.agents.length}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => onOpen(c.id)}
										className="px-2 py-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
										title="Open"
										disabled={isRunning}
									>
										<Eye size={14} /> Open
									</button>

									<button
										type="button"
										onClick={() => handleRun(c)}
										className={`px-2 py-1 text-sm rounded-lg inline-flex items-center gap-1 ${
											isRunning
												? "bg-emerald-400 text-white cursor-wait"
												: "bg-emerald-600 text-white hover:opacity-90"
										}`}
										title="Send to backend to run"
										disabled={isRunning}
									>
										<Play size={14} />
										{isRunning ? "Starting…" : "Run"}
									</button>

									<button
										type="button"
										onClick={() => onDelete(c.id)}
										className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
										title="Delete"
										disabled={isRunning}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</SectionCard>

			{/* Logs Modal */}
			{logJob && (
				<RunLogsModal
					jobId={logJob.jobId}
					name={logJob.name}
					onClose={() => setLogJob(null)}
				/>
			)}
		</>
	);
}
