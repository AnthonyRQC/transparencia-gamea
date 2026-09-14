import { useState } from 'react';
import { Download, Expand, FileText, Pin } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { formatearFechaCorta, formatearFechaLarga } from '@/helpers/fechas';
import { EVENTO_CASO_LABEL, PRIORIDAD_PUBLICACION_COLOR } from '@/Components/Denuncias/Shared/semantica';
import Lightbox, { type ImagenLightbox } from '@/Components/Publico/Lightbox';
import { esImagen } from '@/Components/Publico/AvisoDetailModal';

export interface AvisoPublico {
  id: number;
  tipo: string | null;
  tipo_nombre: string | null;
  prioridad: string | null;
  cite: string | null;
  fecha_documento: string | null;
  emisor: string | null;
  destinatario: string | null;
  titulo: string;
  resumen: string | null;
  cuerpo: string | null;
  referencia_externa: string | null;
  ticket: string | null;
  evento: string | null;
  fijada: boolean;
  portada_archivo_id: number | null;
  publicado_at: string | null;
  archivos: Array<{ id: number; nombre: string; tamano: string | null; mime: string | null }>;
}

export default function AvisoCard({ aviso, onVer }: { aviso: AvisoPublico; onVer?: (aviso: AvisoPublico) => void }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const imagenes: ImagenLightbox[] = aviso.archivos
    .filter((a) => esImagen(a.mime))
    .map((a) => ({
      id: a.id,
      nombre: a.nombre,
      url: route('panel.descargar', { id: a.id }) as unknown as string,
    }));
  const portada = imagenes.find((i) => i.id === aviso.portada_archivo_id) ?? imagenes[0] ?? null;
  const resto = aviso.archivos.filter((a) => a.id !== portada?.id);

  return (
    <>
      <article
        onClick={() => onVer?.(aviso)}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onVer) { e.preventDefault(); onVer(aviso); } }}
        tabIndex={onVer ? 0 : undefined}
        role={onVer ? 'button' : undefined}
        aria-label={onVer ? `Ver detalle: ${aviso.titulo}` : undefined}
        className={`bg-card border rounded-2xl p-5 space-y-3 ${aviso.fijada ? 'border-primary/40 shadow-sm' : 'border-border'} ${onVer ? 'cursor-pointer hover:shadow-md hover:border-primary/30 transition-all' : ''}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {aviso.tipo_nombre && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
              {aviso.tipo_nombre}
            </Badge>
          )}
          {aviso.prioridad && aviso.prioridad !== 'ordinario' && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${PRIORIDAD_PUBLICACION_COLOR[aviso.prioridad] ?? ''}`}>
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

        <h4 className="font-bold text-base leading-snug">{aviso.titulo}</h4>

        <div className={imagenes.length > 0 ? 'grid grid-cols-1 sm:grid-cols-5 gap-4' : 'space-y-3'}>
          {imagenes.length > 0 && (
            <div className="sm:col-span-2 space-y-2">
              {portada && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(imagenes.findIndex((i) => i.id === portada.id));
                  }}
                  className="block w-full overflow-hidden rounded-lg border border-border bg-muted/20 group relative"
                  aria-label={`Ampliar imagen: ${portada.nombre}`}
                >
                  <img
                    src={portada.url}
                    alt={portada.nombre}
                    loading="lazy"
                    className="w-full h-auto max-h-72 object-contain"
                  />
                  <span className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Expand className="w-4 h-4" />
                  </span>
                </button>
              )}
              {imagenes.length > 1 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {imagenes.filter((i) => i.id !== portada?.id).map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightbox(imagenes.findIndex((i) => i.id === img.id));
                      }}
                      className="overflow-hidden rounded-lg border border-border group"
                      aria-label={`Ampliar imagen: ${img.nombre}`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        loading="lazy"
                        className="w-full h-16 object-cover group-hover:scale-[1.03] transition-transform"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={imagenes.length > 0 ? 'sm:col-span-3 space-y-3 min-w-0' : 'space-y-3 min-w-0'}>
            {aviso.resumen && (
              <p className="text-sm text-muted-foreground leading-relaxed">{aviso.resumen}</p>
            )}
            <dl className={imagenes.length > 0 ? 'grid grid-cols-1 gap-x-4 gap-y-1 text-xs' : 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs'}>
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

        {resto.length > 0 && (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            {resto.map((a) => (
              <a
                key={a.id}
                href={route('panel.descargar', { id: a.id })}
                className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span className="truncate font-medium text-foreground">{a.nombre}</span>
                {a.tamano && <span className="shrink-0">· {a.tamano}</span>}
                <Download className="w-3.5 h-3.5 shrink-0 ml-auto text-primary" />
              </a>
            ))}
          </div>
        )}
          </div>
        </div>

        {aviso.publicado_at && (
          <p className="text-[11px] text-muted-foreground">
            Publicado: {formatearFechaLarga(aviso.publicado_at.slice(0, 10)) ?? ''}
          </p>
        )}
      </article>

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
