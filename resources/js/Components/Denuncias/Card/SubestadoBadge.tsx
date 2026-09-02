import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface SubestadoBadgeProps {
  subestado: string | null;
}

const config: Record<string, { label: string; className: string }> = {
  archivada: {
    label: 'Archivada',
    className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  },
};

export default function SubestadoBadge({ subestado }: SubestadoBadgeProps) {
  if (!subestado || !config[subestado]) return null;

  return (
    <Badge variant="outline" className={cn('text-[10px] font-medium px-1.5 py-0', config[subestado].className)}>
      {config[subestado].label}
    </Badge>
  );
}
