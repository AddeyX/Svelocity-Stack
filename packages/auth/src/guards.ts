/**
 * Route-guard decision logic, kept pure so every shell (SvelteKit goto,
 * SPA router) can apply the same rules and unit tests cover them once.
 */

export type SessionState = 'loading' | 'authenticated' | 'unauthenticated';

export interface GuardInput {
	isLoading: boolean;
	isAuthenticated: boolean;
	/** Is the current route the login/register (public) area? */
	isAuthRoute: boolean;
}

export type GuardDecision = 'stay' | 'toLogin' | 'toApp';

/** Where should the router send the user right now? */
export function guardDecision({
	isLoading,
	isAuthenticated,
	isAuthRoute
}: GuardInput): GuardDecision {
	if (isLoading) return 'stay';
	if (!isAuthenticated && !isAuthRoute) return 'toLogin';
	if (isAuthenticated && isAuthRoute) return 'toApp';
	return 'stay';
}

export function sessionState(auth: { isLoading: boolean; isAuthenticated: boolean }): SessionState {
	if (auth.isLoading) return 'loading';
	return auth.isAuthenticated ? 'authenticated' : 'unauthenticated';
}
