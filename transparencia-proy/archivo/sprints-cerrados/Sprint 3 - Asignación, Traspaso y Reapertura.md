> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 3 â€” AsignaciÃ³n de TÃ©cnico + Traspaso + Reapertura + Mejoras âœ… COMPLETADO

> **Plan detallado** â€” Basado en las decisiones tomadas con el cliente.
> Sprint 3 mantiene la Fase 0 (sin BD, mock en sesiÃ³n).
> **Completado:** Junio 2026 â€” M3.1 Foundation, M3.2 AsignaciÃ³n, M3.3 Traspaso, M3.4 Reapertura, M3.5 Mejoras Sheet/PlazoBadge, M3.6 Polish, M3.5b Refinamiento Visual
>
> **DecisiÃ³n validada con cliente (Junio 2026):** El TÃ©cnico B tiene **acceso completo** a todas las anotaciones, bitÃ¡cora y observaciones del TÃ©cnico A tras un traspaso. **Nada es privado.** Los traspasos se muestran en la secciÃ³n correspondiente con sus acciones. Esta decisiÃ³n (Pregunta #9 / C4) confirma la implementaciÃ³n actual de Sprint 3.

---

## 0. Resumen y Contexto del Sprint

**Problema original**: Al terminar Sprint 2, el Jefe podÃ­a admitir/rechazar denuncias y el TÃ©cnico veÃ­a sus casos, pero:

| Problema | SoluciÃ³n Sprint 3 |
|---|---|
| No habÃ­a forma de asignar un tÃ©cnico a una denuncia admitida | AsignacionModal con carga de trabajo visible |
| No se podÃ­a traspasar un caso entre tÃ©cnicos | TraspasoModal con justificaciÃ³n obligatoria |
| Una denuncia cerrada/rechazada no podÃ­a reabrirse | ReabrirModal con nueva fecha lÃ­mite manual |
| El detalle del caso no mostraba historial de cambios | SecciÃ³n "Historial del caso" (timeline) en Sheet |
| El PlazoBadge solo mostraba dÃ­as, sin tooltip ni textos descriptivos | Tooltip con fecha exacta + "Vence hoy" / "Vencida hace Xd" |
| Las cards mostraban poca informaciÃ³n a primera vista | RediseÃ±o 3 filas + categorÃ­a + fecha contextual + tÃ©cnico con nombre |
| No se podÃ­an filtrar/ordenar las denuncias en Bandeja | Filtros por ticket/tipo + ordenamiento por plazo/fecha/tÃ©cnico |
| "BitÃ¡cora" sonaba confuso para usuarios no tÃ©cnicos | Renombrado a "Historial del caso" |

---

## 1. Objetivos del Sprint

- âœ… Jefe puede **asignar un tÃ©cnico** a una denuncia admitida, viendo la carga de trabajo actual de cada tÃ©cnico
- âœ… Jefe puede **traspasar** un caso de un tÃ©cnico a otro, con justificaciÃ³n obligatoria
- âœ… Jefe puede **reabrir** una denuncia cerrada o rechazada, definiendo nueva fecha lÃ­mite manual
- âœ… El TÃ©cnico B **ve todo el historial** del caso (incluyendo acciones del TÃ©cnico A)
- âœ… El Sheet lateral tiene **5 secciones** (AdmisiÃ³n, Rechazo, TÃ©cnico, Reapertura, Historial del caso)
- âœ… PlazoBadge con **tooltip** de fecha exacta de vencimiento + textos "Vence hoy" / "Vencida hace Xd"
- âœ… **DenunciaCard rediseÃ±ado**: 3 filas + acciÃ³n (categorÃ­a, tÃ©cnico con nombre, fecha contextual, highlight NUEVO)
- âœ… **Filtros** (bÃºsqueda por ticket + tipo) en Bandeja
- âœ… **Ordenamiento** (plazo / fecha / tÃ©cnico) en Bandeja y MisCasos
- âœ… **Highlight NUEVO** para denuncias < 24h en ingresada (Bandeja) y asignada (MisCasos)
- âœ… "BitÃ¡cora" renombrado a **"Historial del caso"**
- âœ… Labels explÃ­citos: "Denunciante:" y "Asignado a:" en cards

---

## 2. Arquitectura

### 2.1 Bandeja de AdmisiÃ³n (Jefe) â€” `/denuncias`

**5 tabs** (se agregaron "En curso" y "Historial"; "Rechazadas" se unificÃ³ con "Cerradas" en Historial):

| Tab | Contenido | AcciÃ³n |
|---|---|---|
| **Por admitir** | Lista de denuncias con `estado = 'ingresada'`. Ordenadas por plazo ascendente. | Click â†’ Sheet + botones [Admitir] [Rechazar] |
| **Por asignar** | Lista de denuncias con `estado = 'admitida'` (sin tÃ©cnico). | Click â†’ Sheet + botÃ³n [Asignar tÃ©cnico] |
| **En curso** | Lista de denuncias con estado `asignada`/`investigacion`/`informe`. | Click â†’ Sheet + [Traspasar] |
| **Historial** | Lista de denuncias `rechazada` + `cerrada`. Cards con justificaciÃ³n truncada. | Click â†’ Sheet read-only + [Reabrir] |
| **VisiÃ³n general** | 6 ContadorCards: Ingresadas, Admitidas, Asignadas, InvestigaciÃ³n, Informe, Cerradas | Dashboard sin acciones |

**Cards (DenunciaCard redesigned)**: 3 filas + acciÃ³n.
- **Fila 1**: Ticket + `Tipo Â· CategorÃ­a` + Subestado + badge NUEVO/Reasignado + PlazoBadge (a la derecha)
- **Fila 2**: ðŸ‘¤ `Denunciante: <nombre>` + chip Identidad Reservada/AnÃ³nimo
- **Fila 3**: `Asignado a: [avatar] <nombre tÃ©cnico> Â· ðŸ•’ <fecha contextual>`
- **Fila 4**: Botones contextuales (Admitir/Rechazar, Asignar, Traspasar)
- Highlight NUEVO: borde izquierdo primario (`border-l-4 border-l-primary`) para denuncias < 24h

**Filtros/Sort** (barra sobre los tabs):
- Input de bÃºsqueda por ticket
- Select de tipo: Todos / CorrupciÃ³n / NegaciÃ³n / AcompaÃ±amiento / IntervenciÃ³n
- Select de ordenamiento: Plazo (default) / Fecha / TÃ©cnico

### 2.2 Mis Casos (TÃ©cnico) â€” `/denuncias/mis-casos`

**4 tabs** (sin cambios estructurales respecto a Sprint 2):

| Tab | Estados | AcciÃ³n |
|---|---|---|
| Bandeja de entrada | `asignada` | [Iniciar investigaciÃ³n] |
| InvestigaciÃ³n | `investigacion` | [Continuar] deshabilitado (Sprint 4) |
| Informe Final | `informe` | [Continuar] deshabilitado (Sprint 4) |
| Cierre | `cerrada` | Sub-secciÃ³n Archivadas (Accordion) |

**Mejoras Sprint 3**:
- Ordenamiento configurable: Plazo / Fecha / TÃ©cnico
- Highlight NUEVO en cards `asignada` (< 24h desde `fecha_asignada`)

### 2.3 DenunciaSheet (compartido)

Secciones del Sheet lateral:

| SecciÃ³n | Sprint | Contenido |
|---|---|---|
| Encabezado | 2 | Ticket + TipoBadge + PlazoBadge |
| Denunciante | 2 | Nombre + CI + Email + TelÃ©fono + escenario |
| Denunciados | 2 | Lista con switch identidad conocido/no |
| Detalles del Incidente | 2 | CategorÃ­a + Fecha + Hora + Lugar |
| RelaciÃ³n de Hechos | 2 | Textarea read-only |
| Pruebas / Testigos | 2 | Lista con tipo + descripciÃ³n |
| **AdmisiÃ³n** | **3** | Fecha + justificaciÃ³n (opcional) |
| **Rechazo** | **3** | Fecha + justificaciÃ³n (obligatoria) |
| **TÃ©cnico Asignado** | **3** | Avatar + nombre + fecha asignaciÃ³n + historial traspaso |
| **Reapertura** | **3** | Fecha + justificaciÃ³n |
| **Historial del caso** | **3** | Timeline cronolÃ³gico de acciones (admitida, rechazada, asignada, traspaso, reapertura, investigaciÃ³n) |
| Acciones | 2 | Botones contextuales segÃºn estado y vista |

### 2.4 DenunciaCard (rediseÃ±o Sprint 3.5b)

Estructura visual de cada card:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â— [DEN-2026-0009] [NegaciÃ³n Â· Incumplimiento]       [Vencida 2d]â”‚
â”‚   ðŸ‘¤ Denunciante: Daniel Condo [Identidad Reservada]         â”‚
â”‚     Asignado a: [AT] Ana Torres Â· ðŸ•’ En investigaciÃ³n hace 18d â”‚
â”‚                                              [Iniciar investigaciÃ³n] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- **Fecha contextual**: varÃ­a segÃºn el estado (`Ingresada hace Xd`, `Admitida hace Xd`, `Asignada hace Xd`, `En investigaciÃ³n hace Xd`, `En informe final hace Xd`, `Rechazada hace Xd`, `Cerrada/Archivada hace Xd`)
- **Estado reabierta**: muestra `Reabierta hace Xd Â· Plazo: dd/mm`
- **TÃ©cnico**: avatar circular pequeÃ±o + nombre en bold (solo si hay tÃ©cnico asignado)
- **Label "Asignado a:"**: solo visible cuando hay tÃ©cnico
- **Avatar de esquina**: eliminado por redundancia (la info ya estÃ¡ en Fila 3)

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
    'justificacion_traspaso' => null,   // string|null â€” justificaciÃ³n del traspaso
    'fecha_traspaso' => null,           // string|null â€” datetime del traspaso
    'tecnico_anterior' => null,         // string|null â€” ID del tÃ©cnico que tenÃ­a el caso antes
    'fecha_reapertura' => null,         // string|null â€” datetime de reapertura
    'justificacion_reapertura' => null, // string|null â€” justificaciÃ³n de reapertura
    'plazo_reapertura' => null,         // string|null â€” nueva fecha lÃ­mite (DatePicker)
    'fecha_rechazada' => null,          // string|null â€” datetime del rechazo
    'bitacora' => [],                   // array â€” historial de acciones
];
```

### 3.2 BitÃ¡cora â€” estructura de cada entrada

```php
[
    'fecha'   => '2026-06-15 10:30:00',  // datetime de la acciÃ³n
    'accion'  => 'asignada',             // string: admitida | rechazada | asignada | traspaso | investigacion | reapertura
    'detalle' => 'Asignado a Carlos Quispe (tec-1)',  // descripciÃ³n legible
    'usuario' => 'Jefe'                  // string: 'Jefe', 'sistema' o nombre del tÃ©cnico
]
```

### 3.3 Nuevos mÃ©todos en DenunciaData

```php
class DenunciaData {
    // Sprint 3 â€” Acciones
    public static function asignarTecnico(string $ticket, string $tecnicoId): bool;
    public static function traspasar(string $ticket, string $nuevoTecnico, string $justificacion): bool;
    public static function reabrir(string $ticket, string $nuevaFechaLimite, string $justificacion): bool;

    // Sprint 3 â€” Getters
    public static function getCargaTecnicos(): array;
    //   Retorna: [{ id, nombre, iniciales, color, activos, por_vencer, vencidos }]

    // Sprint 2 â€” Modificados
    public static function admitir(string $ticket, ?string $justificacion): bool;
    //   Ahora tambiÃ©n escribe en bitÃ¡cora: { accion: 'admitida', detalle: 'Admitida por Jefe' }

    public static function rechazar(string $ticket, string $justificacion): bool;
    //   Ahora tambiÃ©n escribe en bitÃ¡cora + guarda fecha_rechazada

    public static function iniciarInvestigacion(string $ticket): bool;
    //   Ahora tambiÃ©n escribe en bitÃ¡cora
}
```

**AutomatizaciÃ³n**: Todos los mÃ©todos que modifican el estado de una denuncia (`admitir`, `rechazar`, `asignar`, `traspasar`, `reabrir`, `iniciarInvestigacion`) escriben automÃ¡ticamente una entrada en `bitacora[]` con la fecha actual, la acciÃ³n, un detalle descriptivo y el usuario.

### 3.4 Seed de 12 denuncias demo

Las 12 denuncias del Sprint 2 se actualizaron con los nuevos campos:
- 2 admitidas (porAsignar) â†’ elegibles para asignaciÃ³n
- 3 asignadas/investigacion/informe â†’ elegibles para traspaso
- 1 cerrada + 1 archivada â†’ elegibles para reapertura
- Historial de bitÃ¡cora incluido en cada denuncia con acciones relevantes

---

## 4. shadcn Instalados (Sprint 3)

```bash
npx shadcn@2.3.0 add tooltip progress scroll-area
```

| Componente | Uso en Sprint 3 |
|---|---|
| `tooltip` | Tooltip en PlazoBadge (fecha de vencimiento) + Tooltip en TecnicoCargaCard (ver carga) |
| `progress` | Barra de carga en TecnicoCargaCard |
| `scroll-area` | Contenedor scrollable en AsignacionModal (lista de tÃ©cnicos) |

`input` y `select` ya estaban instalados (Sprint 1/DesignSystem); se reutilizan en filtros de Bandeja.

---

## 5. Archivos del Sprint

### 5.1 Backend â€” Crear

| Archivo | DescripciÃ³n |
|---|---|
| â€” (no se crearon nuevos controllers) | |

### 5.2 Backend â€” Modificar

| Archivo | Cambio |
|---|---|
| `app/Data/DenunciaData.php` | +8 campos nuevos, +3 mÃ©todos (asignarTecnico, traspasar, reabrir) +1 getter (getCargaTecnicos). Todos los mÃ©todos de acciÃ³n ahora registran en bitÃ¡cora automÃ¡ticamente. |
| `app/Http/Controllers/DenunciaController.php` | +4 mÃ©todos: asignar(), traspasar(), reabrir(), cargaTecnicos() |
| `app/Http/Controllers/BandejaController.php` | + props: enCurso, historial, cargaTecnicos (para AsignacionModal) |

### 5.3 Frontend â€” Componentes creados

| Archivo | DescripciÃ³n |
|---|---|
| `Components/Denuncias/AsignacionModal.tsx` | Modal con lista de tÃ©cnicos + carga de trabajo (activos, por vencer, vencidos). Clickeable para seleccionar tÃ©cnico. |
| `Components/Denuncias/TecnicoCargaCard.tsx` | Card de tÃ©cnico con indicadores de carga y barra de progreso visual |
| `Components/Denuncias/TraspasoModal.tsx` | Modal con select de tÃ©cnico destino + textarea de justificaciÃ³n (mÃ­n 10 chars) |
| `Components/Denuncias/ReabrirModal.tsx` | Modal con DatePicker (nueva fecha lÃ­mite) + textarea de justificaciÃ³n (mÃ­n 20 chars) |

### 5.4 Frontend â€” Componentes modificados

| Archivo | Cambio |
|---|---|
| `DenunciaSheet.tsx` | +5 secciones: AdmisiÃ³n, Rechazo, TÃ©cnico Asignado, Reapertura, Historial del caso. "BitÃ¡cora" renombrado â†’ "Historial del caso" |
| `DenunciaCard.tsx` | RediseÃ±o 3 filas: categorÃ­a en badge, tÃ©cnico con nombre + avatar, fecha contextual por etapa, highlight NUEVO, labels "Denunciante:" / "Asignado a:". Avatar de esquina eliminado. |
| `PlazoBadge.tsx` | + Tooltip con fecha exacta de vencimiento. Texto "Vence hoy" para dÃ­a 0. Texto "Vencida hace Xd" para dÃ­as negativos. |
| `TipoDenunciaBadge.tsx` | + Prop `categoria`/`categoriaOtro`. Renderiza "Tipo Â· CategorÃ­a" con separador. 9 categorÃ­as mapeadas. |

### 5.5 Frontend â€” PÃ¡ginas modificadas

| Archivo | Cambio |
|---|---|
| `Pages/Denuncias/Bandeja.tsx` | 4 tabs â†’ 5 tabs (Por admitir, Por asignar, En curso, Historial, VisiÃ³n general). + Filtros (buscar ticket + tipo) + Sort (plazo/fecha/tÃ©cnico) + Highlight NUEVO. Sheet con acciones contextuales: [Asignar tÃ©cnico] en admitida, [Traspasar] en asignada/investigacion/informe, [Reabrir] en rechazada/cerrada. |
| `Pages/Denuncias/MisCasos.tsx` | + Sort dropdown junto a "Ver como:" + Highlight NUEVO en cards asignada (< 24h) |

### 5.6 Rutas nuevas (Sprint 3)

```
POST /denuncias/{ticket}/asignar    â†’ DenunciaController@asignar()
POST /denuncias/{ticket}/traspasar  â†’ DenunciaController@traspasar()
POST /denuncias/{ticket}/reabrir    â†’ DenunciaController@reabrir()
GET  /denuncias/carga-tecnicos      â†’ DenunciaController@cargaTecnicos()
```

Todas las rutas POST usan Ziggy `route()` para respetar el subdirectorio `/transparencia/public/`.

---

## 6. Milestones

### M3.1 â€” Foundation (Backend + Componentes Base) âœ… COMPLETADO

**Objetivo**: Estructura de datos ampliada y componentes base listos.

| # | Tarea | Archivo |
|---|---|---|
| 1 | Ampliar DenunciaData con 8 campos nuevos + bitÃ¡cora | `app/Data/DenunciaData.php` |
| 2 | MÃ©todos: asignarTecnico, traspasar, reabrir, getCargaTecnicos | `app/Data/DenunciaData.php` |
| 3 | Automatizar registro en bitÃ¡cora en admitir/rechazar/iniciarInvestigacion | `app/Data/DenunciaData.php` |
| 4 | Instalar shadcn: tooltip, progress, scroll-area | `npm ...` |
| 5 | Crear TecnicoCargaCard.tsx | `Components/Denuncias/` |

### M3.2 â€” AsignaciÃ³n de TÃ©cnico âœ… COMPLETADO

**Objetivo**: Jefe puede asignar tÃ©cnico a una denuncia admitida.

| # | Tarea | Archivo |
|---|---|---|
| 6 | Crear AsignacionModal.tsx | `Components/Denuncias/` |
| 7 | Tab "Por asignar" funcional en Bandeja | `Pages/Denuncias/Bandeja.tsx` |
| 8 | BotÃ³n [Asignar tÃ©cnico] en Sheet para estado admitida | `Pages/Denuncias/Bandeja.tsx` |
| 9 | Enviar cargaTecnicos desde BandejaController | `app/Http/Controllers/BandejaController.php` |

### M3.3 â€” Traspaso entre TÃ©cnicos âœ… COMPLETADO

**Objetivo**: Jefe puede traspasar un caso de un tÃ©cnico a otro.

| # | Tarea | Archivo |
|---|---|---|
| 10 | Crear TraspasoModal.tsx (justificaciÃ³n obligatoria) | `Components/Denuncias/` |
| 11 | BotÃ³n [Traspasar] en Sheet para estados asignada/investigacion/informe | `Pages/Denuncias/Bandeja.tsx` |
| 12 | Badge "Reasignado" en cards con traspaso reciente (< 7 dÃ­as) | `DenunciaCard.tsx` |

### M3.4 â€” Reapertura âœ… COMPLETADO

**Objetivo**: Jefe puede reabrir denuncias cerradas/rechazadas.

| # | Tarea | Archivo |
|---|---|---|
| 13 | Crear ReabrirModal.tsx (DatePicker + justificaciÃ³n) | `Components/Denuncias/` |
| 14 | BotÃ³n [Reabrir] en Sheet para estados rechazada/cerrada | `Pages/Denuncias/Bandeja.tsx` |
| 15 | Reapertura â†’ estado `ingresada` (pasa por admisiÃ³n nuevamente) | `DenunciaData.php` |

### M3.5 â€” Mejoras Sheet + PlazoBadge âœ… COMPLETADO

**Objetivo**: Sheet con nuevas secciones y PlazoBadge enriquecido.

| # | Tarea | Archivo |
|---|---|---|
| 16 | SecciÃ³n AdmisiÃ³n (fecha+justificaciÃ³n) en Sheet | `DenunciaSheet.tsx` |
| 17 | SecciÃ³n Rechazo (fecha+justificaciÃ³n) en Sheet | `DenunciaSheet.tsx` |
| 18 | SecciÃ³n TÃ©cnico Asignado (avatar+fecha+historial traspaso) en Sheet | `DenunciaSheet.tsx` |
| 19 | SecciÃ³n Reapertura (fecha+justificaciÃ³n) en Sheet | `DenunciaSheet.tsx` |
| 20 | SecciÃ³n BitÃ¡cora (timeline) en Sheet | `DenunciaSheet.tsx` |
| 21 | Tooltip en PlazoBadge con fecha exacta | `PlazoBadge.tsx` |
| 22 | Textos "Vence hoy" / "Vencida hace Xd" | `PlazoBadge.tsx` |

### M3.6 â€” Polish (Fix bugs detectados en testing) âœ… COMPLETADO

**Objetivo**: Corregir errores encontrados durante pruebas funcionales.

| # | Problema | SoluciÃ³n |
|---|---|---|
| 23 | PlazoBadge dentro de TooltipTrigger daba ref warning | Envuelto Badge en `<span>` |
| 24 | POST 404 (subdirectorio no respetado en URL raw) | Reemplazadas URLs raw por Ziggy `route()` |
| 25 | BotÃ³n [Traspasar] no aparecÃ­a | Tab "En curso" no existÃ­a â†’ creada + "Historial" para cerradas |
| 26 | Modal state no reseteaba al abrir | Estado de modales reseteado en `onOpenChange` |
| 27 | Las tabs "Por asignar" y "Rechazadas" se reemplazaron | Nuevos tabs: "En curso" (asignada+investigacion+informe) e "Historial" (rechazada+cerrada) |

### M3.5b â€” Refinamiento Visual (Sprint 3.5) âœ… COMPLETADO

**Objetivo**: Mejorar la informaciÃ³n visible a primera vista en las cards.

| # | Tarea | Archivo |
|---|---|---|
| 28 | Agregar `categoria` a TipoDenunciaBadge (render: "CorrupciÃ³n Â· Cohecho") | `TipoDenunciaBadge.tsx` |
| 29 | RediseÃ±o DenunciaCard a 3 filas + fecha contextual | `DenunciaCard.tsx` |
| 30 | Agregar contextual date por etapa (Ingresada/Admitida hace Xd, etc.) | `DenunciaCard.tsx` |
| 31 | Highlight NUEVO (< 24h): borde izquierdo primario + badge | `DenunciaCard.tsx` + `Bandeja.tsx` |
| 32 | Filtro de bÃºsqueda por ticket + tipo en Bandeja | `Bandeja.tsx` |
| 33 | Ordenamiento (plazo/fecha/tÃ©cnico) en Bandeja + MisCasos | `Bandeja.tsx` + `MisCasos.tsx` |
| 34 | Renombrar "BitÃ¡cora" â†’ "Historial del caso" | `DenunciaSheet.tsx` |
| 35 | Labels "Denunciante:" / "Asignado a:" explÃ­citos en cards | `DenunciaCard.tsx` |
| 36 | Eliminar avatar de tÃ©cnico en esquina superior derecha (redundante) | `DenunciaCard.tsx` |

---

## 7. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|---|---|---|
| 1 | **Reapertura â†’ estado `ingresada`** | Reabrir en el estado actual | Debe pasar por admisiÃ³n de nuevo (control legal) |
| 2 | **Plazo al reabrir: manual (DatePicker)** | Recalcular automÃ¡tico | El Jefe define la nueva fecha lÃ­mite segÃºn criterio |
| 3 | **Traspaso: TÃ©cnico B ve toda la bitÃ¡cora** | BitÃ¡cora limpia para TÃ©cnico B | Necesario para continuidad del caso |
| 4 | **Historial del caso al pie del Sheet** | SecciÃ³n colapsable | Siempre visible, refuerza transparencia |
| 5 | **Badge "Reasignado" visible 7 dÃ­as** | Siempre visible | Evita saturaciÃ³n visual |
| 6 | **DenunciaCard: 3 filas + acciÃ³n** | 2 filas o card minimalista | Balance entre informaciÃ³n y limpieza visual |
| 7 | **CategorÃ­a separada con " Â· " en TipoBadge** | Badge separado para categorÃ­a | Menos badges, mÃ¡s compacto |
| 8 | **Fecha contextual por etapa** | Fecha absoluta "28 jun 2026" | MÃ¡s informativo, contextual |
| 9 | **Highlight NUEVO: borde izquierdo primario** | Badge o animaciÃ³n | Sutil, no intrusivo |
| 10 | **Filtros solo en Bandeja** | TambiÃ©n en MisCasos | MisCasos tiene pocos items, no necesario |
| 11 | **Sort en Bandeja + MisCasos** | Sin sort en MisCasos | El tÃ©cnico tambiÃ©n necesita organizar |
| 12 | **"BitÃ¡cora" â†’ "Historial del caso"** | Mantener tÃ©rmino legal | MÃ¡s intuitivo para usuarios no tÃ©cnicos |
| 13 | **Labels explÃ­citos en cards** | Solo nombres | Evita confusiÃ³n Denunciante vs TÃ©cnico |

---

## 8. Fuera de Alcance (Sprint 4+)

| Funcionalidad | Sprint |
|---|---|
| Solicitudes de InformaciÃ³n (creaciÃ³n, prÃ³rroga, respuesta) | Sprint 4 |
| Descargos del Denunciado (notificaciÃ³n, prÃ³rroga, respuesta) | Sprint 4 |
| Saltar fase (con justificaciÃ³n) | Sprint 4 |
| Persistencia de filtros (localStorage o URL params) | Sprint 4+ |
| Bulk actions (seleccionar mÃºltiples denuncias) | Futuro |
| Atajos de teclado en Sheet (A, R, T, Esc) | Futuro |
| Informe Final con clasificaciÃ³n | Sprint 5 |
| Cierre con SITPRECO | Sprint 5 |
| Seguimiento pÃºblico | Sprint 6 |
| Dashboard + Reportes (Recharts) | Sprint 7 |
| DÃ­as hÃ¡biles + Calendario feriados | Sprint 8 |

---

## 9. Actualizaciones a Otros Documentos

âœ… Completadas. Ver estado actual en cada documento.

| Documento | Cambio |
|---|---|
| `AI-CONTEXT.md` | Sprint 3 âœ…. SecciÃ³n "DocumentaciÃ³n" reorganizada en "Esencial" + "Referencia opcional". PrÃ³ximo Sprint â†’ Sprint 4. |
| `Plan de Desarrollo.md` | Sprint 3 cerrado âœ…. Sprint 3 detallado con componentes, backend, decisiones. LÃ­nea 197 actualizada (4â†’5 tabs). LÃ­nea 262 corregida (esquina eliminada). |

---

## 10. Notas para Sprint 4+ (Perspectiva TÃ©cnica)

### Persistencia de filtros
- Los filtros de Bandeja (bÃºsqueda, tipo, sort) se pierden al recargar la pÃ¡gina.
- OpciÃ³n: almacenar en `localStorage` o como query params en la URL para compartir/enlazar.

### Atajos de teclado
- `A` â†’ Admitir, `R` â†’ Rechazar, `T` â†’ Traspasar, `Esc` â†’ Cerrar Sheet.
- Bajo esfuerzo, productividad alta.

### Highlight NUEVO
- Actualmente usa 24h desde `created_at` (Bandeja) o `fecha_asignada` (MisCasos).
- Considerar extender a 48h o hasta que el usuario haga click en la card.

---

## 11. Decisiones de Arquitectura TÃ©cnica

| Aspecto | DecisiÃ³n |
|---|---|
| **URLs POST** | Siempre Ziggy `route()` para respetar subdirectorio `/transparencia/public/` |
| **BitÃ¡cora** | Array dentro de cada denuncia en sesiÃ³n. Cada acciÃ³n la registra automÃ¡ticamente con fecha, acciÃ³n, detalle, usuario |
| **Reapertura** | Setea estado a `ingresada`, guarda `fecha_reapertura` y `justificacion_reapertura`. El plazo se recalcula desde la nueva fecha manual |
| **Traspaso** | Cambia `tecnico` al nuevo, guarda el anterior en `tecnico_anterior` + `fecha_traspaso` + `justificacion_traspaso` |
| **Carga de tÃ©cnicos** | Prop inline desde BandejaController, calculada en runtime desde las denuncias activas |
| **TipoDenunciaBadge** | Acepta `categoria` y `categoriaOtro` como props opcionales. Renderiza separado con " Â· " |
| **Contextual date** | FunciÃ³n `getContextualText()` en DenunciaCard.tsx. Calcula texto segÃºn estado + fecha relevante |
| **Filtros** | Estado local en Bandeja (`useState`). No persisten en recarga |
| **Sort** | Ordenamiento cliente-side. Default: plazo ascendente |
| **DenunciaCard layout** | `flex-1` + `gap-3` + `space-y-1.5`. PlazoBadge a la derecha con `flex flex-col items-end` |
| **Highlight NUEVO** | Prop `isNew` en DenunciaCard. Borde izquierdo con `border-l-4 border-l-primary` + badge "NUEVO" |

