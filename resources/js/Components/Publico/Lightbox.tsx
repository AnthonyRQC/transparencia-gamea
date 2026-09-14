import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface ImagenLightbox {
  id: number;
  nombre: string;
  url: string;
}

interface Props {
  imagenes: ImagenLightbox[];
  indice: number;
  onIndice: (indice: number) => void;
  onCerrar: () => void;
}

/**
 * Lightbox mínimo (Sprint 13.x): overlay + imagen + anterior/siguiente.
 * Sin librerías. Cierra con Esc o clic fuera.
 */
export default function Lightbox({ imagenes, indice, onIndice, onCerrar }: Props) {
  const actual = imagenes[indice];

  useEffect(() => {
    if (!actual || imagenes.length === 0) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
      if (e.key === 'ArrowRight') onIndice((indice + 1) % imagenes.length);
      if (e.key === 'ArrowLeft') onIndice((indice - 1 + imagenes.length) % imagenes.length);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [actual, indice, imagenes.length, onCerrar, onIndice]);

  if (!actual) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
      onClick={onCerrar}
      onPointerDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={actual.nombre}
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {imagenes.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={(e) => { e.stopPropagation(); onIndice((indice - 1 + imagenes.length) % imagenes.length); }}
            className="absolute left-2 sm:left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={(e) => { e.stopPropagation(); onIndice((indice + 1) % imagenes.length); }}
            className="absolute right-2 sm:right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <figure className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={actual.url}
          alt={actual.nombre}
          className="w-full max-h-[82vh] object-contain rounded-lg"
        />
        <figcaption className="text-center text-white/80 text-sm mt-2 truncate">
          {actual.nombre}
          {imagenes.length > 1 && <span> · {indice + 1}/{imagenes.length}</span>}
        </figcaption>
      </figure>
    </div>
  );
}
