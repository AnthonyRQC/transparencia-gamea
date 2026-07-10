import { Building2, CircleCheck, Clock, RotateCcw, XCircle, Pencil, Trash2 } from 'lucide-react';
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
  fecha_respuesta?: string;
  estado: string;
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
  archivos?: SolicitudArchivo[];
  ampliaciones?: Array<{ dias: number; justificacion: string; fecha: string; archivo?: unknown }>;
}

interface SolicitudCardProps {
  solicitud: Solicitud;
  canAct: boolean;
  onClick?: (solicitud: Solicitud) => void;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
  onCancelar?: (id: number) => void;
  onEditar?: (id: number) => void;
  onEliminar?: (id: number) => void;
}

const estadoBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pendiente: { label: 'Pendiente', variant: 'outline' },
  respondida: { label: 'Respondida', variant: 'default' },
  vencida: { label: 'Vencida', variant: 'destructive' },
  ampliada: { label: 'Ampliada', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'outline' },
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

export default function SolicitudCard({ solicitud, canAct, onClick, onResponder, onAmpliar, onCancelar, onEditar, onEliminar }: SolicitudCardProps) {
  const badge = estadoBadge[solicitud.estado] || estadoBadge.pendiente;
  const isVencida = solicitud.estado === 'pendiente' && new Date(solicitud.fecha_vencimiento) < new Date();
  const numAmpliaciones = solicitud.ampliaciones?.length || 0;
  const isCompletada = ['respondida', 'cancelada'].includes(solicitud.estado);

  return (
    <div
      className={`border border-border rounded-xl p-3 space-y-2 transition-colors cursor-pointer ${isCompletada ? 'opacity-60' : 'hover:bg-muted/20'}`}
      onClick={() => onClick?.(solicitud)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{solicitud.unidad_destino}</p>
            <p className="text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-0.5" />
              Enviada {daysAgo(solicitud.fecha_envio)}
              {solicitud.estado === 'respondida' && ` · Respondida ${solicitud.fecha_respuesta ? daysAgo(solicitud.fecha_respuesta) : ''}`}
            </p>
          </div>
        </div>
        <Badge variant={isVencida ? 'destructive' : badge.variant} className="text-[10px] shrink-0">
          {isVencida ? 'Vencida' : badge.label}
        </Badge>
      </div>

      <p className={`text-xs line-clamp-2 ${isCompletada ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{solicitud.detalle}</p>

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

        {canAct && !isCompletada && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onResponder && (
              <button
                type="button"
                onClick={() => onResponder(solicitud.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 text-green-700 text-[11px] font-semibold hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-300"
              >
                <CircleCheck className="w-3 h-3" />
                Responder
              </button>
            )}
            {onAmpliar && (
              <button
                type="button"
                onClick={() => onAmpliar(solicitud.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[11px] font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300"
              >
                <RotateCcw className="w-3 h-3" />
                Ampliar
              </button>
            )}
            {onCancelar && (
              <button
                type="button"
                onClick={() => onCancelar(solicitud.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400"
              >
                <XCircle className="w-3 h-3" />
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>

      {canAct && (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(solicitud.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-semibold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
          )}
          {onEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(solicitud.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar
            </button>
          )}
        </div>
      )}

      {numAmpliaciones > 0 && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          <RotateCcw className="w-3 h-3 inline mr-0.5" />
          Ampliada {numAmpliaciones} vez/veces
        </p>
      )}

      {false && solicitud.archivos && solicitud.archivos.length > 0 && (
        <></>
      )}
    </div>
  );
}
