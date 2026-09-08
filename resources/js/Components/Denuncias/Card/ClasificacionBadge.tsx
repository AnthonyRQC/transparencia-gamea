import { usePage } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface ClasificacionBadgeProps {
  clasificacion: string | null | undefined;
  className?: string;
}

interface ClasificacionItem {
  id?: number | null;
  clave?: string | null;
  nombre?: string;
}

const config: Record<string, { className: string }> = {
  penal: {
    className: 'bg-pink-600/10 text-pink-800 border-pink-600/30 dark:bg-pink-600/20 dark:text-pink-300',
  },
  civil: {
    className: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground',
  },
  administrativo: {
    className: 'bg-amber-500/15 text-amber-900 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
  },
  sin_indicios: {
    className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  },
  medida_correctiva: {
    className: 'bg-teal-500/10 text-teal-800 border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300',
  },
  archivado: {
    className: 'bg-muted text-muted-foreground border-border',
  },
};

const DEFAULT_CLASS = 'bg-muted text-muted-foreground border-border';

export default function ClasificacionBadge({ clasificacion, className }: ClasificacionBadgeProps) {
  if (!clasificacion) return null;

  const props = usePage().props as Record<string, any>;
  const catalog = Array.isArray(props.clasificaciones) ? props.clasificaciones : [];
  const item = (catalog as ClasificacionItem[]).find((c) => c.clave === clasificacion);
  const label = item?.nombre || clasificacion;

  return (
    <Badge variant="outline" className={cn('text-[11px] font-semibold', config[clasificacion]?.className ?? DEFAULT_CLASS, className)}>
      {label}
    </Badge>
  );
}
