# Preguntas para el Cliente

> **Documento de trabajo.** Contiene todas las preguntas del proyecto y el estado de cada una.
> Una vez respondidas las pendientes, trasladar decisiones a los documentos correspondientes.
> Este archivo se mantiene vivo durante toda la Fase 1.

---

## ✅ Preguntas Resueltas (24)

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

## ⏸️ Preguntas Pendientes (5)

### #2 — SITPRECO: validación de formato
**Estado:** Mantiene. Se deja como **texto libre** sin hint. Cuando el cliente confirme el formato definitivo, se actualizará el input.

### #4 — Estructura del código SITPRECO
**Estado:** Mantiene. Misma que #2. Formato tentativo: 4-5 bloques de 3-4 caracteres separados por guion (ej. `XXX-XXXX-XXX-XXXXX`). Sin validación rígida.

### #5 — Archivar casos: subestado o estado
**Estado:** Mantiene para consulta con cliente. Por ahora se mantiene como subestado de `cerrada` sin afectar la UX pública.

### #6 — C1: Días hábiles vs calendario
**Estado:** Mantiene. Se hará cuando se implemente el Sprint 18 (Calendario Feriados + Plazos), que será uno de los últimos sprints.

### #12 — C7: Destino del expediente al remitirse al Ministerio
**Estado:** Mantiene. ¿El caso se marca como "Cerrado por Remisión al Ministerio" o permanece abierto en monitoreo?

### #13 — C8: Reglas del plazo al reabrir una denuncia
**Estado:** Mantiene. ¿El temporizador se reanuda o se establece una nueva fecha límite manual?

---

## Resumen de estado

| Bloque | Total | ✅ Resueltas | ⏸️ Pendientes |
|--------|-------|--------------|----------------|
| A — Sprint 5 | 4 | 1, 3 | 2, 4 |
| A — Sprint 6 | 1 | — | 5 |
| C — Legales | 8 | 7, 8, 9, 10, 11 | 6, 12, 13 |
| D — Sprint 7 + Transv | 15 | 15-29 (todas) | — |
| **Total** | **28** | **23** | **5** |

---

## Cambios derivados en el proyecto

### Cambio de nombre
- **"Recepcionista" → "Registrador"** (en toda la documentación)

### Roadmap reestructurado (sprints 7-19)
- Sprint 7 — Evaluación Técnica Previa (NUEVO)
- Sprint 8 — Ampliaciones Múltiples
- Sprint 9 — Notificaciones Push + Historial
- Sprint 10 — Panel Administración Catálogos + Subcategorías
- Sprint 11 — Dashboard + KPIs + Reportes PDF/Excel
- Sprint 12 — Tablero Público Cerrados (Welcome)
- Sprint 13 — Tiempos entre Fases
- Sprint 14 — Base de datos real (MySQL)
- Sprint 15 — Roles y permisos (Registrador/Jefe/Técnico)
- Sprint 16 — Auditoría backend detallada
- Sprint 17 — Lógica de mora explícita +Xd
- Sprint 18 — Calendario feriados + días hábiles
- Sprint 19 — Cierre Fase 1 / Ajustes finales (testing, limpieza, docs, deploy)

Ver `Plan de Desarrollo.md` y `Sprints Pendientes - Contexto.md` para detalle.

---
*Última actualización: Junio 2026.*
