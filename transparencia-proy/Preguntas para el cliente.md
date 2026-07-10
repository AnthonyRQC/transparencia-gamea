# Preguntas para el Cliente

> **Documento histórico cerrado.** Todas las preguntas resueltas en reuniones
> de Junio y Julio 2026. Las decisiones se trasladan a `Sprints Pendientes - Contexto.md`
> y `Plan de Desarrollo.md`. Este archivo se mantiene como referencia viva.

---

## ✅ Preguntas Resueltas (30)

### Bloque A — Sprint 5 + Sprint 6

#### #1 — SITPRECO punto de asignación ✅
**Decisión:** SITPRECO se obtiene cuando la denuncia se acepta o rechaza.
- Si se **admite**: SITPRECO es **obligatorio**.
- Si se **rechaza**: SITPRECO es **opcional**.

**Nuevo flujo de trabajo — Evaluación Técnica Previa (Sprint 7):**
1. Se registra la denuncia
2. El Jefe de Unidad **puede delegar** la evaluación a un técnico disponible, **o evaluar él mismo**
3. El técnico evalúa y **devuelve** la denuncia al Jefe con su evaluación resumida en un texto
4. El Jefe **admite o rechaza** (con SITPRECO obligatorio si admite)
5. El Jefe **asigna** el caso al mismo técnico que evaluó o a otro (por carga o expertise)
6. En el Informe Final, el SITPRECO ya viene heredado de admisión (no se pide de nuevo)

**Plazo:** Los 5 días de admisión (Art. 23) **se cuentan desde la recepción**, no se pausan durante la evaluación del técnico. Técnico y Jefe **comparten el mismo plazo**.

---

#### #3 — Notificación de cierre al denunciante ✅
**Decisión:** La notificación al denunciante es **opcional** porque también hay casos anónimos.

---

### Bloque A — Sprint 7 + 8 (resueltas Junio 2026)

#### #2 — SITPRECO: validación de formato ⏸️
**Estado:** Mantiene. Se deja como **texto libre** sin hint. Cuando el cliente confirme el formato definitivo, se actualizará el input.

#### #4 — Estructura del código SITPRECO ⏸️
**Estado:** Mantiene. Misma que #2. Formato tentativo: 4-5 bloques de 3-4 caracteres separados por guion (ej. `XXX-XXXX-XXX-XXXXX`). Sin validación rígida.

---

#### #7 — C2: Comportamiento ante vencimiento de plazos ✅
**Decisión:** El sistema **permite el registro posterior** (no bloquea), pero marca **visiblemente el retraso** con texto "+Xd de retraso" o badge "Vencido".

---

#### #8 — C3: Detalle de unidad externa en seguimiento público ✅
**Decisión:** Mensajes **genéricos** en la vista pública (ya implementado en Sprint 6). No se muestra el nombre de la unidad externa específica.

---

#### #9 — C4: Traspaso de casos e historial ✅
**Decisión:** El Técnico B tiene **acceso completo** a todas las anotaciones del Técnico A. Nada es privado. Los traspasos se muestran en la sección correspondiente con sus acciones (como se muestra actualmente).

---

#### #10 — C5: Reserva de identidad y niveles de visibilidad ✅
**Decisión:** Si la identidad es reservada, sigue siendo **visible para todos** los que tengan acceso al caso (Jefe y técnicos asignados). Las asignaciones actuales ya cubren este control: los técnicos solo ven sus casos asignados.

---

#### #11 — C6: Modo de aprobación de ampliaciones ✅
**Decisión:** El Jefe de Unidad puede aprobar **múltiples ampliaciones parciales** (no solo una prórroga directa por el máximo legal).

---

### Bloque C — Legales

#### #5 — Archivar casos: subestado o estado ⏸️
**Estado:** Mantiene para consulta con cliente. Por ahora se mantiene como subestado de `cerrada` sin afectar la UX pública.

---

#### #6 — C1: Días hábiles vs calendario ✅ **RESUELTO (Julio 2026)**
**Decisión final:** Todos los plazos del sistema se calculan en **días hábiles** (lunes a viernes, sin sábados, domingos ni feriados).

**Afecta a TODOS los plazos:**
- Admisión (Art. 23): 5 días hábiles
- Solicitudes información (Art. 25): 10 días hábiles (configurable, default 10)
- Descargos (Art. 25): 10 días hábiles + 5 días prórroga (configurable, default 10)
- Plazo total corrupción (Art. 30): 45 + 45 días hábiles
- Plazo total negación (Art. 30): 20 + 10 días hábiles
- Ampliaciones: todos los plazos en días hábiles

**Administración de feriados:**
- El **Jefe de Unidad** administra los feriados desde el panel `/admin/feriados`
- Los feriados se cuentan a nivel nacional y departamental (La Paz)
- El cálculo de plazos usa el helper `DiasHabiles` con la lista de feriados vigente

**Sub-decisiones:**
- El input `plazo_dias` en Solicitudes/Descargos se **mantiene configurable** (default 10, rango 1-45 hábiles) para permitir flexibilidad según urgencia. No se fuerza un valor fijo.
- La fecha de vencimiento se calcula sumando los días hábiles desde la creación, saltando Sáb/Dom/feriados.

---

#### #12 — C7: Destino del expediente al remitirse al Ministerio ⏸️
**Estado:** Mantiene. ¿El caso se marca como "Cerrado por Remisión al Ministerio" o permanece abierto en monitoreo?

---

#### #13 — C8: Reglas del plazo al reabrir una denuncia ⏸️
**Estado:** Mantiene. ¿El temporizador se reanuda o se establece una nueva fecha límite manual?

---

### Bloque D — Sprint 7 (Dashboard) + Transversales

#### #15 — KPIs prioritarios ✅
**Decisión:** Los 3 KPIs propuestos están bien (Denuncias activas, Pendientes admisión, % Cumplimiento). Se pueden agregar: Casos próximos a vencer (≤5 días) y Casos ya vencidos con mora. Se revisará el detalle cuando se implemente el Sprint 11.

---

#### #16 — Formatos de exportación de reportes ✅
**Decisión:** Se necesita **PDF y Excel**, además de la vista en pantalla.

---

#### #17 — Rangos de fechas para reportes ✅
**Decisión:** Rango de fechas **libre** (el usuario selecciona el rango). El Jefe de unidades pide reportes espontáneos con fechas variables. El dashboard con KPIs muestra los resultados del filtro. Luego el usuario extrae el informe en PDF o Excel.
**Nota:** Este sprint será de los últimos a reestructurar.

---

#### #18 — Distribución por clasificación y subcategorías ✅
**Decisión:**
- Distribución por **clasificación** (penal, civil, etc.) y por **estados** + filtros cruzados con fechas.
- **Subcategorías:** cada tipo de denuncia (corrupción / negación de información) tendrá sus propias subcategorías, definidas en el panel administrativo.
- **Dropdowns editables:** todos los dropdowns con selección tendrán su sección CRUD en el panel de control.
- **Gráficos:** seleccionar el tipo cuidadosamente porque el número de opciones varía. El de subcategorías puede crecer mucho.

---

#### #19 — Tiempos de respuesta entre fases ✅
**Decisión:** Interesante pero se agregaría **al final** (Sprint 13), salvo que no sea complejo para el sistema o la consulta de datos.

---

#### #20 — Comparación interanual ✅
**Decisión:** **No** por ahora. Es pronto para pensar en esto. La selección libre de fechas cubre la necesidad. Actualizaciones futuras si se requiere.

---

#### #21 — Acceso a reportes ✅
**Decisión:** **Solo para el Jefe de Unidad.** Él extrae los informes y los presenta al MAE. Es **interno**, no público.

---

#### #22 — Alertas automáticas / Notificaciones push ✅
**Decisión:** Notificaciones push vía **campana superior** en el navbar. Historial tipo notificaciones de Facebook con interacción similar.

**Alertas prioritarias:**
- Delegaciones de evaluación
- Traspasos de casos
- Denuncias respondidas
- Alertas de plazos por terminar (informes)
- Alertas de cercanía del plazo total (20/25 días)
- Alertas de cercanía de plazo de entrega de solicitudes de información
- Alertas de cercanía de plazo de descargo de denunciados

**Implementación:** Sprint 9 dedicado.

---

#### #23 — Roles y permisos: cuándo se implementan ✅
**Decisión:** Los roles se implementarán **casi al final del proyecto** (Sprint 15). Primero debe funcionar la base de datos. Por el momento hay **3 roles**:
- **Registrador** (antes llamado "Recepcionista")
- **Jefe de Unidad**
- **Técnicos**

---

#### #24 — Persistencia: mock → DB ✅
**Decisión:** Se mantendrán los **mocks**. Los reportes se harán sirviendose de los datos mock. Es complicado crear la base de datos y que en la siguiente reunión el cliente pida cambios grandes en estructura y haya que hacer migraciones complicadas.

---

#### #25 — Multi-usuario simultáneo ✅
**Decisión:** Todas las personas trabajan simultáneamente, pero **no hay conflicto de edición** porque un técnico puede tener varios casos, pero dos o más técnicos **no pueden tener el mismo caso**. El Jefe puede editar sobre un técnico y se refleja en el sistema.

---

#### #26 — Auditoría detallada ✅
**Decisión:** La auditoría actual (en mock) es **suficiente**. La auditoría más detallada solo se registrará en el backend con la base de datos, usando librerías de Laravel (ej. `owen-it/laravel-auditing`).

---

#### #27 — Plazo de respuesta al ciudadano ✅
**Decisión:** No hay plazo legal, no se implementa. Sin embargo, existe un **tablero informativo fuera de la oficina** que avisa casos cerrados. Esto podría ser una **implementación futura** en la página Welcome (Sprint 12). No es complicado de hacer.

---

#### #28 — Límite de reaperturas ✅
**Decisión:** **No hay límite** de reaperturas. Lo manejan manualmente.

---

#### #29 — Criterio de "done" de Fase 1 ✅
**Decisión:** Reestructurar sprints poniendo al final las secciones que necesitan base de datos real. Se continúa avanzando en las secciones que no la necesitan (simulándolas con mocks). La base de datos y la confirmación de días hábiles/calendario se harán al final. La Fase 1 terminará cuando se tenga un panorama general del sistema, se construya la BD y se implemente todo lo demás.

---

### Bloque E — Reunión Julio 2026 (7 nuevas decisiones)

#### #30 — C1: Días hábiles vs calendario (cierre definitivo) ✅
*(Esta pregunta reemplaza la #6 que estaba pendiente. La respuesta completa está en #6 arriba, en Bloque C. Aquí solo está referenciada.)*

**Decisión:** Todos los plazos en días hábiles (Lun-Vie, sin Sáb/Dom/feriados). Administración de feriados por el Jefe de Unidad. Ver detalle en #6.

---

#### #31 — Aligeramiento: quitar uploads obligatorios en flujos intermedios ✅
**Decisión:** Se eliminan los campos de archivo adjunto en los siguientes formularios para reducir carga operativa y evitar que el personal tenga que escanear documentos a cada rato:

| Formulario | Ubicación | Acción |
|---|---|---|
| Responder Solicitud | `ModalResponderSolicitud.tsx` | Quitar input `archivos` |
| Notificar Descargo | `ModalNotificarDescargo.tsx` | Quitar input `respaldo` |
| Responder Descargo | `ModalResponderDescargo.tsx` | Quitar input `documentos` |
| Ampliar Solicitud | `ModalAmpliarSolicitud.tsx` | Quitar input `archivo` |
| Acompañamiento (Evidencia) | `FormularioAcompaniamiento.tsx` | Quitar input `evidencia` |
| Intervención (Archivo) | `FormularioIntervencion.tsx` | Hacer `archivo` OPCIONAL (era `required`) |

**Filosofía:** Los archivos solo se escanean y suben al **Informe Final + Cierre** (Sprint 5). Esto evita filas en el escáner y reduce la fricción del personal con el sistema. La digitalización completa del expediente se hace al final.

---

#### #32 — Flexibilización de campos obligatorios ✅
**Decisión:** Se reducen los umbrales mínimos de caracteres en justificaciones y se hacen opcionales ciertos campos para agilizar el flujo de trabajo. Ver tabla completa:

**Justificaciones con umbral reducido (10/20 → 5/10):**

| Acción | Campo | Antes | Ahora |
|---|---|---|---|
| Denunciado: descripción (si anónimo) | `descripcion` | `min:5` | `min:3` (casi libre) |
| Hechos de la denuncia | `hechos` | `min:20` | `min:10` |
| Rechazar denuncia | `justificacion` | `min:10` | `min:5` |
| Crear solicitud | `detalle` | `min:10` | `min:5` |
| Responder solicitud | `respuesta` | `min:10` | `min:5` |
| Cancelar solicitud | `motivo` | `min:10` | `min:5` |
| Ampliar solicitud | `justificacion` | `min:20` | `min:10` |
| Responder descargo | `resumen_descargo` | `min:10` | `min:5` |
| Cancelar descargo | `motivo` | `min:10` | `min:5` |
| Ampliar descargo | `justificacion` | `min:20` | `min:10` |
| Traspasar caso | `justificacion` | `min:10` | `min:5` |
| Saltar fase | `justificacion` | `min:20` | `min:10` |
| Notificación cierre | `notificacion_descripcion` | `min:10` | `min:5` |
| Motivo no notificado | `no_notificado_motivo` | `required_if` | **HACER OPCIONAL** |

**Campos opcionales nuevos:**
| Formulario | Campo | Cambio |
|---|---|---|
| Registro (no anónimo) | `denunciante.ci` | `required` → `nullable` |
| Registro (no anónimo) | `denunciante.email` | `required` → `nullable` (al menos 1 contacto) |
| Registro (no anónimo) | `denunciante.telefono` | `required` → `nullable` (al menos 1 contacto) |
| Denunciado (si conoce) | `dependencia` | `required_if` → `nullable` |
| Prueba | `descripcion` | `required_with` → `nullable` |
| Acompañamiento | `ci` | `nullable` (ya) — sin cambio |
| Intervención | `archivo` | `required` → `nullable` |
| Intervención | `referencia_nota` | `required` → `nullable` |

**Campos que se MANTIENEN obligatorios (16):**
Todos los campos donde la ley exige explícitamente: `declaracion_jurada`, `denunciante.nombres` (si no anónimo), `denunciados` array, `detalles.categoria/fecha/lugar`, `hechos`, clasificación/fojas/justificación del informe, cierre `concluido_por`/`descripcion`, etc.

---

#### #33 — Archivos grandes + conectividad inestable (Sprint 20) ✅
**Decisión:** Se documenta como **Sprint 20** (post-Fase 1, post-Sprint 19). No se implementa en Fase 0 ni Fase 1. El sprint contendrá:

**Problema:** Los servidores de la institución presentan latencia variable, cortes momentáneos y señal inestable. Los archivos pueden tener hasta 1000+ páginas escaneadas (tamaño >100MB).

**Estrategia propuesta:**
- Chunked uploads (dividir en pedazos de 5-10MB)
- Resumable uploads (reanudar desde último chunk tras corte)
- Retry con backoff exponencial (reintentos automáticos 1s→2s→4s→...)
- Queue asíncrona con Laravel Jobs (no bloquea la UI)
- Hash dedup SHA256 (no resubir archivos duplicados)
- Compresión en cliente (opcional, reducir PDF escaneado)
- Almacenamiento alternativo S3-compat (MinIO local)

**Ver detalle:** `Plan de Desarrollo.md` → Sprint 20.

---

#### #34 — Simulación multi-rol para demo (Sprint 6.5) ✅
**Decisión:** Se crea **Sprint 6.5** (entre Sprint 6 y Sprint 7) para una simulación de roles sin base de datos. Mecanismo:

- **Dropdown en el Header** con 5 usuarios demo:
  - **Registrador:** María García (solo ve `/denuncias/registrar`)
  - **Jefe de Unidad:** Sr. Pedro Mamani (ve Bandeja, Reportes, Admin/Feriados)
  - **Técnicos (3):** Carlos Quispe, Ana Torres, Luis Mamani (ya existentes, ven MisCasos+MiResumen)
- Al cambiar de usuario, se hace POST al backend que guarda en `session('demo_user_id')`
- Sidebar filtra menú según el rol activo
- **Persistencia:** Sesión Laravel (servidor), no localStorage

**Patrón de reusabilidad:** Cuando llegue Sprint 15 (Roles reales + BD), el dropdown se elimina y se reemplaza por `Auth::user()`. El Sidebar usa la misma lógica de `rol` (solo cambia la fuente de datos). **Cero código desechable.**

---

#### #35 — Subdecisión: Administración de feriados por el Jefe ✅
**Decisión:** El **Jefe de Unidad** es el único administrador del calendario de feriados. Accede desde `/admin/feriados` (cuadrícula calendario anual). Puede marcar/desmarcar cualquier día como feriado.

Los feriados afectan a TODOS los plazos del sistema (cálculo centralizado). No hay restricción de cuántos feriados se pueden marcar — es potestad institucional.

**Implementación:** Sprint 10 (Panel Catálogos) + Sprint 18 (helper formal).

---

#### #36 — Fix: max ampliación solicitud (bug heredado) ✅
**Decisión:** Se detectó un bug en `SolicitudController@ampliar`: el frontend de `ModalAmpliarSolicitud.tsx` limita la ampliación a **max:5 días** (correcto según Art. 25), pero el backend tiene `max:45` (inconsistencia heredada). Se corrige bajando a `max:5` para coincidir con el frontend y con `DescargoController@ampliar` que ya tiene `max:5`.

**Nota:** Esto NO afecta la ampliación del plazo total del caso (Sprint 8, `DenunciaController@aprobarAmpliacion`), que correctamente tiene `max:45` (Art. 30, 45+45 corrupción).

---

#### #38 — Filtrado de notificaciones por usuario demo (Sprint 6.5) ✅
**Decisión:** Cada usuario demo (Registrador, Jefe, Técnicos) ve solo notificaciones relevantes a su rol.

- **Jefe de Unidad:** Ve notificaciones de gestión (plazos de TODOS los casos, traspasos, ampliaciones, asignaciones)
- **Técnico (Carlos/Ana/Luis):** Ve solo notificaciones de SUS casos asignados (plazos, traspasos a él, solicitudes, descargos)
- **Registrador:** Notificaciones mínimas (cambios de estado de los registros que hizo)

**Implementación:** `NotificacionData::generarParaUsuario($usuarioId)` filtra las notificaciones derivadas según el rol. Las notificaciones persistentes (asignación, traspaso) se guardan con `usuario_id` y se filtran al recuperar.

---

#### #39 — Preferencias de alerta por usuario (Sprint 10 — Panel Admin) ✅
**Decisión:** En Sprint 10 se implementa un panel de configuración donde cada usuario podrá ajustar los días de anticipación para recibir alertas.

**Valores por defecto (Sprint 6.5, hardcoded):**
| Tipo de alerta | Días antes | Sprint implementación |
|---|---|---|
| Plazo total del caso por vencer | 3 | 6.5 (default) → 10 (configurable) |
| Informe final por vencer | 3 | 6.5 (default) → 10 (configurable) |
| Solicitud de información por vencer | 2 | 6.5 (default) → 10 (configurable) |
| Descargo de denunciados por vencer | 2 | 6.5 (default) → 10 (configurable) |
| Traspaso de casos | Inmediato | 6.5 (siempre inmediato) |

**Implementación:** Panel `/admin/preferencias` en Sprint 10 con sliders/inputs numéricos por tipo de alerta. Persistencia en sesión (mock) luego en BD.

---

#### #40 — Panel de Administración por Usuario (Sprint 17) ✅
**Decisión (Julio 2026):** Se implementa un panel completo de usuario al final del proyecto (Sprint 17), después de la base de datos real (Sprint 14), roles (Sprint 15) y auditoría (Sprint 16).

**Secciones del panel:**
1. **Perfil:** Nombre, email, teléfono editables (mock)
2. **Seguridad:** Cambio de contraseña (mock)
3. **Preferencias de notificación:** Por usuario, cada uno configura sus alertas
4. **Apariencia:** Modo oscuro/claro, idioma (mock)
5. **Cuenta:** Cerrar sesión, eliminar cuenta (mock)

**Preferencias de notificación (por usuario):**
- Switch master: ¿Recibir notificaciones?
- Sliders por tipo (días antes, 0-10):
  - Plazo total del caso
  - Informe final
  - Solicitud de información
  - Descargo de denunciados
- Switch individual por tipo

**Ver detalle:** `Plan de Desarrollo.md` → Sprint 17.

---

#### #37 — Denunciante anónimo sin datos de contacto ✅
**Decisión (Julio 2026):** Una persona anónima puede NO tener email ni teléfono. 
Ejemplo real: dejar una carta con pruebas físicas en la oficina de la UTLCC sin identificarse digitalmente.

**Implementación:**
- En modo **anónimo**: email y teléfono son **completamente opcionales** (ninguno es obligatorio, ni siquiera "al menos uno de contacto")
- En modo **revelado / no anónimo**: `nombres` sigue siendo obligatorio; `CI`, `email`, `teléfono` son opcionales
- La barra de progreso del formulario NO cuenta email/teléfono como campos obligatorios en ningún escenario
- El texto de ayuda indica: "Si no proporciona contacto, podrá consultar el caso presencialmente en la UTLCC con el código de seguimiento"
**Decisión:** Se detectó un bug en `SolicitudController@ampliar`: el frontend de `ModalAmpliarSolicitud.tsx` limita la ampliación a **max:5 días** (correcto según Art. 25), pero el backend tiene `max:45` (inconsistencia heredada). Se corrige bajando a `max:5` para coincidir con el frontend y con `DescargoController@ampliar` que ya tiene `max:5`.

**Nota:** Esto NO afecta la ampliación del plazo total del caso (Sprint 8, `DenunciaController@aprobarAmpliacion`), que correctamente tiene `max:45` (Art. 30, 45+45 corrupción).

---

## ⏸️ Preguntas Pendientes (5)

### #2 — SITPRECO: validación de formato
**Estado:** Mantiene. Se deja como **texto libre** sin hint. Cuando el cliente confirme el formato definitivo, se actualizará el input.

### #4 — Estructura del código SITPRECO
**Estado:** Mantiene. Misma que #2. Formato tentativo: 4-5 bloques de 3-4 caracteres separados por guion (ej. `XXX-XXXX-XXX-XXXXX`). Sin validación rígida.

### #5 — Archivar casos: subestado o estado
**Estado:** Mantiene para consulta con cliente. Por ahora se mantiene como subestado de `cerrada` sin afectar la UX pública.

### #12 — C7: Destino del expediente al remitirse al Ministerio
**Estado:** Mantiene. ¿El caso se marca como "Cerrado por Remisión al Ministerio" o permanece abierto en monitoreo?

### #13 — C8: Reglas del plazo al reabrir una denuncia
**Estado:** Mantiene. ¿El temporizador se reanuda o se establece una nueva fecha límite manual?

---

## Resumen de estado

| Bloque | Total | ✅ Resueltas | ⏸️ Pendientes |
|--------|-------|--------------|----------------|
| A — Sprint 5 + 6 | 4 | 1, 3 | 2, 4 |
| C — Legales | 8 | 6, 7, 8, 9, 10, 11 | 5, 12, 13 |
| D — Sprint 7 + Transv | 15 | 15-29 | — |
| E — Reunión Julio 2026 | 11 | 30-40 | — |
| **Total** | **38** | **33** | **5** |

---

## Cambios derivados en el proyecto

### Cambio de nombre
- **"Recepcionista" → "Registrador"** (en toda la documentación)

### De la reunión de Julio 2026

#### Días hábiles (transversal)
Afecta a TODOS los plazos del sistema. Se implementa un helper `DiasHabiles.php` (Sprint 18) que recibe fecha inicio, cantidad de días hábiles y lista de feriados, y devuelve la fecha de vencimiento calculada. Este helper se integra en todos los puntos de cálculo de plazos retroactivamente (Sprint 4, 7, 8).

#### Aligeramiento del sistema
Se quitan 6 inputs de archivo de flujos intermedios (detalle en #31). Solo se suben archivos al Informe Final + Cierre (Sprint 5). Se flexibilizan 24 umbrales mínimos y se hacen opcionales 8 campos (detalle en #32).

#### Nuevos sprints en el roadmap
- **Sprint 6.5** — Simulación Multi-rol (demo)
- **Sprint 20** — Archivos Grandes + Conectividad (post-Fase 1)

#### Bug fix
- `SolicitudController@ampliar`: `max:45` → `max:5` (consistente con frontend y descargo)

---

## Roadmap reestructurado (sprints 7-20)

- Sprint 6.5 — Simulación Multi-rol (NUEVO)
- Sprint 7 — Evaluación Técnica Previa
- Sprint 8 — Ampliaciones Múltiples
- Sprint 9 — Notificaciones Push + Historial
- Sprint 10 — Panel Administración Catálogos + Subcategorías + Feriados
- Sprint 11 — Dashboard + KPIs + Reportes PDF/Excel
- Sprint 12 — Tablero Público Cerrados
- Sprint 13 — Tiempos entre Fases
- Sprint 14 — Base de datos real (MySQL)
- Sprint 15 — Roles y permisos (Registrador/Jefe/Técnico)
- Sprint 16 — Auditoría backend detallada
- Sprint 17 — Panel de Usuario (Perfil + Seguridad + Preferencias + Apariencia) (NUEVO)
- Sprint 18 — Lógica de mora explícita +Xd
- Sprint 19 — Calendario feriados + Días hábiles (helper formal)
- Sprint 20 — Cierre Fase 1 / Ajustes finales
- Sprint 21 — Archivos Grandes + Conectividad inestable (NUEVO, post-Fase 1)

---

*Última actualización: Julio 2026.*
