// src/components/ConfigEditor.tsx
// props: ensure you pass catalog.embedding_dimensions into this component
type Props = {
	// ...
	embeddingModels: Option[];
	embeddingDimensionsMap: Record<string, number[]>; // ← add this prop
	// ...
};

// inside component:
const selectedEmbedModel = cfg.qdrant_db.parameters.embedding.embedding_model;
const dimsForSelected = embeddingDimensionsMap[selectedEmbedModel] || [];

// When changing model: auto-pick the only/first dim if available, else clear
const onSelectEmbeddingModel = (id: string) => {
	update(["qdrant_db", "parameters", "embedding", "embedding_model"], id);
	const dims = embeddingDimensionsMap[id] || [];
	update(
		["qdrant_db", "parameters", "embedding", "embedding_length"],
		dims.length ? dims[0] : 0
	);
};

// JSX in the Embedding section:
<SectionCard title="Embedding" icon={<span>🧠</span>}>
	<div className="grid md:grid-cols-3 gap-4">
		<div className="space-y-2 md:col-span-2">
			<label className="text-sm font-medium">Embedding Model</label>
			<select
				className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
				value={selectedEmbedModel || ""}
				onChange={(e) => onSelectEmbeddingModel(e.target.value)}
			>
				<option value="">
					{embeddingModels.length
						? "Select embedding…"
						: "No embeddings available"}
				</option>
				{embeddingModels.map((m) => (
					<option key={m.id} value={m.id}>
						{m.label}
					</option>
				))}
			</select>
			<div className="text-xs text-zinc-500">
				Stores the provider model ID (e.g.,{" "}
				<code>amazon.titan-embed-text-v1</code>).
			</div>
		</div>

		<div className="space-y-2 md:col-span-1">
			<label className="text-sm font-medium">Dimensionality</label>
			<select
				className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
				value={String(
					cfg.qdrant_db.parameters.embedding.embedding_length || ""
				)}
				onChange={(e) =>
					update(
						["qdrant_db", "parameters", "embedding", "embedding_length"],
						Number(e.target.value)
					)
				}
				disabled={!selectedEmbedModel || dimsForSelected.length === 0}
			>
				<option value="" disabled>
					{!selectedEmbedModel
						? "Select a model first"
						: dimsForSelected.length
						? "Select dimensionality…"
						: "No preset dimensions"}
				</option>
				{dimsForSelected.map((d) => (
					<option key={d} value={d}>
						{d}
					</option>
				))}
			</select>
			<div className="text-xs text-zinc-500">
				{dimsForSelected.length
					? "Choose from registry-defined dimensions."
					: "No preset dimensions for this model."}
			</div>
		</div>
	</div>
</SectionCard>;
