import { ArrowRight, Expand } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatearFechaCorta } from '@/helpers/fechas';
import type { AvisoPublico } from '@/Components/Publico/AvisoCard';
import Lightbox, { type ImagenLightbox } from '@/Components/Publico/Lightbox';
import { esImagen } from '@/Components/Publico/AvisoDetailModal';

interface VitrinaCardProps {
  aviso: AvisoPublico;
  onVer?: (aviso: AvisoPublico) => void;
  /** lead = franja horizontal protagonista; secondary = compacta de grilla. */
  variant?: 'lead' | 'secondary';
}

/**
 * Tarjeta a sangre para la Vitrina de Difusión (Nivel 2): la foto ocupa
 * el 100% de la tarjeta con el texto blanco superpuesto (overlay
 * editorial), sin badges ni obstrucciones. Sin imagen: fondo degradado
 * institucional con la misma jerarquía tipográfica.
 */
export default function VitrinaCard({ aviso, onVer, variant = 'secondary' }: VitrinaCardProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const imagenes: ImagenLightbox[] = aviso.archivos
    .filter((a) => esImagen(a.mime))
    .map((a) => ({
      id: a.id,
      nombre: a.nombre,
      url: route('panel.descargar', { id: a.id }) as unknown as string,
    }));
  const portada = imagenes.find((i) => i.id === aviso.portada_archivo_id) ?? imagenes[0] ?? null;
  const isLead = variant === 'lead';

  return (
    <>
      <article
        onClick={() => onVer?.(aviso)}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onVer) { e.preventDefault(); onVer(aviso); } }}
        tabIndex={onVer ? 0 : undefined}
        role={onVer ? 'button' : undefined}
        aria-label={onVer ? `Ver afiche: ${aviso.titulo}` : undefined}
        className={cn(
          'relative rounded-2xl overflow-hidden group border border-border/30 shadow-md hover:shadow-xl transition-all duration-300 w-full flex flex-col justify-end',
          variant === 'lead' ? 'h-[400px] sm:h-[440px] md:h-[470px]' : 'h-[210px] sm:h-[230px]',
          onVer && 'cursor-pointer'
        )}
      >
        {portada ? (
          <img
            src={portada.url}
            alt={portada.nombre}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary/70" />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {portada && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(imagenes.findIndex((i) => i.id === portada.id));
            }}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Ampliar imagen: ${portada.nombre}`}
          >
            <Expand className="w-4 h-4" />
          </button>
        )}

        <div className={`relative z-10 space-y-1.5 text-white ${isLead ? 'p-5 sm:p-7' : 'p-4 sm:p-5'}`}>
          {isLead && (aviso.fecha_documento || aviso.emisor) && (
            <p className="text-xs text-white/80 font-medium">
              {[aviso.fecha_documento ? (formatearFechaCorta(aviso.fecha_documento) ?? '') : '', aviso.emisor].filter(Boolean).join(' · ')}
            </p>
          )}
          <h4 className={`tracking-tight text-white leading-tight drop-shadow-sm line-clamp-2 ${isLead ? 'text-2xl sm:text-3xl font-extrabold' : 'text-base sm:text-lg font-bold'}`}>
            {aviso.titulo}
          </h4>
          {aviso.resumen && (
            <p className={`leading-relaxed drop-shadow-sm ${isLead ? 'text-xs sm:text-sm text-white/90 line-clamp-2' : 'text-xs text-white/80 line-clamp-1'}`}>
              {aviso.resumen}
            </p>
          )}
          {isLead && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 group-hover:text-white group-hover:gap-2.5 transition-all">
              Ver afiche completo
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
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
