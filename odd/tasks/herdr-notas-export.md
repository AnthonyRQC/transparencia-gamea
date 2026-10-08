# Herdr notes update: images + export

## Objective

Update staging notes with sidebar-verified evidence, add image-paste
diagnosis note and work-laptop export checklist note.

## Scope

In scope:

- Edit `Herdr - Historial de mi configuracion.md` (sidebar verified via user
  screenshot; image-paste finding).
- Edit `Herdr - Indice.md` (2 new links).
- New `Herdr - Imagenes en el chat.md` (Warp vs Herdr paste chain, ranked fixes).
- New `Herdr - Exportar ajustes a otra laptop.md` (full replication checklist).
- This task doc. Branch `chore/herdr-notas-export`. No commits.

Out of scope:

- Changing terminal emulator, installing WezTerm, upstream bug reports.

## Acceptance criteria

- [ ] 11 notes in staging, cross-linked, ES, no gentle-ai.
- [ ] Close-out evidence below; `diff --stat` empty of tracked changes.

## Close-out evidence

11 notes in staging (9 + Imagenes + Exportar), Historial + Indice updated,
all ES, cross-linked, no gentle-ai. `git status` → 4 untracked task docs;
`git diff --stat` → empty. No commits. Interrupted once by edit-permission
flap; resumed on user "continua" with all writes succeeding.
