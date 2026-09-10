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

const labels: Record<string, string> = {
  green: 'en plazo',
  yellow: 'por vencer',
  red: 'vencido',
};

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
        ? `${plazo.dias_restantes} d ${labels[plazo.color]}`
        : plazo.dias_restantes === 0
          ? 'Vence hoy'
          : `Vencido hace ${Math.abs(plazo.dias_restantes)} días`}
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
          Vence el <strong>{formatearFechaLarga(plazo.fecha_vencimiento) ?? ''}</strong>
          {plazo.dias_restantes > 0 ? (
            <> — Quedan <strong>{plazo.dias_restantes} día{plazo.dias_restantes !== 1 ? 's' : ''}</strong></>
          ) : plazo.dias_restantes === 0 ? (
            <> — <strong>Vence hoy</strong></>
          ) : (
            <> — Vencido hace <strong>{Math.abs(plazo.dias_restantes)} día{Math.abs(plazo.dias_restantes) !== 1 ? 's' : ''}</strong></>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
