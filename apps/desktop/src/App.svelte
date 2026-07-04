<script lang="ts">
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { api } from '@svelocity/backend';
	import { createAuthState, guardDecision, setAuthState } from '@svelocity/auth';
	import { parseClientEnv } from '@svelocity/env';
	import { Toaster, OfflineIndicator } from '@svelocity/ui';
	import { getRoute, isAuthRoute, navigate } from './lib/router.svelte.js';
	import LoginView from './views/LoginView.svelte';
	import TasksView from './views/TasksView.svelte';

	const { PUBLIC_CONVEX_URL } = parseClientEnv({
		PUBLIC_CONVEX_URL: import.meta.env.PUBLIC_CONVEX_URL
	});

	setupConvex(PUBLIC_CONVEX_URL);
	const client = useConvexClient();
	const auth = setAuthState(
		createAuthState(client, { signIn: api.auth.signIn, signOut: api.auth.signOut })
	);

	$effect(() => {
		if (auth.isAuthenticated) client.setAuth(auth.fetchAccessToken);
		else if (!auth.isLoading) client.setAuth(async () => null);
	});

	const route = $derived(getRoute());

	$effect(() => {
		const decision = guardDecision({
			isLoading: auth.isLoading,
			isAuthenticated: auth.isAuthenticated,
			isAuthRoute: isAuthRoute(route)
		});
		if (decision === 'toLogin') navigate('login');
		else if (decision === 'toApp') navigate('tasks');
	});
</script>

{#if route === 'tasks'}
	<TasksView />
{:else}
	<LoginView flow={route === 'register' ? 'signUp' : 'signIn'} />
{/if}

<OfflineIndicator />
<Toaster />
