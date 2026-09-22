# Índice de decisiones

Para registrar una decisión, copie `PLANTILLA-ADR.md`, complete los 5 campos
y agregue una fila en la tabla de este índice. El historial anterior se
conserva como referencia y no se modifica.

## Ruta rápida

1. Copiar `PLANTILLA-ADR.md` con el siguiente identificador disponible.
2. Completar Contexto, Opciones, Decisión, Por qué no las otras y Consecuencias.
3. Agregar una fila en la tabla de decisiones y verificar los enlaces.

## Estados

| Estado | Significado |
|--------|-------------|
| Vigente | La decisión aplica en este momento. |
| Histórica | La decisión ya fue reemplazada o cerró su ciclo. |
| En revisión | La propuesta está en análisis y aún no aplica. |

## Decisiones

| ID | Título | Estado | Enlace |
|----|--------|--------|--------|
| D-histórico | Decisiones 12.5 - 13 (log anterior) | Histórica | [Ver log histórico](../Decisiones%2012.5%20-%2013%20(Log).md) |
| D27 | Enums de dominio sin casts de modelo | Vigente | [Ver](D27-enums-sin-casts.md) |

Nota: el log anterior se mantiene como documento histórico. No se copia
su contenido en este índice; se enlaza como referencia.

## Cómo agregar una decisión nueva

1. Identificador: utilice el siguiente número disponible (D1, D2, ...).
   No reutilice identificadores de decisiones históricas.
2. Archivo: cree un archivo por decisión o agregue una sección según
   el tamaño del cambio. Para decisiones independientes, se recomienda
   un archivo por decisión con el formato `D00-titulo-corto.md`.
3. Registro: agregue la fila correspondiente en la tabla de decisiones
   con título, estado y enlace. Mantenga la tabla en orden cronológico.

## Convenciones

| Elemento | Convención |
|----------|------------|
| Identificador | Formato `D` + número correlativo (ejemplo: `D1`). |
| Título | Breve, orientado al resultado de la decisión. |
| Fecha | Se registra dentro del documento de cada decisión. |
| Orden | La tabla conserva el orden cronológico de registro. |

Cada decisión conserva su fecha y su estado. Si una decisión cambia,
se actualiza su estado en la tabla sin eliminar la fila original.

## Plantilla

La plantilla oficial se encuentra en [PLANTILLA-ADR.md](PLANTILLA-ADR.md).
Toda decisión nueva debe seguir sus 5 campos y su lista de aceptación.

## Lista de verificación

- [ ] El identificador es nuevo y no duplica uno existente.
- [ ] Los 5 campos de la plantilla están completos.
- [ ] La tabla incluye título, estado y enlace funcional.
- [ ] El log histórico permanece sin modificaciones.

## Siguiente paso

Consultar la [plantilla ADR](PLANTILLA-ADR.md) antes de registrar
la siguiente decisión.
