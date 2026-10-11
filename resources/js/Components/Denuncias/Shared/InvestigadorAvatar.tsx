import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const SIZES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
} as const;

interface InvestigadorAvatarProps {
  /** Nombre completo — se muestra su primera letra en mayúscula. */
  nombre?: string | null;
  /** Clase de color dinámica (p. ej. investigador.color). */
  color?: string | null;
  /** Color hex inline (p. ej. user.color del Header). */
  colorHex?: string | null;
  /** xs=20px, sm=28px, md=36px. */
  size?: keyof typeof SIZES;
  /** muted = pastilla primary/10 (estilo Descargo). */
  tone?: 'color' | 'muted';
  className?: string;
}

/**
 * Avatar de investigador/usuario (Sprint 12.5 R1.3).
 * Simple: primera letra del nombre. Sin envolver en button/tooltip —
 * el caller conserva su wrapper (dropdown del Header, Tooltip del Sheet).
 * forwardRef para satisfacer a Radix asChild (TooltipTrigger).
 */
const InvestigadorAvatar = forwardRef<HTMLSpanElement, InvestigadorAvatarProps>(function InvestigadorAvatar({
  nombre,
  color,
  colorHex,
  size = 'sm',
  tone = 'color',
  className,
}: InvestigadorAvatarProps, ref) {
  const letra = (nombre?.trim()?.charAt(0) || '?').toUpperCase();

  return (
    <span
      ref={ref}
      title={nombre ?? 'Usuario'}
      aria-label={nombre ?? 'Usuario'}
      style={colorHex ? { backgroundColor: colorHex } : undefined}
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0',
        SIZES[size],
        tone === 'muted'
          ? 'bg-primary/10 text-primary'
          : 'text-white',
        tone === 'color' && !colorHex && color,
        className
      )}
    >
      {letra}
    </span>
  );
});

export default InvestigadorAvatar;
