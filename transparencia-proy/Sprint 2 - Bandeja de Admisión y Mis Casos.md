# Sprint 2 — Bandeja de Admisión + Mis Casos + Mi Resumen ✅ COMPLETADO

> **Plan detallado** — Basado en las decisiones tomadas con el cliente.
> Sprint 2 mantiene la Fase 0 (sin BD, mock en sesión).
> Sprint 2 reemplaza el concepto de "Kanban" por un modelo de pestañas por fase.
> **Completado:** Junio 2026 — M2.1 Foundation, M2.2 Bandeja de Admisión, M2.3 DenunciaSheet + Mis Casos + Mi Resumen, M2.4 Por asignar + Rechazadas tabs

---

## 0. Resumen y Contexto del Rediseño

**Problema original**: El plan original planteaba un Kanban drag&drop con 5 columnas.

**Decisión**: Abandonar Kanban drag&drop por un modelo de **listas con pestañas (tabs)**. Razones:

| Problema | Solución con tabs |
|---|---|
| Drag&drop difícil de mantener en mobile | Tabs responsive por defecto |
| Las columnas del Kanban no reflejan los "gates" legales (admisión requiere justificación) | Cada tab es una fase con su propia acción formal |
| El paralelismo de Solicitudes/Descargos (Sprint 4+) no encaja en columnas fijas | Tabs dentro del Sheet de detalle |
| El Jefe necesita admitir/rechazar con justificación antes de que una denuncia "entre" al Kanban | Bandeja de Admisión con modales |

### Flujo de fases (revisado)

```
Recepcionista (Sprint 1)
       │
       ▼
Ingresada ──► Jefe de Unidad: Admisión/Rechazo (Bandeja de Admisión)
       │                              │
       │      ┌───────────────────────┘
       │      ▼
       │  Rechazada (justificación obligatoria, estado terminal)
       │
       ▼
Admitida ──► Jefe de Unidad: Asignación a técnico (Sprint 3)
       │
       ▼
Asignada ──► Técnico: Bandeja de entrada → "Iniciar investigación"
       │
       ▼
Investigación ──► Técnico: Solicitudes + Descargos (Sprint 4)
       │
       ▼
Informe Final ──► Técnico: Redacción + clasificación (Sprint 5)
       │
       ▼
Cerrada ──► Sub-estado: Archivada (Accordion opcional)
```

**Sprint 2 cubre**: Ingresada ↔ Admitida/Rechazada (Bandeja Jefe) + Investigación/Informe/Cerrada de solo lectura (Mis Casos Técnico) + Mi Resumen (contadores).

---

## 1. Objetivos del Sprint

- ✅ Jefe de Unidad puede **ver** denuncias ingresadas, **admitir** (justificación opcional) y **rechazar** (justificación obligatoria)
- ✅ Jefe puede ver denuncias **Por asignar** (admitidas sin técnico) y **Rechazadas** en pestañas separadas
- ✅ Técnico puede **ver** sus casos organizados en 4 tabs (Bandeja de entrada, Investigación, Informe Final, Cierre)
- ✅ Técnico puede **Iniciar investigación** desde su Bandeja de entrada (cambia estado a `investigacion`)
- ✅ Mi Resumen muestra 4 contadores personales (Activos, Vencidos, Por vencer, Cerrados)
- ✅ Sheet lateral con detalle completo de la denuncia al hacer click en cualquier card
- ✅ Acciones contextuales en Sheet según tipo de denuncia (ingresada → Admitir/Rechazar, admitida → placeholder asignar)
- ✅ Seed automático de 12 denuncias demo distribuidas en todas las fases
- ✅ PlazoBadge funcional (verde/amarillo/rojo) con días calendario
- ✅ Dropdown "Ver como:" en Mis Casos / Mi Resumen para cambiar de técnico mock
- ✅ Bandeja con **4 tabs** (Por admitir, Por asignar, Rechazadas, Visión general)

---

## 2. Arquitectura

### 2.1 Bandeja de Admisión (Jefe) — `/denuncias`

**4 tabs**:

| Tab | Contenido | Acción |
|---|---|---|
| **Por admitir** | Lista de denuncias con `estado = 'ingresada'`. Ordenadas por plazo ascendente. | Click → Sheet con detalle + botones [Admitir] [Rechazar] |
| **Por asignar** | Lista de denuncias con `estado = 'admitida'` (sin técnico). | Click → Sheet + placeholder "Asignar técnico (Sprint 3)" |
| **Rechazadas** | Lista de denuncias con `estado = 'rechazada'`. | Card muestra justificación de rechazo truncada. Click → Sheet read-only. |
| **Visión general** | 6 ContadorCards: Ingresadas, Admitidas, Asignadas, Investigación, Informe, Cerradas | Dashboard de contadores sin acciones. |

**Cards**: estilo Todoist con punto de color según plazo + ticket + tipo + denunciante + PlazoBadge.

### 2.2 Mis Casos (Técnico) — `/denuncias/mis-casos`

**4 tabs**:

| Tab | Estado que filtra | Acción (Sprint 2) |
|---|---|---|
| **Bandeja de entrada** | `asignada` | Click → Sheet + botón [Iniciar investigación] |
| **Investigación** | `investigacion` | Click → Sheet + [Continuar] deshabilitado |
| **Informe Final** | `informe` | Click → Sheet + [Continuar] deshabilitado |
| **Cierre** | `cerrada` | Sub-sección: **Cerradas** + **Archivadas** (Accordion) |

**Dropdown "Ver como:"** en el header, con opciones: tec-1 (Carlos Quispe), tec-2 (Ana Torres), tec-3 (Luis Mamani). Al cambiar, se recarga la página filtrada por ese técnico.

**Archivadas**: Accordion colapsable dentro de la tab Cierre. Muestra las denuncias con `estado = 'cerrada'` y `subestado = 'archivada'`.

### 2.3 Mi Resumen (Técnico) — `/denuncias/mi-resumen`

4 ContadorCards:

| Card | Cálculo |
|---|---|
| **Activos** | `investigacion` + `informe` del técnico actual |
| **Vencidos** | Activos con plazo ≤ 0 días restantes |
| **Por vencer** | Activos con plazo entre 1 y 5 días restantes |
| **Cerrados** | `cerrada` del técnico actual (sin importar subestado) |

Dropdown "Ver como:" igual que en Mis Casos.

### 2.4 DenunciaSheet (compartido)

Drawer lateral (shadcn `<Sheet>`) que se abre al hacer **click en cualquier card**. Contenido:

| Sección | Campos |
|---|---|
| **Encabezado** | Ticket, Tipo (badge), PlazoBadge grande |
| **Denunciante** | Nombres / "Anónimo" + CI + Email + Teléfono + escenario (chip) |
| **Denunciados** | Lista de denunciados. Si conoce identidad: nombres + dependencia. Si no: descripción física. |
| **Detalles del Incidente** | Categoría, Fecha, Hora, Lugar |
| **Relación de Hechos** | Textarea read-only |
| **Pruebas / Testigos** | Lista con tipo + descripción |
| **Técnico Asignado** | Nombre + avatar (si aplica) |
| **Acciones** | Botones contextuales según la vista que lo invocó |

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

### 3.2 Nuevos métodos

```php
class DenunciaData {
    // Getters con filtro
    public static function getByEstado(string $estado): array;
    public static function getByTecnico(string $tecnicoId): array;
    public static function find(string $ticket): ?array;

    // Acciones (mock, modifican sesión)
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

| # | Ticket | Tipo | Estado | Técnico | created_at | Plazo (visual) |
|---|---|---|---|---|---|---|
| 1 | DEN-2026-0001 | Corrupción | ingresada | — | Hace 7d | 🟢 38d |
| 2 | DEN-2026-0002 | Negación | ingresada | — | Hace 17d | 🟡 3d |
| 3 | DEN-2026-0003 | Corrupción | ingresada | — | Hace 15d | 🟢 30d |
| 4 | DEN-2026-0004 | Corrupción | admitida | — | Hace 20d | 🟢 25d |
| 5 | DEN-2026-0005 | Negación | rechazada | — | Hace 10d | (no aplica) |
| 6 | DEN-2026-0006 | Corrupción | asignada | tec-1 | Hace 5d | 🟢 40d |
| 7 | DEN-2026-0007 | Negación | asignada | tec-2 | Hace 16d | 🟡 4d |
| 8 | DEN-2026-0008 | Corrupción | investigacion | tec-1 | Hace 40d | 🟡 5d |
| 9 | DEN-2026-0009 | Negación | investigacion | tec-2 | Hace 47d | 🔴 -2d |
| 10 | DEN-2026-0010 | Corrupción | informe | tec-1 | Hace 33d | 🟢 12d |
| 11 | DEN-2026-0011 | Corrupción | cerrada | tec-1 | Hace 60d | — |
| 12 | DEN-2026-0012 | Negación | cerrada (archiv.) | tec-2 | Hace 90d | — |

**Mecanismo**: `DenunciaData::seedDemoData()` verifica si la sesión está vacía. Si lo está, inserta las 12 con fechas relativas a `now()`. **Idempotente**: si ya hay datos, no hace nada.

### 3.4 Cálculo de PlazoBadge

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
| `avatar` | Sprint 2 | Avatar del técnico asignado |
| `tabs` | Sprint 4 | Tabs en Bandeja, Mis Casos |
| `dialog` | Sprint 3 | ModalAdmision, ModalRechazo |
| `sheet` | Sprint 3 | DenunciaSheet (detalle) |

---

## 5. Archivos del Sprint

### 5.1 Backend — Crear

| Archivo | Descripción |
|---|---|
| `app/Http/Controllers/BandejaController.php` | `index()` → props: denuncias por admitir, contadores |
| `app/Http/Controllers/MisCasosController.php` | `index(tecnico)` → props: denuncias agrupadas por tab |
| `app/Http/Controllers/MiResumenController.php` | `index(tecnico)` → props: contadores personales |

### 5.2 Backend — Modificar

| Archivo | Cambio |
|---|---|
| `app/Data/DenunciaData.php` | Añadir campos, métodos, seed, TECNICOS_MOCK |
| `app/Http/Controllers/DenunciaController.php` | Modificar `store()` + añadir `admitir()`, `rechazar()`, `iniciarInvestigacion()` |
| `routes/web.php` | Reemplazar Closure de GET /denuncias + nuevas rutas |

### 5.3 Frontend — Páginas

| Archivo | Acción |
|---|---|
| `resources/js/Pages/Denuncias/Bandeja.tsx` | CREAR — página principal del Jefe |
| `resources/js/Pages/Denuncias/MisCasos.tsx` | CREAR — página del Técnico |
| `resources/js/Pages/Denuncias/MiResumen.tsx` | CREAR — KPIs del Técnico |
| `resources/js/Pages/Denuncias/Kanban.tsx` | ELIMINAR — era placeholder |

### 5.4 Frontend — Componentes

| Archivo | Descripción |
|---|---|
| `Components/Denuncias/PlazoBadge.tsx` | Badge verde/amarillo/rojo con días restantes |
| `Components/Denuncias/TipoDenunciaBadge.tsx` | Badge por tipo con color distinto |
| `Components/Denuncias/SubestadoBadge.tsx` | Badge pequeño "Archivada" |
| `Components/Denuncias/ContadorCard.tsx` | Card con label + número + icono |
| `Components/Denuncias/TabsDenuncias.tsx` | Wrapper de shadcn Tabs con estilos |
| `Components/Denuncias/ListaVacia.tsx` | Empty state bonito |
| `Components/Denuncias/DenunciaCard.tsx` | Card base (clickable → Sheet) |
| `Components/Denuncias/DenunciaCardAdmin.tsx` | Variante con botones contextuales (admitir/rechazar vía Sheet) |
| `Components/Denuncias/DenunciaCardTecnico.tsx` | Variante con botón contextual por tab |
| `Components/Denuncias/ModalAdmision.tsx` | Dialog shadcn, justificación opcional |
| `Components/Denuncias/ModalRechazo.tsx` | Dialog shadcn, justificación obligatoria |
| `Components/Denuncias/DenunciaSheet.tsx` | Sheet lateral con detalle completo |

### 5.5 Frontend — Layout

| Archivo | Cambio |
|---|---|
| `Components/Layout/Sidebar.tsx` | Eliminar "Tablero Kanban", añadir "Bandeja de Admisión", "Mis Casos", "Mi Resumen" |
| `Pages/Dashboard.tsx` | Actualizar link de "Tablero Kanban" → "Bandeja de Admisión" |

---

## 6. Milestones

### M2.1 — Foundation (Backend + Componentes Base) ✅ COMPLETADO

**Objetivo**: Base de datos mock completa + componentes UI listos para las páginas. Verificable por artisan tinker.

| # | Tarea | Archivo |
|---|---|---|
| 1 | Ampliar DenunciaData.php con: TECNICOS_MOCK, nuevos campos en `add()`, métodos (getByEstado, getByTecnico, find, admitir, rechazar, iniciarInvestigacion, seedDemoData, getContadores, getContadoresTecnico, getPlazoInfo) | `app/Data/DenunciaData.php` |
| 2 | Modificar DenunciaController@store para incluir nuevos campos (estado, subestado, etc.) | `app/Http/Controllers/DenunciaController.php` |
| 3 | Instalar shadcn: badge, card, avatar, tabs (primeros 4) | `npx shadcn@2.3.0 add ...` |
| 4 | Crear PlazoBadge.tsx | `resources/js/Components/Denuncias/PlazoBadge.tsx` |
| 5 | Crear TipoDenunciaBadge.tsx | `resources/js/Components/Denuncias/TipoDenunciaBadge.tsx` |
| 6 | Crear SubestadoBadge.tsx | `resources/js/Components/Denuncias/SubestadoBadge.tsx` |
| 7 | Crear ContadorCard.tsx | `resources/js/Components/Denuncias/ContadorCard.tsx` |
| 8 | Crear TabsDenuncias.tsx | `resources/js/Components/Denuncias/TabsDenuncias.tsx` |
| 9 | Crear ListaVacia.tsx | `resources/js/Components/Denuncias/ListaVacia.tsx` |
| 10 | Crear DenunciaCard.tsx (versión base, clickeable) | `resources/js/Components/Denuncias/DenunciaCard.tsx` |

### M2.2 — Bandeja de Admisión (Modales + Página + Navegación) ✅ COMPLETADO

**Objetivo**: La Bandeja del Jefe es funcional. Se pueden admitir y rechazar denuncias.

| # | Tarea | Archivo |
|---|---|---|
| 11 | Instalar shadcn: dialog | `npx shadcn@2.3.0 add dialog` |
| 12 | Crear ModalAdmision.tsx | `resources/js/Components/Denuncias/ModalAdmision.tsx` |
| 13 | Crear ModalRechazo.tsx | `resources/js/Components/Denuncias/ModalRechazo.tsx` |
| 14 | Crear DenunciaCardAdmin.tsx | `resources/js/Components/Denuncias/DenunciaCardAdmin.tsx` |
| 15 | Crear BandejaController.php con index() | `app/Http/Controllers/BandejaController.php` |
| 16 | Añadir DenunciaController@admitir + @rechazar | `app/Http/Controllers/DenunciaController.php` |
| 17 | Actualizar routes/web.php (nuevas rutas GET/POST) | `routes/web.php` |
| 18 | Crear Bandeja.tsx (2 tabs + seed load) | `resources/js/Pages/Denuncias/Bandeja.tsx` |
| 19 | Eliminar Kanban.tsx (placeholder) | `resources/js/Pages/Denuncias/Kanban.tsx` |
| 20 | Actualizar Sidebar.tsx | `resources/js/Components/Layout/Sidebar.tsx` |
| 21 | Actualizar Dashboard.tsx | `resources/js/Pages/Dashboard.tsx` |

### M2.3 — DenunciaSheet + Mis Casos + Mi Resumen ✅ COMPLETADO

**Objetivo**: Sheet de detalle funcional + Técnico puede ver y avanzar sus casos.

| # | Tarea | Archivo |
|---|---|---|
| 22 | Instalar shadcn: sheet | `npx shadcn@2.3.0 add sheet` |
| 23 | Crear DenunciaSheet.tsx | `resources/js/Components/Denuncias/DenunciaSheet.tsx` |
| 24 | Modificar DenunciaCard.tsx para que abra el Sheet al click | `resources/js/Components/Denuncias/DenunciaCard.tsx` |
| 25 | Modificar DenunciaCardAdmin.tsx para que abra Sheet con acciones al pie | `resources/js/Components/Denuncias/DenunciaCardAdmin.tsx` |
| 26 | Crear DenunciaCardTecnico.tsx | `resources/js/Components/Denuncias/DenunciaCardTecnico.tsx` |
| 27 | Crear MisCasosController.php | `app/Http/Controllers/MisCasosController.php` |
| 28 | Crear MiResumenController.php | `app/Http/Controllers/MiResumenController.php` |
| 29 | Añadir rutas para mis-casos, mi-resumen, iniciar | `routes/web.php` |
| 30 | Crear MisCasos.tsx (4 tabs + dropdown Ver como + Accordion Archivadas) | `resources/js/Pages/Denuncias/MisCasos.tsx` |
| 31 | Crear MiResumen.tsx (4 ContadorCards + dropdown Ver como) | `resources/js/Pages/Denuncias/MiResumen.tsx` |
| 32 | Añadir DenunciaController@iniciarInvestigacion | `app/Http/Controllers/DenunciaController.php` |
| 33 | Actualizar Sidebar.tsx (añadir Mis Casos y Mi Resumen) | `resources/js/Components/Layout/Sidebar.tsx` |

### M2.4 — Por asignar + Rechazadas en Bandeja ✅ COMPLETADO

**Objetivo:** Extender Bandeja con 2 tabs adicionales para ver admitidas (por asignar) y rechazadas.

| # | Tarea | Archivo |
|---|---|---|
| 34 | Añadir `porAsignar` y `rechazadas` como props en BandejaController | `app/Http/Controllers/BandejaController.php` |
| 35 | Añadir tabs "Por asignar" y "Rechazadas" en Bandeja.tsx con sus respectivos renderizados | `resources/js/Pages/Denuncias/Bandeja.tsx` |
| 36 | Acciones contextuales en Sheet según estado de la denuncia | `resources/js/Pages/Denuncias/Bandeja.tsx` |

---



## 7. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| 1 | **Pestañas en lugar de Kanban** | Drag & drop columns | Mobile-friendly, mantenible, refleja gates legales |
| 2 | **Seed automático al primer load** | Botón "Cargar demo" | Más vistoso, cliente ve contenido al instante |
| 3 | **Sin UsuarioData.php** (técnicos hardcoded en DenunciaData) | Crear UsuarioData.php | No hay simulación de roles en maqueta |
| 4 | **Dropdown "Ver como:" en Mis Casos/Mi Resumen** | Hardcoded tec-1 | Permite demostrar los 3 técnicos sin auth |
| 5 | **Punto de color en cards = plazo (verde/amarillo/rojo)** | Color por tipo o técnico | Refuerza urgencia visual |
| 6 | **Sheet en lugar de página para detalle** | Página dedicada DetalleDenuncia | No bloquea la lista, reutilizable en Sprint 4+ |
| 7 | **Sheet completo en Sprint 2** | Sheet minimal | Jefe necesita ver contenido para decidir admisión |
| 8 | **"Por asignar" como placeholder en Sprint 2** | Implementar asignación aquí | Asignación es Sprint 3 |
| 9 | **Admisión: justificación opcional** | Sin justificación | Útil para auditoría pero no exigida por ley |
| 10 | **Rechazo: justificación OBLIGATORIA** | Opcional | Ley 974 Art. 23 §II |
| 11 | **Listas ordenadas por plazo ascendente** | Fecha de ingreso | Más urgentes primero |
| 12 | **Cerradas y Archivadas: Accordion colapsable** | Sub-sección con divider | Más compacto, menos scroll |
| 13 | **Técnico puede solicitar ampliación del plazo TOTAL (45d+45d)** | (no documentado previamente) | Ley 974 Art. 30. Se implementa en Sprint 4 o 5 |
| 14 | **PlazoBadge con días calendario (no hábiles)** | Días hábiles | Días hábiles es Sprint 8 |

---

## 8. Fuera de Alcance (Sprint 3+)

| Funcionalidad | Sprint |
|---|---|
| Modal de Asignación de técnico + tab "Por asignar" funcional | Sprint 3 |
| Modal de Traspaso | Sprint 3 |
| Modal de Reapertura | Sprint 3 |
| Vista General (mini-Kanban no interactivo) | Postergado sin sprint asignado |
| Solicitudes de Información (creación, prórroga, respuesta) | Sprint 4 |
| Descargos del Denunciado (notificación, prórroga, respuesta) | Sprint 4 |
| Saltar fase (con justificación) | Sprint 4 |
| Ampliación del plazo TOTAL (45d+45d) | Sprint 4 o 5 |
| Informe Final con clasificación | Sprint 5 |
| Cierre con SITPRECO | Sprint 5 |
| Seguimiento público (ciudadano) | Sprint 6 |
| Gráficos Recharts en Dashboard y Mi Resumen | Sprint 7 |
| Reportes (tabla con filtros + exportación) | Sprint 7 |
| Días hábiles con feriados | Sprint 8 |
| Gestión de feriados (calendario anual) | Sprint 8 |
| Notificaciones en tiempo real (Laravel Reverb) | Futuro (sin sprint asignado) |

---

## 9. Actualizaciones a Otros Documentos (Post-Sprint)

✅ Actualizaciones completadas. Ver estado actual en cada documento.

Al cerrar Sprint 2, editar:

| Documento | Cambio |
|---|---|
| `AI-CONTEXT.md` | Sprint 2 ✅. "Próximo Sprint" → Sprint 3 |
| `Plan de Desarrollo.md` | Marcar Sprint 2 cerrado ✅. Reescribir sección Sprint 2 con la nueva arquitectura. Actualizar "shadcn por sprint" (mover dialog/tabs/sheet). Añadir decisión de tabla de ampliación del plazo total |
| `Proyecto - Vistas y Prototipo de Interfaz.md` | Actualizar matriz de acceso (sección 2): reemplazar "Tablero Kanban General" y "Tablero Kanban Personal" por "Bandeja de Admisión (Jefe)" y "Mis Casos (Técnico)". Actualizar secciones C (Panel Jefe) y D (Panel Técnico) |
| `Proyecto - Transparencia Stack y Conceptos.md` | Actualizar "Contexto del Sistema" y "Orden de Aprendizaje" para reflejar el nuevo modelo de pestañas en lugar de Kanban drag&drop |

---

## 10. Notas para Sprint 4+ (Diseño Objetivo)

> Esta sección documenta funcionalidades futuras que no se implementan en Sprint 2 pero se deben tener en cuenta en la arquitectura.

### 10.1 Solicitudes de Información (Sprint 4)

- El técnico, dentro de un caso en fase `investigacion`, puede crear **una o varias** solicitudes a unidades externas.
- Cada solicitud tiene: unidad destino, descripción, **plazo configurable por el técnico** (no fijo). Recomendación por ley: 10 días hábiles (Art. 25 §I).
- Posibilidad de **prórroga**: la unidad externa solicita más tiempo mediante nota (escaneo subido al sistema). El técnico registra la prórroga y el nuevo plazo.
- Estados de cada solicitud: `pendiente` / `recibida` (con posibilidad de respuesta).

### 10.2 Descargos del Denunciado (Sprint 4)

- Cada denunciado tiene su propio proceso de descargo, **independiente**.
- El técnico registra la **notificación manual**: fecha, medio, archivo de respaldo (captura WhatsApp, PDF, etc.).
- Inicia el contador de 10 días hábiles (Art. 25 §IV). Se puede ampliar +5 con justificación.
- El técnico registra el descargo recibido: resumen + archivos adjuntos.
- **Múltiples denunciados**: se pueden notificar en distintos días, cada uno con su propio plazo.

### 10.3 Prórrogas de Solicitudes/Descargos

- Cada prórroga requiere: días adicionales, justificación escrita, archivo de respaldo (opcional).
- La prórroga del descargo requiere aprobación del Jefe de Unidad (modal).

### 10.4 Ampliación del Plazo TOTAL (45d + 45d corrupción / 20d + 10d negación)

- **Art. 30 Ley 974**: el plazo total puede prorrogarse excepcionalmente de manera justificada por un periodo igual.
- El técnico solicita mediante nota formal (upload PDF) + justificación.
- El Jefe de Unidad aprueba o rechaza.
- **Pregunta abierta (C6)**: ¿múltiples ampliaciones parciales (ej. 3×15d) o una única prórroga directa por el máximo legal (45d)? → Resolver con el cliente antes de implementar.
- **Asignación sugerida**: informar al sprint correspondiente cuando se defina.

### 10.5 Barra de Progreso por Caso

- En la card de cada caso en `investigacion`, una barra de progreso que muestre:
  - % de solicitudes de información respondidas vs pendientes
  - % de descargos recibidos vs pendientes
- Visualmente: barra segmentada (solicitudes + descargos) o dos barras separadas.

### 10.6 Notificaciones Visuales en Cards

- Badge "**Vence hoy**" en rojo para denuncias con 0 días restantes.
- Badge "**Vencido (+Xd)**" en rojo intenso con días de retraso.
- Tooltip en el PlazoBadge mostrando la fecha exacta de vencimiento.

### 10.7 Notificaciones en Tiempo Real (Futuro)

- Laravel Reverb + WebSockets.
- El técnico recibe notificación cuando se le asigna un caso nuevo (recargar no necesario).
- El Jefe recibe notificación cuando el técnico solicita ampliación de plazo.
- El técnico recibe alerta cuando una solicitud está por vencer.

---

## 11. Decisiones de Arquitectura Técnica

| Aspecto | Decisión |
|---|---|
| Comunicación | Inertia `router.post()` para acciones (admitir, rechazar, iniciar) |
| Errores | Validación backend + Inertia errors para modales |
| Éxito | Toast Sonner (ya instalado) para confirmar acciones |
| Estado de modales | `useState` local en la página (no contexto global) |
| Sheet | `useState` con la denuncia seleccionada + `open` flag |
| Dropdown "Ver como" | Query param `?tecnico=tec-1` recargado con `router.get()` |
| Seed | En el `index()` del controller, condicional: `if(empty(DenunciaData::getAll())) { DenunciaData::seedDemoData(); }` |
| PlazoBadge | Componente puro: recibe `tipo` + `created_at`, calcula en runtime |
