# DESIGN.md — Sistema UTLCC / GAMEA

> Fuente de verdad visual. Actualizado post Sprint 12.2 (Sep 2026). Modo impeccable: **Operate**.
> Audiencia: Jefe de Unidad y técnicos, abogados no-técnicos. Hardware: 15" 1280×720 sin scroll + Full HD, light y dark.

---

## 1. Paleta institucional

Definida en `resources/css/app.css` como variables OKLCH (espacio perceptual uniforme).

| Token CSS | Hex referencia | Uso semántico | Contraste verificado |
|---|---|---|---|
| `--primary` | `#4B0090` morado | Proceso / marca / links activos | blanco encima **12.34 : 1** ✅ AAA |
| `--primary` dark | `#A855F7` aprox | Igual en dark mode | — |
| `--secondary` | `#F5B400` dorado | Aviso / acento sidebar | texto morado oscuro **7.14 : 1** ✅ / blanco **1.84 : 1** ❌ **prohibido** |
| `--sidebar` | `#1E0A33` morado casi negro | Fondo sidebar + header (igual en light y dark) | blanco **~14 : 1** ✅ AAA |
| `--destructive` | `#C6006B` | Alerta / botón peligro | blanco **5.81 : 1** ✅ AA |
| teal `#008F89` | — | Solo rellenos gráficos / positivo | texto `teal-700` sobre claro; nunca blanco encima (3.97 ❌) |
| magenta `#F4007A` | — | Solo barras "vencido" en Recharts | jamás como color de botón o texto |

**Regla de semántica fija — no romper:**
- 🟣 Morado = proceso / marca
- 🟢 Teal = positivo / en plazo / éxito
- 🩷 Magenta = alerta / vencido / crítico (solo gráficos)
- 🟡 Dorado = aviso (siempre con texto oscuro encima, nunca blanco)
- ⬜ Gris (`muted`) = inactivo / terminal / sin datos

---

## 2. Tipografía

| Familia | Fuente | Uso |
|---|---|---|
| **Outfit** | Google Fonts | Todo el UI: títulos, labels, body, KPIs |
| **Fira Code** | Google Fonts | Tickets (`DN-0125`), código técnico, monoespaciado |

Escala contenida. KPIs en `font-semibold`, no se usa `font-mono` para datos numéricos normales.

---

## 3. Componentes canónicos

### Botones
Todos usan **`Button` de Shadcn/UI** (`resources/js/Components/ui/button.tsx`).

| Variante | Cuándo usar |
|---|---|
| `default` | Acción primaria (guardar, enviar, ingresar) |
| `outline` | Acción secundaria (cancelar, volver) |
| `destructive` | Acción destructiva (eliminar, rechazar con consecuencias) |
| `ghost` | Acciones en contexto (dentro de tablas, dropdowns) |
| `secondary` | Menos énfasis que default, más que outline |

> `PrimaryButton`, `SecondaryButton`, `DangerButton` en `resources/js/Components/Buttons/` son **thin wrappers** de compatibilidad. No usarlos en código nuevo.

### Formularios (Login / Perfil)
Todos los inputs heredan de los Form components en `resources/js/Components/Form/`:
- `TextInput` — usa tokens `border-input`, `ring-ring`, `text-foreground`
- `InputLabel` — usa `text-foreground`
- `InputError` — usa `text-destructive`
- `Checkbox` — usa `accent-primary`

### Fechas
Función única en **`resources/js/helpers/fechas.ts`**:

| Función | Formato de salida | Usar cuando |
|---|---|---|
| `formatearFechaCorta(d)` | `12 sep. 2026` | Tablas, chips compactos |
| `formatearFechaLarga(d)` | `12 de septiembre de 2026` | Detalles, modales, informes |
| `formatearFechaHora(d)` | `12 de septiembre de 2026, 14:35` | Timestamps de actividad |
| `hoyISO()` | `2026-09-08` | Valor inicial de `<input type="date">` |

> Nunca usar `new Date().toLocaleDateString(...)` inline. Toda lógica de fecha pasa por `fechas.ts`.

### Colores para Recharts
Fuente única en **`resources/js/helpers/tema.ts`**. Respeta `.dark` automáticamente.
No hardcodear `#4B0090` ni ningún hex en props de Recharts.

### Estado vacío
Componente único: **`resources/js/Components/Denuncias/Shared/ListaVacia.tsx`**
Props: `icon`, `titulo`, `descripcion`. No crear mensajes vacíos inline en páginas principales.

### Diálogos / Modales
Usar **`Dialog`** de Shadcn (`resources/js/Components/ui/dialog.tsx`).
El `Modal.tsx` Breeze legacy fue **eliminado en Sprint 12.3** (cero consumers).

---

## 4. Layout

| Componente | Archivo | Rol |
|---|---|---|
| `AppLayout` | `Components/Layout/AppLayout.tsx` | Layout principal autenticado (sidebar + header + dark mode + SSE) |
| `GuestLayout` | `Layouts/GuestLayout.tsx` | Login y páginas públicas (bg-background, tarjeta bg-card) |
| `Header` | `Components/Layout/Header.tsx` | Header institucional unificado |
| `Sidebar` | `Components/Layout/Sidebar.tsx` | Navegación lateral colapsable (colapsado: iconos centrados `gap-0 px-0`; logo UTLCC secundario en footer sobre pastilla blanca) |

**Regla cromática (Sprint 12.3, gusto del cliente):** navbar + sidebar en morado casi negro `#1E0A33`, idéntico en light y dark (formal). La página pública conserva su header oscuro propio.

> `AuthenticatedLayout.tsx` (Breeze) fue **eliminado en Sprint 12.3** (cero consumers; `AppLayout` es el único layout autenticado).

### Patrón de página estándar
```tsx
// Toda página autenticada
<AppLayout>
  <Head title="Mi Página" />
  <div className="py-6 px-4 sm:px-6 lg:px-8">
    <PageHeader icon={Icon} titulo="Título" subtitulo="Descripción corta" />
    {/* contenido */}
  </div>
</AppLayout>
```

---

## 5. Modo oscuro

Activado/desactivado por toggle en `Header`. Estado en `localStorage('dark_mode')`.
La clase `.dark` se aplica al `<html>`. Todos los tokens CSS tienen variante dark en `app.css`.

**Regla:** nunca usar colores hardcoded (`text-gray-700`, `bg-white`, `border-gray-300`).
Usar siempre tokens semánticos (`text-foreground`, `bg-card`, `border-border`, etc.).

---

## 6. Reglas generales

1. **Copy para abogados.** Sin jerga dev en la UI. "Técnico" no "usuario". "Caso" no "denuncia" en contexto interno.
2. **Color no es el único canal.** Los badges siempre llevan texto además del color.
3. **Anti-misclick.** Filas no clicables en tablas (solo botones explícitos con aria-label).
4. **Compute-or-defer.** Si no hay base para un porcentaje o tasa, mostrar "—" en vez de 0% o error.
5. **Un batch = un commit + build + tests + visto bueno visual.** Todo reversible con `git revert`.
6. **Modo impeccable: Operate.** Comandos: `critique`, `clarify`, `layout`, `colorize`, `distill`, `polish`, `adapt`, `audit`, `harden`, `typeset`. No `bolder`, `overdrive`, `delight`, `animate` (tono institucional serio).
7. **Jerarquía de logos:** GAMEA (`logo_url`) es principal (header + banner sidebar, intactos). UTLCC (`utlcc_logo_url`, SVG canónico + fallback PNG) es secundario: footer del sidebar expandido y pie de login, siempre sobre pastilla blanca (el morado del logo no contrasta sobre el sidebar oscuro). Nunca en el header interno.
