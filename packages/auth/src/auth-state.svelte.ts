/**
 * Svelte-native auth state for @convex-dev/auth, shared by all three shells.
 *
 * Core model: `signIn` / `signOut` are Convex ACTIONS called via
 * `client.action(...)` — there are no HTTP auth endpoints to fetch.
 * Tokens live in localStorage so sessions survive reloads in the browser,
 * the Electron renderer, and the Capacitor WebView alike.
 *
 * Framework-agnostic by design: no SvelteKit imports. Apps inject the
 * generated action references (`api.auth.signIn` / `api.auth.signOut`)
 * and handle navigation themselves.
 */
import type { ConvexClient } from 'convex/browser';

const TOKEN_KEY = 'svelocity_auth_token';
const REFRESH_KEY = 'svelocity_auth_refresh';
const VERIFIER_KEY = 'svelocity_auth_verifier';

const inBrowser = typeof window !== 'undefined';

function read(key: string): string | null {
	return inBrowser ? localStorage.getItem(key) : null;
}

function write(key: string, value: string | null) {
	if (!inBrowser) return;
	if (value) localStorage.setItem(key, value);
	else localStorage.removeItem(key);
}

/** Generated Convex auth action references — pass `api.auth.signIn` / `api.auth.signOut`. */
export interface AuthActions {
	// deliberately loose: the generated FunctionReference types vary per app schema
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	signIn: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	signOut: any;
}

export type SignInParams = {
	email: string;
	password: string;
	flow: 'signIn' | 'signUp';
};

export interface AuthState {
	readonly isLoading: boolean;
	readonly isAuthenticated: boolean;
	fetchAccessToken: (args: { forceRefreshToken: boolean }) => Promise<string | null>;
	signIn: (params: SignInParams) => Promise<{ error?: string }>;
	signOut: () => Promise<void>;
	handleOAuthCallback: () => Promise<{ handled: boolean; error?: string }>;
}

export function createAuthState(client: ConvexClient, actions: AuthActions): AuthState {
	let token = $state<string | null>(read(TOKEN_KEY));
	let refreshToken = $state<string | null>(read(REFRESH_KEY));
	let loading = $state(true);

	if (inBrowser) {
		queueMicrotask(() => {
			loading = false;
		});
	} else {
		loading = false;
	}

	function setTokens(t: { token: string; refreshToken: string } | null | undefined) {
		token = t?.token ?? null;
		refreshToken = t?.refreshToken ?? null;
		write(TOKEN_KEY, token);
		write(REFRESH_KEY, refreshToken);
	}

	async function fetchAccessToken({
		forceRefreshToken
	}: {
		forceRefreshToken: boolean;
	}): Promise<string | null> {
		if (forceRefreshToken && refreshToken) {
			try {
				const result = await client.action(actions.signIn, { refreshToken });
				if (result?.tokens) {
					setTokens(result.tokens);
					return result.tokens.token;
				}
				setTokens(null);
				return null;
			} catch {
				setTokens(null);
				return null;
			}
		}
		return token;
	}

	async function signIn(params: SignInParams): Promise<{ error?: string }> {
		try {
			const result = await client.action(actions.signIn, {
				provider: 'password',
				params: {
					email: params.email,
					password: params.password,
					flow: params.flow
				}
			});
			if (result?.tokens) {
				setTokens(result.tokens);
				return {};
			}
			return { error: 'Invalid credentials' };
		} catch (err) {
			return { error: toFriendlyAuthError(err, params.flow) };
		}
	}

	/**
	 * Exchange the `?code=` left by an OAuth provider callback (v1.1 — kept so
	 * adding OAuth later requires only a provider in convex/auth.ts and a button).
	 * Strips the code from the URL BEFORE awaiting so refresh can't replay it.
	 */
	async function handleOAuthCallback(): Promise<{ handled: boolean; error?: string }> {
		if (!inBrowser) return { handled: false };
		// One-shot URL parse, never reactive state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const url = new URL(window.location.href);
		const code = url.searchParams.get('code');
		if (!code) return { handled: false };

		const verifier = read(VERIFIER_KEY) ?? undefined;
		write(VERIFIER_KEY, null);
		url.searchParams.delete('code');
		const cleanPath = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : '');
		history.replaceState({}, '', cleanPath);

		try {
			const result = await client.action(actions.signIn, { params: { code }, verifier });
			if (result?.tokens) {
				setTokens(result.tokens);
				return { handled: true };
			}
			return { handled: true, error: 'OAuth exchange returned no tokens' };
		} catch (err) {
			return {
				handled: true,
				error: err instanceof Error ? err.message : 'OAuth exchange failed'
			};
		}
	}

	async function signOut(): Promise<void> {
		try {
			await client.action(actions.signOut, {});
		} catch {
			// clear local state regardless — the server session may already be gone
		}
		setTokens(null);
	}

	return {
		get isLoading() {
			return loading;
		},
		get isAuthenticated() {
			return token !== null;
		},
		fetchAccessToken,
		signIn,
		signOut,
		handleOAuthCallback
	};
}

/** Convex surfaces auth failures as opaque server errors; translate the known ones. */
export function toFriendlyAuthError(err: unknown, flow: 'signIn' | 'signUp'): string {
	const raw = err instanceof Error ? err.message : String(err);
	if (/InvalidSecret|InvalidAccountId|Invalid credentials/i.test(raw)) {
		return 'Invalid email or password.';
	}
	if (/already exists|AccountAlreadyExists/i.test(raw) && flow === 'signUp') {
		return 'An account with this email already exists.';
	}
	if (/TooManyFailedAttempts|rate limit/i.test(raw)) {
		return 'Too many attempts — wait a moment and try again.';
	}
	return flow === 'signUp' ? 'Could not create the account.' : 'Could not sign in.';
}
