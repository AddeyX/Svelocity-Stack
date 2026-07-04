import { describe, expect, it } from 'vitest';
import { openCount, sortTasks, TASK_TITLE_MAX, validateTaskTitle } from './tasks.js';

describe('validateTaskTitle', () => {
	it('accepts and trims a normal title', () => {
		expect(validateTaskTitle('  Buy milk  ')).toEqual({ ok: true, value: 'Buy milk' });
	});

	it('rejects empty and whitespace-only titles', () => {
		expect(validateTaskTitle('').ok).toBe(false);
		expect(validateTaskTitle('   ').ok).toBe(false);
		expect(validateTaskTitle('   ').error).toMatch(/required/i);
	});

	it('rejects titles over the max length', () => {
		const result = validateTaskTitle('x'.repeat(TASK_TITLE_MAX + 1));
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/200/);
	});

	it('accepts a title exactly at the max length', () => {
		expect(validateTaskTitle('x'.repeat(TASK_TITLE_MAX)).ok).toBe(true);
	});
});

describe('sortTasks', () => {
	const task = (id: string, completed: boolean, t: number) => ({
		_id: id,
		completed,
		_creationTime: t
	});

	it('puts open tasks before completed, newest first within groups', () => {
		const sorted = sortTasks([
			task('done-old', true, 1),
			task('open-old', false, 2),
			task('done-new', true, 4),
			task('open-new', false, 3)
		]);
		expect(sorted.map((t) => t._id)).toEqual(['open-new', 'open-old', 'done-new', 'done-old']);
	});

	it('does not mutate the input array', () => {
		const input = [task('a', false, 1), task('b', false, 2)];
		sortTasks(input);
		expect(input[0]?._id).toBe('a');
	});
});

describe('openCount', () => {
	it('counts incomplete tasks', () => {
		expect(openCount([{ completed: false }, { completed: true }, { completed: false }])).toBe(2);
	});
});
