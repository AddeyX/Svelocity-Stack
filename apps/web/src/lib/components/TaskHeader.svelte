<script lang="ts">
	import { getAuthState } from '@svelocity/auth';
	import { Avatar, Badge, Container, DropdownMenu, IconMore } from '@svelocity/ui';

	interface Props {
		/** Signed-in user's email/name for the avatar + menu. */
		userLabel: string;
		/** Platform badge text (Web / Desktop / Mobile). */
		platform: string;
	}

	let { userLabel, platform }: Props = $props();

	const auth = getAuthState();
</script>

<header class="task-header">
	<Container size="sm">
		<div class="task-header__row">
			<div class="task-header__brand">
				<span aria-hidden="true">⚡</span>
				<strong>Shared Tasks</strong>
				<Badge variant="primary">{platform}</Badge>
			</div>
			<div class="task-header__user">
				<span class="task-header__email">{userLabel}</span>
				<Avatar name={userLabel} size="sm" />
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

<style>
	.task-header {
		position: sticky;
		top: 0;
		z-index: var(--sv-z-sticky);
		background: var(--sv-color-surface);
		border-bottom: 1px solid var(--sv-color-border);
	}
	.task-header__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 3.5rem;
		gap: var(--sv-space-3);
	}
	.task-header__brand {
		display: flex;
		align-items: center;
		gap: var(--sv-space-2);
		color: var(--sv-color-text);
	}
	.task-header__user {
		display: flex;
		align-items: center;
		gap: var(--sv-space-2);
		min-width: 0;
	}
	.task-header__email {
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	@media (max-width: 480px) {
		.task-header__email {
			display: none;
		}
	}
</style>
