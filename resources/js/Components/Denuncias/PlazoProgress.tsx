import { Progress } from '@/Components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';

interface PlazoProgressProps {
  dias_restantes?: number;
  color?: string;
  texto?: string;
  fecha_vencimiento?: string;
  maxDias?: number;
}

export default function PlazoProgress({ dias_restantes, color, texto, fecha_vencimiento, maxDias = 10 }: PlazoProgressProps) {
  if (!dias_restantes !== undefined && !texto) return null;

  const barColor = color === 'red'
    ? 'bg-red-500'
    : color === 'green'
      ? 'bg-green-500'
      : 'bg-yellow-500';

  const progressVal = color === 'red'
    ? 100
    : dias_restantes !== undefined
      ? Math.min(Math.max(((maxDias - Math.max(0, dias_restantes)) / maxDias) * 100, 0), 100)
      : 0;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help w-32">
            <span className={`text-[11px] font-semibold whitespace-nowrap ${
              color === 'red' ? 'text-red-600 dark:text-red-400'
              : color === 'green' ? 'text-green-600 dark:text-green-400'
              : 'text-amber-600 dark:text-amber-400'
            }`}>
              {texto || ''}
            </span>
            <div className="flex-1">
              <Progress value={progressVal} className={`h-1.5 [&>div]:${barColor}`} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px]">
          {fecha_vencimiento ? `Vence: ${fecha_vencimiento}` : texto || ''}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
