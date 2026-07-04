<script lang="ts" generics="T extends { _id: string; title: string; completed: boolean }">
	import { AlertDialog, Button, Checkbox, IconTrash } from '@svelocity/ui';

	interface Props {
		task: T;
		onToggle: (task: T, completed: boolean) => void;
		onDelete: (task: T) => Promise<void>;
	}

	let { task, onToggle, onDelete }: Props = $props();

	let confirmOpen = $state(false);
</script>

<li class="task-item" class:task-item--done={task.completed}>
	<Checkbox
		checked={task.completed}
		ariaLabel={`Mark "${task.title}" ${task.completed ? 'incomplete' : 'complete'}`}
		onCheckedChange={(checked) => onToggle(task, checked)}
	/>
	<span class="task-item__title">{task.title}</span>
	<Button
		variant="ghost"
		size="sm"
		aria-label={`Delete "${task.title}"`}
		onclick={() => (confirmOpen = true)}
	>
		<IconTrash size={16} />
	</Button>
</li>

<AlertDialog
	bind:open={confirmOpen}
	title="Delete task?"
	description={`"${task.title}" will be permanently removed.`}
	onConfirm={() => onDelete(task)}
/>

<style>
	.task-item {
		display: flex;
		align-items: center;
		gap: var(--sv-space-3);
		padding: var(--sv-space-2) var(--sv-space-3);
		border-bottom: 1px solid var(--sv-color-border);
	}
	.task-item:last-child {
		border-bottom: none;
	}
	.task-item__title {
		flex: 1;
		color: var(--sv-color-text);
		overflow-wrap: anywhere;
	}
	.task-item--done .task-item__title {
		color: var(--sv-color-text-muted);
		text-decoration: line-through;
	}
</style>
