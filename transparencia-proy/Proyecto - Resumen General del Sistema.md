#transparencia
# 🏛️ Sistema de Gestión de Denuncias — Unidad de Transparencia y Lucha Contra la Corrupción

> **¿Qué es este documento?**
> Es el mapa general del proyecto. Describe QUÉ hace el sistema, PARA QUIÉN lo hace, CÓMO fluye una denuncia paso a paso, y bajo QUÉ reglas legales opera. Sirve para que cualquier persona (desarrollador, jefe de unidad, auditor, o el propio cliente) entienda el sistema completo en una sola lectura.

---

## 1. Visión General

### El Problema
Las Unidades de Transparencia y Lucha Contra la Corrupción (UTLCC) de las entidades públicas de Bolivia reciben denuncias ciudadanas de corrupción y negación de información. Actualmente, el seguimiento de estas denuncias se realiza de forma manual (expedientes físicos, hojas de Excel, recordatorios mentales de plazos), lo que genera:

- **Plazos vencidos** — La Ley 974 establece plazos estrictos (45 días para corrupción, 20 para negación de información) que se incumplen por falta de control automatizado.
- **Pérdida de trazabilidad** — No hay un registro centralizado de en qué fase está cada denuncia, quién la está procesando, o qué documentos se han recopilado.
- **Falta de transparencia con el denunciante** — El ciudadano no tiene forma de saber en qué estado está su denuncia sin acudir presencialmente.
- **Dificultad para generar reportes** — Estadísticas de denuncias por tipo, por periodo, aceptadas vs. rechazadas, se calculan manualmente.

### La Solución
Un **sistema web de gestión de denuncias** que digitaliza todo el ciclo de vida de una denuncia, desde su recepción hasta el cierre con informe final. El sistema:

1. **Recibe y registra** denuncias con todos los datos y pruebas exigidos por la Ley 974.
2. **Controla plazos automáticamente** con alertas visuales y notificaciones cuando un plazo está por vencerse.
3. **Gestiona el flujo completo** a través de un tablero tipo Kanban donde cada denuncia avanza por las fases legales.
4. **Permite seguimiento público** para que el denunciante consulte el estado de su denuncia con un número de ticket.
5. **Genera reportes** de denuncias por tipo, por periodo, tasas de aceptación/rechazo, y cumplimiento de plazos.

### Marco Legal
El sistema está regido por la **Ley 974** de Bolivia, que regula el funcionamiento de las UTLCC. Todos los plazos, requisitos de denuncia, fases del proceso, y tipos de resolución están definidos por esta ley. Los artículos más relevantes son:

| Concepto                           | Artículo(s)       |
| ---------------------------------- | ----------------- |
| Presentación de denuncias          | Art. 20           |
| Requisitos de la denuncia          | Art. 22 (§I-IV)   |
| Admisión o rechazo (5 días)        | Art. 23           |
| Reserva de identidad               | Art. 24, Art. 29  |
| Obtención de información (10 días) | Art. 25 (§I, III) |
| Descargo del denunciado (10 días)  | Art. 25 (§IV)     |
| Informe Final → MAE                | Art. 26-27        |
| Plazo máximo (45 días, ampliable)  | Art. 30           |
| Remisión al Ministerio (>Bs 7M)    | Art. 15, Art. 21  |

---
## 2. Tipos de Denuncia

El sistema maneja **3 categorías** de denuncias, cada una con plazos y procesos distintos:

### Denuncias Principales (proceso formal completo)

| Tipo | Plazo Base | Ampliación Máxima | Plazo Total Posible |
|------|-----------|-------------------|---------------------|
| **CORRUPCIÓN** | 45 días hábiles | +45 días | 90 días hábiles |
| **NEGACIÓN DE INFORMACIÓN** | 20 días hábiles | +10 días | 30 días hábiles |

### Denuncias Secundarias (registro opcional, sin flujo formal)

Estas son situaciones **espontáneas y triviales** que se resuelven socializando, no siguen el proceso legal de las denuncias principales. Su registro en el sistema es **opcional** — un formulario simple con descripción y archivos adjuntos opcionales. No se ligan a técnicos ni siguen plazos.

| Tipo                                 | Descripción                                                                                                                      | Resolución                                                                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Acompañamiento**                   | Reclamos menores o malentendidos (ej. atención lenta en trámites, diferencias de interpretación entre denunciante y funcionario) | Un funcionario acompaña presencialmente al denunciante a la oficina para llegar a un acuerdo. Se resuelve en el momento.         |
| **Intervención / Medida Correctiva** | Patrón de quejas recurrentes sobre una misma unidad                                                                              | Se envía una nota formal a la unidad denunciada como llamada de atención. Formulario simple con descripción y documento adjunto. |
01
---

## 3. Roles del Sistema

| Rol | Responsabilidades | Acciones en el sistema |
|-----|-------------------|----------------------|
| **Recepcionista** | Recibe al denunciante presencialmente, registra la denuncia con datos y pruebas | Crear nueva denuncia, adjuntar documentos, generar comprobante de ticket |
| **Jefe de Unidad** | Supervisa TODAS las denuncias, **admite o rechaza**, asigna técnicos, aprueba ampliaciones de plazo, gestiona traspasos y reaperturas, ve la carga de trabajo | Ver tablero completo, admitir/rechazar con justificación, asignar técnico, aprobar ampliaciones, traspasar casos entre técnicos, reabrir casos rechazados/cerrados y reasignarlos |
| **Técnico** | Procesa las denuncias que le asignan (puede tener **múltiples simultáneamente**). Gestiona solicitudes de información, descargos, y redacta informe final | Ver SUS denuncias en tablero Kanban, solicitar información, registrar descargos, redactar informe final, cerrar caso |
| **Denunciante** *(usuario externo)* | Persona que presentó la denuncia | Consultar estado de su denuncia con el número de ticket (página pública) |

> [!NOTE] El Kanban del técnico vs. el del jefe
> - **Jefe de Unidad**: Ve TODAS las denuncias de todos los técnicos. Le permite ver qué técnicos tienen carga y cuáles no, para distribuir equitativamente.
> - **Técnico**: Ve SOLO sus denuncias asignadas. Le permite concentrarse en sus casos y gestionar el flujo paralelo de cada una.

---

## 4. User Stories

### Recepcionista

> **Como** recepcionista de la Unidad de Transparencia,
> **quiero** registrar una nueva denuncia indicando uno o múltiples denunciados, los datos del denunciante (si no es anónima), el tipo de denuncia, la relación de hechos y archivos de prueba,
> **para que** la denuncia quede en el sistema con un número de ticket único y soporte el control posterior de descargos individuales por denunciado.

> **Como** recepcionista,
> **quiero** poder registrar denuncias anónimas (sin datos del denunciante pero con relación de hechos y periodo),
> **para que** se cumpla lo establecido en el Art. 22 §IV de la Ley 974.

> **Como** recepcionista,
> **quiero** generar un comprobante con el número de ticket para entregarlo al denunciante,
> **para que** pueda dar seguimiento a su caso.

### Jefe de Unidad

> **Como** jefe de unidad,
> **quiero** ver un tablero Kanban con TODAS las denuncias de todos los técnicos, organizadas por fase,
> **para que** pueda supervisar el estado general y la carga de trabajo de cada técnico.

> **Como** jefe de unidad,
> **quiero** admitir o rechazar una denuncia recién registrada, con justificación según ley,
> **para que** se cumpla el plazo de 5 días del Art. 23 y quede registro de la decisión.

> **Como** jefe de unidad,
> **quiero** asignar una denuncia admitida a un técnico específico, viendo cuántas denuncias tiene cada uno,
> **para que** la carga de trabajo se distribuya equitativamente.

> **Como** jefe de unidad,
> **quiero** aprobar o rechazar solicitudes de ampliación de plazo (prórroga) que realicen los técnicos o las unidades externas,
> **para que** las ampliaciones queden registradas con justificación y nuevas fechas límite.

> **Como** jefe de unidad,
> **quiero** traspasar un caso de un técnico a otro cuando sea necesario,
> **para que** no se pierda continuidad si un técnico no está disponible.

> **Como** jefe de unidad,
> **quiero** poder reabrir una denuncia que haya sido previamente rechazada o cerrada y reasignarla a otro técnico,
> **para que** se pueda dar continuidad o iniciar una nueva investigación sobre los hechos.

> **Como** jefe de unidad,
> **quiero** recibir alertas cuando una denuncia esté próxima a vencer su plazo,
> **para que** pueda tomar acción antes de incumplir la ley.

### Técnico

> **Como** técnico,
> **quiero** ver un tablero Kanban con únicamente las denuncias que me han sido asignadas,
> **para que** pueda gestionar mis múltiples casos simultáneamente de forma visual.

> **Como** técnico,
> **quiero** crear una o varias solicitudes de información a distintas unidades externas (cada una con su propio plazo y descripción),
> **para que** pueda recopilar evidencia de múltiples fuentes en paralelo y el sistema me recuerde cuándo esperar cada respuesta.

> **Como** técnico,
> **quiero** registrar el descargo de manera individual e independiente para cada uno de los múltiples denunciados (registrando manualmente los datos del aviso, fecha límite de 10 días hábiles y adjuntando respaldos del descargo recibido),
> **para que** cada denunciado cuente con su propio control de plazos y defensa sin interferir con los demás.

> **Como** técnico,
> **quiero** poder saltar la solicitud de información o el descargo si no aplican a mi caso, registrando una justificación del por qué,
> **para que** el sistema no me bloquee pero quede evidencia de mi decisión.

> **Como** técnico,
> **quiero** redactar el informe final clasificando la responsabilidad (Penal, Civil, Administrativa, Sin Indicios, Medida Correctiva, Archivado), indicando el número de fojas y adjuntando documentación,
> **para que** se genere el documento formal dirigido a la Máxima Autoridad (MAE).

> **Como** técnico,
> **quiero** cerrar un caso registrando la conclusión con el código SITPRECO, los detalles de cierre y registrando manualmente la notificación del cierre enviada al denunciante (medio, fecha y archivos de respaldo),
> **para que** la denuncia quede formalmente finalizada en el sistema con constancia de comunicación.

> **Como** técnico o recepcionista,
> **quiero** vincular una denuncia con otra existente mencionando su ID o código de denuncia,
> **para que** queden referenciados los antecedentes relacionados.

### Denunciante (Usuario Externo)

> **Como** ciudadano que presentó una denuncia,
> **quiero** ingresar mi número de ticket en una página pública y ver la fase actual y las fechas estimadas no sensibles del avance de mi caso (por ejemplo, fecha estimada de remisión de información por una unidad externa),
> **para que** pueda dar seguimiento transparente al avance de mi caso sin vulnerar la confidencialidad interna del proceso.

---

## 5. Flujo del Sistema — Ciclo de Vida de una Denuncia

> [!IMPORTANT] Flujo Paralelo, NO Secuencial
> A diferencia de un flujo lineal paso-a-paso, las fases de **Solicitud de Información** y **Descargo del Denunciado** ocurren **en paralelo** dentro del plazo total. El técnico puede crear múltiples solicitudes a diferentes unidades, cada una con su propio plazo, y simultáneamente notificar al denunciado para su descargo. Todo debe resolverse dentro de los 45 días (corrupción) o 20 días (negación de información).

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│          FLUJO DE UNA DENUNCIA (Corrupción / Negación de Información)            │
│                                                                                   │
│  ┌──────────┐    ┌──────────────────────┐    ┌──────────────────────┐              │
│  │RECEPCIÓN │───▶│ ADMISIÓN / RECHAZO   │───▶│ ASIGNACIÓN           │              │
│  │          │    │    (5 días)           │    │                      │              │
│  │Recepcion.│    │                      │    │ Jefe asigna a un     │              │
│  │registra  │    │ Jefe de Unidad       │    │ técnico disponible   │              │
│  │la denunc.│    │ decide con justific. │    │                      │              │
│  └──────────┘    │                      │    └──────────┬───────────┘              │
│                  │ ┌──────┐  ┌───────┐  │               │                          │
│                  │ │ADMITE│  │RECHAZA│  │               ▼                          │
│                  │ └──┬───┘  └──┬────┘  │  ┌────────────────────────────────────┐  │
│                  └────┼─────────┼────────┘  │  INVESTIGACIÓN (en paralelo)       │  │
│                       │         │           │                                    │  │
│                       │         ▼           │  ┌─────────────────────────────┐   │  │
│                       │    [FIN: Rechazo    │  │ Solicitudes de Información  │   │  │
│                       │     justificado.    │  │ (0, 1, o varias en paralelo)│   │  │
│                       │     Puede volver    │  │                             │   │  │
│                       │     a presentar]    │  │ • Sol. a Unidad A (10 días) │   │  │
│                       │                     │  │ • Sol. a Unidad B (7 días)  │   │  │
│                       │                     │  │ • Sol. a Unidad C (5 días)  │   │  │
│                       │                     │  │ Cada una con su plazo,      │   │  │
│                       │                     │  │ descripción y recordatorio  │   │  │
│                       │                     │  └─────────────────────────────┘   │  │
│                       │                     │                                    │  │
│                       │                     │  ┌─────────────────────────────┐   │  │
│                       │                     │  │ Descargo del Denunciado     │   │  │
│                       │                     │  │ (10 días + 5 ampliación)    │   │  │
│                       │                     │  │ Puede ocurrir en paralelo   │   │  │
│                       │                     │  │ con las solicitudes         │   │  │
│                       │                     │  └─────────────────────────────┘   │  │
│                       │                     │                                    │  │
│                       │                     │  ⚠️ Cualquier fase puede SALTARSE  │  │
│                       │                     │  con justificación + archivo opt.  │  │
│                       │                     │                                    │  │
│                       │                     │  📌 Pueden surgir NUEVAS           │  │
│                       │                     │  solicitudes de información en     │  │
│                       │                     │  cualquier momento de esta fase    │  │
│                       │                     └──────────────┬─────────────────────┘  │
│                       │                                    │                        │
│                       │                                    ▼                        │
│                       │                     ┌──────────────────────┐                │
│                       │                     │ INFORME FINAL        │                │
│                       │                     │ Clasificación:       │                │
│                       │                     │ • Penal              │                │
│                       │                     │ • Civil              │                │
│                       │                     │ • Administrativo     │                │
│                       │                     │ • Sin Indicios       │                │
│                       │                     │ • Med. Correctiva    │                │
│                       │                     │ • Archivado          │                │
│                       │                     │ + Fojas + Notif.     │                │
│                       │                     └──────────┬───────────┘                │
│                       │                                │                            │
│                       │                                ▼                            │
│                       │                     ┌──────────────────────┐                │
│                       │                     │ CERRADO              │                │
│                       │                     │ • SITPRECO           │                │
│                       │                     │ • Concluido por      │                │
│                       │                     │ • Descripción        │                │
│                       │                     │ • Archivos adj.      │                │
│                       │                     └──────────────────────┘                │
│                                                                                     │
│  ◄────────── PLAZO TOTAL: 45 días (corrupción) / 20 días (neg. info) ──────────►    │
│                    Ampliable con prórroga aprobada por Jefe de Unidad                │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### Descripción de cada fase

#### 1. RECEPCIÓN
- **Quién**: Recepcionista
- **Qué sucede**: El denunciante se presenta presencialmente en la UTLCC. El recepcionista registra la denuncia en el sistema con:
  - Datos del denunciante (o marca como anónima)
  - Datos de él o los denunciados (soporta **múltiples denunciados** por caso)
  - Tipo de denuncia (Corrupción / Negación de Información)
  - Relación de los hechos
  - Periodo aproximado del hecho
  - Archivos de prueba adjuntos
  - Código o ID de denuncias enlazadas/vinculadas (si existe antecedente)
- **Resultado**: Se genera un **número de ticket** (ej. `DEN-2026-001`) que se entrega al denunciante para seguimiento.
- **Dato legal**: El denunciante puede solicitar la **reserva de su identidad** (Art. 24).
- **El plazo total empieza a correr desde este momento.**

#### 2. ADMISIÓN / RECHAZO
- **Quién**: **Jefe de Unidad**
- **Plazo**: **5 días hábiles** desde la recepción (Art. 23)
- **Qué sucede**: El Jefe de Unidad evalúa si la denuncia cumple con los requisitos del Art. 22. Decide:
  - **Admitir** → Registra la admisión con justificación según ley.
  - **Rechazar** → Registra la justificación legal del rechazo. Las denuncias rechazadas se guardan en el sistema. El Jefe de Unidad puede reabrir una denuncia rechazada y reasignarla. El denunciante también puede volver a presentarla subsanando las omisiones (Art. 22 §III).
- **Acción en el sistema**: El funcionario notifica manualmente al denunciante y registra en el sistema los detalles del aviso (fecha, medio manual utilizado y descripción) con la opción de subir una captura de pantalla (ej. de WhatsApp) o documento PDF como respaldo.

#### 3. ASIGNACIÓN
- **Quién**: **Jefe de Unidad**
- **Qué sucede**: Una vez admitida, el Jefe asigna la denuncia a un técnico disponible. El sistema muestra cuántas denuncias activas tiene cada técnico para facilitar la distribución equitativa.
- **Resultado**: El técnico recibe la denuncia en su tablero Kanban y es ahora responsable de su seguimiento.

#### 4. INVESTIGACIÓN (Solicitudes de Información + Descargo — EN PARALELO)
- **Quién**: Técnico
- **Plazo**: Todo debe ocurrir dentro del plazo total (45 o 20 días desde la recepción)
- **Qué sucede**: El técnico gestiona la recopilación de evidencia. Estas actividades ocurren **en paralelo**, no en secuencia:

##### Solicitudes de Información
  - El técnico puede crear **0, 1 o varias solicitudes** a diferentes unidades externas.
  - **Cada solicitud** se registra con: unidad destino, descripción de lo solicitado, y plazo (fecha límite).
  - El sistema envía un **recordatorio** al técnico cuando se acerca la fecha de recepción esperada.
  - Si la unidad externa pide más tiempo, se registra una **ampliación** con justificación.
  - **Pueden surgir nuevas solicitudes en cualquier momento** de esta fase (ej. el descargo del denunciado revela algo que requiere corroborar con otra unidad).
  - Cada solicitud tiene su propio estado: pendiente / recibida.

##### Descargo del Denunciado
  - Una denuncia puede involucrar a uno o múltiples presuntos responsables (denunciados).
  - El descargo se gestiona de forma **individual e independiente** para cada denunciado, con su propio plazo de **10 días hábiles** (Art. 25 §IV) ampliable por **5 días más** con solicitud fundamentada.
  - La notificación al denunciado es **manual** (fuera del sistema). El técnico registrará en el sistema: la fecha de notificación, la forma/medio manual utilizado, descripción del aviso, fecha límite de descargo y opcionalmente adjuntará una prueba del aviso (foto de acuse de recibo, captura de WhatsApp, etc.).
  - Al recibirse el descargo, el técnico registrará la respuesta y cargará la documentación adjunta de manera idónea para el denunciado correspondiente.
  - Puede iniciarse el mismo día que las solicitudes de información, o en días diferentes (en paralelo).

##### Saltar fases
  - Si el técnico ya tiene suficiente evidencia y no necesita solicitar información ni descargo, puede **saltar estas actividades**.
  - El sistema le pide una **justificación escrita** de por qué no aplica.
  - Opcionalmente puede adjuntar archivos de respaldo (ej. capturas de WhatsApp donde avisó al denunciado, documentos que ya tiene).

#### 5. INFORME FINAL
- **Quién**: Técnico
- **Plazo**: Dentro del plazo total del tipo de denuncia (45 o 20 días)
- **Qué sucede**: Se redacta el Informe Final dirigido a la **Máxima Autoridad Ejecutiva (MAE)** de la institución. El informe clasifica la responsabilidad:

| Clasificación | Acción resultante |
|---|---|
| **Penal** | Se denuncia ante el Ministerio Público |
| **Civil** | Se remite a la Unidad de Auditoría Interna |
| **Administrativo** | Se remite a la MAE para iniciar acciones |
| **Sin Indicios** | No hay elementos que sustenten la denuncia |
| **Medida Correctiva** | Se emite una nota correctiva al denunciado |
| **Archivado** | Se archivan los antecedentes |

- **Datos registrados**: Número de fojas, documentación adjunta, clasificación.
- **Dato legal**: El informe es **no impugnable** (Art. 27).

#### 6. CERRADO
- **Quién**: Técnico
- **Qué sucede**: Se finaliza formalmente el caso. Se registra:
  - **SITPRECO** (código textual oficial devuelto por el sistema nacional de Bolivia registrado de manera manual)
  - Concluido por (nombre del responsable)
  - Descripción/detalles del cierre
  - Archivos adjuntos finales
  - Registro manual de la notificación de cierre enviada al denunciante (medio manual, fecha, descripción y archivos de respaldo opcionales)
- **Nota**: Las denuncias cerradas se guardan en el sistema y pueden ser reabiertas y reasignadas únicamente por el Jefe de Unidad si es necesario.

### Regla Especial: Remisión al Ministerio
Si la denuncia involucra:
- Daño económico **≥ Bs 7.000.000**, o
- Involucra a las **Máximas Autoridades** de la entidad

→ Se remite obligatoriamente al **Ministerio de Justicia y Transparencia Institucional** en un plazo de **2 días hábiles** (Art. 21).

---

## 6. Plazos y Control de Tiempos

Los plazos son el corazón del sistema. La ley es estricta y el sistema debe garantizar su cumplimiento.

### Tabla de plazos por fase

| Fase | Plazo | Ampliación posible | Aplica a |
|------|-------|-------------------|----------|
| Admisión/Rechazo | 5 días hábiles | No | Todas |
| Solicitud de Información | 10 días hábiles (unidad externa) | Sí, variable | Todas |
| Descargo del Denunciado | 10 días hábiles | +5 días con justificación | Todas |
| **Total — Corrupción** | **45 días hábiles** | **+45 días** | Corrupción |
| **Total — Neg. Información** | **20 días hábiles** | **+10 días** | Neg. Información |
| Remisión al Ministerio | 2 días hábiles | No | Casos >Bs 7M o MAE |

### Sistema de alertas visuales (propuesta)

| Estado | Condición | Color | Acción |
|--------|-----------|-------|--------|
| 🟢 **En tiempo** | >5 días hábiles restantes | Verde | Ninguna |
| 🟡 **Próxima a vencer** | ≤5 días hábiles restantes | Amarillo | Alerta visual + notificación |
| 🔴 **Vencida** | 0 días restantes | Rojo | Alerta urgente + notificación al jefe |

---

## 7. Funcionalidades del Sistema

### Funcionalidades Principales
- [ ] Registro de denuncias (con/sin anonimato, soporte para **múltiples denunciados**, y opción de vincular código/ID de denuncias previas)
- [ ] Tablero Kanban con fases del proceso
- [ ] Control automático de plazos legales con alertas (calculando únicamente días hábiles laborables de Bolivia)
- [ ] Asignación de denuncias a técnicos
- [ ] Registro de cada fase (admisión, solicitud de info, descargos individuales por denunciado, informe)
- [ ] Registro manual de notificaciones físicas o electrónicas en cada hito (fecha, medio, descripción y archivo adjunto de respaldo)
- [ ] Ampliaciones de plazo con justificación
- [ ] Cierre formal del caso con código textual de SITPRECO
- [ ] Seguimiento público por número de ticket (mostrando fase y fechas estimadas no sensibles)
- [ ] Traspaso de casos entre técnicos (gestionado por el Jefe de Unidad)
- [ ] Reapertura y reasignación de denuncias rechazadas o cerradas (gestionado por el Jefe de Unidad)

### Reportes
- [ ] Denuncias por mes
- [ ] Detalle de denuncias por tipo
- [ ] Denuncias aceptadas vs. rechazadas por periodo
- [ ] Cumplimiento de plazos

### Funcionalidades Secundarias
- [ ] Notificaciones en tiempo real internas (asignación, alerta de plazos para técnicos y jefe)
- [ ] Adjuntar y descargar archivos de prueba
- [ ] Roles y control de acceso (Recepcionista, Jefe de Unidad, Técnico)

---

## 8. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Laravel 11 |
| Bridge Frontend-Backend | Inertia.js |
| Frontend | React 18 + TypeScript |
| Estilos | Tailwind CSS v3 + shadcn/ui |
| Autenticación | Laravel Breeze |
| Base de Datos | MySQL (Postergada en maqueta, con mocks en controladores) |
| Entorno Local | Laragon |

---

## 9. Preguntas Abiertas — Necesito Aclaración

> [!IMPORTANT] Estas preguntas son puntos donde la información puede interpretarse de varias formas. Necesito tu respuesta para evitar construir algo incorrecto.

### ~~P1: ¿Las fases son siempre secuenciales?~~ ✅ RESUELTA
**Respuesta**: No. Solicitud de información y descargo ocurren **en paralelo**. El técnico puede crear múltiples solicitudes a distintas unidades, cada una con su propio plazo. También puede iniciar el descargo del denunciado simultáneamente. Pueden surgir nuevas solicitudes de información en cualquier momento (ej. después de recibir el descargo). Todo debe ocurrir dentro del plazo total de 45 días.

Se pueden **saltar** fases (ej. no solicitar información si ya tiene suficiente evidencia), pero el sistema pide una justificación escrita y opcionalmente archivos de respaldo.

### ~~P2: Acompañamiento e Intervención~~ ✅ RESUELTA
**Respuesta**: Son situaciones **espontáneas y triviales** que no siguen el flujo formal de la ley. Se resuelven socializando (presencialmente). Si se registran, es un formulario simple con descripción y archivos opcionales. No se ligan a usuarios, no tienen plazos formales. Podrían incluso no registrarse en el sistema.

### ~~P3: ¿Quién admite/rechaza la denuncia?~~ ✅ RESUELTA
**Respuesta**: El **Jefe de Unidad** admite o rechaza (con justificación según ley). Si admite, entonces asigna la denuncia a un técnico. El técnico ya recibe la denuncia admitida y sigue el protocolo de investigación y cierre.

### ~~P4: ¿Un técnico puede procesar múltiples denuncias?~~ ✅ RESUELTA
**Respuesta**: **Sí**, un técnico puede tener múltiples denuncias asignadas simultáneamente. El Kanban es precisamente para que visualice sus casos. El Jefe de Unidad monitorea la carga de todos los técnicos para distribuir equitativamente.

---

### ~~P5: ¿Qué información ve el denunciante en el seguimiento público?~~ ✅ RESUELTA
**Respuesta**: El denunciante ve la información de carácter menos sensible, enfocada en la fase actual y las fechas estimadas de los hitos del caso. Por ejemplo: se muestra que "el caso se encuentra en la fase de solicitud de datos a determinada unidad y que se estima la remisión de dichos datos para tal fecha". Esto protege la confidencialidad de la información sensible interna pero otorga visibilidad sobre el avance y los plazos esperados del proceso.

### ~~P6: ¿Las denuncias rechazadas se guardan en el sistema?~~ ✅ RESUELTA
**Respuesta**: Sí, las denuncias rechazadas se guardan en el sistema para control histórico y trazabilidad. 
- **Reapertura de denuncias**: Si una denuncia es rechazada o cerrada, esta puede ser reabierta únicamente por el Jefe de Unidad, quien además tiene la facultad de reasignarla a otro técnico (funciona de forma similar a una edición/reasignación del caso).
- **Traspaso de casos**: El Jefe de Unidad puede realizar el traspaso de casos entre técnicos en cualquier momento (por ejemplo, en caso de vacaciones, licencias o ausencias imprevistas del técnico asignado originalmente) para asegurar la continuidad y el avance del caso.
- **Denuncias enlazadas/vinculadas**: Si una nueva denuncia se encuentra vinculada a otra ya existente, no se realiza una integración de registros compleja; únicamente se menciona el ID o código de la denuncia relacionada en el registro de la nueva denuncia como referencia cruzada.

### ~~P7: SITPRECO — ¿Qué es exactamente?~~ ✅ RESUELTA
**Respuesta**: SITPRECO (Sistema de Información de Transparencia, Prevención y Lucha contra la Corrupción) es el sistema nacional oficial de Bolivia donde se registran formalmente las denuncias de este tipo. El sistema local desarrollado funcionará en paralelo con SITPRECO. No se requiere una integración técnica vía APIs o servicios web complejos; lo que interesa para el sistema local es registrar el código de control oficial devuelto por el SITPRECO al registrar la denuncia en el portal nacional, almacenándolo en el formulario de cierre/seguimiento como dato textual de referencia cruzada.

---

## 10. Recomendaciones del Proceso y Funcionales

> [!TIP] Sugerencias sobre la lógica de negocio y flujos del sistema

### ~~R2: Denuncias con múltiples denunciados~~ ✅ INCORPORADA
**Resolución**: El sistema soporta múltiples denunciados (presuntos responsables) por caso, gestionando de manera individual e independiente el descargo, los plazos de 10 días hábiles y las prórrogas particulares correspondientes a cada uno.

### ~~R3: Fase de "Asignación" separada~~ ✅ INCORPORADA
**Resolución**: Se formaliza la fase de Asignación en el flujo. Ahora es: Recepción → Admisión/Rechazo (Jefe) → Asignación (Jefe asigna técnico) → Investigación → Informe → Cerrado.

### ~~R4: Notificaciones manuales vs. automáticas~~ ✅ INCORPORADA
**Resolución**: Las notificaciones no serán automáticas por correo o SMS. El funcionario realiza las notificaciones externamente de manera manual y registra en el sistema los detalles del aviso (fecha, medio físico/electrónico utilizado, descripción) y puede subir archivos de respaldo (PDF de acuse de recibo o capturas de WhatsApp).

### ~~R5: Considerar un módulo de denuncias en línea (futuro)~~ ❌ DESCARTADA
**Resolución**: Descartada debido a que no forma parte del alcance inicial solicitado por el cliente ni de los requerimientos actuales del sistema.

### ~~R6: Gestión de prórrogas independientes para solicitudes de información y descargos~~ ✅ ACEPTADA
**Resolución**: El sistema permitirá administrar de forma independiente las prórrogas para cada solicitud de información o descargo de denunciado. Para cada prórroga, se registrará una descripción justificativa y se habilitará la carga de un archivo de respaldo (como la carta/nota escaneada de solicitud de prórroga de la unidad o del denunciado).

---

## 11. Preguntas para el Cliente (Seguimiento del Proyecto)

> [!IMPORTANT]
> Estas son preguntas específicas que se deben realizar al cliente final (Unidad de Transparencia) para definir detalles de cara al diseño y desarrollo final del software.

### ❓ C1: Interpretación del plazo de admisión/rechazo (5 días)
El Art. 23 menciona "cinco (5) días para admitirla o rechazarla". ¿La unidad interpreta este plazo en **días hábiles** (lunes a viernes) o **días calendario**? *(Nota: La Ley de Procedimiento Administrativo de Bolivia suele establecer que todos los plazos administrativos se entienden en días hábiles salvo disposición contraria, pero es vital confirmarlo con su asesor legal).*

### ❓ C2: Comportamiento del sistema ante el vencimiento de plazos
Cuando un plazo de fase (ej. los 10 días hábiles de descargo o solicitud de información) o el plazo total (45 días hábiles) expira/vence:
- ¿El sistema debe **bloquear** la posibilidad de registrar información tardía (ej. impedir subir el descargo extemporáneo)?
- ¿O el sistema debe **permitir el registro** pero marcar visiblemente el retraso en rojo (indicando cuántos días de mora hubo) para fines de auditoría? *(Sugerencia técnica: Permitir el registro marcando la mora, ya que la evidencia real debe quedar grabada aunque llegue tarde).*

### ❓ C3: Nivel de detalle en el seguimiento público del ciudadano
Para resguardar el secreto de sumario y confidencialidad: al mostrar el avance de solicitudes a unidades externas, ¿es correcto mostrar *"Solicitando información a la Unidad de [Nombre Unidad]"* o se prefiere un mensaje genérico como *"Solicitando información a unidad interna"* sin especificar cuál?

### ❓ C4: Traspaso de casos e historial de comentarios
Cuando el Jefe de Unidad traspasa un caso del Técnico A al Técnico B:
- ¿El Técnico B tiene acceso completo al historial de observaciones, bitácora y anotaciones internas escritas por el Técnico A en ese caso?
- ¿O las anotaciones internas de investigación del Técnico A se mantienen privadas y se inicia una nueva bitácora limpia para el Técnico B, manteniendo solo los documentos oficiales del expediente?

### ❓ C5: Reserva de Identidad y niveles de visibilidad (NUEVA)
El Art. 24 y Art. 29 regulan la reserva de identidad del denunciante. En el sistema local: ¿quién tiene permitido ver el nombre y datos reales del denunciante que solicitó reserva?
- ¿El técnico asignado al caso debe poder verlos para realizar la investigación?
- ¿O los datos reales solo deben ser visibles para el Jefe de Unidad, mostrándose un texto de *"IDENTIDAD RESERVADA"* para el técnico asignado?

### ❓ C6: Modo de aprobación de ampliaciones generales (NUEVA)
El plazo total de la denuncia (45 días para corrupción, 20 para negación de información) se puede prorrogar justificadamente por un periodo igual o menor. ¿El sistema debe permitir que el Jefe de Unidad apruebe **múltiples ampliaciones parciales** (ej. tres ampliaciones sucesivas de 15 días hasta completar los 45)? ¿O se registra legalmente como una **única prórroga directa** por el máximo plazo permitido?

### ❓ C7: Destino del expediente al remitirse al Ministerio (NUEVA)
Cuando un caso cumple las condiciones de remisión obligatoria al Ministerio de Justicia (daño económico >= Bs 7.000.000 o involucra a la MAE) y se remite dentro de los 2 días hábiles: ¿el caso en nuestro sistema local se marca como **"Cerrado por Remisión al Ministerio"** (dando por terminado el proceso local)? ¿O permanece abierto en un estado especial de monitoreo?

### ❓ C8: Reglas del plazo al reabrir una denuncia (NUEVA)
Si el Jefe de Unidad decide reabrir una denuncia que ya estaba archivada o rechazada: ¿cómo debe comportarse el cálculo de plazos de la Ley 974?
- ¿El temporizador se **reanuda** desde el día en que se archivó/rechazó?
- ¿O se se debe poder establecer una **nueva fecha límite manual** aprobada por el Jefe de Unidad para este segundo análisis?

---

## 12. Consideraciones y Recomendaciones Técnicas

> [!IMPORTANT]
> Lineamientos para el equipo de desarrollo sobre la arquitectura del software, validaciones y librerías recomendadas para resolver requerimientos técnicos de forma simple y robusta.

### 🛠️ T1: Historial / Bitácora de Auditoría (Laravel Auditing)
Para implementar el registro de actividad y auditoría automática sugerido en R1 sin necesidad de programar logs manuales para cada controlador:
- **Librería**: Se recomienda instalar el paquete **`owen-it/laravel-auditing`**.
- **Funcionamiento**: Tras asociar un simple *trait* en los modelos (`Denuncia`, `Solicitud`, `Descargo`), la librería registra de forma automática qué usuario modificó qué campo, el valor anterior, el nuevo valor, la dirección IP y la fecha exacta, almacenándolo todo en una tabla `audits` de MySQL.

### 🛠️ T2: Validación de archivos y límites de carga
Para proteger el servidor local Laragon y evitar el desbordamiento de espacio en disco o código malicioso:
- **Validación Laravel**: Usar reglas de validación nativas en los controladores de backend (`FormRequest`):
  ```php
  'archivo' => 'required|file|mimes:pdf,docx,xlsx,png,jpg|max:10240' // Máximo 10 MB
  ```
- **Seguridad**: Restringir estrictamente la extensión y evitar a toda costa la carga de extensiones potencialmente ejecutables (`.php`, `.js`, `.exe`, etc.).

### 🛠️ T3: Cálculo Dinámico de Días Hábiles (Carbon + Base de Datos)
Para cumplir con los plazos en días hábiles de la Ley 974 (omitir sábados, domingos y feriados nacionales/traslados dinámicos del Ministerio de Trabajo) de forma sencilla sin librerías externas complejas:

1. **Base de Datos**: Crear una tabla `feriados` (`holidays`) con las columnas `fecha` (DATE, unique) y `descripcion` (VARCHAR). El administrador gestionará el calendario de feriados desde un CRUD muy sencillo.
2. **Carbon (Nativo en Laravel)**: La API de Carbon permite verificar días hábiles fácilmente con el método `$fecha->isWeekday()` (devuelve `true` de lunes a viernes).
3. **Algoritmo Helper**: Se implementará un pequeño servicio o helper que calcule los vencimientos sumando los días uno a uno y saltándose los fines de semana y feriados:
   ``` php
   use Carbon\Carbon;
   use App\Models\Holiday;

   function sumarDiasHabiles(Carbon $fechaInicio, int $diasASumar): Carbon
   {
       $fecha = $fechaInicio->copy();
       // Obtener feriados registrados en formato string: ['2026-08-06', '2026-12-25', ...]
       $feriados = Holiday::pluck('fecha')->map(fn($f) => $f->toDateString())->toArray();

       $diasSumados = 0;
       while ($diasSumados < $diasASumar) {
           $fecha->addDay();
           // Si es día de semana y NO es feriado registrado, cuenta como día hábil
           if ($fecha->isWeekday() && !in_array($fecha->toDateString(), $feriados)) {
               $diasSumados++;
           }
       }
       return $fecha;
   }
   ```
   *Nota: Este algoritmo servirá para proyectar fechas de vencimiento de la denuncia general (45 días hábiles), solicitudes a unidades (10 días) y descargos (10 días) de manera fiel a la realidad boliviana.*

### 🛠️ T4: Indicador de Carga de Trabajo y Cuellos de Botella
Para el reporte de carga y cumplimiento por técnico:
- **Estrategia**: Realizar una consulta relacional simple de Eloquent que cuente los expedientes asignados agrupados por su fase y estado (verde, amarillo, rojo).
- **Gráficos**: En el frontend (React), se recomienda usar una librería ligera como **Recharts** o **Chart.js** para renderizar barras o gráficos circulares de carga y cuellos de botella para el Jefe de Unidad de forma limpia y responsiva.
