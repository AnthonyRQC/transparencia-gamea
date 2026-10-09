# Tasks

## 1. AvisoCard editorial variants

- [x] 1.1 Added `TypographicHeader` variant for null-cover avisos (cenefa strip in `bg-primary`/`bg-secondary` tokens + CITE mono uppercase + type badge + Outfit title, same card shell/padding) and verified by rendering an imageless aviso next to an image aviso with matching row rhythm and no grey box/broken icon.
- [x] 1.2 Added `LeadStory` full-width variant (larger Outfit title, cenefa, capped media height per breakpoint) used only for the first pinned aviso and verified by rendering a pinned wall where exactly one card spans `col-span-full`.
- [x] 1.3 Added gold `bg-secondary`/`text-secondary-foreground` "DESTACADO" badge path for secondary pinned grid cards and verified badge legibility in light and dark themes.

## 2. PanelInformativo dense grid, filters, pagination skin

- [x] 2.1 Computed `lead` (first `fijada`) once and rendered `LeadStory` full-width + remaining `AvisoCard` in `1col → md:2col` grid inside the existing `lg:col-span-9`, preserving `onVer`/`AvisoDetailModal` wiring, and verified with pinned, unpinned, and single-notice walls.
- [x] 2.2 Folded the documentary filter `aside` on mobile (collapsed disclosure/Sheet trigger with active-filter count above the grid; sticky card unchanged on desktop), reusing `aplicar`/`limpiar` handlers, and verified every filter applies identically on mobile and desktop viewports.
- [x] 2.3 Re-skinned `<Paginacion mode="server">` soberly with tokens only (active page `bg-primary`/`text-primary-foreground`, borders `border-border`), keeping `aplicar(p)` + `preserveState/preserveScroll` + `only: ['panel']` untouched, and verified page changes issue identical paged requests with no infinite scroll.

## 3. Welcome hero editorial skin

- [x] 3.1 Applied editorial hero skin (display Outfit headline, rule line, rombos cenefa micro-accent, faint chacana wash `pointer-events-none`, 60-30-10 balance) without touching lookup inputs/actions, and verified hero stays above the fold on desktop and mobile with dark-mode parity.
- [x] 3.2 Preserved `aria-live` announcements, visible focus indicator, and keyboard operability across hero and wall, and verified by completing a lookup and a filter change via keyboard in both themes.

## 5. Editorial depth with official symbols (follow-up)

- [x] 5.1 Created `RomboLogo.tsx` (className/size/fill) and `SimboloS.tsx` (className/size/stroke) from the official SVGs and verified `npm run build` (tsc+vite) clean.
- [x] 5.2 Replaced the generic CSS-diamond cenefa with `<RomboLogo />` row (tokens alternating, gold center) and verified no grey boxes remain.
- [x] 5.3 Added `<SimboloS />` watermark (`opacity-[0.03]/[0.04]`, `pointer-events-none`, desktop-only) to the wall section and verified text legibility.
- [x] 5.4 Applied wall base (`bg-muted/20`), real card elevation (`border-border/80 shadow-sm hover:shadow-md`), and top `aspect-video` image above the headline, and verified the phpunit suite stays green.

## 6. Andean identity pass (follow-up)

- [x] 6.1 Inverted `RomboLogo` fills (solid token exterior via `fill`/`currentColor`, white openwork interior) and verified `npm run build` clean.
- [x] 6.2 Replaced the cenefa with a full-bleed 16-rombo band (size 15) cycling the official GAMEA sequence `text-primary → text-destructive → text-teal-600 → text-secondary` and verified zero hex in Tailwind classes.
- [x] 6.3 Switched `SimboloS` stroke default to `currentColor`, raised wall watermarks to `opacity-[0.08]/[0.10]`, replaced the generic `rotate-45` hero boxes with `<SimboloS size={380} className="text-secondary opacity-[0.08]" />`, and verified build + suite green.

## 7. Canonical triple-diamond (follow-up)

- [x] 7.1 Rebuilt `RomboLogo` from `tres-rombos.svg` (`viewBox 0 0 200 200`: exterior + interior in `fill`/`currentColor`, white middle ring) and verified `npm run build` clean.
- [x] 7.2 Raised cenefa rombos to size 17 keeping the 4-color GAMEA cycle and verified zero hex in Tailwind classes (only the ordered `#ffffff` ring).
- [x] 7.3 Confirmed `SimboloS` `currentColor` default; set both wall watermarks to `text-secondary` (`opacity-[0.08]/[0.10]`); Hero keeps the gold `size={380}` anchor; verified build + suite green.

## 8. Nivel 2 Vitrina de Difusión + 4 niveles (follow-up)
- [x] 8.1 Added `difusion` to `CatalogoSeeder::crearTiposPublicacion` and registered it live via tinker (`firstOrCreate`, `activa=true`, id 8; note: model key is `activa`, not `activo`).
- [x] 8.2 Split `MuroQuery`: extracted `mapear()` shared mapper, added independent `vitrina` query (≤5 `difusion`, same array shape), excluded `difusion` from `baseQuery` when no explicit `tipo` filter; verified `artisan test --filter=PublicacionMuroTest` 10/10.
- [x] 8.3 Created `VitrinaDifusion.tsx` (null when empty; single full-width lead banner; 2–5 magazine mosaic with stretching lead; detail via shared `onVer` or internal modal) using only tokens and verified `npm run build` clean.
- [x] 8.4 Orchestrated 4 levels in `Welcome.tsx` (Hero → Vitrina → Gaceta → Garantías + shared `AvisoDetailModal`) with 5 `SimboloS` watermarks (hero secondary 380/0.08; vitrina teal-600 320/0.07; gaceta destructive 420/0.07 + primary 340/0.08; garantías secondary 300/0.08) and verified the full suite stays green.

## 9. Bleed cards + direct campaign form (follow-up)

- [x] 9.1 Created `VitrinaCard.tsx` (full-bleed photo + gradient overlay + gold badge + white floating text + `Ver afiche completo` affordance + lightbox; gradient fallback without image) and switched `VitrinaDifusion` off `AvisoCard` (single tall banner / magazine mosaic); verified `npm run build` clean.
- [x] 9.2 Added `Nueva Campaña / Difusión` (gold-tint) + `Nuevo aviso formal` buttons in `Publicaciones.tsx` header with `tipoInicial` preset; `PublicacionFormModal` switches to campaign mode by selected type (title, hides CITE/Emisor/Destinatario/Referencia, visual-first labels + 16:9 guide); verified full suite green.

## 10. Difusión tab + reorder + hardened modal (follow-up)

- [x] 10.1 Reworked `mover()` for difusion (no `fijada` required, context-isolated neighbors, zero-state 1..N normalization, self-match guard) with `mover_difusion_sin_fijar_y_vecinos_aislados` test; verified `artisan test` full green.
- [x] 10.2 Split admin into 3 tabs (Borradores / Publicados formales con fijados primero / Difusión con todo) with per-tab counters and a dedicated Difusión table (Posición #N + gold LEAD, thumbnails with ImageIcon fallback, title+resumen, estado, subir/bajar + publicar + editar + eliminar); verified `npm run build` clean.
- [x] 10.3 Hardened the difusion modal (locked `DIFUSIÓN (Vitrina de Portada)` badge instead of selector, auto `prioritario` on open and on manual switch, hides CITE/Fecha/Emisor/Destinatario/Referencia, campaign-first labels); verified zero hex in touched files.

## 12. Opción A + bleed proportions (follow-up)

- [x] 12.1 Reworked `VitrinaDifusion` header (H2 `Difusión institucional` + subtitle, 9-rombo concentric guard cycling the 4 GAMEA colors) and layout Opción A (full-width lead + compact `resto` grid via `cn()` by count); verified `npm run build` clean.
- [x] 12.2 Rebuilt `VitrinaCard` with `variant: 'lead' | 'secondary'` (fixed horizontal heights 320/360/390 vs 200/225, no DIFUSIÓN badge, gradient + expand kept, lead-only meta + affordance); verified zero hex + `PublicacionMuroTest` green.

## 14. Horizontal gaceta + unified badge + dense cenefa (follow-up)

- [x] 14.1 Reworked `PanelInformativo` header (H3 UTLCC, overline removed) and returned the wall to a 1-column vertical list of horizontal cards (pinned lead first, no `destacado` prop); verified `npm run build` clean.
- [x] 14.2 Rebuilt `AvisoCard` as a media object (left photo column `sm:w-1/3 aspect-video/sm:aspect-[4/3]` + right documentary column with badges/title/resumen/2-col meta/files/date; imageless typographic card with top cenefa + gold left border) with a single gold `Fijado` badge; verified `PublicacionMuroTest` green.
- [x] 14.3 Made `Cenefa` dense and centered (24 rombos size 15, `gap-2.5`, `justify-center`, overflow-hidden) so wide cards no longer stretch the guard.

## 15. Lightbox event fix + rombo guard + full-height photo (follow-up)

- [x] 15.1 Guarded `AvisoDetailModal` `DialogContent` with `onPointerDownOutside`/`onInteractOutside` (no close while lightbox open) and strict-backdrop close in `Lightbox` (`e.target === e.currentTarget`, `bg-black/90`); verified `npm run build` clean.
- [x] 15.2 Replaced the gaceta hairline divider with the 9-rombo concentric guard (same as difusión); verified visually via readback.
- [x] 15.3 Removed `Cenefa` from all `AvisoCard`s, made the photo column `self-stretch` with full-height cover button (`absolute inset-0` img for true cover), and added the `SimboloS` watermark + `border-l-4 border-secondary/80` to imageless cards; verified `PublicacionMuroTest` green.

## 16. Portal lightbox + pure photo column (follow-up)

- [x] 16.1 Mounted `Lightbox` on `document.body` via `createPortal` with disciplined `z-[60]` (above `z-50` modals) + SSR guard; verified `npm run build` clean.
- [x] 16.2 Cleaned the `AvisoCard` photo column to full height (`h-full min-h-[200px]`, minis grid removed, extras reachable via lightbox arrows) with a `+N fotos` badge, and removed the card-level `SimboloS` watermark to preserve contrast; verified `PublicacionMuroTest` green.

## 18. TipTap sync + actions dropdown + formal types filter (follow-up)

- [x] 18.1 Added the reactive `value → editor` sync effect in `EditorRico` (with `{ emitUpdate: false }` — bare `false` fails `tsc`); verified `npm run build` clean.
- [x] 18.2 Filtered `difusion` out of the formal form's type selector (`tiposFormales`); campaign keeps its locked badge; verified `PublicacionAdminTest` green.
- [x] 18.3 Replaced the 6-icon `AccionesFila` matrix with a labeled `DropdownMenu` (edit campaign/aviso, publish, pin only formals, move when pinned-or-difusion, separated destructive delete); verified build + tests green.

## 19. Tactile Opciones trigger + mobile unification (follow-up)

- [x] 19.1 Replaced the icon-only trigger with a bordered `Opciones` labeled button (`w-52` menu) and contextual delete (`campaña`/`aviso`); verified `npm run build` clean.
- [x] 19.2 Replaced the loose mobile-difusión buttons with the shared `AccionesFila`; verified `PublicacionAdminTest` green.

## 20. Hybrid reorder control (w6:p1)

- [x] 20.1 Scoped `AccionesFila` move items to pinned non-difusión (no duplicate arrows for difusion); verified `npm run build` clean.
- [x] 20.2 Built the desktop difusion hybrid cell (bordered ↑↓ pill with edge `disabled` + `AccionesFila`); verified build green.
- [x] 20.3 Built the tactile mobile difusion row (outline Subir/Bajar with edge `disabled` + `AccionesFila`); verified `PublicacionAdminTest` green.

## 17. Pointer-events unblock + stable 4:3 column (follow-up)

- [x] 17.1 Hardened `Lightbox` against the Radix pointer-events shutdown (`pointer-events-auto` class + inline style, `z-[70]`, `bg-black/95`, `aria-modal`, mono counter caption, per-control `stopPropagation`); kept the `DialogContent` outside-guards; verified `npm run build` clean.
- [x] 17.2 Stabilized the `AvisoCard` photo column (`self-start`, fixed `sm:w-60 md:w-64`, `aspect-[4/3]` cover, no chimney stretch) with a compact 2-mini strip (`h-14`, overflow `+N` veil on the last); verified `PublicacionMuroTest` green.

## 13. Lead height + compact spacing (follow-up)

- [x] 13.1 Raised `VitrinaCard` lead to `h-[400px] sm:h-[440px] md:h-[470px]` and secondary to `h-[210px] sm:h-[230px]` via `cn()`; confirmed the DIFUSIÓN badge stays removed.
- [x] 13.2 Set `VitrinaDifusion` to `space-y-2.5` with centered `max-w-md` secondaries (≤2) and symmetric `gap-2.5` grid (≥3); verified build + `PublicacionMuroTest` green.

## 11. Hero redesign + GAMEA white logo (follow-up)

- [x] 11.1 Created `LogoBlancoGamea.tsx` from `logo-blanco-gamea.svg` (`viewBox 0 0 848 662`, 6 paths + 7 groups verbatim, all `fill="currentColor"`, default `h-10 w-auto text-white`) via script generation + readback verification; verified zero hex/`rgba()`.
- [x] 11.2 Replaced the Jacha photo circular `InstitutionalLogo` badge with `<LogoBlancoGamea className="h-10 sm:h-12 w-auto text-white" />` and removed the now-unused import/`Eye`.
- [x] 11.3 Applied the approved neutral copy (UTLCC kicker, H1 `Transparencia en cada etapa de tu denuncia`, trámite bajada, `Rastrear caso por ticket` CTA, single Ley 974 identity-guarantee row) and verified `npm run build` + `PublicacionMuroTest` green.
- [x] 11.4 Added the left-column `SimboloS size={360} text-secondary opacity-[0.06]` watermark (`-z-10`, desktop-only); right anchor untouched.

## 4. Integration verification (no commit)

- [x] 4.1 Ran tokens-only audit (`#[0-9a-fA-F]` scan over touched `.tsx`, comments excluded) plus direct readback of touched files and `git diff --stat`, and verified zero loose hex and intended file set on `feature/redisenio-portada-muro`.
- [x] 4.2 Ran `npm run build` and the phpunit suite (`& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" vendor/phpunit/phpunit/phpunit`), recorded `<command>: <observed result>` in `odd/tasks/redisenio-portada-muro.md`, left changes uncommitted for Lazygit review, and STOPPED before commit.

## Workflow follow-up

- Apply the change after this proposal is approved (explicit apply request starts implementation; no React code is written in this planning change).
- Archive the change after review requirements are satisfied.
