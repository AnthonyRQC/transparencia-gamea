import { SVGAttributes } from 'react';

interface InstitutionalLogoProps extends SVGAttributes<SVGElement> {
    size?: 'sm' | 'md' | 'lg';
}

export default function InstitutionalLogo({ size = 'md', className = '', ...props }: InstitutionalLogoProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    };

    return (
        <div
            className={`${sizeClasses[size]} ${className} relative shrink-0`}
            {...(props as any)}
        >
            <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                <defs>
                    <linearGradient id="gameaShield" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="oklch(var(--primary))" />
                        <stop offset="100%" stopColor="oklch(var(--primary) / 0.85)" />
                    </linearGradient>
                </defs>
                <path
                    d="M50 5 L88 18 L88 50 C88 72 72 88 50 95 C28 88 12 72 12 50 L12 18 Z"
                    fill="url(#gameaShield)"
                    stroke="oklch(var(--primary) / 0.4)"
                    strokeWidth="1"
                />
                <path
                    d="M50 14 L80 24 L80 50 C80 68 67 81 50 86 C33 81 20 68 20 50 L20 24 Z"
                    fill="none"
                    stroke="oklch(var(--secondary))"
                    strokeWidth="1.5"
                    opacity="0.7"
                />
                <text
                    x="50"
                    y="46"
                    fontSize="16"
                    fontWeight="800"
                    fill="oklch(var(--secondary))"
                    textAnchor="middle"
                    fontFamily="Outfit, sans-serif"
                    letterSpacing="0.5"
                >
                    GAMEA
                </text>
                <text
                    x="50"
                    y="60"
                    fontSize="6.5"
                    fontWeight="600"
                    fill="oklch(var(--primary-foreground))"
                    textAnchor="middle"
                    fontFamily="Outfit, sans-serif"
                    opacity="0.95"
                >
                    UTLCC
                </text>
                <line
                    x1="36"
                    y1="66"
                    x2="64"
                    y2="66"
                    stroke="oklch(var(--secondary))"
                    strokeWidth="0.8"
                    opacity="0.6"
                />
                <text
                    x="50"
                    y="74"
                    fontSize="4.5"
                    fontWeight="500"
                    fill="oklch(var(--primary-foreground))"
                    textAnchor="middle"
                    fontFamily="Outfit, sans-serif"
                    opacity="0.75"
                >
                    EL ALTO
                </text>
            </svg>
        </div>
    );
}
