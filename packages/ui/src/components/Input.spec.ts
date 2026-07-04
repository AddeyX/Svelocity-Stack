import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Input from './Input.svelte';

describe('Input', () => {
	it('binds typed value', async () => {
		const user = userEvent.setup();
		render(Input, { props: { placeholder: 'Title' } });
		const input = screen.getByPlaceholderText<HTMLInputElement>('Title');
		await user.type(input, 'Buy milk');
		expect(input.value).toBe('Buy milk');
	});

	it('shows error state via aria-invalid and class', () => {
		render(Input, { props: { error: true, placeholder: 'Email' } });
		const input = screen.getByPlaceholderText('Email');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.className).toContain('sv-input--error');
	});

	it('respects disabled', () => {
		render(Input, { props: { disabled: true, placeholder: 'Nope' } });
		expect(screen.getByPlaceholderText('Nope')).toHaveProperty('disabled', true);
	});
});
