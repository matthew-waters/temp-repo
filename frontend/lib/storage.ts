import type { SavedConfig } from "./types";

const KEY = "agentlab.configs.v1";

function readAll(): SavedConfig[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as SavedConfig[]) : [];
	} catch {
		return [];
	}
}

function writeAll(items: SavedConfig[]) {
	if (typeof window === "undefined") return;
	localStorage.setItem(KEY, JSON.stringify(items));
}

export function listConfigs(): SavedConfig[] {
	return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getConfig(id: string): SavedConfig | undefined {
	return readAll().find((c) => c.id === id);
}

export function saveNew(
	item: Omit<SavedConfig, "id" | "createdAt" | "updatedAt">
): SavedConfig {
	const now = new Date().toISOString();
	const newItem: SavedConfig = {
		...item,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
	};
	const all = readAll();
	all.push(newItem);
	writeAll(all);
	return newItem;
}

export function updateConfig(
	id: string,
	patch: Partial<SavedConfig>
): SavedConfig | undefined {
	const all = readAll();
	const idx = all.findIndex((c) => c.id === id);
	if (idx === -1) return undefined;
	const now = new Date().toISOString();
	all[idx] = { ...all[idx], ...patch, updatedAt: now };
	writeAll(all);
	return all[idx];
}

export function deleteConfig(id: string) {
	const next = readAll().filter((c) => c.id !== id);
	writeAll(next);
}
