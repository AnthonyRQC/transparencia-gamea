# Sprint 12.3 — Cierre: Pulido pre-13 (Impeccable)

> **Fecha:** 9 de septiembre de 2026
> **Rama:** `main` · Commits `3000beb` (A+B) · `c5ab5cc` (D) · `b2ec9b6` (C)
> **Build final:** `tsc` exit 0 · `vite` OK 38.65s · Suite **88 tests / 438 assertions** verde
> **Detector impeccable** sobre targets cambiados: exit 0, 0 findings

---

## Batch A+B — Re-critique + limpieza Breeze *(commit `3000beb`)*
- Snapshot: `.impeccable/critique/2026-09-09T12-00-00Z__resources-js-pages-dashboard-tsx.md`
- **Score oficial post-12.2: 25/40 "Aceptable" (diseño)**, detector limpio. Por debajo del ~34/40 estimado: el gap es consistencia/densidad/copy (H4=2, H8=2, H2=2), no paleta ni dark (sólidos AAA). P0/P1 (card clicable vs anti-misclick, 5 tabs + 7 contadores indistinguibles, 0 `PageHeader`, auto-preset) quedan en backlog — fuera del alcance pactado.
- Eliminados `Layouts/AuthenticatedLayout.tsx` (179L) y `Components/Modal.tsx` (71L): cero consumers verificado. `DESIGN.md` actualizado.
- Eliminado shim `app/Helpers/UppercaseText.php`; 19 modelos migran a `App\Traits\UppercaseText` (mismo comportamiento).

## Batch D — Deuda P1 ligera *(commit `c5ab5cc`)*
- `routes/dev.php` nuevo (Time Machine, dentro del grupo auth); `web.php` 204L → split dev fuera. Rutas verificadas (`dev.tiempo×3` + `design-system` registradas).
- `/design-system` con `abort_unless(app()->isLocal(), 404)` (antes público sin auth).
- `SharedPageProps` en `types/index.d.ts`: elimina `as any` en `AppLayout/Header/Sidebar/InstitutionalLogo` (cast tipado; el `PageProps` global impedía el genérico directo).
- No se tocó: splits L (Bandeja/TablaCatalogo), `as any` restantes fuera de Layout, seeders.

## Batch C — Morado casi negro + iconos + logo UTLCC *(commit `b2ec9b6`)*
- `--sidebar: #1E0A33` (`0.2033 0.0772 302.33`, conversión verificada contra token anterior) **igual en light y dark** — navbar (`Header bg-sidebar`) + sidebar juntos, formal a gusto del cliente. Regla en `DESIGN.md`.
- Colapsado: `gap-0 px-0 justify-center` — el label oculto ya no desplaza el icono (causa del desvío a la izquierda en la captura).
- `utlcc_logo_url => asset('LOGO-UTLCC.svg')` compartido global. SVG verificado vector real (32 KB, cero base64). PNG (73 KB) como fallback vía `onError` — sigue recortado en el subtítulo, el usuario lo re-exportará con aire sin tocar código.
- Logo UTLCC secundario sobre pastilla blanca (el morado `#431477` no contrasta sobre el sidebar oscuro): footer del sidebar expandido (`h-8`) + pie de `GuestLayout` (`h-9`). GAMEA intacto como principal; nunca en header interno (regla 7 de `DESIGN.md`).

---

## Verificación
| Check | Resultado |
|---|---|
| `tsc --noEmit` | exit 0 |
| `npm run build` | OK 38.65s |
| `php artisan test` | 88 passed, 438 assertions, 55s |
| `impeccable detect` (Sidebar/Header/Guest/app.css) | exit 0, `[]` |
| `route:list` dev.tiempo / design-system | 3 + 1 OK |

## Siguiente
Sprint 13 — Tablero Público Cerrados (`Welcome.tsx` + `SeguimientoController`). Base lista: tokens fijos, layouts tipados, rutas dev separadas, logos cableados.
