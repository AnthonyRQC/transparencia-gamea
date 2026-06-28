import { Badge } from '@/Components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
  fecha_vencimiento?: string;
}

interface PlazoBadgeProps {
  plazo: PlazoInfo | null;
}

const colorStyles: Record<string, string> = {
  green: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
  red: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
};

const labels: Record<string, string> = {
  green: 'En tiempo',
  yellow: 'Por vencer',
  red: 'Vencido',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
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
        ? `${plazo.dias_restantes}d ${labels[plazo.color]}`
        : plazo.dias_restantes === 0
          ? 'Vence hoy'
          : `Vencida hace ${Math.abs(plazo.dias_restantes)}d`}
    </Badge>
  );

  if (!plazo.fecha_vencimiento) return badgeContent;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
          Vence el <strong>{formatDate(plazo.fecha_vencimiento)}</strong>
          {plazo.dias_restantes >= 0 && (
            <> — Quedan <strong>{plazo.dias_restantes} día{plazo.dias_restantes !== 1 ? 's' : ''}</strong></>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
