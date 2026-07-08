import { cpSync, existsSync, mkdirSync, readdirSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

export interface LinkSkillsResult {
	linked: string[];
	copied: string[];
}

/**
 * Mirror .agents/skills/<name> into .claude/skills/<name> so Claude Code
 * discovers the bundled skills. Symlink preferred; falls back to a recursive
 * copy where symlinks are unavailable (e.g. Windows without developer mode).
 */
export function linkSkills(projectRoot: string): LinkSkillsResult {
	const result: LinkSkillsResult = { linked: [], copied: [] };
	const skillsDir = join(projectRoot, '.agents/skills');
	if (!existsSync(skillsDir)) return result;
	const claudeSkills = join(projectRoot, '.claude/skills');
	mkdirSync(claudeSkills, { recursive: true });
	for (const name of readdirSync(skillsDir).sort()) {
		const target = join(claudeSkills, name);
		if (existsSync(target)) continue;
		try {
			symlinkSync(join('..', '..', '.agents', 'skills', name), target, 'dir');
			result.linked.push(name);
		} catch {
			cpSync(join(skillsDir, name), target, { recursive: true });
			result.copied.push(name);
		}
	}
	return result;
}
