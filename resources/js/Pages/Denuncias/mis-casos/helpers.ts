import type { Denuncia, Solicitud, Descargo } from './tipos';

export function isNewHours(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return (Date.now() - d.getTime()) / (1000 * 60 * 60) < 24;
}

export function sortItems(items: Denuncia[], sortBy: string, activeTab: string): Denuncia[] {
  return [...items].sort((a, b) => {
    if (sortBy === 'fecha') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'investigador') return (a.investigador || '').localeCompare(b.investigador || '');
    if (activeTab === 'asignada') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return (a.plazo?.dias_restantes ?? 999) - (b.plazo?.dias_restantes ?? 999);
  });
}

export function countPendientes(
  denuncia: Denuncia,
  solicitudesByTicket: Record<string, Solicitud[]>,
  descargosByTicket: Record<string, Descargo[]>,
): { solicitudes: number; descargos: number } {
  const sols = solicitudesByTicket[denuncia.ticket] || [];
  const descs = descargosByTicket[denuncia.ticket] || [];
  const solsPend = sols.filter(s => s.estado === 'pendiente').length;
  const descsPend = descs.filter(d => ['pendiente_notif', 'notificado'].includes(d.estado)).length;
  return { solicitudes: solsPend, descargos: descsPend };
}

/**
 * Scope de estados por tab de MisCasos (Slice 2, server-side).
 *
 * El tab `asignada` pliega `admitida` (mismo fold histórico del `grouped`
 * del controlador). Cada tab navega con `?estado=` exacto; el panel de
 * filtros refina dentro del tab activo (semántica Bandeja).
 */
export const TAB_ESTADOS: Record<string, string[]> = {
  asignada: ['asignada', 'admitida'],
  investigacion: ['investigacion'],
  informe: ['informe'],
  cerrada: ['cerrada'],
};

export const TAB_DEFECTO = 'asignada';

function mismosEstados(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((e) => b.includes(e));
}

/** Deriva el tab activo desde el eco `filters.estado` del servidor. */
export function tabDesdeEstado(estado: string[] | null | undefined): string {
  if (!estado || estado.length === 0) return TAB_DEFECTO;
  for (const [tab, estados] of Object.entries(TAB_ESTADOS)) {
    if (mismosEstados([...estado].sort(), [...estados].sort())) return tab;
  }
  return TAB_DEFECTO;
}

/** ¿Es el estado exactamente el scope de algún tab (sin refinamiento)? */
export function esScopeDeTab(estado: string[]): boolean {
  if (estado.length === 0) return false;
  const ordenado = [...estado].sort();
  return Object.values(TAB_ESTADOS).some((scope) => mismosEstados(ordenado, [...scope].sort()));
}

/** ¿Pertenece la denuncia al tab (con fold admitida→asignada)? */
export function esDelTab(estadoDenuncia: string, tab: string): boolean {
  const plegado = estadoDenuncia === 'admitida' ? 'asignada' : estadoDenuncia;
  return (TAB_ESTADOS[tab] ?? []).map((e) => (e === 'admitida' ? 'asignada' : e)).includes(plegado);
}
