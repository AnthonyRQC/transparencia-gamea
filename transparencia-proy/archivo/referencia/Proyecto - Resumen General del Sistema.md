> ⚠️ **Referencia histórica — diseño original Fase 0.** No es estado actual. Ver AI-CONTEXT.md.
#transparencia
# ðŸ›ï¸ Sistema de GestiÃ³n de Denuncias â€” Unidad de Transparencia y Lucha Contra la CorrupciÃ³n

> **Â¿QuÃ© es este documento?**
> Es el mapa general del proyecto. Describe QUÃ‰ hace el sistema, PARA QUIÃ‰N lo hace, CÃ“MO fluye una denuncia paso a paso, y bajo QUÃ‰ reglas legales opera. Sirve para que cualquier persona (desarrollador, jefe de unidad, auditor, o el propio cliente) entienda el sistema completo en una sola lectura.

---

## 1. VisiÃ³n General

### El Problema
Las Unidades de Transparencia y Lucha Contra la CorrupciÃ³n (UTLCC) de las entidades pÃºblicas de Bolivia reciben denuncias ciudadanas de corrupciÃ³n y negaciÃ³n de informaciÃ³n. Actualmente, el seguimiento de estas denuncias se realiza de forma manual (expedientes fÃ­sicos, hojas de Excel, recordatorios mentales de plazos), lo que genera:

- **Plazos vencidos** â€” La Ley 974 establece plazos estrictos (45 dÃ­as para corrupciÃ³n, 20 para negaciÃ³n de informaciÃ³n) que se incumplen por falta de control automatizado.
- **PÃ©rdida de trazabilidad** â€” No hay un registro centralizado de en quÃ© fase estÃ¡ cada denuncia, quiÃ©n la estÃ¡ procesando, o quÃ© documentos se han recopilado.
- **Falta de transparencia con el denunciante** â€” El ciudadano no tiene forma de saber en quÃ© estado estÃ¡ su denuncia sin acudir presencialmente.
- **Dificultad para generar reportes** â€” EstadÃ­sticas de denuncias por tipo, por periodo, aceptadas vs. rechazadas, se calculan manualmente.

### La SoluciÃ³n
Un **sistema web de gestiÃ³n de denuncias** que digitaliza todo el ciclo de vida de una denuncia, desde su recepciÃ³n hasta el cierre con informe final. El sistema:

1. **Recibe y registra** denuncias con todos los datos y pruebas exigidos por la Ley 974.
2. **Controla plazos automÃ¡ticamente** con alertas visuales y notificaciones cuando un plazo estÃ¡ por vencerse.
3. **Gestiona el flujo completo** a travÃ©s de un tablero tipo Kanban donde cada denuncia avanza por las fases legales.
4. **Permite seguimiento pÃºblico** para que el denunciante consulte el estado de su denuncia con un nÃºmero de ticket.
5. **Genera reportes** de denuncias por tipo, por periodo, tasas de aceptaciÃ³n/rechazo, y cumplimiento de plazos.

### Marco Legal
El sistema estÃ¡ regido por la **Ley 974** de Bolivia, que regula el funcionamiento de las UTLCC. Todos los plazos, requisitos de denuncia, fases del proceso, y tipos de resoluciÃ³n estÃ¡n definidos por esta ley. Los artÃ­culos mÃ¡s relevantes son:

| Concepto                           | ArtÃ­culo(s)       |
| ---------------------------------- | ----------------- |
| PresentaciÃ³n de denuncias          | Art. 20           |
| Requisitos de la denuncia          | Art. 22 (Â§I-IV)   |
| AdmisiÃ³n o rechazo (5 dÃ­as)        | Art. 23           |
| Reserva de identidad               | Art. 24, Art. 29  |
| ObtenciÃ³n de informaciÃ³n (10 dÃ­as) | Art. 25 (Â§I, III) |
| Descargo del denunciado (10 dÃ­as)  | Art. 25 (Â§IV)     |
| Informe Final â†’ MAE                | Art. 26-27        |
| Plazo mÃ¡ximo (45 dÃ­as, ampliable)  | Art. 30           |
| RemisiÃ³n al Ministerio (>Bs 7M)    | Art. 15, Art. 21  |

---
## 2. Tipos de Denuncia

El sistema maneja **3 categorÃ­as** de denuncias, cada una con plazos y procesos distintos:

### Denuncias Principales (proceso formal completo)

| Tipo | Plazo Base | AmpliaciÃ³n MÃ¡xima | Plazo Total Posible |
|------|-----------|-------------------|---------------------|
| **CORRUPCIÃ“N** | 45 dÃ­as hÃ¡biles | +45 dÃ­as | 90 dÃ­as hÃ¡biles |
| **NEGACIÃ“N DE INFORMACIÃ“N** | 20 dÃ­as hÃ¡biles | +10 dÃ­as | 30 dÃ­as hÃ¡biles |

### Denuncias Secundarias (registro opcional, sin flujo formal)

Estas son situaciones **espontÃ¡neas y triviales** que se resuelven socializando, no siguen el proceso legal de las denuncias principales. Su registro en el sistema es **opcional** â€” un formulario simple con descripciÃ³n y archivos adjuntos opcionales. No se ligan a tÃ©cnicos ni siguen plazos.

| Tipo                                 | DescripciÃ³n                                                                                                                      | ResoluciÃ³n                                                                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **AcompaÃ±amiento**                   | Reclamos menores o malentendidos (ej. atenciÃ³n lenta en trÃ¡mites, diferencias de interpretaciÃ³n entre denunciante y funcionario) | Un funcionario acompaÃ±a presencialmente al denunciante a la oficina para llegar a un acuerdo. Se resuelve en el momento.         |
| **IntervenciÃ³n / Medida Correctiva** | PatrÃ³n de quejas recurrentes sobre una misma unidad                                                                              | Se envÃ­a una nota formal a la unidad denunciada como llamada de atenciÃ³n. Formulario simple con descripciÃ³n y documento adjunto. |
01
---

## 3. Roles del Sistema

| Rol | Responsabilidades | Acciones en el sistema |
|-----|-------------------|----------------------|
| **Registrador** | Recibe al denunciante presencialmente, registra la denuncia con datos y pruebas | Crear nueva denuncia, adjuntar documentos, generar comprobante de ticket |
| **Jefe de Unidad** | Supervisa TODAS las denuncias, **admite o rechaza**, asigna tÃ©cnicos, aprueba ampliaciones de plazo, gestiona traspasos y reaperturas, ve la carga de trabajo | Ver tablero completo, admitir/rechazar con justificaciÃ³n, asignar tÃ©cnico, aprobar ampliaciones, traspasar casos entre tÃ©cnicos, reabrir casos rechazados/cerrados y reasignarlos |
| **TÃ©cnico** | Procesa las denuncias que le asignan (puede tener **mÃºltiples simultÃ¡neamente**). Gestiona solicitudes de informaciÃ³n, descargos, y redacta informe final | Ver SUS denuncias en tablero Kanban, solicitar informaciÃ³n, registrar descargos, redactar informe final, cerrar caso |
| **Denunciante** *(usuario externo)* | Persona que presentÃ³ la denuncia | Consultar estado de su denuncia con el nÃºmero de ticket (pÃ¡gina pÃºblica) |

> [!NOTE] El Kanban del tÃ©cnico vs. el del jefe
> - **Jefe de Unidad**: Ve TODAS las denuncias de todos los tÃ©cnicos. Le permite ver quÃ© tÃ©cnicos tienen carga y cuÃ¡les no, para distribuir equitativamente.
> - **TÃ©cnico**: Ve SOLO sus denuncias asignadas. Le permite concentrarse en sus casos y gestionar el flujo paralelo de cada una.

---

## 4. User Stories

### Registrador

> **Como** registrador de la Unidad de Transparencia,
> **quiero** registrar una nueva denuncia indicando uno o mÃºltiples denunciados, los datos del denunciante (si no es anÃ³nima), el tipo de denuncia, la relaciÃ³n de hechos y archivos de prueba,
> **para que** la denuncia quede en el sistema con un nÃºmero de ticket Ãºnico y soporte el control posterior de descargos individuales por denunciado.

> **Como** registrador,
> **quiero** poder registrar denuncias anÃ³nimas (sin datos del denunciante pero con relaciÃ³n de hechos y periodo),
> **para que** se cumpla lo establecido en el Art. 22 Â§IV de la Ley 974.

> **Como** registrador,
> **quiero** generar un comprobante con el nÃºmero de ticket para entregarlo al denunciante,
> **para que** pueda dar seguimiento a su caso.

### Jefe de Unidad

> **Como** jefe de unidad,
> **quiero** ver un tablero Kanban con TODAS las denuncias de todos los tÃ©cnicos, organizadas por fase,
> **para que** pueda supervisar el estado general y la carga de trabajo de cada tÃ©cnico.

> **Como** jefe de unidad,
> **quiero** admitir o rechazar una denuncia reciÃ©n registrada, con justificaciÃ³n segÃºn ley,
> **para que** se cumpla el plazo de 5 dÃ­as del Art. 23 y quede registro de la decisiÃ³n.

> **Como** jefe de unidad,
> **quiero** asignar una denuncia admitida a un tÃ©cnico especÃ­fico, viendo cuÃ¡ntas denuncias tiene cada uno,
> **para que** la carga de trabajo se distribuya equitativamente.

> **Como** jefe de unidad,
> **quiero** aprobar o rechazar solicitudes de ampliaciÃ³n de plazo (prÃ³rroga) que realicen los tÃ©cnicos o las unidades externas,
> **para que** las ampliaciones queden registradas con justificaciÃ³n y nuevas fechas lÃ­mite.

> **Como** jefe de unidad,
> **quiero** traspasar un caso de un tÃ©cnico a otro cuando sea necesario,
> **para que** no se pierda continuidad si un tÃ©cnico no estÃ¡ disponible.

> **Como** jefe de unidad,
> **quiero** poder reabrir una denuncia que haya sido previamente rechazada o cerrada y reasignarla a otro tÃ©cnico,
> **para que** se pueda dar continuidad o iniciar una nueva investigaciÃ³n sobre los hechos.

> **Como** jefe de unidad,
> **quiero** recibir alertas cuando una denuncia estÃ© prÃ³xima a vencer su plazo,
> **para que** pueda tomar acciÃ³n antes de incumplir la ley.

### TÃ©cnico

> **Como** tÃ©cnico,
> **quiero** ver un tablero Kanban con Ãºnicamente las denuncias que me han sido asignadas,
> **para que** pueda gestionar mis mÃºltiples casos simultÃ¡neamente de forma visual.

> **Como** tÃ©cnico,
> **quiero** crear una o varias solicitudes de informaciÃ³n a distintas unidades externas (cada una con su propio plazo y descripciÃ³n),
> **para que** pueda recopilar evidencia de mÃºltiples fuentes en paralelo y el sistema me recuerde cuÃ¡ndo esperar cada respuesta.

> **Como** tÃ©cnico,
> **quiero** registrar el descargo de manera individual e independiente para cada uno de los mÃºltiples denunciados (registrando manualmente los datos del aviso, fecha lÃ­mite de 10 dÃ­as hÃ¡biles y adjuntando respaldos del descargo recibido),
> **para que** cada denunciado cuente con su propio control de plazos y defensa sin interferir con los demÃ¡s.

> **Como** tÃ©cnico,
> **quiero** poder saltar la solicitud de informaciÃ³n o el descargo si no aplican a mi caso, registrando una justificaciÃ³n del por quÃ©,
> **para que** el sistema no me bloquee pero quede evidencia de mi decisiÃ³n.

> **Como** tÃ©cnico,
> **quiero** redactar el informe final clasificando la responsabilidad (Penal, Civil, Administrativa, Sin Indicios, Medida Correctiva, Archivado), indicando el nÃºmero de fojas y adjuntando documentaciÃ³n,
> **para que** se genere el documento formal dirigido a la MÃ¡xima Autoridad (MAE).

> **Como** tÃ©cnico,
> **quiero** cerrar un caso registrando la conclusiÃ³n con el cÃ³digo SITPRECO, los detalles de cierre y registrando manualmente la notificaciÃ³n del cierre enviada al denunciante (medio, fecha y archivos de respaldo),
> **para que** la denuncia quede formalmente finalizada en el sistema con constancia de comunicaciÃ³n.

> **Como** tÃ©cnico o registrador,
> **quiero** vincular una denuncia con otra existente mencionando su ID o cÃ³digo de denuncia,
> **para que** queden referenciados los antecedentes relacionados.

### Denunciante (Usuario Externo)

> **Como** ciudadano que presentÃ³ una denuncia,
> **quiero** ingresar mi nÃºmero de ticket en una pÃ¡gina pÃºblica y ver la fase actual y las fechas estimadas no sensibles del avance de mi caso (por ejemplo, fecha estimada de remisiÃ³n de informaciÃ³n por una unidad externa),
> **para que** pueda dar seguimiento transparente al avance de mi caso sin vulnerar la confidencialidad interna del proceso.

---

## 5. Flujo del Sistema â€” Ciclo de Vida de una Denuncia

> [!IMPORTANT] Flujo Paralelo, NO Secuencial
> A diferencia de un flujo lineal paso-a-paso, las fases de **Solicitud de InformaciÃ³n** y **Descargo del Denunciado** ocurren **en paralelo** dentro del plazo total. El tÃ©cnico puede crear mÃºltiples solicitudes a diferentes unidades, cada una con su propio plazo, y simultÃ¡neamente notificar al denunciado para su descargo. Todo debe resolverse dentro de los 45 dÃ­as (corrupciÃ³n) o 20 dÃ­as (negaciÃ³n de informaciÃ³n).

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚          FLUJO DE UNA DENUNCIA (CorrupciÃ³n / NegaciÃ³n de InformaciÃ³n)            â”‚
â”‚                                                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚  â”‚RECEPCIÃ“N â”‚â”€â”€â”€â–¶â”‚ ADMISIÃ“N / RECHAZO   â”‚â”€â”€â”€â–¶â”‚ ASIGNACIÃ“N           â”‚              â”‚
â”‚  â”‚          â”‚    â”‚    (5 dÃ­as)           â”‚    â”‚                      â”‚              â”‚
â”‚  â”‚Recepcion.â”‚    â”‚                      â”‚    â”‚ Jefe asigna a un     â”‚              â”‚
â”‚  â”‚registra  â”‚    â”‚ Jefe de Unidad       â”‚    â”‚ tÃ©cnico disponible   â”‚              â”‚
â”‚  â”‚la denunc.â”‚    â”‚ decide con justific. â”‚    â”‚                      â”‚              â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚                      â”‚    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
â”‚                  â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”  â”‚               â”‚                          â”‚
â”‚                  â”‚ â”‚ADMITEâ”‚  â”‚RECHAZAâ”‚  â”‚               â–¼                          â”‚
â”‚                  â”‚ â””â”€â”€â”¬â”€â”€â”€â”˜  â””â”€â”€â”¬â”€â”€â”€â”€â”˜  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚                  â””â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  INVESTIGACIÃ“N (en paralelo)       â”‚  â”‚
â”‚                       â”‚         â”‚           â”‚                                    â”‚  â”‚
â”‚                       â”‚         â–¼           â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚  â”‚
â”‚                       â”‚    [FIN: Rechazo    â”‚  â”‚ Solicitudes de InformaciÃ³n  â”‚   â”‚  â”‚
â”‚                       â”‚     justificado.    â”‚  â”‚ (0, 1, o varias en paralelo)â”‚   â”‚  â”‚
â”‚                       â”‚     Puede volver    â”‚  â”‚                             â”‚   â”‚  â”‚
â”‚                       â”‚     a presentar]    â”‚  â”‚ â€¢ Sol. a Unidad A (10 dÃ­as) â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â”‚ â€¢ Sol. a Unidad B (7 dÃ­as)  â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â”‚ â€¢ Sol. a Unidad C (5 dÃ­as)  â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â”‚ Cada una con su plazo,      â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â”‚ descripciÃ³n y recordatorio  â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚  â”‚
â”‚                       â”‚                     â”‚                                    â”‚  â”‚
â”‚                       â”‚                     â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚  â”‚
â”‚                       â”‚                     â”‚  â”‚ Descargo del Denunciado     â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â”‚ (10 dÃ­as + 5 ampliaciÃ³n)    â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â”‚ Puede ocurrir en paralelo   â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â”‚ con las solicitudes         â”‚   â”‚  â”‚
â”‚                       â”‚                     â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚  â”‚
â”‚                       â”‚                     â”‚                                    â”‚  â”‚
â”‚                       â”‚                     â”‚  âš ï¸ Cualquier fase puede SALTARSE  â”‚  â”‚
â”‚                       â”‚                     â”‚  con justificaciÃ³n + archivo opt.  â”‚  â”‚
â”‚                       â”‚                     â”‚                                    â”‚  â”‚
â”‚                       â”‚                     â”‚  ðŸ“Œ Pueden surgir NUEVAS           â”‚  â”‚
â”‚                       â”‚                     â”‚  solicitudes de informaciÃ³n en     â”‚  â”‚
â”‚                       â”‚                     â”‚  cualquier momento de esta fase    â”‚  â”‚
â”‚                       â”‚                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                       â”‚                                    â”‚                        â”‚
â”‚                       â”‚                                    â–¼                        â”‚
â”‚                       â”‚                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                â”‚
â”‚                       â”‚                     â”‚ INFORME FINAL        â”‚                â”‚
â”‚                       â”‚                     â”‚ ClasificaciÃ³n:       â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ Penal              â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ Civil              â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ Administrativo     â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ Sin Indicios       â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ Med. Correctiva    â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ Archivado          â”‚                â”‚
â”‚                       â”‚                     â”‚ + Fojas + Notif.     â”‚                â”‚
â”‚                       â”‚                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                â”‚
â”‚                       â”‚                                â”‚                            â”‚
â”‚                       â”‚                                â–¼                            â”‚
â”‚                       â”‚                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                â”‚
â”‚                       â”‚                     â”‚ CERRADO              â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ SITPRECO           â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ Concluido por      â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ DescripciÃ³n        â”‚                â”‚
â”‚                       â”‚                     â”‚ â€¢ Archivos adj.      â”‚                â”‚
â”‚                       â”‚                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                â”‚
â”‚                                                                                     â”‚
â”‚  â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PLAZO TOTAL: 45 dÃ­as (corrupciÃ³n) / 20 dÃ­as (neg. info) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º    â”‚
â”‚                    Ampliable con prÃ³rroga aprobada por Jefe de Unidad                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### DescripciÃ³n de cada fase

#### 1. RECEPCIÃ“N
- **QuiÃ©n**: Registrador
- **QuÃ© sucede**: El denunciante se presenta presencialmente en la UTLCC. El registrador registra la denuncia en el sistema con:
  - Datos del denunciante (o marca como anÃ³nima)
  - Datos de Ã©l o los denunciados (soporta **mÃºltiples denunciados** por caso)
  - Tipo de denuncia (CorrupciÃ³n / NegaciÃ³n de InformaciÃ³n)
  - RelaciÃ³n de los hechos
  - Periodo aproximado del hecho
  - Archivos de prueba adjuntos
  - CÃ³digo o ID de denuncias enlazadas/vinculadas (si existe antecedente)
- **Resultado**: Se genera un **nÃºmero de ticket** (ej. `DEN-2026-001`) que se entrega al denunciante para seguimiento.
- **Dato legal**: El denunciante puede solicitar la **reserva de su identidad** (Art. 24).
- **El plazo total empieza a correr desde este momento.**

#### 2. ADMISIÃ“N / RECHAZO
- **QuiÃ©n**: **Jefe de Unidad**
- **Plazo**: **5 dÃ­as hÃ¡biles** desde la recepciÃ³n (Art. 23)
- **QuÃ© sucede**: El Jefe de Unidad evalÃºa si la denuncia cumple con los requisitos del Art. 22. Decide:
  - **Admitir** â†’ Registra la admisiÃ³n con justificaciÃ³n segÃºn ley.
  - **Rechazar** â†’ Registra la justificaciÃ³n legal del rechazo. Las denuncias rechazadas se guardan en el sistema. El Jefe de Unidad puede reabrir una denuncia rechazada y reasignarla. El denunciante tambiÃ©n puede volver a presentarla subsanando las omisiones (Art. 22 Â§III).
- **AcciÃ³n en el sistema**: El funcionario notifica manualmente al denunciante y registra en el sistema los detalles del aviso (fecha, medio manual utilizado y descripciÃ³n) con la opciÃ³n de subir una captura de pantalla (ej. de WhatsApp) o documento PDF como respaldo.

#### 3. ASIGNACIÃ“N
- **QuiÃ©n**: **Jefe de Unidad**
- **QuÃ© sucede**: Una vez admitida, el Jefe asigna la denuncia a un tÃ©cnico disponible. El sistema muestra cuÃ¡ntas denuncias activas tiene cada tÃ©cnico para facilitar la distribuciÃ³n equitativa.
- **Resultado**: El tÃ©cnico recibe la denuncia en su tablero Kanban y es ahora responsable de su seguimiento.

#### 4. INVESTIGACIÃ“N (Solicitudes de InformaciÃ³n + Descargo â€” EN PARALELO)
- **QuiÃ©n**: TÃ©cnico
- **Plazo**: Todo debe ocurrir dentro del plazo total (45 o 20 dÃ­as desde la recepciÃ³n)
- **QuÃ© sucede**: El tÃ©cnico gestiona la recopilaciÃ³n de evidencia. Estas actividades ocurren **en paralelo**, no en secuencia:

##### Solicitudes de InformaciÃ³n
  - El tÃ©cnico puede crear **0, 1 o varias solicitudes** a diferentes unidades externas.
  - **Cada solicitud** se registra con: unidad destino, descripciÃ³n de lo solicitado, y plazo (fecha lÃ­mite).
  - El sistema envÃ­a un **recordatorio** al tÃ©cnico cuando se acerca la fecha de recepciÃ³n esperada.
  - Si la unidad externa pide mÃ¡s tiempo, se registra una **ampliaciÃ³n** con justificaciÃ³n.
  - **Pueden surgir nuevas solicitudes en cualquier momento** de esta fase (ej. el descargo del denunciado revela algo que requiere corroborar con otra unidad).
  - Cada solicitud tiene su propio estado: pendiente / recibida.

##### Descargo del Denunciado
  - Una denuncia puede involucrar a uno o mÃºltiples presuntos responsables (denunciados).
  - El descargo se gestiona de forma **individual e independiente** para cada denunciado, con su propio plazo de **10 dÃ­as hÃ¡biles** (Art. 25 Â§IV) ampliable por **5 dÃ­as mÃ¡s** con solicitud fundamentada.
  - La notificaciÃ³n al denunciado es **manual** (fuera del sistema). El tÃ©cnico registrarÃ¡ en el sistema: la fecha de notificaciÃ³n, la forma/medio manual utilizado, descripciÃ³n del aviso, fecha lÃ­mite de descargo y opcionalmente adjuntarÃ¡ una prueba del aviso (foto de acuse de recibo, captura de WhatsApp, etc.).
  - Al recibirse el descargo, el tÃ©cnico registrarÃ¡ la respuesta y cargarÃ¡ la documentaciÃ³n adjunta de manera idÃ³nea para el denunciado correspondiente.
  - Puede iniciarse el mismo dÃ­a que las solicitudes de informaciÃ³n, o en dÃ­as diferentes (en paralelo).

##### Saltar fases
  - Si el tÃ©cnico ya tiene suficiente evidencia y no necesita solicitar informaciÃ³n ni descargo, puede **saltar estas actividades**.
  - El sistema le pide una **justificaciÃ³n escrita** de por quÃ© no aplica.
  - Opcionalmente puede adjuntar archivos de respaldo (ej. capturas de WhatsApp donde avisÃ³ al denunciado, documentos que ya tiene).

#### 5. INFORME FINAL
- **QuiÃ©n**: TÃ©cnico
- **Plazo**: Dentro del plazo total del tipo de denuncia (45 o 20 dÃ­as)
- **QuÃ© sucede**: Se redacta el Informe Final dirigido a la **MÃ¡xima Autoridad Ejecutiva (MAE)** de la instituciÃ³n. El informe clasifica la responsabilidad:

| ClasificaciÃ³n | AcciÃ³n resultante |
|---|---|
| **Penal** | Se denuncia ante el Ministerio PÃºblico |
| **Civil** | Se remite a la Unidad de AuditorÃ­a Interna |
| **Administrativo** | Se remite a la MAE para iniciar acciones |
| **Sin Indicios** | No hay elementos que sustenten la denuncia |
| **Medida Correctiva** | Se emite una nota correctiva al denunciado |
| **Archivado** | Se archivan los antecedentes |

- **Datos registrados**: NÃºmero de fojas, documentaciÃ³n adjunta, clasificaciÃ³n.
- **Dato legal**: El informe es **no impugnable** (Art. 27).

#### 6. CERRADO
- **QuiÃ©n**: TÃ©cnico
- **QuÃ© sucede**: Se finaliza formalmente el caso. Se registra:
  - **SITPRECO** (cÃ³digo textual oficial devuelto por el sistema nacional de Bolivia registrado de manera manual)
  - Concluido por (nombre del responsable)
  - DescripciÃ³n/detalles del cierre
  - Archivos adjuntos finales
  - Registro manual de la notificaciÃ³n de cierre enviada al denunciante (medio manual, fecha, descripciÃ³n y archivos de respaldo opcionales)
- **Nota**: Las denuncias cerradas se guardan en el sistema y pueden ser reabiertas y reasignadas Ãºnicamente por el Jefe de Unidad si es necesario.

### Regla Especial: RemisiÃ³n al Ministerio
Si la denuncia involucra:
- DaÃ±o econÃ³mico **â‰¥ Bs 7.000.000**, o
- Involucra a las **MÃ¡ximas Autoridades** de la entidad

â†’ Se remite obligatoriamente al **Ministerio de Justicia y Transparencia Institucional** en un plazo de **2 dÃ­as hÃ¡biles** (Art. 21).

---

## 6. Plazos y Control de Tiempos

Los plazos son el corazÃ³n del sistema. La ley es estricta y el sistema debe garantizar su cumplimiento.

### Tabla de plazos por fase

| Fase | Plazo | AmpliaciÃ³n posible | Aplica a |
|------|-------|-------------------|----------|
| AdmisiÃ³n/Rechazo | 5 dÃ­as hÃ¡biles | No | Todas |
| Solicitud de InformaciÃ³n | 10 dÃ­as hÃ¡biles (unidad externa) | SÃ­, variable | Todas |
| Descargo del Denunciado | 10 dÃ­as hÃ¡biles | +5 dÃ­as con justificaciÃ³n | Todas |
| **Total â€” CorrupciÃ³n** | **45 dÃ­as hÃ¡biles** | **+45 dÃ­as** | CorrupciÃ³n |
| **Total â€” Neg. InformaciÃ³n** | **20 dÃ­as hÃ¡biles** | **+10 dÃ­as** | Neg. InformaciÃ³n |
| RemisiÃ³n al Ministerio | 2 dÃ­as hÃ¡biles | No | Casos >Bs 7M o MAE |

### Sistema de alertas visuales (propuesta)

| Estado | CondiciÃ³n | Color | AcciÃ³n |
|--------|-----------|-------|--------|
| ðŸŸ¢ **En tiempo** | >5 dÃ­as hÃ¡biles restantes | Verde | Ninguna |
| ðŸŸ¡ **PrÃ³xima a vencer** | â‰¤5 dÃ­as hÃ¡biles restantes | Amarillo | Alerta visual + notificaciÃ³n |
| ðŸ”´ **Vencida** | 0 dÃ­as restantes | Rojo | Alerta urgente + notificaciÃ³n al jefe |

---

## 7. Funcionalidades del Sistema

### Funcionalidades Principales
- [ ] Registro de denuncias (con/sin anonimato, soporte para **mÃºltiples denunciados**, y opciÃ³n de vincular cÃ³digo/ID de denuncias previas)
- [ ] Tablero Kanban con fases del proceso
- [ ] Control automÃ¡tico de plazos legales con alertas (calculando Ãºnicamente dÃ­as hÃ¡biles laborables de Bolivia)
- [ ] AsignaciÃ³n de denuncias a tÃ©cnicos
- [ ] Registro de cada fase (admisiÃ³n, solicitud de info, descargos individuales por denunciado, informe)
- [ ] Registro manual de notificaciones fÃ­sicas o electrÃ³nicas en cada hito (fecha, medio, descripciÃ³n y archivo adjunto de respaldo)
- [ ] Ampliaciones de plazo con justificaciÃ³n
- [ ] Cierre formal del caso con cÃ³digo textual de SITPRECO
- [ ] Seguimiento pÃºblico por nÃºmero de ticket (mostrando fase y fechas estimadas no sensibles)
- [ ] Traspaso de casos entre tÃ©cnicos (gestionado por el Jefe de Unidad)
- [ ] Reapertura y reasignaciÃ³n de denuncias rechazadas o cerradas (gestionado por el Jefe de Unidad)

### Reportes
- [ ] Denuncias por mes
- [ ] Detalle de denuncias por tipo
- [ ] Denuncias aceptadas vs. rechazadas por periodo
- [ ] Cumplimiento de plazos

### Funcionalidades Secundarias
- [ ] Notificaciones en tiempo real internas (asignaciÃ³n, alerta de plazos para tÃ©cnicos y jefe)
- [ ] Adjuntar y descargar archivos de prueba
- [ ] Roles y control de acceso (Registrador, Jefe de Unidad, TÃ©cnico)

---

## 8. Stack TecnolÃ³gico

| Capa | TecnologÃ­a | Nota |
|------|-----------|------|
| Backend | Laravel 13 | *HistÃ³rico 11 hasta Sprint 11, migrado a 13 el 01-sep-2026 (pre-laravel13:01bcc42 â†’ laravel-13:b91e404)* |
| Bridge Frontend-Backend | Inertia.js |
| Frontend | React 18 + TypeScript |
| Estilos | Tailwind CSS v3 + shadcn/ui |
| AutenticaciÃ³n | Laravel Breeze |
| Base de Datos | MySQL (Postergada en maqueta, con mocks en controladores) |
| Entorno Local | Laragon |

---

## 9. Preguntas Abiertas â€” Necesito AclaraciÃ³n

> [!IMPORTANT] Estas preguntas son puntos donde la informaciÃ³n puede interpretarse de varias formas. Necesito tu respuesta para evitar construir algo incorrecto.

### ~~P1: Â¿Las fases son siempre secuenciales?~~ âœ… RESUELTA
**Respuesta**: No. Solicitud de informaciÃ³n y descargo ocurren **en paralelo**. El tÃ©cnico puede crear mÃºltiples solicitudes a distintas unidades, cada una con su propio plazo. TambiÃ©n puede iniciar el descargo del denunciado simultÃ¡neamente. Pueden surgir nuevas solicitudes de informaciÃ³n en cualquier momento (ej. despuÃ©s de recibir el descargo). Todo debe ocurrir dentro del plazo total de 45 dÃ­as.

Se pueden **saltar** fases (ej. no solicitar informaciÃ³n si ya tiene suficiente evidencia), pero el sistema pide una justificaciÃ³n escrita y opcionalmente archivos de respaldo.

**NUEVO â€” EvaluaciÃ³n TÃ©cnica Previa (Sprint 7):** Adicionalmente, el Jefe de Unidad puede delegar la evaluaciÃ³n de la denuncia a un tÃ©cnico antes de admitirla o rechazarla. El tÃ©cnico evalÃºa y devuelve la denuncia con su evaluaciÃ³n resumida. El plazo de 5 dÃ­as (Art. 23) se cuenta desde la recepciÃ³n, sin pausa durante la evaluaciÃ³n.
**Respuesta**: Son situaciones **espontÃ¡neas y triviales** que no siguen el flujo formal de la ley. Se resuelven socializando (presencialmente). Si se registran, es un formulario simple con descripciÃ³n y archivos opcionales. No se ligan a usuarios, no tienen plazos formales. PodrÃ­an incluso no registrarse en el sistema.

### ~~P3: Â¿QuiÃ©n admite/rechaza la denuncia?~~ âœ… RESUELTA
**Respuesta**: El **Jefe de Unidad** admite o rechaza (con justificaciÃ³n segÃºn ley). Si admite, entonces asigna la denuncia a un tÃ©cnico. El tÃ©cnico ya recibe la denuncia admitida y sigue el protocolo de investigaciÃ³n y cierre.

### ~~P4: Â¿Un tÃ©cnico puede procesar mÃºltiples denuncias?~~ âœ… RESUELTA
**Respuesta**: **SÃ­**, un tÃ©cnico puede tener mÃºltiples denuncias asignadas simultÃ¡neamente. El Kanban es precisamente para que visualice sus casos. El Jefe de Unidad monitorea la carga de todos los tÃ©cnicos para distribuir equitativamente.

---

### ~~P5: Â¿QuÃ© informaciÃ³n ve el denunciante en el seguimiento pÃºblico?~~ âœ… RESUELTA
**Respuesta**: El denunciante ve la informaciÃ³n de carÃ¡cter menos sensible, enfocada en la fase actual y las fechas estimadas de los hitos del caso. Por ejemplo: se muestra que "el caso se encuentra en la fase de solicitud de datos a determinada unidad y que se estima la remisiÃ³n de dichos datos para tal fecha". Esto protege la confidencialidad de la informaciÃ³n sensible interna pero otorga visibilidad sobre el avance y los plazos esperados del proceso.

### ~~P6: Â¿Las denuncias rechazadas se guardan en el sistema?~~ âœ… RESUELTA
**Respuesta**: SÃ­, las denuncias rechazadas se guardan en el sistema para control histÃ³rico y trazabilidad. 
- **Reapertura de denuncias**: Si una denuncia es rechazada o cerrada, esta puede ser reabierta Ãºnicamente por el Jefe de Unidad, quien ademÃ¡s tiene la facultad de reasignarla a otro tÃ©cnico (funciona de forma similar a una ediciÃ³n/reasignaciÃ³n del caso). **No hay lÃ­mite** de reaperturas (decisiÃ³n #28) â€” se manejan manualmente.
- **Traspaso de casos**: El Jefe de Unidad puede realizar el traspaso de casos entre tÃ©cnicos en cualquier momento (por ejemplo, en caso de vacaciones, licencias o ausencias imprevistas del tÃ©cnico asignado originalmente) para asegurar la continuidad y el avance del caso. El tÃ©cnico receptor tiene **acceso completo** a todo el historial (decisiÃ³n #9 â€” traspaso no oculta nada).
- **Denuncias enlazadas/vinculadas**: Si una nueva denuncia se encuentra vinculada a otra ya existente, no se realiza una integraciÃ³n de registros compleja; Ãºnicamente se menciona el ID o cÃ³digo de la denuncia relacionada en el registro de la nueva denuncia como referencia cruzada.

### ~~P7: SITPRECO â€” Â¿QuÃ© es exactamente?~~ âœ… RESUELTA
**Respuesta**: SITPRECO (Sistema de InformaciÃ³n de Transparencia, PrevenciÃ³n y Lucha contra la CorrupciÃ³n) es el sistema nacional oficial de Bolivia donde se registran formalmente las denuncias de este tipo. El sistema local desarrollado funcionarÃ¡ en paralelo con SITPRECO. No se requiere una integraciÃ³n tÃ©cnica vÃ­a APIs o servicios web complejos; lo que interesa para el sistema local es registrar el cÃ³digo de control oficial devuelto por el SITPRECO al registrar la denuncia en el portal nacional.

**DecisiÃ³n #1 (Junio 2026):** El nÃºmero SITPRECO se obtiene cuando la denuncia se **acepta o rechaza**. Es **obligatorio al admitir** y **opcional al rechazar**. Se almacena en el sistema al momento de la admisiÃ³n (no al cierre), y se hereda al Informe Final.

---

## 10. Recomendaciones del Proceso y Funcionales

> [!TIP] Sugerencias sobre la lÃ³gica de negocio y flujos del sistema

### ~~R2: Denuncias con mÃºltiples denunciados~~ âœ… INCORPORADA
**ResoluciÃ³n**: El sistema soporta mÃºltiples denunciados (presuntos responsables) por caso, gestionando de manera individual e independiente el descargo, los plazos de 10 dÃ­as hÃ¡biles y las prÃ³rrogas particulares correspondientes a cada uno.

### ~~R3: Fase de "AsignaciÃ³n" separada~~ âœ… INCORPORADA
**ResoluciÃ³n**: Se formaliza la fase de AsignaciÃ³n en el flujo. Ahora es: RecepciÃ³n â†’ AdmisiÃ³n/Rechazo (Jefe) â†’ AsignaciÃ³n (Jefe asigna tÃ©cnico) â†’ InvestigaciÃ³n â†’ Informe â†’ Cerrado.

### ~~R4: Notificaciones manuales vs. automÃ¡ticas~~ âœ… INCORPORADA
**ResoluciÃ³n**: Las notificaciones no serÃ¡n automÃ¡ticas por correo o SMS. El funcionario realiza las notificaciones externamente de manera manual y registra en el sistema los detalles del aviso (fecha, medio fÃ­sico/electrÃ³nico utilizado, descripciÃ³n) y puede subir archivos de respaldo (PDF de acuse de recibo o capturas de WhatsApp).

### ~~R5: Considerar un mÃ³dulo de denuncias en lÃ­nea (futuro)~~ âŒ DESCARTADA
**ResoluciÃ³n**: Descartada debido a que no forma parte del alcance inicial solicitado por el cliente ni de los requerimientos actuales del sistema.

### ~~R6: GestiÃ³n de prÃ³rrogas independientes para solicitudes de informaciÃ³n y descargos~~ âœ… ACEPTADA
**ResoluciÃ³n**: El sistema permitirÃ¡ administrar de forma independiente las prÃ³rrogas para cada solicitud de informaciÃ³n o descargo de denunciado. Para cada prÃ³rroga, se registrarÃ¡ una descripciÃ³n justificativa y se habilitarÃ¡ la carga de un archivo de respaldo (como la carta/nota escaneada de solicitud de prÃ³rroga de la unidad o del denunciado).

---

## 11. Preguntas para el Cliente (Seguimiento del Proyecto)

> [!IMPORTANT]
> Estas son preguntas especÃ­ficas que se deben realizar al cliente final (Unidad de Transparencia) para definir detalles de cara al diseÃ±o y desarrollo final del software.

### â“ C1: InterpretaciÃ³n del plazo de admisiÃ³n/rechazo (5 dÃ­as)
El Art. 23 menciona "cinco (5) dÃ­as para admitirla o rechazarla". Â¿La unidad interpreta este plazo en **dÃ­as hÃ¡biles** (lunes a viernes) o **dÃ­as calendario**? *(Nota: La Ley de Procedimiento Administrativo de Bolivia suele establecer que todos los plazos administrativos se entienden en dÃ­as hÃ¡biles salvo disposiciÃ³n contraria, pero es vital confirmarlo con su asesor legal).*

**Estado:** â¸ï¸ Pendiente. Se resolverÃ¡ cuando se implemente el Sprint 18 (Calendario Feriados + Plazos).

### ~~C2: Comportamiento del sistema ante el vencimiento de plazos~~ âœ… RESUELTA
**DecisiÃ³n:** El sistema **permite el registro posterior** (no bloquea), pero marca **visiblemente el retraso** con texto "+Xd de retraso" o badge "Vencido" en la card. La evidencia real queda grabada aunque llegue tarde.

### ~~C3: Nivel de detalle en el seguimiento pÃºblico del ciudadano~~ âœ… RESUELTA
**DecisiÃ³n:** Mensajes **genÃ©ricos** en la vista pÃºblica (ya implementado en Sprint 6). No se muestra el nombre de la unidad externa especÃ­fica. Se usan frases como *"Se realizaron solicitudes de informaciÃ³n a unidades externas"* en lugar de especificar cuÃ¡l.

### ~~C4: Traspaso de casos e historial de comentarios~~ âœ… RESUELTA
**DecisiÃ³n:** El TÃ©cnico B tiene **acceso completo** a todas las anotaciones, bitÃ¡cora y observaciones escritas por el TÃ©cnico A. **Nada es privado.** Los traspasos se muestran en la secciÃ³n correspondiente con sus acciones, tal como se hace actualmente.

### ~~C5: Reserva de Identidad y niveles de visibilidad (NUEVA)~~ âœ… RESUELTA
**DecisiÃ³n:** Si la identidad es reservada, sigue siendo **visible para todos** los que tengan acceso al caso (Jefe y tÃ©cnicos asignados). El control se logra con la asignaciÃ³n: los tÃ©cnicos solo ven los casos que les fueron asignados, lo que ya cubre la privacidad requerida.

### ~~C6: Modo de aprobaciÃ³n de ampliaciones generales (NUEVA)~~ âœ… RESUELTA
**DecisiÃ³n:** El Jefe de Unidad puede aprobar **mÃºltiples ampliaciones parciales** (no solo una prÃ³rroga directa por el mÃ¡ximo legal). Cada ampliaciÃ³n se registra con su fecha de aprobaciÃ³n, justificaciÃ³n y dÃ­as concedidos. Se implementarÃ¡ en Sprint 8.

### â“ C7: Destino del expediente al remitirse al Ministerio (NUEVA)
Cuando un caso cumple las condiciones de remisiÃ³n obligatoria al Ministerio de Justicia (daÃ±o econÃ³mico >= Bs 7.000.000 o involucra a la MAE) y se remite dentro de los 2 dÃ­as hÃ¡biles: Â¿el caso en nuestro sistema local se marca como **"Cerrado por RemisiÃ³n al Ministerio"** (dando por terminado el proceso local)? Â¿O permanece abierto en un estado especial de monitoreo?

### â“ C8: Reglas del plazo al reabrir una denuncia (NUEVA)
Si el Jefe de Unidad decide reabrir una denuncia que ya estaba archivada o rechazada: Â¿cÃ³mo debe comportarse el cÃ¡lculo de plazos de la Ley 974?
- Â¿El temporizador se **reanuda** desde el dÃ­a en que se archivÃ³/rechazÃ³?
- Â¿O se se debe poder establecer una **nueva fecha lÃ­mite manual** aprobada por el Jefe de Unidad para este segundo anÃ¡lisis?

**Estado:** â¸ï¸ Pendiente de consulta con cliente. Reapertura sin lÃ­mite (#28) ya resuelta.

---

## 12. Consideraciones y Recomendaciones TÃ©cnicas

> [!IMPORTANT]
> Lineamientos para el equipo de desarrollo sobre la arquitectura del software, validaciones y librerÃ­as recomendadas para resolver requerimientos tÃ©cnicos de forma simple y robusta.

### ðŸ› ï¸ T1: Historial / BitÃ¡cora de AuditorÃ­a (Laravel Auditing)
Para implementar el registro de actividad y auditorÃ­a automÃ¡tica sugerido en R1 sin necesidad de programar logs manuales para cada controlador:
- **LibrerÃ­a**: Se recomienda instalar el paquete **`owen-it/laravel-auditing`**.
- **Funcionamiento**: Tras asociar un simple *trait* en los modelos (`Denuncia`, `Solicitud`, `Descargo`), la librerÃ­a registra de forma automÃ¡tica quÃ© usuario modificÃ³ quÃ© campo, el valor anterior, el nuevo valor, la direcciÃ³n IP y la fecha exacta, almacenÃ¡ndolo todo en una tabla `audits` de MySQL.

### ðŸ› ï¸ T2: ValidaciÃ³n de archivos y lÃ­mites de carga
Para proteger el servidor local Laragon y evitar el desbordamiento de espacio en disco o cÃ³digo malicioso:
- **ValidaciÃ³n Laravel**: Usar reglas de validaciÃ³n nativas en los controladores de backend (`FormRequest`):
  ```php
  'archivo' => 'required|file|mimes:pdf,docx,xlsx,png,jpg|max:10240' // MÃ¡ximo 10 MB
  ```
- **Seguridad**: Restringir estrictamente la extensiÃ³n y evitar a toda costa la carga de extensiones potencialmente ejecutables (`.php`, `.js`, `.exe`, etc.).

### ðŸ› ï¸ T3: CÃ¡lculo DinÃ¡mico de DÃ­as HÃ¡biles (Carbon + Base de Datos)
Para cumplir con los plazos en dÃ­as hÃ¡biles de la Ley 974 (omitir sÃ¡bados, domingos y feriados nacionales/traslados dinÃ¡micos del Ministerio de Trabajo) de forma sencilla sin librerÃ­as externas complejas:

1. **Base de Datos**: Crear una tabla `feriados` (`holidays`) con las columnas `fecha` (DATE, unique) y `descripcion` (VARCHAR). El administrador gestionarÃ¡ el calendario de feriados desde un CRUD muy sencillo.
2. **Carbon (Nativo en Laravel)**: La API de Carbon permite verificar dÃ­as hÃ¡biles fÃ¡cilmente con el mÃ©todo `$fecha->isWeekday()` (devuelve `true` de lunes a viernes).
3. **Algoritmo Helper**: Se implementarÃ¡ un pequeÃ±o servicio o helper que calcule los vencimientos sumando los dÃ­as uno a uno y saltÃ¡ndose los fines de semana y feriados:
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
           // Si es dÃ­a de semana y NO es feriado registrado, cuenta como dÃ­a hÃ¡bil
           if ($fecha->isWeekday() && !in_array($fecha->toDateString(), $feriados)) {
               $diasSumados++;
           }
       }
       return $fecha;
   }
   ```
   *Nota: Este algoritmo servirÃ¡ para proyectar fechas de vencimiento de la denuncia general (45 dÃ­as hÃ¡biles), solicitudes a unidades (10 dÃ­as) y descargos (10 dÃ­as) de manera fiel a la realidad boliviana.*

### ðŸ› ï¸ T4: Indicador de Carga de Trabajo y Cuellos de Botella
Para el reporte de carga y cumplimiento por tÃ©cnico:
- **Estrategia**: Realizar una consulta relacional simple de Eloquent que cuente los expedientes asignados agrupados por su fase y estado (verde, amarillo, rojo).
- **GrÃ¡ficos**: En elfrontend (React), se recomienda usar una librerÃ­a ligera como **Recharts** o **Chart.js** para renderizar barras o grÃ¡ficos circulares de carga y cuellos de botella para el Jefe de Unidad de forma limpia y responsiva.

---

## 13. Cambios derivados de la sesiÃ³n con cliente (Junio 2026)

> Resumen ejecutivo de decisiones tomadas tras reuniÃ³n con cliente. El detalle completo estÃ¡ en `Preguntas para el cliente.md`.

### Cambios de alcance
- **Rol "Recepcionista" â†’ "Registrador"** (en toda la documentaciÃ³n).
- **Nuevo flujo de EvaluaciÃ³n TÃ©cnica Previa (Sprint 7):** el Jefe puede delegar la evaluaciÃ³n de una denuncia a un tÃ©cnico antes de admitirla o rechazarla. El plazo de 5 dÃ­as no se pausa.
- **SITPRECO obligatorio al admitir, opcional al rechazar.** Se obtiene en admisiÃ³n, no al cierre.
- **MÃºltiples ampliaciones permitidas** (no solo una prÃ³rroga por el mÃ¡ximo).
- **Reaperturas sin lÃ­mite** (manejo manual).

### Decisiones legales/normativas
- **Permitir registro fuera de plazo** con marca visible de mora (no bloquear).
- **Mensajes genÃ©ricos en seguimiento pÃºblico** (no mostrar nombres de unidades externas).
- **Traspaso: tÃ©cnico B ve todo el historial del tÃ©cnico A** (nada privado).
- **Reserva de identidad:** visible para todos con acceso al caso (control se logra con asignaciÃ³n).

### Roadmap reestructurado
- Sprints 7-19 planificados. Ver `Plan de Desarrollo.md` y `Sprints Pendientes - Contexto.md`.
- **Pendientes con el cliente:** C1 (dÃ­as hÃ¡biles/calendario), C7 (Ministerio), C8 (plazos al reabrir), formato SITPRECO, archivar casos.

