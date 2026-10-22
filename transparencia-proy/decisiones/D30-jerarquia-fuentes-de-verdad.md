# D30 — Jerarquía de fuentes de verdad documental y técnica

## 1. Contexto

La documentación histórica del proyecto acumuló discrepancias con el código fuente y con resoluciones de cliente. Ante contradicciones entre el marco legal (Ley 974), las decisiones formales (ADRs y OpenSpec), la implementación en código de producción y los tests automatizados, se requería un orden de prelación explícito y vinculante para evitar arbitrariedad y sobreafirmaciones documentales.

## 2. Opciones (con ventajas y desventajas)

- Opción A: Código como única verdad (Code is documentation).
  - Ventaja: Cero desfase entre documento y comportamiento real en runtime.
  - Desventaja: Invalida el valor contractual de las specs, ignora restricciones legales de la Ley 974 y reduce la arquitectura a la coyuntura del código.
- Opción B: Documentación / Specs como autoridad suprema e invariable.
  - Ventaja: Mantiene diseño teórico puro y formal.
  - Desventaja: Bloquea iteraciones rápidas y genera parálisis cuando el código avanza por solicitud de cliente antes de actualizar la spec.
- Opción C (Elegida): Pirámide escalonada de 4 niveles (`Ley 974 > ADR/Spec > Código de producción > Tests`).
  - Ventaja: Subordina la técnica al cumplimiento normativo estatal, reconoce los contratos formales cuando existen, acepta el código + tests como verdad provisional en dominios no formalizados, y trata a los tests como guardarraíl sin otorgarles rol legislador.
  - Desventaja: Requiere disciplina de registro en ADRs para cualquier excepción o desvío intencional.

## 3. Decisión

Se adopta formalmente la siguiente pirámide de prelación (2026-10-21):
1. **Ley 974:** Máxima autoridad legal e institucional; cualquier código o spec que la viole constituye defecto legal.
2. **ADR vigente / OpenSpec formal:** Contrato formal de intención y arquitectura. Las excepciones a un contrato deben registrarse en un nuevo ADR.
3. **Código de producción:** Verdad de facto en ejecución. En dominios sin spec formal (ej. ciclo de vida, RBAC), el código es la verdad operativa provisional hasta su backfill.
4. **Tests automatizados:** Guardarraíl técnico de no-regresión. Verifican el cumplimiento mecánico del código, pero no definen ni convalidan por sí solos reglas de negocio erróneas.

## 4. Por qué no las otras

Las opciones monocéntricas (solo código o solo documentos) fracasan en proyectos del sector público: el código por sí solo no garantiza apego a la ley (ej. reserva de identidad o plazos fatales), y la documentación pura sin sincronización se degrada en papel mojado. La pirámide articulada delimita la responsabilidad de cada artefacto.

## 5. Consecuencias

- Toda discrepancia detectada entre código y especificación se evalúa según la pirámide: si no hay spec, el código manda de forma provisional; si hay spec o ley violada, el código debe corregirse o emitirse un ADR justificativo.
- Toda excepción a la jerarquía debe quedar asentada en un ADR en `transparencia-proy/decisiones/`.
- No se permiten afirmaciones documentales que contradigan la base fáctica verificable del código en ramas cerradas.

## Lista de aceptación

- [x] Los 5 campos están completos y son verificables.
- [x] Las opciones incluyen ventajas y desventajas.
- [x] La decisión indica fecha y alcance.
- [x] El documento evita datos no confirmados.
- [x] La fila correspondiente existe en `Indice.md`.
