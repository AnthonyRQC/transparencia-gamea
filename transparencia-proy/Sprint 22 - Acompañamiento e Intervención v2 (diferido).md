#transparencia
# Sprint 22 — Acompañamiento e Intervención (v2) ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido a v2.** NO se implementa en Fase 0 ni Fase 1.

**Origen:** Decisión del cliente Julio 2026 — estas funcionalidades son extras opcionales, no son núcleo del objetivo del sistema (Ley 974 = denuncias de corrupción y negación de información). Se retomarán en una v2 cuando el MVP esté consolidado.

---

## 1. Contexto

### 1.1 Historia
- En el Sprint 1, se implementaron 4 tipos de denuncia: Corrupción, Negación de Información, Acompañamiento, Intervención / Medida Correctiva.
- En el Sprint 4, Acompañamiento pasó a tener `evidencia` opcional.
- En el Sprint 4, Intervención pasó a tener `archivo` opcional.
- En Julio 2026, el cliente decidió que estos 2 tipos no son núcleo del MVP y se difieren a v2.

### 1.2 Estado actual (Julio 2026)
- En **Sprint 7.5** se eliminan del dropdown selector de tipo en `RegistroDenuncia.tsx`.
- Se eliminan los archivos `FormularioAcompaniamiento.tsx` y `FormularioIntervencion.tsx`.
- El enum `denuncias.tipo` en BD (Sprint 14) solo tiene `'corrupcion'`, `'negacion'`.
- Toda referencia a acomp/intervención en docs y código queda como nota histórica.

### 1.3 Razón de la decisión
- El núcleo del sistema según Ley 974 son las **denuncias de corrupción y negación de información**.
- Acompañamiento e Intervención son extras que la UTLCC puede hacer por otros medios.
- Mantenerlas en el MVP agrega complejidad sin valor inmediato.

---

## 2. Funcionalidades diferidas (referencia para v2)

### 2.1 Acompañamiento
Formulario propio con campos:
- `nombres` (texto, MAYÚSCULAS)
- `ci` (texto, opcional, MAYÚSCULAS)
- `unidad_involucrada` (texto, MAYÚSCULAS)
- `motivo_reclamo` (textarea, MAYÚSCULAS)
- `resolucion_acuerdo` (textarea, MAYÚSCULAS)
- `evidencia` (upload archivo, opcional)

**Plazo:** sin plazo (resolución inmediata).

### 2.2 Intervención / Medida Correctiva
Formulario propio con campos:
- `unidad_observada` (texto, MAYÚSCULAS)
- `motivo_patron` (textarea, MAYÚSCULAS)
- `archivo` (upload, opcional)
- `referencia_nota` (texto, MAYÚSCULAS)

**Plazo:** sin plazo (medida correctiva).

---

## 3. Cambios en v2 (cuando se reactive)

### 3.1 Frontend
- Reactivar las 2 opciones en el dropdown de `RegistroDenuncia.tsx`
- Restaurar `FormularioAcompaniamiento.tsx` y `FormularioIntervencion.tsx` (o reescribir)
- Lógica condicional en `RegistroDenuncia.tsx` para renderizar el formulario correcto según tipo

### 3.2 Backend
- Validaciones: tipos de datos correctos para cada formulario
- `DenunciaController@store`: aceptar los nuevos campos según tipo
- `DenunciaData::makeDenuncia()`: branches para acomp/intervención

### 3.3 Base de datos
- `ALTER TABLE denuncias MODIFY tipo ENUM('corrupcion', 'negacion', 'acompaniamiento', 'intervencion')`
- Tabla `denuncias_detalle_especial` (opcional, si se quieren separar campos):
  - `id`, `denuncia_id`, `tipo_detalle`, `campos_json` (JSON con campos variables)
  - O agregar columnas nullable adicionales a `denuncias`

### 3.4 Stepper de seguimiento público
- En el `StepperProgreso.tsx` (Sprint 6), los 2 tipos no aplican los mismos pasos.
- Puede requerir una variante del stepper o un mensaje genérico.

---

## 4. Estimación (referencia v2)

**1-2 días.** Cambios pequeños:
- Restaurar 2 opciones en dropdown
- Restaurar/reescribir 2 componentes
- Actualizar validación
- ALTER TABLE
- Actualizar stepper público

---

## 5. ¿Por qué se difiere a v2 y no se elimina definitivamente?

- El cliente NO confirmó que se eliminen para siempre. Solo que no son núcleo del MVP.
- La UTLCC podría requerir estas funcionalidades en el futuro (ej. si la ley 974 se expande).
- El cambio técnico es mínimo (ALTER TABLE), por lo que es barato mantenerlo como opcional.
- Si en algún momento se confirma la eliminación definitiva, se puede hacer sin mayor complicación.

---

## 6. Diferencia con Sprint 1 original

| Sprint 1 original (Junio 2026) | Sprint 22 v2 (futuro) |
|---|---|
| 4 tipos de denuncia | 2 tipos (corrupcion, negacion) + 2 reactivables |
| Dropdown con 4 opciones | Dropdown con 2 opciones + 2 reactivables |
| `evidencia` en Acompañamiento | Reactivable |
| `archivo` obligatorio en Intervención | Reactivable como opcional |
| Sin nota de diferimiento | Este Sprint 22 como nota |

---

## 7. Pendientes / Decisiones para v2

- ¿`evidencia` y `archivo` siguen siendo opcionales u obligatorios? (en Sprint 4 se hicieron opcionales)
- ¿`acompaniamiento` e `intervencion` tienen plazo? (en Sprint 1 eran "sin plazo")
- ¿Aparecen en el stepper de seguimiento público? ¿Cómo se muestran?
- ¿Tienen categoría, subcategoría, técnicos asignados, etc.? (en Sprint 1 no se asignaban)
- ¿Pasan por Bandeja de Admisión o se resuelven inmediatamente?

Estas decisiones se resolverán cuando se reactive Sprint 22.

---

## 8. Cierre

Sprint 22 está **diferido**. No hay actividad en Fase 0/1.

Cuando se reactive en v2:
1. Restaurar dropdown de tipo
2. Restaurar 2 componentes
3. ALTER TABLE para enum
4. Actualizar stepper público
5. Resolver decisiones pendientes
6. Testing

---
*Documento creado: Julio 2026. Sprint 22 — Acompañamiento e Intervención v2 (diferido).*
