import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  elementosPorPagina?: number;
  onPaginaChange: (pagina: number) => void;
}

export default function Paginacion({
  paginaActual,
  totalPaginas,
  totalElementos,
  elementosPorPagina = 10,
  onPaginaChange,
}: PaginacionProps) {
  if (totalElementos === 0 || totalPaginas <= 1) return null;

  const inicio = (paginaActual - 1) * elementosPorPagina + 1;
  const fin = Math.min(paginaActual * elementosPorPagina, totalElementos);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border mt-4 text-xs">
      <p className="text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{inicio}</span> a{' '}
        <span className="font-semibold text-foreground">{fin}</span> de{' '}
        <span className="font-semibold text-foreground">{totalElementos}</span> denuncias
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
