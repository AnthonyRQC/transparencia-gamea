export interface UsuarioRow {
  id: number;
  name: string;
  username: string;
  ci: string | null;
  rol: string;
  email: string | null;
  telefono: string | null;
  iniciales: string | null;
  color: string | null;
  activo: boolean;
  desactivado_at: string | null;
  casos_activos: number;
  delegaciones_activas?: number;
}

export const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador',
  jefe: 'Jefe de Unidad',
  investigador: 'Investigador',
  registrador: 'Registrador',
};

/** Réplica cliente de UsernameGenerator::para (preview; el backend manda). */
export function previewUsername(nombres: string, apellidos: string, ci: string): string {
  const i1 = (nombres.trim().split(/\s+/)[0] ?? '').charAt(0).toUpperCase();
  const i2 = (apellidos.trim().split(/\s+/)[0] ?? '').charAt(0).toUpperCase();
  const ciNorm = ci.trim().replace(/\s+/g, '').toUpperCase();
  return `${i1}${i2}${ciNorm}`;
}
