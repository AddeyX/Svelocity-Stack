/** Only ever hand off http(s) links to the OS browser. */
export function isSafeExternalUrl(raw: string): boolean {
	try {
		const url = new URL(raw);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}
