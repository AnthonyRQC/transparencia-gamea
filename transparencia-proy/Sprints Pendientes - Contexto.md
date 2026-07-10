# Sprints Pendientes — Contexto para IA

> **CONVENCIÓN DE LECTURA:** Este archivo contiene el contexto de sprints pendientes (7-19).
> **Solo leer la sección del sprint en el que se está trabajando actualmente.**
> No leer las secciones de sprints futuros para evitar cargar contexto innecesario.

---

## Sprint 6.5 — Simulación Multi-Rol para Demo (NUEVO — Julio 2026)

**Estado:** Pendiente de implementación.
**Origen:** Reunión con cliente Julio 2026 — necesidad de demo multi-rol realista.

### Resumen
Dropdown en el Header para cambiar entre **5 usuarios demo** (sin BD, sin auth real). Cada rol ve solo su menú. Reemplaza el patrón `?tecnico=tec-X` actual por un mecanismo más realista de simulación de sesión.

### Usuarios demo

| Usuario | Rol | ID | Ve |
|---------|-----|----|----|
| María García | Registrador | `registrador-1` | Solo `/denuncias/registrar` |
| Pedro Mamani | Jefe de Unidad | `jefe-1` | Bandeja, Reportes, Admin/Feriados, Dashboard |
| Carlos Quispe | Técnico | `tec-1` | MisCasos, MiResumen (solo sus casos) |
| Ana Torres | Técnico | `tec-2` | MisCasos, MiResumen (solo sus casos) |
| Luis Mamani | Técnico | `tec-3` | MisCasos, MiResumen (solo sus casos) |

### Implementación

**Mecanismo:**
- Al cambiar de usuario en el dropdown, se hace un `router.post()` al backend
- El backend guarda el usuario activo en `session('demo_user_id')`
- `AppLayout.tsx` envía el usuario activo como Inertia prop
- El Sidebar filtra menú según `user.rol`
- `BandejaController`, `MisCasosController`, `MiResumenController` leen el rol desde la sesión

**Diferencia con el patrón actual:**
- Actual: `?tecnico=tec-X` en URL (solo funciona para técnicos)
- Nuevo: Sesión Laravel con todos los roles, sin URL params

### Archivos a crear
- `app/Data/SesionUsuarioData.php` (5 usuarios mock + current_user en sesión)
- `app/Http/Controllers/SelectorUsuarioController.php` (POST para cambiar usuario)
- `resources/js/Components/Layout/SelectorUsuarioDemo.tsx` (Dropdown en Header)

### Archivos a modificar
- `resources/js/Components/Layout/Header.tsx` (+SelectorUsuarioDemo)
- `resources/js/Components/Layout/Sidebar.tsx` (filtrar menú por `user.rol`)
- `resources/js/Components/Layout/AppLayout.tsx` (enviar currentUser como prop)
- `app/Http/Controllers/BandejaController.php` (leer sesión para determinar Jefe)
- `app/Http/Controllers/MisCasosController.php` (leer sesión para técnico activo)
- `app/Http/Controllers/MiResumenController.php` (leer sesión para técnico activo)
- `app/Http/Middleware/HandleInertiaRequests.php` (compartir currentUser global)

### Patrón de reusabilidad para Sprint 15
Cuando se implementen roles reales (Sprint 15):
1. El dropdown se **elimina** del Header
2. `SesionUsuarioData` se **reemplaza** por `Auth::user()`
3. El Sidebar **no cambia** — solo cambia la fuente de datos del `user.rol`
4. Los controllers dejan de leer `session('demo_user_id')` y leen `Auth::user()`
5. **Cero código desechable:** el 100% de la lógica de filtrado por rol se reutiliza

### Dependencias
- Ninguna. No requiere BD ni cambios en sprinks anteriores.
- No afecta a Sprint 7 (Evaluación Técnica) que sigue igual.

---

## Sprint 7 — Evaluación Técnica Previa

**Estado:** Pendiente de implementación (próximo sprint activo).
**Origen:** Respuesta del cliente #1 (SITPRECO + delegación de evaluación).

### Resumen
El Jefe de Unidad puede **delegar la evaluación de una denuncia** a un técnico antes de admitirla o rechazarla. El técnico evalúa y devuelve la denuncia con su evaluación resumida en un texto. El Jefe decide entonces si admite o rechaza.

### Flujo completo
1. Recepción (Registrador registra la denuncia)
2. Estado `ingresada`
3. Jefe de Unidad evalúa opciones:
   - **Opción A:** Delegar evaluación a un técnico disponible
   - **Opción B:** Evaluar él mismo (sin delegar)
4. Si delegó: estado cambia a `evaluacion_tecnica`
5. Técnico evalúa y devuelve con texto resumen → estado vuelve a `ingresada` (o queda `evaluacion_devuelta`)
6. Jefe decide:
   - **Admitir** → SITPRECO **obligatorio** → estado `admitida`
   - **Rechazar** → SITPRECO **opcional** → estado `rechazada`
7. Si admitió, Jefe asigna al técnico (mismo que evaluó u otro)

### Plazos
- Los 5 días de admisión (Art. 23) **se cuentan desde la recepción**
- **No se pausan** durante la evaluación del técnico
- Técnico y Jefe **comparten el mismo plazo** de 5 días

### Decisiones clave
- El Jefe **puede elegir** si delega o evalúa él mismo
- Cualquier técnico disponible puede ser delegado
- El técnico que evalúa puede ser reasignado o no al caso final (decisión del Jefe)
- SITPRECO obligatorio al admitir, opcional al rechazar
- Sin hint de formato en input SITPRECO (texto libre)

### Archivos a crear
- `app/Data/EvaluacionData.php`
- `app/Http/Controllers/EvaluacionController.php`
- `resources/js/Components/Denuncias/ModalDelegarEvaluacion.tsx`
- `resources/js/Components/Denuncias/ModalDevolverEvaluacion.tsx`
- `resources/js/Components/Denuncias/TabEvaluacionPrevia.tsx`
- `resources/js/Pages/Denuncias/Evaluaciones.tsx`

### Archivos a modificar
- `app/Data/DenunciaData.php` (nuevo sub-estado `evaluacion_tecnica`, +campos evaluación)
- `app/Http/Controllers/DenunciaController.php` (+delegarEvaluacion, +devolverEvaluacion)
- `resources/js/Components/Denuncias/ModalAdmision.tsx` (SITPRECO obligatorio)
- `resources/js/Components/Denuncias/ModalRechazo.tsx` (SITPRECO opcional, sin hint)
- `resources/js/Components/Denuncias/FormCierre.tsx` (SITPRECO read-only heredado)
- `resources/js/Pages/Denuncias/Bandeja.tsx` (+botón "Delegar evaluación")
- `resources/js/Pages/Denuncias/MisCasos.tsx` (+tab "Evaluaciones delegadas")
- `resources/js/Components/Denuncias/DetalleDenuncia.tsx` (+tab Evaluación Previa)

### Nota — Julio 2026
Los plazos de la evaluación técnica (5 días de admisión, Art. 23) se cuentan en **días hábiles** (Lun-Vie, sin Sáb/Dom/feriados). Decisión tomada en reunión Julio 2026.

### Detalle completo
Ver `Sprint 7 - Evaluación Técnica Previa.md` cuando se cree.

---

## Sprint 8 — Ampliaciones Múltiples

**Estado:** Pendiente (archivo detallado creado: `Sprint 8 - Ampliaciones Múltiples.md`).
**Origen:** Respuesta del cliente #11 (C6 resuelta).

### Resumen
El Jefe de Unidad puede aprobar **N ampliaciones parciales** del plazo total de una denuncia como eventos independientes, con validación del límite legal (45+45 corrupción, 20+10 negación info) y warning visual.

### Decisiones clave
- **Cada ampliación es evento independiente:** `{fecha, dias, justificacion, aprobado_por, solicitado_por?}`
- **Días hábiles:** El cálculo de vencimiento usa días hábiles (Lun-Vie, sin Sáb/Dom/feriados). Decisión tomada Julio 2026.
- **Mostrar límite legal** con warning visual (rojo si excede, amarillo si cerca)
- **Jefe puede ampliar sin solicitud previa** (campo `solicitado_por` opcional)
- **Plazo NO se congela** durante aprobación
- **Ampliaciones se borran al reabrir** denuncia (reloj se reinicia)
- **Permitido en cualquier estado activo post-admisión:** `admitida`, `asignada`, `investigacion`, `informe`, `evaluacion_tecnica`
- **NO permitido en:** `ingresada`, `rechazada`, `cerrada`
- **Validación:** `sumaAmpliaciones + nuevosDias ≤ maxAmpliacion` (45 corrupción, 10 negación)

### Flujo
1. Caso activo (admitida/asignada/etc.)
2. Jefe abre DenunciaSheet → botón "Ampliar plazo"
3. Modal muestra estado actual (plazo base, ampliaciones previas, límite legal)
4. Jefe ingresa días + justificación + (opcional) solicitante
5. Validación de límite legal
6. Se agrega evento a `ampliaciones[]` o muestra warning de error

### Cálculo de fecha de vencimiento
```php
$plazoBase = getPlazoDias($tipo);  // 45 o 20
$sumaAmpliaciones = sum(array_column($ampliaciones, 'dias'));
$plazoTotal = $plazoBase + $sumaAmpliaciones;
$fechaVencimiento = Carbon::parse($created_at)->addDays($plazoTotal);
$diasRestantes = $plazoTotal - $diasTranscurridos;
```

### Archivos a crear
- `resources/js/Components/Denuncias/ModalAmpliacionPlazo.tsx` (nuevo, desde cero)

### Archivos a modificar
- `app/Data/DenunciaData.php` (+campo `ampliaciones[]`, +método `aprobarAmpliacion()`, modificar `getPlazoInfo()` para sumar ampliaciones, +método `getMaxAmpliacion()`)
- `app/Http/Controllers/DenunciaController.php` (+método `aprobarAmpliacion(Request)`)
- `routes/web.php` (+ruta `POST /denuncias/{id}/ampliar-plazo`)
- `resources/js/Components/Denuncias/PlazoBadge.tsx` (mostrar plazo total con ampliaciones)
- `resources/js/Components/Denuncias/DenunciaSheet.tsx` (+botón "Ampliar plazo" solo Jefe)
- `resources/js/Components/Denuncias/DenunciaCard.tsx` (badge "Ampliada +Xd")

### Dependencias
- Ninguna externa (reusa shadcn `dialog`, `input`, `textarea`, `button`, `select`, `checkbox`, `badge`)
- Compatible con Sprint 7 (estado `evaluacion_tecnica`)
- Marco para Sprint 9 (notificaciones de ampliación)
- Prepárate para Sprint 18 (días hábiles)

### Detalle completo
Ver `Sprint 8 - Ampliaciones Múltiples.md`.

---

## Sprint 9 — Notificaciones Push + Historial

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #22.

### Resumen
Sistema de notificaciones push vía **campana superior** en el navbar, con historial scrolleable tipo notificaciones de Facebook. Click en notificación navega al caso relacionado.

### Alertas a implementar
- Delegaciones de evaluación
- Traspasos de casos
- Denuncias respondidas
- Plazos por terminar (informes)
- Plazos total (20/25 días) por vencer
- Solicitudes de información próximas a vencer
- Descargos de denunciados próximos a vencer

### Interacción
- Badge con contador de no leídas
- Marcar individual / marcar todas leídas
- Historial persistente (mock)
- Click navega al caso

### Archivos a crear
- `app/Data/NotificacionData.php`
- `app/Http/Controllers/NotificacionController.php`
- `resources/js/Components/Layout/CampanaNotificaciones.tsx`
- `resources/js/Components/Layout/PanelNotificaciones.tsx`
- `resources/js/Components/Layout/ItemNotificacion.tsx`

### Archivos a modificar
- `resources/js/Components/Layout/Header.tsx` (+integrar campana)

---

## Sprint 10 — Panel Administración Catálogos + Subcategorías

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #18.

### Resumen
Panel administrativo único para **CRUD de todos los catálogos** del sistema. Cada catálogo es editable desde aquí, no hardcodeado en código.

### Catálogos a administrar
- **Clasificaciones finales:** Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado
- **Categorías** de denuncia
- **Subcategorías** de denuncia (por tipo, ej. Corrupción → [Soborno, Nepotismo, ...])
- **Tipos de denuncia:** Corrupción, Negación de Información
- **Estados:** ingresada, evaluación técnica, admitida, rechazada, asignada, investigación, informe, cerrada
- **Medios de notificación:** whatsapp, email, presencial, otro
- **Tipos de prueba:** archivo, prueba física, testigo
- **Dependencias/unidades externas**

### Subcategorías
- Cada tipo de denuncia tiene sus propias subcategorías
- Definidas en este panel
- Seleccionables en formulario de registro
- Consideración: el gráfico de subcategorías puede tener muchas opciones → manejar con cuidado

### Archivos a crear
- `resources/js/Pages/Admin/Catalogos.tsx`
- `app/Data/CatalogoData.php`
- `app/Http/Controllers/CatalogoController.php`
- `resources/js/Components/Admin/TablaCatalogo.tsx`
- `resources/js/Components/Admin/ModalEditarItem.tsx`

### Archivos a modificar
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (cargar subcategorías del catálogo)

### Nota — Julio 2026
**Feriados ahora también se administran aquí.** Aunque Sprint 18 formaliza el helper `DiasHabiles`, la **UI de administración de feriados** (cuadrícula calendario anual) vive en este panel. El Jefe de Unidad marca/desmarca feriados desde aquí. Esto adelanta parte del Sprint 18 a este sprint.

**Archivo adicional:**
- `resources/js/Pages/Admin/Feriados.tsx` (creado, ver Sprint 0 — ya existe como placeholder)

---

## Sprint 11 — Dashboard + KPIs + Reportes PDF/Excel

**Estado:** Pendiente (será uno de los últimos sprints a reestructurar).
**Origen:** Respuestas del cliente #15, #16, #17, #21.

### Resumen
Dashboard con **KPIs** y **gráficos**, más página de **reportes** con tabla + filtros + **exportación PDF/Excel**.

### KPIs propuestos
1. Denuncias activas
2. Pendientes admisión
3. % Cumplimiento de plazos
4. Casos próximos a vencer (≤5 días)
5. Casos ya vencidos con mora

### Filtros
- Rango de fechas **libre** (selector doble)
- Tipo de denuncia
- Estado
- Clasificación
- Filtros cruzados múltiples

### Exportación
- **PDF** y **Excel** además de vista en pantalla
- Solo para el **Jefe de Unidad** (interno, no público)
- Reportes espontáneos con fechas variables

### Dependencias
- `npm install recharts`
- `composer require maatwebsite/excel barryvdh/laravel-dompdf`
- shadcn: `table` (a instalar)

### Archivos a crear
- `resources/js/Components/Dashboard/KPICards.tsx`
- `resources/js/Components/Dashboard/GraficosDashboard.tsx`
- `resources/js/Pages/Reportes/Index.tsx`
- `resources/js/Components/Reportes/TablaReporte.tsx`
- `resources/js/Components/Reportes/FiltrosReporte.tsx`
- `resources/js/Components/Reportes/BotonExportar.tsx`
- `app/Http/Controllers/ReporteController.php`
- `app/Exports/ReporteExcel.php`
- `resources/views/reportes/pdf.blade.php`

### Archivos a modificar
- `resources/js/Pages/Dashboard.tsx` (refactor)

---

## Sprint 12 — Tablero Público Cerrados

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #27.

### Resumen
Sección en la página **Welcome pública** mostrando **casos cerrados recientes** (anonimizados) para aumentar transparencia. Similar al tablero informativo físico que la UTLCC tiene fuera de la oficina.

### Datos mostrados (anonimizados)
- Ticket parcial (ej. DEN-2026-XXXX)
- Tipo de denuncia
- Clasificación final
- Fecha de cierre
- **NO** denunciante ni denunciados

### Complejidad
Baja. Solo vista + endpoint. Se puede hacer tempranamente.

### Archivos a crear
- `resources/js/Components/Publico/TableroCasosCerrados.tsx`

### Archivos a modificar
- `resources/js/Pages/Welcome.tsx` (+sección)
- `app/Http/Controllers/SeguimientoController.php` (+casosCerrados)
- (posible) `app/Http/Controllers/HomeController.php` (nuevo)

---

## Sprint 13 — Tiempos entre Fases

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #19.

### Resumen
Métricas de **duración promedio entre fases** del proceso. Útil para identificar cuellos de botella.

### Métricas
- Recepción → Admisión (días promedio)
- Admisión → Asignación
- Asignación → Primera solicitud/descargo
- Inicio investigación → Informe Final
- Informe → Cierre

### Complejidad
Baja si los timestamps están en mock data. Sería solo una vista tabular sin gráficos dedicados.

### Archivos a crear
- `resources/js/Components/Dashboard/TiemposEntreFases.tsx`

### Archivos a modificar
- `app/Http/Controllers/ReporteController.php` (+método tiemposEntreFases)

---

## Sprint 14 — Base de datos real (MySQL)

**Estado:** Pendiente (al final del proyecto).
**Origen:** Respuestas del cliente #24, #29.

### Resumen
Migrar de mocks a base de datos MySQL real con migraciones, modelos Eloquent y seeders.

### Actividades
- Diseñar esquema de BD
- Crear migraciones
- Crear modelos Eloquent con relaciones
- Crear seeders (migrar seeds mock)
- Refactorizar controllers (reemplazar `*Data.php` por queries Eloquent)
- Configurar `.env` con MySQL de Laragon

### Tablas principales
denuncias, denunciantes, denunciados, solicitudes, descargos, evaluaciones, informes, cierres, bitácora, usuarios, feriados, notificaciones, catálogos, ampliaciones, subcategorías

### Dependencias
Sprint 15 (Roles) y siguientes dependen de este sprint.

---

## Sprint 15 — Roles y Permisos (Registrador / Jefe / Técnico)

**Estado:** Pendiente (casi al final del proyecto).
**Origen:** Respuesta del cliente #23.

### Resumen
Implementar sistema de roles y permisos usando Laravel middleware y policies. Solo se implementa **una vez que la BD esté operativa** (Sprint 14).

### Roles
- **Registrador** (antes "Recepcionista"): registra denuncias
- **Jefe de Unidad:** ve todo, admite/rechaza, asigna, delega, traspasa, reabre, ve reportes
- **Técnicos:** solo ve sus casos asignados, gestiona investigación e informe

### Actividades
- Definir los 3 roles
- Crear `RoleMiddleware` para rutas
- Crear policies por modelo
- Refactorizar bandejas para restricción por rol

### Nota — Julio 2026
**Reemplaza la simulación del Sprint 6.5.** Cuando se implementen roles reales:
1. Eliminar `SelectorUsuarioDemo.tsx` del Header
2. Reemplazar `session('demo_user_id')` por `Auth::user()`
3. El Sidebar y los controllers **no requieren cambios**: la lógica de filtrado por `user.rol` es la misma
4. Cero código desechable — el patrón de Sprint 6.5 fue diseñado para esto

### Dependencias
Requiere Sprint 14 (BD).

---

## Sprint 16 — Auditoría Backend Detallada

**Estado:** Pendiente (al final del proyecto).
**Origen:** Respuesta del cliente #26.

### Resumen
Auditoría automática de todos los cambios usando **`owen-it/laravel-auditing`**. La auditoría actual (mock) es suficiente; esta es la auditoría formal en backend.

### Actividades
- Instalar `composer require owen-it/laravel-auditing`
- Aplicar trait `Auditable` a modelos relevantes
- Configurar qué campos auditar
- Crear vista de auditoría (consulta por caso o por usuario)

### Modelos a auditar
Denuncia, Solicitud, Descargo, Evaluación, Informe, Cierre

### Dependencias
Requiere Sprint 14 (BD).

---

## Sprint 17 — Lógica de Mora Explícita

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #7.

### Resumen
Implementar lógica explícita de **mora** para fechas vencidas: texto "+Xd de retraso", badge "Vencido" en cards, filtro de "casos morosos" en Bandeja y MisCasos.

### Decisión ya implementada (parcialmente)
`PlazoBadge.tsx` ya muestra verde/amarillo/rojo. Este sprint agrega **texto explícito "+Xd"** y filtro dedicado.

### Actividades
- Agregar campo `mora_dias` (calculado on-the-fly o persistido)
- Mostrar texto "+Xd" en cards
- Filtro de "casos morosos" en Bandeja y MisCasos

### Dependencias
Sprint 14 (BD) si se persiste, opcional si solo se calcula on-the-fly.

---

## Sprint 18 — Calendario Feriados + Días Hábiles

**Estado:** Pendiente (sprint formal de cierre del sistema de plazos).
**Origen:** Pregunta #6 (C1) — **decisión tomada en Julio 2026**.

### ⚠️ Decisión: Días hábiles UNIVERSAL
La reunión de Julio 2026 resolvió definitivamente la pregunta #6:
- **Todos los plazos del sistema en días hábiles** (lunes a viernes, sin sábados, domingos ni feriados)
- El Jefe de Unidad administra los feriados desde el panel (UI adelantada a Sprint 10)
- No hay pausa por recesos institucionales (enero, carnaval) — si son feriados oficiales, se marcan en el calendario
- Aplica a TODOS los plazos: admisión, solicitudes, descargos, plazo total, ampliaciones

### Resumen
Este sprint **formaliza** el helper y la UI del sistema de días hábiles que YA está activo desde Sprint 4 (por decisión retroactiva).

**Este sprint NO es para decidir** (ya está decidido). **Es para implementar el código formal.**

### Actividades

#### 1. Helper DiasHabiles.php (formal)
```php
/**
 * Calcula la diferencia en días hábiles entre dos fechas
 * Cuenta Lun-Vie, excluye Sáb/Dom y feriados
 */
function diasHabilesTranscurridos(Carbon $inicio, Carbon $fin, array $feriados): int

/**
 * Suma N días hábiles a una fecha (salta feriados)
 * Ej: agregarDiasHabiles('2026-01-02', 10, ['2026-01-06', ...])
 */
function agregarDiasHabiles(Carbon $fecha, int $dias, array $feriados): Carbon
```

#### 2. FeriadoData.php + FeriadoController.php
- CRUD completo de feriados (nacional + departamental La Paz)
- La UI de administración (cuadrícula calendario) se implementó en Sprint 10
- Este sprint solo conecta el CRUD con la data y el helper

#### 3. Recálculo retroactivo de seed demo
- Todas las denuncias de seed se regeneran con plazos calculados en días hábiles
- `getPlazoInfo()` en DenunciaData, SolicitudData, DescargoData usan el helper

#### 4. Integración en PlazoBadge / PlazoProgress
- La barra de progreso cuenta solo días hábiles
- Los textos de "+Xd de retraso" también usan el helper

### Archivos a crear
- `app/Helpers/DiasHabiles.php` (formal)
- `app/Data/FeriadoData.php` (catálogo con CRUD)
- `app/Http/Controllers/FeriadoController.php` (CRUD)

### Archivos a modificar
- `resources/js/Pages/Admin/Feriados.tsx` (conectar con CRUD real, ya existe placeholder)
- `app/Data/DenunciaData.php` (usar helper en `getPlazoInfo()` y seed)
- `app/Data/SolicitudData.php` (usar helper en `getPlazoInfo()`)
- `app/Data/DescargoData.php` (usar helper en `getPlazoInfo()`)
- `resources/js/Components/Denuncias/PlazoBadge.tsx` (integrar helper backend)
- `resources/js/Components/Denuncias/PlazoProgress.tsx` (integrar helper backend)

### Dependencias
- Sprint 10 (Feriados UI — ya adelantada la interfaz)
- No requiere BD para mock (feriados en sesión igual que otras Data classes)
- Sprint 14 (BD) para persistencia formal

---

## Sprint 19 — Cierre Fase 1 / Ajustes Finales

**Estado:** Pendiente (último sprint).
**Origen:** Decisión general de cierre.

### Resumen
Sprint dedicado a **testing integral, limpieza técnica, documentación de usuario y deploy a producción**. **No incluye funcionalidad nueva.**

### ⚠️ CONVENCIÓN PARA IA
**Esta sección es solo roadmap. No leerla a menos que se esté trabajando explícitamente en el Sprint 19.**

### Actividades
- **Testing end-to-end** de todos los flujos
- **Optimización de performance** (queries, render, bundle)
- **Limpieza de código** (remover mocks/debug, renombrar, documentar)
- **Refactor de deuda técnica** detectada durante desarrollo
- **Auditoría de seguridad** (sanitización, CSRF, rate limits, exposición de datos)
- **Documentación final:**
  - Manual de usuario para UTLCC
  - Manual técnico
  - README de instalación
- **Capacitación** al Jefe y técnicos
- **Deploy a producción** (servidor, DNS, SSL, backups)
- **Criterio "done" final** (checklist de requisitos de Fase 1)

### Dependencias
Requiere Sprints 14-18 completos.

---

## Sprint 20 — Archivos Grandes + Conectividad Inestable (NUEVO — Julio 2026)

**Estado:** Post-Fase 1 (sprint de diseño/planificación, NO se implementa en Fase 0 ni Fase 1).
**Origen:** Reunión con cliente Julio 2026 — preocupación por subida de archivos de 1000+ páginas en entornos con internet inestable.

### Problema
Los servidores institucionales presentan:
- Latencia variable
- Cortes momentáneos de conexión
- Internet lento en ciertas horas
- Señal variable

Los archivos pueden tener hasta **1000+ páginas escaneadas** (>100MB), lo que hace inviable una subida HTTP directa.

### Estrategia propuesta

| Técnica | Propósito | Librería sugerida |
|---------|-----------|-------------------|
| **Chunked uploads** | Dividir archivo grande en pedazos de 5-10MB | `tus.io` protocol + `Uppy` cliente |
| **Resumable uploads** | Reanudar desde último chunk tras corte | `tus-php` servidor |
| **Retry con backoff exponencial** | Reintentos automáticos 1s→2s→4s→... | Custom + Laravel Queue |
| **Hash dedup SHA256** | No resubir archivo ya existente | Custom |
| **Queue asíncrona** | Subida no bloquea UI, procesa en background | Laravel Jobs |
| **Compresión cliente** | Reducir tamaño antes de subir (PDFs escaneados) | Browser-side (opcional) |
| **Storage alternativo** | S3-compatible (MinIO local) en lugar de disco | `league/flysystem-aws-s3-v3` |

### Implementación en Fase 0
No se implementa. Solo se simula una barra de progreso visual + retry animado como placeholder en formularios de subida. Sin chunking real hasta Fase 1.

### Dependencias
- Sprint 14 (BD) para persistencia de referencias a archivos
- Sprint 15 (Auth) para asociar subidas a usuarios
- Sprint 19 (Cierre) completado antes de empezar

### Fuera de alcance
- Subida WebSocket en tiempo real
- CDN externo (decisión institucional)
- Almacenamiento en blockchain

---

*Última actualización: Julio 2026.*
