/** The three golden-path platforms. Deliberately a type + helper, not an abstraction layer (ADR 0003). */
export type Platform = 'web' | 'desktop' | 'mobile';

export function isPlatform(value: unknown): value is Platform {
	return value === 'web' || value === 'desktop' || value === 'mobile';
}
