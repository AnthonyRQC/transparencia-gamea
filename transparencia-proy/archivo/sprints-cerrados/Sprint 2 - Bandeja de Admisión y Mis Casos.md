> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 2 â€” Bandeja de AdmisiÃ³n + Mis Casos + Mi Resumen âœ… COMPLETADO

> **Plan detallado** â€” Basado en las decisiones tomadas con el cliente.
> Sprint 2 mantiene la Fase 0 (sin BD, mock en sesiÃ³n).
> Sprint 2 reemplaza el concepto de "Kanban" por un modelo de pestaÃ±as por fase.
> **Completado:** Junio 2026 â€” M2.1 Foundation, M2.2 Bandeja de AdmisiÃ³n, M2.3 DenunciaSheet + Mis Casos + Mi Resumen, M2.4 Por asignar + Rechazadas tabs

---

## 0. Resumen y Contexto del RediseÃ±o

**Problema original**: El plan original planteaba un Kanban drag&drop con 5 columnas.

**DecisiÃ³n**: Abandonar Kanban drag&drop por un modelo de **listas con pestaÃ±as (tabs)**. Razones:

| Problema | SoluciÃ³n con tabs |
|---|---|
| Drag&drop difÃ­cil de mantener en mobile | Tabs responsive por defecto |
| Las columnas del Kanban no reflejan los "gates" legales (admisiÃ³n requiere justificaciÃ³n) | Cada tab es una fase con su propia acciÃ³n formal |
| El paralelismo de Solicitudes/Descargos (Sprint 4+) no encaja en columnas fijas | Tabs dentro del Sheet de detalle |
| El Jefe necesita admitir/rechazar con justificaciÃ³n antes de que una denuncia "entre" al Kanban | Bandeja de AdmisiÃ³n con modales |

### Flujo de fases (revisado)

```
Registrador (Sprint 1)
       â”‚
       â–¼
Ingresada â”€â”€â–º Jefe de Unidad: AdmisiÃ³n/Rechazo (Bandeja de AdmisiÃ³n)
       â”‚                              â”‚
       â”‚      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚      â–¼
       â”‚  Rechazada (justificaciÃ³n obligatoria, estado terminal)
       â”‚
       â–¼
Admitida â”€â”€â–º Jefe de Unidad: AsignaciÃ³n a tÃ©cnico (Sprint 3)
       â”‚
       â–¼
Asignada â”€â”€â–º TÃ©cnico: Bandeja de entrada â†’ "Iniciar investigaciÃ³n"
       â”‚
       â–¼
InvestigaciÃ³n â”€â”€â–º TÃ©cnico: Solicitudes + Descargos (Sprint 4)
       â”‚
       â–¼
Informe Final â”€â”€â–º TÃ©cnico: RedacciÃ³n + clasificaciÃ³n (Sprint 5)
       â”‚
       â–¼
Cerrada â”€â”€â–º Sub-estado: Archivada (Accordion opcional)
```

**Sprint 2 cubre**: Ingresada â†” Admitida/Rechazada (Bandeja Jefe) + InvestigaciÃ³n/Informe/Cerrada de solo lectura (Mis Casos TÃ©cnico) + Mi Resumen (contadores).

---

## 1. Objetivos del Sprint

- âœ… Jefe de Unidad puede **ver** denuncias ingresadas, **admitir** (justificaciÃ³n opcional) y **rechazar** (justificaciÃ³n obligatoria)
- âœ… Jefe puede ver denuncias **Por asignar** (admitidas sin tÃ©cnico) y **Rechazadas** en pestaÃ±as separadas
- âœ… TÃ©cnico puede **ver** sus casos organizados en 4 tabs (Bandeja de entrada, InvestigaciÃ³n, Informe Final, Cierre)
- âœ… TÃ©cnico puede **Iniciar investigaciÃ³n** desde su Bandeja de entrada (cambia estado a `investigacion`)
- âœ… Mi Resumen muestra 4 contadores personales (Activos, Vencidos, Por vencer, Cerrados)
- âœ… Sheet lateral con detalle completo de la denuncia al hacer click en cualquier card
- âœ… Acciones contextuales en Sheet segÃºn tipo de denuncia (ingresada â†’ Admitir/Rechazar, admitida â†’ placeholder asignar)
- âœ… Seed automÃ¡tico de 12 denuncias demo distribuidas en todas las fases
- âœ… PlazoBadge funcional (verde/amarillo/rojo) con dÃ­as calendario
- âœ… Dropdown "Ver como:" en Mis Casos / Mi Resumen para cambiar de tÃ©cnico mock
- âœ… Bandeja con **4 tabs** (Por admitir, Por asignar, Rechazadas, VisiÃ³n general)

---

## 2. Arquitectura

### 2.1 Bandeja de AdmisiÃ³n (Jefe) â€” `/denuncias`

**4 tabs**:

| Tab | Contenido | AcciÃ³n |
|---|---|---|
| **Por admitir** | Lista de denuncias con `estado = 'ingresada'`. Ordenadas por plazo ascendente. | Click â†’ Sheet con detalle + botones [Admitir] [Rechazar] |
| **Por asignar** | Lista de denuncias con `estado = 'admitida'` (sin tÃ©cnico). | Click â†’ Sheet + placeholder "Asignar tÃ©cnico (Sprint 3)" |
| **Rechazadas** | Lista de denuncias con `estado = 'rechazada'`. | Card muestra justificaciÃ³n de rechazo truncada. Click â†’ Sheet read-only. |
| **VisiÃ³n general** | 6 ContadorCards: Ingresadas, Admitidas, Asignadas, InvestigaciÃ³n, Informe, Cerradas | Dashboard de contadores sin acciones. |

**Cards**: estilo Todoist con punto de color segÃºn plazo + ticket + tipo + denunciante + PlazoBadge.

### 2.2 Mis Casos (TÃ©cnico) â€” `/denuncias/mis-casos`

**4 tabs**:

| Tab | Estado que filtra | AcciÃ³n (Sprint 2) |
|---|---|---|
| **Bandeja de entrada** | `asignada` | Click â†’ Sheet + botÃ³n [Iniciar investigaciÃ³n] |
| **InvestigaciÃ³n** | `investigacion` | Click â†’ Sheet + [Continuar] deshabilitado |
| **Informe Final** | `informe` | Click â†’ Sheet + [Continuar] deshabilitado |
| **Cierre** | `cerrada` | Sub-secciÃ³n: **Cerradas** + **Archivadas** (Accordion) |

**Dropdown "Ver como:"** en el header, con opciones: tec-1 (Carlos Quispe), tec-2 (Ana Torres), tec-3 (Luis Mamani). Al cambiar, se recarga la pÃ¡gina filtrada por ese tÃ©cnico.

**Archivadas**: Accordion colapsable dentro de la tab Cierre. Muestra las denuncias con `estado = 'cerrada'` y `subestado = 'archivada'`.

### 2.3 Mi Resumen (TÃ©cnico) â€” `/denuncias/mi-resumen`

4 ContadorCards:

| Card | CÃ¡lculo |
|---|---|
| **Activos** | `investigacion` + `informe` del tÃ©cnico actual |
| **Vencidos** | Activos con plazo â‰¤ 0 dÃ­as restantes |
| **Por vencer** | Activos con plazo entre 1 y 5 dÃ­as restantes |
| **Cerrados** | `cerrada` del tÃ©cnico actual (sin importar subestado) |

Dropdown "Ver como:" igual que en Mis Casos.

### 2.4 DenunciaSheet (compartido)

Drawer lateral (shadcn `<Sheet>`) que se abre al hacer **click en cualquier card**. Contenido:

| SecciÃ³n | Campos |
|---|---|
| **Encabezado** | Ticket, Tipo (badge), PlazoBadge grande |
| **Denunciante** | Nombres / "AnÃ³nimo" + CI + Email + TelÃ©fono + escenario (chip) |
| **Denunciados** | Lista de denunciados. Si conoce identidad: nombres + dependencia. Si no: descripciÃ³n fÃ­sica. |
| **Detalles del Incidente** | CategorÃ­a, Fecha, Hora, Lugar |
| **RelaciÃ³n de Hechos** | Textarea read-only |
| **Pruebas / Testigos** | Lista con tipo + descripciÃ³n |
| **TÃ©cnico Asignado** | Nombre + avatar (si aplica) |
| **Acciones** | Botones contextuales segÃºn la vista que lo invocÃ³ |

---

## 3. Modelo de Datos (DenunciaData.php)

### 3.1 Nuevos campos en la estructura de denuncia

```php
$denuncia = [
    // ... campos existentes (ticket, tipo, escenario, denunciante, etc.)
    'estado' => 'ingresada',          // ingresada | admitida | asignada | investigacion | informe | cerrada | rechazada
    'subestado' => null,              // null | 'archivada'
    'tecnico' => null,                // null | 'tec-1' | 'tec-2' | 'tec-3'
    'fecha_admitida' => null,        // datetime|null
    'fecha_asignada' => null,        // datetime|null
    'justificacion_admision' => null, // string|null (opcional)
    'justificacion_rechazo' => null,  // string|null (obligatorio si rechazada)
];
```

### 3.2 Nuevos mÃ©todos

```php
class DenunciaData {
    // Getters con filtro
    public static function getByEstado(string $estado): array;
    public static function getByTecnico(string $tecnicoId): array;
    public static function find(string $ticket): ?array;

    // Acciones (mock, modifican sesiÃ³n)
    public static function admitir(string $ticket, ?string $justificacion): bool;
    public static function rechazar(string $ticket, string $justificacion): bool;
    public static function iniciarInvestigacion(string $ticket): bool;

    // Datos agregados
    public static function seedDemoData(): void;
    public static function getContadores(): array;          // ['ingresada' => 3, 'admitida' => 2, ...]
    public static function getContadoresTecnico(string $tecnicoId): array; // ['activos' => 4, 'vencidos' => 1, ...]
    public static function getPlazoInfo(array $denuncia): array; // ['dias_restantes' => 38, 'color' => 'green']
    public static function getPlazoDias(string $tipo): int; // corrupcion=45, negacion=20, null=0

    // Constantes
    public const TECNICOS_MOCK = [
        'tec-1' => ['id' => 'tec-1', 'nombre' => 'Carlos Quispe',  'iniciales' => 'CQ', 'color' => 'blue'],
        'tec-2' => ['id' => 'tec-2', 'nombre' => 'Ana Torres',    'iniciales' => 'AT', 'color' => 'pink'],
        'tec-3' => ['id' => 'tec-3', 'nombre' => 'Luis Mamani',   'iniciales' => 'LM', 'color' => 'green'],
    ];
}
```

### 3.3 Seed de 12 denuncias demo

| # | Ticket | Tipo | Estado | TÃ©cnico | created_at | Plazo (visual) |
|---|---|---|---|---|---|---|
| 1 | DEN-2026-0001 | CorrupciÃ³n | ingresada | â€” | Hace 7d | ðŸŸ¢ 38d |
| 2 | DEN-2026-0002 | NegaciÃ³n | ingresada | â€” | Hace 17d | ðŸŸ¡ 3d |
| 3 | DEN-2026-0003 | CorrupciÃ³n | ingresada | â€” | Hace 15d | ðŸŸ¢ 30d |
| 4 | DEN-2026-0004 | CorrupciÃ³n | admitida | â€” | Hace 20d | ðŸŸ¢ 25d |
| 5 | DEN-2026-0005 | NegaciÃ³n | rechazada | â€” | Hace 10d | (no aplica) |
| 6 | DEN-2026-0006 | CorrupciÃ³n | asignada | tec-1 | Hace 5d | ðŸŸ¢ 40d |
| 7 | DEN-2026-0007 | NegaciÃ³n | asignada | tec-2 | Hace 16d | ðŸŸ¡ 4d |
| 8 | DEN-2026-0008 | CorrupciÃ³n | investigacion | tec-1 | Hace 40d | ðŸŸ¡ 5d |
| 9 | DEN-2026-0009 | NegaciÃ³n | investigacion | tec-2 | Hace 47d | ðŸ”´ -2d |
| 10 | DEN-2026-0010 | CorrupciÃ³n | informe | tec-1 | Hace 33d | ðŸŸ¢ 12d |
| 11 | DEN-2026-0011 | CorrupciÃ³n | cerrada | tec-1 | Hace 60d | â€” |
| 12 | DEN-2026-0012 | NegaciÃ³n | cerrada (archiv.) | tec-2 | Hace 90d | â€” |

**Mecanismo**: `DenunciaData::seedDemoData()` verifica si la sesiÃ³n estÃ¡ vacÃ­a. Si lo estÃ¡, inserta las 12 con fechas relativas a `now()`. **Idempotente**: si ya hay datos, no hace nada.

### 3.4 CÃ¡lculo de PlazoBadge

```php
function getPlazoInfo(array $denuncia): array {
    $plazoTotal = self::getPlazoDias($denuncia['tipo']); // 45 o 20
    $created = Carbon::parse($denuncia['created_at']);
    $diasTranscurridos = $created->diffInDays(now(), false);
    $diasRestantes = $plazoTotal - $diasTranscurridos;

    if ($diasRestantes > 5)      return ['dias_restantes' => $diasRestantes, 'color' => 'green'];
    if ($diasRestantes >= 1)     return ['dias_restantes' => $diasRestantes, 'color' => 'yellow'];
    if ($diasRestantes <= 0)     return ['dias_restantes' => $diasRestantes, 'color' => 'red'];
}
```

---

## 4. shadcn a Instalar

```bash
npx shadcn@2.3.0 add badge card avatar tabs dialog sheet
```

| Componente | Sprint original | Uso en Sprint 2 |
|---|---|---|
| `badge` | Sprint 2 | PlazoBadge, TipoDenunciaBadge |
| `card` | Sprint 2 | ContadorCard, cards varios |
| `avatar` | Sprint 2 | Avatar del tÃ©cnico asignado |
| `tabs` | Sprint 4 | Tabs en Bandeja, Mis Casos |
| `dialog` | Sprint 3 | ModalAdmision, ModalRechazo |
| `sheet` | Sprint 3 | DenunciaSheet (detalle) |

---

## 5. Archivos del Sprint

### 5.1 Backend â€” Crear

| Archivo | DescripciÃ³n |
|---|---|
| `app/Http/Controllers/BandejaController.php` | `index()` â†’ props: denuncias por admitir, contadores |
| `app/Http/Controllers/MisCasosController.php` | `index(tecnico)` â†’ props: denuncias agrupadas por tab |
| `app/Http/Controllers/MiResumenController.php` | `index(tecnico)` â†’ props: contadores personales |

### 5.2 Backend â€” Modificar

| Archivo | Cambio |
|---|---|
| `app/Data/DenunciaData.php` | AÃ±adir campos, mÃ©todos, seed, TECNICOS_MOCK |
| `app/Http/Controllers/DenunciaController.php` | Modificar `store()` + aÃ±adir `admitir()`, `rechazar()`, `iniciarInvestigacion()` |
| `routes/web.php` | Reemplazar Closure de GET /denuncias + nuevas rutas |

### 5.3 Frontend â€” PÃ¡ginas

| Archivo | AcciÃ³n |
|---|---|
| `resources/js/Pages/Denuncias/Bandeja.tsx` | CREAR â€” pÃ¡gina principal del Jefe |
| `resources/js/Pages/Denuncias/MisCasos.tsx` | CREAR â€” pÃ¡gina del TÃ©cnico |
| `resources/js/Pages/Denuncias/MiResumen.tsx` | CREAR â€” KPIs del TÃ©cnico |
| `resources/js/Pages/Denuncias/Kanban.tsx` | ELIMINAR â€” era placeholder |

### 5.4 Frontend â€” Componentes

| Archivo | DescripciÃ³n |
|---|---|
| `Components/Denuncias/PlazoBadge.tsx` | Badge verde/amarillo/rojo con dÃ­as restantes |
| `Components/Denuncias/TipoDenunciaBadge.tsx` | Badge por tipo con color distinto |
| `Components/Denuncias/SubestadoBadge.tsx` | Badge pequeÃ±o "Archivada" |
| `Components/Denuncias/ContadorCard.tsx` | Card con label + nÃºmero + icono |
| `Components/Denuncias/TabsDenuncias.tsx` | Wrapper de shadcn Tabs con estilos |
| `Components/Denuncias/ListaVacia.tsx` | Empty state bonito |
| `Components/Denuncias/DenunciaCard.tsx` | Card base (clickable â†’ Sheet) |
| `Components/Denuncias/DenunciaCardAdmin.tsx` | Variante con botones contextuales (admitir/rechazar vÃ­a Sheet) |
| `Components/Denuncias/DenunciaCardTecnico.tsx` | Variante con botÃ³n contextual por tab |
| `Components/Denuncias/ModalAdmision.tsx` | Dialog shadcn, justificaciÃ³n opcional |
| `Components/Denuncias/ModalRechazo.tsx` | Dialog shadcn, justificaciÃ³n obligatoria |
| `Components/Denuncias/DenunciaSheet.tsx` | Sheet lateral con detalle completo |

### 5.5 Frontend â€” Layout

| Archivo | Cambio |
|---|---|
| `Components/Layout/Sidebar.tsx` | Eliminar "Tablero Kanban", aÃ±adir "Bandeja de AdmisiÃ³n", "Mis Casos", "Mi Resumen" |
| `Pages/Dashboard.tsx` | Actualizar link de "Tablero Kanban" â†’ "Bandeja de AdmisiÃ³n" |

---

## 6. Milestones

### M2.1 â€” Foundation (Backend + Componentes Base) âœ… COMPLETADO

**Objetivo**: Base de datos mock completa + componentes UI listos para las pÃ¡ginas. Verificable por artisan tinker.

| # | Tarea | Archivo |
|---|---|---|
| 1 | Ampliar DenunciaData.php con: TECNICOS_MOCK, nuevos campos en `add()`, mÃ©todos (getByEstado, getByTecnico, find, admitir, rechazar, iniciarInvestigacion, seedDemoData, getContadores, getContadoresTecnico, getPlazoInfo) | `app/Data/DenunciaData.php` |
| 2 | Modificar DenunciaController@store para incluir nuevos campos (estado, subestado, etc.) | `app/Http/Controllers/DenunciaController.php` |
| 3 | Instalar shadcn: badge, card, avatar, tabs (primeros 4) | `npx shadcn@2.3.0 add ...` |
| 4 | Crear PlazoBadge.tsx | `resources/js/Components/Denuncias/PlazoBadge.tsx` |
| 5 | Crear TipoDenunciaBadge.tsx | `resources/js/Components/Denuncias/TipoDenunciaBadge.tsx` |
| 6 | Crear SubestadoBadge.tsx | `resources/js/Components/Denuncias/SubestadoBadge.tsx` |
| 7 | Crear ContadorCard.tsx | `resources/js/Components/Denuncias/ContadorCard.tsx` |
| 8 | Crear TabsDenuncias.tsx | `resources/js/Components/Denuncias/TabsDenuncias.tsx` |
| 9 | Crear ListaVacia.tsx | `resources/js/Components/Denuncias/ListaVacia.tsx` |
| 10 | Crear DenunciaCard.tsx (versiÃ³n base, clickeable) | `resources/js/Components/Denuncias/DenunciaCard.tsx` |

### M2.2 â€” Bandeja de AdmisiÃ³n (Modales + PÃ¡gina + NavegaciÃ³n) âœ… COMPLETADO

**Objetivo**: La Bandeja del Jefe es funcional. Se pueden admitir y rechazar denuncias.

| # | Tarea | Archivo |
|---|---|---|
| 11 | Instalar shadcn: dialog | `npx shadcn@2.3.0 add dialog` |
| 12 | Crear ModalAdmision.tsx | `resources/js/Components/Denuncias/ModalAdmision.tsx` |
| 13 | Crear ModalRechazo.tsx | `resources/js/Components/Denuncias/ModalRechazo.tsx` |
| 14 | Crear DenunciaCardAdmin.tsx | `resources/js/Components/Denuncias/DenunciaCardAdmin.tsx` |
| 15 | Crear BandejaController.php con index() | `app/Http/Controllers/BandejaController.php` |
| 16 | AÃ±adir DenunciaController@admitir + @rechazar | `app/Http/Controllers/DenunciaController.php` |
| 17 | Actualizar routes/web.php (nuevas rutas GET/POST) | `routes/web.php` |
| 18 | Crear Bandeja.tsx (2 tabs + seed load) | `resources/js/Pages/Denuncias/Bandeja.tsx` |
| 19 | Eliminar Kanban.tsx (placeholder) | `resources/js/Pages/Denuncias/Kanban.tsx` |
| 20 | Actualizar Sidebar.tsx | `resources/js/Components/Layout/Sidebar.tsx` |
| 21 | Actualizar Dashboard.tsx | `resources/js/Pages/Dashboard.tsx` |

### M2.3 â€” DenunciaSheet + Mis Casos + Mi Resumen âœ… COMPLETADO

**Objetivo**: Sheet de detalle funcional + TÃ©cnico puede ver y avanzar sus casos.

| # | Tarea | Archivo |
|---|---|---|
| 22 | Instalar shadcn: sheet | `npx shadcn@2.3.0 add sheet` |
| 23 | Crear DenunciaSheet.tsx | `resources/js/Components/Denuncias/DenunciaSheet.tsx` |
| 24 | Modificar DenunciaCard.tsx para que abra el Sheet al click | `resources/js/Components/Denuncias/DenunciaCard.tsx` |
| 25 | Modificar DenunciaCardAdmin.tsx para que abra Sheet con acciones al pie | `resources/js/Components/Denuncias/DenunciaCardAdmin.tsx` |
| 26 | Crear DenunciaCardTecnico.tsx | `resources/js/Components/Denuncias/DenunciaCardTecnico.tsx` |
| 27 | Crear MisCasosController.php | `app/Http/Controllers/MisCasosController.php` |
| 28 | Crear MiResumenController.php | `app/Http/Controllers/MiResumenController.php` |
| 29 | AÃ±adir rutas para mis-casos, mi-resumen, iniciar | `routes/web.php` |
| 30 | Crear MisCasos.tsx (4 tabs + dropdown Ver como + Accordion Archivadas) | `resources/js/Pages/Denuncias/MisCasos.tsx` |
| 31 | Crear MiResumen.tsx (4 ContadorCards + dropdown Ver como) | `resources/js/Pages/Denuncias/MiResumen.tsx` |
| 32 | AÃ±adir DenunciaController@iniciarInvestigacion | `app/Http/Controllers/DenunciaController.php` |
| 33 | Actualizar Sidebar.tsx (aÃ±adir Mis Casos y Mi Resumen) | `resources/js/Components/Layout/Sidebar.tsx` |

### M2.4 â€” Por asignar + Rechazadas en Bandeja âœ… COMPLETADO

**Objetivo:** Extender Bandeja con 2 tabs adicionales para ver admitidas (por asignar) y rechazadas.

| # | Tarea | Archivo |
|---|---|---|
| 34 | AÃ±adir `porAsignar` y `rechazadas` como props en BandejaController | `app/Http/Controllers/BandejaController.php` |
| 35 | AÃ±adir tabs "Por asignar" y "Rechazadas" en Bandeja.tsx con sus respectivos renderizados | `resources/js/Pages/Denuncias/Bandeja.tsx` |
| 36 | Acciones contextuales en Sheet segÃºn estado de la denuncia | `resources/js/Pages/Denuncias/Bandeja.tsx` |

---



## 7. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|---|---|---|
| 1 | **PestaÃ±as en lugar de Kanban** | Drag & drop columns | Mobile-friendly, mantenible, refleja gates legales |
| 2 | **Seed automÃ¡tico al primer load** | BotÃ³n "Cargar demo" | MÃ¡s vistoso, cliente ve contenido al instante |
| 3 | **Sin UsuarioData.php** (tÃ©cnicos hardcoded en DenunciaData) | Crear UsuarioData.php | No hay simulaciÃ³n de roles en maqueta |
| 4 | **Dropdown "Ver como:" en Mis Casos/Mi Resumen** | Hardcoded tec-1 | Permite demostrar los 3 tÃ©cnicos sin auth |
| 5 | **Punto de color en cards = plazo (verde/amarillo/rojo)** | Color por tipo o tÃ©cnico | Refuerza urgencia visual |
| 6 | **Sheet en lugar de pÃ¡gina para detalle** | PÃ¡gina dedicada DetalleDenuncia | No bloquea la lista, reutilizable en Sprint 4+ |
| 7 | **Sheet completo en Sprint 2** | Sheet minimal | Jefe necesita ver contenido para decidir admisiÃ³n |
| 8 | **"Por asignar" como placeholder en Sprint 2** | Implementar asignaciÃ³n aquÃ­ | AsignaciÃ³n es Sprint 3 |
| 9 | **AdmisiÃ³n: justificaciÃ³n opcional** | Sin justificaciÃ³n | Ãštil para auditorÃ­a pero no exigida por ley |
| 10 | **Rechazo: justificaciÃ³n OBLIGATORIA** | Opcional | Ley 974 Art. 23 Â§II |
| 11 | **Listas ordenadas por plazo ascendente** | Fecha de ingreso | MÃ¡s urgentes primero |
| 12 | **Cerradas y Archivadas: Accordion colapsable** | Sub-secciÃ³n con divider | MÃ¡s compacto, menos scroll |
| 13 | **TÃ©cnico puede solicitar ampliaciÃ³n del plazo TOTAL (45d+45d)** | (no documentado previamente) | Ley 974 Art. 30. Se implementa en Sprint 4 o 5 |
| 14 | **PlazoBadge con dÃ­as calendario (no hÃ¡biles)** | DÃ­as hÃ¡biles | DÃ­as hÃ¡biles es Sprint 8 |

---

## 8. Fuera de Alcance (Sprint 3+)

| Funcionalidad | Sprint |
|---|---|
| Modal de AsignaciÃ³n de tÃ©cnico + tab "Por asignar" funcional | Sprint 3 |
| Modal de Traspaso | Sprint 3 |
| Modal de Reapertura | Sprint 3 |
| Vista General (mini-Kanban no interactivo) | Postergado sin sprint asignado |
| Solicitudes de InformaciÃ³n (creaciÃ³n, prÃ³rroga, respuesta) | Sprint 4 |
| Descargos del Denunciado (notificaciÃ³n, prÃ³rroga, respuesta) | Sprint 4 |
| Saltar fase (con justificaciÃ³n) | Sprint 4 |
| AmpliaciÃ³n del plazo TOTAL (45d+45d) | Sprint 4 o 5 |
| Informe Final con clasificaciÃ³n | Sprint 5 |
| Cierre con SITPRECO | Sprint 5 |
| Seguimiento pÃºblico (ciudadano) | Sprint 6 |
| GrÃ¡ficos Recharts en Dashboard y Mi Resumen | Sprint 7 |
| Reportes (tabla con filtros + exportaciÃ³n) | Sprint 7 |
| DÃ­as hÃ¡biles con feriados | Sprint 8 |
| GestiÃ³n de feriados (calendario anual) | Sprint 8 |
| Notificaciones en tiempo real (Laravel Reverb) | Futuro (sin sprint asignado) |

---

## 9. Actualizaciones a Otros Documentos (Post-Sprint)

âœ… Actualizaciones completadas. Ver estado actual en cada documento.

Al cerrar Sprint 2, editar:

| Documento | Cambio |
|---|---|
| `AI-CONTEXT.md` | Sprint 2 âœ…. "PrÃ³ximo Sprint" â†’ Sprint 3 |
| `Plan de Desarrollo.md` | Marcar Sprint 2 cerrado âœ…. Reescribir secciÃ³n Sprint 2 con la nueva arquitectura. Actualizar "shadcn por sprint" (mover dialog/tabs/sheet). AÃ±adir decisiÃ³n de tabla de ampliaciÃ³n del plazo total |
| `Proyecto - Vistas y Prototipo de Interfaz.md` | Actualizar matriz de acceso (secciÃ³n 2): reemplazar "Tablero Kanban General" y "Tablero Kanban Personal" por "Bandeja de AdmisiÃ³n (Jefe)" y "Mis Casos (TÃ©cnico)". Actualizar secciones C (Panel Jefe) y D (Panel TÃ©cnico) |
| `Proyecto - Transparencia Stack y Conceptos.md` | Actualizar "Contexto del Sistema" y "Orden de Aprendizaje" para reflejar el nuevo modelo de pestaÃ±as en lugar de Kanban drag&drop |

---

## 10. Notas para Sprint 4+ (DiseÃ±o Objetivo)

> Esta secciÃ³n documenta funcionalidades futuras que no se implementan en Sprint 2 pero se deben tener en cuenta en la arquitectura.

### 10.1 Solicitudes de InformaciÃ³n (Sprint 4)

- El tÃ©cnico, dentro de un caso en fase `investigacion`, puede crear **una o varias** solicitudes a unidades externas.
- Cada solicitud tiene: unidad destino, descripciÃ³n, **plazo configurable por el tÃ©cnico** (no fijo). RecomendaciÃ³n por ley: 10 dÃ­as hÃ¡biles (Art. 25 Â§I).
- Posibilidad de **prÃ³rroga**: la unidad externa solicita mÃ¡s tiempo mediante nota (escaneo subido al sistema). El tÃ©cnico registra la prÃ³rroga y el nuevo plazo.
- Estados de cada solicitud: `pendiente` / `recibida` (con posibilidad de respuesta).

### 10.2 Descargos del Denunciado (Sprint 4)

- Cada denunciado tiene su propio proceso de descargo, **independiente**.
- El tÃ©cnico registra la **notificaciÃ³n manual**: fecha, medio, archivo de respaldo (captura WhatsApp, PDF, etc.).
- Inicia el contador de 10 dÃ­as hÃ¡biles (Art. 25 Â§IV). Se puede ampliar +5 con justificaciÃ³n.
- El tÃ©cnico registra el descargo recibido: resumen + archivos adjuntos.
- **MÃºltiples denunciados**: se pueden notificar en distintos dÃ­as, cada uno con su propio plazo.

### 10.3 PrÃ³rrogas de Solicitudes/Descargos

- Cada prÃ³rroga requiere: dÃ­as adicionales, justificaciÃ³n escrita, archivo de respaldo (opcional).
- La prÃ³rroga del descargo requiere aprobaciÃ³n del Jefe de Unidad (modal).

### 10.4 AmpliaciÃ³n del Plazo TOTAL (45d + 45d corrupciÃ³n / 20d + 10d negaciÃ³n)

- **Art. 30 Ley 974**: el plazo total puede prorrogarse excepcionalmente de manera justificada por un periodo igual.
- El tÃ©cnico solicita mediante nota formal (upload PDF) + justificaciÃ³n.
- El Jefe de Unidad aprueba o rechaza.
- **âœ… Resuelto (Junio 2026):** El Jefe de Unidad puede aprobar **mÃºltiples ampliaciones parciales** (no solo una prÃ³rroga directa por el mÃ¡ximo legal). Se implementarÃ¡ en el **Sprint 8 (Ampliaciones MÃºltiples)**.

### 10.5 Barra de Progreso por Caso

- En la card de cada caso en `investigacion`, una barra de progreso que muestre:
  - % de solicitudes de informaciÃ³n respondidas vs pendientes
  - % de descargos recibidos vs pendientes
- Visualmente: barra segmentada (solicitudes + descargos) o dos barras separadas.

### 10.6 Notificaciones Visuales en Cards

- Badge "**Vence hoy**" en rojo para denuncias con 0 dÃ­as restantes.
- Badge "**Vencido (+Xd)**" en rojo intenso con dÃ­as de retraso.
- Tooltip en el PlazoBadge mostrando la fecha exacta de vencimiento.

### 10.7 Notificaciones en Tiempo Real (Futuro)

- Laravel Reverb + WebSockets.
- El tÃ©cnico recibe notificaciÃ³n cuando se le asigna un caso nuevo (recargar no necesario).
- El Jefe recibe notificaciÃ³n cuando el tÃ©cnico solicita ampliaciÃ³n de plazo.
- El tÃ©cnico recibe alerta cuando una solicitud estÃ¡ por vencer.

---

## 11. Decisiones de Arquitectura TÃ©cnica

| Aspecto | DecisiÃ³n |
|---|---|
| ComunicaciÃ³n | Inertia `router.post()` para acciones (admitir, rechazar, iniciar) |
| Errores | ValidaciÃ³n backend + Inertia errors para modales |
| Ã‰xito | Toast Sonner (ya instalado) para confirmar acciones |
| Estado de modales | `useState` local en la pÃ¡gina (no contexto global) |
| Sheet | `useState` con la denuncia seleccionada + `open` flag |
| Dropdown "Ver como" | Query param `?tecnico=tec-1` recargado con `router.get()` |
| Seed | En el `index()` del controller, condicional: `if(empty(DenunciaData::getAll())) { DenunciaData::seedDemoData(); }` |
| PlazoBadge | Componente puro: recibe `tipo` + `created_at`, calcula en runtime |

