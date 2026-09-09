import { usePage } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';
import type { SharedPageProps } from '@/types';

interface TipoDenunciaBadgeProps {
  tipo: string;
  categoria?: string;
  categoriaOtro?: string;
  className?: string;
}

const tipoConfig: Record<string, { label: string; color: string }> = {
  corrupcion: {
    label: 'Corrupción',
    color: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground',
  },
  negacion: {
    label: 'Negación',
    color: 'bg-amber-500/15 text-amber-900 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
  },
};

export default function TipoDenunciaBadge({ tipo, categoria, categoriaOtro, className }: TipoDenunciaBadgeProps) {
  const props = usePage().props as unknown as SharedPageProps & {
    categorias?: Record<string, string>;
  };
  const categorias = props.categorias || {};

  const config = tipoConfig[tipo] ?? { label: tipo, color: 'bg-muted text-muted-foreground border-border' };

  let catLabel: string | null = null;
  if (categoria) {
    if (categoria === 'otro') {
      catLabel = categoriaOtro || 'Otro';
    } else {
      catLabel = categorias[categoria] || categoria;
    }
  }

  return (
    <Badge variant="outline" className={cn('text-[11px] font-semibold', config.color, className)}>
      {config.label}
      {catLabel && <span className="font-normal opacity-70"> · {catLabel}</span>}
    </Badge>
  );
}
