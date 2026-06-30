# Preguntas para el Cliente

> **Documento de trabajo — Borrador.** Contiene todas las preguntas pendientes del proyecto.
> Las respuestas se escriben debajo de cada pregunta (en el espacio entre la pregunta y la siguiente).
> Una vez respondidas, trasladar decisiones a los documentos correspondientes y borrar este archivo.

---

## Sección 1: Preguntas existentes (extraídas de los .md del proyecto)

### Sprint 5 — Informe Final y Cierre (Sprint 5 - Informe Final y Cierre.md:29-35)

---

#### 1. SITPRECO — Punto de asignación

**Pregunta:**
¿En qué punto del flujo se asigna/define el código SITPRECO?

**Descripción / Contexto:**
Actualmente el campo `cierre_sitpreco` está en el formulario de Cierre (Sprint 5). Es opcional. Pero según el Resumen General (P7 resuelta), SITPRECO es el sistema nacional de Bolivia donde se registran formalmente las denuncias. ¿El código se obtiene al registrar la denuncia en el portal nacional (y se almacena en nuestro sistema al inicio) o solo al cierre? ¿O se requiere validación de formato específico?

**Respuesta del cliente:**









---

#### 2. SITPRECO — Validación de formato

**Pregunta:**
¿Se requiere validación de formato específico para el código SITPRECO?

**Descripción / Contexto:**
Si el código SITPRECO tiene una estructura conocida (ej. letras + números, longitud fija, guiones), debemos validarlo en el input. Si no hay formato conocido, se deja como texto libre opcional.

**Respuesta del cliente:**









---

#### 3. Notificación de cierre al denunciante

**Pregunta:**
Confirmar flujo de notificación de cierre: ¿checkbox "¿Se notificó?" + motivo opcional cuando no se notificó?

**Descripción / Contexto:**
Actualmente `FormCierre.tsx` tiene un checkbox "Notificar al denunciante" que, al marcarlo, muestra campos condicionales (medio, fecha, descripción). El técnico también registra manualmente las notificaciones. ¿El flujo actual es correcto? ¿Se necesita algo adicional (ej. comprobante de notificación obligatorio)?

**Respuesta del cliente:**









---

#### 4. Estructura del código SITPRECO

**Pregunta:**
¿Longitud y formato esperado del código SITPRECO?

**Descripción / Contexto:**
Relacionado con #1 y #2. Especificar si hay una máscara conocida (ej. `SIT-XXXX-XXXX`, `#####-####`, texto libre sin formato fijo, etc.). Si no se sabe, se deja como texto libre hasta que el cliente pueda confirmar.

**Respuesta del cliente:**









---

### Sprint 6 — Seguimiento Público (Sprint 6 - Seguimiento Público.md:171-173)

---

#### 5. Archivar casos — Estado o subestado

**Pregunta:**
¿La funcionalidad de "archivar casos" debe ser un subestado de `cerrada` (actual: `subestado: 'archivada'`) o un estado/proceso separado con flujo propio?

**Descripción / Contexto:**
Actualmente se modeló como subestado de `cerrada` (campo `subestado: 'archivada'` en los datos de seed). No afecta la UX de la vista pública de seguimiento. Pero si "archivar" implica un proceso distinto (con plazos, notificaciones, documentos específicos), debería ser un estado separado con flujo propio. ¿Cómo se usa realmente "archivar" en la UTLCC? ¿Es una clasificación del informe final (Archivado) o una acción posterior al cierre?

**Respuesta del cliente:**









---

### Preguntas del Resumen General (Proyecto - Resumen General del Sistema.md:456-487)

Estas 8 preguntas (C1-C8) están documentadas en el archivo de Resumen General pero NO están resueltas en ningún sprint ni en la documentación de seguimiento. Son críticas porque afectan la arquitectura base del sistema.

---

#### 6. C1 — Interpretación del plazo de admisión/rechazo (5 días)

**Pregunta:**
El Art. 23 menciona "cinco (5) días para admitirla o rechazarla". ¿La unidad interpreta este plazo en **días hábiles** (lunes a viernes) o **días calendario**?

**Descripción / Contexto:**
La Ley de Procedimiento Administrativo de Bolivia suele establecer que todos los plazos administrativos se entienden en días hábiles salvo disposición contraria. Pero es vital confirmarlo con su asesor legal. La respuesta afecta el cálculo de todos los plazos del sistema (Sprint 8).

**Respuesta del cliente:**









---

#### 7. C2 — Comportamiento ante vencimiento de plazos

**Pregunta:**
Cuando un plazo de fase (ej. los 10 días hábiles de descargo o solicitud de información) o el plazo total (45 días hábiles) expira/vence:
- ¿El sistema debe **bloquear** la posibilidad de registrar información tardía (ej. impedir subir el descargo extemporáneo)?
- ¿O el sistema debe **permitir el registro** pero marcar visiblemente el retraso en rojo (indicando cuántos días de mora hubo) para fines de auditoría?

**Descripción / Contexto:**
Técnicamente se recomienda permitir el registro marcando la mora, ya que la evidencia real debe quedar grabada aunque llegue tarde (principio de auditoría). Pero la decisión final es del cliente.

**Respuesta del cliente:**









---

#### 8. C3 — Nivel de detalle en el seguimiento público

**Pregunta:**
Para resguardar el secreto de sumario y confidencialidad: al mostrar el avance de solicitudes a unidades externas en la consulta pública (Sprint 6), ¿es correcto mostrar *"Solicitando información a la Unidad de [Nombre Unidad]"* o se prefiere un mensaje genérico como *"Solicitando información a unidad interna"* sin especificar cuál?

**Descripción / Contexto:**
Actualmente Sprint 6 no muestra solicitudes individuales en la vista pública (solo mensaje de avance genérico). Pero si en el futuro se quisiera mostrar más detalle, hay que definir el nivel de exposición permitido.

**Respuesta del cliente:**









---

#### 9. C4 — Traspaso de casos e historial de comentarios

**Pregunta:**
Cuando el Jefe de Unidad traspasa un caso del Técnico A al Técnico B:
- ¿El Técnico B tiene acceso completo al historial de observaciones, bitácora y anotaciones internas escritas por el Técnico A en ese caso?
- ¿O las anotaciones internas de investigación del Técnico A se mantienen privadas y se inicia una nueva bitácora limpia para el Técnico B, manteniendo solo los documentos oficiales del expediente?

**Descripción / Contexto:**
Esta decisión afecta cómo se modela la bitácora y qué se transfiere en un traspaso. No hay implementación actual de "bitácora del técnico" separada de los datos de la denuncia.

**Respuesta del cliente:**









---

#### 10. C5 — Reserva de Identidad y niveles de visibilidad

**Pregunta:**
El Art. 24 y Art. 29 regulan la reserva de identidad del denunciante. En el sistema local: ¿quién tiene permitido ver el nombre y datos reales del denunciante que solicitó reserva?
- ¿El técnico asignado al caso debe poder verlos para realizar la investigación?
- ¿O los datos reales solo deben ser visibles para el Jefe de Unidad, mostrándose un texto de *"IDENTIDAD RESERVADA"* para el técnico asignado?

**Descripción / Contexto:**
Actualmente no hay filtrado por rol en la maqueta (Fase 0). La respuesta define cómo implementar la reserva cuando se agreguen roles formalmente.

**Respuesta del cliente:**









---

#### 11. C6 — Modo de aprobación de ampliaciones generales

**Pregunta:**
El plazo total de la denuncia (45 días para corrupción, 20 para negación de información) se puede prorrogar justificadamente por un periodo igual o menor. ¿El sistema debe permitir que el Jefe de Unidad apruebe **múltiples ampliaciones parciales** (ej. tres ampliaciones sucesivas de 15 días hasta completar los 45)? ¿O se registra legalmente como una **única prórroga directa** por el máximo plazo permitido?

**Descripción / Contexto:**
Esta pregunta también aparece en Sprint 2 (Sprint 2 - Bandeja de Admisión y Mis Casos.md:442). Afecta el diseño del modal de ampliación y el control de plazos en la investigación.

**Respuesta del cliente:**









---

#### 12. C7 — Destino del expediente al remitirse al Ministerio

**Pregunta:**
Cuando un caso cumple las condiciones de remisión obligatoria al Ministerio de Justicia (daño económico >= Bs 7.000.000 o involucra a la MAE) y se remite dentro de los 2 días hábiles: ¿el caso en nuestro sistema local se marca como **"Cerrado por Remisión al Ministerio"** (dando por terminado el proceso local)? ¿O permanece abierto en un estado especial de monitoreo hasta que el Ministerio responda?

**Descripción / Contexto:**
No hay implementación actual de este flujo. Es un caso especial previsto en la Ley 974 (Art. 15, 21) que debe modelarse antes de producción.

**Respuesta del cliente:**









---

#### 13. C8 — Reglas del plazo al reabrir una denuncia

**Pregunta:**
Si el Jefe de Unidad decide reabrir una denuncia que ya estaba archivada o rechazada: ¿cómo debe comportarse el cálculo de plazos de la Ley 974?
- ¿El temporizador se **reanuda** desde el día en que se archivó/rechazó?
- ¿O se debe poder establecer una **nueva fecha límite manual** aprobada por el Jefe de Unidad para este segundo análisis?

**Descripción / Contexto:**
Sprint 3 implementa la reapertura con fecha manual (ReabrirModal.tsx permite al Jefe elegir la fecha). Esto cubre ambas opciones técnicamente, pero la lógica de negocio debe definirse.

**Respuesta del cliente:**









---

## Sección 2: Pregunta legal crítica (NUEVA)

---

#### 14. Días hábiles vs días calendario para descontador de plazos

**Pregunta:**
¿El descontador de plazos del sistema (admisión 5 días, investigación 20/45 días, solicitud de información 10 días, descargo 10+5 días, remisión al Ministerio 2 días) debe calcularse en **días hábiles** (excluyendo sábados, domingos y feriados) o **días calendario**?

**Descripción / Contexto:**
Esta pregunta es **crítica** porque:
- La Ley 974 usa el término "días" sin especificar "hábiles" en algunos artículos (Art. 23), pero sí especifica "días hábiles" en otros (Art. 25, Art. 30).
- En Bolivia, por defecto legal, los plazos administrativos son en días hábiles.
- La respuesta afecta **TODOS** los cálculos de plazos del sistema.
- Se relaciona directamente con el Sprint 8 (Calendario Feriados + Cálculo de Plazos) y el Sprint 7 (Dashboard con % Cumplimiento de plazos).

**Sub-preguntas relacionadas:**
- ¿Hay lista oficial de feriados que debe respetar el sistema? (Nacional + departamental La Paz/El Alto)
- ¿Los plazos se "pausan" durante recesos institucionales? (ej. vacación colectiva de enero, carnaval, feriados puente)
- ¿Los plazos "ampliados" (prórroga) usan la misma lógica de días hábiles o corren en días calendario?

**Respuesta del cliente:**









---

## Sección 3: Preguntas sugeridas para Sprint 7 (Dashboard + Reportes)

Preguntas útiles para definir antes de implementar el Dashboard. Pueden responderse ahora o durante el Sprint 7.

---

#### 15. KPIs prioritarios

**Pregunta:**
¿Cuáles son los 3-5 indicadores críticos que el Jefe de UTLCC quiere ver al abrir el dashboard?

**Descripción / Contexto:**
La propuesta actual (Plan de Desarrollo.md:582) tiene 3 KPIs:
1. Denuncias activas
2. Pendientes de admisión
3. % Cumplimiento de plazos

¿Son correctos estos 3? ¿Falta alguno? ¿Sobra alguno? ¿Hay otros prioritarios como "Denuncias por técnico", "Tiempo promedio de cierre", "Casos vencidos"?

**Respuesta del cliente:**









---

#### 16. Formatos de exportación de reportes

**Pregunta:**
¿Qué formatos de exportación necesitan para los reportes? ¿PDF, Excel, CSV, todos?

**Descripción / Contexto:**
Afecta las dependencias técnicas (ej. librerías de exportación en Laravel). Si es solo pantalla, no se necesita exportación. Si es PDF, se puede generar con blade + dompdf. Si es Excel, se necesita maatwebsite/laravel-excel.

**Respuesta del cliente:**









---

#### 17. Rangos de fechas para reportes

**Pregunta:**
¿Filtros predefinidos (último mes, último trimestre, semestre, año) o rango personalizado libre? ¿Necesitan comparar periodos (ej. este año vs año anterior)?

**Descripción / Contexto:**
Define la UI de filtros del dashboard y página de reportes. Afecta la lógica de agregación de datos.

**Respuesta del cliente:**









---

#### 18. Distribución por clasificación

**Pregunta:**
¿Gráfico de distribución mostrando clasificación de denuncias cerradas (penal, civil, administrativo, sin indicios, medida correctiva, archivado)? ¿O por estado actual? ¿O ambos?

**Descripción / Contexto:**
Ayuda a decidir qué gráficos incluir en `GraficosDashboard.tsx`. La propuesta actual incluye 3 gráficos (barras, torta, líneas) pero sin especificar variables.

**Respuesta del cliente:**









---

#### 19. Tiempos de respuesta entre fases

**Pregunta:**
¿Necesitan ver métricas de tiempo promedio entre fases (ej. días desde admisión hasta asignación, desde asignación hasta informe, desde informe hasta cierre)? ¿Es un KPI sensible para la unidad?

**Descripción / Contexto:**
El % Cumplimiento de plazos mide si se cumplió el plazo total, pero no muestra dónde ocurren los cuellos de botella. Las métricas entre fases ayudarían a identificar demoras.

**Respuesta del cliente:**









---

#### 20. Comparación interanual

**Pregunta:**
¿Necesitan comparar datos del año actual vs año anterior, o solo histórico del año en curso?

**Descripción / Contexto:**
Afecta la lógica de agregación de datos mock y los filtros del dashboard. Una comparación YoY requiere más datos de seed (mock data de años anteriores).

**Respuesta del cliente:**









---

#### 21. Acceso a reportes

**Pregunta:**
¿Los reportes y dashboard son solo para el Jefe de UTLCC, también para la Máxima Autoridad Institucional (MAE), o son públicos?

**Descripción / Contexto:**
Actualmente no hay roles en código. Pero la respuesta define si la página de reportes debe tener su propio middleware de acceso en el futuro, o si puede ser pública (como seguimiento público).

**Respuesta del cliente:**









---

#### 22. Alertas automáticas en dashboard

**Pregunta:**
¿El dashboard debe mostrar alertas automáticas (ej. "3 denuncias próximas a vencer plazo de admisión", "2 solicitudes de información vencidas")? ¿Qué tipo de alertas son prioritarias?

**Descripción / Contexto:**
Las alertas pueden ser cards destacadas en el dashboard, un panel lateral, o notificaciones push. Definir tipo y prioridad ayuda a dimensionar el Sprint 7.

**Respuesta del cliente:**









---

## Sección 4: Preguntas transversales del proyecto

Preguntas sobre el proyecto general que no pertenecen a un sprint específico.

---

#### 23. Roles y permisos — ¿Cuándo se implementan?

**Pregunta:**
¿Cuándo se implementará el sistema de roles real? ¿Es alcance del Sprint 7, de un sprint posterior, o post-Fase 1?

**Descripción / Contexto:**
Actualmente "no hay roles en código" (AI-CONTEXT.md:48, Plan de Desarrollo.md:66). Todos los usuarios ven todas las pantallas y el cliente valida verbalmente. Mencionaste que los roles se implementarían formalmente en Fase 1 (conexión a BD). ¿Se mantiene ese plan?

**Respuesta del cliente:**









---

#### 24. Persistencia de datos — ¿Cuándo mock → DB real?

**Pregunta:**
¿Cuándo se migrará de mock data (arrays en sesión) a base de datos real (MySQL)?

**Descripción / Contexto:**
Actualmente todo funciona con datos mock en `app/Data/*.php` que persisten en sesión de Laravel. La BD de Laragon está configurada pero no se usa. La estrategia original era postergar hasta que el cliente valide la interfaz. ¿Sprint 7 requiere datos reales para reportes precisos, o se mantiene mock hasta Fase 1?

**Respuesta del cliente:**









---

#### 25. Multi-usuario simultáneo

**Pregunta:**
¿La UTLCC maneja varias personas trabajando simultáneamente en el sistema? ¿Necesitan ver "asignado a" y "en revisión por" en cada denuncia para evitar conflictos de edición?

**Descripción / Contexto:**
Actualmente el sistema es mono-usuario de facto (mock data en sesión individual). Si varias personas usan el sistema a la vez, se necesita bloqueo de edición (locking) o al menos indicar quién está viendo/ editando cada denuncia.

**Respuesta del cliente:**









---

#### 26. Auditoría y trazabilidad adicional

**Pregunta:**
¿Es necesario un log de auditoría más detallado (quién hizo qué, cuándo, desde qué IP) más allá de la bitácora y ediciones de la denuncia?

**Descripción / Contexto:**
Actualmente hay historial de ediciones en `informe_ediciones[]`, `cierre_ediciones[]`, `solicitud_ediciones[]`, `descargo_ediciones[]` (soft delete con tracking). ¿Es suficiente o se necesita un log centralizado estilo "tabla de auditoría"?

**Respuesta del cliente:**









---

#### 27. Plazo de respuesta al ciudadano en denuncias cerradas

**Pregunta:**
Para denuncias cerradas, ¿hay un plazo legal o interno para responder o notificar formalmente al ciudadano sobre el resultado? ¿Afecta el módulo de seguimiento público?

**Descripción / Contexto:**
Actualmente el seguimiento público muestra la clasificación y sugiere "acercarse a la oficina". Si hay un plazo de respuesta, debería mostrarse en la consulta pública (ej. "Fecha estimada de notificación de resultados").

**Respuesta del cliente:**









---

#### 28. Límite de reaperturas por denuncia

**Pregunta:**
¿Hay un límite de cuántas veces se puede reabrir una misma denuncia (rechazada o cerrada)? ¿O el Jefe de Unidad puede reabrir indefinidamente?

**Descripción / Contexto:**
Actualmente Sprint 3 implementa reapertura sin límite. Si hay límite legal o interno, debe validarse en el backend. Si no hay límite, se mantiene como está.

**Respuesta del cliente:**









---

#### 29. Criterio de "done" de Fase 1

**Pregunta:**
¿Qué condiciones deben cumplirse para considerar la Fase 1 completa y lista para producción?

**Descripción / Contexto:**
Actualmente hay 8 sprints planificados (0-8). Después del Sprint 7 (Dashboard) y Sprint 8 (Feriados), ¿qué más falta? ¿Testing con usuario real? ¿Carga de datos históricos? ¿Capacitación? Definir el criterio de "done" ayuda a priorizar los sprints restantes.

**Respuesta del cliente:**









---

## Resumen de preguntas

| # | Sección | Tema | Estado |
|---|---------|------|--------|
| 1 | Sprint 5 | SITPRECO — punto de asignación | ❓ |
| 2 | Sprint 5 | SITPRECO — validación de formato | ❓ |
| 3 | Sprint 5 | Notificación de cierre | ❓ |
| 4 | Sprint 5 | SITPRECO — estructura/longitud | ❓ |
| 5 | Sprint 6 | Archivar: subestado vs estado separado | ❓ |
| 6 | General (C1) | Plazo admisión: hábiles vs calendario | ❓ |
| 7 | General (C2) | Bloquear vs permitir con mora | ❓ |
| 8 | General (C3) | Detalle unidad en seguimiento público | ❓ |
| 9 | General (C4) | Traspaso: historial vs bitácora limpia | ❓ |
| 10 | General (C5) | Reserva identidad: visibilidad técnico | ❓ |
| 11 | General (C6) | Ampliaciones: parciales vs única | ❓ |
| 12 | General (C7) | Remisión Ministerio: cerrado vs monitoreo | ❓ |
| 13 | General (C8) | Reapertura: plazos reanudados vs manual | ❓ |
| 14 | Legal nueva | Días hábiles vs calendario (+ feriados) | ❓ |
| 15 | Sprint 7 | KPIs prioritarios | ❓ |
| 16 | Sprint 7 | Formatos de exportación | ❓ |
| 17 | Sprint 7 | Rangos de fechas | ❓ |
| 18 | Sprint 7 | Distribución por clasificación | ❓ |
| 19 | Sprint 7 | Tiempos entre fases | ❓ |
| 20 | Sprint 7 | Comparación interanual | ❓ |
| 21 | Sprint 7 | Acceso a reportes | ❓ |
| 22 | Sprint 7 | Alertas automáticas | ❓ |
| 23 | Transversal | Roles y permisos — cuándo | ❓ |
| 24 | Transversal | Mock → DB — cuándo | ❓ |
| 25 | Transversal | Multi-usuario simultáneo | ❓ |
| 26 | Transversal | Auditoría adicional | ❓ |
| 27 | Transversal | Plazo respuesta al ciudadano | ❓ |
| 28 | Transversal | Límite de reaperturas | ❓ |
| 29 | Transversal | Criterio "done" Fase 1 | ❓ |

---
*Documento generado el 29 de junio de 2026. Borrar después de obtener respuestas.*
