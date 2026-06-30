# Sprints Pendientes — Contexto para IA

> **CONVENCIÓN DE LECTURA:** Este archivo contiene el contexto de sprints pendientes (7-19).
> **Solo leer la sección del sprint en el que se está trabajando actualmente.**
> No leer las secciones de sprints futuros para evitar cargar contexto innecesario.

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

### Detalle completo
Ver `Sprint 7 - Evaluación Técnica Previa.md` cuando se cree.

---

## Sprint 8 — Ampliaciones Múltiples

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #11 (C6 resuelta).

### Resumen
El Jefe de Unidad puede aprobar **N ampliaciones parciales** del plazo total (no solo una prórroga por el máximo legal). Cada ampliación tiene su fecha, días concedidos, justificación y aprobado_por.

### Decisiones clave
- Múltiples ampliaciones permitidas (sin límite)
- Cada ampliación es un evento independiente
- El plazo total se acumula: base + suma de ampliaciones
- Máximo legal: 45 días para corrupción (ampliables +45), 20 días para negación de información (ampliables +10)

### Archivos a modificar
- `app/Data/DenunciaData.php` (+array `ampliaciones[]`)
- `app/Http/Controllers/DenunciaController.php` (+aprobarAmpliacion)
- `resources/js/Components/Denuncias/ModalAmpliacionPlazo.tsx` (refactor)
- `resources/js/Components/Denuncias/PlazoBadge.tsx` (mostrar plazo total acumulado)

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

**Estado:** Pendiente (uno de los últimos sprints a reestructurar).
**Origen:** Pregunta pendiente #6 (C1) — decisión con cliente.

### Resumen
Administración de feriados y cálculo dinámico de plazos en **días hábiles** (o calendario, según decisión del cliente).

### ⚠️ Decisión pendiente con cliente
- **C1:** ¿días hábiles o calendario para todos los plazos? (Art. 23 admisión 5d, Art. 25 descargo 10d, Art. 25 solicitud info 10d, Art. 30 total 45d, etc.)

### Sub-preguntas relacionadas (también pendientes)
- ¿Lista oficial de feriados (nacional + departamental La Paz)?
- ¿Pausa durante recesos institucionales (enero, carnaval)?
- ¿Plazos ampliados usan misma lógica?

### Archivos a crear
- `resources/js/Pages/Admin/Feriados.tsx`
- `app/Data/FeriadoData.php`
- `app/Helpers/DiasHabiles.php`
- `app/Http/Controllers/FeriadoController.php`

### Archivos a modificar
- `resources/js/Components/Denuncias/PlazoBadge.tsx` (integrar helper)

### Dependencias
Requiere Sprint 14 (BD).

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
