import { z } from 'zod';

/**
 * Task domain — shared by the Convex backend (server-side enforcement) and all
 * three app shells (form validation, display helpers). No UI, no framework.
 */

export const TASK_TITLE_MAX = 200;

/** Single source of truth for what a valid task title is. */
export const taskTitleSchema = z
	.string()
	.trim()
	.min(1, 'Title is required')
	.max(TASK_TITLE_MAX, `Title must be ${TASK_TITLE_MAX} characters or fewer`);

/** Shape of a task as returned by the backend `tasks.list` query. */
export interface Task {
	_id: string;
	_creationTime: number;
	userId: string;
	title: string;
	completed: boolean;
	updatedAt: number;
}

export interface TaskValidationResult {
	ok: boolean;
	value?: string;
	error?: string;
}

/** Validate + normalize a title for create/edit forms. */
export function validateTaskTitle(raw: string): TaskValidationResult {
	const parsed = taskTitleSchema.safeParse(raw);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid title' };
	}
	return { ok: true, value: parsed.data };
}

/** Open tasks first, newest first within each group (stable demo ordering). */
export function sortTasks<T extends Pick<Task, 'completed' | '_creationTime'>>(tasks: T[]): T[] {
	return [...tasks].sort((a, b) => {
		if (a.completed !== b.completed) return a.completed ? 1 : -1;
		return b._creationTime - a._creationTime;
	});
}

export function openCount(tasks: Pick<Task, 'completed'>[]): number {
	return tasks.filter((t) => !t.completed).length;
}
