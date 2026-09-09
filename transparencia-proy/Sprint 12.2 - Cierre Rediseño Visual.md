# Sprint 12.2 — Cierre: Rediseño Visual (Impeccable)

> **Fecha:** 8 de septiembre de 2026
> **Rama:** `main` · Commits `ec40137` (batch-6) y `1fa5980` (batch-7)
> **Build final:** `tsc + vite` OK · exit 0 · 4578 módulos · sin errores TypeScript
> **Suite:** 88 tests (no regresión)

---

## Contexto

Sprint 12.1 cerró con tokens institucionales y gráficos migrados (paleta en `app.css`, `helpers/tema.ts`). El score de la auditoría impeccable era **21/40 "Aceptable"**. Sprint 12.2 ejecutó los 7 batches del `Roadmap Diseño Visual.md` para elevar ese score.

---

## Batches ejecutados

### Batch 1 — Clarify: Dashboard
- Chips de filtros con fechas localizadas ("7 ago → 5 sep")
- "Reset" → "Limpiar" en todos los filtros
- Tooltips en barras Recharts con contexto completo
- Textos de KPI reescritos para Jefe de Unidad (sin jerga dev)

### Batch 2 — Clarify: Bandeja / MisCasos / Sheet
- Estados unificados en todas las cards (`en_plazo`, `por_vencer`, `vencido`)
- "Ticket" estandarizado (antes alternaba con "Nro de denuncia")
- Plazo en lenguaje natural: "Vence en 5 días" / "Vencido hace 3 días"

### Batch 3 — Clarify: Modales + Seguimiento público
- Mensajes vacíos (`ListaVacia`) unificados con icon + título + descripción
- Errores de validación en español simple, nunca mensajes técnicos en la UI
- Página pública de seguimiento: estados legibles para ciudadano

### Batch 4 — Layout: Jerarquía y ritmo
- `PageHeader` institucional unificado en las 19 páginas autenticadas
- `YAxis width` estandarizado en todos los Recharts (truncación de etiquetas)
- Espaciados, KPIs y tablas con ritmo vertical consistente

### Batch 5 — Colorize: Paleta semántica
- Contraste WCAG AA verificado en todos los tokens
- Semántica fija: morado=proceso · teal=positivo · magenta=alerta · dorado=aviso
- Eliminadas todas las variantes ad-hoc de color en badges y chips

### Batch 6 — Distill: Quitar ruido *(commit `ec40137`)*
**Botones:**
- `PrimaryButton`, `SecondaryButton`, `DangerButton` convertidos a thin wrappers de `Button` Shadcn (variants `default`/`outline`/`destructive`)
- Sin romper ningún consumer existente (backward-compatible via `forwardRef`)
- Bundle de `PrimaryButton`: 0.78 kB → 0.23 kB

**Helper de fechas (`resources/js/helpers/fechas.ts`):**
- Añadidas: `formatearFechaLarga`, `formatearFechaHora`, `hoyISO`
- Eliminadas 16 funciones/expresiones `toLocaleDateString` inline dispersas en:
  - `MisCasos.tsx`, `Evaluaciones.tsx`, `ConsultarCasos.tsx`, `Bandeja.tsx`
  - `RegistroDenuncia.tsx`, `TablaReporte.tsx`, `DenunciaSheet.tsx`
  - `TabEvaluacionPrevia.tsx`, `SolicitudDetailModal.tsx`, `SolicitudCard.tsx`
  - `TablaArchivosCaso.tsx`, `TabInformeCierre.tsx`, `ResultadoSeguimiento.tsx`
  - `ItemNotificacion.tsx`, `ModalNotificarDescargo.tsx`, `ModalResponderSolicitud.tsx`
- `hoyISO()` reemplaza `new Date().toISOString().split('T')[0]` en inputs de fecha

**35 archivos · 234 inserciones · 226 borrados**

### Batch 7 — Cierre: Login/Perfil out of Breeze *(commit `1fa5980`)*
**`GuestLayout.tsx`:**
- `bg-gray-100` → `bg-background` (dark mode automático)
- Tarjeta `bg-white` → `bg-card` con `border-border`
- Logo en contenedor `bg-primary` con ring institucional
- Pie de página institucional: "Sistema de Transparencia — UTLCC · GAMEA"

**`Login.tsx`:**
- `<h1>` con texto "Iniciar sesión"
- `PrimaryButton` → `Button` Shadcn directo
- `text-gray-600` → `text-muted-foreground`
- Estado de éxito: chip teal institucional
- Spinner "Ingresando…" durante submit

**`Profile/Edit.tsx`:**
- `AuthenticatedLayout` (Breeze) → `AppLayout` (institucional con sidebar)
- Tarjetas con `bg-card`/`border-border`, destructive section con `border-destructive/20`

**`UpdateProfileInformationForm.tsx`:**
- `text-gray-900` → `text-foreground`, `text-gray-600` → `text-muted-foreground`
- Campo usuario deshabilitado: `bg-gray-100` → `bg-muted/50`
- `PrimaryButton` → `Button` Shadcn
- Confirmación: "✓ Guardado correctamente." en teal

**`UpdatePasswordForm.tsx`:**
- Todo traducido al español (era "Update Password", "Current Password", "Saved.")
- Tokens, `Button` Shadcn, confirmación teal

**`DeleteUserForm.tsx`:**
- Todo en español ("Delete Account" → "Eliminar mi cuenta")
- `Modal` Breeze → `Dialog` Shadcn (bundle: 32 kB → 2.38 kB)
- `DangerButton` → `Button variant="destructive"` con ícono `AlertTriangle`

**Form components legacy (ahora con tokens):**
- `InputLabel`: `text-gray-700` → `text-foreground`
- `TextInput`: `border-gray-300/indigo` → `border-input/ring-ring` (estilo Shadcn)
- `InputError`: `text-red-600` → `text-destructive`
- `Checkbox`: `indigo` → `accent-primary`

**11 archivos · 152 inserciones · 124 borrados**

---

## Resultado final

| Métrica | Antes (Sprint 12.1) | Después (Sprint 12.2) |
|---|---|---|
| Score impeccable | 21/40 "Aceptable" | ~34/40 estimado "Bueno" |
| Funciones fecha inline | 16+ dispersas | 0 (helper centralizado) |
| Sistemas de botones | 4 (Breeze×3 + Shadcn) | 1 (Shadcn único) |
| Componente empty state | múltiples ad-hoc | `ListaVacia` único |
| Dark mode en Login/Perfil | ❌ hardcoded grays | ✅ tokens automáticos |
| Inglés en UI | 12 strings | 0 |
| Bundle `PrimaryButton` | 0.78 kB | 0.23 kB |
| Bundle `DeleteUserForm` | 32 kB | 2.38 kB |

---

## Pendiente menor (no bloquea producción)

- `DESIGN.md` formal actualizado ✅ (hecho en este sprint)
- Re-correr critique impeccable para score oficial actualizado
- Variante sidebar negra (página pública ya la tiene — evaluar con cliente)
- Teclado completo en barras Recharts (P2 en `Deuda Tecnica y Riesgos.md`)
- `AuthenticatedLayout.tsx` Breeze y `Modal.tsx` Breeze sin consumers — se pueden eliminar en una limpieza futura

---

## Archivos clave

| Archivo | Rol |
|---|---|
| [`DESIGN.md`](../DESIGN.md) | Fuente de verdad del sistema de diseño |
| [`resources/css/app.css`](../resources/css/app.css) | Tokens OKLCH (paleta, dark mode, sombras) |
| [`resources/js/helpers/fechas.ts`](../resources/js/helpers/fechas.ts) | Helper centralizado de fechas |
| [`resources/js/helpers/tema.ts`](../resources/js/helpers/tema.ts) | Colores para Recharts (dark-aware) |
| [`resources/js/Components/Denuncias/Shared/ListaVacia.tsx`](../resources/js/Components/Denuncias/Shared/ListaVacia.tsx) | Componente único de estado vacío |
| [`resources/js/Layouts/GuestLayout.tsx`](../resources/js/Layouts/GuestLayout.tsx) | Layout de login (tokens + dark) |
| [`resources/js/Components/Layout/AppLayout.tsx`](../resources/js/Components/Layout/AppLayout.tsx) | Layout principal autenticado |
