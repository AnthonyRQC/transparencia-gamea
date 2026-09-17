# Decisiones 12.5 → 13 (Log)

> **Propósito:** registro de una página con las decisiones tomadas el 09-sep-2026
> entre Sprint 12.5 (refactor) y Sprint 13 (portal). Para que otra sesión/IA no
> re-audite lo mismo. **Fecha:** 09-sep-2026. **Estado código al corte:** `main`
> incluye batches visuales 12.4 (PageHeader, PublicHeader, tokens) — cierre
> documental de 12.4 pendiente, no forma parte de este log.
>
> **Anexo 17-sep-2026:** D11–D17 (planificación) + D18–D25 (replan tarde: can:/CasoAuth,
> identidad CI+username, 18C recortado, sin RoleMiddleware).

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

## D3-rev — Publican Jefe + Registrador (10-sep-2026, revierte D3)
- D3 decía solo-Jefe para avisos de caso. Decisión final: Jefe + Registrador
  publican todo (generales y casos); el flujo sigue borrador → publicar con
  `publicado_por_id` como trazabilidad. Equipo de 5, sin cuello de botella.

## D8 — Congelamiento spec Sprint 13 (10-sep-2026, sin dudas abiertas)

1. Welcome sin página nueva (hero → consulta → panel → info → preguntas).
2. Ticket DEN completo visible/buscable; externos a `referencia_externa` libre.
3. Tipos seed (7): admitida, rechazada, cierre_caso, instructivo, respuesta_nota,
   comunicado, otro. Prioridades (3): ordinario, prioritario, urgente.
4. PDF-first, cuerpo-o-PDF, warning sin-adjunto (`ConfirmDialog confirm`).
5. Destinatario auto por escenario + downgrade puntual en el aviso.
6. Triggers admitida/rechazada/cerrada (checkbox default-on; borrador auto en cierre).
7. Unicidad (caso,evento) → banner Sheet + badge "Sin aviso".
8. Muro permanente (sin `vence_at`); fijadas por `orden` manual, resto recientes;
   botón seguimiento con parcial (sin PIN).
9. 14 campos de aviso (con `emisor` default UTLCC); publicado editable con
   fecha de actualización.
10. Fases 13.1 → 13.2 → 13.3. Detalle en `Sprint 13 - Portal Panel Informativo (Plan).md`.

## D9 — Indicador solo finales + botón Crear aviso (14-sep-2026)

- Badge/banner "Sin aviso" solo en rechazadas y cerradas (las admitidas en curso
  no generan ruido). `eventosEsperadosAviso()` sin rama admitida.
- Checkbox admisión default OFF (rechazo ON, cierre auto).
- Botón Crear aviso en el banner → `POST borrador-desde-caso` (crea o reutiliza,
  422 en estados sin evento) → Avisos con `?aviso=<id>` abriendo el form.
  Admin acepta `?aviso=` y `?buscar=` al montar (deep-links).
- SITPRECO (rechazo e informe) → `referencia_externa` del borrador.

## D10 — Editor rico + portada + lightbox + pack admin (14-sep-2026)

- TipTap limitado (negrita/cursiva/H3/listas) + DOMPurify al mostrar;
  `cuerpo` fuera de `UppercaseText` (rompería el HTML); texto plano intacto.
- Portada FK (`portada_archivo_id`, `nullOnDelete`); card 2-col + thumbs;
  `AvisoDetailModal`; lightbox custom con fix Radix (`stopPropagation`,
  reset al cerrar modal).
- Admin: tabs Borradores/Publicados, buscador no-reactivo + avanzada,
  orden fecha-doc default, `TablaResponsive` (patrón en `DESIGN.md`),
  multi-archivo con tope 5, `showPicker` nativo.
- Muro: boolean-AND + avanzada por campo + 12 meses/historial
  (`$request->boolean()`, no regla `boolean`) + FULLTEXT condicional.
- Requiere `php artisan migrate` en dev al recibir estos cambios
  (migraciones `000005`–`000007`).

---

# Anexo — Decisiones Sprint 14 → 18C (17-sep-2026)

> Sesión de planificación funcional (salto de demo a sistema operativo). Planes:
> `Sprint 16 - Plan (Rename + Roles).md`, `Sprint 18A - Plan Panel Usuarios.md`,
> `Sprint 18C - Plan Delegaciones.md`.

## D11 — Rol Admin + jerarquía de administración (17-sep-2026)

- **Decisión:** nuevo rol `admin`: **solo gestiona** (usuarios, catálogos, reportes como
  oversight); **NO opera casos** (sin `caso.*`, sin bandeja, sin mis-casos).
- **Jerarquía:** admin crea/edita a todos; **jefe crea jefe/investigador/registrador pero no
  admin**; admin no puede auto-desactivarse ni auto-degradarse; jefe tampoco puede tocar cuentas
  de admin (ni verlas en el panel).
- **Consecuencia:** el catálogo suma 5 permisos `usuario.*` + `menu.usuarios`; el Dashboard
  gana `esAdmin`; `/denuncias/consultar` sigue solo-registrador.

## D12 — Delegaciones temporales de funciones → Sprint 18C (17-sep-2026)

- **Problema real:** el Jefe necesita "mano derecha" (delegar casos, extraer informes, ver
  dashboard) y cubrir ausencias con un **Jefe interino**, sin compartir cuentas.
- **Decisión:** modelo **aditivo** de permisos: efectivo = base del rol ∪ delegaciones activas
  (tabla `delegaciones` con permisos JSON, `desde`/`hasta` **opcional**, motivo, otorgado/revocado
  por). Caducidad perezosa (sin cron). Sin "denials".
- **Quién otorga:** admin cualquiera; jefe solo desde **whitelist** (casos, reportes, consulta,
  avisos) y nunca `usuario.*`/`admin.*` (constrained delegation). Revoca el otorgante o un admin.
- **Atajos:** paquetes/presets (`PermisosCatalogo::PAQUETES`), incluido "Jefe completo".
- **Interino:** opera la bandeja completa como jefe (escenario propio, sin cuenta compartida);
  los casos del ausente no se traspasan automáticamente. Badge "JEFE INTERINO" derivado de
  delegación vigente. **Sin avisos automáticos de interinato** por ahora.
- **Cascadas:** desactivar/cambiar rol → revoca delegaciones activas.
- **Efecto en Sprint 25:** se adelanta solo la delegación temporal; el panel granular
  permanente sigue diferido a v2 (nota agregada en `Sprints Pendientes - Contexto.md`).
- **Descartado:** `spatie/laravel-permission` (su pivot no soporta vigencia; anti-patrón de
  permisos directos permanentes) y cuentas compartidas (rompe auditoría y Ley 974 Art. 29).

## D13 — Rename completo `técnico` → `investigador` (17-sep-2026)

- **Motivo:** el personal son licenciados/abogados; "técnico" no representa el cargo.
- **Alcance:** **completo** (586 identificadores / 64 archivos + 49 strings UI + docs).
  BD: `denuncias.investigador_id`, `investigador_anterior_id`, `users.rol='investigador'`,
  `RolUsuario::INVESTIGADOR`. No hay producción → **se editan migraciones originales**
  (sin migraciones de rename) y `migrate:fresh --seed`.
- **Se conserva:** "evaluación técnica previa" y `evaluaciones_tecnicas` (nombre de **proceso**
  del flujo, no de la persona).
- **Ubicación:** Fase 1 del Sprint 16 (misma superficie que tocarán roles/permisos).

## D14 — Reordenamiento del roadmap (17-sep-2026)

- **Orden:** 16 (rename + roles) → 18A (panel usuarios) → 18B (mi cuenta) → 18C (delegaciones)
  → 19/20 (pulidos) → 21 (cierre Fase 1).
- **Sprint 14 (Tiempos entre Fases): APARCADO** — agregado no pedido por el cliente; factibilidad
  analizada (sin migración, vía bitácora + `DiasHabiles`); placeholder `Hourglass` se mantiene.
- **Sprint 17 (auditoría) fusionado en 21** — es transversal y se re-auditaría tras 16/18A/18C.
- **Sprint 18 se divide:** 18A (admin usuarios) y 18B (self-service), secuenciales.

## D15 — Protección backend sin Policies (17-sep-2026)

- **Decisión:** `RoleMiddleware` + `EnsureActive` + **Gates por capacidad** registrados en loop
  desde `PermisosCatalogo`; **sin Policies por modelo** en 16 (record-scoping sigue en
  controllers; Policies se evalúan en 21).
- **Respuesta a no autorizado:** redirect `/dashboard` + toast (se estandarizan los `abort 403`
  de `ConsultaCasos`/`ReporteController`); invitado → `/login` (Breeze ya lo hace).
- **Split de `routes/web.php`** dentro de 16.2 (`denuncias`, `reportes`, `admin`, `cuenta`) —
  se reescriben las rutas con `can:` de todos modos; partirlo en 21 sería hacerlo dos veces.
- **Notificaciones/alertas** pasan de `rol==='jefe'` a "quienes tienen `caso.admitir`"
  (jefes + interinos).
- **EnsureActive:** usuario desactivado con sesión viva → logout + invalidación.

## D16 — Módulo de usuarios: invariantes e integridad (17-sep-2026)

- **Invariantes (transacción + `lockForUpdate`):** ≥1 admin activo, ≥1 jefe activo, no
  auto-baja/auto-degradación, no administrar nivel superior, nunca delete físico.
- **Desactivación con casos activos:** **bloqueo duro + traspaso en lote** a otro investigador
  (evita expedientes huérfanos en el relevo de gestión ~4 años). Acciones masivas para lotes.
- **Password:** política `min:10 + mayúscula + minúscula + número` (símbolos libres) +
  `debe_cambiar_password` obligatorio para usuarios creados/reseteados por panel; reset revoca
  sesiones y `remember_token`; `demo123` queda solo en seeds dev.
- **Username:** unicidad **case-insensitive** (MySQL ci — se mantiene y se corrige el doc que
  decía "case-sensitive"), charset `[A-Za-z0-9._-]{3,30}`. Nota tests: SQLite `:memory:` es
  case-sensitive → comparar con `lower()` explícito.
- **Trazabilidad en `users`:** `creado_por_id`, `desactivado_por_id`, `desactivado_at`,
  `motivo_baja` (**opcional**), `debe_cambiar_password`. Los `audits` de 21 dan el detalle fino.

## D17 — Pendiente Sistemas GAMEA: alcance admin + panel de auditoría (17-sep-2026)

- **Contexto:** Sistemas mencionó "por encima" un posible **panel administrativo de auditoría**
  (consultar auditoría sin SQL directo) y el alcance final del rol admin.
- **Estado:** **sin decidir**. No entra al alcance actual; registrado como nota en
  `AI-CONTEXT.md` (§ Notas/Pendientes) y `Deuda Tecnica y Riesgos.md` (B7). Si se confirma,
  se planifica como corte de Sprint 21 junto con `owen-it/laravel-auditing` (B6).
- **Ampliación (misma fecha, replan):** impersonation / «entrar como» otro rol **no entra
  a Fase 1**. Opciones futuras en `Notas - Admin simulacion (futuro).md`. Se consulta a Sistemas.

---

# Anexo — Replanificación 16 / 18A / 18C (17-sep-2026, tarde)

> Congela D18–D25. Enmienda D11 (4 `usuario.*`, no 5), D12 (preset `jefe_interino`, no
> «Jefe completo» con `usuario.*`), D13 (FK persona en `evaluaciones_tecnicas`) y D15
> (sin `RoleMiddleware`). Planes: `Sprint 16`, `18A`, `18C`.

## D18 — Auth: solo `can:` + `EnsureActive` (enmienda D15)

- **Sin `RoleMiddleware`.** `role:jefe` rompería al interino de 18C.
- Gates en loop desde `PermisosCatalogo`. Rutas con `can:<permiso>`.
- `can:` de Laravel tira 403: en `bootstrap/app.php`, `AuthorizationException` → redirect
  `/dashboard` + flash toast (Inertia). Invitado → `/login`.
- `EnsureActive`: usuario desactivado con sesión viva → logout + invalidar sesión.
- Login: buscar `lower(username)` y `Auth::login($user)` (SQLite de tests es case-sensitive).

## D19 — `CasoAuth`: unidad vs expediente (Policies en 21)

- **No Policies por modelo en 16.** Helper `CasoAuth` (o equiv.) en mutaciones:
  - **Unidad** (admitir, asignar, traspasar, reabrir, ampliar, archivar, editar/eliminar
    denuncia…): cualquier caso si tiene el permiso.
  - **Expediente** (iniciar, solicitud.*, descargo.*, informe.*, cierre.*, devolver
    evaluación): solo `investigador_id === auth.id` (evaluación: el asignado).
- Un investigador-interino **no** redacta informes ajenos: `caso.admitir` no bypasea
  expediente. 18C no retrabaja esta regla.
- Sprint 21: `DenunciaPolicy` de una línea que delega a `CasoAuth`.

## D20 — Rename de persona + quitar delete de perfil

- D13 se amplía: `evaluaciones_tecnicas.tecnico_id` → `investigador_id` (es persona).
  Se conserva tabla `evaluaciones_tecnicas`, estado `evaluacion_tecnica`, textos de proceso,
  `caso.evaluar`, `TabEvaluacionPrevia`.
- **16.2:** eliminar `DELETE /profile` + `DeleteUserForm`. Viola «nunca delete físico» (D16)
  y rompe FKs. No espera a 18B.

## D21 — Identidad de usuario (18A)

- Campos: `nombres` y `apellidos` (ambos obligatorios, uno o más tokens cada uno, MAYÚSCULAS).
  `name` se arma: `NOMBRES APELLIDOS`.
- `ci` único (también inactivos), `varchar(20)`, no solo dígitos (`123456-1A` / `123456-1B`).
  Normalizar: trim, mayúsculas, sin espacios. Un CI inactivo → reactivar, no crear otro.
- **Username autogenerado e inmutable:** 1ª letra del 1er nombre + 1ª del 1er apellido + CI
  (`ANTHONY QUISPE` + `997788878` → `AQ997788878`). Login con ese username (case-insensitive).
  `users.username` `varchar(30)`.
- Email y teléfono **opcionales**; email único si existe.
- `usuario.*` son **4:** `crear`, `editar`, `desactivar`, `reset-password` (+ `menu.usuarios`).
  Reactivar usa `usuario.desactivar`. (Enmienda D11 «5 usuario.*».)

## D22 — Jerarquía 18A (Sistemas + jefes)

- **Admin (Sistemas):** crea/edita/desactiva **todos** los roles, incluidos otros admins
  (vacaciones y recambio de personal de Sistemas). Cada persona de Sistemas tiene **su**
  usuario; nunca un login `admin` compartido. Admin no opera casos (D11 se mantiene).
- **Jefe:** administra otros jefes, investigadores y registradores (crear, editar, reset,
  desactivar, bajar de rol). **No** ve ni toca admins. Queda a responsabilidad de los jefes
  (no llamar a Sistemas salvo emergencia / recambio de jefe).
- Invariantes D16 sin cambio. No existe «admin interino» ni «jefe interino» como rol:
  se crean usuarios con el rol real, o se usa 18C (abajo).

## D23 — 18C recortado: misma cuenta, dos funciones

- **Problema:** el titular se ausenta una semana y quiere que un registrador o investigador
  cubra bandeja **sin segunda cuenta** (CI único = un humano). Subir el rol a `jefe` le daría
  `usuario.*` y le quitaría su función base.
- **Decisión:** delegación **aditiva** en la misma cuenta (rol ∪ permisos). Preset
  `jefe_interino` = permisos de jefe **menos** `usuario.*` / `menu.usuarios` / `admin.*`.
  Nunca el atajo «Jefe completo» = `ROLES['jefe']` (chocaba con la whitelist).
- El jefe titular **sigue activo** (puede revisar). 2–3 jefes a la vez es lo normal; 18C
  cubre el caso «no hay otro jefe y cubre el registrador/investigador».
- Cascada al desactivar: revocar delegaciones **recibidas**, no las otorgadas.
- Paquete «Bandeja y admisión» incluye `menu.notificaciones` + `notificacion.ver`
  (el rol registrador **no** trae campana; el interino sí la recupera).
- Sin admin interino. Sin avisos automáticos de interinato.

## D24 — Carreras, notificaciones, campana registrador

- Mutaciones de estado (`admitir`/`rechazar`/`asignar`/`traspasar` y equiv.): `lockForUpdate`
  + re-leer estado + toast «ya fue admitida por X». En **16.2** (varios jefes, internet lento).
- Destino de notificación: URL **fija al crear**. No reescribir por privilegio máximo
  (un investigador-interino no debe caer siempre en bandeja).
- Nueva denuncia → todos los que `puede('caso.admitir')`. Evaluación devuelta → quien
  delegó; si no hay, todos con `caso.admitir`.
- Registrador: **sin** `menu.notificaciones` / `notificacion.ver` en el rol (`AlertasPlazo`
  ya devolvía `[]`).

## D25 — Fuera de 16 / aparcados

- **Dashboard:** no se toca en 16. Futuro: 2 modos (unidad / personal). El registrador verá
  el de unidad; se muestra u oculta por permiso. Anotado, no implementado.
- **Impersonation / simular páginas:** no Fase 1. Nota `Notas - Admin simulacion (futuro).md`.
- **`debe_cambiar_password` middleware:** Sprint **18B** (cuando exista la pantalla de cambio).
  No en 18A (evitar redirect loop).
- **Auditoría forense** (`owen-it/laravel-auditing`): Sprint **21**. En 16–18C: `usuario_id`
  / bitácora en cada acción nueva.
- **Sprint 19/20:** no meter días hábiles en 16. Sprint 20 está casi hecho (spec vieja);
  19 (mora explícita) después.
- **Descarga pública** `/panel/archivos/{id}/descargar`: hoy está dentro del grupo `auth`.
  El split de rutas de **16.2** la mueve a públicas.
