import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Dialog from './Dialog.svelte';

describe('Dialog', () => {
	it('renders title and description when open', async () => {
		render(Dialog, {
			props: { open: true, title: 'Settings', description: 'Tune things.' }
		});
		await waitFor(() => {
			expect(screen.getByText('Settings')).toBeTruthy();
			expect(screen.getByText('Tune things.')).toBeTruthy();
		});
	});

	it('closes on Escape', async () => {
		const user = userEvent.setup();
		render(Dialog, { props: { open: true, title: 'Closable' } });
		await waitFor(() => expect(screen.getByText('Closable')).toBeTruthy());
		await user.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByText('Closable')).toBeNull());
	});

	it('renders nothing when closed', () => {
		render(Dialog, { props: { open: false, title: 'Hidden' } });
		expect(screen.queryByText('Hidden')).toBeNull();
	});
});
