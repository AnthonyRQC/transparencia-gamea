# Feature: Portada + Muro Editorial Redesign (Slice 4)

## Objective
Redesign the public portal (Welcome hero + PanelInformativo wall) as a dense editorial surface (State Magazine / Gaceta Municipal) with Andean micro-accents, keeping the ticket-lookup hero dominant and the wall below it. Zero generic-template look, tokens only.

## Problem
Current Welcome + wall reads as a generic template: single-column card list, image-dependent cards (grey boxes when `portada_archivo_id` is null), filters push content down on mobile, no editorial hierarchy for pinned notices.

## Why
User-approved grill Q1–Q4 (08-oct-2026): hero-first task-critical flow under Ley 974; dense wall as municipal actuality protagonist; impeccable principles (institutional typography, Swiss/Andean rhythm).

## Scope
- IN: `resources/js/Pages/Welcome.tsx` (hero stays dominant, editorial skin), `resources/js/Components/Publico/PanelInformativo.tsx` (dense grid + collapsible filters + sober server pagination skin), `resources/js/Components/Publico/AvisoCard.tsx` (typographic header with rombos cenefa for null portada; Lead-Story variant for first pinned), pinned curation rule, responsive collapse, tokens-only audit (`bg-primary/bg-secondary/bg-destructive/text-foreground/bg-background/bg-card/border-border/bg-teal-600`), dark-mode parity, `aria-live` + focus preserved.
- OUT: backend contract, routes, queries, pagination behavior, auth/permissions, DB migrations, copy changes beyond labels needed for layout.

## Constraints
- Strict color standard: zero loose hex in Tailwind classes; only official tokens in `app.css` + `tailwind.config.js`.
- 60-30-10: 60% neutral airy surfaces, 30% institutional, 10% micro-accents.
- No behavior change: `aplicar(p)` + `preserveState/preserveScroll` + `only: ['panel']`; wall stays public without token; contract fields unchanged.
- `npm run build` clean; phpunit suite green; no commit until user orders it (working tree stays uncommitted for Lazygit review).

## Authorized scope
- Read/write: `resources/js/Pages/Welcome.tsx`, `resources/js/Components/Publico/{PanelInformativo,AvisoCard,AvisoDetailModal,Lightbox,Paginacion}.*`, `resources/css/app.css` (tokens only, no new hex), `openspec/changes/redisenio-portada-muro/**`, `odd/tasks/redisenio-portada-muro.md`.
- Forbidden: push/merge/commit without explicit order; backend/DB/routes; migrations.

## Acceptance criteria
- [ ] Hero dominant above the fold; wall dense below.
- [ ] Null-portada avisos render typographic header with cenefa in tokens, same grid rhythm, no grey box/broken icon.
- [ ] Desktop: first pinned = Lead Story full-width; rest 2-col; mobile 1-col with filters collapsed on top.
- [ ] Server pagination behavior intact, numeric selector re-skinned soberly; no infinite scroll.
- [ ] Tokens-only audit passes (grep for `#[0-9a-fA-F]` in touched tsx = zero, except comments); dark-mode + `aria-live` verified.
- [ ] `npm run build` + suite green; branch `feature/redisenio-portada-muro` with uncommitted changes left for Lazygit review.

## Applicable checks
- `npm run build`; focused tsc/vite; `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" vendor/phpunit/phpunit/phpunit`; tokens grep; direct readback of touched files + `git diff --stat`.

## Route declaration
- Delegated-direct: mapping trigger (4+ files) satisfied by parent exploration; single writer for implementation. OpenSpec planning for proposal/spec/design/tasks (this change). No SDD apply until proposal approved.

## Tasks
- [x] T0 — Branch + OpenSpec proposal/spec/design/tasks + validate (planning only, no React code yet).
- [x] T1 — AvisoCard editorial variants (typographic null-portada header + Lead-Story + DESTACADO badge).
- [x] T2 — PanelInformativo dense grid + collapsible mobile filters + sober pagination skin.
- [x] T3 — Welcome hero editorial skin (dominant, tokens, cenefa/chacana subtle, dark parity, a11y).
- [x] T4 — Verification (build + suite + tokens/a11y readback), files list for Lazygit, STOP before commit.

## Progress
- 2026-10-08: doc created on branch `feature/redisenio-portada-muro`; grill Q1–Q4 confirmed; OpenSpec planning in progress.
- 2026-10-08: T1–T3 implemented (`/opsx:apply`); T4 verified green. Changes left UNCOMMITTED for Lazygit review per golden rule.
- 2026-10-08: S1–S3 follow-up (official symbols depth) implemented on same branch; T4 re-verified green. Still UNCOMMITTED.

## Verification evidence
- `Select-String hex/rgba over 4 touched tsx`: no output (zero matches) — tokens-only audit passes. Sole hex in `Components/Publico` is a pre-existing comment in `PublicHeader.tsx:13`, untouched.
- `npm run build`: `tsc && vite build` clean — 4610 modules, built in 35.67s.
- `php.exe vendor/phpunit/phpunit/phpunit`: OK (214 tests, 1635 assertions), 68s.
- `git diff --stat`: 3 files, 128 insertions(+), 36 deletions(-). No commit (awaiting explicit order).

## Verification evidence — S1–S3 (symbols depth)
- `Select-String '#[0-9a-fA-F]' over 6 touched tsx`: only `RomboLogo.tsx` official-asset fills (`#e10169` default inner, `#fff` outer) — zero hex in Tailwind classes.
- `npm run build`: `tsc && vite build` clean — 4609 modules, 7.59s.
- `php.exe vendor/phpunit/phpunit/phpunit`: OK (214 tests, 1635 assertions), 9.7s.
- `git diff --stat`: 3 files, 181 insertions(+), 90 deletions(-) + 2 new symbol components (`RomboLogo`, `SimboloS`). No commit (awaiting explicit order).

## Verification evidence — A1–A3 (andean identity)
- `Select-String '#[0-9a-fA-F]' over 6 touched tsx`: only `RomboLogo.tsx:33` inner openwork `fill="#fff"` (explicitly ordered) — zero hex in Tailwind classes.
- `npm run build`: `tsc && vite build` clean — 4612 modules, 7.64s.
- `php.exe vendor/phpunit/phpunit/phpunit`: OK (214 tests, 1635 assertions), 9.5s.
- No commit (awaiting explicit order).

## Verification evidence — B1–B3 (canonical triple diamond)
- `RomboLogo.tsx` rebuilt from `tres-rombos.svg`: polygons (100,10 190,100…), (100,42 158,100…), (100,74 126,100…); exterior+interior `fill`/`currentColor`, ring `#ffffff`.
- `Select-String '#[0-9a-fA-F]' over 6 touched tsx`: only the ordered `#ffffff` ring — zero hex in Tailwind classes.
- `npm run build`: `tsc && vite build` clean — 4612 modules, 7.63s.
- `php.exe vendor/phpunit/phpunit/phpunit`: OK (214 tests, 1635 assertions), 10.2s.
- No commit (awaiting explicit order).

## Verification evidence — C1–C5 (vitrina Nivel 2 + 4 niveles)
- `CatalogoSeeder::crearTiposPublicacion` + tinker `firstOrCreate(['clave'=>'difusion'], ['nombre'=>'DIFUSIÓN','activa'=>true])`: row id 8, `activa=true` (correction: model key is `activa`, directive said `activo`).
- `artisan test --filter=PublicacionMuroTest`: 10 passed (8 existing + `vitrina_difusion_desacoplada_de_gaceta` + `vitrina_limitada_a_cinco`), 179 assertions. Gotcha fixed: same-second `publicado_at` ties order nondeterministically → test uses staggered `subMinutes`.
- `Select-String '#[0-9a-fA-F]' over 7 touched tsx`: only the ordered `#ffffff` ring — zero hex in Tailwind classes.
- `npm run build`: `tsc && vite build` clean — 4612 modules, 7.67s.
- Full suite `vendor/phpunit/phpunit/phpunit`: OK (216 tests, 1674 assertions), 8.9s.
- No commit (awaiting explicit order).

## Verification evidence — D1–D3 (bleed cards + campaign form)
- `Select-String '#[0-9a-fA-F]' over VitrinaCard/VitrinaDifusion/Publicaciones/PublicacionFormModal`: no output — zero hex.
- `npm run build`: `tsc && vite build` clean — 4612 modules, 7.98s. (Tailwind 3.4.19 installed → `line-clamp-2` core OK.)
- Full suite: OK (216 tests, 1674 assertions), 9.5s.
- `git diff --stat`: 8 files, 348 insertions(+), 127 deletions(-) + 2 new (`VitrinaCard`, `VitrinaDifusion` + 3 symbols).
- Gotcha fixed: duplicated `const set` after inserting `esDifusion` block in modal — removed before build.
- Backend untouched for campaign submit: hidden `emisor` keeps `UTLCC` default so `required` rule passes.
- No commit (awaiting explicit order).

## Verification evidence — E1–E4 (difusion tab + reorder + hardened modal)
- `artisan test` full: 217 passed (1679 assertions), 8.66s — incl. new `mover_difusion_sin_fijar_y_vecinos_aislados` (zero-state normalize + isolation + formal gate).
- `npm run build`: `tsc && vite build` clean, 42.25s.
- `Select-String '#[0-9a-fA-F]' over VitrinaCard/VitrinaDifusion/Publicaciones/PublicacionFormModal`: no output — zero hex.
- No commit (awaiting explicit order).

## Verification evidence — F1–F3 (hero + GAMEA white logo)
- `LogoBlancoGamea.tsx` script-generated from `logo-blanco-gamea.svg` (6 paths + 7 groups verbatim, 7× `currentColor`, zero residual white/hex); readback verified.
- `Select-String '#[0-9a-fA-F]|rgba?\(' over Welcome/LogoBlancoGamea`: no output — zero hex.
- `npm run build`: `tsc && vite build` clean, 7.11s.
- `artisan test --filter=PublicacionMuroTest`: 10 passed (179 assertions).
- No commit (awaiting explicit order).

## Verification evidence — G1–G4 (Opción A + bleed proportions)
- `Select-String '#[0-9a-fA-F]' over VitrinaCard/VitrinaDifusion`: no output — zero hex.
- `npm run build`: `tsc && vite build` clean, 7.84s.
- `artisan test --filter=PublicacionMuroTest`: 10 passed (179 assertions).
- No commit (awaiting explicit order).

## Verification evidence — I1–I4 (horizontal gaceta + badge + cenefa)
- `npm run build`: `tsc && vite build` clean, 7.30s.
- `artisan test --filter=PublicacionMuroTest`: 10 passed (179 assertions).
- `destacado` prop removed from `AvisoCard`; single gold `Fijado` badge; wall back to 1-column list.
- No commit (awaiting explicit order).

## Verification evidence — J1–J4 (lightbox fix + guard + full-height photo)
- `npm run build`: `tsc && vite build` clean, 37.80s.
- `artisan test --filter=PublicacionMuroTest`: 10 passed (179 assertions), 60.5s.
- `Cenefa` fully out of `AvisoCard`; photo button `h-full min-h-[180px]` with absolute cover img; tipographic cards carry the S watermark.
- No commit (awaiting explicit order).

## Verification evidence — K1–K3 (portal lightbox + pure photo column)
- `npm run build`: `tsc && vite build` clean, 7.96s.
- `artisan test --filter=PublicacionMuroTest`: 10 passed (179 assertions).
- Lightbox on `document.body` (`z-[60]`); minis grid removed (arrows cover extras); `+N fotos` badge; card watermark removed.
- No commit (awaiting explicit order).

## Verification evidence — M1–M4 (tiptap sync + dropdown + types filter)
- `npm run build`: first pass failed `tsc` (bare `false` in `setContent`) → fixed with `{ emitUpdate: false }`; clean, 9.64s.
- `artisan test --filter=PublicacionAdminTest`: 15 passed (71 assertions).
- Snippet tail repaired: proper `DropdownMenuSeparator` + `Eliminar aviso` item (directive text was truncated).
- No commit (awaiting explicit order).

## Verification evidence — N1–N3 (tactile Opciones + mobile unification)
- `npm run build`: `tsc && vite build` clean, 9.50s.
- `artisan test --filter=PublicacionAdminTest`: 15 passed (71 assertions).
- Single `AccionesFila` everywhere (desktop formal, desktop difusión, mobile both).
- No commit (awaiting explicit order).

## Verification evidence — O1–O4 (hybrid reorder w6:p1)
- `npm run build`: `tsc && vite build` clean, 9.12s.
- `artisan test --filter=PublicacionAdminTest`: 15 passed (71 assertions).
- Mover pill outside the dropdown for difusion (1-click); menu keeps move only for pinned formals.
- No commit (awaiting explicit order).

## Verification evidence — L1–L3 (pointer-events unblock + 4:3 column)
- `npm run build`: `tsc && vite build` clean, 8.42s.
- `artisan test --filter=PublicacionMuroTest`: 10 passed (179 assertions).
- Root cause honored: Radix kills pointer events outside its tree → explicit `pointer-events-auto` + `z-[70]`; column fixed `sm:w-60 md:w-64 aspect-[4/3] self-start`.
- No commit (awaiting explicit order).

## Verification evidence — H1–H3 (lead height + compact spacing)
- `npm run build`: `tsc && vite build` clean, 7.89s.
- `artisan test --filter=PublicacionMuroTest`: 10 passed (179 assertions).
- Badge DIFUSIÓN confirmado ausente (removido en ronda G; sin reintroducción).
- No commit (awaiting explicit order).
