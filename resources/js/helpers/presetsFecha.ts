/**
 * Presets de rango de fechas del Dashboard (Sprint 12, pulido).
 * Solo frontend: cada preset se traduce a { desde, hasta } (Y-m-d) que el
 * backend ya acepta vía DashboardRequest. `hasta` siempre = hoy.
 */

export type PresetFechaKey = 'hoy' | 'ultimos_7' | 'ultimo_mes' | 'trimestre' | 'anio' | 'todo' | 'personalizado';

export const PRESET_DEFAULT: PresetFechaKey = 'ultimo_mes';

const DIAS: Record<Exclude<PresetFechaKey, 'todo' | 'personalizado'>, number> = {
    hoy: 0,
    ultimos_7: 6,
    ultimo_mes: 29,
    trimestre: 89,
    anio: 364,
};

export const PRESETS_FECHA: Array<{ key: PresetFechaKey; label: string }> = [
    { key: 'hoy', label: 'Hoy' },
    { key: 'ultimos_7', label: 'Últimos 7 días' },
    { key: 'ultimo_mes', label: 'Último mes' },
    { key: 'trimestre', label: 'Trimestre' },
    { key: 'anio', label: 'Año' },
    { key: 'todo', label: 'Todo' },
];

export const ETIQUETAS_PRESET: Record<PresetFechaKey, string> = {
    hoy: 'Hoy',
    ultimos_7: 'Últimos 7 días',
    ultimo_mes: 'Último mes',
    trimestre: 'Trimestre',
    anio: 'Año',
    todo: 'Todo el período',
    personalizado: 'Personalizado',
};

function hoyYMD(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function restarDias(ymd: string, dias: number): string {
    const d = new Date(ymd + 'T12:00:00');
    d.setDate(d.getDate() - dias);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** Traduce un preset a rango { desde, hasta }. `todo` → ambos null. */
export function rangoPreset(key: PresetFechaKey): { desde: string | null; hasta: string | null } {
    if (key === 'todo' || key === 'personalizado') {
        return key === 'todo' ? { desde: null, hasta: null } : { desde: null, hasta: hoyYMD() };
    }
    const hasta = hoyYMD();
    return { desde: restarDias(hasta, DIAS[key]), hasta };
}

/** Detecta qué preset corresponde al rango actual (para chips y botón activo). */
export function detectarPreset(desde: string | null, hasta: string | null): PresetFechaKey {
    if (!desde && !hasta) return 'todo';
    const hoy = hoyYMD();
    if (hasta && hasta !== hoy) return 'personalizado';
    if (!desde || !hasta) return 'personalizado';
    for (const key of Object.keys(DIAS) as Array<keyof typeof DIAS>) {
        if (restarDias(hoy, DIAS[key]) === desde) return key;
    }
    return 'personalizado';
}
