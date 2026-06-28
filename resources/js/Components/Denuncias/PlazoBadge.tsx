import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
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

export default function PlazoBadge({ plazo }: PlazoBadgeProps) {
  if (!plazo) return null;

  return (
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
        : `${labels[plazo.color]} (${Math.abs(plazo.dias_restantes)}d)`}
    </Badge>
  );
}
