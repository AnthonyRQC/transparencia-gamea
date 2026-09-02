> ⚠️ **Referencia histórica — diseño original Fase 0.** No es estado actual. Ver AI-CONTEXT.md.
# Preguntas para el Cliente

> **Documento histÃ³rico cerrado.** Todas las preguntas resueltas en reuniones
> de Junio y Julio 2026. Las decisiones se trasladan a `Sprints Pendientes - Contexto.md`
> y `Plan de Desarrollo.md`. Este archivo se mantiene como referencia viva.

---

## âœ… Preguntas Resueltas (30)

### Bloque A â€” Sprint 5 + Sprint 6

#### #1 â€” SITPRECO punto de asignaciÃ³n âœ…
**DecisiÃ³n:** SITPRECO se obtiene cuando la denuncia se acepta o rechaza.
- Si se **admite**: SITPRECO es **obligatorio**.
- Si se **rechaza**: SITPRECO es **opcional**.

**Nuevo flujo de trabajo â€” EvaluaciÃ³n TÃ©cnica Previa (Sprint 7):**
1. Se registra la denuncia
2. El Jefe de Unidad **puede delegar** la evaluaciÃ³n a un tÃ©cnico disponible, **o evaluar Ã©l mismo**
3. El tÃ©cnico evalÃºa y **devuelve** la denuncia al Jefe con su evaluaciÃ³n resumida en un texto
4. El Jefe **admite o rechaza** (con SITPRECO obligatorio si admite)
5. El Jefe **asigna** el caso al mismo tÃ©cnico que evaluÃ³ o a otro (por carga o expertise)
6. En el Informe Final, el SITPRECO ya viene heredado de admisiÃ³n (no se pide de nuevo)

**Plazo:** Los 5 dÃ­as de admisiÃ³n (Art. 23) **se cuentan desde la recepciÃ³n**, no se pausan durante la evaluaciÃ³n del tÃ©cnico. TÃ©cnico y Jefe **comparten el mismo plazo**.

---

#### #3 â€” NotificaciÃ³n de cierre al denunciante âœ…
**DecisiÃ³n:** La notificaciÃ³n al denunciante es **opcional** porque tambiÃ©n hay casos anÃ³nimos.

---

### Bloque A â€” Sprint 7 + 8 (resueltas Junio 2026)

#### #2 â€” SITPRECO: validaciÃ³n de formato â¸ï¸
**Estado:** Mantiene. Se deja como **texto libre** sin hint. Cuando el cliente confirme el formato definitivo, se actualizarÃ¡ el input.

#### #4 â€” Estructura del cÃ³digo SITPRECO â¸ï¸
**Estado:** Mantiene. Misma que #2. Formato tentativo: 4-5 bloques de 3-4 caracteres separados por guion (ej. `XXX-XXXX-XXX-XXXXX`). Sin validaciÃ³n rÃ­gida.

---

#### #7 â€” C2: Comportamiento ante vencimiento de plazos âœ…
**DecisiÃ³n:** El sistema **permite el registro posterior** (no bloquea), pero marca **visiblemente el retraso** con texto "+Xd de retraso" o badge "Vencido".

---

#### #8 â€” C3: Detalle de unidad externa en seguimiento pÃºblico âœ…
**DecisiÃ³n:** Mensajes **genÃ©ricos** en la vista pÃºblica (ya implementado en Sprint 6). No se muestra el nombre de la unidad externa especÃ­fica.

---

#### #9 â€” C4: Traspaso de casos e historial âœ…
**DecisiÃ³n:** El TÃ©cnico B tiene **acceso completo** a todas las anotaciones del TÃ©cnico A. Nada es privado. Los traspasos se muestran en la secciÃ³n correspondiente con sus acciones (como se muestra actualmente).

---

#### #10 â€” C5: Reserva de identidad y niveles de visibilidad âœ…
**DecisiÃ³n:** Si la identidad es reservada, sigue siendo **visible para todos** los que tengan acceso al caso (Jefe y tÃ©cnicos asignados). Las asignaciones actuales ya cubren este control: los tÃ©cnicos solo ven sus casos asignados.

---

#### #11 â€” C6: Modo de aprobaciÃ³n de ampliaciones âœ…
**DecisiÃ³n:** El Jefe de Unidad puede aprobar **mÃºltiples ampliaciones parciales** (no solo una prÃ³rroga directa por el mÃ¡ximo legal).

---

### Bloque C â€” Legales

#### #5 â€” Archivar casos: subestado o estado â¸ï¸
**Estado:** Mantiene para consulta con cliente. Por ahora se mantiene como subestado de `cerrada` sin afectar la UX pÃºblica.

---

#### #6 â€” C1: DÃ­as hÃ¡biles vs calendario âœ… **RESUELTO (Julio 2026)**
**DecisiÃ³n final:** Todos los plazos del sistema se calculan en **dÃ­as hÃ¡biles** (lunes a viernes, sin sÃ¡bados, domingos ni feriados).

**Afecta a TODOS los plazos:**
- AdmisiÃ³n (Art. 23): 5 dÃ­as hÃ¡biles
- Solicitudes informaciÃ³n (Art. 25): 10 dÃ­as hÃ¡biles (configurable, default 10)
- Descargos (Art. 25): 10 dÃ­as hÃ¡biles + 5 dÃ­as prÃ³rroga (configurable, default 10)
- Plazo total corrupciÃ³n (Art. 30): 45 + 45 dÃ­as hÃ¡biles
- Plazo total negaciÃ³n (Art. 30): 20 + 10 dÃ­as hÃ¡biles
- Ampliaciones: todos los plazos en dÃ­as hÃ¡biles

**AdministraciÃ³n de feriados:**
- El **Jefe de Unidad** administra los feriados desde el panel `/admin/feriados`
- Los feriados se cuentan a nivel nacional y departamental (La Paz)
- El cÃ¡lculo de plazos usa el helper `DiasHabiles` con la lista de feriados vigente

**Sub-decisiones:**
- El input `plazo_dias` en Solicitudes/Descargos se **mantiene configurable** (default 10, rango 1-45 hÃ¡biles) para permitir flexibilidad segÃºn urgencia. No se fuerza un valor fijo.
- La fecha de vencimiento se calcula sumando los dÃ­as hÃ¡biles desde la creaciÃ³n, saltando SÃ¡b/Dom/feriados.

---

#### #12 â€” C7: Destino del expediente al remitirse al Ministerio â¸ï¸
**Estado:** Mantiene. Â¿El caso se marca como "Cerrado por RemisiÃ³n al Ministerio" o permanece abierto en monitoreo?

---

#### #13 â€” C8: Reglas del plazo al reabrir una denuncia â¸ï¸
**Estado:** Mantiene. Â¿El temporizador se reanuda o se establece una nueva fecha lÃ­mite manual?

---

### Bloque D â€” Sprint 7 (Dashboard) + Transversales

#### #15 â€” KPIs prioritarios âœ…
**DecisiÃ³n:** Los 3 KPIs propuestos estÃ¡n bien (Denuncias activas, Pendientes admisiÃ³n, % Cumplimiento). Se pueden agregar: Casos prÃ³ximos a vencer (â‰¤5 dÃ­as) y Casos ya vencidos con mora. Se revisarÃ¡ el detalle cuando se implemente el Sprint 11.

---

#### #16 â€” Formatos de exportaciÃ³n de reportes âœ…
**DecisiÃ³n:** Se necesita **PDF y Excel**, ademÃ¡s de la vista en pantalla.

---

#### #17 â€” Rangos de fechas para reportes âœ…
**DecisiÃ³n:** Rango de fechas **libre** (el usuario selecciona el rango). El Jefe de unidades pide reportes espontÃ¡neos con fechas variables. El dashboard con KPIs muestra los resultados del filtro. Luego el usuario extrae el informe en PDF o Excel.
**Nota:** Este sprint serÃ¡ de los Ãºltimos a reestructurar.

---

#### #18 â€” DistribuciÃ³n por clasificaciÃ³n y subcategorÃ­as âœ…
**DecisiÃ³n:**
- DistribuciÃ³n por **clasificaciÃ³n** (penal, civil, etc.) y por **estados** + filtros cruzados con fechas.
- **SubcategorÃ­as:** cada tipo de denuncia (corrupciÃ³n / negaciÃ³n de informaciÃ³n) tendrÃ¡ sus propias subcategorÃ­as, definidas en el panel administrativo.
- **Dropdowns editables:** todos los dropdowns con selecciÃ³n tendrÃ¡n su secciÃ³n CRUD en el panel de control.
- **GrÃ¡ficos:** seleccionar el tipo cuidadosamente porque el nÃºmero de opciones varÃ­a. El de subcategorÃ­as puede crecer mucho.

---

#### #19 â€” Tiempos de respuesta entre fases âœ…
**DecisiÃ³n:** Interesante pero se agregarÃ­a **al final** (Sprint 13), salvo que no sea complejo para el sistema o la consulta de datos.

---

#### #20 â€” ComparaciÃ³n interanual âœ…
**DecisiÃ³n:** **No** por ahora. Es pronto para pensar en esto. La selecciÃ³n libre de fechas cubre la necesidad. Actualizaciones futuras si se requiere.

---

#### #21 â€” Acceso a reportes âœ…
**DecisiÃ³n:** **Solo para el Jefe de Unidad.** Ã‰l extrae los informes y los presenta al MAE. Es **interno**, no pÃºblico.

---

#### #22 â€” Alertas automÃ¡ticas / Notificaciones push âœ…
**DecisiÃ³n:** Notificaciones push vÃ­a **campana superior** en el navbar. Historial tipo notificaciones de Facebook con interacciÃ³n similar.

**Alertas prioritarias:**
- Delegaciones de evaluaciÃ³n
- Traspasos de casos
- Denuncias respondidas
- Alertas de plazos por terminar (informes)
- Alertas de cercanÃ­a del plazo total (20/25 dÃ­as)
- Alertas de cercanÃ­a de plazo de entrega de solicitudes de informaciÃ³n
- Alertas de cercanÃ­a de plazo de descargo de denunciados

**ImplementaciÃ³n:** Sprint 9 dedicado.

---

#### #23 â€” Roles y permisos: cuÃ¡ndo se implementan âœ…
**DecisiÃ³n:** Los roles se implementarÃ¡n **casi al final del proyecto** (Sprint 16). Primero debe funcionar la base de datos. Por el momento hay **3 roles**:
- **Registrador** (antes llamado "Recepcionista")
- **Jefe de Unidad**
- **TÃ©cnicos**

---

#### #24 â€” Persistencia: mock â†’ DB âœ…
**DecisiÃ³n:** Se mantendrÃ¡n los **mocks**. Los reportes se harÃ¡n sirviendose de los datos mock. Es complicado crear la base de datos y que en la siguiente reuniÃ³n el cliente pida cambios grandes en estructura y haya que hacer migraciones complicadas.

---

#### #25 â€” Multi-usuario simultÃ¡neo âœ…
**DecisiÃ³n:** Todas las personas trabajan simultÃ¡neamente, pero **no hay conflicto de ediciÃ³n** porque un tÃ©cnico puede tener varios casos, pero dos o mÃ¡s tÃ©cnicos **no pueden tener el mismo caso**. El Jefe puede editar sobre un tÃ©cnico y se refleja en el sistema.

---

#### #26 â€” AuditorÃ­a detallada âœ…
**DecisiÃ³n:** La auditorÃ­a actual (en mock) es **suficiente**. La auditorÃ­a mÃ¡s detallada solo se registrarÃ¡ en el backend con la base de datos, usando librerÃ­as de Laravel (ej. `owen-it/laravel-auditing`).

---

#### #27 â€” Plazo de respuesta al ciudadano âœ…
**DecisiÃ³n:** No hay plazo legal, no se implementa. Sin embargo, existe un **tablero informativo fuera de la oficina** que avisa casos cerrados. Esto podrÃ­a ser una **implementaciÃ³n futura** en la pÃ¡gina Welcome (Sprint 13). No es complicado de hacer.

---

#### #28 â€” LÃ­mite de reaperturas âœ…
**DecisiÃ³n:** **No hay lÃ­mite** de reaperturas. Lo manejan manualmente.

---

#### #29 â€” Criterio de "done" de Fase 1 âœ…
**DecisiÃ³n:** Reestructurar sprints poniendo al final las secciones que necesitan base de datos real. Se continÃºa avanzando en las secciones que no la necesitan (simulÃ¡ndolas con mocks). La base de datos y la confirmaciÃ³n de dÃ­as hÃ¡biles/calendario se harÃ¡n al final. La Fase 1 terminarÃ¡ cuando se tenga un panorama general del sistema, se construya la BD y se implemente todo lo demÃ¡s.

---

### Bloque E â€” ReuniÃ³n Julio 2026 (7 nuevas decisiones)

#### #30 â€” C1: DÃ­as hÃ¡biles vs calendario (cierre definitivo) âœ…
*(Esta pregunta reemplaza la #6 que estaba pendiente. La respuesta completa estÃ¡ en #6 arriba, en Bloque C. AquÃ­ solo estÃ¡ referenciada.)*

**DecisiÃ³n:** Todos los plazos en dÃ­as hÃ¡biles (Lun-Vie, sin SÃ¡b/Dom/feriados). AdministraciÃ³n de feriados por el Jefe de Unidad. Ver detalle en #6.

---

#### #31 â€” Aligeramiento: quitar uploads obligatorios en flujos intermedios âœ…
**DecisiÃ³n:** Se eliminan los campos de archivo adjunto en los siguientes formularios para reducir carga operativa y evitar que el personal tenga que escanear documentos a cada rato:

| Formulario | UbicaciÃ³n | AcciÃ³n |
|---|---|---|
| Responder Solicitud | `ModalResponderSolicitud.tsx` | Quitar input `archivos` |
| Notificar Descargo | `ModalNotificarDescargo.tsx` | Quitar input `respaldo` |
| Responder Descargo | `ModalResponderDescargo.tsx` | Quitar input `documentos` |
| Ampliar Solicitud | `ModalAmpliarSolicitud.tsx` | Quitar input `archivo` |
| AcompaÃ±amiento (Evidencia) | `FormularioAcompaniamiento.tsx` | Quitar input `evidencia` |
| IntervenciÃ³n (Archivo) | `FormularioIntervencion.tsx` | Hacer `archivo` OPCIONAL (era `required`) |

**FilosofÃ­a:** Los archivos solo se escanean y suben al **Informe Final + Cierre** (Sprint 5). Esto evita filas en el escÃ¡ner y reduce la fricciÃ³n del personal con el sistema. La digitalizaciÃ³n completa del expediente se hace al final.

---

#### #32 â€” FlexibilizaciÃ³n de campos obligatorios âœ…
**DecisiÃ³n:** Se reducen los umbrales mÃ­nimos de caracteres en justificaciones y se hacen opcionales ciertos campos para agilizar el flujo de trabajo. Ver tabla completa:

**Justificaciones con umbral reducido (10/20 â†’ 5/10):**

| AcciÃ³n | Campo | Antes | Ahora |
|---|---|---|---|
| Denunciado: descripciÃ³n (si anÃ³nimo) | `descripcion` | `min:5` | `min:3` (casi libre) |
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
| NotificaciÃ³n cierre | `notificacion_descripcion` | `min:10` | `min:5` |
| Motivo no notificado | `no_notificado_motivo` | `required_if` | **HACER OPCIONAL** |

**Campos opcionales nuevos:**
| Formulario | Campo | Cambio |
|---|---|---|
| Registro (no anÃ³nimo) | `denunciante.ci` | `required` â†’ `nullable` |
| Registro (no anÃ³nimo) | `denunciante.email` | `required` â†’ `nullable` (al menos 1 contacto) |
| Registro (no anÃ³nimo) | `denunciante.telefono` | `required` â†’ `nullable` (al menos 1 contacto) |
| Denunciado (si conoce) | `dependencia` | `required_if` â†’ `nullable` |
| Prueba | `descripcion` | `required_with` â†’ `nullable` |
| AcompaÃ±amiento | `ci` | `nullable` (ya) â€” sin cambio |
| IntervenciÃ³n | `archivo` | `required` â†’ `nullable` |
| IntervenciÃ³n | `referencia_nota` | `required` â†’ `nullable` |

**Campos que se MANTIENEN obligatorios (16):**
Todos los campos donde la ley exige explÃ­citamente: `declaracion_jurada`, `denunciante.nombres` (si no anÃ³nimo), `denunciados` array, `detalles.categoria/fecha/lugar`, `hechos`, clasificaciÃ³n/fojas/justificaciÃ³n del informe, cierre `concluido_por`/`descripcion`, etc.

---

#### #33 â€” Archivos grandes + conectividad inestable (Sprint 20) âœ…
**DecisiÃ³n:** Se documenta como **Sprint 20** (post-Fase 1, post-Sprint 19). No se implementa en Fase 0 ni Fase 1. El sprint contendrÃ¡:

**Problema:** Los servidores de la instituciÃ³n presentan latencia variable, cortes momentÃ¡neos y seÃ±al inestable. Los archivos pueden tener hasta 1000+ pÃ¡ginas escaneadas (tamaÃ±o >100MB).

**Estrategia propuesta:**
- Chunked uploads (dividir en pedazos de 5-10MB)
- Resumable uploads (reanudar desde Ãºltimo chunk tras corte)
- Retry con backoff exponencial (reintentos automÃ¡ticos 1sâ†’2sâ†’4sâ†’...)
- Queue asÃ­ncrona con Laravel Jobs (no bloquea la UI)
- Hash dedup SHA256 (no resubir archivos duplicados)
- CompresiÃ³n en cliente (opcional, reducir PDF escaneado)
- Almacenamiento alternativo S3-compat (MinIO local)

**Ver detalle:** `Plan de Desarrollo.md` â†’ Sprint 20.

---

#### #34 â€” SimulaciÃ³n multi-rol para demo (Sprint 6.5) âœ…
**DecisiÃ³n:** Se crea **Sprint 6.5** (entre Sprint 6 y Sprint 7) para una simulaciÃ³n de roles sin base de datos. Mecanismo:

- **Dropdown en el Header** con 5 usuarios demo:
  - **Registrador:** MarÃ­a GarcÃ­a (solo ve `/denuncias/registrar`)
  - **Jefe de Unidad:** Sr. Pedro Mamani (ve Bandeja, Reportes, Admin/Feriados)
  - **TÃ©cnicos (3):** Carlos Quispe, Ana Torres, Luis Mamani (ya existentes, ven MisCasos+MiResumen)
- Al cambiar de usuario, se hace POST al backend que guarda en `session('demo_user_id')`
- Sidebar filtra menÃº segÃºn el rol activo
- **Persistencia:** SesiÃ³n Laravel (servidor), no localStorage

**PatrÃ³n de reusabilidad:** Cuando llegue Sprint 16 (Roles reales + BD), el dropdown se elimina y se reemplaza por `Auth::user()`. El Sidebar usa la misma lÃ³gica de `rol` (solo cambia la fuente de datos). **Cero cÃ³digo desechable.**

---

#### #35 â€” SubdecisiÃ³n: AdministraciÃ³n de feriados por el Jefe âœ…
**DecisiÃ³n:** El **Jefe de Unidad** es el Ãºnico administrador del calendario de feriados. Accede desde `/admin/feriados` (cuadrÃ­cula calendario anual). Puede marcar/desmarcar cualquier dÃ­a como feriado.

Los feriados afectan a TODOS los plazos del sistema (cÃ¡lculo centralizado). No hay restricciÃ³n de cuÃ¡ntos feriados se pueden marcar â€” es potestad institucional.

**ImplementaciÃ³n:** Sprint 11 (Panel CatÃ¡logos) + Sprint 20 (helper formal).

---

#### #36 â€” Fix: max ampliaciÃ³n solicitud (bug heredado) âœ…
**DecisiÃ³n:** Se detectÃ³ un bug en `SolicitudController@ampliar`: el frontend de `ModalAmpliarSolicitud.tsx` limita la ampliaciÃ³n a **max:5 dÃ­as** (correcto segÃºn Art. 25), pero el backend tiene `max:45` (inconsistencia heredada). Se corrige bajando a `max:5` para coincidir con el frontend y con `DescargoController@ampliar` que ya tiene `max:5`.

**Nota:** Esto NO afecta la ampliaciÃ³n del plazo total del caso (Sprint 8, `DenunciaController@aprobarAmpliacion`), que correctamente tiene `max:45` (Art. 30, 45+45 corrupciÃ³n).

---

#### #38 â€” Filtrado de notificaciones por usuario demo (Sprint 6.5) âœ…
**DecisiÃ³n:** Cada usuario demo (Registrador, Jefe, TÃ©cnicos) ve solo notificaciones relevantes a su rol.

- **Jefe de Unidad:** Ve notificaciones de gestiÃ³n (plazos de TODOS los casos, traspasos, ampliaciones, asignaciones)
- **TÃ©cnico (Carlos/Ana/Luis):** Ve solo notificaciones de SUS casos asignados (plazos, traspasos a Ã©l, solicitudes, descargos)
- **Registrador:** Notificaciones mÃ­nimas (cambios de estado de los registros que hizo)

**ImplementaciÃ³n:** `NotificacionData::generarParaUsuario($usuarioId)` filtra las notificaciones derivadas segÃºn el rol. Las notificaciones persistentes (asignaciÃ³n, traspaso) se guardan con `usuario_id` y se filtran al recuperar.

---

#### #39 â€” Preferencias de alerta por usuario (Sprint 11 â€” Panel Admin) âœ…
**DecisiÃ³n:** En Sprint 11 se implementa un panel de configuraciÃ³n donde cada usuario podrÃ¡ ajustar los dÃ­as de anticipaciÃ³n para recibir alertas.

**Valores por defecto (Sprint 6.5, hardcoded):**
| Tipo de alerta | DÃ­as antes | Sprint implementaciÃ³n |
|---|---|---|
| Plazo total del caso por vencer | 3 | 6.5 (default) â†’ 18 (configurable) |
| Informe final por vencer | 3 | 6.5 (default) â†’ 18 (configurable) |
| Solicitud de informaciÃ³n por vencer | 2 | 6.5 (default) â†’ 18 (configurable) |
| Descargo de denunciados por vencer | 2 | 6.5 (default) â†’ 18 (configurable) |
| Traspaso de casos | Inmediato | 6.5 (siempre inmediato) |

**ImplementaciÃ³n:** Panel `/admin/preferencias` en Sprint 18 con sliders/inputs numÃ©ricos por tipo de alerta. Persistencia en sesiÃ³n (mock) luego en BD.

---

#### #40 â€” Panel de AdministraciÃ³n por Usuario (Sprint 18) âœ…
**DecisiÃ³n (Julio 2026):** Se implementa un panel completo de usuario al final del proyecto (Sprint 18), despuÃ©s de la base de datos real (Sprint 10), roles (Sprint 16) y auditorÃ­a (Sprint 17).

**Secciones del panel:**
1. **Perfil:** Nombre, email, telÃ©fono editables (mock)
2. **Seguridad:** Cambio de contraseÃ±a (mock)
3. **Preferencias de notificaciÃ³n:** Por usuario, cada uno configura sus alertas
4. **Apariencia:** Modo oscuro/claro, idioma (mock)
5. **Cuenta:** Cerrar sesiÃ³n, eliminar cuenta (mock)

**Preferencias de notificaciÃ³n (por usuario):**
- Switch master: Â¿Recibir notificaciones?
- Sliders por tipo (dÃ­as antes, 0-10):
  - Plazo total del caso
  - Informe final
  - Solicitud de informaciÃ³n
  - Descargo de denunciados
- Switch individual por tipo

**Ver detalle:** `Plan de Desarrollo.md` â†’ Sprint 17.

---

#### #37 â€” Denunciante anÃ³nimo sin datos de contacto âœ…
**DecisiÃ³n (Julio 2026):** Una persona anÃ³nima puede NO tener email ni telÃ©fono. 
Ejemplo real: dejar una carta con pruebas fÃ­sicas en la oficina de la UTLCC sin identificarse digitalmente.

**ImplementaciÃ³n:**
- En modo **anÃ³nimo**: email y telÃ©fono son **completamente opcionales** (ninguno es obligatorio, ni siquiera "al menos uno de contacto")
- En modo **revelado / no anÃ³nimo**: `nombres` sigue siendo obligatorio; `CI`, `email`, `telÃ©fono` son opcionales
- La barra de progreso del formulario NO cuenta email/telÃ©fono como campos obligatorios en ningÃºn escenario
- El texto de ayuda indica: "Si no proporciona contacto, podrÃ¡ consultar el caso presencialmente en la UTLCC con el cÃ³digo de seguimiento"
**DecisiÃ³n:** Se detectÃ³ un bug en `SolicitudController@ampliar`: el frontend de `ModalAmpliarSolicitud.tsx` limita la ampliaciÃ³n a **max:5 dÃ­as** (correcto segÃºn Art. 25), pero el backend tiene `max:45` (inconsistencia heredada). Se corrige bajando a `max:5` para coincidir con el frontend y con `DescargoController@ampliar` que ya tiene `max:5`.

**Nota:** Esto NO afecta la ampliaciÃ³n del plazo total del caso (Sprint 8, `DenunciaController@aprobarAmpliacion`), que correctamente tiene `max:45` (Art. 30, 45+45 corrupciÃ³n).

---

## â¸ï¸ Preguntas Pendientes (5)

### #2 â€” SITPRECO: validaciÃ³n de formato
**Estado:** Mantiene. Se deja como **texto libre** sin hint. Cuando el cliente confirme el formato definitivo, se actualizarÃ¡ el input.

### #4 â€” Estructura del cÃ³digo SITPRECO
**Estado:** Mantiene. Misma que #2. Formato tentativo: 4-5 bloques de 3-4 caracteres separados por guion (ej. `XXX-XXXX-XXX-XXXXX`). Sin validaciÃ³n rÃ­gida.

### #5 â€” Archivar casos: subestado o estado
**Estado:** Mantiene para consulta con cliente. Por ahora se mantiene como subestado de `cerrada` sin afectar la UX pÃºblica.

### #12 â€” C7: Destino del expediente al remitirse al Ministerio
**Estado:** Mantiene. Â¿El caso se marca como "Cerrado por RemisiÃ³n al Ministerio" o permanece abierto en monitoreo?

### #13 â€” C8: Reglas del plazo al reabrir una denuncia
**Estado:** Mantiene. Â¿El temporizador se reanuda o se establece una nueva fecha lÃ­mite manual?

---

## Resumen de estado

| Bloque | Total | âœ… Resueltas | â¸ï¸ Pendientes |
|--------|-------|--------------|----------------|
| A â€” Sprint 5 + 6 | 4 | 1, 3 | 2, 4 |
| C â€” Legales | 8 | 6, 7, 8, 9, 10, 11 | 5, 12, 13 |
| D â€” Sprint 7 + Transv | 15 | 15-29 | â€” |
| E â€” ReuniÃ³n Julio 2026 | 11 | 30-40 | â€” |
| **Total** | **38** | **33** | **5** |

---

## Cambios derivados en el proyecto

### Cambio de nombre
- **"Recepcionista" â†’ "Registrador"** (en toda la documentaciÃ³n)

### De la reuniÃ³n de Julio 2026

#### DÃ­as hÃ¡biles (transversal)
Afecta a TODOS los plazos del sistema. Se implementa un helper `DiasHabiles.php` (Sprint 18) que recibe fecha inicio, cantidad de dÃ­as hÃ¡biles y lista de feriados, y devuelve la fecha de vencimiento calculada. Este helper se integra en todos los puntos de cÃ¡lculo de plazos retroactivamente (Sprint 4, 7, 8).

#### Aligeramiento del sistema
Se quitan 6 inputs de archivo de flujos intermedios (detalle en #31). Solo se suben archivos al Informe Final + Cierre (Sprint 5). Se flexibilizan 24 umbrales mÃ­nimos y se hacen opcionales 8 campos (detalle en #32).

#### Nuevos sprints en el roadmap
- **Sprint 6.5** â€” SimulaciÃ³n Multi-rol (demo)
- **Sprint 20** â€” Archivos Grandes + Conectividad (post-Fase 1)

#### Bug fix
- `SolicitudController@ampliar`: `max:45` â†’ `max:5` (consistente con frontend y descargo)

---

## Roadmap reestructurado (sprints 7-20)

- Sprint 6.5 â€” SimulaciÃ³n Multi-rol (NUEVO)
- Sprint 7 â€” EvaluaciÃ³n TÃ©cnica Previa
- Sprint 8 â€” Ampliaciones MÃºltiples
- Sprint 9 â€” Notificaciones Push + Historial
- Sprint 10 â€” Base de datos real (MySQL) âœ… COMPLETADO
- Sprint 11 â€” Panel AdministraciÃ³n CatÃ¡logos âœ… COMPLETADO
- Sprint 12 â€” Dashboard + KPIs + Reportes PDF/Excel
- Sprint 13 â€” Tablero PÃºblico Cerrados
- Sprint 14 â€” Tiempos entre Fases
- Sprint 16 â€” Roles y permisos (Registrador/Jefe/TÃ©cnico)
- Sprint 17 â€” AuditorÃ­a backend detallada
- Sprint 18 â€” Panel de Usuario (Perfil + Seguridad + Preferencias + Apariencia) (NUEVO)
- Sprint 19 â€” LÃ³gica de mora explÃ­cita +Xd
- Sprint 20 â€” Calendario feriados + DÃ­as hÃ¡biles (helper formal)
- Sprint 21 â€” Cierre Fase 1 / Ajustes finales
- Sprint 22 â€” Archivos Grandes + Conectividad inestable (NUEVO, post-Fase 1)

---

*Ãšltima actualizaciÃ³n: Julio 2026.*

