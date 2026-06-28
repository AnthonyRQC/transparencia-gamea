import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface ClasificacionBadgeProps {
  clasificacion: string | null | undefined;
  className?: string;
}

const config: Record<string, { label: string; className: string }> = {
  penal: {
    label: 'Penal',
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
  },
  civil: {
    label: 'Civil',
    className: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
  },
  administrativo: {
    label: 'Administrativo',
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
  },
  sin_indicios: {
    label: 'Sin Indicios',
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
  },
  medida_correctiva: {
    label: 'Medida Correctiva',
    className: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
  },
  archivado: {
    label: 'Archivado',
    className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  },
};

export default function ClasificacionBadge({ clasificacion, className }: ClasificacionBadgeProps) {
  if (!clasificacion || !config[clasificacion]) return null;

  return (
    <Badge variant="outline" className={cn('text-[11px] font-semibold', config[clasificacion].className, className)}>
      {config[clasificacion].label}
    </Badge>
  );
}
