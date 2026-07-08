# Changelog reference

## Commit type → section mapping

| Conventional type                          | Changelog section  | Include?             |
| ------------------------------------------ | ------------------ | -------------------- |
| `feat`                                     | Added              | yes                  |
| `fix`                                      | Fixed              | yes                  |
| `perf`                                     | Changed            | yes                  |
| `feat!` / `BREAKING CHANGE`                | Changed (breaking) | yes, flag breaking   |
| `docs` (user-facing guides)                | Changed            | only if users see it |
| `refactor`, `chore`, `ci`, `test`, `style` | —                  | no                   |

## Bump inference (when the user gives no bump)

- Any breaking change → **major** (pre-1.0: minor)
- Any `feat` → **minor** (pre-1.0: patch is acceptable; ask if unsure)
- Only `fix`/`perf` → **patch**

## Writing rules

- Entries describe what the USER can now do or what stopped being broken —
  never file paths, package names, or internal jargon
- One line per change, imperative mood: "Add dark-mode toggle to settings"
- Group under `### Added` / `### Changed` / `### Fixed` / `### Removed`
- Omit empty sections
