<script lang="ts">
	import { goto } from '$app/navigation';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '@svelocity/backend';
	import { getAuthState, sessionState } from '@svelocity/auth';
	import { openCount, sortTasks } from '@svelocity/app-core';
	import type { Doc } from '@svelocity/backend/dataModel';

	type TaskDoc = Doc<'tasks'>;
	import {
		Badge,
		Card,
		Container,
		EmptyState,
		ErrorState,
		LoadingState,
		Stack,
		toast,
		UnauthorizedState
	} from '@svelocity/ui';
	import TaskHeader from '$lib/components/TaskHeader.svelte';
	import TaskForm from '$lib/components/TaskForm.svelte';
	import TaskItem from '$lib/components/TaskItem.svelte';

	const auth = getAuthState();
	const client = useConvexClient();

	const session = $derived(sessionState(auth));

	const me = useQuery(api.users.me, () => (auth.isAuthenticated ? {} : 'skip'));
	const tasks = useQuery(api.tasks.list, () => (auth.isAuthenticated ? {} : 'skip'));

	const sorted = $derived(sortTasks(tasks.data ?? []));
	const remaining = $derived(openCount(tasks.data ?? []));

	async function createTask(title: string) {
		await client.mutation(api.tasks.create, { title });
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

<svelte:head>
	<title>Tasks — Shared Tasks</title>
</svelte:head>

{#if session === 'loading'}
	<LoadingState message="Checking your session…" />
{:else if session === 'unauthenticated'}
	<UnauthorizedState onSignIn={() => goto('/login')} />
{:else}
	<TaskHeader userLabel={me.data?.email ?? me.data?.name ?? 'Account'} platform="Web" />
	<main class="tasks-main">
		<Container size="sm">
			<Stack gap={5}>
				<TaskForm onCreate={createTask} />

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
						description="Add your first task above — it syncs live to every device."
					>
						{#snippet icon()}📋{/snippet}
					</EmptyState>
				{:else}
					<Card>
						<ul class="task-list">
							{#each sorted as task (task._id)}
								<TaskItem {task} onToggle={toggleTask} onDelete={deleteTask} />
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
{/if}

<style>
	.tasks-main {
		padding: var(--sv-space-6) 0 var(--sv-space-16);
	}
	.task-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.task-count {
		display: flex;
		justify-content: flex-end;
	}
</style>
