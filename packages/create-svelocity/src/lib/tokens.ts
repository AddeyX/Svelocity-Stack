export interface TokenMap {
	PROJECT_NAME: string;
	DISPLAY_NAME: string;
	APP_ID: string;
}

export function replaceTokens(content: string, tokens: TokenMap): string {
	let out = content;
	for (const [key, value] of Object.entries(tokens)) {
		out = out.replaceAll(`{{${key}}}`, value);
	}
	return out;
}

export function toDisplayName(name: string): string {
	return name
		.split(/[-_]+/)
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(' ');
}

export function toAppId(name: string): string {
	return `com.example.${name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
}

export function isValidAppId(id: string): boolean {
	return /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/.test(id);
}
