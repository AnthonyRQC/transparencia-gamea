# D32 — Delimitación del alcance de auditoría y tratamiento de usuarios y delegaciones

## 1. Contexto

El Sprint 17 (fusionado en 21) proyectaba una auditoría transversal mediante el paquete `owen-it/laravel-auditing` abarcando tanto expedientes como los modelos `User` y `Delegacion`. Durante la Fase C, la adopción de bitácora propia (D29) hizo innecesario `owen-it`; el descarte quedó registrado en Deuda B6. Esta arquitectura implementó bitácora append-only propia con proyecciones de doble llave para garantizar la reserva de identidad de la Ley 974 y evitar fuga de datos sensibles. Dicha implementación cubrió denuncias y expedientes, reactivaciones y desactivaciones de catálogos, y publicaciones (crear, editar, publicar, despublicar y eliminar), pero no incluyó la auditoría de operaciones administrativas sobre usuarios ni delegaciones de funciones. Se requería determinar con exactitud si dicha ausencia constituye una deuda de Fase C o un alcance nuevo independiente.

## 2. Opciones (con ventajas y desventajas)

- Opción A: Tratar la ausencia de auditoría en `User` y `Delegacion` como un defecto de Fase C y bloquear el cierre.
  - Ventaja: Insiste en la visión original integral del Sprint 17.
  - Desventaja: Desconoce que la prioridad legal y operativa de la Fase C era el expediente judicial/administrativo de la Ley 974; genera sobrecarga documental y bloquea la entrega de lo ya verificado.
- Opción B: Descartar definitivamente la auditoría sobre usuarios y delegaciones.
  - Ventaja: Cierra el tema sin trabajo futuro.
  - Desventaja: Deja sin respuesta una posible solicitud futura de la Dirección de Sistemas del GAMEA para fiscalizar altas y bajas de cuentas.
- Opción C (Elegida): Dar por cumplida y cerrada la Fase C (D29) sobre el expediente y clasificar la auditoría administrativa (`User` y `Delegacion`) como Alcance Nuevo para Fase D/E.
  - Ventaja: Refleja con honestidad la realidad del código en `e1448f6`, previene sobreafirmaciones en la documentación y establece un límite limpio para una futura fase administrativa sin mezclarla con el expediente legal.
  - Desventaja: Posterga la trazabilidad de cambios de cuenta a una fase posterior.

## 3. Decisión

Se establece formalmente (2026-10-21):
1. **Fase C (ADR D29) está cerrada y completa en su alcance:** Cubre la bitácora append-only de denuncias/expedientes, reactivaciones y desactivaciones de catálogos, publicaciones (`crear-borrador`/`publicar`, `editar`, `despublicar`, `eliminar`), panel técnico `/admin/auditoria`, extractos operativos y técnicos, y constancias individuales de actuaciones.
2. **Auditoría de `User` y `Delegacion` es Alcance Nuevo:** Las operaciones administrativas sobre usuarios (creación, edición, desactivación, reseteo de claves) y sobre delegaciones temporales de funciones (otorgamiento, revocación) se clasifican como un nuevo requerimiento a diseñar y estimar en una fase posterior (Fase D/E), no como defecto de la Fase C.

## 4. Por qué no las otras

Confundir la auditoría del expediente (regulada por la Ley 974) con la auditoría de TI/cuentas introduce acoplamiento indebido. D29 resolvió la reserva de identidad y la protección del denunciante. La auditoría de cuentas es una necesidad puramente administrativa de TI que amerita su propio modelo y retención.

## 5. Consecuencias

- La documentación del sistema no afirmará que `User` o `Delegacion` están auditados en la bitácora actual.
- Si la UTLCC o Sistemas GAMEA solicita la fiscalización de cuentas de usuario, se abordará mediante un requerimiento específico con su propio diseño y migración en Fase D o E.
- El código actual permanece intacto y la Fase C queda documentalmente blindada.

## Lista de aceptación

- [x] Los 5 campos están completos y son verificables.
- [x] Las opciones incluyen ventajas y desventajas.
- [x] La decisión indica fecha y alcance.
- [x] El documento evita datos no confirmados.
- [x] La fila correspondiente existe en `Indice.md`.
