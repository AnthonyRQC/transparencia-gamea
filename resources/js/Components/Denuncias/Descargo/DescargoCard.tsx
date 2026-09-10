import { CircleCheck, Bell, RotateCcw, FileText, Pencil, Trash2, XCircle } from 'lucide-react';
import { formatearFechaCorta } from '@/helpers/fechas';
import PlazoProgress from '../Card/PlazoProgress';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';

interface DescargoDocumento {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface Descargo {
  id: number;
  ticket: string;
  denunciado_idx: number;
  nombres_denunciado: string;
  dependencia_denunciado?: string;
  fecha_notificacion?: string | null;
  medio?: string | null;
  fecha_vencimiento?: string | null;
  estado: string;
  resumen_descargo?: string | null;
  documentos?: DescargoDocumento[];
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
}

interface DescargoCardProps {
  descargo: Descargo;
  canAct: boolean;
  onClick?: (descargo: Descargo) => void;
  onNotificar?: (id: number) => void;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
  onEditar?: (id: number) => void;
  onEliminar?: (id: number) => void;
  onCancelar?: (id: number) => void;
}

const estadoBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pendiente_notif: { label: 'Pendiente de notificar', variant: 'outline' },
  notificado: { label: 'Notificado', variant: 'secondary' },
  respondido: { label: 'Respondido', variant: 'default' },
  vencido: { label: 'Vencido', variant: 'destructive' },
  ampliado: { label: 'Ampliado', variant: 'secondary' },
  cancelado: { label: 'Cancelado', variant: 'outline' },
};

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function DescargoCard({ descargo, canAct, onClick, onNotificar, onResponder, onAmpliar, onEditar, onEliminar, onCancelar }: DescargoCardProps) {
  const badge = estadoBadge[descargo.estado] || estadoBadge.pendiente_notif;
  const isVencido = descargo.estado === 'notificado' && descargo.fecha_vencimiento && new Date(descargo.fecha_vencimiento) < new Date();

  return (
    <div
      className="border border-border rounded-xl p-3 space-y-2 hover:bg-muted/20 transition-colors cursor-pointer"
      onClick={() => onClick?.(descargo)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
              {getInitials(descargo.nombres_denunciado)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{descargo.nombres_denunciado}</p>
            {descargo.dependencia_denunciado && (
              <p className="text-[11px] text-muted-foreground truncate">{descargo.dependencia_denunciado}</p>
            )}
          </div>
        </div>
        <Badge variant={isVencido ? 'destructive' : badge.variant} className="text-[10px] shrink-0">
          {isVencido ? 'Vencido' : badge.label}
        </Badge>
      </div>

      {descargo.fecha_notificacion && (
        <p className="text-[11px] text-muted-foreground">
          Notificado: {formatearFechaCorta(descargo.fecha_notificacion) ?? ''}
          {descargo.medio ? ` Â· ${descargo.medio}` : ''}
        </p>
      )}

      {descargo.resumen_descargo && (
        <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 rounded-lg px-2 py-1.5">
          {descargo.resumen_descargo}
        </p>
      )}

      <div className="flex items-center justify-between">
        {(descargo.fecha_vencimiento && descargo.estado !== 'pendiente_notif') ? (
          descargo.plazo_info ? (
            <PlazoProgress
              dias_restantes={descargo.plazo_info.dias_restantes}
              color={descargo.plazo_info.color}
              texto={descargo.plazo_info.texto}
              fecha_vencimiento={descargo.plazo_info.fecha_vencimiento}
            />
          ) : (
            <span className="text-[11px] text-muted-foreground italic">Sin plazo</span>
          )
        ) : (
          <span className="text-[11px] text-muted-foreground italic">Pendiente de notificación</span>
        )}

      </div>

      {canAct && (
        <div className="pt-2.5 border-t border-border/50 space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
          {(onNotificar || onResponder || onAmpliar || onCancelar) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase text-muted-foreground shrink-0">⚖️ Trámite:</span>
              {descargo.estado === 'pendiente_notif' && onNotificar && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onNotificar(descargo.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold hover:bg-primary/20 transition-colors dark:bg-primary/20 dark:text-primary-foreground cursor-pointer"
                      >
                        <Bell className="w-3 h-3" />
                        Notificar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Registrar la notificación realizada al denunciado.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {descargo.estado !== 'pendiente_notif' && descargo.estado !== 'respondido' && onResponder && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onResponder(descargo.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/10 text-teal-800 border border-teal-500/30 text-[11px] font-semibold hover:bg-teal-500/20 transition-colors dark:bg-teal-500/20 dark:text-teal-300 cursor-pointer"
                      >
                        <CircleCheck className="w-3 h-3" />
                        Responder
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Registrar la recepción del descargo o justificativo presentado.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {descargo.estado === 'notificado' && onAmpliar && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onAmpliar(descargo.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 text-amber-900 border border-amber-500/30 text-[11px] font-semibold hover:bg-amber-500/25 transition-colors dark:bg-amber-500/20 dark:text-amber-300 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Ampliar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Ampliar el plazo legal para la presentación de descargos.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {descargo.estado !== 'respondido' && descargo.estado !== 'cancelado' && onCancelar && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onCancelar(descargo.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-600/10 text-pink-800 border border-pink-600/30 text-[11px] font-semibold hover:bg-pink-600/20 transition-colors dark:bg-pink-600/20 dark:text-pink-300 cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancelar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Anular o dejar sin efecto el trámite de descargo.</TooltipContent>
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
                        onClick={() => onEditar(descargo.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Modificar datos del descargo.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {onEliminar && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onEliminar(descargo.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Eliminar registro de descargo.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      )}

      {descargo.documentos && descargo.documentos.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <FileText className="w-3 h-3 text-blue-500" />
          {descargo.documentos.length} documento(s) adjunto(s)
        </div>
      )}
    </div>
  );
}

