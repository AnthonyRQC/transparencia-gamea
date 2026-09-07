import { Pin, CalendarDays, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BaseTemporal } from '@/types/dashboard';

const ETIQUETA: Record<BaseTemporal, string> = {
  estado_actual: 'Hoy',
  created_at: 'Por ingreso',
  cerrado_at: 'Por cierre',
  redactado_at: 'Por informe',
  fecha_rechazada: 'Por rechazo',
  fecha_envio: 'Por envío',
};

const DESCRIPCIONES: Record<BaseTemporal, string> = {
  estado_actual: 'Foto de hoy — no cambia con las fechas elegidas',
  created_at: 'Cuenta por fecha de ingreso del caso',
  cerrado_at: 'Cuenta por fecha de cierre del caso',
  redactado_at: 'Cuenta por fecha del informe final',
  fecha_rechazada: 'Cuenta por fecha de rechazo del caso',
  fecha_envio: 'Cuenta por fecha de envío de la solicitud',
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
            tabIndex={0}
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold cursor-help select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              esEstado ? 'bg-primary/10 text-primary' : 'bg-secondary/40 text-muted-foreground',
              className
            )}
          >
            {esEstado ? <Pin className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
            {ETIQUETA[base]}
            <Info className="w-2.5 h-2.5 opacity-70" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-center text-[11px]">{DESCRIPCIONES[base]}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
