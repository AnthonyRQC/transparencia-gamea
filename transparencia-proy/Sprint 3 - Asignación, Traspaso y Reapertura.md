# Sprint 3 — Asignación de Técnico + Traspaso + Reapertura + Mejoras ✅ COMPLETADO

> **Plan detallado** — Basado en las decisiones tomadas con el cliente.
> Sprint 3 mantiene la Fase 0 (sin BD, mock en sesión).
> **Completado:** Junio 2026 — M3.1 Foundation, M3.2 Asignación, M3.3 Traspaso, M3.4 Reapertura, M3.5 Mejoras Sheet/PlazoBadge, M3.6 Polish, M3.5b Refinamiento Visual

---

## 0. Resumen y Contexto del Sprint

**Problema original**: Al terminar Sprint 2, el Jefe podía admitir/rechazar denuncias y el Técnico veía sus casos, pero:

| Problema | Solución Sprint 3 |
|---|---|
| No había forma de asignar un técnico a una denuncia admitida | AsignacionModal con carga de trabajo visible |
| No se podía traspasar un caso entre técnicos | TraspasoModal con justificación obligatoria |
| Una denuncia cerrada/rechazada no podía reabrirse | ReabrirModal con nueva fecha límite manual |
| El detalle del caso no mostraba historial de cambios | Sección "Historial del caso" (timeline) en Sheet |
| El PlazoBadge solo mostraba días, sin tooltip ni textos descriptivos | Tooltip con fecha exacta + "Vence hoy" / "Vencida hace Xd" |
| Las cards mostraban poca información a primera vista | Rediseño 3 filas + categoría + fecha contextual + técnico con nombre |
| No se podían filtrar/ordenar las denuncias en Bandeja | Filtros por ticket/tipo + ordenamiento por plazo/fecha/técnico |
| "Bitácora" sonaba confuso para usuarios no técnicos | Renombrado a "Historial del caso" |

---

## 1. Objetivos del Sprint

- ✅ Jefe puede **asignar un técnico** a una denuncia admitida, viendo la carga de trabajo actual de cada técnico
- ✅ Jefe puede **traspasar** un caso de un técnico a otro, con justificación obligatoria
- ✅ Jefe puede **reabrir** una denuncia cerrada o rechazada, definiendo nueva fecha límite manual
- ✅ El Técnico B **ve todo el historial** del caso (incluyendo acciones del Técnico A)
- ✅ El Sheet lateral tiene **5 secciones** (Admisión, Rechazo, Técnico, Reapertura, Historial del caso)
- ✅ PlazoBadge con **tooltip** de fecha exacta de vencimiento + textos "Vence hoy" / "Vencida hace Xd"
- ✅ **DenunciaCard rediseñado**: 3 filas + acción (categoría, técnico con nombre, fecha contextual, highlight NUEVO)
- ✅ **Filtros** (búsqueda por ticket + tipo) en Bandeja
- ✅ **Ordenamiento** (plazo / fecha / técnico) en Bandeja y MisCasos
- ✅ **Highlight NUEVO** para denuncias < 24h en ingresada (Bandeja) y asignada (MisCasos)
- ✅ "Bitácora" renombrado a **"Historial del caso"**
- ✅ Labels explícitos: "Denunciante:" y "Asignado a:" en cards

---

## 2. Arquitectura

### 2.1 Bandeja de Admisión (Jefe) — `/denuncias`

**5 tabs** (se agregaron "En curso" y "Historial"; "Rechazadas" se unificó con "Cerradas" en Historial):

| Tab | Contenido | Acción |
|---|---|---|
| **Por admitir** | Lista de denuncias con `estado = 'ingresada'`. Ordenadas por plazo ascendente. | Click → Sheet + botones [Admitir] [Rechazar] |
| **Por asignar** | Lista de denuncias con `estado = 'admitida'` (sin técnico). | Click → Sheet + botón [Asignar técnico] |
| **En curso** | Lista de denuncias con estado `asignada`/`investigacion`/`informe`. | Click → Sheet + [Traspasar] |
| **Historial** | Lista de denuncias `rechazada` + `cerrada`. Cards con justificación truncada. | Click → Sheet read-only + [Reabrir] |
| **Visión general** | 6 ContadorCards: Ingresadas, Admitidas, Asignadas, Investigación, Informe, Cerradas | Dashboard sin acciones |

**Cards (DenunciaCard redesigned)**: 3 filas + acción.
- **Fila 1**: Ticket + `Tipo · Categoría` + Subestado + badge NUEVO/Reasignado + PlazoBadge (a la derecha)
- **Fila 2**: 👤 `Denunciante: <nombre>` + chip Identidad Reservada/Anónimo
- **Fila 3**: `Asignado a: [avatar] <nombre técnico> · 🕒 <fecha contextual>`
- **Fila 4**: Botones contextuales (Admitir/Rechazar, Asignar, Traspasar)
- Highlight NUEVO: borde izquierdo primario (`border-l-4 border-l-primary`) para denuncias < 24h

**Filtros/Sort** (barra sobre los tabs):
- Input de búsqueda por ticket
- Select de tipo: Todos / Corrupción / Negación / Acompañamiento / Intervención
- Select de ordenamiento: Plazo (default) / Fecha / Técnico

### 2.2 Mis Casos (Técnico) — `/denuncias/mis-casos`

**4 tabs** (sin cambios estructurales respecto a Sprint 2):

| Tab | Estados | Acción |
|---|---|---|
| Bandeja de entrada | `asignada` | [Iniciar investigación] |
| Investigación | `investigacion` | [Continuar] deshabilitado (Sprint 4) |
| Informe Final | `informe` | [Continuar] deshabilitado (Sprint 4) |
| Cierre | `cerrada` | Sub-sección Archivadas (Accordion) |

**Mejoras Sprint 3**:
- Ordenamiento configurable: Plazo / Fecha / Técnico
- Highlight NUEVO en cards `asignada` (< 24h desde `fecha_asignada`)

### 2.3 DenunciaSheet (compartido)

Secciones del Sheet lateral:

| Sección | Sprint | Contenido |
|---|---|---|
| Encabezado | 2 | Ticket + TipoBadge + PlazoBadge |
| Denunciante | 2 | Nombre + CI + Email + Teléfono + escenario |
| Denunciados | 2 | Lista con switch identidad conocido/no |
| Detalles del Incidente | 2 | Categoría + Fecha + Hora + Lugar |
| Relación de Hechos | 2 | Textarea read-only |
| Pruebas / Testigos | 2 | Lista con tipo + descripción |
| **Admisión** | **3** | Fecha + justificación (opcional) |
| **Rechazo** | **3** | Fecha + justificación (obligatoria) |
| **Técnico Asignado** | **3** | Avatar + nombre + fecha asignación + historial traspaso |
| **Reapertura** | **3** | Fecha + justificación |
| **Historial del caso** | **3** | Timeline cronológico de acciones (admitida, rechazada, asignada, traspaso, reapertura, investigación) |
| Acciones | 2 | Botones contextuales según estado y vista |

### 2.4 DenunciaCard (rediseño Sprint 3.5b)

Estructura visual de cada card:

```
┌──────────────────────────────────────────────────────────────┐
│ ● [DEN-2026-0009] [Negación · Incumplimiento]       [Vencida 2d]│
│   👤 Denunciante: Daniel Condo [Identidad Reservada]         │
│     Asignado a: [AT] Ana Torres · 🕒 En investigación hace 18d │
│                                              [Iniciar investigación] │
└──────────────────────────────────────────────────────────────┘
```

- **Fecha contextual**: varía según el estado (`Ingresada hace Xd`, `Admitida hace Xd`, `Asignada hace Xd`, `En investigación hace Xd`, `En informe final hace Xd`, `Rechazada hace Xd`, `Cerrada/Archivada hace Xd`)
- **Estado reabierta**: muestra `Reabierta hace Xd · Plazo: dd/mm`
- **Técnico**: avatar circular pequeño + nombre en bold (solo si hay técnico asignado)
- **Label "Asignado a:"**: solo visible cuando hay técnico
- **Avatar de esquina**: eliminado por redundancia (la info ya está en Fila 3)

---

## 3. Modelo de Datos (DenunciaData.php)

### 3.1 Nuevos campos en la estructura de denuncia

```php
$denuncia = [
    // ... campos existentes (Sprint 1 + Sprint 2)
    'estado' => 'ingresada',          // Sin cambios
    'subestado' => null,              // Sin cambios
    'tecnico' => null,                // Sin cambios
    'fecha_admitida' => null,         // Sin cambios
    'fecha_asignada' => null,         // Sin cambios

    // NUEVOS Sprint 3:
    'justificacion_traspaso' => null,   // string|null — justificación del traspaso
    'fecha_traspaso' => null,           // string|null — datetime del traspaso
    'tecnico_anterior' => null,         // string|null — ID del técnico que tenía el caso antes
    'fecha_reapertura' => null,         // string|null — datetime de reapertura
    'justificacion_reapertura' => null, // string|null — justificación de reapertura
    'plazo_reapertura' => null,         // string|null — nueva fecha límite (DatePicker)
    'fecha_rechazada' => null,          // string|null — datetime del rechazo
    'bitacora' => [],                   // array — historial de acciones
];
```

### 3.2 Bitácora — estructura de cada entrada

```php
[
    'fecha'   => '2026-06-15 10:30:00',  // datetime de la acción
    'accion'  => 'asignada',             // string: admitida | rechazada | asignada | traspaso | investigacion | reapertura
    'detalle' => 'Asignado a Carlos Quispe (tec-1)',  // descripción legible
    'usuario' => 'Jefe'                  // string: 'Jefe', 'sistema' o nombre del técnico
]
```

### 3.3 Nuevos métodos en DenunciaData

```php
class DenunciaData {
    // Sprint 3 — Acciones
    public static function asignarTecnico(string $ticket, string $tecnicoId): bool;
    public static function traspasar(string $ticket, string $nuevoTecnico, string $justificacion): bool;
    public static function reabrir(string $ticket, string $nuevaFechaLimite, string $justificacion): bool;

    // Sprint 3 — Getters
    public static function getCargaTecnicos(): array;
    //   Retorna: [{ id, nombre, iniciales, color, activos, por_vencer, vencidos }]

    // Sprint 2 — Modificados
    public static function admitir(string $ticket, ?string $justificacion): bool;
    //   Ahora también escribe en bitácora: { accion: 'admitida', detalle: 'Admitida por Jefe' }

    public static function rechazar(string $ticket, string $justificacion): bool;
    //   Ahora también escribe en bitácora + guarda fecha_rechazada

    public static function iniciarInvestigacion(string $ticket): bool;
    //   Ahora también escribe en bitácora
}
```

**Automatización**: Todos los métodos que modifican el estado de una denuncia (`admitir`, `rechazar`, `asignar`, `traspasar`, `reabrir`, `iniciarInvestigacion`) escriben automáticamente una entrada en `bitacora[]` con la fecha actual, la acción, un detalle descriptivo y el usuario.

### 3.4 Seed de 12 denuncias demo

Las 12 denuncias del Sprint 2 se actualizaron con los nuevos campos:
- 2 admitidas (porAsignar) → elegibles para asignación
- 3 asignadas/investigacion/informe → elegibles para traspaso
- 1 cerrada + 1 archivada → elegibles para reapertura
- Historial de bitácora incluido en cada denuncia con acciones relevantes

---

## 4. shadcn Instalados (Sprint 3)

```bash
npx shadcn@2.3.0 add tooltip progress scroll-area
```

| Componente | Uso en Sprint 3 |
|---|---|
| `tooltip` | Tooltip en PlazoBadge (fecha de vencimiento) + Tooltip en TecnicoCargaCard (ver carga) |
| `progress` | Barra de carga en TecnicoCargaCard |
| `scroll-area` | Contenedor scrollable en AsignacionModal (lista de técnicos) |

`input` y `select` ya estaban instalados (Sprint 1/DesignSystem); se reutilizan en filtros de Bandeja.

---

## 5. Archivos del Sprint

### 5.1 Backend — Crear

| Archivo | Descripción |
|---|---|
| — (no se crearon nuevos controllers) | |

### 5.2 Backend — Modificar

| Archivo | Cambio |
|---|---|
| `app/Data/DenunciaData.php` | +8 campos nuevos, +3 métodos (asignarTecnico, traspasar, reabrir) +1 getter (getCargaTecnicos). Todos los métodos de acción ahora registran en bitácora automáticamente. |
| `app/Http/Controllers/DenunciaController.php` | +4 métodos: asignar(), traspasar(), reabrir(), cargaTecnicos() |
| `app/Http/Controllers/BandejaController.php` | + props: enCurso, historial, cargaTecnicos (para AsignacionModal) |

### 5.3 Frontend — Componentes creados

| Archivo | Descripción |
|---|---|
| `Components/Denuncias/AsignacionModal.tsx` | Modal con lista de técnicos + carga de trabajo (activos, por vencer, vencidos). Clickeable para seleccionar técnico. |
| `Components/Denuncias/TecnicoCargaCard.tsx` | Card de técnico con indicadores de carga y barra de progreso visual |
| `Components/Denuncias/TraspasoModal.tsx` | Modal con select de técnico destino + textarea de justificación (mín 10 chars) |
| `Components/Denuncias/ReabrirModal.tsx` | Modal con DatePicker (nueva fecha límite) + textarea de justificación (mín 20 chars) |

### 5.4 Frontend — Componentes modificados

| Archivo | Cambio |
|---|---|
| `DenunciaSheet.tsx` | +5 secciones: Admisión, Rechazo, Técnico Asignado, Reapertura, Historial del caso. "Bitácora" renombrado → "Historial del caso" |
| `DenunciaCard.tsx` | Rediseño 3 filas: categoría en badge, técnico con nombre + avatar, fecha contextual por etapa, highlight NUEVO, labels "Denunciante:" / "Asignado a:". Avatar de esquina eliminado. |
| `PlazoBadge.tsx` | + Tooltip con fecha exacta de vencimiento. Texto "Vence hoy" para día 0. Texto "Vencida hace Xd" para días negativos. |
| `TipoDenunciaBadge.tsx` | + Prop `categoria`/`categoriaOtro`. Renderiza "Tipo · Categoría" con separador. 9 categorías mapeadas. |

### 5.5 Frontend — Páginas modificadas

| Archivo | Cambio |
|---|---|
| `Pages/Denuncias/Bandeja.tsx` | 4 tabs → 5 tabs (Por admitir, Por asignar, En curso, Historial, Visión general). + Filtros (buscar ticket + tipo) + Sort (plazo/fecha/técnico) + Highlight NUEVO. Sheet con acciones contextuales: [Asignar técnico] en admitida, [Traspasar] en asignada/investigacion/informe, [Reabrir] en rechazada/cerrada. |
| `Pages/Denuncias/MisCasos.tsx` | + Sort dropdown junto a "Ver como:" + Highlight NUEVO en cards asignada (< 24h) |

### 5.6 Rutas nuevas (Sprint 3)

```
POST /denuncias/{ticket}/asignar    → DenunciaController@asignar()
POST /denuncias/{ticket}/traspasar  → DenunciaController@traspasar()
POST /denuncias/{ticket}/reabrir    → DenunciaController@reabrir()
GET  /denuncias/carga-tecnicos      → DenunciaController@cargaTecnicos()
```

Todas las rutas POST usan Ziggy `route()` para respetar el subdirectorio `/transparencia/public/`.

---

## 6. Milestones

### M3.1 — Foundation (Backend + Componentes Base) ✅ COMPLETADO

**Objetivo**: Estructura de datos ampliada y componentes base listos.

| # | Tarea | Archivo |
|---|---|---|
| 1 | Ampliar DenunciaData con 8 campos nuevos + bitácora | `app/Data/DenunciaData.php` |
| 2 | Métodos: asignarTecnico, traspasar, reabrir, getCargaTecnicos | `app/Data/DenunciaData.php` |
| 3 | Automatizar registro en bitácora en admitir/rechazar/iniciarInvestigacion | `app/Data/DenunciaData.php` |
| 4 | Instalar shadcn: tooltip, progress, scroll-area | `npm ...` |
| 5 | Crear TecnicoCargaCard.tsx | `Components/Denuncias/` |

### M3.2 — Asignación de Técnico ✅ COMPLETADO

**Objetivo**: Jefe puede asignar técnico a una denuncia admitida.

| # | Tarea | Archivo |
|---|---|---|
| 6 | Crear AsignacionModal.tsx | `Components/Denuncias/` |
| 7 | Tab "Por asignar" funcional en Bandeja | `Pages/Denuncias/Bandeja.tsx` |
| 8 | Botón [Asignar técnico] en Sheet para estado admitida | `Pages/Denuncias/Bandeja.tsx` |
| 9 | Enviar cargaTecnicos desde BandejaController | `app/Http/Controllers/BandejaController.php` |

### M3.3 — Traspaso entre Técnicos ✅ COMPLETADO

**Objetivo**: Jefe puede traspasar un caso de un técnico a otro.

| # | Tarea | Archivo |
|---|---|---|
| 10 | Crear TraspasoModal.tsx (justificación obligatoria) | `Components/Denuncias/` |
| 11 | Botón [Traspasar] en Sheet para estados asignada/investigacion/informe | `Pages/Denuncias/Bandeja.tsx` |
| 12 | Badge "Reasignado" en cards con traspaso reciente (< 7 días) | `DenunciaCard.tsx` |

### M3.4 — Reapertura ✅ COMPLETADO

**Objetivo**: Jefe puede reabrir denuncias cerradas/rechazadas.

| # | Tarea | Archivo |
|---|---|---|
| 13 | Crear ReabrirModal.tsx (DatePicker + justificación) | `Components/Denuncias/` |
| 14 | Botón [Reabrir] en Sheet para estados rechazada/cerrada | `Pages/Denuncias/Bandeja.tsx` |
| 15 | Reapertura → estado `ingresada` (pasa por admisión nuevamente) | `DenunciaData.php` |

### M3.5 — Mejoras Sheet + PlazoBadge ✅ COMPLETADO

**Objetivo**: Sheet con nuevas secciones y PlazoBadge enriquecido.

| # | Tarea | Archivo |
|---|---|---|
| 16 | Sección Admisión (fecha+justificación) en Sheet | `DenunciaSheet.tsx` |
| 17 | Sección Rechazo (fecha+justificación) en Sheet | `DenunciaSheet.tsx` |
| 18 | Sección Técnico Asignado (avatar+fecha+historial traspaso) en Sheet | `DenunciaSheet.tsx` |
| 19 | Sección Reapertura (fecha+justificación) en Sheet | `DenunciaSheet.tsx` |
| 20 | Sección Bitácora (timeline) en Sheet | `DenunciaSheet.tsx` |
| 21 | Tooltip en PlazoBadge con fecha exacta | `PlazoBadge.tsx` |
| 22 | Textos "Vence hoy" / "Vencida hace Xd" | `PlazoBadge.tsx` |

### M3.6 — Polish (Fix bugs detectados en testing) ✅ COMPLETADO

**Objetivo**: Corregir errores encontrados durante pruebas funcionales.

| # | Problema | Solución |
|---|---|---|
| 23 | PlazoBadge dentro de TooltipTrigger daba ref warning | Envuelto Badge en `<span>` |
| 24 | POST 404 (subdirectorio no respetado en URL raw) | Reemplazadas URLs raw por Ziggy `route()` |
| 25 | Botón [Traspasar] no aparecía | Tab "En curso" no existía → creada + "Historial" para cerradas |
| 26 | Modal state no reseteaba al abrir | Estado de modales reseteado en `onOpenChange` |
| 27 | Las tabs "Por asignar" y "Rechazadas" se reemplazaron | Nuevos tabs: "En curso" (asignada+investigacion+informe) e "Historial" (rechazada+cerrada) |

### M3.5b — Refinamiento Visual (Sprint 3.5) ✅ COMPLETADO

**Objetivo**: Mejorar la información visible a primera vista en las cards.

| # | Tarea | Archivo |
|---|---|---|
| 28 | Agregar `categoria` a TipoDenunciaBadge (render: "Corrupción · Cohecho") | `TipoDenunciaBadge.tsx` |
| 29 | Rediseño DenunciaCard a 3 filas + fecha contextual | `DenunciaCard.tsx` |
| 30 | Agregar contextual date por etapa (Ingresada/Admitida hace Xd, etc.) | `DenunciaCard.tsx` |
| 31 | Highlight NUEVO (< 24h): borde izquierdo primario + badge | `DenunciaCard.tsx` + `Bandeja.tsx` |
| 32 | Filtro de búsqueda por ticket + tipo en Bandeja | `Bandeja.tsx` |
| 33 | Ordenamiento (plazo/fecha/técnico) en Bandeja + MisCasos | `Bandeja.tsx` + `MisCasos.tsx` |
| 34 | Renombrar "Bitácora" → "Historial del caso" | `DenunciaSheet.tsx` |
| 35 | Labels "Denunciante:" / "Asignado a:" explícitos en cards | `DenunciaCard.tsx` |
| 36 | Eliminar avatar de técnico en esquina superior derecha (redundante) | `DenunciaCard.tsx` |

---

## 7. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| 1 | **Reapertura → estado `ingresada`** | Reabrir en el estado actual | Debe pasar por admisión de nuevo (control legal) |
| 2 | **Plazo al reabrir: manual (DatePicker)** | Recalcular automático | El Jefe define la nueva fecha límite según criterio |
| 3 | **Traspaso: Técnico B ve toda la bitácora** | Bitácora limpia para Técnico B | Necesario para continuidad del caso |
| 4 | **Historial del caso al pie del Sheet** | Sección colapsable | Siempre visible, refuerza transparencia |
| 5 | **Badge "Reasignado" visible 7 días** | Siempre visible | Evita saturación visual |
| 6 | **DenunciaCard: 3 filas + acción** | 2 filas o card minimalista | Balance entre información y limpieza visual |
| 7 | **Categoría separada con " · " en TipoBadge** | Badge separado para categoría | Menos badges, más compacto |
| 8 | **Fecha contextual por etapa** | Fecha absoluta "28 jun 2026" | Más informativo, contextual |
| 9 | **Highlight NUEVO: borde izquierdo primario** | Badge o animación | Sutil, no intrusivo |
| 10 | **Filtros solo en Bandeja** | También en MisCasos | MisCasos tiene pocos items, no necesario |
| 11 | **Sort en Bandeja + MisCasos** | Sin sort en MisCasos | El técnico también necesita organizar |
| 12 | **"Bitácora" → "Historial del caso"** | Mantener término legal | Más intuitivo para usuarios no técnicos |
| 13 | **Labels explícitos en cards** | Solo nombres | Evita confusión Denunciante vs Técnico |

---

## 8. Fuera de Alcance (Sprint 4+)

| Funcionalidad | Sprint |
|---|---|
| Solicitudes de Información (creación, prórroga, respuesta) | Sprint 4 |
| Descargos del Denunciado (notificación, prórroga, respuesta) | Sprint 4 |
| Saltar fase (con justificación) | Sprint 4 |
| Persistencia de filtros (localStorage o URL params) | Sprint 4+ |
| Bulk actions (seleccionar múltiples denuncias) | Futuro |
| Atajos de teclado en Sheet (A, R, T, Esc) | Futuro |
| Informe Final con clasificación | Sprint 5 |
| Cierre con SITPRECO | Sprint 5 |
| Seguimiento público | Sprint 6 |
| Dashboard + Reportes (Recharts) | Sprint 7 |
| Días hábiles + Calendario feriados | Sprint 8 |

---

## 9. Actualizaciones a Otros Documentos

✅ Completadas. Ver estado actual en cada documento.

| Documento | Cambio |
|---|---|
| `AI-CONTEXT.md` | Sprint 3 ✅. Sección "Documentación" reorganizada en "Esencial" + "Referencia opcional". Próximo Sprint → Sprint 4. |
| `Plan de Desarrollo.md` | Sprint 3 cerrado ✅. Sprint 3 detallado con componentes, backend, decisiones. Línea 197 actualizada (4→5 tabs). Línea 262 corregida (esquina eliminada). |

---

## 10. Notas para Sprint 4+ (Perspectiva Técnica)

### Persistencia de filtros
- Los filtros de Bandeja (búsqueda, tipo, sort) se pierden al recargar la página.
- Opción: almacenar en `localStorage` o como query params en la URL para compartir/enlazar.

### Atajos de teclado
- `A` → Admitir, `R` → Rechazar, `T` → Traspasar, `Esc` → Cerrar Sheet.
- Bajo esfuerzo, productividad alta.

### Highlight NUEVO
- Actualmente usa 24h desde `created_at` (Bandeja) o `fecha_asignada` (MisCasos).
- Considerar extender a 48h o hasta que el usuario haga click en la card.

---

## 11. Decisiones de Arquitectura Técnica

| Aspecto | Decisión |
|---|---|
| **URLs POST** | Siempre Ziggy `route()` para respetar subdirectorio `/transparencia/public/` |
| **Bitácora** | Array dentro de cada denuncia en sesión. Cada acción la registra automáticamente con fecha, acción, detalle, usuario |
| **Reapertura** | Setea estado a `ingresada`, guarda `fecha_reapertura` y `justificacion_reapertura`. El plazo se recalcula desde la nueva fecha manual |
| **Traspaso** | Cambia `tecnico` al nuevo, guarda el anterior en `tecnico_anterior` + `fecha_traspaso` + `justificacion_traspaso` |
| **Carga de técnicos** | Prop inline desde BandejaController, calculada en runtime desde las denuncias activas |
| **TipoDenunciaBadge** | Acepta `categoria` y `categoriaOtro` como props opcionales. Renderiza separado con " · " |
| **Contextual date** | Función `getContextualText()` en DenunciaCard.tsx. Calcula texto según estado + fecha relevante |
| **Filtros** | Estado local en Bandeja (`useState`). No persisten en recarga |
| **Sort** | Ordenamiento cliente-side. Default: plazo ascendente |
| **DenunciaCard layout** | `flex-1` + `gap-3` + `space-y-1.5`. PlazoBadge a la derecha con `flex flex-col items-end` |
| **Highlight NUEVO** | Prop `isNew` en DenunciaCard. Borde izquierdo con `border-l-4 border-l-primary` + badge "NUEVO" |
