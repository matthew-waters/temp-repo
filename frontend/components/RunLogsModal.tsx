"use client";

import React from "react";
import {
	X,
	Download,
	Clipboard,
	CheckCircle2,
	AlertTriangle,
	Loader2,
} from "lucide-react";
import type { LogEvent } from "../lib/api";
import { openLogsStream, getJobStatus } from "../lib/api";

type Props = {
	jobId: string;
	name?: string;
	onClose: () => void;
};

export default function RunLogsModal({ jobId, name, onClose }: Props) {
	const [events, setEvents] = React.useState<LogEvent[]>([]);
	const [status, setStatus] = React.useState<
		"queued" | "running" | "completed" | "failed"
	>("running");
	const [resultPath, setResultPath] = React.useState<string | undefined>(
		undefined
	);
	const [copied, setCopied] = React.useState(false);
	const logEndRef = React.useRef<HTMLDivElement | null>(null);

	// Auto-scroll to bottom
	React.useEffect(() => {
		logEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [events]);

	// Open SSE stream
	React.useEffect(() => {
		let es: EventSource | null = openLogsStream(jobId);
		setStatus("running");

		const onMessage = (e: MessageEvent) => {
			try {
				const data = JSON.parse(e.data) as LogEvent;
				setEvents((prev) => [...prev, data]);

				if (data.type === "complete") {
					setResultPath(data.result_path);
					setStatus("completed");
					es?.close();
				} else if (data.type === "error") {
					setStatus("failed");
					es?.close();
				}
			} catch {
				// Non-JSON line; wrap it as a log
				setEvents((prev) => [
					...prev,
					{
						type: "log",
						timestamp: new Date().toISOString(),
						message: String(e.data),
					},
				]);
			}
		};

		const onError = () => {
			// fall back to polling status when SSE ends unexpectedly
			// (only if not already completed/failed)
			if (status === "running") pollStatus();
		};

		es.onmessage = onMessage;
		es.onerror = onError;

		const pollStatus = async () => {
			try {
				const s = await getJobStatus(jobId);
				setStatus(s.status);
				if (s.result_path) setResultPath(s.result_path);
			} catch {
				// ignore
			}
		};

		return () => {
			es?.close();
			es = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jobId]);

	const allText = React.useMemo(() => {
		return events
			.map((e) => {
				if (e.type === "log") return `[${e.timestamp}] ${e.message}`;
				if (e.type === "complete")
					return `[${e.timestamp}] ✅ complete: ${e.result_path}`;
				if (e.type === "error") return `[${e.timestamp}] ❌ error: ${e.error}`;
				if (e.type === "heartbeat") return `[${e.ts}] …`;
				return "";
			})
			.join("\n");
	}, [events]);

	const copyLogs = async () => {
		try {
			await navigator.clipboard.writeText(allText);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch (e) {
			console.error(e);
		}
	};

	const downloadLogs = () => {
		const blob = new Blob([allText], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		const nm = (name || "experiment").replace(/\s+/g, "-").toLowerCase();
		a.download = `${nm}-${jobId}-logs.txt`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const StatusPill = () => {
		if (status === "completed")
			return (
				<span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
					<CheckCircle2 size={14} /> completed
				</span>
			);
		if (status === "failed")
			return (
				<span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs">
					<AlertTriangle size={14} /> failed
				</span>
			);
		return (
			<span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full text-xs">
				<Loader2 size={14} className="animate-spin" /> running
			</span>
		);
	};

	return (
		<div className="fixed inset-0 z-[100]">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			{/* Modal */}
			<div className="absolute inset-0 grid place-items-center p-4">
				<div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
						<div className="min-w-0">
							<div className="font-medium truncate">
								{name || "Experiment"}{" "}
								<span className="text-zinc-400">({jobId})</span>
							</div>
							<div className="mt-1">
								<StatusPill />
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
							aria-label="Close"
							title="Close"
						>
							<X size={18} />
						</button>
					</div>

					{/* Logs */}
					<div className="max-h-[60vh] overflow-auto px-4 py-3 font-mono text-xs whitespace-pre-wrap">
						{events.length === 0 ? (
							<div className="text-zinc-500">Waiting for logs…</div>
						) : (
							events.map((e, idx) => {
								if (e.type === "log")
									return (
										<div key={idx} className="leading-5">
											<span className="text-zinc-400">
												[{new Date(e.timestamp).toLocaleTimeString()}]
											</span>{" "}
											{e.message}
										</div>
									);
								if (e.type === "complete")
									return (
										<div key={idx} className="leading-5 text-emerald-700">
											[{new Date(e.timestamp).toLocaleTimeString()}] ✅ complete
											→ {e.result_path}
										</div>
									);
								if (e.type === "error")
									return (
										<div key={idx} className="leading-5 text-red-700">
											[{new Date(e.timestamp).toLocaleTimeString()}] ❌{" "}
											{e.error}
										</div>
									);
								if (e.type === "heartbeat")
									return (
										<div key={idx} className="leading-5 text-zinc-400">
											[{new Date(e.ts).toLocaleTimeString()}] …
										</div>
									);
								return null;
							})
						)}
						<div ref={logEndRef} />
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
						<div className="text-xs text-zinc-500">
							{resultPath ? (
								<>
									Results: <code>{resultPath}</code>
								</>
							) : (
								"Streaming logs…"
							)}
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={copyLogs}
								className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
								title="Copy logs"
							>
								{copied ? <CheckCircle2 size={14} /> : <Clipboard size={14} />}
								{copied ? "Copied" : "Copy"}
							</button>
							<button
								type="button"
								onClick={downloadLogs}
								className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
								title="Download logs"
							>
								<Download size={14} />
								Download
							</button>
							<button
								type="button"
								onClick={onClose}
								className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
