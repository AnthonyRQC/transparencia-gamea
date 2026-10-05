import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { TAB_DEFECTO, TAB_ESTADOS, esScopeDeTab } from './helpers';
import type { FiltrosEcho } from './tipos';
import type {
  DenunciaFiltersApi,
  FiltrosBandejaForm,
} from '../bandeja/useDenunciaFilters';
import { FILTROS_VACIOS } from '../bandeja/useDenunciaFilters';

/**
 * Estado de filtros server-side de MisCasos (Slice 2).
 *
 * Replica `useDenunciaFilters` de Bandeja contra
 * `route('denuncias.mis-casos')`, con dos diferencias:
 * - Nunca envía `tab` ni `investigador_id`: el servidor fuerza
 *   `investigador_id = Auth::id()` y el tab viaja como `?estado=` exacto
 *   (el filtro de investigador del UI queda oculto: solo casos propios).
 * - `sortBy` sigue siendo solo orden visual del cliente (plazo display-only).
 */
export function filtrosIniciales(filters?: Partial<FiltrosEcho> | null): FiltrosBandejaForm {
  if (!filters) return { ...FILTROS_VACIOS, investigador_id: '' };
  return {
    search: filters.search ?? '',
    ticket: filters.ticket ?? '',
    estado: filters.estado ?? [],
    tipo: filters.tipo ?? 'all',
    escenario: filters.escenario ?? '',
    fecha_desde: filters.fecha_desde ?? '',
    fecha_hasta: filters.fecha_hasta ?? '',
    investigador_id: '',
    categoria_id: filters.categoria_id ? String(filters.categoria_id) : '',
    clasificacion_id: filters.clasificacion_id ? String(filters.clasificacion_id) : '',
    sortBy: 'plazo',
  };
}

function aParams(form: FiltrosBandejaForm, pagina?: number): Record<string, string> {
  const params: Record<string, string> = {};
  if (form.search.trim()) params.search = form.search.trim();
  if (form.ticket.trim()) params.ticket = form.ticket.trim();
  if (form.estado.length > 0) params.estado = form.estado.join(',');
  if (form.tipo && form.tipo !== 'all') params.tipo = form.tipo;
  if (form.escenario) params.escenario = form.escenario;
  if (form.fecha_desde) params.fecha_desde = form.fecha_desde;
  if (form.fecha_hasta) params.fecha_hasta = form.fecha_hasta;
  if (form.categoria_id) params.categoria_id = form.categoria_id;
  if (form.clasificacion_id) params.clasificacion_id = form.clasificacion_id;
  if (pagina && pagina > 1) params.page = String(pagina);
  return params;
}

function navegar(form: FiltrosBandejaForm, pagina?: number) {
  router.get(route('denuncias.mis-casos'), aParams(form, pagina), {
    preserveState: true,
    preserveScroll: true,
  });
}

export function useMisCasosFilters(initial?: Partial<FiltrosEcho> | null): DenunciaFiltersApi {
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

  // El scope del tab viaja en `estado` pero NO cuenta como filtro activo
  // (equivale al `tab` separado de Bandeja).
  const refinado = !esScopeDeTab(form.estado);

  const hayFiltros =
    form.search.trim() !== '' ||
    form.ticket.trim() !== '' ||
    (form.estado.length > 0 && refinado) ||
    form.tipo !== 'all' ||
    form.escenario !== '' ||
    form.fecha_desde !== '' ||
    form.fecha_hasta !== '' ||
    form.categoria_id !== '' ||
    form.clasificacion_id !== '';

  const cantidadFiltros =
    (form.search.trim() ? 1 : 0) +
    (form.ticket.trim() ? 1 : 0) +
    (form.estado.length > 0 && refinado ? 1 : 0) +
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
    /** Aplica el formulario actual (resetea a página 1). */
    aplicar: (_tab: string) => navegar(form),
    /** Aplica un formulario explícito (para los chips que quitan un filtro). */
    aplicarCon: (next: FiltrosBandejaForm, _tab: string) => {
      setForm(next);
      navegar(next);
    },
    /** Cambia de tab fijando su scope de estados (resetea a página 1). */
    cambiarTab: (tab: string) => {
      const next = { ...form, estado: [...(TAB_ESTADOS[tab] ?? TAB_ESTADOS[TAB_DEFECTO])] };
      setForm(next);
      navegar(next);
    },
    /** Pagina conservando filtros. */
    irAPagina: (_tab: string, pagina: number) => navegar(form, pagina),
    /** Limpia todo y vuelve al tab por defecto (scope asignada del servidor). */
    restablecer: () => {
      setForm({ ...FILTROS_VACIOS, investigador_id: '' });
      setShowFilters(false);
      router.get(route('denuncias.mis-casos'), {}, { preserveState: true, preserveScroll: true });
    },
  };
}
