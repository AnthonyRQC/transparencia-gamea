import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  elementosPorPagina?: number;
  onPaginaChange: (pagina: number) => void;
  /** client = Anterior/Página X de Y/Siguiente + contador; server = botones numerados. */
  mode?: 'client' | 'server';
  /** Sustantivo del contador en modo client (defecto 'denuncias'). */
  itemLabel?: string;
}

export default function Paginacion({
  paginaActual,
  totalPaginas,
  totalElementos,
  elementosPorPagina = 10,
  onPaginaChange,
  mode = 'client',
  itemLabel = 'denuncias',
}: PaginacionProps) {
  if (totalElementos === 0 || totalPaginas <= 1) return null;

  if (mode === 'server') {
    return (
      <div className="flex items-center justify-center gap-1 mt-6">
        <button
          type="button"
          onClick={() => onPaginaChange(paginaActual - 1)}
          disabled={paginaActual <= 1}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
            paginaActual <= 1
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'text-foreground hover:bg-muted cursor-pointer',
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => onPaginaChange(p)}
            className={cn(
              'w-8 h-8 text-sm font-medium rounded-lg transition-colors',
              p === paginaActual
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted cursor-pointer',
            )}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPaginaChange(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
            paginaActual >= totalPaginas
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'text-foreground hover:bg-muted cursor-pointer',
          )}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const inicio = (paginaActual - 1) * elementosPorPagina + 1;
  const fin = Math.min(paginaActual * elementosPorPagina, totalElementos);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border mt-4 text-xs">
      <p className="text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{inicio}</span> a{' '}
        <span className="font-semibold text-foreground">{fin}</span> de{' '}
        <span className="font-semibold text-foreground">{totalElementos}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={paginaActual <= 1}
          onClick={() => onPaginaChange(paginaActual - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Anterior
        </button>

        <span className="px-3 text-xs font-semibold text-muted-foreground">
          Página <strong className="text-foreground">{paginaActual}</strong> de{' '}
          <strong className="text-foreground">{totalPaginas}</strong>
        </span>

        <button
          type="button"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onPaginaChange(paginaActual + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
        >
          Siguiente
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
