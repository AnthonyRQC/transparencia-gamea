import { Badge } from '@/Components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatearFechaLarga } from '@/helpers/fechas';
import { PLAZO_COLOR as colorStyles } from '../Shared/semantica';

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
  fecha_vencimiento?: string;
}

interface PlazoBadgeProps {
  plazo: PlazoInfo | null;
}

function quedanTexto(dias: number): string {
  return dias === 1 ? 'Queda 1 día hábil' : `Quedan ${dias} días hábiles`;
}

function vencidoTexto(dias: number): string {
  const abs = Math.abs(dias);
  return abs === 1 ? 'Vencido hace 1 día hábil' : `Vencido hace ${abs} días hábiles`;
}

export default function PlazoBadge({ plazo }: PlazoBadgeProps) {
  if (!plazo) return null;

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        'text-[11px] font-semibold px-2 py-0.5 whitespace-nowrap',
        colorStyles[plazo.color]
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block shrink-0 bg-current" />
      {plazo.dias_restantes > 0
        ? quedanTexto(plazo.dias_restantes)
        : plazo.dias_restantes === 0
          ? 'Vence hoy'
          : vencidoTexto(plazo.dias_restantes)}
    </Badge>
  );

  if (!plazo.fecha_vencimiento) return badgeContent;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>{badgeContent}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
          {plazo.dias_restantes > 0 ? (
            <>Vence el <strong>{formatearFechaLarga(plazo.fecha_vencimiento) ?? ''}</strong> — {quedanTexto(plazo.dias_restantes)}</>
          ) : plazo.dias_restantes === 0 ? (
            <>Vence el <strong>{formatearFechaLarga(plazo.fecha_vencimiento) ?? ''}</strong> — hoy es el último día</>
          ) : (
            <>Venció el <strong>{formatearFechaLarga(plazo.fecha_vencimiento) ?? ''}</strong> — {vencidoTexto(plazo.dias_restantes)}</>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
