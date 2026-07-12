# AI Workflow

Svelocity Stack ships its AI setup as repo assets (ADR
[0006](../adr/0006-ai-instructions-as-assets.md)): one `AGENTS.md`, one Cursor rule,
and five skills in `.agents/skills/`. Any agent that can read files can use them.

## AGENTS.md — works with any agent

[`AGENTS.md`](../../AGENTS.md) at the repo root is the single agent contract:
stack table, directory map, architecture rules, prohibited shortcuts, and the
intent-question format. Most tools pick it up automatically (Claude Code, Codex,
Cursor, and anything following the [agents.md](https://agents.md) convention). If
yours doesn't, paste it into the system/context window — it's written to stand alone.

The rules that matter most (agents drift toward violating exactly these):

1. Business logic → `packages/app-core`, never in apps
2. Shared UI → `packages/ui`, never duplicated per app
3. Apps import packages; never other apps; packages never import apps
4. Never weaken Electron security (`contextIsolation`, `nodeIntegration`, sandbox)
5. Run `pnpm check` and `pnpm test` before calling a task done

## Cursor setup

The generated Cursor rule lives in `.cursor/rules/` and points Cursor at `AGENTS.md`
and the conventions docs. Skills are plain folders, so in Cursor you reference one
with `@.agents/skills/<name>/SKILL.md` (or via the skill picker where supported).

## Claude Code setup

`.claude/skills/` contains symlinks into `.agents/skills/`, so skills appear in the
skill picker and as `/skill-name`. Nothing to install.

## Bundled skills — when to use each

| Skill                       | Reach for it when…                                                             |
| --------------------------- | ------------------------------------------------------------------------------ |
| `svelocity-convex`          | Adding a table/field/query/mutation and wiring it through app-core to the apps |
| `svelocity-auth`            | Protecting routes, changing providers, debugging login/logout/token flow       |
| `svelocity-add-platform`    | Adding or restoring a platform shell (manual in v1; `svelocity add` is v1.1)   |
| `svelocity-alignment-audit` | Read-only check that docs ↔ manifest ↔ code still agree                        |
| `svelocity-changelog`       | Cutting a CHANGELOG entry + root version bump                                  |

Recommended external skills (bits-ui, Convex upstream, etc.):
[.agents/README.md](../../.agents/README.md).

## Architecture boundaries agents must respect

Give an agent a task, and check its plan against the [architecture
guide](architecture.md) "what goes where" table before letting it write. High-risk
patterns to watch for:

- Validation logic written inline in a component (belongs in `app-core`)
- A component copy-pasted between two apps (belongs in `ui`)
- Direct `bits-ui` imports in an app (wrap in `ui` first)
- Hex colors instead of `--sv-*` tokens
- A new Electron IPC channel without input validation, or widened `webPreferences`
- Skipping `pnpm --filter @svelocity/backend gen` after schema changes

## When an agent suggests the wrong pattern

1. Don't accept partial compliance — point it at the specific rule:
   "`AGENTS.md` Architecture Rules #1" or the relevant guide.
2. Ask it to restate where the code should live before rewriting.
3. For recurring drift, run the `svelocity-alignment-audit` skill — it produces a
   report of every place the codebase and docs disagree, which doubles as a fix list.
4. If the agent is right and the docs are wrong, fix the docs in the same PR —
   the contract only works while it's true.
