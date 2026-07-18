import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Dialog from './Dialog.svelte';
import DialogTestHarness from './DialogTestHarness.svelte';

describe('Dialog', () => {
	it('renders title and description when open', async () => {
		const user = userEvent.setup();
		render(Dialog, {
			props: { open: true, title: 'Settings', description: 'Tune things.' }
		});
		await waitFor(() => {
			expect(screen.getByText('Settings')).toBeTruthy();
			expect(screen.getByText('Tune things.')).toBeTruthy();
		});
		await user.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByText('Settings')).toBeNull());
		await waitFor(() => expect(document.body.style.pointerEvents).not.toBe('none'));
	});

	it('closes on Escape', async () => {
		const user = userEvent.setup();
		render(Dialog, { props: { open: true, title: 'Closable' } });
		await waitFor(() => expect(screen.getByText('Closable')).toBeTruthy());
		await user.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByText('Closable')).toBeNull());
		await waitFor(() => expect(document.body.style.pointerEvents).not.toBe('none'));
	});

	it('renders nothing when closed', () => {
		render(Dialog, { props: { open: false, title: 'Hidden' } });
		expect(screen.queryByText('Hidden')).toBeNull();
	});

	it('moves focus into the dialog and returns it to the trigger after Escape', async () => {
		const user = userEvent.setup();
		render(DialogTestHarness);
		const trigger = screen.getByRole('button', { name: 'Open keyboard dialog' });

		await user.click(trigger);
		const dialog = await screen.findByRole('dialog', { name: 'Keyboard dialog' });
		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

		await user.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByText('Keyboard dialog')).toBeNull());
		expect(document.activeElement).toBe(trigger);
	});
});
