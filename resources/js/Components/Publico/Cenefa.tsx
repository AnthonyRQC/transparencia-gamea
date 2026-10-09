import RomboLogo from '@/Components/Publico/RomboLogo';

interface CenefaProps {
  className?: string;
}

/** Guarda andina: secuencia oficial GAMEA Morado → Magenta → Teal → Dorado. */
const SECUENCIA = ['text-primary', 'text-destructive', 'text-teal-600', 'text-secondary'];

/**
 * Faja densa de rombos oficiales GAMEA, centrada, + regla dorada de
 * base. Sin hex en clases.
 */
export default function Cenefa({ className = '' }: CenefaProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <div className="flex items-center justify-center gap-2.5 px-4 py-1.5 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <RomboLogo
            key={i}
            size={15}
            fill="currentColor"
            className={SECUENCIA[i % SECUENCIA.length]}
          />
        ))}
      </div>
      <div className="h-0.5 w-full bg-secondary" />
    </div>
  );
}
