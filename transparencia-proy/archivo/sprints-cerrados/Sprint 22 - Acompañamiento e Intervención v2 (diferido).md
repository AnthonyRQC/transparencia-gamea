> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 22 â€” AcompaÃ±amiento e IntervenciÃ³n (v2) â¸ï¸ DIFERIDO

**Estado:** â¸ï¸ **Diferido a v2.** NO se implementa en Fase 0 ni Fase 1.

**Origen:** DecisiÃ³n del cliente Julio 2026 â€” estas funcionalidades son extras opcionales, no son nÃºcleo del objetivo del sistema (Ley 974 = denuncias de corrupciÃ³n y negaciÃ³n de informaciÃ³n). Se retomarÃ¡n en una v2 cuando el MVP estÃ© consolidado.

---

## 1. Contexto

### 1.1 Historia
- En el Sprint 1, se implementaron 4 tipos de denuncia: CorrupciÃ³n, NegaciÃ³n de InformaciÃ³n, AcompaÃ±amiento, IntervenciÃ³n / Medida Correctiva.
- En el Sprint 4, AcompaÃ±amiento pasÃ³ a tener `evidencia` opcional.
- En el Sprint 4, IntervenciÃ³n pasÃ³ a tener `archivo` opcional.
- En Julio 2026, el cliente decidiÃ³ que estos 2 tipos no son nÃºcleo del MVP y se difieren a v2.

### 1.2 Estado actual (Julio 2026)
- En **Sprint 7.5** se eliminan del dropdown selector de tipo en `RegistroDenuncia.tsx`.
- Se eliminan los archivos `FormularioAcompaniamiento.tsx` y `FormularioIntervencion.tsx`.
- El enum `denuncias.tipo` en BD (Sprint 10) solo tiene `'corrupcion'`, `'negacion'`.
- Toda referencia a acomp/intervenciÃ³n en docs y cÃ³digo queda como nota histÃ³rica.

### 1.3 RazÃ³n de la decisiÃ³n
- El nÃºcleo del sistema segÃºn Ley 974 son las **denuncias de corrupciÃ³n y negaciÃ³n de informaciÃ³n**.
- AcompaÃ±amiento e IntervenciÃ³n son extras que la UTLCC puede hacer por otros medios.
- Mantenerlas en el MVP agrega complejidad sin valor inmediato.

---

## 2. Funcionalidades diferidas (referencia para v2)

### 2.1 AcompaÃ±amiento
Formulario propio con campos:
- `nombres` (texto, MAYÃšSCULAS)
- `ci` (texto, opcional, MAYÃšSCULAS)
- `unidad_involucrada` (texto, MAYÃšSCULAS)
- `motivo_reclamo` (textarea, MAYÃšSCULAS)
- `resolucion_acuerdo` (textarea, MAYÃšSCULAS)
- `evidencia` (upload archivo, opcional)

**Plazo:** sin plazo (resoluciÃ³n inmediata).

### 2.2 IntervenciÃ³n / Medida Correctiva
Formulario propio con campos:
- `unidad_observada` (texto, MAYÃšSCULAS)
- `motivo_patron` (textarea, MAYÃšSCULAS)
- `archivo` (upload, opcional)
- `referencia_nota` (texto, MAYÃšSCULAS)

**Plazo:** sin plazo (medida correctiva).

---

## 3. Cambios en v2 (cuando se reactive)

### 3.1 Frontend
- Reactivar las 2 opciones en el dropdown de `RegistroDenuncia.tsx`
- Restaurar `FormularioAcompaniamiento.tsx` y `FormularioIntervencion.tsx` (o reescribir)
- LÃ³gica condicional en `RegistroDenuncia.tsx` para renderizar el formulario correcto segÃºn tipo

### 3.2 Backend
- Validaciones: tipos de datos correctos para cada formulario
- `DenunciaController@store`: aceptar los nuevos campos segÃºn tipo
- `DenunciaData::makeDenuncia()`: branches para acomp/intervenciÃ³n

### 3.3 Base de datos
- `ALTER TABLE denuncias MODIFY tipo ENUM('corrupcion', 'negacion', 'acompaniamiento', 'intervencion')`
- Tabla `denuncias_detalle_especial` (opcional, si se quieren separar campos):
  - `id`, `denuncia_id`, `tipo_detalle`, `campos_json` (JSON con campos variables)
  - O agregar columnas nullable adicionales a `denuncias`

### 3.4 Stepper de seguimiento pÃºblico
- En el `StepperProgreso.tsx` (Sprint 6), los 2 tipos no aplican los mismos pasos.
- Puede requerir una variante del stepper o un mensaje genÃ©rico.

---

## 4. EstimaciÃ³n (referencia v2)

**1-2 dÃ­as.** Cambios pequeÃ±os:
- Restaurar 2 opciones en dropdown
- Restaurar/reescribir 2 componentes
- Actualizar validaciÃ³n
- ALTER TABLE
- Actualizar stepper pÃºblico

---

## 5. Â¿Por quÃ© se difiere a v2 y no se elimina definitivamente?

- El cliente NO confirmÃ³ que se eliminen para siempre. Solo que no son nÃºcleo del MVP.
- La UTLCC podrÃ­a requerir estas funcionalidades en el futuro (ej. si la ley 974 se expande).
- El cambio tÃ©cnico es mÃ­nimo (ALTER TABLE), por lo que es barato mantenerlo como opcional.
- Si en algÃºn momento se confirma la eliminaciÃ³n definitiva, se puede hacer sin mayor complicaciÃ³n.

---

## 6. Diferencia con Sprint 1 original

| Sprint 1 original (Junio 2026) | Sprint 22 v2 (futuro) |
|---|---|
| 4 tipos de denuncia | 2 tipos (corrupcion, negacion) + 2 reactivables |
| Dropdown con 4 opciones | Dropdown con 2 opciones + 2 reactivables |
| `evidencia` en AcompaÃ±amiento | Reactivable |
| `archivo` obligatorio en IntervenciÃ³n | Reactivable como opcional |
| Sin nota de diferimiento | Este Sprint 22 como nota |

---

## 7. Pendientes / Decisiones para v2

- Â¿`evidencia` y `archivo` siguen siendo opcionales u obligatorios? (en Sprint 4 se hicieron opcionales)
- Â¿`acompaniamiento` e `intervencion` tienen plazo? (en Sprint 1 eran "sin plazo")
- Â¿Aparecen en el stepper de seguimiento pÃºblico? Â¿CÃ³mo se muestran?
- Â¿Tienen categorÃ­a, subcategorÃ­a, tÃ©cnicos asignados, etc.? (en Sprint 1 no se asignaban)
- Â¿Pasan por Bandeja de AdmisiÃ³n o se resuelven inmediatamente?

Estas decisiones se resolverÃ¡n cuando se reactive Sprint 22.

---

## 8. Cierre

Sprint 22 estÃ¡ **diferido**. No hay actividad en Fase 0/1.

Cuando se reactive en v2:
1. Restaurar dropdown de tipo
2. Restaurar 2 componentes
3. ALTER TABLE para enum
4. Actualizar stepper pÃºblico
5. Resolver decisiones pendientes
6. Testing

---
*Documento creado: Julio 2026. Sprint 22 â€” AcompaÃ±amiento e IntervenciÃ³n v2 (diferido).*

