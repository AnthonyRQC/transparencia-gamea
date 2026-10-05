/**
 * Resuelve el investigador asignado de una denuncia (Bandeja / MisCasos).
 *
 * Forma real del payload (BandejaController + DenunciaListQuery::with()):
 * - `denuncia.investigador` es el BelongsTo serializado: objeto
 *   `{ id, name, ... }` (NO un id string). También puede llegar como id
 *   (`string`/`number`) o `null` cuando no hay asignación.
 * - `investigadores` llega como arreglo (Collection de User serializada),
 *   no como mapa; y User serializa `name`, no `nombre`.
 *
 * Acepta ambas formas de la referencia y ambas formas del mapa, sin `as any`.
 */

export interface InvestigadorRef {
  id?: string | number;
  nombre?: string;
  name?: string;
  iniciales?: string;
  color?: string | null;
}

export interface InvestigadorMapValue {
  id: string | number;
  nombre?: string;
  name?: string;
  iniciales?: string;
  color?: string | null;
}

/** El backend lo envía como arreglo; el frontend lo tipa como Record. Acepta ambos. */
export type InvestigadoresFuente = Record<string, InvestigadorMapValue> | InvestigadorMapValue[] | null | undefined;

export type InvestigadorAsignado = string | number | InvestigadorRef | null | undefined;

export interface InvestigadorResuelto {
  nombre: string;
  color?: string | null;
  iniciales?: string;
}

export function resolverInvestigador(
  ref: InvestigadorAsignado,
  fuente: InvestigadoresFuente,
): InvestigadorResuelto | null {
  if (ref === null || ref === undefined || ref === '') return null;

  if (typeof ref === 'object') {
    const nombreDirecto = ref.nombre ?? ref.name ?? '';
    if (nombreDirecto) {
      return { nombre: nombreDirecto, color: ref.color ?? null, iniciales: ref.iniciales };
    }
    if (ref.id === undefined || ref.id === null) return null;
    return resolverInvestigador(ref.id, fuente);
  }

  if (!fuente) return null;
  const lista: InvestigadorMapValue[] = Array.isArray(fuente) ? fuente : Object.values(fuente);
  const id = String(ref);
  const encontrado = lista.find((t) => t && String(t.id) === id);
  if (!encontrado) return null;
  const nombre = encontrado.nombre ?? encontrado.name ?? '';
  if (!nombre) return null;
  return { nombre, color: encontrado.color ?? null, iniciales: encontrado.iniciales };
}
