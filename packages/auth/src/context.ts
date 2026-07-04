import { getContext, setContext } from 'svelte';
import type { AuthState } from './auth-state.svelte.js';

const AUTH_KEY = Symbol('svelocity-auth');

/** Call once in the root layout/shell after createAuthState(). */
export function setAuthState(auth: AuthState): AuthState {
	setContext(AUTH_KEY, auth);
	return auth;
}

/** Read the auth state anywhere below the root. */
export function getAuthState(): AuthState {
	const auth = getContext<AuthState | undefined>(AUTH_KEY);
	if (!auth) {
		throw new Error('Auth state missing from context — call setAuthState() in the root layout.');
	}
	return auth;
}
