import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scaffold } from './scaffold.js';

const tokens = { PROJECT_NAME: 'acme-app', DISPLAY_NAME: 'Acme App', APP_ID: 'com.acme.app' };

function makeTemplate(): string {
	const dir = mkdtempSync(join(tmpdir(), 'sv-tpl-'));
	writeFileSync(join(dir, 'package.json'), '{ "name": "{{PROJECT_NAME}}" }');
	writeFileSync(join(dir, '_gitignore'), 'node_modules\n');
	writeFileSync(join(dir, '_npmrc'), 'public-hoist-pattern[]=*\n');
	mkdirSync(join(dir, 'apps/mobile'), { recursive: true });
	writeFileSync(
		join(dir, 'apps/mobile/capacitor.config.ts'),
		"appId: '{{APP_ID}}', appName: '{{DISPLAY_NAME}}'"
	);
	writeFileSync(join(dir, 'apps/mobile/icon.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
	return dir;
}

describe('scaffold', () => {
	it('copies, detokenizes, and restores dotfiles', () => {
		const template = makeTemplate();
		const target = join(mkdtempSync(join(tmpdir(), 'sv-target-')), 'acme-app');
		scaffold(template, target, tokens);

		expect(readFileSync(join(target, 'package.json'), 'utf8')).toContain('"acme-app"');
		expect(readFileSync(join(target, 'apps/mobile/capacitor.config.ts'), 'utf8')).toBe(
			"appId: 'com.acme.app', appName: 'Acme App'"
		);
		expect(existsSync(join(target, '.gitignore'))).toBe(true);
		expect(existsSync(join(target, '_gitignore'))).toBe(false);
		expect(existsSync(join(target, '.npmrc'))).toBe(true);
	});

	it('does not mangle binary files', () => {
		const template = makeTemplate();
		const target = join(mkdtempSync(join(tmpdir(), 'sv-target-')), 'acme-app');
		scaffold(template, target, tokens);
		expect(readFileSync(join(target, 'apps/mobile/icon.png'))).toEqual(
			Buffer.from([0x89, 0x50, 0x4e, 0x47])
		);
	});
});
