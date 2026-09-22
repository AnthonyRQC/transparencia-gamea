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
