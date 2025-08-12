"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import ConfigList from "../components/ConfigList";
import ConfigDetail from "../components/ConfigDetail";
import ConfigEditor from "../components/ConfigEditor";
import ResultsView from "../components/ResultsView";
import type {
	SavedConfig,
	ExperimentConfig,
	// NEW types we fetch:
	ChunkingType,
	EmbeddingModelInfo,
	DistanceMetric,
	AgentTypeInfo,
	RetrieverSpec,
	LLMProviderSpec,
	DatasetInfo,
} from "../lib/types";
import {
	fetchDatasets,
	fetchChunkingTypes,
	fetchEmbeddingModels,
	fetchDistanceMetrics,
	// NEW
	fetchAgentTypes,
	fetchRetrieverSpecs,
	fetchLLMProviders,
} from "../lib/api";
import { listConfigs, saveNew, deleteConfig, getConfig } from "../lib/storage";

type ViewState =
	| { mode: "list" }
	| { mode: "detail"; id: string }
	| { mode: "create" };

export default function Page() {
	const [active, setActive] = useState<"configs" | "results">("configs");

	// catalogs
	const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
	const [chunkingTypes, setChunkingTypes] = useState<ChunkingType[]>([]);
	const [embeddingModels, setEmbeddingModels] = useState<EmbeddingModelInfo[]>(
		[]
	);
	const [distanceMetrics, setDistanceMetrics] = useState<DistanceMetric[]>([]);
	const [agentTypes, setAgentTypes] = useState<AgentTypeInfo[]>([]);
	const [retrievers, setRetrievers] = useState<RetrieverSpec[]>([]);
	const [llmProviders, setLlmProviders] = useState<LLMProviderSpec[]>([]);

	// saved configs
	const [saved, setSaved] = useState<SavedConfig[]>(listConfigs());
	const [view, setView] = useState<ViewState>({ mode: "list" });

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const [d, ct, em, dm, at, r, lp] = await Promise.all([
					fetchDatasets(),
					fetchChunkingTypes(),
					fetchEmbeddingModels(),
					fetchDistanceMetrics(),
					fetchAgentTypes(),
					fetchRetrieverSpecs(),
					fetchLLMProviders(),
				]);
				if (!mounted) return;
				setDatasets(d);
				setChunkingTypes(ct);
				setEmbeddingModels(em);
				setDistanceMetrics(dm);
				setAgentTypes(at);
				setRetrievers(r);
				setLlmProviders(lp);
			} catch {
				// leave empty on failure
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const openDetail = (id: string) => setView({ mode: "detail", id });
	const backToList = () => {
		setSaved(listConfigs());
		setView({ mode: "list" });
	};

	const saveConfig = (cfg: ExperimentConfig): SavedConfig => {
		// cfg.agents already configured via editor; just persist
		const savedItem = saveNew({ name: cfg.name || "Untitled", config: cfg });
		setSaved(listConfigs());
		return savedItem;
	};

	const currentDetail = useMemo(
		() => (view.mode === "detail" ? getConfig(view.id) : undefined),
		[view]
	);

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
								? "View saved configs, inspect details, or create a new config."
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
								{view.mode === "list" && (
									<ConfigList
										items={saved}
										onCreate={() => setView({ mode: "create" })}
										onOpen={openDetail}
										onDelete={(id) => {
											deleteConfig(id);
											setSaved(listConfigs());
										}}
									/>
								)}

								{view.mode === "detail" && currentDetail && (
									<ConfigDetail item={currentDetail} onBack={backToList} />
								)}

								{view.mode === "create" && (
									<ConfigEditor
										datasets={datasets}
										chunkingTypes={chunkingTypes}
										embeddingModels={embeddingModels}
										distanceMetrics={distanceMetrics}
										agentTypes={agentTypes}
										retrievers={retrievers}
										llmProviders={llmProviders}
										onCancel={backToList}
										onSave={(savedItem) =>
											setView({ mode: "detail", id: savedItem.id })
										}
										saveConfig={saveConfig}
									/>
								)}
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
