export const MIN_NODE = 22;
export const MIN_PNPM = 10;

export function parseMajor(version: string): number | null {
	const match = /^v?(\d+)\./.exec(version.trim());
	return match ? Number(match[1]) : null;
}

export function satisfiesMin(version: string, minMajor: number): boolean {
	const major = parseMajor(version);
	return major !== null && major >= minMajor;
}
