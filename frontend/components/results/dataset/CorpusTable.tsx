"use client";

import React from "react";
import type {
	IngestionDataset,
	IngestionDocument,
	IngestionCollection,
} from "../../../lib/types/dataset";

type Props = {
	corpus: IngestionDataset | null;
	onSelectDoc: (doc: IngestionDocument) => void;
};

export default function CorpusTable({ corpus, onSelectDoc }: Props) {
	const [limit, setLimit] = React.useState(50);
	if (!corpus)
		return <div className="text-sm text-zinc-500">No corpus loaded.</div>;

	const rows = corpus.data.slice(0, limit);

	return (
		<div className="space-y-4">
			{/* Collections overview */}
			<CollectionsPanel collections={corpus.collections} />

			{/* Docs table */}
			<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
						<tr>
							<th className="text-left px-3 py-2">Doc ID</th>
							<th className="text-left px-3 py-2">Collection</th>
							<th className="text-left px-3 py-2">Content (preview)</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((d, i) => (
							<tr
								key={`${d.doc_id}-${i}`}
								className="border-t border-zinc-200 dark:border-zinc-800 align-top hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
								onClick={() => onSelectDoc(d)}
								title="Click to view document details"
							>
								<td className="px-3 py-2 font-mono text-xs">{d.doc_id}</td>
								<td className="px-3 py-2">{d.collection}</td>
								<td
									className="px-3 py-2 max-w-[640px] truncate"
									title={d.content}
								>
									{truncate(d.content, 200)}
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={3} className="px-3 py-3 text-sm text-zinc-500">
									No documents.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{limit < corpus.data.length && (
				<div>
					<button
						type="button"
						onClick={() =>
							setLimit((n) => Math.min(n + 50, corpus.data.length))
						}
						className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						Show more
					</button>
				</div>
			)}
		</div>
	);
}

function CollectionsPanel({
	collections,
}: {
	collections: IngestionCollection[];
}) {
	if (!collections?.length) {
		return (
			<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-sm text-zinc-500">
				No collections metadata.
			</div>
		);
	}
	return (
		<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
			<div className="text-sm font-medium mb-3">Collections</div>
			<div className="grid md:grid-cols-2 gap-3">
				{collections.map((c, idx) => (
					<div
						key={idx}
						className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
					>
						<div className="text-sm font-semibold">{c.collection_name}</div>
						<div className="text-xs text-zinc-500 mt-1">
							{c.collection_description || (
								<span className="italic">No description</span>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function truncate(s: string, n: number) {
	if (!s) return "";
	return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
