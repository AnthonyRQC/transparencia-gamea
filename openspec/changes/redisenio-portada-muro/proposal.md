# Proposal

## Why

The public portal (Welcome + information wall) reads as a generic template: a single-column card list with image-dependent cards that degrade to grey boxes when `portada_archivo_id` is null, filters that push content down on mobile, and no editorial hierarchy for pinned notices. Under Ley 974 the ticket-lookup hero is the citizen's critical task and the wall is the municipal actuality protagonist — both deserve an editorial surface (State Magazine / Gaceta Municipal) with Swiss/Andean rhythm and zero template look.

## What Changes

- Keep the ticket-lookup/registration hero dominant above the fold; apply an editorial skin (institutional typography, subtle chacana geometry, rombos cenefa micro-accent) without changing its behavior.
- Convert the wall below into a dense editorial grid: first pinned notice as full-width Lead Story with cenefa; remaining notices in a 2-column grid; collapse to 1 column on mobile with documentary filters folded on top (collapsible/Sheet).
- Render notices without cover image as pure typographic editorial headers (cenefa in tokens + institutional CITE + notice type in Outfit), preserving vertical rhythm with image cards; zero grey boxes, zero broken-photo icons.
- Keep server-side Inertia pagination behavior intact (`aplicar(p)` + `preserveState/preserveScroll` + `only: ['panel']`); re-skin only the numeric selector soberly with tokens; no infinite scroll.
- Apply pinned curation: only the first (most priority/recent) pinned notice takes Lead Story; secondary pinned notices render inside the 2-column grid with a gold `bg-secondary` "DESTACADO" badge.
- Enforce tokens-only styling: exclusively `bg-primary/text-primary`, `bg-secondary/text-secondary`, `bg-destructive/text-destructive`, `text-foreground`, `bg-background`, `bg-card`, `border-border`, `bg-teal-600/text-teal-600`; zero loose hex values in Tailwind classes.

## Capabilities

### New Capabilities

- `public-portal`: editorial presentation contract of the public portal (Welcome hero dominance + dense wall grid + typographic null-cover treatment + responsive collapse + sober server-pagination skin + tokens-only rule), preserving the existing public-consultation behavior contract.

### Modified Capabilities

(None — no spec-level behavior of `public-consultation` changes; lookup contract, date-only values, generic error, rate limit, dual tokens, business-day timeframes, accessible flow, and wall-public guarantees stay intact.)

## Impact

- Frontend: `resources/js/Pages/Welcome.tsx`, `resources/js/Components/Publico/PanelInformativo.tsx`, `resources/js/Components/Publico/AvisoCard.tsx` (+ `AvisoDetailModal`/`Paginacion` skins only as needed for consistency).
- Tokens: `resources/css/app.css` + `tailwind.config.js` (no new hex; audit only).
- No backend, route, query, DB, migration, auth, or copy-semantics changes; `MuroQuery`/pagination payload untouched.
