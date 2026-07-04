<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '@svelocity/backend';
	import type { Doc } from '@svelocity/backend/dataModel';
	import { getAuthState, sessionState } from '@svelocity/auth';
	import { openCount, sortTasks, validateTaskTitle } from '@svelocity/app-core';
	import {
		AlertDialog,
		Avatar,
		Badge,
		Button,
		Card,
		Checkbox,
		Container,
		DropdownMenu,
		EmptyState,
		ErrorState,
		IconMore,
		IconPlus,
		IconTrash,
		Input,
		LoadingState,
		Stack,
		toast,
		UnauthorizedState
	} from '@svelocity/ui';
	import { navigate } from '../lib/router.svelte.js';

	type TaskDoc = Doc<'tasks'>;

	const auth = getAuthState();
	const client = useConvexClient();

	const session = $derived(sessionState(auth));
	const me = useQuery(api.users.me, () => (auth.isAuthenticated ? {} : 'skip'));
	const tasks = useQuery(api.tasks.list, () => (auth.isAuthenticated ? {} : 'skip'));

	const sorted = $derived(sortTasks(tasks.data ?? []));
	const remaining = $derived(openCount(tasks.data ?? []));

	let title = $state('');
	let formError = $state('');
	let busy = $state(false);
	let taskPendingDelete = $state<TaskDoc | null>(null);

	async function createTask(event: SubmitEvent) {
		event.preventDefault();
		const result = validateTaskTitle(title);
		if (!result.ok) {
			formError = result.error ?? 'Invalid title';
			return;
		}
		formError = '';
		busy = true;
		try {
			await client.mutation(api.tasks.create, { title: result.value! });
			title = '';
		} catch {
			toast.error('Could not create the task.');
		} finally {
			busy = false;
		}
	}

	function toggleTask(task: TaskDoc, completed: boolean) {
		client
			.mutation(api.tasks.setCompleted, { taskId: task._id, completed })
			.catch(() => toast.error('Could not update the task.'));
	}

	async function deleteTask(task: TaskDoc) {
		try {
			await client.mutation(api.tasks.remove, { taskId: task._id });
			toast.success('Task deleted');
		} catch {
			toast.error('Could not delete the task.');
		}
	}
</script>

{#if session === 'loading'}
	<LoadingState message="Checking your session…" />
{:else if session === 'unauthenticated'}
	<UnauthorizedState onSignIn={() => navigate('login')} />
{:else}
	<div class="shell">
		<header class="shell-header sv-titlebar">
			<Container size="sm">
				<div class="shell-header__row">
					<div class="shell-header__brand">
						<span aria-hidden="true">⚡</span>
						<strong>Shared Tasks</strong>
						<Badge variant="primary">Desktop</Badge>
					</div>
					<div class="shell-header__user">
						<span class="shell-header__email">{me.data?.email ?? 'Account'}</span>
						<Avatar name={me.data?.email ?? 'Account'} size="sm" />
						<DropdownMenu
							triggerLabel="Account menu"
							items={[{ label: 'Sign out', onSelect: () => void auth.signOut() }]}
						>
							{#snippet trigger()}
								<IconMore size={18} />
							{/snippet}
						</DropdownMenu>
					</div>
				</div>
			</Container>
		</header>

		<main class="shell-main">
			<Container size="sm">
				<Stack gap={5}>
					<form onsubmit={createTask}>
						<div class="task-form__row">
							<Input
								bind:value={title}
								placeholder="What needs doing?"
								aria-label="New task title"
								error={Boolean(formError)}
								disabled={busy}
							/>
							<Button type="submit" loading={busy} aria-label="Add task">
								<IconPlus size={16} /> Add
							</Button>
						</div>
						{#if formError}
							<p class="task-form__error" role="alert">{formError}</p>
						{/if}
					</form>

					{#if tasks.isLoading}
						<LoadingState message="Loading tasks…" />
					{:else if tasks.error}
						<ErrorState
							message="Could not load your tasks."
							onRetry={() => window.location.reload()}
						/>
					{:else if sorted.length === 0}
						<EmptyState
							title="No tasks yet"
							description="Add your first task above — it syncs live with web and mobile."
						>
							{#snippet icon()}📋{/snippet}
						</EmptyState>
					{:else}
						<Card>
							<ul class="task-list">
								{#each sorted as task (task._id)}
									<li class="task-item" class:task-item--done={task.completed}>
										<Checkbox
											checked={task.completed}
											ariaLabel={`Mark "${task.title}" ${task.completed ? 'incomplete' : 'complete'}`}
											onCheckedChange={(checked) => toggleTask(task, checked)}
										/>
										<span class="task-item__title">{task.title}</span>
										<Button
											variant="ghost"
											size="sm"
											aria-label={`Delete "${task.title}"`}
											onclick={() => (taskPendingDelete = task)}
										>
											<IconTrash size={16} />
										</Button>
									</li>
								{/each}
							</ul>
						</Card>
						<div class="task-count">
							<Badge>{remaining} open</Badge>
						</div>
					{/if}
				</Stack>
			</Container>
		</main>
	</div>
{/if}

<AlertDialog
	open={taskPendingDelete !== null}
	title="Delete task?"
	description={taskPendingDelete ? `"${taskPendingDelete.title}" will be permanently removed.` : ''}
	onConfirm={async () => {
		if (taskPendingDelete) await deleteTask(taskPendingDelete);
		taskPendingDelete = null;
	}}
	onOpenChange={(open) => {
		if (!open) taskPendingDelete = null;
	}}
/>

<style>
	.shell-header {
		position: sticky;
		top: 0;
		z-index: var(--sv-z-sticky);
		background: var(--sv-color-surface);
		border-bottom: 1px solid var(--sv-color-border);
	}
	.shell-header__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: var(--sv-titlebar-height, 3.5rem);
		gap: var(--sv-space-3);
	}
	.shell-header__brand {
		display: flex;
		align-items: center;
		gap: var(--sv-space-2);
		color: var(--sv-color-text);
	}
	.shell-header__user {
		display: flex;
		align-items: center;
		gap: var(--sv-space-2);
		min-width: 0;
	}
	.shell-header__email {
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.shell-main {
		padding: var(--sv-space-6) 0 var(--sv-space-16);
	}
	.task-form__row {
		display: flex;
		gap: var(--sv-space-2);
	}
	.task-form__error {
		margin: var(--sv-space-1) 0 0;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-danger);
	}
	.task-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
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
	.task-count {
		display: flex;
		justify-content: flex-end;
	}
</style>
