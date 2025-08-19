"use client";

import React from "react";
import type { MetricResult } from "../../../lib/types/results";
import type { QueryRow } from "./PerQueryTab";
import type {
	RetrieverCall,
	LCDocument,
	LCOriginDocInfo,
} from "../../../lib/types/retrieval";

type Props = {
	row: QueryRow;
	agents: string[];
};

type InnerTab = "metrics" | "answer" | "llm" | "retriever" | "tools";

export default function QueryModal({ row, agents }: Props) {
	const [agent, setAgent] = React.useState<string>(agents[0] || "");
	const [tab, setTab] = React.useState<InnerTab>("metrics");

	React.useEffect(() => {
		if (!agent || !agents.includes(agent)) {
			setAgent(agents[0] || "");
		}
	}, [agents, agent]);

	const active = agent ? row.agents[agent] : undefined;

	// Extract call arrays from final agent state (defensive)
	const llmCalls: any[] = (active?.final?.llm_calls ?? []) as any[];
	const retrieverCalls: any[] = (active?.final?.retriever_calls ?? []) as any[];
	const otherToolCalls: any[] = (active?.final?.other_tool_calls ??
		[]) as any[];

	return (
		<div className="space-y-4">
			{/* Query header */}
			<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
				<div className="text-xs text-zinc-500 mb-1">
					Query ID: <span className="font-mono">{String(row.query_id)}</span>
				</div>
				<div className="text-sm md:text-base whitespace-pre-wrap">
					{row.query || (
						<span className="text-zinc-500 italic">No query text</span>
					)}
				</div>
			</div>

			{/* Agent selector */}
			<div className="flex items-center gap-2">
				<div className="text-sm text-zinc-500">Agent:</div>
				<select
					className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm"
					value={agent}
					onChange={(e) => setAgent(e.target.value)}
				>
					{agents.map((a) => (
						<option key={a} value={a}>
							{a}
						</option>
					))}
				</select>
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-2 flex-wrap">
				<TabBtn active={tab === "metrics"} onClick={() => setTab("metrics")}>
					Metrics
				</TabBtn>
				<TabBtn active={tab === "answer"} onClick={() => setTab("answer")}>
					Answer / Generation
				</TabBtn>
				<TabBtn active={tab === "llm"} onClick={() => setTab("llm")}>
					LLM Calls
				</TabBtn>
				<TabBtn
					active={tab === "retriever"}
					onClick={() => setTab("retriever")}
				>
					Retriever Calls
				</TabBtn>
				<TabBtn active={tab === "tools"} onClick={() => setTab("tools")}>
					Other Tool Calls
				</TabBtn>
			</div>

			{/* Content */}
			{tab === "metrics" &&
				(!active ? (
					<div className="text-sm text-zinc-500">No data for this agent.</div>
				) : (
					<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
								<tr>
									<th className="text-left px-3 py-2 w-56">Metric</th>
									<th className="text-left px-3 py-2">Value</th>
									<th className="text-left px-3 py-2">Message</th>
								</tr>
							</thead>
							<tbody>
								{(active.metrics || []).map((m) => (
									<tr
										key={m.id ?? m.name}
										className="border-t border-zinc-200 dark:border-zinc-800 align-top"
									>
										<td className="px-3 py-2 font-mono text-xs">
											{m.label ?? m.id ?? m.name}
										</td>
										<td className="px-3 py-2">{renderMetricValue(m)}</td>
										<td className="px-3 py-2 text-xs text-zinc-600">
											{m.message ? (
												<span title={m.message}>
													{m.message.length > 140
														? m.message.slice(0, 139) + "…"
														: m.message}
												</span>
											) : (
												<span className="text-zinc-400">—</span>
											)}
										</td>
									</tr>
								))}
								{(!active.metrics || active.metrics.length === 0) && (
									<tr>
										<td colSpan={3} className="px-3 py-3 text-sm text-zinc-500">
											No metrics recorded for this agent on this query.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				))}

			{tab === "answer" &&
				(!active ? (
					<div className="text-sm text-zinc-500">No data for this agent.</div>
				) : (
					<div className="space-y-3">
						<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
							<div className="text-sm font-medium mb-2">Final Answer</div>
							{active.error ? (
								<div className="text-sm text-red-600">
									Error:{" "}
									<span className="font-mono text-[12px]">{active.error}</span>
								</div>
							) : (
								<div className="text-sm whitespace-pre-wrap max-h-80 overflow-auto">
									{active.answer || (
										<span className="text-zinc-500 italic">No answer</span>
									)}
								</div>
							)}
						</div>
						{/* Expand later with citations, formatting, etc. */}
					</div>
				))}

			{tab === "llm" && <LLMCallsList calls={llmCalls} />}

			{tab === "retriever" && <RetrieverCallsList calls={retrieverCalls} />}

			{tab === "tools" && <OtherToolsList calls={otherToolCalls} />}
		</div>
	);
}

/* ---------------- Tab button ---------------- */

function TabBtn({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-2.5 py-1 text-xs rounded-lg ${
				active
					? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
					: "hover:bg-zinc-100 dark:hover:bg-zinc-800"
			}`}
		>
			{children}
		</button>
	);
}

/* ---------------- LLM Calls ---------------- */

function LLMCallsList({ calls }: { calls: any[] }) {
	if (!calls?.length) {
		return <div className="text-sm text-zinc-500">No LLM calls recorded.</div>;
	}
	return (
		<div className="space-y-3">
			{calls.map((c, idx) => (
				<div
					key={idx}
					className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3"
				>
					<div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mb-2">
						{c.model_name && (
							<span>
								Model: <code>{c.model_name}</code>
							</span>
						)}
						{c.timestamp && <span>Time: {fmtTime(c.timestamp)}</span>}
					</div>

					<div className="grid md:grid-cols-2 gap-3">
						<div>
							<div className="text-xs font-medium mb-1">Prompt(s)</div>
							<LLMPromptsView call={c} />
						</div>
						<div>
							<div className="text-xs font-medium mb-1">Response</div>
							<div className="text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 whitespace-pre-wrap max-h-64 overflow-auto">
								{safeText(c.response) ?? (
									<span className="text-zinc-500 italic">—</span>
								)}
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function LLMPromptsView({ call }: { call: any }) {
	// supports either `prompt: string` or `prompts: BaseMessage[]`
	if (Array.isArray(call?.prompts)) {
		return (
			<div className="space-y-2">
				{call.prompts.map((m: any, i: number) => {
					const role = m?.role || m?._type || m?.type || "message";
					const content = extractMessageContent(m?.content);
					return (
						<div
							key={i}
							className="rounded border border-zinc-200 dark:border-zinc-800 p-2"
						>
							<div className="text-[11px] text-zinc-500 mb-1 uppercase tracking-wide">
								{String(role)}
							</div>
							<div className="text-sm whitespace-pre-wrap">
								{content ?? <span className="text-zinc-500 italic">—</span>}
							</div>
						</div>
					);
				})}
			</div>
		);
	}
	// string prompt
	return (
		<div className="text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 whitespace-pre-wrap max-h-64 overflow-auto">
			{safeText(call?.prompt) ?? (
				<span className="text-zinc-500 italic">—</span>
			)}
		</div>
	);
}

/* ---------------- Retriever Calls ---------------- */

function RetrieverCallsList({ calls }: { calls: RetrieverCall[] | any[] }) {
	const arr: RetrieverCall[] = Array.isArray(calls) ? (calls as any) : [];

	if (!arr.length) {
		return (
			<div className="text-sm text-zinc-500">No retriever calls recorded.</div>
		);
	}

	return (
		<div className="space-y-4">
			{arr.map((c, idx) => {
				const results: LCDocument[] = Array.isArray(c?.results)
					? c.results
					: [];
				return (
					<div
						key={idx}
						className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3"
					>
						<div className="text-sm font-medium mb-2">
							Retriever Call #{idx + 1}
						</div>

						{/* Query / collection / top-k */}
						<div className="grid md:grid-cols-3 gap-3 mb-3 text-sm">
							<InfoBox label="Query (embedded)">
								<div className="whitespace-pre-wrap">
									{c?.query ?? <span className="text-zinc-500">—</span>}
								</div>
							</InfoBox>
							<InfoBox label="Collection">
								{c?.collection_name ? (
									<code>{c.collection_name}</code>
								) : (
									<span className="text-zinc-500">—</span>
								)}
							</InfoBox>
							<InfoBox label="Top-K">
								{c?.top_k ?? <span className="text-zinc-500">—</span>}
							</InfoBox>
						</div>

						{/* Results */}
						{!results.length ? (
							<div className="text-sm text-zinc-500">No results attached.</div>
						) : (
							<div className="space-y-2">
								{results.map((r, i) => {
									const ri = r?.metadata
										?.retrieval_info as (LCDocument["metadata"] extends infer T
										? T
										: any)["retrieval_info"];
									const od = r?.metadata?.origin_doc_info as
										| LCOriginDocInfo
										| undefined;

									const score = ri?.score;
									const searchQuery = ri?.search_query;
									const chunkId = r?.id;
									const content = r?.page_content;

									return (
										<div
											key={i}
											className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
										>
											{/* Top line: score, doc id, chunk id */}
											<div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 mb-2">
												<span>
													Score:{" "}
													<span className="font-mono">{score ?? "—"}</span>
												</span>
												<span>
													Doc ID:{" "}
													<span className="font-mono">{od?.doc_id ?? "—"}</span>
												</span>
												<span>
													Chunk ID:{" "}
													<span className="font-mono">{chunkId ?? "—"}</span>
												</span>
												{searchQuery && (
													<span title="Search query used by retriever">
														Search Query:{" "}
														<span className="font-mono">{searchQuery}</span>
													</span>
												)}
											</div>

											<div className="grid md:grid-cols-3 gap-3">
												{/* Document metadata */}
												<div className="md:col-span-1">
													<div className="text-xs text-zinc-500 mb-1">
														Document Metadata
													</div>
													<div className="rounded border border-zinc-200 dark:border-zinc-800 p-2 text-xs space-y-1">
														<MetaRow
															label="Collection"
															value={od?.collection}
															code
														/>
														<MetaRow label="Title" value={od?.title} />
														<MetaRow label="Author" value={od?.author} />
														<MetaRow label="Source" value={od?.source} />
														<MetaRow
															label="Published"
															value={formatDate(od?.published_at)}
														/>
														<MetaRow
															label="URL"
															value={
																od?.url ? (
																	<a
																		href={od.url}
																		target="_blank"
																		rel="noreferrer"
																		className="underline break-all"
																	>
																		{od.url}
																	</a>
																) : undefined
															}
														/>
													</div>
												</div>

												{/* Page content */}
												<div className="md:col-span-2">
													<div className="text-xs text-zinc-500 mb-1">
														Page Content
													</div>
													<div className="text-sm rounded border border-zinc-200 dark:border-zinc-800 p-2 whitespace-pre-wrap max-h-48 overflow-auto">
														{content || (
															<span className="text-zinc-500 italic">—</span>
														)}
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

/* ---------------- Other Tool Calls ---------------- */

function OtherToolsList({ calls }: { calls: any[] }) {
	if (!calls?.length) {
		return (
			<div className="text-sm text-zinc-500">No other tool calls recorded.</div>
		);
	}
	return (
		<div className="space-y-3">
			{calls.map((c, idx) => (
				<div
					key={idx}
					className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3"
				>
					<div className="text-sm font-medium mb-2">
						{c.tool_name || c.name || "Tool Call"}
					</div>
					<pre className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 overflow-auto">
						{safeJson(c)}
					</pre>
				</div>
			))}
		</div>
	);
}

/* ---------------- helpers ---------------- */

function InfoBox({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<div className="text-xs text-zinc-500 mb-1">{label}</div>
			<div className="rounded border border-zinc-200 dark:border-zinc-800 p-2">
				{children}
			</div>
		</div>
	);
}

function MetaRow({
	label,
	value,
	code = false,
}: {
	label: string;
	value?: React.ReactNode;
	code?: boolean;
}) {
	return (
		<div className="flex gap-2">
			<div className="min-w-[78px] text-zinc-500">{label}:</div>
			<div className="flex-1 break-words">
				{value === undefined || value === null || value === "" ? (
					<span className="text-zinc-400">—</span>
				) : code ? (
					<code>{value as any}</code>
				) : (
					value
				)}
			</div>
		</div>
	);
}

function formatDate(iso?: string) {
	if (!iso) return undefined;
	const d = new Date(iso);
	return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function renderMetricValue(m: MetricResult) {
	if (m.value === null || m.value === undefined) {
		return m.passed === undefined ? "—" : m.passed ? "✅" : "❌";
	}
	if (typeof m.value === "number") {
		const v = m.value;
		if (Math.abs(v) >= 100) return v.toFixed(0);
		if (Math.abs(v) >= 10) return v.toFixed(1);
		return v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
	}
	if (typeof m.value === "boolean") {
		return m.value ? "✅" : "❌";
	}
	return String(m.value);
}

function truncate(s: string, n: number) {
	if (!s) return "";
	return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function fmtTime(t: any) {
	try {
		const d = new Date(t);
		if (isNaN(d.getTime())) return String(t);
		return d.toLocaleString();
	} catch {
		return String(t ?? "");
	}
}

function safeText(v: any): string | null {
	if (v === null || v === undefined) return null;
	if (typeof v === "string") return v;
	try {
		return JSON.stringify(v, null, 2);
	} catch {
		return String(v);
	}
}

function extractMessageContent(content: any): string | null {
	if (content == null) return null;
	if (typeof content === "string") return content;
	// LangChain messages sometimes store content as list of parts
	if (Array.isArray(content)) {
		// join string-like parts
		const parts = content.map((p) => {
			if (typeof p === "string") return p;
			if (p?.text) return String(p.text);
			if (p?.content) return String(p.content);
			return JSON.stringify(p);
		});
		return parts.join("\n");
	}
	if (typeof content === "object") {
		if (content.text) return String(content.text);
		if (content.content) return String(content.content);
	}
	try {
		return JSON.stringify(content, null, 2);
	} catch {
		return String(content);
	}
}

function safeJson(obj: any): string {
	try {
		return JSON.stringify(obj, null, 2);
	} catch {
		return String(obj);
	}
}
