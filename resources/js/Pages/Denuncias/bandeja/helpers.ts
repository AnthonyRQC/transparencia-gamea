import type { Denuncia } from './tipos';

export function isNewHours(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return (Date.now() - d.getTime()) / (1000 * 60 * 60) < 24;
}

export interface FiltrosBandeja {
  search: string;
  filterTipo: string;
  sortBy: string;
  activeTab: string;
}

export function filterAndSort(items: Denuncia[], { search, filterTipo, sortBy, activeTab }: FiltrosBandeja): Denuncia[] {
  let filtered = items;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((d) =>
      d.ticket.toLowerCase().includes(q) ||
      (d.denunciante?.nombres && d.denunciante.nombres.toLowerCase().includes(q))
    );
  }
  if (filterTipo !== 'all') {
    filtered = filtered.filter((d) => d.tipo === filterTipo);
  }
  return [...filtered].sort((a, b) => {
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
