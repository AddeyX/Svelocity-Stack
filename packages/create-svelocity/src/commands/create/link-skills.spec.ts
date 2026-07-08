import { lstatSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { linkSkills } from './link-skills.js';

function makeProject(skills: string[]): string {
	const root = mkdtempSync(join(tmpdir(), 'sv-link-'));
	for (const name of skills) {
		mkdirSync(join(root, '.agents/skills', name), { recursive: true });
		writeFileSync(join(root, '.agents/skills', name, 'SKILL.md'), `# ${name}\n`);
	}
	return root;
}

describe('linkSkills', () => {
	it('links every skill into .claude/skills', () => {
		const root = makeProject(['svelocity-convex', 'svelocity-auth']);
		const result = linkSkills(root);
		expect(result.linked.concat(result.copied).sort()).toEqual([
			'svelocity-auth',
			'svelocity-convex'
		]);
		for (const name of ['svelocity-convex', 'svelocity-auth']) {
			const content = readFileSync(join(root, '.claude/skills', name, 'SKILL.md'), 'utf8');
			expect(content).toContain(name);
		}
	});

	it('prefers symlinks where the platform allows', () => {
		const root = makeProject(['svelocity-convex']);
		const result = linkSkills(root);
		if (result.linked.length === 1) {
			expect(lstatSync(join(root, '.claude/skills/svelocity-convex')).isSymbolicLink()).toBe(true);
		} else {
			expect(result.copied).toEqual(['svelocity-convex']);
		}
	});

	it('is idempotent and no-ops without .agents/skills', () => {
		const root = makeProject(['svelocity-convex']);
		linkSkills(root);
		expect(linkSkills(root)).toEqual({ linked: [], copied: [] });
		const empty = mkdtempSync(join(tmpdir(), 'sv-link-empty-'));
		expect(linkSkills(empty)).toEqual({ linked: [], copied: [] });
	});
});
