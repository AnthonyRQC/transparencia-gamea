interface RomboLogoProps {
  className?: string;
  size?: number | string;
  /** Color del marco exterior y del centro (`currentColor`: cualquier text-* lo pinta). */
  fill?: string;
  title?: string;
}

/**
 * Rombo canónico GAMEA (tres-rombos.svg, viewBox 200): marco exterior +
 * centro en el color (`fill`, por defecto currentColor para vivir en
 * tokens) con anillo blanco de separación. Diamante andino sólido
 * con centro calado doble.
 */
export default function RomboLogo({ className = '', size = 16, fill = 'currentColor', title }: RomboLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <polygon
        points="100,10 190,100 100,190 10,100"
        fill={fill}
      />
      <polygon
        points="100,42 158,100 100,158 42,100"
        fill="#ffffff"
      />
      <polygon
        points="100,74 126,100 100,126 74,100"
        fill={fill}
      />
    </svg>
  );
}
