import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LoadingState from './LoadingState.svelte';
import EmptyState from './EmptyState.svelte';
import ErrorState from './ErrorState.svelte';
import UnauthorizedState from './UnauthorizedState.svelte';

describe('application states', () => {
	it('LoadingState announces loading', () => {
		render(LoadingState, { props: { message: 'Fetching tasks' } });
		expect(screen.getByRole('status')).toBeTruthy();
		expect(screen.getByText('Fetching tasks')).toBeTruthy();
	});

	it('EmptyState shows title and description', () => {
		render(EmptyState, {
			props: { title: 'No tasks yet', description: 'Create your first task.' }
		});
		expect(screen.getByRole('heading', { name: 'No tasks yet' })).toBeTruthy();
		expect(screen.getByText('Create your first task.')).toBeTruthy();
	});

	it('ErrorState is an alert and retries', () => {
		const onRetry = vi.fn();
		render(ErrorState, { props: { message: 'Network down', onRetry } });
		expect(screen.getByRole('alert')).toBeTruthy();
		screen.getByRole('button', { name: 'Try again' }).click();
		expect(onRetry).toHaveBeenCalledOnce();
	});

	it('UnauthorizedState offers sign in', () => {
		const onSignIn = vi.fn();
		render(UnauthorizedState, { props: { onSignIn } });
		screen.getByRole('button', { name: 'Sign in' }).click();
		expect(onSignIn).toHaveBeenCalledOnce();
	});
});
