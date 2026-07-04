<script lang="ts">
	import {
		Alert,
		AlertDialog,
		Avatar,
		Badge,
		Button,
		Card,
		Checkbox,
		Container,
		Dialog,
		DropdownMenu,
		EmptyState,
		ErrorState,
		FormField,
		Input,
		LoadingState,
		NavLink,
		Separator,
		Skeleton,
		Spinner,
		Stack,
		Tabs,
		Textarea,
		Toaster,
		UnauthorizedState,
		toast,
		IconMore,
		IconPlus
	} from '../src/index.js';
	import { applyTheme, type Theme } from '@svelocity/theme';

	let theme = $state<Theme>('light');
	let dialogOpen = $state(false);
	let confirmOpen = $state(false);
	let checked = $state(true);
	let inputValue = $state('');
	let notes = $state('');
	let tabValue = $state('tokens');

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		applyTheme(theme);
	}

	const swatches = [
		'bg',
		'surface',
		'surface-sunken',
		'border',
		'text',
		'text-muted',
		'primary',
		'primary-soft',
		'success',
		'warning',
		'danger',
		'info'
	];
</script>

<Container size="lg">
	<Stack gap={8}>
		<header class="preview-header">
			<h1>Svelocity UI</h1>
			<Button variant="secondary" size="sm" onclick={toggleTheme}>Theme: {theme}</Button>
		</header>

		<Tabs
			items={[
				{ value: 'tokens', label: 'Tokens' },
				{ value: 'controls', label: 'Controls' },
				{ value: 'feedback', label: 'Feedback' },
				{ value: 'overlays', label: 'Overlays' },
				{ value: 'states', label: 'States' }
			]}
			bind:value={tabValue}
		>
			{#snippet panel(active)}
				{#if active === 'tokens'}
					<div class="swatch-grid">
						{#each swatches as name (name)}
							<div class="swatch">
								<div class="swatch__chip" style="background: var(--sv-color-{name})"></div>
								<code>--sv-color-{name}</code>
							</div>
						{/each}
					</div>
				{:else if active === 'controls'}
					<Stack gap={6}>
						<Stack gap={3} direction="horizontal" align="center">
							<Button>Primary</Button>
							<Button variant="secondary">Secondary</Button>
							<Button variant="ghost">Ghost</Button>
							<Button variant="destructive">Destructive</Button>
							<Button loading>Loading</Button>
							<Button disabled>Disabled</Button>
						</Stack>
						<Stack gap={3} direction="horizontal" align="center">
							<Button size="sm">Small</Button>
							<Button size="md">Medium</Button>
							<Button size="lg"><IconPlus size={16} /> Large</Button>
						</Stack>
						<Separator />
						<FormField label="Task title" hint="Keep it short.">
							{#snippet children({ id, describedBy, invalid })}
								<Input
									{id}
									aria-describedby={describedBy}
									error={invalid}
									placeholder="e.g. Ship Phase 2"
									bind:value={inputValue}
								/>
							{/snippet}
						</FormField>
						<FormField label="With error" error="This field is required.">
							{#snippet children({ id, describedBy, invalid })}
								<Input {id} aria-describedby={describedBy} error={invalid} />
							{/snippet}
						</FormField>
						<FormField label="Notes">
							{#snippet children({ id })}
								<Textarea {id} bind:value={notes} placeholder="Anything else…" />
							{/snippet}
						</FormField>
						<Checkbox label="Mark complete" bind:checked />
					</Stack>
				{:else if active === 'feedback'}
					<Stack gap={4}>
						<Alert variant="info" title="Heads up">Info alert body copy.</Alert>
						<Alert variant="success" title="Saved">All changes synced.</Alert>
						<Alert variant="warning" title="Careful">This might bite.</Alert>
						<Alert variant="error" title="Failed">Mutation rejected by server.</Alert>
						<Stack gap={3} direction="horizontal" align="center">
							<Badge>Neutral</Badge>
							<Badge variant="primary">Primary</Badge>
							<Badge variant="success">Done</Badge>
							<Badge variant="warning">Pending</Badge>
							<Badge variant="danger">Blocked</Badge>
						</Stack>
						<Stack gap={3} direction="horizontal" align="center">
							<Spinner size="sm" />
							<Spinner />
							<Spinner size="lg" />
							<Avatar name="Emmanuel Addey" />
							<Avatar name="Ada Lovelace" size="lg" />
						</Stack>
						<Stack gap={2}>
							<Skeleton width="40%" />
							<Skeleton />
							<Skeleton width="60%" />
						</Stack>
						<Stack gap={3} direction="horizontal">
							<Button variant="secondary" onclick={() => toast.success('Task created')}>
								Success toast
							</Button>
							<Button variant="secondary" onclick={() => toast.error('Sync failed')}>
								Error toast
							</Button>
						</Stack>
					</Stack>
				{:else if active === 'overlays'}
					<Stack gap={4} direction="horizontal" align="center">
						<Button onclick={() => (dialogOpen = true)}>Open dialog</Button>
						<Button variant="destructive" onclick={() => (confirmOpen = true)}>
							Confirm delete
						</Button>
						<DropdownMenu
							triggerLabel="Task actions"
							items={[
								{ label: 'Edit', onSelect: () => toast.info('Edit') },
								{ label: 'Duplicate', onSelect: () => toast.info('Duplicate') },
								{
									label: 'Delete',
									danger: true,
									separatorBefore: true,
									onSelect: () => toast.error('Deleted')
								}
							]}
						>
							{#snippet trigger()}
								<IconMore size={18} />
							{/snippet}
						</DropdownMenu>
						<NavLink href="#tokens" active>Active link</NavLink>
						<NavLink href="#tokens">Idle link</NavLink>
					</Stack>
				{:else if active === 'states'}
					<Stack gap={6}>
						<Card>
							{#snippet header()}<strong>LoadingState</strong>{/snippet}
							<LoadingState message="Fetching tasks…" />
						</Card>
						<Card>
							{#snippet header()}<strong>EmptyState</strong>{/snippet}
							<EmptyState title="No tasks yet" description="Create your first task to get going.">
								{#snippet icon()}📋{/snippet}
								{#snippet action()}
									<Button><IconPlus size={16} /> New task</Button>
								{/snippet}
							</EmptyState>
						</Card>
						<Card>
							{#snippet header()}<strong>ErrorState</strong>{/snippet}
							<ErrorState message="Convex unreachable." onRetry={() => toast.info('Retrying…')} />
						</Card>
						<Card>
							{#snippet header()}<strong>UnauthorizedState</strong>{/snippet}
							<UnauthorizedState onSignIn={() => toast.info('Off to login')} />
						</Card>
					</Stack>
				{/if}
			{/snippet}
		</Tabs>
	</Stack>
</Container>

<Dialog bind:open={dialogOpen} title="Edit task" description="Change the title and save.">
	<FormField label="Title">
		{#snippet children({ id })}
			<Input {id} value="Ship Phase 2" />
		{/snippet}
	</FormField>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (dialogOpen = false)}>Cancel</Button>
		<Button
			onclick={() => {
				dialogOpen = false;
				toast.success('Saved');
			}}
		>
			Save
		</Button>
	{/snippet}
</Dialog>

<AlertDialog
	bind:open={confirmOpen}
	title="Delete task?"
	description="This permanently removes the task. There is no undo."
	onConfirm={() => {
		toast.error('Deleted');
	}}
/>

<Toaster />

<style>
	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: var(--sv-space-6);
	}
	.preview-header h1 {
		margin: 0;
		font-size: var(--sv-text-2xl);
	}
	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
		gap: var(--sv-space-3);
	}
	.swatch {
		display: flex;
		align-items: center;
		gap: var(--sv-space-2);
	}
	.swatch__chip {
		width: 2rem;
		height: 2rem;
		border-radius: var(--sv-radius-sm);
		border: 1px solid var(--sv-color-border);
		flex-shrink: 0;
	}
	.swatch code {
		font-size: var(--sv-text-xs);
		color: var(--sv-color-text-muted);
	}
</style>
