# Herdr + OpenCode orchestration

## Objective

Turn Herdr 0.9.1 into an Antigravity-style cockpit for this repo: stable agent
names, Herdr control skill inside OpenCode, no ghost worktrees, and a verified
safe CLI-control path. No commits in this task (explicit user constraint).

## Scope

In scope:

- Remove the Herdr-managed ghost worktree `worktree/calm-stone-5331`
  (local only, same SHA as `main`, no remote refs).
- Give stable display names to live agents (`herdr agent rename`).
- Install the Herdr control skill into OpenCode global skills.
- Verify Herdr CLI control with a throwaway pane (split/run/read/close)
  without injecting input into the user's live agent panes.

Out of scope:

- Live `agent prompt` injection into the user's running `agy` panes
  (left as a documented command for the user to try).
- Keybinding changes in `config.toml` (follow-up).
- Any `git commit` (user constraint).

## Acceptance criteria

- [ ] `git worktree list` shows only the repo root.
- [ ] `git branch -a` shows no `worktree/calm-stone-5331` ref.
- [ ] `herdr agent list` shows stable names for live agents.
- [ ] `~/.config/opencode/skills/herdr/SKILL.md` exists.
- [ ] Throwaway-pane control test passes (run + read + close).
- [ ] Task doc records `<command>: <observed result>` per unit + `diff --stat`.

## Plan

1. Branch `chore/herdr-opencode-orchestration` (no commits).
2. Worktree removal + branch delete + verify.
3. Agent renames + verify.
4. Skill install + verify.
5. Safe control test + verify.
6. Close-out evidence below.

## Close-out evidence

Branch: `git checkout -b chore/herdr-opencode-orchestration` → `Switched to a
new branch 'chore/herdr-opencode-orchestration'`. No commits (user constraint);
working tree holds only this untracked doc.

1. Worktree removal:
   `git worktree remove "<...>/worktree-calm-stone-5331" && git branch -d
   worktree/calm-stone-5331` → `Deleted branch worktree/calm-stone-5331 (was
   e17e130)`. Verified: `git worktree list` shows only
   `C:/laragon/www/transparencia`; `git branch -a` shows no
   `worktree/calm-stone-5331` and no `remotes/origin/worktree/*`;
   `git worktree prune` → `PRUNE-OK`. Note: Herdr had no open workspace for
   the checkout (`herdr workspace list` showed only `w2`, `w4`), so plain
   `git worktree remove` was the correct path (`herdr worktree remove`
   needs a live workspace ID).
2. Agent renames: `herdr agent rename w2:p1 opencode-main`,
   `w2:p8 agy-1`, `w2:p4 agy-2`, `w4:p1 opencode-ideas` → all `agent_info`
   OK. Verified: `herdr agent list` shows the four stable names;
   `opencode-main` is `working` (this session), both `agy*` are `idle`.
3. Skill install: `herdr --skill` output written verbatim to
   `%USERPROFILE%/.config/opencode/skills/herdr/SKILL.md` (mirrors the
   existing `skills/<name>/SKILL.md` layout). Verified: file exists;
   `$env:HERDR_ENV` → `1`, so the skill's precondition holds in-session.
   Takes effect on next OpenCode start (this session predates the file).
4. Safe control test (throwaway pane, no focus stolen, no input to live
   agents): `herdr pane split --current --direction right --cwd <repo>
   --no-focus` → `NEW_PANE=w2:pA`; `pane run` + `pane wait-output --match
   'herdr-control-test-ok' --timeout 30000` → `output_matched`;
   `pane read --source recent-unwrapped --lines 20` → transcript OK;
   `herdr pane close w2:pA` → `{"type":"ok"}`.

Pending / follow-up (not applied):

- Live `herdr agent prompt agy-1 "..." --wait` left for the user to try
  (deliberately no input injected into running agent panes).
- Keybinding additions (`next_agent`/`previous_agent`, unset by default):
  read `https://herdr.dev/docs/keyboard/` before choosing chords.
- `git diff --stat`: N/A (no tracked modifications; only untracked
  `odd/tasks/herdr-opencode-orchestration.md`). No SHA (no commits).
