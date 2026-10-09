# Design

## Context

See `proposal.md` (Why) and `specs/public-portal/spec.md` (behavior contract). Current state (verified on disk): `Welcome.tsx` renders `PublicHeader` + hero grid (`grid-cols-1 lg:grid-cols-2`) + `<PanelInformativo>`; `PanelInformativo.tsx` uses `grid grid-cols-1 lg:grid-cols-12` with `aside lg:col-span-3` filters and `div lg:col-span-9` single-column `AvisoCard` stack + `<Paginacion mode="server">` driven by `aplicar(p)` (`preserveState/preserveScroll`, `only: ['panel']`); `AvisoCard.tsx` picks `portada` from image attachments and falls back to a text-only layout when `imagenes` is empty. Tokens live in `resources/css/app.css` (OKLCH vars) + `tailwind.config.js` (token palette + safelist). No backend change is needed.

## Goals / Non-Goals

**Goals:**

- Editorial hero-first composition with Swiss rhythm (strong display type, generous whitespace, rule lines) and Andean micro-accents (rombos cenefa strip, subtle chacana geometry) inside the 60-30-10 balance.
- Deterministic card system: `LeadStory` (first pinned, full-width), `GridCard` (regular + secondary pinned with DESTACADO badge), `TypographicHeader` (null-cover) sharing one rhythm.
- Responsive collapse decided in layout, not per-card: content grid `1col → md:2col`, filters folded on mobile.

**Non-Goals:**

- No change to lookup contract, `MuroQuery` payload, pagination semantics, auth, routes, DB, or wall-public guarantee.
- No new palette, font files, or image assets; no copy rewrite beyond layout labels.
- No infinite scroll, no client-side page merging.

## Decisions

1. **Lead-Story selection in `PanelInformativo`, not in the card.** Compute `lead = avisos.data.find(a => a.fijada) ?? null` once; render it full-width (`col-span-full`) and the remainder in the 2-col grid. Rationale: single curation point guarantees "exactly one Lead Story"; alternatives (card self-promotion via index prop, backend flag) scatter the rule or require API change — rejected.
2. **Null-cover as `TypographicHeader` variant inside `AvisoCard`.** Header block: cenefa strip (CSS repeating-linear-gradient diamonds in `bg-primary`/`bg-secondary` tokens) + CITE (mono, uppercase) + type badge + Outfit title; same outer card shell/padding so grid rhythm matches image cards. Rationale: typography carries the editorial voice; alternatives (grey placeholder, initial-letter avatar, hiding the card) break rhythm or reintroduce generic look — rejected.
3. **Cenefa as pure CSS, no assets.** Repeating 45° gradient diamonds + one thin rule; chacana used only as a faint background geometry in the hero (low-opacity token wash, `pointer-events-none`). Rationale: zero assets, zero hex, dark-mode safe via tokens; SVG sprite considered but adds asset weight for a micro-accent — rejected for this slice.
4. **Mobile filters folded with native disclosure.** Wrap the existing `aside` content in the current sticky card on desktop; on mobile render it collapsed (`details`/Sheet trigger "Filtros") above the grid, reusing the same `aplicar/limpiar` handlers. Rationale: zero behavior fork between breakpoints; a separate mobile filter component would duplicate state — rejected.
5. **Pagination skin only.** Keep `<Paginacion mode="server">` props and `aplicar(p)` untouched; restyle buttons/active page with `bg-primary/text-primary-foreground`, `border-border`, `bg-muted` tokens. Rationale: behavior freeze eliminates regression surface; "cargar más"/infinite scroll rejected per Q4.
6. **Tokens-only enforcement by construction + grep.** Map every surface color to the 8 allowed tokens; verify with a literal `#[0-9a-fA-F]` scan over touched `.tsx` (comments excluded). Rationale: audit from the previous review stays green without a new lint plugin.

## Risks / Trade-offs

- [Lead-Story dominance on small data] → With 1–2 notices the Lead Story can feel oversized: cap its media height per breakpoint and keep the typographic header compact.
- [Cenefa noise at density] → Thin (4–6px) strip + single rule only on Lead Story and typographic headers; regular image cards get no cenefa to protect the 10% accent budget.
- [Dark-mode contrast of gold badge] → `bg-secondary` + `text-secondary-foreground` tokens already carry the dark variant; verify `DESTACADO` legibility in both themes during T4 readback.
- [Filter fold discoverability] → Collapsed trigger keeps active-filter count text (e.g. "Filtros (2)") so mobile users see state without expanding.
- [Grid orphan on odd counts] → Last odd card spans naturally; no stretch hack, preserving Swiss alignment over forced symmetry.

## Migration Plan

Frontend-only change on `feature/redisenio-portada-muro`; no migration, no config change. Rollback = abandon branch / revert work-unit commits. Delivery: work-unit commits per task (T1–T3) + verification (T4); all changes stay uncommitted until the user orders the commit (Lazygit review in panel 2).
