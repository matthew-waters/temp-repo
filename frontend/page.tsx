"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import GlobalDefaultsForm from "../components/GlobalDefaultsForm";
import AgentsManager from "../components/AgentsManager";
import EvaluationSuite from "../components/EvaluationSuite";
import ResultsView from "../components/ResultsView";
import { defaultConfig } from "../lib/defaults";
import { updateAtPath } from "../lib/update";
import type { Agent, DatasetInfo, ExperimentConfig } from "../lib/types";
import { fetchAgents, fetchDatasets } from "../lib/api";

export default function Page() {
	const [active, setActive] = useState<"configs" | "results">("configs");
	const [cfg, setCfg] = useState<ExperimentConfig>(defaultConfig);
	const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);

	const [agents, setAgents] = useState<Agent[]>([]);
	const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
	const [loading, setLoading] = useState({ agents: true, datasets: true });

	// Load agents and datasets from API
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const [a, d] = await Promise.all([fetchAgents(), fetchDatasets()]);
				if (!mounted) return;
				setAgents(a);
				setDatasets(d);
				// reflect in config (read-only)
				setCfg((prev) => ({ ...prev, agents: a }));
			} catch {
				// keep empty arrays on failure
			} finally {
				if (mounted) setLoading({ agents: false, datasets: false });
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const updateCfg = (path: (string | number)[], value: any) =>
		setCfg((prev) => updateAtPath(prev, path, value));

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
								? "Global defaults, agents from backend, and one evaluation suite."
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
								<GlobalDefaultsForm
									cfg={cfg}
									updateCfg={updateCfg}
									datasets={datasets}
								/>
								<AgentsManager
									agents={agents}
									selectedIndex={selectedAgentIndex}
									onSelect={setSelectedAgentIndex}
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
