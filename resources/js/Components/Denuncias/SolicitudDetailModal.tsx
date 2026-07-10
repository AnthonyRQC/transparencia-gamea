import { Building2, Clock, RotateCcw, XCircle, CircleCheck, FileText, History, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import PlazoProgress from './PlazoProgress';

interface SolicitudAmpliacion {
  dias: number;
  justificacion: string;
  fecha: string;
  archivo?: unknown;
}

interface SolicitudEdicion {
  fecha: string;
  campo: string;
  anterior?: unknown;
  nuevo?: unknown;
}

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
  plazo_dias?: number;
  fecha_envio: string;
  fecha_vencimiento: string;
  fecha_respuesta?: string;
  respuesta?: string;
  archivos?: SolicitudArchivo[];
  estado: string;
  ampliaciones?: SolicitudAmpliacion[];
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
  motivo_cancelacion?: string;
  fecha_cancelacion?: string;
  ediciones?: SolicitudEdicion[];
}

interface SolicitudDetailModalProps {
  solicitud: Solicitud | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canAct: boolean;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
  onCancelar?: (id: number) => void;
  onEditar?: (id: number) => void;
  onEliminar?: (id: number) => void;
}

function formatDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateTime(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const estadoBadgeVar: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pendiente: { label: 'Pendiente', variant: 'outline' },
  respondida: { label: 'Respondida', variant: 'default' },
  vencida: { label: 'Vencida', variant: 'destructive' },
  ampliada: { label: 'Ampliada', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'outline' },
};

export default function SolicitudDetailModal({
  solicitud, open, onOpenChange, canAct,
  onResponder, onAmpliar, onCancelar, onEditar, onEliminar,
}: SolicitudDetailModalProps) {
  const [historialOpen, setHistorialOpen] = useState(false);

  if (!solicitud) return null;

  const badge = estadoBadgeVar[solicitud.estado] || estadoBadgeVar.pendiente;
  const isVencida = solicitud.estado === 'pendiente' && new Date(solicitud.fecha_vencimiento) < new Date();
  const isCompletada = ['respondida', 'cancelada'].includes(solicitud.estado);
  const ampliaciones = solicitud.ampliaciones || [];
  const ediciones = [...(solicitud.ediciones || [])].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const campoLabel: Record<string, string> = {
    unidad_destino: 'Unidad destino',
    detalle: 'Detalle',
    plazo_dias: 'Plazo (días hábiles)',
    nombres_denunciado: 'Nombres',
    dependencia_denunciado: 'Dependencia',
  };

  const countAmplDias = ampliaciones.reduce((sum, a) => sum + a.dias, 0);
  const plazoOriginal = solicitud.plazo_dias || 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-5 h-5 text-primary shrink-0" />
              <DialogTitle className="truncate text-lg">{solicitud.unidad_destino}</DialogTitle>
            </div>
            <Badge variant={isVencida ? 'destructive' : badge.variant} className="text-[11px] shrink-0">
              {isVencida ? 'Vencida' : badge.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDateTime(solicitud.fecha_envio)}</span>
            {solicitud.fecha_respuesta && (
              <span className="flex items-center gap-1"><CircleCheck className="w-3 h-3 text-green-500" /> {formatDateTime(solicitud.fecha_respuesta)}</span>
            )}
            {solicitud.fecha_cancelacion && (
              <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> {formatDateTime(solicitud.fecha_cancelacion)}</span>
            )}
          </div>

          {solicitud.plazo_info ? (
            <PlazoProgress {...solicitud.plazo_info} />
          ) : (
            <PlazoProgress
              dias_restantes={Math.ceil((new Date(solicitud.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
              color={isVencida ? 'red' : 'green'}
              texto={isVencida ? 'Vencida' : 'Pendiente'}
              fecha_vencimiento={solicitud.fecha_vencimiento}
            />
          )}

          <div className="text-[11px] text-muted-foreground flex items-center gap-3">
            <span>Plazo original: <strong>{plazoOriginal}d hábiles</strong></span>
            {countAmplDias > 0 && <span>Ampliado: <strong>+{countAmplDias}d hábiles</strong></span>}
            <span>Vence: <strong>{formatDate(solicitud.fecha_vencimiento)}</strong></span>
          </div>

          <Separator />

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Detalle</h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{solicitud.detalle}</p>
          </section>

          {solicitud.respuesta && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <CircleCheck className="w-3.5 h-3.5 text-green-500" />
                  Respuesta recibida
                </h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words bg-muted/30 rounded-lg px-3 py-2">{solicitud.respuesta}</p>
              </section>
            </>
          )}

          {solicitud.motivo_cancelacion && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  Motivo de cancelación
                </h4>
                <p className="text-sm leading-relaxed break-words bg-muted/30 rounded-lg px-3 py-2">{solicitud.motivo_cancelacion}</p>
              </section>
            </>
          )}

          {false && solicitud.archivos && solicitud.archivos.length > 0 && (
            <></>
          )}

          {ampliaciones.length > 0 && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  Ampliaciones ({ampliaciones.length})
                </h4>
                <div className="space-y-2">
                  {[...ampliaciones].reverse().map((a, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg px-3 py-2 text-sm space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-amber-600 dark:text-amber-400">+{a.dias} días</span>
                        <span>{formatDateTime(a.fecha)}</span>
                      </div>
                      <p className="text-xs">{a.justificacion}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          <Separator />

          <div className="flex items-center gap-2 flex-wrap">
            {canAct && !isCompletada && solicitud.estado !== 'vencida' && (
              <>
                {onResponder && (
                  <button type="button" onClick={() => onResponder(solicitud.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-300">
                    <CircleCheck className="w-3.5 h-3.5" /> Responder
                  </button>
                )}
                {onAmpliar && (
                  <button type="button" onClick={() => onAmpliar(solicitud.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300">
                    <RotateCcw className="w-3.5 h-3.5" /> Ampliar
                  </button>
                )}
                {onCancelar && (
                  <button type="button" onClick={() => onCancelar(solicitud.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400">
                    <XCircle className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
              </>
            )}
            {canAct && (
              <>
                {onEditar && (
                  <button type="button" onClick={() => onEditar(solicitud.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300">
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                )}
                {onEliminar && (
                  <button type="button" onClick={() => onEliminar(solicitud.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                )}
              </>
            )}
          </div>

          {ediciones.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setHistorialOpen(!historialOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full text-left"
              >
                {historialOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <History className="w-3.5 h-3.5" />
                Historial de cambios ({ediciones.length})
              </button>
              {historialOpen && (
                <div className="mt-2 space-y-1.5">
                  {ediciones.map((e, i) => (
                    <div key={i} className="text-xs bg-muted/30 rounded-lg px-3 py-2 space-y-0.5">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="font-medium">{campoLabel[e.campo] || e.campo}</span>
                        <span>{formatDateTime(e.fecha)}</span>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="line-through">{String(e.anterior ?? '—')}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium text-foreground">{String(e.nuevo ?? '—')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
