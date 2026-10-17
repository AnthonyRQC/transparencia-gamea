# Fase C — Audit & Traceability Panel (Systems / Double Key)

**Status:** FINAL — READY FOR CONSTRUCTOR · 2026-10-17 · Panel 2 (Lead Systems Analyst).
Final amendment applied (user decisions 2026-10-17): IP addresses are NOT persisted
(`user_agent` retained; SIGNAL-1 deferred; SIGNAL-2 closed by removal). Implementation by
Panel 3, unit by unit.
**Canonical (single source of truth):** `odd/tasks/fase-c-auditoria-trazabilidad.md` (this file).
**Engram mirror:** topic_key `odd/fase-c-auditoria-trazabilidad/tasks` (updated after the final amendment).
**Baseline:** 239 tests green (1,790 assertions) + clean build (2026-10-14). Everything new ships with tests.
**Units:** U1–U6 — one Conventional-Commit unit each (Spanish subject, no `Co-Authored-By`, no AI attribution).

## 1. Objective

Give GAMEA's systems unit (TI / `admin`) and unit chiefs (`jefe`) a two-view audit trail
over the Ley 974 case lifecycle: an enriched, append-only bitácora; a technical admin panel
whose projection is defined in the backend; an operative per-case view; a role-aware
"Export case extract" for row-by-row cross-checking (double key); and per-user action
certificates for civil-servant protection — without ever widening case access.

## 2. Domain justification

- **Double key (Lesson 08):** the chief holds the operational narrative; TI/admin holds the
  technical trace; neither alone owns the full picture. The only joint act is the occasional,
  logged cross-check (extract cotejo).
- **Ley 974 (Arts. 24/29):** nothing here exposes case content to `admin` — the technical
  projection excludes `detalle` at the QUERY level. Lesson 08 falsable: `Bitacora::toArray()`
  dumps every attribute; the projection must be column-explicit, never UI-hidden.
- **D17 Option E:** "audit panel without entering the inbox" — this scope. Impersonation stays
  out (separate undecided topic; `Notas - Admin simulacion (futuro).md`).
- **Data minimization (final amendment):** IP addresses are NOT persisted (GAMEA DHCP hands
  out dynamic/shared addresses; a stored IP would identify nobody) — §13.
- **Adoption-first (Lesson 09):** automatic or optional controls only; no ceremonies; the
  system does not nag. Context: overloaded TI, flash-drive delivery with manual updates,
  other systems lack strict audit, real resistance to change.

## 3. Scope (agreed 2026-10-16) and closed decisions

### Closed grilling decisions (R1 — provenance)

Closed 2026-10-17 per analyst recommendations; user response: "procede". Reopenable on
request (this document is updated in place).

> Post-evaluation (2026-10-17): Panel 1 approved the spec and required F1–F3; the hostile
> edge pass (§14) was applied on top. Final amendment (same day, user decisions): IP
> addresses are NOT persisted (data minimization); `user_agent` retained; SIGNAL-1 deferred;
> `withTrashed` retained with the ticket-mutability note (§13). No other closed decision
> changed.

| # | Question (R1) | Closed decision |
|---|---|---|
| Q1 | Scope of "accesses" in the technical panel | Bitácora-only: case events + evidence downloads + panel consult/export events. NO login/session auditing in Fase C. |
| Q2 | "My action history" shape | Per case: the civil servant's own actions on that case, from the case view (the shared `DenunciaSheet` covers investigador / jefe / registrador screens). |
| Q3 | Cotejo row set | Both extracts share the same case-event row set, ordered `bitacora.id ASC`; downloads are rows in BOTH (operative without the technical column). Audit-of-audit rows (`denuncia_id = null`) live only in the panel. |
| Q4 | Technical-trace capture rule | `user_agent` captured uniformly and centrally (Bitácora model layer) — a future mutation cannot forget the trace; null outside HTTP; truncated at 512. Append-only guards throw. (IP addresses are NOT persisted — final amendment.) |
| Q5 | Panel UX | Single server-filtered feed (date range, user, action, ticket + "downloads only" preset), `paginate(50)`. Projection WITHOUT `detalle`, WITH `user_agent` (IP not persisted — final amendment). |
| Q6 | Extract button placement | `jefe` → button in the case `DenunciaSheet` (Bandeja); `admin/TI` → per-row action in `/admin/auditoria`; `constancia` → `DenunciaSheet`. Two thin routes share one service (same source, same order). |

### In scope

- **C1 — Enriched append-only bitácora.** `user_agent` captured on case mutations (IP
  addresses are NOT persisted — final amendment); evidence downloads logged (read audit) with
  the downloader's identity recorded. New read/delete events carry **minimized `detalle`**
  (archive referenced by `#id`, no free-text file names — Panel 1 finding adopted). Invariant:
  append-only — admin may see technical fields, never modify.
- **C2 — `/admin/auditoria` (role: `admin`).** Technical view: activity, accesses, downloads.
  NO case content (`detalle` excluded at the query). Golden rule: the projection is defined in
  the BACKEND columns — never UI-hiding data that already left in the payload.
- **C3 — Operative view (`jefe`/chiefs).** Case bitácora without technical fields. One record,
  two role projections.
- **C4 — The cross-check (process, no crypto).** Role-aware "Export case extract":
  `jefe` → operative extract (date, actor, action, what changed); `admin`/TI → technical
  extract (date, actor, action, downloads, browser). Same case/ticket identifier + same
  ordering ⇒ row-by-row comparison. Legible PDF + Excel for the cotejo (cells sanitized
  against formula injection — `ReporteExcel` pattern). TI exports in one click (no manual
  SQL) and delivers; the chief compares both. Every export / panel consultation writes a
  bitácora event (cross-check fingerprint / audit-of-audit). Edge case (suspect is chief or
  admin): institutional escalation documented as a recommendation — NOT a feature.
- **C5 — "My action history" certificates.** ~1-page PDF with the user's own actions + case
  metadata; for `investigador`, `registrador` and `jefe`; button on their screens; natural
  moment (case close / report delivery); no nagging; the document explains itself
  (instructions inside); framing: civil-servant protection.

## 4. Out of scope

- Cryptographic history verification: hash chains, integrity acts, periodic seals, forensic
  binlog. Frozen; revivable only by an explicit client request.
- Impersonation / "view as" (separate undecided topic; D17 annex). Never mixed with
  delegations / `PermisosEfectivos`.
- Login/session auditing (Q1). Publication-file download auditing (public portal, no auth —
  untouched).

## 5. Cross-cutting rules

- Adoption first: automatic or optional; never a mandatory ceremony; no recurring reminders.
- Internal documentation complete; the client delivery manual speaks only in positive terms.
- `CasoAuth` and least privilege untouched: audit projections do NOT open case access
  (`admin` does not handle Ley 974 cases).
- Baseline: 239 tests green, clean build. Everything new ships with tests.

## 6. Verified mapping (facts; Panel 1 cross-checked)

> **Panel 1 independent verification** (2026-10-17, Engram obs #157): all load-bearing claims
> confirmed — exactly 3 operative loaders app-wide (global grep), write paths 26 relation
> sites / 13 files + 9 direct + service, `admin` block without case permissions,
> `toArray()` trap real. Two findings adopted: (1) minimize `detalle` of the NEW events (§7.6);
> (2) design hinges made explicit — B1 capture layer (§7.2), B2 row-set (Q3), B3 authorization
> (§7.5), B4 accesses (Q1), B5 constancia (Q2), B6 integrity (§13).
>
> Post-evaluation (2026-10-17): spec approved with mandatory F1–F3 + hostile edge pass (§14).

### Bitácora

- Table: `id`, `denuncia_id` (FK, nullable since `2026_07_29`, cascadeOnDelete),
  `entidad_tipo(50, null)`, `entidad_id(null)`, `accion`, `detalle(text)`,
  `usuario_id` (FK users, NOT NULL), `fecha(datetime)`, timestamps. Indexes: `denuncia_id`;
  `(fecha, denuncia_id)`; `(entidad_tipo, entidad_id)`. No `user_agent` column today.
- Three write paths (confirmed): relation `$denuncia->bitacora()->create()` — 26 call sites
  across 13 files; direct `Bitacora::create()` — 9 sites (Descargo×5, Solicitud×4);
  `BitacoraService::registrar()` (also catalogs/publications).
- **Leak risk (Lesson 08 falsable):** three loaders feed the operative UI with
  `bitacora.usuario` — `DenunciaListQuery::with()` (:54; serves Bandeja + MisCasos),
  `ConsultaCasosController` (:20), `MisCasosController` (:147). They MUST switch to explicit
  column projections in the same commit that adds the columns (no leak window).
- UI today: `DenunciaSheet.tsx` "Historial del caso" (detalle + fecha + usuario), `ConsultarCasos.tsx`
  (renders the same Sheet, read-only), `types/denuncia.ts` (`BitacoraEntry`).
- Gaps confirmed: `ArchivosCasoController::eliminar()` does NOT write bitácora (upload does,
  at :54); `download()` does not either (this scope adds both).
- Deletion flow (verified in code): `DenunciaController::eliminar()` renames the ticket
  DEN-→DEL- (collision-suffixed, `:242-248`), writes the `eliminacion` event, soft-deletes,
  then `Denuncia::reciclarTicketSiEsUltimo()` (`Denuncia.php:130-143`) recycles the counter
  only when the deleted case was the last issued. Ticket = mutable label; stable key =
  `denuncia.id` (§13).
- `CasoAuth::mensajeCarrera()` reads `bitacora()->latest('id')` — must keep working.

### Permissions & roles

- Single PHP source `app/Data/PermisosCatalogo.php` → `AppServiceProvider` auto-defines one
  gate per permission; `PermisosEfectivos` = role ∪ active delegations; shared as
  `auth.user.permisos` → `useCan()`.
- TS mirror `resources/js/permissions.ts`; parity enforced by `RolesAccesoTest`
  (`test_catalogo_sincronizado_con_ts`, both directions) + `EnumsParidadTest`. New permissions
  ⇒ update PHP + TS + keep parity green.
- `admin` today holds NO case permissions (no `archivo.ver`, no `consulta.ver`) → the
  technical panel must NOT go through `CasoAuth`; it is its own admin-side surface.
- `jefe` holds `archivo.ver` (+ supervisor family) and `menu.bandeja`; case scope = whole
  unit (D19 UNIDAD family).

### Routes & export stack

- `routes/admin.php` (prefix `admin/`, `->can(...)` per route; 403 → /dashboard + toast via
  `bootstrap/app.php`).
- Case/file routes in `routes/denuncias.php`; current download path
  `GET /denuncias/archivos/{id}/descargar` (`archivo.ver` + CasoAuth).
- PDF: `barryvdh/laravel-dompdf` — pattern `Pdf::loadView('reportes.pdf', …)->download()`
  (view header style reusable: `resources/views/reportes/pdf.blade.php`).
- Excel: `maatwebsite/excel` — `Excel::download(new ReporteExcel($rows, $columnas))`;
  `ReporteExcel::sanitizar()` prefixes `'` on cells starting with `= + - @` — same rule reused
  by the new export class.
- Report exports are GET routes (`/reportes/exportar`) — mirror for extract endpoints.

## 7. Data contract

### 7.1 Migration

NEW `database/migrations/2026_10_17_000000_add_user_agent_to_bitacora_table.php`
(timestamp assigned at creation):

```php
Schema::table('bitacora', function (Blueprint $table) {
    $table->string('user_agent', 512)->nullable()->after('usuario_id');
    $table->index(['usuario_id', 'fecha']);
});
// down(): dropIndex(['usuario_id','fecha']); dropColumn(['user_agent']);
```

> Explicit note (final amendment): the system does NOT persist IP addresses deliberately.
> The only runtime use of `request()->ip()` is the public ticket rate-limit; the audit trail
> stores no IP (rationale in §13).

### 7.2 Model & append-only (B1, F1)

EDIT `app/Models/Bitacora.php`:

- `$fillable` += `'user_agent'`.
- `booted()`:
  - `creating` — skip only GENUINE console:
    `$consolaReal = app()->runningInConsole() && ! app()->runningUnitTests();`
    if `empty($b->user_agent)` and `! $consolaReal` → `$b->user_agent = $ua ? mb_substr($ua, 0, 512) : null;`
  - `updating` / `deleting`: `throw new \LogicException('La bitácora es append-only: no admite edición ni borrado.');`
- Rationale (F1 — Panel 1, verified): Laravel 13 `Application::runningInConsole()` resolves
  `APP_RUNNING_IN_CONSOLE ?? (PHP_SAPI==='cli' || 'phpdbg')` (vendor
  `Foundation/Application.php:807-814`) and `phpunit.xml` sets `APP_ENV=testing` but NOT
  `APP_RUNNING_IN_CONSOLE` → a bare `runningInConsole()` guard is TRUE under PHPUnit and would
  silently disable capture in tests (the HTTP criteria unreachable). `runningUnitTests()`
  separates the two environments; seeders/tinker (genuine console) keep `null`; explicit
  values passed by callers are respected (`empty()` guard).
- Central capture covers all three write paths (relation, direct, service) and any future
  mutation; seeders already write bitácora via models (`DenunciaSeeder`, `DenunciaMasivaSeeder`)
  and need no changes.

### 7.3 Anti-leak projections (mandatory, same commit as 7.1)

Note (final amendment): IP is no longer persisted; this projection rule now protects
`user_agent` — the Lesson 08 trap (`toArray()` dumps everything) still applies.

In the three loaders replace `'bitacora.usuario'` with:

```php
'bitacora' => fn ($q) => $q->select([
    'id', 'denuncia_id', 'entidad_tipo', 'entidad_id',
    'accion', 'detalle', 'usuario_id', 'fecha', 'created_at', 'updated_at',
]),
'bitacora.usuario:id,name',
```

Files: `app/Queries/Denuncia/DenunciaListQuery.php` (:54) · `app/Http/Controllers/ConsultaCasosController.php` (:20) ·
`app/Http/Controllers/MisCasosController.php` (:147).

### 7.4 Permissions (exact)

EDIT `app/Data/PermisosCatalogo.php` — new entries:

```php
'menu.auditoria' => 'Ver panel de auditoría',
'auditoria.extracto-operativo' => 'Exportar extracto operativo del caso',
'auditoria.extracto-tecnico' => 'Exportar extracto técnico del caso',
'constancia.propia' => 'Generar constancia propia de acciones',
```

Role additions — `admin` += `menu.auditoria`, `auditoria.extracto-tecnico`; `jefe` +=
`auditoria.extracto-operativo`, `constancia.propia`; `investigador` += `constancia.propia`;
`registrador` += `constancia.propia`. `DELEGABLE` and `PAQUETES` unchanged (conservative;
reopenable).

EDIT `resources/js/permissions.ts`: same four strings in the `Permiso` union + mirrors in
`PERMISOS_POR_ROL`. Parity tests must stay green.

### 7.5 Routes & authorization precedence (B3)

`routes/admin.php`:

```php
Route::get('/auditoria', [AuditoriaController::class, 'index'])
    ->can('menu.auditoria')->name('auditoria.index');
Route::get('/auditoria/extracto/{ticket}', [AuditoriaController::class, 'extractoTecnico'])
    ->can('auditoria.extracto-tecnico')->name('auditoria.extracto');
```

`routes/denuncias.php` (with the other case GET routes; no conflict with literals):

```php
Route::get('/{ticket}/extracto', [ExtractoController::class, 'operativo'])
    ->can('auditoria.extracto-operativo')->name('extracto.operativo');
Route::get('/{ticket}/constancia', [ConstanciaController::class, 'propia'])
    ->can('constancia.propia')->name('constancia.propia');
```

Authorization rationale (documented decision, B3):
- Route-level `can:` only; **no CasoAuth** on these endpoints.
- Technical extract: `admin` holds no case permissions by design; the projection never
  includes `detalle`; ticket-scoped; permission-gated.
- Operative extract: `jefe`'s case scope is the whole unit (D19 UNIDAD); the extract contains
  only data the chief may already see (case events incl. `detalle`).
- Constancia: own-rows-only by construction (query filters `usuario_id = auth`), so any holder
  can request it for any case and still receives only their own actions.
- Every access writes an audit-of-audit event (§7.8).
- Outcome rules: permissionless role → redirect `/dashboard` + toast (`bootstrap/app.php`
  render hook); unknown ticket → 404 (`firstOrFail`); both asserted.
- Panel 1 approved this rationale (2026-10-17); wrap only the operative endpoint with CasoAuth
  if its use ever changes (compatible without redesign).

### 7.6 Services, controllers & queries

- EDIT `app/Services/BitacoraService.php` — add:

```php
public static function registrarAuditoria(string $accion, array $detalle = []): void
// Bitacora::create([
//   'denuncia_id' => null, 'entidad_tipo' => 'auditoria', 'entidad_id' => null,
//   'accion' => $accion, 'detalle' => json_encode($detalle),
//   'usuario_id' => auth()->id(), 'fecha' => now(),
// ]);
```

- NEW `app/Queries/Auditoria/AuditoriaIndexQuery.php` — panel feed:
  `select(['id','denuncia_id','entidad_tipo','entidad_id','usuario_id','accion','fecha','user_agent'])`
  (**no `detalle`**; add a comment stating the projection rule)
  `+ with('usuario:id,name') + with(['denuncia' => fn ($q) => $q->withTrashed()->select('id','ticket')])`;
  filters: `desde`/`hasta` as a **range on the indexed `fecha` column** (sargable —
  `where('fecha','>=', Carbon::parse($desde)->startOfDay())`, `<= endOfDay()`; NOT `whereDate`),
  `usuario_id`, `accion`, `ticket` (`mb_strtoupper(trim($v))` +
  `whereHas('denuncia', fn ($q) => $q->withTrashed()->where('ticket', $v))`),
  `tipo=descargas` (`accion = 'archivo_descargado'`);
  `orderByDesc('fecha')->orderByDesc('id'); paginate(50)->withQueryString()`.
- NEW `app/Http/Requests/AuditoriaRequest.php` — `desde`/`hasta` `nullable|date`,
  `usuario_id` `nullable|integer|exists:users,id`, `accion` `nullable|string|max:50`,
  `ticket` `nullable|string|max:20`, `tipo` `nullable|in:descargas`.
- NEW `app/Http/Controllers/AuditoriaController.php` (root namespace, consistent with
  `CatalogoController`/`UsuarioController`):
  - `index(AuditoriaRequest)`: query → map rows to explicit arrays (`id`, `fecha` `d/m/Y H:i`,
    `actor` (`usuario?->name`), `accion`, `accion_label` via `ExtractoService::etiquetaAccion`,
    `ticket` (`denuncia?->ticket`), `user_agent`) — pass NO raw models;
    log `registrarAuditoria('auditoria_panel', ['filtros' => array_filter($request->validated())])`
    ONLY when `! $request->has('page')` (pure pagination adds no noise row);
    `Inertia::render('Admin/Auditoria', ['eventos' => …, 'filtros' => …, 'usuarios' => …, 'acciones' => …])`.
    `usuarios` = `User::orderBy('name')->get(['id','name'])` (INCLUDE inactive — audit spans
    them). `acciones` = distinct `accion` values mapped to labels.
  - `extractoTecnico(string $ticket, Request)`: validate `formato` `nullable|in:pdf,xlsx`
    (default `pdf`); `Denuncia::withTrashed()->where('ticket', $ticket)->firstOrFail()`
    (unknown ticket → 404; soft-deleted case still exportable via its current DEL- ticket — §13);
    build rows via `ExtractoService::tecnicas()`; log
    `registrarAuditoria('auditoria_extracto', ['ticket'=>…, 'proyeccion'=>'tecnica', 'formato'=>…])`;
    return `Pdf::loadView('auditoria.extracto', …)->download("extracto-tecnico-{$ticket}-{$fecha}.pdf")`
    or `Excel::download(new ExtractoExcel($headings, $rows, $anchos), "extracto-tecnico-{$ticket}-{$fecha}.xlsx")`.
- NEW `app/Http/Controllers/Denuncia/ExtractoController.php` — `operativo(string $ticket, Request)`:
  same shape (WITH `withTrashed` lookup); `ExtractoService::operativas()`; proyección
  `'operativa'`; filename `extracto-operativo-…`.
- NEW `app/Http/Controllers/Denuncia/ConstanciaController.php` — `propia(string $ticket, Request)`:
  `Denuncia::withTrashed()->where('ticket', $ticket)->firstOrFail()`; rows = bitácora
  `where('usuario_id', auth()->id())->with('usuario:id,name')->orderBy('id')->get(['id','accion','detalle','usuario_id','fecha'])`
  (own actions only — a reassigned or out-of-scope user still receives their own history);
  log `registrarAuditoria('constancia_generada', ['ticket' => $ticket])`; return
  `Pdf::loadView('auditoria.constancia', …)->download("constancia-{$ticket}-{username}-{$fecha}.pdf")`.
- NEW `app/Services/ExtractoService.php`:
  - `etiquetaAccion(string $accion): string` — map
    `['archivo_subido'=>'ARCHIVO SUBIDO','archivo_descargado'=>'ARCHIVO DESCARGADO','archivo_eliminado'=>'ARCHIVO ELIMINADO','ingreso_legacy'=>'INGRESO LEGACY','eliminacion'=>'ELIMINACIÓN']`
    + fallback `strtoupper(str_replace(['_','-'], ' ', $accion))`.
  - `operativas(Denuncia): array` → `[meta, headings, anchos, filas]` — rows
    `orderBy('id')->get(['id','accion','detalle','usuario_id','fecha'])`; fila =
    `[id, fecha d/m/Y H:i, actor (usuario?->name ?? 'SISTEMA'), etiquetaAccion, detalle]`;
    headings `['N°','FECHA','ACTOR','ACCIÓN','QUÉ CAMBIÓ']`; anchos `[6,18,26,24,70]`.
  - `tecnicas(Denuncia): array` → rows `get(['id','accion','usuario_id','fecha','user_agent'])`;
    fila = `[id, fecha, actor, etiquetaAccion, descarga ('SÍ' if accion==='archivo_descargado' else '—'), user_agent ?? '—']`;
    headings `['N°','FECHA','ACTOR','ACCIÓN','DESCARGA','NAVEGADOR']`; anchos `[6,18,26,24,10,60]`.
  - `meta(Denuncia): array` — `ticket`, **`caso_id` (`denuncia.id` — the stable key; the
    ticket is a mutable label, §13)**, `tipo`, `estado`, `fecha_ingreso`, `generado`
    (d/m/Y H:i), `generado_por` (auth user name — F3), `registros` (N),
    `rango` (`"{primero}–{último}"` or `null`). F2: first column `N° = bitacora.id` in BOTH
    projections — the cotejo anchor and the drift detector.
- EDIT `app/Http/Controllers/ArchivosCasoController.php`:
  - `download()`: after CasoAuth + storage-exists checks, before returning the stream:
    `$denuncia->bitacora()->create(['accion'=>'archivo_descargado', 'entidad_tipo'=>DenunciaArchivo::class, 'entidad_id'=>$archivo->id, 'detalle'=>"DESCARGA DEL ARCHIVO #{$archivo->id} DEL CASO {$ticket}", 'usuario_id'=>Auth::id(), 'fecha'=>now()]);`
    — detalle MINIMIZED: no free-text file name (Panel 1 finding). Failures BEFORE this point
    (denial, missing storage, eliminated file → 404) leave NO event.
  - `eliminar()`: after the `fecha_eliminacion` update:
    `accion = 'archivo_eliminado'`, same shape (`"ARCHIVO #{$id} ELIMINADO DEL CASO {$ticket}"`).

### 7.7 Exports (Excel + PDF)

- NEW `app/Exports/ExtractoExcel.php` — `FromCollection, WithHeadings, WithColumnWidths,
  WithStyles` (NO `ShouldAutoSize`: a 512-char UA would blow the column open); constructor
  `(array $headings, Collection $rows, array $widths)`; wrap alignment on long columns;
  `sanitizar()` with the SAME rule as `ReporteExcel` (`/^[=+\-@]/` → `'` prefix); purple
  header style `4B0090` copied.
- NEW `resources/views/auditoria/extracto.blade.php` — A4 **landscape** (`@page { size: A4 landscape; }`),
  `word-break: break-word` for long cells; institutional membrete copy of
  `reportes/pdf.blade.php` (DejaVu Sans, `#4B0090`); dynamic title
  `EXTRACTO OPERATIVO — CASO {ticket}` / `EXTRACTO TÉCNICO — CASO {ticket}`; meta block
  (tipo, estado, **Caso #{denuncia.id}**, fecha ingreso, generado, **Generado por: {usuario}**
  (F3), and **Registros: N · Rango: {id_primero}–{id_último}** — `Registros: 0` when empty);
  table from `$headings`/`$filas`; empty case →
  single row `SIN EVENTOS REGISTRADOS`; footer: institutional + `Proyección: OPERATIVA|TÉCNICA
  (definida por el sistema según el rol del solicitante)`.
- NEW `resources/views/auditoria/constancia.blade.php` — A4 portrait; membrete; intro
  instructive (2–3 lines: what it is; source = append-only bitácora; the document does not
  modify any registry); meta with **Caso #{denuncia.id}**, **Generado por: {usuario}** (F3) +
  **Registros: N**; table of the user's own actions; footer; empty → `SIN ACCIONES REGISTRADAS`.
- Filenames: `extracto-operativo-{ticket}-{Y-m-d}.{pdf|xlsx}`,
  `extracto-tecnico-{ticket}-{Y-m-d}.{pdf|xlsx}`, `constancia-{ticket}-{username}-{Y-m-d}.pdf`
  (ticket and username are ASCII-safe by construction).

### 7.8 Audit-of-audit events

All via `BitacoraService::registrarAuditoria` (`denuncia_id = null` ⇒ automatically excluded
from per-case extracts — the cotejo row set stays clean by construction):

- `auditoria_panel` — `/admin/auditoria` view/filter navigations only: written when the
  request has NO `page` parameter (pure pagination adds no row — keeps the feed clean).
- `auditoria_extracto` — every extract export (detalle: ticket, proyeccion, formato).
- `constancia_generada` — every certificate (detalle: ticket).

## 8. Frontend / UX contract

- NEW `resources/js/Pages/Admin/Auditoria.tsx`:
  - `AppLayout` + `PageHeader` (icon `ShieldCheck`; title "Panel de Auditoría"; subtitle
    "Actividad, accesos y descargas del sistema. Vista técnica — sin contenido de expedientes.").
  - Filters bar (following the ConsultarCasos pattern): "Desde"/"Hasta" (`Input type="date"`),
    "Usuario" select (prop `usuarios`, includes inactive; items `truncate block` + `title`),
    "Acción" select (labels), "N° de denuncia" input (uppercase style), "Solo descargas"
    toggle; "Buscar"/"Limpiar" buttons; server-side via `router.get(route('admin.auditoria.index'), params, { preserveState: true, preserveScroll: true })`.
  - Table inside `overflow-x-auto` container (no page horizontal scroll). Columns: N° (row id) · FECHA
    `d/m/Y H:i` · ACTOR · ACCIÓN (label) · EXPEDIENTE (ticket or `—`) · NAVEGADOR
    (`font-mono text-[11px] max-w-[220px] truncate` + `title` tooltip). NO `detalle` column.
  - Per-row action (only when the row has a ticket): `DropdownMenu` "Exportar extracto" with
    "PDF (legible)" / "Excel (cotejo)" → anchor to `route('admin.auditoria.extracto', { ticket, formato })`.
  - Empty state: `ListaVacia` ("Sin eventos registrados" / "No hay movimientos para los
    filtros aplicados. Ajuste los criterios o limpie los filtros." / acción "Limpiar filtros").
  - Server-side pagination with the shared `Paginacion` component
    (`@/Components/Denuncias/Shared/Paginacion`) fed by the paginator meta
    (`current_page`/`last_page`/`total`/`per_page`) and `onPaginaChange` →
    `router.get(..., { page })` — mirror Bandeja's wiring.
- EDIT `resources/js/Components/Layout/Sidebar.tsx`: add item `key:'auditoria'`,
  label "Auditoría", `href: route('admin.auditoria.index')`, `routeName: 'admin.auditoria.*'`,
  icon `ShieldCheck` (import), `permiso: 'menu.auditoria'` (after Usuarios/Delegaciones).
- EDIT `resources/js/Components/Denuncias/Sheet/DenunciaSheet.tsx`:
  - Toolbar row (right-aligned, rendered OUTSIDE the `bitacora.length > 0` gate — permissions
    are the only condition, so zero-event cases still produce valid empty documents; place it
    in the same section area, immediately above the conditional Historial card):
    - Extract `DropdownMenu` — visible with `useCan('auditoria.extracto-operativo')`;
      trigger `Button size="sm" variant="outline"` icon `FileDown`, label "Exportar extracto";
      items "PDF (legible)" / "Excel (cotejo)" → anchor `route('denuncias.extracto.operativo', { ticket, formato })`.
    - Constancia `Button` — visible with `useCan('constancia.propia')`; icon `ScrollText`,
      label "Mi constancia de acciones" → anchor `route('denuncias.constancia.propia', ticket)`.
  - Extend the `accionIcon` map: `archivo_descargado` → `Download`, `archivo_eliminado` →
    `Trash2`, `auditoria_*` → `ShieldCheck`, `constancia_generada` → `ScrollText`.
- Labels are Spanish (institutional). No new inline-validation forms; filter validation is
  backend (`AuditoriaRequest`).

## 9. Implementation units (U1–U6)

> U1 MUST land as ONE commit including §7.3 — adding the column without the projection fix
> would leak `user_agent` into operative payloads (no window allowed).

| Unit | Suggested commit subject (ES) | Files | Tests |
|---|---|---|---|
| U1 | `feat(auditoria): registrar user-agent en bitácora, blindaje append-only y proyección operativa` | NEW migration (§7.1); EDIT `Bitacora` (§7.2); EDIT 3 loaders (§7.3) | NEW `tests/Feature/BitacoraEnriquecidaTest.php` |
| U2 | `feat(auditoria): registrar descarga y eliminación de archivos del caso` | EDIT `ArchivosCasoController` (§7.6) | NEW `tests/Feature/ArchivosCasoAuditoriaTest.php` |
| U3 | `feat(auditoria): permisos, panel técnico /admin/auditoria y huella de consultas` | EDIT `PermisosCatalogo` + `permissions.ts` (§7.4); NEW `AuditoriaIndexQuery`, `AuditoriaRequest`, `AuditoriaController::index`, `Pages/Admin/Auditoria.tsx`; EDIT `routes/admin.php` (index), `Sidebar.tsx`; EDIT `BitacoraService` (§7.6) | NEW `tests/Feature/AuditoriaPanelTest.php` |
| U4 | `feat(auditoria): extractos role-aware por caso (operativo/técnico) con PDF y Excel` | NEW `ExtractoService`, `ExtractoExcel`, `views/auditoria/extracto.blade.php`, `Denuncia/ExtractoController`; EDIT `AuditoriaController` (extractoTecnico), `routes/admin.php` + `routes/denuncias.php` (§7.5), `Pages/Admin/Auditoria.tsx` (per-row action), `DenunciaSheet.tsx` (extract dropdown) | NEW `tests/Feature/AuditoriaExtractoTest.php` |
| U5 | `feat(auditoria): constancias personales de acciones por caso` | NEW `Denuncia/ConstanciaController` (query inline — no extra service), `views/auditoria/constancia.blade.php`; EDIT `routes/denuncias.php`, `DenunciaSheet.tsx` (button) | NEW `tests/Feature/ConstanciaTest.php` |
| U6 | `docs(odd): cerrar Fase C con evidencia, ADR D29 y contexto actualizado` | EDIT this file (Verification/Evidence), `transparencia-proy/AI-CONTEXT.md`, `Deuda Tecnica y Riesgos.md` (B7 line); NEW `transparencia-proy/decisiones/D29-auditoria-proyecciones-doble-llave.md` + índice row | N/A — structural readback |

> Distribution: F1 → U1; F2 → U4 (extract); F3 → U4 (extract meta) and U5 (constancia meta);
> remaining edge-pass changes land per their section references (§7.6/§7.7/§7.8/§8, §14).

## 10. Acceptance criteria (executable)

- [ ] `php artisan migrate:status` → new migration listed as ran (local dev DB).
- [ ] Console-skip smoke (F1): `php artisan tinker --execute "var_dump(app()->runningInConsole() && ! app()->runningUnitTests());"` → `bool(true)` (capture skipped in genuine console; seeder/tinker rows keep `user_agent` null).
- [ ] `php artisan test --filter=BitacoraEnriquecidaTest` → OK: `user_agent` present on all three write paths via HTTP (F1 guard lets capture run under PHPUnit); append-only throws on update/delete; UA >512 truncated safely; operative payloads do NOT contain `user_agent` — props-level assertion on the `bitacora` entries of `/denuncias`, `/mis-casos`, `/consultar` (plus response-level `assertDontSee`).
- [ ] `php artisan test --filter=ArchivosCasoAuditoriaTest` → OK: `archivo_descargado` with `entidad_tipo = DenunciaArchivo` + minimized detalle; `archivo_eliminado` after soft-delete; NO false events on failures (CasoAuth denial, missing storage, eliminated file → 404).
- [ ] `php artisan test --filter=AuditoriaPanelTest` → OK: admin OK; other roles redirect `/dashboard`; projection WITHOUT `detalle` (props-level check of `eventos.data` rows + `assertDontSee('"detalle"')`); `user_agent` exposed on the panel only; `auditoria_panel` written on view/filter navigations and NOT on pure pagination (`?page=2` visit adds no event); date-range filter is boundary-inclusive (events at 00:00 and 23:59 of the edges included); unknown `accion` filter → empty list, no error; `tipo=descargas` with and without data; row of a soft-deleted case keeps its CURRENT ticket.
- [ ] `php artisan test --filter=AuditoriaExtractoTest` → OK: both projections expose IDENTICAL `N°` id sequences for the same fixture (not just counts); technical has `user_agent` and no `detalle`; operative has `detalle` and no `user_agent`; zero-event case → `SIN EVENTOS REGISTRADOS`, still 200; extracts work for a `cerrada` case and for a soft-deleted case (`withTrashed`, via its current DEL- ticket); meta contains `Caso #{denuncia.id}`, `Generado por`, `Registros: N`, `Rango: {X}–{Y}`; unauthorized roles redirect; unknown ticket → 404; `auditoria_extracto` logged per export (not on 404/redirect); invalid `formato` rejected; Excel asserted via `Excel::fake()` + direct `ExtractoExcel::collection()` inspection (sanitization locked).
- [ ] `php artisan test --filter=ConstanciaTest` → OK: investigador/jefe/registrador; only own rows (a reassigned-away investigator still gets own actions); zero-own-actions case → valid PDF with `SIN ACCIONES REGISTRADAS`; `constancia_generada` logged; `assertDownload()` filename ASCII (`constancia-{ticket}-{username}-{fecha}.pdf`).
- [ ] Volume smoke: a case with ~200 events renders both formats (PDF real render → 200; Excel via `Excel::fake()`); panel `paginate(50)` handles multi-page.
- [ ] `php artisan test` → full suite green (baseline 239 + new).
- [ ] `npm run build` → clean (tsc + vite).
- [ ] Parity intact: `RolesAccesoTest` + `EnumsParidadTest` green.
- [ ] Manual: row-by-row cotejo of a real case (operative vs technical extract, same ticket / same order).

## 11. Verification (record during implementation)

Per `AGENTS.md §5` — each unit records `<comando>: <resultado observado>` here before its
commit. (To be filled by the implementation units.)
Includes the F1 console-skip smoke (tinker command from §10) — PHPUnit cannot cover
genuine-console behavior.

### U1 — user_agent, append-only y proyección operativa
- `php artisan migrate:status`: `2026_10_17_000000_add_user_agent_to_bitacora_table` Ran [Batch 3] (local dev DB).
- `php artisan tinker --execute "var_dump(app()->runningInConsole() && ! app()->runningUnitTests());"`: `bool(true)` (salto en consola genuina verificado).
- `php artisan test --filter=BitacoraEnriquecidaTest`: `PASS Tests\Feature\BitacoraEnriquecidaTest` (6 tests, 60 assertions).
- `php artisan test`: `PASS` 245 tests passed (1850 assertions).

### U2 — Descarga y eliminación de archivos
- `php artisan test --filter=ArchivosCasoAuditoriaTest`: `PASS Tests\Feature\ArchivosCasoAuditoriaTest` (3 tests, 27 assertions).
- `php artisan test --filter=ArchivosCaso`: `PASS` (17 tests, 62 assertions sin regresiones).

### U3 — Permisos, panel técnico /admin/auditoria y huella de consultas
- `php artisan test --filter=AuditoriaPanelTest`: `PASS Tests\Feature\AuditoriaPanelTest` (7 tests, 111 assertions).
- `php artisan test --filter="RolesAccesoTest|EnumsParidadTest"`: `PASS` (20 tests, 306 assertions — paridad exacta PHP/TS).
- `npm.cmd run build`: `clean` (tsc + vite, Auditoria-K3XVdyMY.js 8.99 kB, built in 36.41s).

### U4 — Extractos role-aware por caso (operativo/técnico) con PDF y Excel
- `php artisan test --filter=AuditoriaExtractoTest`: `PASS Tests\Feature\AuditoriaExtractoTest` (12 tests, 71 assertions).
- `php artisan test`: `PASS` (267 tests, 2071 assertions — suite completa verde).
- `npm.cmd run build`: `clean` (tsc + vite, DenunciaSheet-BTbuoXoA.js 79.60 kB, built in 7.47s).

## 12. Evidence (record at close)

- Branch: `feat/fase-c-auditoria` (created before file changes; per `AGENTS.md §2`).
- Commits U1–U6 (SHA + `diff --stat`):
  - U1: `bd5d913` `feat(auditoria): registrar user-agent en bitácora, blindaje append-only y proyección operativa` (6 files changed, 331 insertions(+), 4 deletions(-))
  - U2: `3979e05` `feat(auditoria): registrar descarga y eliminación de archivos del caso` (2 files changed, 167 insertions(+))
  - U3: `35a2a2d` `feat(auditoria): permisos, panel técnico /admin/auditoria y huella de consultas` (11 files changed, 872 insertions(+), 1 deletion(-))
- Engram mirror: topic_key `odd/fase-c-auditoria-trazabilidad/tasks` updated at close.
- Spec freeze pass 2026-10-17: F1–F3 + hostile edge hardening (§14); mirror updated after the pass.
- Final amendment 2026-10-17 (user decisions): IP addresses not persisted; `user_agent`
  retained; SIGNAL-1 deferred; `withTrashed` retained with the ticket-mutability note (§13).

## 13. Residual risks & explicitly frozen items (B6)

- **Append-only scope:** enforced at the Eloquent layer (throws). The DB-level
  `cascadeOnDelete` on `bitacora.denuncia_id` remains — a hard delete of a `denuncia`
  (never the normal flow; SoftDeletes) or direct SQL by root/DBA could remove rows. Accepted
  and documented; cryptographic tamper-evidence stays frozen (Lesson 09).
- **Who watches the auditor:** audit-of-audit events (§7.8) + the panel shows every actor's
  actions (including other admins') + the cruce hands the technical extract to the chief —
  self-policing by design.
- **Projection discipline:** any future column added to `bitacora` must respect §7.3/§7.6
  projections; comments in the query classes state the rule.
- **UA truncation:** `user_agent` capped at 512 chars (long UAs).
- **IP not persisted (final amendment, 2026-10-17):** `request()->ip()` is used only at
  runtime (public ticket rate-limit); the system does NOT persist IP addresses deliberately.
  Data minimization: GAMEA's DHCP hands out dynamic/shared addresses that rotate ~3 times a
  day — a stored IP would identify nobody. This closes the former SIGNAL-2 (trusted-proxy
  spoofing); `trustProxies` is no longer an audit concern.
- **Ticket mutability (stable key = `denuncia.id`):** the ticket is a mutable label. On
  deletion of a root case, `DenunciaController::eliminar()` renames DEN-→DEL-
  (collision-suffixed with `-N`) and `Denuncia::reciclarTicketSiEsUltimo()` recycles the
  correlative ONLY when the deleted case was the last issued (interior holes are never
  reused). Panel and extracts always show the CURRENT ticket at generation time; the stable
  key is `denuncia.id` (`Caso #` in the artifact meta) plus the per-row `N° = bitacora.id`.
  Documented edge: an old ticket printed in a prior artifact can later re-derive to a
  different case — disambiguate via the stable key.
- **Chief-extract scope:** the operative extract includes `detalle` (case-visible data for
  the chief). Investigador/registrador do not get extracts — constancia only (own rows).
- **File lifecycle window:** download events are written after CasoAuth + storage-exists
  checks and before streaming; a storage failure between log and stream would record an
  event without a served file (rare; accepted). Failures BEFORE the log (denial, missing
  storage, eliminated file → 404) leave no event (asserted in §10).

## 14. Edge pass (hostile review + final amendment, 2026-10-17) — applied decisions & signals

Method: hypothesis-breaking on every absolute claim ("append-only", "null fuera de HTTP",
"mismo orden", "jamás `detalle`", "same row set") × lifecycle states × roles × dirty data ×
rare sequences, against the real repo (vendor reads, greps, middleware/exception reads).

Applied (each with test coverage in §10):
- **F1 (U1):** capture guard skips only genuine console; PHPUnit runs capture (§7.2 — `user_agent`).
- **F2 (U4):** `N° = bitacora.id` first column in BOTH extracts — cotejo anchor + drift detector.
- **F3 (U4/U5):** `Generado por: {usuario}` in extract + constancia meta (the file circulates; the audit row does not travel with it).
- **IP removed (final amendment):** the persisted-IP design was deleted by user decision — data minimization (DHCP environment, §13); `user_agent` remains as the technical trace.
- **Drift meta:** `Registros: N · Rango: {X}–{Y}` in both extracts (§7.6/§7.7).
- **Lifecycle `withTrashed`:** extract/constancia lookups and panel ticket relation/filter resolve soft-deleted cases (`Denuncia` has SoftDeletes; audit outlives a hidden root denuncia) — flagged as reopenable. Ticket-mutability note added (§13): ticket = mutable label; stable key = `denuncia.id`.
- **Excel widths:** `WithColumnWidths` replaces `ShouldAutoSize` (512-char UA).
- **Sargable date filter** (`fecha` range on the indexed column, not `whereDate`) + **ticket normalization** (`mb_strtoupper(trim())`).
- **Single-writer confirmed:** zero `forceDelete` (app/tests/database) and zero bitácora update/delete/truncate paths (greps 2026-10-17); `UppercaseText` hook is `saving` (fires before the throwing `updating`) — the guards break nothing. Seeders (console) write bitácora via models and keep `null` `user_agent` under F1 — no changes needed.
- **Zero-event documents:** toolbar moved OUT of the `bitacora.length > 0` gate (§8) so empty-but-valid extracts/certificates stay generatable; panel `auditoria_panel` logging skips pure pagination (§7.8).
- **Test technique:** props-level assertions instead of only `assertDontSee` for the no-`detalle`/no-`user_agent` guarantees.
- **Nits resolved:** (a) refined — panel logging skips pure pagination (§7.8; Panel 1 accepted per-load with a noise warning — this is the stronger option, reopenable); (b) moved out — toolbar no longer gated by bitácora presence (§8).

Signals (final status, 2026-10-17):
- **SIGNAL-1** (audit-logging of DENIED download attempts): **DEFERRED by user decision** —
  not applied; revisitable if the need arises.
- **SIGNAL-2** (IP spoofing via `trustProxies('*')` + `X-Forwarded-For`): **CLOSED** — IP
  addresses are not persisted (§13); trusted proxies are no longer an audit matter.

Considered, no action (recorded so silence is not mistaken for omission): concurrency (GET
exports are reads; repeated clicks produce accurate extra events, never false ones); session
expiry mid-flow (each action is atomic per request; no partial bitácora writes); two tabs
(case races already handled by the existing `lockForUpdate` + `mensajeCarrera` flow);
timezone (app-wide convention; artifacts use `fecha` as stored); retention (no pruning by
design — audit accumulates; volume is modest and indexed); crypto park (untouched — no
temptation taken); deletion/recycling redesign (analyzed and discarded for Fase C by user
decision — post-Fase C candidates recorded in `Deuda Tecnica y Riesgos.md`).

## 15. References

- Vault: `00 - HANDOFF Y PLAN MAESTRO - Estudio y Mejora.md`;
  `08 - Lecciones - Auditoria de Doble Llave, Proyecciones por Rol y Cruce.md`;
  `09 - Lecciones - Evidencia de Manipulacion, Cadenas de Hash y Filtro de Adopcion.md`.
- Repo: `odd/tasks/fase-a-quick-wins.md`, `fase-b-casos-legacy.md`, `fase-b-pulido.md`
  (format); `Notas - Admin simulacion (futuro).md`; `transparencia-proy/Decisiones 12.5 - 13 (Log).md`
  (D17/D18/D19/D26); Engram obs #156 / #157 (brief + Panel 1 cross-check).
