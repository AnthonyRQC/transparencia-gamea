import type { Denuncia } from './tipos';

export function isNewHours(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return (Date.now() - d.getTime()) / (1000 * 60 * 60) < 24;
}

/**
 * Orden visual de la página actual (Slice 1: el filtrado vive en el
 * servidor; el cliente solo reordena la página recibida).
 * `plazo` sigue siendo display-only: no hay filtro SQL por plazo.
 */
export function sortItems(items: Denuncia[], sortBy: string, activeTab: string): Denuncia[] {
  return [...items].sort((a, b) => {
    if (sortBy === 'fecha') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'investigador') {
      const tecA = typeof a.investigador === 'object' ? (a.investigador?.name || '') : (a.investigador || '');
      const tecB = typeof b.investigador === 'object' ? (b.investigador?.name || '') : (b.investigador || '');
      return tecA.localeCompare(tecB);
    }
    if (activeTab === 'por-admitir') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return (a.plazo?.dias_restantes ?? 999) - (b.plazo?.dias_restantes ?? 999);
  });
}
