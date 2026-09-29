# Task: readme-refresh

## Goal
Replace the default Laravel template README with a finished-product
institutional README: system summary, install guide, and a provisional
deploy section. No sprint or dev-history content.

## Scope
- Full rewrite of root `README.md` in neutral Spanish.
- Sections: description, features, roles, stack, requirements,
  local install (Laragon), deploy (provisional), commands,
  project structure, operating conventions, security, related docs.
- Out of scope: code changes, `transparencia-proy/` docs, credentials.

## Criteria
- [ ] No remaining Laravel template content (logo, sponsors, bootcamp).
- [ ] Install steps work from a fresh clone (standard Laravel 13 flow).
- [ ] Deploy section marked as provisional, subject to updates.
- [ ] Verified by direct read of the new README plus `git diff`.
- [ ] Unit commit on `docs/readme-refresh` (Conventional Commits,
      no Co-Authored-By, no AI attribution).
- [ ] Evidence (SHA + `diff --stat`) recorded below before closing.

## Evidence
- Unit commit: `12c7a2bd36f22cb75625867fd18202e447276088`
  (`docs(transparencia): reemplazar README template por README institucional`)
- `git show --stat HEAD`: README.md (+133/-45), odd/tasks/readme-refresh.md (+25).
- Verification: full rewrite read after write; diff confirms all Laravel
  template lines removed (logo, sponsors, bootcamp, Laracasts) and no
  template additions. Executable test: N/A (docs-only change).
