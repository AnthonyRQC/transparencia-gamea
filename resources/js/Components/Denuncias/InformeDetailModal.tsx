import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Separator } from '@/Components/ui/separator';
import { FileText, Archive, History, ChevronDown, ChevronRight, Clock, User } from 'lucide-react';
import ClasificacionBadge from './ClasificacionBadge';
import ArchivoAdjunto from './ArchivoAdjunto';

interface ArchivoSimulado {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface InformeDetailModalProps {
  denuncia: {
    ticket: string;
    informe_clasificacion?: string | null;
    informe_fojas?: number | null;
    informe_justificacion?: string | null;
    informe_archivos?: ArchivoSimulado[];
    informe_redactado_at?: string | null;
    informe_concluido_por?: string | null;
    cierre_sitpreco?: string | null;
    cierre_notificado_denunciante?: boolean | null;
    cierre_notificacion_medio?: string | null;
    cierre_notificacion_fecha?: string | null;
    cierre_notificacion_descripcion?: string | null;
    cierre_no_notificado_motivo?: string | null;
    cierre_concluido_por?: string | null;
    cierre_descripcion?: string | null;
    cierre_archivos?: ArchivoSimulado[];
    cierre_cerrado_at?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InformeDetailModal({ denuncia, open, onOpenChange }: InformeDetailModalProps) {
  const [showHistorial, setShowHistorial] = useState(false);
  const [showCierre, setShowCierre] = useState(false);

  const informeRedactado = denuncia.informe_redactado_at || denuncia.informe_clasificacion;
  const cierreRegistrado = denuncia.cierre_cerrado_at;

  if (!informeRedactado) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap pr-6">
            <DialogTitle className="font-mono">{denuncia.ticket}</DialogTitle>
            {denuncia.informe_clasificacion && <ClasificacionBadge clasificacion={denuncia.informe_clasificacion} />}
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Informe Final */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Informe Final
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Clasificación:</span>
                <p className="font-medium">{denuncia.informe_clasificacion || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fojas:</span>
                <p className="font-medium">{denuncia.informe_fojas || '—'}</p>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Redactado por:</span>
                <span className="font-medium">{denuncia.informe_concluido_por || '—'}</span>
              </div>
              {denuncia.informe_redactado_at && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">
                    {new Date(denuncia.informe_redactado_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
            {denuncia.informe_justificacion && (
              <div className="mt-3">
                <h5 className="text-xs font-semibold text-muted-foreground mb-1">Justificación</h5>
                <p className="text-sm bg-muted/50 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">{denuncia.informe_justificacion}</p>
              </div>
            )}
            {denuncia.informe_archivos && denuncia.informe_archivos.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-semibold text-muted-foreground mb-1">Archivos ({denuncia.informe_archivos.length})</h5>
                <div className="space-y-1">
                  {denuncia.informe_archivos.map((a, i) => (
                    <ArchivoAdjunto key={i} nombre={a.nombre} tamano={a.tamano} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {cierreRegistrado && (
            <>
              <Separator />
              <section>
                <button
                  type="button"
                  onClick={() => setShowCierre(!showCierre)}
                  className="w-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {showCierre ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <Archive className="w-3.5 h-3.5" />
                  Cierre {!showCierre && '(click para expandir)'}
                </button>
                {showCierre && (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">SITPRECO:</span>
                        <p className="font-mono text-xs font-medium">{denuncia.cierre_sitpreco || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Concluido por:</span>
                        <p className="font-medium">{denuncia.cierre_concluido_por || '—'}</p>
                      </div>
                    </div>
                    {denuncia.cierre_cerrado_at && (
                      <p className="text-xs text-muted-foreground">
                        Cerrado: {new Date(denuncia.cierre_cerrado_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground mb-1">Notificación</h5>
                      <div className="text-sm bg-muted/50 rounded-lg px-3 py-2">
                        {denuncia.cierre_notificado_denunciante ? (
                          <div className="space-y-1">
                            <p>Notificado por <span className="font-medium">{denuncia.cierre_notificacion_medio || '—'}</span></p>
                            {denuncia.cierre_notificacion_fecha && <p>Fecha: {new Date(denuncia.cierre_notificacion_fecha).toLocaleDateString('es-BO')}</p>}
                            {denuncia.cierre_notificacion_descripcion && <p className="text-muted-foreground">{denuncia.cierre_notificacion_descripcion}</p>}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="italic text-muted-foreground">No se notificó al denunciante.</p>
                            {denuncia.cierre_no_notificado_motivo && <p className="text-muted-foreground">Motivo: {denuncia.cierre_no_notificado_motivo}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                    {denuncia.cierre_descripcion && (
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground mb-1">Descripción del cierre</h5>
                        <p className="text-sm bg-muted/50 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">{denuncia.cierre_descripcion}</p>
                      </div>
                    )}
                    {denuncia.cierre_archivos && denuncia.cierre_archivos.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground mb-1">Archivos ({denuncia.cierre_archivos.length})</h5>
                        <div className="space-y-1">
                          {denuncia.cierre_archivos.map((a, i) => (
                            <ArchivoAdjunto key={i} nombre={a.nombre} tamano={a.tamano} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
