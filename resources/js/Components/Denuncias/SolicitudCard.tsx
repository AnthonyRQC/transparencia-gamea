import { Building2, CircleCheck, Clock, RotateCcw } from 'lucide-react';
import PlazoProgress from './PlazoProgress';
import { Badge } from '@/Components/ui/badge';

interface SolicitudArchivo {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface Solicitud {
  id: number;
  ticket: string;
  unidad_destino: string;
  detalle: string;
  fecha_envio: string;
  fecha_vencimiento: string;
  estado: string;
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
  archivos?: SolicitudArchivo[];
}

interface SolicitudCardProps {
  solicitud: Solicitud;
  canAct: boolean;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
}

const estadoBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pendiente: { label: 'Pendiente', variant: 'outline' },
  respondida: { label: 'Respondida', variant: 'default' },
  vencida: { label: 'Vencida', variant: 'destructive' },
  ampliada: { label: 'Ampliada', variant: 'secondary' },
};

function formatDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysAgo(d?: string): string {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return `Hace ${diff}d`;
}

export default function SolicitudCard({ solicitud, canAct, onResponder, onAmpliar }: SolicitudCardProps) {
  const badge = estadoBadge[solicitud.estado] || estadoBadge.pendiente;
  const isVencida = solicitud.estado === 'pendiente' && new Date(solicitud.fecha_vencimiento) < new Date();

  return (
    <div className="border border-border rounded-xl p-3 space-y-2 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{solicitud.unidad_destino}</p>
            <p className="text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-0.5" />
              Enviada {daysAgo(solicitud.fecha_envio)}
            </p>
          </div>
        </div>
        <Badge variant={isVencida ? 'destructive' : badge.variant} className="text-[10px] shrink-0">
          {isVencida ? 'Vencida' : badge.label}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2">{solicitud.detalle}</p>

      <div className="flex items-center justify-between">
        {solicitud.plazo_info ? (
          <PlazoProgress
            dias_restantes={solicitud.plazo_info.dias_restantes}
            color={solicitud.plazo_info.color}
            texto={solicitud.plazo_info.texto}
            fecha_vencimiento={solicitud.plazo_info.fecha_vencimiento}
          />
        ) : (
          <PlazoProgress
            dias_restantes={Math.ceil((new Date(solicitud.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
            color={
              new Date(solicitud.fecha_vencimiento) < new Date() ? 'red'
              : Math.ceil((new Date(solicitud.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) > 5 ? 'green'
              : 'yellow'
            }
            texto={
              new Date(solicitud.fecha_vencimiento) < new Date()
                ? `Vencida hace ${Math.abs(Math.ceil((new Date(solicitud.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d`
                : `Vence en ${Math.ceil((new Date(solicitud.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d`
            }
            fecha_vencimiento={solicitud.fecha_vencimiento}
          />
        )}

        {canAct && onResponder && solicitud.estado !== 'respondida' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onResponder(solicitud.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 text-green-700 text-[11px] font-semibold hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-300"
            >
              <CircleCheck className="w-3 h-3" />
              Responder
            </button>
            {solicitud.estado !== 'ampliada' && (
              <button
                type="button"
                onClick={() => onAmpliar?.(solicitud.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[11px] font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300"
              >
                <RotateCcw className="w-3 h-3" />
                Ampliar
              </button>
            )}
          </div>
        )}
      </div>

      {solicitud.archivos && solicitud.archivos.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <CircleCheck className="w-3 h-3 text-green-500" />
          {solicitud.archivos.length} archivo(s) recibido(s)
        </div>
      )}
    </div>
  );
}
