<script lang="ts">
	import '@svelocity/theme/tokens.css';
	import '@svelocity/theme/platform/web.css';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { api } from '@svelocity/backend';
	import { createAuthState, guardDecision, setAuthState } from '@svelocity/auth';
	import { parseClientEnv } from '@svelocity/env';
	import { Toaster, OfflineIndicator } from '@svelocity/ui';

	let { children } = $props();

	// Fail fast and loud on misconfiguration (only when actually running).
	const { PUBLIC_CONVEX_URL } = parseClientEnv({ PUBLIC_CONVEX_URL: env.PUBLIC_CONVEX_URL });

	setupConvex(PUBLIC_CONVEX_URL);
	const client = useConvexClient();
	const auth = setAuthState(
		createAuthState(client, { signIn: api.auth.signIn, signOut: api.auth.signOut })
	);

	// Keep the Convex client's auth in sync with our token state.
	$effect(() => {
		if (auth.isAuthenticated) client.setAuth(auth.fetchAccessToken);
		else if (!auth.isLoading) client.setAuth(async () => null);
	});

	const isAuthRoute = $derived(
		page.url.pathname.startsWith('/login') || page.url.pathname.startsWith('/register')
	);

	// Client-side route guard — auth lives in localStorage, so the server can't decide.
	$effect(() => {
		if (!browser) return;
		const decision = guardDecision({
			isLoading: auth.isLoading,
			isAuthenticated: auth.isAuthenticated,
			isAuthRoute
		});
		if (decision === 'toLogin') goto('/login');
		else if (decision === 'toApp') goto('/tasks');
	});
</script>

{@render children()}

<OfflineIndicator />
<Toaster />
