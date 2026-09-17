import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import InvestigadorAvatar from '../Shared/InvestigadorAvatar';

interface InvestigadorCarga {
  id: string;
  nombre: string;
  iniciales: string;
  color: string;
  activos: number;
  por_vencer: number;
  vencidos: number;
}

interface InvestigadorCargaCardProps {
  investigador: InvestigadorCarga;
  selected: boolean;
  onSelect: () => void;
}

export default function InvestigadorCargaCard({ investigador, selected, onSelect }: InvestigadorCargaCardProps) {
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
      <InvestigadorAvatar nombre={investigador.nombre} color={investigador.color} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{investigador.nombre}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            {investigador.activos} activo{investigador.activos !== 1 ? 's' : ''}
          </span>
          {investigador.por_vencer > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
              <AlertTriangle className="w-3 h-3" />
              {investigador.por_vencer} por vencer
            </span>
          )}
          {investigador.vencidos > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-800 dark:text-pink-300">
              <AlertCircle className="w-3 h-3" />
              {investigador.vencidos} vencido{investigador.vencidos !== 1 ? 's' : ''}
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
