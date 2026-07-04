import { existsSync, readdirSync, statSync } from 'node:fs';

export function targetDirProblem(path: string, label: string): string | undefined {
	if (!existsSync(path)) return undefined;
	if (!statSync(path).isDirectory()) {
		return `${label} already exists and is not a directory - pick a new name or remove it.`;
	}
	if (readdirSync(path).length > 0) {
		return `directory ${label} exists and is not empty - pick a new name or empty it.`;
	}
	return undefined;
}
