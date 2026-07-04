import { describe, expect, it } from 'vitest';
import { isValidAppId, replaceTokens, toAppId, toDisplayName } from './tokens.js';

const tokens = { PROJECT_NAME: 'my-app', DISPLAY_NAME: 'My App', APP_ID: 'com.acme.myapp' };

describe('replaceTokens', () => {
	it('replaces all occurrences of every token', () => {
		const input = '{{PROJECT_NAME}} / {{DISPLAY_NAME}} / {{APP_ID}} / {{PROJECT_NAME}}';
		expect(replaceTokens(input, tokens)).toBe('my-app / My App / com.acme.myapp / my-app');
	});

	it('leaves unknown braces untouched', () => {
		expect(replaceTokens('{{NOT_A_TOKEN}}', tokens)).toBe('{{NOT_A_TOKEN}}');
	});
});

describe('derivations', () => {
	it('derives display name from kebab-case', () => {
		expect(toDisplayName('my-cool-app')).toBe('My Cool App');
	});

	it('derives a default app id', () => {
		expect(toAppId('my-cool-app')).toBe('com.example.mycoolapp');
	});

	it('validates reverse-DNS app ids', () => {
		expect(isValidAppId('dev.svelocity.tasks')).toBe(true);
		expect(isValidAppId('com.acme')).toBe(true);
		expect(isValidAppId('nodots')).toBe(false);
		expect(isValidAppId('com..acme')).toBe(false);
		expect(isValidAppId('com.9acme')).toBe(false);
	});

	it('keeps derived app ids valid when the name starts with a digit', () => {
		expect(isValidAppId(toAppId('123-app'))).toBe(true);
	});

	it('handles names that sanitize to nothing', () => {
		expect(isValidAppId(toAppId('---'))).toBe(true);
	});
});
