# DenunciaSheet Mobile — Compact Header + Metadata in Scroll

## Objective
Shrink the fixed Sheet header to identity + badges only on mobile, moving
secondary metadata into the scrollable Information tab.

## Scope
- `DenunciaSheet.tsx:218-243` — ultra-compact `SheetHeader` (ticket +
  badges, responsive title size) per verbatim spec.
- Metadata block (ingreso, vencimiento, wall link) moved to the top of
  `TabsContent value="info"` / `SheetInfoContent` in the compact card
  per verbatim spec.
- `avisosFaltantes` banner moved inside the scrollable container.

## Out of scope
- Behavior changes; new fields; PHPUnit changes.

## Acceptance criteria
- [ ] Fixed header shows only ticket + badges on all breakpoints.
- [ ] Metadata + missing-notice banner scroll with Information content.
- [ ] Wall link preserved with identical href.

## Verification
- `npm run build`: clean (tsc + vite, 4650 modules, 8.07s)
