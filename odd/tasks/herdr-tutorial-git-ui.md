# Herdr tutorial notes + git UI + close test pane

## Objective

Recover the Warp-style changed-files/diff experience inside Herdr, produce
general-purpose Obsidian tutorial notes (Spanish, no gentle-ai content), and
fully close the `story-agent` test leftovers.

## Scope

In scope:

- 9 Obsidian notes in staging `C:/Users/Tony/herdr-notas/` (user moves them
  to `10 - TECNOLOGIAS/Herdr/` in vault `1-BovedaObsidian`).
- Install community plugin `alexarthurs/herdr-sidebar` + keybinding +
  `server reload-config` + install verification (visual test by user).
- Install `glow` (Markdown renderer for sidebar previews).
- Full close of test pane `w2:pC` (`story-agent` opencode) + re-alias
  `agy-1` on `w2:p8` + verification. NEVER touch `w2:p1` (this session).

Out of scope:

- Commits (none). Closing `w2:p9` (user's call). Live `agent prompt`
  injection. `lazygit`/ffmpeg/`claude` CLI installs (documented as optional).

## Acceptance criteria

- [ ] 9 notes exist in staging, cross-linked, ES, no gentle-ai.
- [ ] `herdr plugin list` shows herdr-sidebar; keybinding present in
      `config.toml`; `server reload-config` OK; `glow --version` OK.
- [ ] `herdr agent list` shows no `story-agent`; `w2:p1` alive; `agy-1`
      alias restored on `w2:p8`.
- [ ] Close-out evidence below; `diff --stat` empty of tracked changes.

## Plan

1. Branch `chore/herdr-tutorial-git-ui` (done, no commits).
2. Staging dir + 9 notes.
3. Plugin install + keybinding + reload + verify.
4. glow install + verify.
5. Pane close + re-alias + verify.
6. Evidence + Engram + report.

## Close-out evidence

Staging: 9 notes in `C:/Users/Tony/herdr-notas/` (ES, Obsidian frontmatter +
`[[links]]`, no gentle-ai). User moves them to `10 - TECNOLOGIAS/Herdr/`.

Plugin: `herdr plugin install ... --ref v0.12.0 --yes` FAILED twice
(`could not calculate SHA-256 ... building from source`, no Rust). Root
cause: fetch script fails under Herdr's invoke; manual download + hash OK.
Fix: shallow clone tag v0.12.0 to `~/.herdr-plugins/herdr-sidebar`,
downloaded both exes, verified SHA-256 against release SHA256SUMS
(`642e6b9a...` and `5304b61a...` match), placed in
`plugins/herdr-sidebar/target/release/`, `herdr plugin link` → linked +
enabled (v0.12.0, 6 actions, 10 events). Update path: re-clone tag +
re-fetch exes (no auto-update on local links).

Keybinding: `[[keys.command]] prefix+f` → `herdr plugin action invoke
herdr-sidebar.open-sidebar-windows`; `prefix+shift+f` →
`...open-git-windows`. `herdr server reload-config` → `applied`, no
diagnostics.

glow: `winget install charmbracelet.glow` → 3.0.0 OK. Verified inside a
throwaway Herdr pane (`w2:pD`: `glow --version` matched, pane closed) — no
server restart needed.

Close: `herdr pane close w2:pC` → story-agent gone; `w2:p1` alive;
`agy-1` re-aliased. `herdr agent list` shows 4 clean agents.

`git status --short` → only untracked task docs; `git diff --stat` → empty.
No commits.

Pending (user): press `prefix+f` / `prefix+shift+f` in Herdr for the visual
test; move notes to vault.
