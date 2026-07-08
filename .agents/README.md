# Agent skills

Canonical project skills live in **`.agents/skills/`**. Each skill is a folder with
a `SKILL.md` and optional reference or template files.

## Platform discovery

| Platform        | How skills are loaded                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| **Claude Code** | `/skill-name` or skill picker; `.claude/skills/` symlinks → `.agents/skills/` |
| **Cursor**      | `@skill-name` or skill picker; reads `.agents/skills/`                        |
| **Codex**       | Project skills from `.agents/skills/`                                         |

## Bundled skills

| Skill                       | Purpose                                                        |
| --------------------------- | -------------------------------------------------------------- |
| `svelocity-convex`          | Add tables/queries/mutations, wire through `packages/app-core` |
| `svelocity-auth`            | Configure and extend Convex Auth across web/desktop/mobile     |
| `svelocity-add-platform`    | Manual platform-add guide (until `svelocity add` ships)        |
| `svelocity-alignment-audit` | Read-only docs ↔ manifest ↔ codebase alignment report          |
| `svelocity-changelog`       | Public CHANGELOG.md + root version bump                        |

## Recommended skills (not bundled)

Install these for a better agent workflow — each one line to integrate:

| Skill           | What it does                       | Install                                                                                                    |
| --------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `caveman`       | Ultra-compressed agent responses   | Claude Code plugin marketplace: `/plugin install caveman`                                                  |
| `impeccable`    | Production-grade frontend design   | Vendor-copy its folder into `.agents/skills/impeccable/`, then symlink into `.claude/skills/`              |
| Convex upstream | Generic Convex patterns (6 skills) | `npx convex ai-files install` (from [get-convex/agent-skills](https://github.com/get-convex/agent-skills)) |

## Adding a skill

1. Create it under `.agents/skills/<name>/` with a `SKILL.md`
2. Symlink for Claude Code: `ln -s ../../.agents/skills/<name> .claude/skills/<name>`
3. Add the name to `skills` in `.svelocity/manifest.json` (pattern `^[a-z0-9-]+$`)
