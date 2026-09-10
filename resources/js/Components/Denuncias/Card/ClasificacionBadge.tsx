import { usePage } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';
import type { SharedPageProps } from '@/types';
import { CLASIFICACION_COLOR as config, DEFAULT_CLASIFICACION_COLOR as DEFAULT_CLASS } from '../Shared/semantica';

interface ClasificacionBadgeProps {
  clasificacion: string | null | undefined;
  className?: string;
}

interface ClasificacionItem {
  id?: number | null;
  clave?: string | null;
  nombre?: string;
}

export default function ClasificacionBadge({ clasificacion, className }: ClasificacionBadgeProps) {
  if (!clasificacion) return null;

  const props = usePage().props as unknown as SharedPageProps & {
    clasificaciones?: ClasificacionItem[];
  };
  const catalog = Array.isArray(props.clasificaciones) ? props.clasificaciones : [];
  const item = (catalog as ClasificacionItem[]).find((c) => c.clave === clasificacion);
  const label = item?.nombre || clasificacion;

  return (
    <Badge variant="outline" className={cn('text-[11px] font-semibold', config[clasificacion] ?? DEFAULT_CLASS, className)}>
      {label}
    </Badge>
  );
}
