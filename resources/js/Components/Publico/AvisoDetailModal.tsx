import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { FileText, Pin } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { formatearFechaCorta, formatearFechaLarga } from '@/helpers/fechas';
import { EVENTO_CASO_LABEL, PRIORIDAD_PUBLICACION_COLOR } from '@/Components/Denuncias/Shared/semantica';
import Lightbox, { type ImagenLightbox } from '@/Components/Publico/Lightbox';
import type { AvisoPublico } from '@/Components/Publico/AvisoCard';

export const esImagen = (mime: string | null) =>
  !!mime && (mime === 'image/webp' || mime.startsWith('image/jpeg') || mime.startsWith('image/png'));

export function sanitizarCuerpo(html: string | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h3', 'h4'],
    ALLOWED_ATTR: [],
  });
}

export function esHtml(texto: string | null): boolean {
  if (!texto) return false;
  return /<\s*(p|ul|ol|li|strong|em|h3|br)\b/i.test(texto);
}

interface Props {
  aviso: AvisoPublico | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Detalle completo de un aviso público (Sprint 13.x).
 * Cuerpo rico sanitizado + archivos con lightbox. Solo lectura.
 */
export default function AvisoDetailModal({ aviso, open, onOpenChange }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (!open) setLightbox(null);
  }, [open ]);

  if (!aviso) return null;

  const imagenes: ImagenLightbox[] = aviso.archivos
    .filter((a) => esImagen(a.mime))
    .map((a) => ({
      id: a.id,
      nombre: a.nombre,
      url: route('panel.descargar', { id: a.id }) as unknown as string,
    }));

  const cuerpoLimpio = sanitizarCuerpo(aviso.cuerpo);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap pr-6">
              {aviso.tipo_nombre && (
                <span className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {aviso.tipo_nombre}
                </span>
              )}
              {aviso.prioridad && aviso.prioridad !== 'ordinario' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${PRIORIDAD_PUBLICACION_COLOR[aviso.prioridad] ?? ''}`}>
                  {aviso.prioridad}
                </span>
              )}
              {aviso.fijada && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                  <Pin className="w-3 h-3" />
                  Fijado
                </span>
              )}
              {aviso.evento && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300">
                  {EVENTO_CASO_LABEL[aviso.evento] ?? aviso.evento}
                </span>
              )}
            </div>
            <DialogTitle className="text-xl leading-snug text-left">{aviso.titulo}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {cuerpoLimpio ? (
              esHtml(aviso.cuerpo) ? (
                <div
                  className="text-sm leading-relaxed space-y-2 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:font-bold [&_h3]:text-base [&_h4]:font-bold [&_h4]:text-sm"
                  dangerouslySetInnerHTML={{ __html: cuerpoLimpio }}
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{aviso.cuerpo}</p>
              )
            ) : aviso.resumen ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{aviso.resumen}</p>
            ) : null}

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs bg-muted/30 rounded-xl p-3">
              {aviso.cite && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground shrink-0">CITE:</dt>
                  <dd className="font-mono font-semibold">{aviso.cite}</dd>
                </div>
              )}
              {aviso.fecha_documento && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground shrink-0">Fecha:</dt>
                  <dd className="font-medium">{formatearFechaCorta(aviso.fecha_documento) ?? ''}</dd>
                </div>
              )}
              {aviso.ticket && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground shrink-0">Caso:</dt>
                  <dd className="font-mono font-semibold text-primary">{aviso.ticket}</dd>
                </div>
              )}
              {aviso.destinatario && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground shrink-0">Dirigido a:</dt>
                  <dd className="font-medium">{aviso.destinatario}</dd>
                </div>
              )}
              {aviso.referencia_externa && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground shrink-0">Ref. externa:</dt>
                  <dd className="font-mono">{aviso.referencia_externa}</dd>
                </div>
              )}
              {aviso.emisor && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground shrink-0">Emite:</dt>
                  <dd className="font-medium">{aviso.emisor}</dd>
                </div>
              )}
            </dl>

            {aviso.archivos.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Documentos ({aviso.archivos.length})
                </p>
                {aviso.archivos.map((a) => esImagen(a.mime) ? (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setLightbox(imagenes.findIndex((i) => i.id === a.id))}
                    className="w-full flex items-center gap-2 text-xs bg-muted/40 hover:bg-muted/70 rounded-lg p-1.5 transition-colors cursor-pointer text-left"
                  >
                    <img
                      src={route('panel.descargar', { id: a.id }) as unknown as string}
                      alt=""
                      loading="lazy"
                      className="w-12 h-12 rounded-md object-cover shrink-0"
                    />
                    <span className="truncate font-medium flex-1">{a.nombre}</span>
                    {a.tamano && <span className="text-muted-foreground shrink-0">{a.tamano}</span>}
                  </button>
                ) : (
                  <a
                    key={a.id}
                    href={route('panel.descargar', { id: a.id })}
                    className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <span className="truncate font-medium text-foreground">{a.nombre}</span>
                    {a.tamano && <span className="shrink-0">· {a.tamano}</span>}
                  </a>
                ))}
              </div>
            )}

            {aviso.publicado_at && (
              <p className="text-[11px] text-muted-foreground">
                Publicado: {formatearFechaLarga(aviso.publicado_at.slice(0, 10)) ?? ''}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {lightbox !== null && (
        <Lightbox
          imagenes={imagenes}
          indice={lightbox}
          onIndice={setLightbox}
          onCerrar={() => setLightbox(null)}
        />
      )}
    </>
  );
}
