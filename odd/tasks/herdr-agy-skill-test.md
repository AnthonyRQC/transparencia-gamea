# Herdr skill for agy + connection/pane-management test

## Objective

Give Antigravity CLI (`agy`) the Herdr control skill and prove the
agy→Herdr path: connection (agent list) and pane management (throwaway
split/run/read/close). Division of labor: agent configures, user runs the
manual test from the `agy-1` TUI, agent verifies read-only from here.

## Scope

In scope:

- Install `herdr` skill into agy global skills
  (`~/.gemini/antigravity-cli/skills/herdr/SKILL.md`, verbatim `herdr --skill`
  output; frontmatter `name`+`description` matches existing agy skills, which
  also carry optional `license`/`metadata` — not required).
- Read-only verification from this session (`agent get`, `pane list`).

Out of scope:

- Injecting prompts into the user's live `agy` panes (user types in TUI).
- Keybinding changes. Commits (none unless user asks).

## Acceptance criteria

- [ ] `SKILL.md` exists under `antigravity-cli/skills/herdr/`.
- [ ] User confirms `/skills` in `agy-1` TUI lists `herdr` (after CLI restart).
- [ ] User reports `herdr agent list` output from `agy-1` naming
      `opencode-main`, `agy-1`, `agy-2`, `opencode-ideas`.
- [ ] User reports throwaway pane create/read/close driven by `agy-1`.
- [ ] `herdr agent get agy-1` shows `agent_session` with source
      `herdr:antigravity_cli` (hook reported).

## Manual test script (user, in agy-1 TUI after restart)

1. `/skills` → expect `herdr` in the list.
2. `Ejecutá 'herdr agent list' y decime qué agentes ves.`
3. `Creá un pane nuevo sin robar foco, corré un echo de prueba, leé la salida y cerralo.`

## Close-out evidence

Install: `herdr --skill` output written verbatim to
`%USERPROFILE%/.gemini/antigravity-cli/skills/herdr/SKILL.md`.
Verified: `Test-Path .../skills/herdr/SKILL.md` → `True`.
Format check: existing agy skill `work-unit-commits/SKILL.md` uses the same
`name`+`description` frontmatter (plus optional `license`/`metadata`), so no
adaptation was needed; agy auto-converts skills to slash commands.

Branch: `chore/herdr-agy-skill` (from `chore/herdr-opencode-orchestration`).
`git status --short` → only untracked
`odd/tasks/herdr-agy-skill-test.md` (+ previous task's untracked doc, still
uncommitted). `git diff --stat` → empty. No commits (none requested).

Agent-side work complete. Pending: user manual test in agy-1 TUI (restart CLI
first so it picks up the new skill), then report back for read-only
verification here (`herdr agent get agy-1`, `herdr pane list`).
