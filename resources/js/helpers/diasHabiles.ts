/**
 * Mirror frontend de DiasHabiles — solo finde (lun-vie) para fallback.
 * El cálculo real con feriados viene del backend `plazo_info`/`plazo`.
 * Úsalo solo cuando backend no mande `plazo_info`.
 */
export function esHabilFrontend(date: Date, feriados: Set<string> = new Set()): boolean {
  const day = date.getDay(); // 0 dom, 6 sáb
  if (day === 0 || day === 6) return false;
  const ymd = date.toISOString().slice(0, 10);
  return !feriados.has(ymd);
}

export function agregarDiasHabilesFrontend(desde: Date, dias: number, feriados: Set<string> = new Set()): Date {
  const f = new Date(desde);
  f.setHours(0, 0, 0, 0);
  let agregados = 0;
  while (agregados < dias) {
    f.setDate(f.getDate() + 1);
    if (esHabilFrontend(f, feriados)) agregados++;
  }
  return f;
}

export function diasHabilesTranscurridos(desde: Date, hasta: Date, feriados: Set<string> = new Set()): number {
  let count = 0;
  const a = new Date(desde); a.setHours(0,0,0,0);
  const h = new Date(hasta); h.setHours(0,0,0,0);
  while (a < h) {
    a.setDate(a.getDate()+1);
    if (esHabilFrontend(a, feriados)) count++;
  }
  return count;
}
