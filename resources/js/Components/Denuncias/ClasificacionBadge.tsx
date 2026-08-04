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
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
  },
  civil: {
    className: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
  },
  administrativo: {
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
  },
  sin_indicios: {
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
  },
  medida_correctiva: {
    className: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
  },
  archivado: {
    className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
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
