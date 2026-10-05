import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { FiltrosEcho } from './tipos';

/**
 * Estado de filtros server-side de la Bandeja (Slice 1).
 *
 * Unifica la búsqueda libre + tipo + orden visual anteriores y añade
 * ticket exacto, multi-estado, escenario, rango de fechas, investigador,
 * categoría y clasificación. Cada navegación resetea la página (se omite
 * `page`, el servidor vuelve a la 1).
 */
export interface FiltrosBandejaForm {
  search: string;
  ticket: string;
  estado: string[];
  /** 'all' = todos (sentinela local, no viaja al servidor). */
  tipo: string;
  /** '' = todos. */
  escenario: string;
  /** Y-m-d o ''. */
  fecha_desde: string;
  fecha_hasta: string;
  /** ID como string o ''. */
  investigador_id: string;
  categoria_id: string;
  clasificacion_id: string;
  /** Solo orden visual del cliente (plazo = display-only, sin SQL). */
  sortBy: string;
}

export const FILTROS_VACIOS: FiltrosBandejaForm = {
  search: '',
  ticket: '',
  estado: [],
  tipo: 'all',
  escenario: '',
  fecha_desde: '',
  fecha_hasta: '',
  investigador_id: '',
  categoria_id: '',
  clasificacion_id: '',
  sortBy: 'plazo',
};

export function filtrosIniciales(filters?: Partial<FiltrosEcho> | null): FiltrosBandejaForm {
  if (!filters) return { ...FILTROS_VACIOS };
  return {
    search: filters.search ?? '',
    ticket: filters.ticket ?? '',
    estado: filters.estado ?? [],
    tipo: filters.tipo ?? 'all',
    escenario: filters.escenario ?? '',
    fecha_desde: filters.fecha_desde ?? '',
    fecha_hasta: filters.fecha_hasta ?? '',
    investigador_id: filters.investigador_id ? String(filters.investigador_id) : '',
    categoria_id: filters.categoria_id ? String(filters.categoria_id) : '',
    clasificacion_id: filters.clasificacion_id ? String(filters.clasificacion_id) : '',
    sortBy: 'plazo',
  };
}

function aParams(form: FiltrosBandejaForm, tab: string, pagina?: number): Record<string, string> {
  const params: Record<string, string> = {};
  if (form.search.trim()) params.search = form.search.trim();
  if (form.ticket.trim()) params.ticket = form.ticket.trim();
  if (form.estado.length > 0) params.estado = form.estado.join(',');
  if (form.tipo && form.tipo !== 'all') params.tipo = form.tipo;
  if (form.escenario) params.escenario = form.escenario;
  if (form.fecha_desde) params.fecha_desde = form.fecha_desde;
  if (form.fecha_hasta) params.fecha_hasta = form.fecha_hasta;
  if (form.investigador_id) params.investigador_id = form.investigador_id;
  if (form.categoria_id) params.categoria_id = form.categoria_id;
  if (form.clasificacion_id) params.clasificacion_id = form.clasificacion_id;
  if (tab) params.tab = tab;
  if (pagina && pagina > 1) params.page = String(pagina);
  return params;
}

function navegar(tab: string, form: FiltrosBandejaForm, pagina?: number) {
  router.get(route('denuncias.bandeja'), aParams(form, tab, pagina), {
    preserveState: true,
    preserveScroll: true,
  });
}

export function useDenunciaFilters(initial?: Partial<FiltrosEcho> | null) {
  const [form, setForm] = useState<FiltrosBandejaForm>(() => filtrosIniciales(initial));
  const [showFilters, setShowFilters] = useState(false);

  const setCampo = <K extends keyof FiltrosBandejaForm>(key: K, valor: FiltrosBandejaForm[K]) => {
    setForm((f) => ({ ...f, [key]: valor }));
  };

  const toggleEstado = (estado: string) => {
    setForm((f) => ({
      ...f,
      estado: f.estado.includes(estado) ? f.estado.filter((e) => e !== estado) : [...f.estado, estado],
    }));
  };

  const hayFiltros =
    form.search.trim() !== '' ||
    form.ticket.trim() !== '' ||
    form.estado.length > 0 ||
    form.tipo !== 'all' ||
    form.escenario !== '' ||
    form.fecha_desde !== '' ||
    form.fecha_hasta !== '' ||
    form.investigador_id !== '' ||
    form.categoria_id !== '' ||
    form.clasificacion_id !== '';

  const cantidadFiltros =
    (form.search.trim() ? 1 : 0) +
    (form.ticket.trim() ? 1 : 0) +
    (form.estado.length > 0 ? 1 : 0) +
    (form.tipo !== 'all' ? 1 : 0) +
    (form.escenario ? 1 : 0) +
    (form.fecha_desde || form.fecha_hasta ? 1 : 0) +
    (form.categoria_id ? 1 : 0) +
    (form.clasificacion_id ? 1 : 0);

  return {
    form,
    setForm,
    setCampo,
    toggleEstado,
    showFilters,
    setShowFilters,
    hayFiltros,
    cantidadFiltros,
    /** Aplica el formulario actual en el tab dado (resetea a página 1). */
    aplicar: (tab: string) => navegar(tab, form),
    /** Aplica un formulario explícito (para los chips que quitan un filtro). */
    aplicarCon: (next: FiltrosBandejaForm, tab: string) => {
      setForm(next);
      navegar(tab, next);
    },
    /** Cambia de tab conservando filtros (resetea a página 1). */
    cambiarTab: (tab: string) => navegar(tab, form),
    /** Pagina dentro del tab conservando filtros. */
    irAPagina: (tab: string, pagina: number) => navegar(tab, form, pagina),
    /** Limpia todo y recarga sin params (tab por defecto del servidor). */
    restablecer: () => {
      setForm({ ...FILTROS_VACIOS });
      setShowFilters(false);
      router.get(route('denuncias.bandeja'), {}, { preserveState: true, preserveScroll: true });
    },
  };
}

export type DenunciaFiltersApi = ReturnType<typeof useDenunciaFilters>;
