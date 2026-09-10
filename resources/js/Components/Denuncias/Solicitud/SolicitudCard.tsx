import { Building2, CircleCheck, Clock, RotateCcw, XCircle, Pencil, Trash2 } from 'lucide-react';
import PlazoProgress from '../Card/PlazoProgress';
import { Badge } from '@/Components/ui/badge';
import { BOTON_CANCELAR_CARD, SOLICITUD_ESTADO as estadoBadge } from '../Shared/semantica';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';

interface SolicitudArchivo {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface Solicitud {
  id: number;
  ticket: string;
  dependencia_destino: string;
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
            <p className="text-sm font-semibold truncate">{solicitud.dependencia_destino}</p>
            <p className="text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-0.5" />
              Enviada {daysAgo(solicitud.fecha_envio)}
              {solicitud.estado === 'respondida' && ` Â· Respondida ${solicitud.fecha_respuesta ? daysAgo(solicitud.fecha_respuesta) : ''}`}
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
          <p className="text-[11px] text-muted-foreground italic">Sin plazo</p>
        )}

      </div>

      {canAct && (
        <div className="pt-2.5 border-t border-border/50 space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
          {!isCompletada && (onResponder || onAmpliar || onCancelar) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase text-muted-foreground shrink-0">📋 Trámite:</span>
              {onResponder && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onResponder(solicitud.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/10 text-teal-800 border border-teal-500/30 text-[11px] font-semibold hover:bg-teal-500/20 transition-colors dark:bg-teal-500/20 dark:text-teal-300 cursor-pointer"
                      >
                        <CircleCheck className="w-3 h-3" />
                        Responder
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Registrar la respuesta enviada por la unidad.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {onAmpliar && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onAmpliar(solicitud.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 text-amber-900 border border-amber-500/30 text-[11px] font-semibold hover:bg-amber-500/25 transition-colors dark:bg-amber-500/20 dark:text-amber-300 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Ampliar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Ampliar el plazo de respuesta de la solicitud.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {onCancelar && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onCancelar(solicitud.id)}
                        className={BOTON_CANCELAR_CARD}
                      >
                        <XCircle className="w-3 h-3" />
                        Cancelar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Anular o dejar sin efecto esta solicitud.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          {(onEditar || onEliminar) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase text-muted-foreground shrink-0">⚙️ Gestión:</span>
              {onEditar && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onEditar(solicitud.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Modificar datos de la solicitud.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {onEliminar && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onEliminar(solicitud.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Eliminar registro de solicitud.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      )}

      {numAmpliaciones > 0 && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          <RotateCcw className="w-3 h-3 inline mr-0.5" />
          Ampliada {numAmpliaciones} vez/veces
        </p>
      )}

    </div>
  );
}

