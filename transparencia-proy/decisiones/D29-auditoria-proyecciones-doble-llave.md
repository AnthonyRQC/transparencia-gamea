# D29 — Proyecciones de doble llave para auditoría y trazabilidad del expediente

- **Fecha:** 2026-10-17
- **Estado:** Vigente
- **Alcance:** Módulo de Auditoría, Bitácora, Extractos de Caso y Constancias de Actuaciones

## 1. Contexto

La Unidad de Transparencia y Lucha Contra la Corrupción (UTLCC - GAMEA) requiere auditar de forma inmutable las operaciones del sistema (consultas, descargas, modificaciones de expediente) conforme a la Ley N° 974. Existe una tensión fundamental de confidencialidad: el Administrador de Sistemas (TI) debe supervisar accesos y descargas sin tener acceso al contenido sustantivo (`detalle`) de los expedientes; mientras que la Jefatura debe supervisar qué cambió en el caso sin exponer detalles de red o huellas de navegador (`user_agent`). Asimismo, el personal actuante (investigadores y registradores) requiere certificar sus propias actuaciones sobre un caso sin acceder a las intervenciones privadas de otros operadores.

## 2. Opciones (con ventajas y desventajas)

- **Opción A: Extracto genérico único para todos los roles autorizados.**
  - *Ventaja:* Menor volumen de código, una sola consulta y una sola plantilla documental.
  - *Desventaja:* Fuga grave de confidencialidad institucional (el administrador de TI leería hechos confidenciales del caso; jefatura recibiría metadatos de red innecesarios).
- **Opción B: Proyecciones desacopladas a nivel de backend (Doble Llave) según rol.**
  - *Ventaja:* Blindaje anti-fuga por diseño (SQL `select` explícito sin `detalle` en técnica, y sin `user_agent` en operativa); constancias acotadas por `usuario_id = auth`; cotejo unificado mediante la secuencia idéntica de `N° = bitacora.id` como detector de deriva. Minimización de datos (no persistencia de IP por dinamismo de red DHCP).
  - *Desventaja:* Requiere mantener consultas y plantillas especializadas para cada proyección.
- **Opción C: Filtrado u ocultamiento en capa frontend.**
  - *Ventaja:* Mantiene un endpoint unificado en backend.
  - *Desventaja:* Vulnerable a inspección de red, payloads JSON y serializaciones automáticas `toArray()`; viola el principio de minimización de datos.

## 3. Decisión

Adoptar la **Opción B (Doble Llave a nivel de backend)** implementada en la Fase C:
1. **Vista Técnica (`/admin/auditoria` y extracto técnico):** Consulta de bitácora mediante `AuditoriaIndexQuery` y `ExtractoService::tecnicas()`, proyectando `id`, `fecha`, `actor`, `accion`, `user_agent` y bandera de descarga, **omitiendo estrictamente `detalle`**.
2. **Vista Operativa (extracto operativo):** Generada mediante `ExtractoService::operativas()` para Jefatura, proyectando `id`, `fecha`, `actor`, `accion` y `detalle`, **omitiendo estrictamente `user_agent`**.
3. **Constancias Individuales (`/denuncias/{ticket}/constancia`):** Generada por `ConstanciaController::propia()` filtrando exclusivamente `where('usuario_id', auth()->id())`.
4. **Blindaje append-only:** El modelo `Bitacora` prohíbe `updating` y `deleting` arrojando `LogicException`.
5. **No persistencia de IP:** Por política de minimización de datos en red institucional DHCP dinámica.
6. **Detector de alteración:** Ambos extractos comparten la secuencia idéntica de IDs (`N°`) y metadata con `caso_id` inmutable.

## 4. Por qué no las otras

La Opción A vulnera la separación institucional de funciones y la confidencialidad de las denuncias según la Ley N° 974. La Opción C confía la seguridad al cliente y es susceptible a fugas pasivas en respuestas HTTP.

## 5. Consecuencias

- El panel administrativo de TI audita actividad y descargas sin violar el secreto de sumario.
- Jefatura coteja la bitácora con los mismos identificadores numéricos que TI sin requerir acceso a servidores o base de datos.
- Cualquier futura columna agregada a la tabla `bitacora` debe ser explícitamente excluida de los loaders operativos (`DenunciaListQuery`, `ConsultaCasosController`, `MisCasosController`) para preservar el blindaje anti-fuga.
- Las consultas al panel y las exportaciones registran eventos de auditoría desacoplados (`denuncia_id = null`).

## Lista de aceptación

- [x] Los 5 campos están completos y son verificables.
- [x] Las opciones incluyen ventajas y desventajas.
- [x] La decisión indica fecha y alcance.
- [x] El documento evita datos no confirmados.
- [x] La fila correspondiente existe en `Indice.md`.
