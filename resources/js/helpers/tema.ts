/**
 * Fuente única de color para gráficos (Recharts no lee clases Tailwind).
 * Lee los tokens CSS (respeta .dark) con fallback a la paleta institucional:
 * morado #4B0090 (proceso), teal #008F89 (positivo), magenta #F4007A (alerta),
 * dorado #F5B400 (aviso), gris terminal.
 */

function token(nombre: string, fallbackHex: string): string {
    if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') return fallbackHex;
    try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
        return v ? `oklch(${v})` : fallbackHex;
    } catch {
        return fallbackHex;
    }
}

function esOscuro(): boolean {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
}

export const TEMA = {
    primario: () => token('--primary', '#4B0090'),
    /** Rampa monocromática morada para categorías sin semántica. */
    rampaMorada: (): string[] =>
        esOscuro()
            ? ['#A855F7', '#8B5CF6', '#7C3AED', '#6D28D9', '#5E1AA8', '#4B0090', '#3B0764', '#2E1065']
            : ['#4B0090', '#5E1AA8', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
    teal: '#008F89',
    magenta: '#F4007A',
    dorado: '#F5B400',
    grisTerminal: '#6b7280',
    grisLinea: '#9ca3af',
    cursorHover: 'rgba(75,0,144,0.08)',
};
