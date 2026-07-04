<script lang="ts">
	import { getAuthState } from '@svelocity/auth';
	import { Alert, Button, Card, FormField, Input, Stack } from '@svelocity/ui';

	interface Props {
		flow: 'signIn' | 'signUp';
	}

	let { flow }: Props = $props();

	const auth = getAuthState();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let busy = $state(false);

	const heading = $derived(flow === 'signIn' ? 'Sign in' : 'Create your account');
	const cta = $derived(flow === 'signIn' ? 'Sign in' : 'Sign up');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		if (!email.trim() || !password) {
			error = 'Email and password are required.';
			return;
		}
		if (flow === 'signUp' && password.length < 8) {
			error = 'Password must be at least 8 characters.';
			return;
		}
		busy = true;
		try {
			const result = await auth.signIn({ email: email.trim(), password, flow });
			if (result.error) error = result.error;
			// Success: the layout guard sees isAuthenticated and routes to /tasks.
		} finally {
			busy = false;
		}
	}
</script>

<div class="auth-page">
	<Card class="auth-card">
		<Stack gap={5}>
			<div class="auth-brand">
				<span class="auth-brand__logo" aria-hidden="true">⚡</span>
				<h1 class="auth-brand__title">Shared Tasks</h1>
				<p class="auth-brand__subtitle">{heading}</p>
			</div>

			{#if error}
				<Alert variant="error" title={error} />
			{/if}

			<form onsubmit={submit} novalidate>
				<Stack gap={4}>
					<FormField label="Email">
						{#snippet children({ id, describedBy, invalid })}
							<Input
								{id}
								type="email"
								name="email"
								autocomplete="email"
								aria-describedby={describedBy}
								error={invalid}
								bind:value={email}
								placeholder="you@example.com"
							/>
						{/snippet}
					</FormField>
					<FormField
						label="Password"
						hint={flow === 'signUp' ? 'At least 8 characters.' : undefined}
					>
						{#snippet children({ id, describedBy, invalid })}
							<Input
								{id}
								type="password"
								name="password"
								autocomplete={flow === 'signUp' ? 'new-password' : 'current-password'}
								aria-describedby={describedBy}
								error={invalid}
								bind:value={password}
							/>
						{/snippet}
					</FormField>
					<Button type="submit" size="lg" loading={busy}>{cta}</Button>
				</Stack>
			</form>

			<p class="auth-switch">
				{#if flow === 'signIn'}
					New here? <a href="/register">Create an account</a>
				{:else}
					Already have an account? <a href="/login">Sign in</a>
				{/if}
			</p>
		</Stack>
	</Card>
</div>

<style>
	.auth-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--sv-space-4);
	}
	.auth-page :global(.auth-card) {
		width: min(24rem, 100%);
	}
	.auth-brand {
		text-align: center;
	}
	.auth-brand__logo {
		font-size: var(--sv-text-3xl);
	}
	.auth-brand__title {
		margin: var(--sv-space-1) 0 0;
		font-size: var(--sv-text-xl);
		color: var(--sv-color-text);
	}
	.auth-brand__subtitle {
		margin: var(--sv-space-1) 0 0;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text-muted);
	}
	.auth-switch {
		margin: 0;
		text-align: center;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text-muted);
	}
	.auth-switch a {
		color: var(--sv-color-primary);
		font-weight: var(--sv-font-medium);
	}
</style>
