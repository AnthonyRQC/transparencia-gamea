import { User, Building2, Clock, Bell, RotateCcw, CircleCheck, FileText, History, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import PlazoProgress from './PlazoProgress';
import ArchivoAdjunto from './ArchivoAdjunto';

interface DescargoAmpliacion {
  dias: number;
  justificacion: string;
  fecha: string;
}

interface DescargoEdicion {
  fecha: string;
  campo: string;
  anterior?: unknown;
  nuevo?: unknown;
}

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
  respaldo_archivo?: { nombre: string; tamano?: string } | null;
  fecha_vencimiento?: string | null;
  fecha_respuesta?: string | null;
  resumen_descargo?: string | null;
  documentos?: DescargoDocumento[];
  estado: string;
  ampliaciones?: DescargoAmpliacion[];
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
  ediciones?: DescargoEdicion[];
}

interface DescargoDetailModalProps {
  descargo: Descargo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canAct: boolean;
  onNotificar?: (id: number) => void;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
  onEditar?: (id: number) => void;
  onEliminar?: (id: number) => void;
  onCancelar?: (id: number) => void;
}

const MEDIOS_LABEL: Record<string, string> = {
  personal: 'Notificación Personal',
  cedula: 'Cédula de Notificación',
  email: 'Correo Electrónico',
  otro: 'Otro Medio',
};

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

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const estadoBadgeVar: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pendiente_notif: { label: 'Pendiente de notificar', variant: 'outline' },
  notificado: { label: 'Notificado', variant: 'secondary' },
  respondido: { label: 'Respondido', variant: 'default' },
  vencido: { label: 'Vencido', variant: 'destructive' },
  ampliado: { label: 'Ampliado', variant: 'secondary' },
  cancelado: { label: 'Cancelado', variant: 'outline' },
};

export default function DescargoDetailModal({
  descargo, open, onOpenChange, canAct,
  onNotificar, onResponder, onAmpliar, onEditar, onEliminar, onCancelar,
}: DescargoDetailModalProps) {
  const [historialOpen, setHistorialOpen] = useState(false);

  if (!descargo) return null;

  const badge = estadoBadgeVar[descargo.estado] || estadoBadgeVar.pendiente_notif;
  const isVencido = descargo.estado === 'notificado' && descargo.fecha_vencimiento && new Date(descargo.fecha_vencimiento) < new Date();
  const ampliaciones = descargo.ampliaciones || [];
  const ediciones = [...(descargo.ediciones || [])].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const campoLabel: Record<string, string> = {
    nombres_denunciado: 'Nombres',
    dependencia_denunciado: 'Dependencia',
    unidad_destino: 'Unidad destino',
    detalle: 'Detalle',
    plazo_dias: 'Plazo (días)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                  {getInitials(descargo.nombres_denunciado)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <DialogTitle className="truncate text-lg">{descargo.nombres_denunciado}</DialogTitle>
                {descargo.dependencia_denunciado && (
                  <p className="text-xs text-muted-foreground">{descargo.dependencia_denunciado}</p>
                )}
              </div>
            </div>
            <Badge variant={isVencido ? 'destructive' : badge.variant} className="text-[11px] shrink-0">
              {isVencido ? 'Vencido' : badge.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {descargo.fecha_notificacion && (
              <span className="flex items-center gap-1"><Bell className="w-3 h-3" /> {formatDateTime(descargo.fecha_notificacion)}</span>
            )}
            {descargo.fecha_respuesta && (
              <span className="flex items-center gap-1"><CircleCheck className="w-3 h-3 text-green-500" /> {formatDateTime(descargo.fecha_respuesta)}</span>
            )}
          </div>

          {descargo.estado !== 'pendiente_notif' && descargo.fecha_vencimiento && (
            descargo.plazo_info ? (
              <PlazoProgress {...descargo.plazo_info} />
            ) : (
              <PlazoProgress
                dias_restantes={Math.ceil((new Date(descargo.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                color={isVencido ? 'red' : 'green'}
                texto={isVencido ? 'Vencido' : 'Pendiente'}
                fecha_vencimiento={descargo.fecha_vencimiento}
              />
            )
          )}

          {descargo.estado === 'pendiente_notif' && (
            <p className="text-xs text-muted-foreground italic">Pendiente de notificación — no hay plazo activo</p>
          )}

          <Separator />

          {descargo.fecha_notificacion && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-blue-500" />
                Notificación
              </h4>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Fecha:</span> {formatDate(descargo.fecha_notificacion)}</p>
                {descargo.medio && <p><span className="text-muted-foreground">Medio:</span> {MEDIOS_LABEL[descargo.medio] || descargo.medio}</p>}
                {descargo.respaldo_archivo && (
                  <div className="mt-2">
                    <ArchivoAdjunto nombre={descargo.respaldo_archivo.nombre} tamano={descargo.respaldo_archivo.tamano} />
                  </div>
                )}
              </div>
            </section>
          )}

          {descargo.resumen_descargo && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-green-500" />
                  Resumen del descargo
                </h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words bg-muted/30 rounded-lg px-3 py-2">{descargo.resumen_descargo}</p>
              </section>
            </>
          )}

          {descargo.documentos && descargo.documentos.length > 0 && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Documentos del descargo ({descargo.documentos.length})
                </h4>
                <div className="space-y-1">
                  {descargo.documentos.map((d, i) => (
                    <ArchivoAdjunto key={i} nombre={d.nombre} tamano={d.tamano} />
                  ))}
                </div>
              </section>
            </>
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
            {canAct && (
              <>
                {descargo.estado === 'pendiente_notif' && onNotificar && (
                  <button type="button" onClick={() => onNotificar(descargo.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300">
                    <Bell className="w-3.5 h-3.5" /> Notificar
                  </button>
                )}
                {descargo.estado !== 'pendiente_notif' && descargo.estado !== 'respondido' && onResponder && (
                  <button type="button" onClick={() => onResponder(descargo.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-300">
                    <CircleCheck className="w-3.5 h-3.5" /> Responder
                  </button>
                )}
                {descargo.estado === 'notificado' && onAmpliar && (
                  <button type="button" onClick={() => onAmpliar(descargo.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300">
                    <RotateCcw className="w-3.5 h-3.5" /> Ampliar
                  </button>
                )}
                {descargo.estado !== 'respondido' && descargo.estado !== 'cancelado' && onCancelar && (
                  <button type="button" onClick={() => onCancelar(descargo.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
                <>
                  {onEditar && (
                    <button type="button" onClick={() => onEditar(descargo.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300">
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>
                  )}
                  {onEliminar && (
                    <button type="button" onClick={() => onEliminar(descargo.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  )}
                </>
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
