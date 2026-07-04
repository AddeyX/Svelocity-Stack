<script lang="ts">
	import { Avatar } from 'bits-ui';

	interface Props {
		/** Image URL; falls back to initials. */
		src?: string;
		/** Person's display name — used for alt text and initials. */
		name: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { src, name, size = 'md', class: className = '' }: Props = $props();

	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('')
	);
</script>

<Avatar.Root class="sv-avatar sv-avatar--{size} {className}">
	{#if src}
		<Avatar.Image {src} alt={name} class="sv-avatar__image" />
	{/if}
	<Avatar.Fallback class="sv-avatar__fallback">{initials}</Avatar.Fallback>
</Avatar.Root>

<style>
	:global(.sv-avatar) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
		border-radius: var(--sv-radius-full);
		background: var(--sv-color-primary-soft);
	}
	:global(.sv-avatar--sm) {
		width: 1.75rem;
		height: 1.75rem;
		font-size: var(--sv-text-xs);
	}
	:global(.sv-avatar--md) {
		width: 2.25rem;
		height: 2.25rem;
		font-size: var(--sv-text-sm);
	}
	:global(.sv-avatar--lg) {
		width: 3rem;
		height: 3rem;
		font-size: var(--sv-text-md);
	}
	:global(.sv-avatar__image) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	:global(.sv-avatar__fallback) {
		font-weight: var(--sv-font-semibold);
		color: var(--sv-color-primary);
	}
</style>
