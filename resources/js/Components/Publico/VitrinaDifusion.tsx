import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AvisoPublico } from '@/Components/Publico/AvisoCard';
import VitrinaCard from '@/Components/Publico/VitrinaCard';
import RomboLogo from '@/Components/Publico/RomboLogo';
import AvisoDetailModal from '@/Components/Publico/AvisoDetailModal';
import SimboloS from '@/Components/Publico/SimboloS';

interface VitrinaProps {
  avisos: AvisoPublico[];
  onVer?: (aviso: AvisoPublico) => void;
}

/**
 * Nivel 2 — Difusión institucional: afiches y campañas visuales (tipo
 * difusion) en tarjetas a sangre, desacoplados de la Gaceta
 * documental. Opción A: lead full-width arriba + secundarias en
 * grilla compacta. 0 piezas → null. Detalle vía modal/lightbox.
 */
export default function VitrinaDifusion({ avisos, onVer }: VitrinaProps) {
  const [detalle, setDetalle] = useState<AvisoPublico | null>(null);

  if (avisos.length === 0) return null;

  const ver = (aviso: AvisoPublico) => {
    if (onVer) {
      onVer(aviso);
    } else {
      setDetalle(aviso);
    }
  };

  const [lead, ...resto] = avisos;

  return (
    <section aria-label="Difusión institucional" className="relative space-y-2.5">
      <SimboloS size={320} className="absolute -left-12 top-10 hidden text-teal-600 opacity-[0.07] pointer-events-none lg:block" />

      <div className="relative text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
          <Megaphone className="w-5 h-5 text-secondary" />
          Difusión institucional
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Avisos y comunicados destacados para la población
        </p>
        <div aria-hidden="true" className="mx-auto flex max-w-md items-center justify-center gap-2.5 pt-1.5 pb-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <RomboLogo
              key={i}
              size={16}
              fill="currentColor"
              className={['text-primary', 'text-destructive', 'text-teal-600', 'text-secondary'][i % 4]}
            />
          ))}
        </div>
      </div>

      <VitrinaCard aviso={lead} onVer={ver} variant="lead" />

      {resto.length > 0 && (
        resto.length <= 2 ? (
          /* 1 o 2 secundarias: centradas con ancho máximo controlado (max-w-md) para mantener proporción 16:9 / 4:3 */
          <div className="flex flex-wrap justify-center gap-2.5">
            {resto.map((aviso) => (
              <div key={aviso.id} className="w-full max-w-md">
                <VitrinaCard aviso={aviso} onVer={ver} variant="secondary" />
              </div>
            ))}
          </div>
        ) : (
          /* 3 o 4 secundarias: grilla simétrica de alta densidad con gap-2.5 */
          <div className={cn(
            'grid gap-2.5',
            resto.length === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          )}>
            {resto.map((aviso) => (
              <VitrinaCard key={aviso.id} aviso={aviso} onVer={ver} variant="secondary" />
            ))}
          </div>
        )
      )}

      {!onVer && (
        <AvisoDetailModal
          aviso={detalle}
          open={detalle !== null}
          onOpenChange={(v) => { if (!v) setDetalle(null); }}
        />
      )}
    </section>
  );
}
