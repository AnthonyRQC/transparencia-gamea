interface SimboloSProps {
  className?: string;
  /** Altura del símbolo; el ancho se deriva de la proporción 128:376 del activo. */
  size?: number | string;
  /** Trazo del símbolo (currentColor: responde a las clases text-* de Tailwind). */
  stroke?: string;
  title?: string;
}

const S_W = 128;
const S_H = 376;

/**
 * Símbolo-S oficial (simbolo-S.svg): trazo geométrico vertical.
 * Geometría y matrices fieles al activo; el trazo usa currentColor para
 * vivir en tokens (text-secondary, text-teal-600, ...). Pensado como
 * marca de agua visible (opacity-[0.08]/[0.10] + pointer-events-none)
 * o ancla de identidad.
 */
export default function SimboloS({ className = '', size = 240, stroke = 'currentColor', title }: SimboloSProps) {
  const height = size;
  const width = typeof size === 'number' ? (size * S_W) / S_H : size;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${S_W} ${S_H}`}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round' }}
    >
      {title ? <title>{title}</title> : null}
      <g transform="matrix(1,0,0,1,-107.618478,-511.285828)">
        <g transform="matrix(2.045058,0,0,2.045058,-3144.973483,-1683.693616)">
          <path
            d="M1617.506,1074.735L1651.278,1108.203L1651.149,1136.726L1640.074,1147.802L1612.202,1119.93L1621.778,1110.354L1639.75,1128.326L1645.056,1123.02L1616.91,1094.874L1596.437,1115.347L1650.761,1169.671L1650.761,1230.934L1626.043,1255.652L1591.955,1221.563L1591.955,1193.72L1603.516,1182.159L1632.196,1210.838L1621.973,1221.061L1603.452,1202.54L1598.405,1207.587L1626.227,1235.41L1646.198,1215.439L1591.89,1161.13L1591.89,1100.051L1617.506,1074.735ZM1634.87,1178.899L1634.87,1187.923L1643.86,1187.923L1643.86,1178.899L1634.87,1178.899ZM1599.454,1143.227L1599.454,1152.251L1608.443,1152.251L1608.443,1143.227L1599.454,1143.227ZM1617.605,1160.709L1617.605,1169.732L1626.595,1169.732L1626.595,1160.709L1617.605,1160.709Z"
            fill="none"
            stroke={stroke}
            strokeWidth={2.85}
            strokeMiterlimit={1.5}
          />
        </g>
      </g>
    </svg>
  );
}
