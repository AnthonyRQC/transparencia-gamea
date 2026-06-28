import { CircleCheck, Bell, RotateCcw, FileText, Pencil, Trash2 } from 'lucide-react';
import PlazoProgress from './PlazoProgress';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';

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
}

const estadoBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pendiente_notif: { label: 'Pendiente de notificar', variant: 'outline' },
  notificado: { label: 'Notificado', variant: 'secondary' },
  respondido: { label: 'Respondido', variant: 'default' },
  vencido: { label: 'Vencido', variant: 'destructive' },
  ampliado: { label: 'Ampliado', variant: 'secondary' },
};

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DescargoCard({ descargo, canAct, onClick, onNotificar, onResponder, onAmpliar, onEditar, onEliminar }: DescargoCardProps) {
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
          Notificado: {formatDate(descargo.fecha_notificacion)}
          {descargo.medio ? ` · ${descargo.medio}` : ''}
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
            <PlazoProgress
              dias_restantes={Math.ceil((new Date(descargo.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
              color={
                new Date(descargo.fecha_vencimiento) < new Date() ? 'red'
                : Math.ceil((new Date(descargo.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) > 5 ? 'green'
                : 'yellow'
              }
              texto={
                new Date(descargo.fecha_vencimiento) < new Date()
                  ? `Vencido hace ${Math.abs(Math.ceil((new Date(descargo.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d`
                  : `Vence en ${Math.ceil((new Date(descargo.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d`
              }
              fecha_vencimiento={descargo.fecha_vencimiento}
            />
          )
        ) : (
          <span className="text-[11px] text-muted-foreground italic">Pendiente de notificación</span>
        )}

        {canAct && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {descargo.estado === 'pendiente_notif' && onNotificar && (
              <button
                type="button"
                onClick={() => onNotificar(descargo.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-semibold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300"
              >
                <Bell className="w-3 h-3" />
                Notificar
              </button>
            )}
            {descargo.estado !== 'pendiente_notif' && descargo.estado !== 'respondido' && onResponder && (
              <button
                type="button"
                onClick={() => onResponder(descargo.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 text-green-700 text-[11px] font-semibold hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-300"
              >
                <CircleCheck className="w-3 h-3" />
                Responder
              </button>
            )}
            {descargo.estado === 'notificado' && onAmpliar && (
              <button
                type="button"
                onClick={() => onAmpliar(descargo.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[11px] font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300"
              >
                <RotateCcw className="w-3 h-3" />
                Ampliar
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
              onClick={() => onEditar(descargo.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-semibold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
          )}
          {onEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(descargo.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar
            </button>
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
