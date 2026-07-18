import { describe, expect, it, vi } from 'vitest';
import { attemptTaskCreation } from './task-creation.js';

describe('attemptTaskCreation', () => {
	it('rejects invalid input without calling mutation', async () => {
		const mutate = vi.fn();

		const result = await attemptTaskCreation('   ', mutate);

		expect(result).toEqual({ ok: false, error: 'Title is required' });
		expect(mutate).not.toHaveBeenCalled();
	});

	it('normalizes valid input before mutation', async () => {
		const mutate = vi.fn().mockResolvedValue(undefined);

		const result = await attemptTaskCreation('  Ship V1  ', mutate);

		expect(mutate).toHaveBeenCalledWith('Ship V1');
		expect(result).toEqual({ ok: true, title: 'Ship V1' });
	});

	it('retains normalized title when mutation fails', async () => {
		const mutate = vi.fn().mockRejectedValue(new Error('Network down'));

		const result = await attemptTaskCreation('  Retry me  ', mutate);

		expect(result).toEqual({
			ok: false,
			error: 'Could not create the task.',
			pendingTitle: 'Retry me'
		});
	});

	it('supports retrying retained title', async () => {
		const mutate = vi
			.fn()
			.mockRejectedValueOnce(new Error('Network down'))
			.mockResolvedValueOnce(undefined);

		const first = await attemptTaskCreation('Retry me', mutate);
		expect(first.ok).toBe(false);
		if (first.ok || !first.pendingTitle) throw new Error('Expected retained title');

		const second = await attemptTaskCreation(first.pendingTitle, mutate);

		expect(second).toEqual({ ok: true, title: 'Retry me' });
		expect(mutate).toHaveBeenCalledTimes(2);
	});
});
