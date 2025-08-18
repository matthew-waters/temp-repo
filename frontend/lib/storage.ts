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

export function saveNew({
	name,
	config,
}: {
	name: string;
	config: ExperimentConfig;
}): SavedConfig {
	const all = listConfigs();
	const normalized = (s: string) => s.trim().toLowerCase();

	if (all.some((c) => normalized(c.name) === normalized(name))) {
		throw new Error(
			`An experiment named "${name}" already exists. Names must be unique.`
		);
	}

	const now = new Date().toISOString();
	const item: SavedConfig = {
		id: crypto.randomUUID(),
		name,
		config,
		createdAt: now,
		updatedAt: now,
	};
	// ...persist `item` to local storage and return it...
	return item;
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
