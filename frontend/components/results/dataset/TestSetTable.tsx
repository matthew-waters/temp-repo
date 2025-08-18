"use client";

import React from "react";
import type { TestSetData } from "../../../lib/types/dataset";

type Props = { testSet: TestSetData | null };

export default function TestSetTable({ testSet }: Props) {
	const [limit, setLimit] = React.useState(50);
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
							<th className="text-left px-3 py-2">Ground Truth</th>
							<th className="text-left px-3 py-2">Evidence #</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((q) => (
							<tr
								key={q.query_id}
								className="border-t border-zinc-200 dark:border-zinc-800 align-top"
							>
								<td className="px-3 py-2 font-mono text-xs">{q.query_id}</td>
								<td
									className="px-3 py-2 max-w-[420px] truncate"
									title={q.query}
								>
									{truncate(q.query, 160)}
								</td>
								<td
									className="px-3 py-2 max-w-[420px] truncate"
									title={q.ground_truth_answer?.query_answer}
								>
									{truncate(q.ground_truth_answer?.query_answer || "", 160)}
								</td>
								<td className="px-3 py-2 text-xs">
									{q.ground_truth_answer?.supporting_evidence?.length ?? 0}
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={4} className="px-3 py-3 text-sm text-zinc-500">
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
		</div>
	);
}

function truncate(s: string, n: number) {
	if (!s) return "";
	return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
