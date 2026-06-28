import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface TecnicoCarga {
  id: string;
  nombre: string;
  iniciales: string;
  color: string;
  activos: number;
  por_vencer: number;
  vencidos: number;
}

interface TecnicoCargaCardProps {
  tecnico: TecnicoCarga;
  selected: boolean;
  onSelect: () => void;
}

export default function TecnicoCargaCard({ tecnico, selected, onSelect }: TecnicoCargaCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-xs'
      )}
    >
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', tecnico.color)}>
        {tecnico.iniciales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{tecnico.nombre}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            {tecnico.activos} activo{tecnico.activos !== 1 ? 's' : ''}
          </span>
          {tecnico.por_vencer > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              {tecnico.por_vencer} por vencer
            </span>
          )}
          {tecnico.vencidos > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
              <AlertCircle className="w-3 h-3" />
              {tecnico.vencidos} vencido{tecnico.vencidos !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
