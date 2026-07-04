import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Button from './Button.svelte';

const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('Button', () => {
	it('renders children and handles click', async () => {
		const onclick = vi.fn();
		render(Button, { props: { onclick, children: label('Save') } });
		const button = screen.getByRole('button', { name: 'Save' });
		button.click();
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('defaults to type=button (no accidental form submit)', () => {
		render(Button, { props: { children: label('Go') } });
		expect(screen.getByRole('button')).toHaveProperty('type', 'button');
	});

	it('disables and marks busy while loading', () => {
		render(Button, { props: { loading: true, children: label('Sending') } });
		const button = screen.getByRole('button');
		expect(button).toHaveProperty('disabled', true);
		expect(button.getAttribute('aria-busy')).toBe('true');
	});

	it('applies variant and size classes', () => {
		render(Button, {
			props: { variant: 'destructive', size: 'lg', children: label('Delete') }
		});
		const button = screen.getByRole('button');
		expect(button.className).toContain('sv-btn--destructive');
		expect(button.className).toContain('sv-btn--lg');
	});
});
