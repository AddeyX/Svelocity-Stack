/**
 * Minimal toast store — no dependency, token-styled, rendered by <Toaster />.
 *
 *   import { toast } from '@svelocity/ui';
 *   toast.success('Task created');
 *   toast.error('Something broke', { duration: 8000 });
 */

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastItem {
	id: number;
	message: string;
	variant: ToastVariant;
}

export interface ToastOptions {
	/** Auto-dismiss delay in ms. 0 disables auto-dismiss. Default 5000. */
	duration?: number;
}

let nextId = 0;
const items = $state<ToastItem[]>([]);
// Timer bookkeeping only — never read by the UI, so plain Map (not SvelteMap) is correct.
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function push(message: string, variant: ToastVariant, options: ToastOptions = {}): number {
	const id = ++nextId;
	items.push({ id, message, variant });
	const duration = options.duration ?? 5000;
	if (duration > 0) {
		timers.set(
			id,
			setTimeout(() => dismiss(id), duration)
		);
	}
	return id;
}

export function dismiss(id: number): void {
	const timer = timers.get(id);
	if (timer) {
		clearTimeout(timer);
		timers.delete(id);
	}
	const index = items.findIndex((t) => t.id === id);
	if (index !== -1) items.splice(index, 1);
}

export const toast = {
	info: (message: string, options?: ToastOptions) => push(message, 'info', options),
	success: (message: string, options?: ToastOptions) => push(message, 'success', options),
	error: (message: string, options?: ToastOptions) => push(message, 'error', options),
	dismiss,
	/** Reactive list consumed by <Toaster />. */
	get items() {
		return items;
	}
};
