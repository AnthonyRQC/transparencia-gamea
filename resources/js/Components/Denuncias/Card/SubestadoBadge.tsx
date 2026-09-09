import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface SubestadoBadgeProps {
  subestado: string | null;
}

const config: Record<string, { label: string; className: string }> = {
  archivada: {
    label: 'Archivada',
    className: 'bg-muted text-muted-foreground border-border',
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
