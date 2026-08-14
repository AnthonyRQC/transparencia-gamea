import { Pin, CalendarDays, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BaseTemporal } from '@/types/dashboard';

const DESCRIPCIONES: Record<BaseTemporal, string> = {
  estado_actual: 'Estado actual — este elemento NO usa el rango de fechas',
  created_at: 'Según fecha de ingreso del caso',
  cerrado_at: 'Según fecha de cierre del caso',
  redactado_at: 'Según fecha de redacción del informe final',
  fecha_rechazada: 'Según fecha de rechazo del caso',
  fecha_envio: 'Según fecha de envío de la solicitud',
};

interface Props {
  base: BaseTemporal | undefined;
  className?: string;
}

export default function BaseTemporalBadge({ base, className }: Props) {
  if (!base) return null;
  const esEstado = base === 'estado_actual';

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide cursor-help select-none',
              esEstado ? 'bg-primary/10 text-primary' : 'bg-secondary/40 text-muted-foreground',
              className
            )}
          >
            {esEstado ? <Pin className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
            {esEstado ? 'Estado actual' : 'Del período'}
            <Info className="w-2.5 h-2.5 opacity-70" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-center text-[11px]">{DESCRIPCIONES[base]}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
