import { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
 * Sin librerías. Cierra con Esc o clic estricto en el backdrop.
 *
 * Se monta en document.body con pointer-events-auto explícito: Radix UI
 * (Dialog) apaga los eventos de puntero en todo lo montado en body
 * fuera de su árbol, y sin esto los clics atraviesan el visor.
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
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 pointer-events-auto select-none"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={actual.nombre}
    >
      {/* Botón cerrar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCerrar();
        }}
        aria-label="Cerrar"
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer pointer-events-auto z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Flechas de navegación */}
      {imagenes.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={(e) => {
              e.stopPropagation();
              onIndice((indice - 1 + imagenes.length) % imagenes.length);
            }}
            className="absolute left-2 sm:left-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer pointer-events-auto z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={(e) => {
              e.stopPropagation();
              onIndice((indice + 1) % imagenes.length);
            }}
            className="absolute right-2 sm:right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer pointer-events-auto z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Imagen activa */}
      <figure
        className="max-w-5xl w-full pointer-events-auto flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={actual.url}
          alt={actual.nombre}
          className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        <figcaption className="text-center text-xs text-white/70 mt-3 font-mono">
          {actual.nombre} {imagenes.length > 1 && `· ${indice + 1} de ${imagenes.length}`}
        </figcaption>
      </figure>
    </div>,
    document.body
  );
}
