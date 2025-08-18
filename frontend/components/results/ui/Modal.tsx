"use client";

import React from "react";

type ModalProps = {
	open: boolean;
	title?: React.ReactNode;
	onClose: () => void;
	children: React.ReactNode;
	footer?: React.ReactNode;
};

export default function Modal({
	open,
	title,
	onClose,
	children,
	footer,
}: ModalProps) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-[100]">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="absolute inset-0 grid place-items-center p-4">
				<div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
					<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
						<div className="font-semibold">{title}</div>
						<button
							type="button"
							onClick={onClose}
							className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
						>
							Close
						</button>
					</div>
					<div className="p-4 max-h-[70vh] overflow-auto">{children}</div>
					{footer && (
						<div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
							{footer}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
