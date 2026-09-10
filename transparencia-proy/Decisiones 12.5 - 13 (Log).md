# Decisiones 12.5 → 13 (Log)

> **Propósito:** registro de una página con las decisiones tomadas el 09-sep-2026
> entre Sprint 12.5 (refactor) y Sprint 13 (portal). Para que otra sesión/IA no
> re-audite lo mismo. **Fecha:** 09-sep-2026. **Estado código al corte:** `main`
> incluye batches visuales 12.4 (PageHeader, PublicHeader, tokens) — cierre
> documental de 12.4 pendiente, no forma parte de este log.

## D1 — R1 antes del 13, R2 después (09-sep-2026)

- **Opciones:** (1) R1 antes + R2 después · (2) R1+R2.1-piloto antes · (3) full 12.5 antes.
- **Decisión:** opción 1. R1 (`semantica`, `formatDate×12`, `TecnicoAvatar`,
  `Paginacion server`, `ConfirmDialog`) es mecánico, reversible y con mismo output
  visual; es justo lo que el muro del portal va a copiar (chips, cards, fechas,
  paginación). R2 (`FormDialog ~20 modales`, `FiltrosCaso + hook` que toca queries)
  tiene blast radius alto y Sprint 16 (Roles: `session demo` → `Auth::user`) lo
  churnearía de nuevo → doble trabajo.
- **Consecuencia:** `Sprint 12.5 - Plan Refactor Mantenibilidad.md` se ejecuta
  R1 pre-13; R2.1 piloto post-14, R2.2 post-16. Ver `Deuda Tecnica y Riesgos.md`.

## D2 — Sprint 13 viejo DEPRECATED, nuevo Portal (09-sep-2026)

- **Motivo:** el §13 viejo (solo `TableroCasosCerrados` en Welcome) no cubre lo
  pedido: digitalizar el panel físico (instructivos, respuestas a notas,
  notificaciones a denunciantes, comunicados). El proyecto ya evolucionó así antes.
- **Decisión:** nuevo spec en `Sprint 13 - Portal Panel Informativo (Plan).md`,
  cortes 13.1 muro / 13.2 generales / 13.3 casos. §13 viejo se conserva con sello
  DEPRECATED por historia.
- **Mockups:** `portal-informativo/` es guía visual, se adapta a `DESIGN.md`,
  no se importa (stack incompatible: CDN Tailwind, Public Sans, navy/teal,
  Material Symbols vs Outfit/morado/shadcn/lucide/dark).

## D3 — Todo anonimizado público, PIN solo privado (09-sep-2026)

- **Decisión:** muro con `DEN-2026-XXXX` + fórmulas tipo "identidad reservada del
  caso N se le comunica…", sin PIN de 4 dígitos ni PII. PIN solo en `/seguimiento`.
- **Consecuencia:** whitelist en el plan (§4) + aprobación Jefe obligatoria para
  avisos de casos (borrador precargado, nunca auto-publicar).

## D4 — Un form general + caso estructurado (09-sep-2026)

- **Decisión:** generales = formulario email simple (título, cuerpo, tipo,
  prioridad, adjuntos, vigencia; exige cuerpo o PDF). Casos = publicación
  estructurada vinculada (`denuncia_id` + `evento`), más trabajo, carril separado.
- **Tipos como catálogo BD** (`tipos_publicacion`, `prioridades_publicacion`),
  gestionados por el Jefe como `feriados`/`clasificaciones` (Panel 7→9 pestañas).

## D5 — Skills: manual manda, skills como revisores (09-sep-2026)

- `vercel-react-best-practices` descartado como driver (asume Next.js/Vercel;
  stack real: Laravel 13 + Inertia v2 + React 18 + Tailwind v3 + Vite).
- `laravel-inertia-react` (AsyrafHussin) encaja en stack pero va en Inertia 1.0+
  y empuja `useForm` (proyecto usa `router.post+toast`): solo revisor puntual,
  no driver. Auditorías full (`technical-debt`, `database-optimization`,
  `owasp-security`, `e2e-playwright`) en Sprint 21, no ahora (16/17 las
  invalidarían).

## D6 — Backend full a Sprint 21 (09-sep-2026)

- **Decisión:** auditoría backend completa (N+1, índices `users.activo`, roll-up
  árbol 185 nodos, `CatalogoController:527`, `43× as any` resto, split
  `routes/web.php`) cuando el sistema esté completo (post-16/17/18), en Sprint 21.
- **Antídoto anti-arrastre pre-13:** solo mini-check de lo que el 13 necesita
  (query `cerrada` + `with clasificacion` + índice `estado/cerrado_at`) +
  guardarraíl: no nuevos wrappers `formatDate`, no avatares manuales, importar de
  los shared nuevos.

## D7 — Color de avatar a paleta oficial, todo en Sprint 18 (10-sep-2026)

- **Hallazgo:** `users.color` guarda clases Tailwind arbitrarias (`bg-purple-500`,
  `bg-blue-500`… en `UserSeeder`) fuera de la paleta oficial y sin `safelist` en
  `tailwind.config.js` → probablemente sin CSS generado en build; además `Header`
  lo consume como hex en `style={{ backgroundColor }}` → cae a `bg-sidebar-accent`.
- **Decisión:** nada ahora; todo en Sprint 18 (Panel Usuario / gestión de usuarios):
  hook `creating` asigna random de paleta oficial (guardar **clave**, no clase CSS),
  picker en Perfil (hoy avatar read-only), migración de legacy `bg-*`,
  `TecnicoAvatar` resuelve clave → clase literal (garantiza CSS en build + dark).
- **Paleta propuesta** (texto blanco, literales en fuente): `bg-primary`,
  `bg-teal-600`, `bg-amber-500`, `bg-[#431377]`, `bg-secondary`, `bg-slate-500`.
