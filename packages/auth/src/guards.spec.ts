import { describe, expect, it } from 'vitest';
import { guardDecision, sessionState } from './guards.js';

describe('guardDecision', () => {
	it('holds position while auth is resolving', () => {
		expect(guardDecision({ isLoading: true, isAuthenticated: false, isAuthRoute: false })).toBe(
			'stay'
		);
	});

	it('sends signed-out users on protected routes to login', () => {
		expect(guardDecision({ isLoading: false, isAuthenticated: false, isAuthRoute: false })).toBe(
			'toLogin'
		);
	});

	it('keeps signed-out users on auth routes', () => {
		expect(guardDecision({ isLoading: false, isAuthenticated: false, isAuthRoute: true })).toBe(
			'stay'
		);
	});

	it('sends signed-in users away from auth routes', () => {
		expect(guardDecision({ isLoading: false, isAuthenticated: true, isAuthRoute: true })).toBe(
			'toApp'
		);
	});

	it('keeps signed-in users on protected routes', () => {
		expect(guardDecision({ isLoading: false, isAuthenticated: true, isAuthRoute: false })).toBe(
			'stay'
		);
	});
});

describe('sessionState', () => {
	it('maps auth flags to the three states', () => {
		expect(sessionState({ isLoading: true, isAuthenticated: false })).toBe('loading');
		expect(sessionState({ isLoading: false, isAuthenticated: true })).toBe('authenticated');
		expect(sessionState({ isLoading: false, isAuthenticated: false })).toBe('unauthenticated');
	});
});
