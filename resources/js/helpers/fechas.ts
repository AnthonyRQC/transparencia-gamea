/**
 * Utilidades de formateo de fechas para todo el sistema (esp. Dashboard y Reportes).
 * Evita formatos técnicos crudos (YYYY-MM-DD) y unifica la presentación en español (es-BO).
 */

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "2026-09-05" → "5 sep 2026" (o "5 sep" si sinAnio es true). */
export function formatearFechaCorta(ymd: string | null | undefined, sinAnio = false): string | null {
    if (!ymd) return null;
    const clean = ymd.slice(0, 10);
    const parts = clean.split('-');
    if (parts.length !== 3) return ymd;

    const anio = parseInt(parts[0], 10);
    const mes = parseInt(parts[1], 10) - 1;
    const dia = parseInt(parts[2], 10);

    if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) return ymd;
    const mesStr = MESES_CORTOS[mes] ?? parts[1];

    return sinAnio ? `${dia} ${mesStr}` : `${dia} ${mesStr} ${anio}`;
}

/** Formatea rango "2026-08-07" y "2026-09-05" → "7 ago → 5 sep 2026" o "Todo el historial". */
export function formatearRangoFechas(desde: string | null | undefined, hasta: string | null | undefined): string {
    if (!desde && !hasta) return 'Todo el historial';

    const desdeAnio = desde ? desde.slice(0, 4) : null;
    const hastaAnio = hasta ? hasta.slice(0, 4) : null;

    // Si ambos tienen fecha y son del mismo año, omitir año en "desde"
    const omitirAnioDesde = Boolean(desdeAnio && hastaAnio && desdeAnio === hastaAnio);

    const dStr = desde ? (formatearFechaCorta(desde, omitirAnioDesde) ?? 'inicio') : 'inicio';
    const hStr = hasta ? (formatearFechaCorta(hasta) ?? 'hoy') : 'hoy';

    return `${dStr} → ${hStr}`;
}

/**
 * Convierte días restantes a texto claro en lenguaje natural para funcionarios y abogados.
 * Ejemplos:
 *  -12 → "Vencido hace 12 días"
 *  -1  → "Vencido ayer"
 *   0  → "Vence hoy"
 *   1  → "Vence mañana"
 *   3  → "En 3 días"
 */
export function formatearDiasPlazo(dias: number, corto = false): string {
    if (dias < 0) {
        const abs = Math.abs(dias);
        if (abs === 1) return corto ? 'Vencido ayer' : 'Vencido hace 1 día';
        return corto ? `Vencido (${abs} d)` : `Vencido hace ${abs} días`;
    }
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return 'Vence mañana';
    return corto ? `${dias} d` : `En ${dias} días`;
}

/**
 * Formatea una fecha ISO/timestamp a texto largo en español.
 * "2026-09-05" o "2026-09-05T14:30:00" → "5 de septiembre de 2026"
 */
export function formatearFechaLarga(d: string | null | undefined): string | null {
    if (!d) return null;
    const date = new Date(d.length === 10 ? d + 'T12:00:00' : d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Formatea una fecha+hora ISO a texto compacto en español.
 * "2026-09-05T14:30:00" → "5 sep 2026, 14:30"
 */
export function formatearFechaHora(d: string | null | undefined): string | null {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Devuelve la fecha de hoy en formato "YYYY-MM-DD" (para valores por defecto de inputs date).
 * Reemplaza el patrón: new Date().toISOString().split('T')[0]
 */
export function hoyISO(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
