import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface TipoDenunciaBadgeProps {
  tipo: string;
  className?: string;
}

const tipoConfig: Record<string, { label: string; color: string }> = {
  corrupcion: {
    label: 'Corrupción',
    color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
  },
  negacion: {
    label: 'Negación',
    color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
  },
  acompaniamiento: {
    label: 'Acompañamiento',
    color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
  },
  intervencion: {
    label: 'Intervención',
    color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
  },
};

export default function TipoDenunciaBadge({ tipo, className }: TipoDenunciaBadgeProps) {
  const config = tipoConfig[tipo] ?? { label: tipo, color: 'bg-gray-100 text-gray-800 border-gray-300' };

  return (
    <Badge variant="outline" className={cn('text-[11px] font-semibold', config.color, className)}>
      {config.label}
    </Badge>
  );
}
