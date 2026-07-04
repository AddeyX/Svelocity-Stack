<script lang="ts">
	import { validateTaskTitle } from '@svelocity/app-core';
	import { Button, IconPlus, Input } from '@svelocity/ui';

	interface Props {
		/** Called with a validated, trimmed title. Resolves when the mutation lands. */
		onCreate: (title: string) => Promise<void>;
	}

	let { onCreate }: Props = $props();

	let title = $state('');
	let error = $state('');
	let busy = $state(false);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const result = validateTaskTitle(title);
		if (!result.ok) {
			error = result.error ?? 'Invalid title';
			return;
		}
		error = '';
		busy = true;
		try {
			await onCreate(result.value!);
			title = '';
		} finally {
			busy = false;
		}
	}
</script>

<form class="task-form" onsubmit={submit}>
	<div class="task-form__row">
		<Input
			bind:value={title}
			placeholder="What needs doing?"
			aria-label="New task title"
			error={Boolean(error)}
			disabled={busy}
		/>
		<Button type="submit" loading={busy} aria-label="Add task">
			<IconPlus size={16} /> Add
		</Button>
	</div>
	{#if error}
		<p class="task-form__error" role="alert">{error}</p>
	{/if}
</form>

<style>
	.task-form__row {
		display: flex;
		gap: var(--sv-space-2);
	}
	.task-form__error {
		margin: var(--sv-space-1) 0 0;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-danger);
	}
</style>
