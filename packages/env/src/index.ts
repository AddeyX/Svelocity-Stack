import { z } from 'zod';

/**
 * Client-side env shared by all three app shells.
 * Values arrive via Vite's `import.meta.env` (must be prefixed PUBLIC_ / VITE_).
 */
export const clientEnvSchema = z.object({
	PUBLIC_CONVEX_URL: z
		.string()
		.url()
		.refine(
			(u) =>
				u.startsWith('https://') ||
				u.startsWith('http://localhost') ||
				u.startsWith('http://127.0.0.1'),
			{ message: 'PUBLIC_CONVEX_URL must be https (or localhost/127.0.0.1 in dev)' }
		)
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Parse and validate client env. Throws with a readable message listing every
 * problem — call once at app startup so misconfiguration fails fast and loud.
 */
export function parseClientEnv(raw: Record<string, unknown>): ClientEnv {
	const result = clientEnvSchema.safeParse(raw);
	if (!result.success) {
		const details = result.error.issues
			.map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
			.join('\n');
		throw new Error(
			`[svelocity/env] Invalid environment:\n${details}\n` +
				`Copy .env.example to .env.local and fill in the values.`
		);
	}
	return result.data;
}
