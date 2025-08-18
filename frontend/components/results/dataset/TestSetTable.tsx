"use client";

import React from "react";
import Modal from "../../ui/Modal";
import type { TestSetData, TestQuery } from "../../../lib/types/dataset";

type Props = {
	testSet: TestSetData | null;
	/** Called when user clicks an evidence doc id; parent opens the corpus doc modal */
	onOpenDocById: (docId: string | number) => void;
};

export default function TestSetTable({ testSet, onOpenDocById }: Props) {
	const [limit, setLimit] = React.useState(50);
	const [selected, setSelected] = React.useState<TestQuery | null>(null);

	if (!testSet)
		return <div className="text-sm text-zinc-500">No test set loaded.</div>;

	const rows = testSet.data.slice(0, limit);

	return (
		<div className="space-y-3">
			<div className="text-sm text-zinc-500">
				Queries:{" "}
				<span className="font-medium text-zinc-700 dark:text-zinc-300">
					{testSet.data.length}
				</span>
			</div>

			<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
						<tr>
							<th className="text-left px-3 py-2">Query ID</th>
							<th className="text-left px-3 py-2">Query</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((q) => (
							<tr
								key={q.query_id}
								className="border-t border-zinc-200 dark:border-zinc-800 align-top hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
								onClick={() => setSelected(q)}
								title="Click to view query details"
							>
								<td className="px-3 py-2 font-mono text-xs">{q.query_id}</td>
								<td
									className="px-3 py-2 max-w-[640px] truncate"
									title={q.query}
								>
									{truncate(q.query, 200)}
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={2} className="px-3 py-3 text-sm text-zinc-500">
									No test queries.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{limit < testSet.data.length && (
				<div>
					<button
						type="button"
						onClick={() =>
							setLimit((n) => Math.min(n + 50, testSet.data.length))
						}
						className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						Show more
					</button>
				</div>
			)}

			{/* Modal for a single test query */}
			<Modal
				open={!!selected}
				onClose={() => setSelected(null)}
				title={
					selected ? (
						<div className="truncate">Query {selected.query_id}</div>
					) : null
				}
			>
				{selected && (
					<QueryDetail
						q={selected}
						onOpenDoc={(docId) => {
							// close this modal first, then open corpus doc modal in parent
							setSelected(null);
							onOpenDocById(docId);
						}}
					/>
				)}
			</Modal>
		</div>
	);
}

function QueryDetail({
	q,
	onOpenDoc,
}: {
	q: TestQuery;
	onOpenDoc: (docId: string | number) => void;
}) {
	const gt = q.ground_truth_answer;

	return (
		<div className="space-y-4 text-sm">
			<div className="grid md:grid-cols-2 gap-4">
				<div>
					<div className="text-zinc-500">Query ID</div>
					<div className="font-mono">{q.query_id}</div>
				</div>
				<div className="md:col-span-1">
					<div className="text-zinc-500">Query</div>
					<div className="whitespace-pre-wrap">{q.query}</div>
				</div>
			</div>

			<div>
				<div className="text-sm font-medium mb-2">Ground Truth Answer</div>
				<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 whitespace-pre-wrap">
					{gt?.query_answer || (
						<span className="text-zinc-500 italic">No answer</span>
					)}
				</div>
			</div>

			<div>
				<div className="text-sm font-medium mb-2">Supporting Evidence</div>
				{!gt?.supporting_evidence?.length ? (
					<div className="text-sm text-zinc-500">No evidence.</div>
				) : (
					<div className="space-y-2">
						{gt.supporting_evidence.map((ev, i) => (
							<div
								key={i}
								className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
							>
								<div className="text-xs text-zinc-500 mb-1">
									From{" "}
									<button
										type="button"
										className="underline hover:no-underline text-blue-600"
										onClick={() => onOpenDoc(ev.doc_id)}
										title="Open source document"
									>
										doc {String(ev.doc_id)}
									</button>
									{ev.collection ? (
										<>
											{" "}
											in <code>{ev.collection}</code>
										</>
									) : null}
								</div>
								<div className="text-sm whitespace-pre-wrap">
									{ev.fact_excerpt || (
										<span className="text-zinc-500 italic">No excerpt</span>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function truncate(s: string, n: number) {
	if (!s) return "";
	return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
