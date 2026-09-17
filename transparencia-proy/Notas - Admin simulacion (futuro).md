# Notas — Admin: simulación / impersonation (futuro)

> **Estado:** idea, **no** está en el roadmap de Fase 1. Consultar a Sistemas GAMEA.
> **Fecha:** 17-sep-2026 (replan D17/D25). **No implementar** en 16 / 18A / 18C / 21
> salvo que Sistemas lo pida por escrito.

## Por qué no ahora

- D11: el admin **no opera casos**.
- Ley 974 Art. 29: identidad reservada / PIN. «Entrar como» el registrador muestra PII.
- Un humano = un CI = una cuenta (18A). No hay logins compartidos.
- Recambio y vacaciones de Sistemas = **otro usuario admin** (18A), no impersonation.

Soporte y demos hoy: **4 cuentas propias** (admin, jefe, investigador, registrador).

## Si Sistemas lo pide después

| Opción | Qué es | Riesgo | Cuándo tendría sentido |
|---|---|---|---|
| **A** | Cuentas demo / de cada persona (lo actual) | Bajo | Fase 1. **Default.** |
| **B** | Preview solo-lectura + banner «viendo como X» | Medio (sigue viendo PII) | Capacitación / tickets de UI |
| **C** | Impersonation con POST: banner, motivo, tiempo, **actor dual** (quién simuló / a nombre de quién) en bitácora y `audits` | Alto (Art. 29, notificaciones del impersonado) | Break-glass, con OK legal |
| **D** | El admin actúa **como admin** (estilo AWS AssumeRole). La bitácora dice ADMIN, no «como María» | Medio (rompe D11 si opera casos) | Corrección excepcional de un expediente |
| **E** | Panel de auditoría / consulta sin entrar a la bandeja (D17) | Bajo | Sprint 21 si Sistemas confirma |

Grandes sistemas: GitHub/Zendesk = C con banner y log de staff; AWS = D (tu principal siempre en CloudTrail). En denuncias, **A + E** es lo sano; C exige actor dual y no es silencioso.

## Relación con el código

- No mezclar con `PermisosEfectivos` ni con 18C (delegación ≠ impersonation).
- Si un día se hace C: columnas `impersonator_id` + `acting_as_id` en bitácora/`audits`;
  banner persistente; nunca reescribir `usuario_id` del caso como si fuera X.
- Sprint 21 (`owen-it`) puede dejar gancho para actor dual sin activar C.
