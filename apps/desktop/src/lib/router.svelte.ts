/**
 * Tiny hash router shared by the SPA shells (desktop + mobile copy this
 * pattern): three routes, guard logic stays in @svelocity/auth.
 */

export type Route = 'login' | 'register' | 'tasks';

const inBrowser = typeof window !== 'undefined';

function parseHash(): Route {
	const hash = inBrowser ? window.location.hash.replace(/^#\/?/, '') : '';
	if (hash === 'register') return 'register';
	if (hash === 'tasks') return 'tasks';
	return 'login';
}

let route = $state<Route>(parseHash());

if (inBrowser) {
	window.addEventListener('hashchange', () => {
		route = parseHash();
	});
}

export function getRoute(): Route {
	return route;
}

export function navigate(to: Route) {
	if (inBrowser) window.location.hash = `/${to}`;
	route = to;
}

export function isAuthRoute(r: Route): boolean {
	return r === 'login' || r === 'register';
}
