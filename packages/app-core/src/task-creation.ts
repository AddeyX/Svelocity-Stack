import { validateTaskTitle } from './tasks.js';

export type TaskCreationResult =
	{ ok: true; title: string } | { ok: false; error: string; pendingTitle?: string };

/**
 * Validate and attempt one task creation.
 *
 * Mutation failures keep the normalized title so any shell can offer an exact retry
 * without duplicating business rules or retaining invalid input.
 */
export async function attemptTaskCreation(
	rawTitle: string,
	mutate: (title: string) => Promise<unknown>
): Promise<TaskCreationResult> {
	const validation = validateTaskTitle(rawTitle);
	if (!validation.ok || validation.value === undefined) {
		return { ok: false, error: validation.error ?? 'Invalid title' };
	}

	try {
		await mutate(validation.value);
		return { ok: true, title: validation.value };
	} catch {
		return {
			ok: false,
			error: 'Could not create the task.',
			pendingTitle: validation.value
		};
	}
}
