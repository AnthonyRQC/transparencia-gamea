export type BaseTemporal =
  | 'estado_actual'
  | 'created_at'
  | 'cerrado_at'
  | 'redactado_at'
  | 'fecha_rechazada'
  | 'fecha_envio';

export interface KPIs {
  activos: number;
  pendientesAdmision: number;
  proximosAVencer: number;
  vencidos: number;
  cumplimiento: number;
  rechazadas: number;
  sinAsignar: number;
  split: { corrupcion: number; negacion: number };
}

export interface EmbudoItem {
  estado: string;
  label: string;
  total: number;
  esTerminal: boolean;
}

export interface EvolucionItem {
  periodo: string;
  ingresadas: number;
  cerradas: number;
  rechazadas: number;
}

export interface Operativo {
  embudo: EmbudoItem[];
  evolucion: EvolucionItem[];
  granularidad: 'day' | 'week' | 'month';
}

export interface Resultados {
  clasificaciones: Array<{ label: string; value: number }>;
  medios: Array<{ label: string; value: number }>;
  dependencias: Array<{ label: string; value: number }>;
}

export interface Urgente {
  ticket: string;
  tecnico: string;
  diasRestantes: number;
  color: string;
  estado: string;
}

export interface Rendimiento {
  modo: 'jefe' | 'tecnico';
  cargaTecnicos?: Array<{ tecnico: string; enPlazo: number; proximos: number; vencidos: number }>;
  productividad?: Array<{ mes: string; cerrados: number }>;
  urgentes: Urgente[];
}

export interface FiltrosDashboard {
  desde: string | null;
  hasta: string | null;
  tecnico_id: number | null;
  tipo: string | null;
  categoria_id: number | null;
  clasificacion_id: number | null;
  estado: string | null;
  incluir_inactivos: boolean;
  tab: string;
}

export interface DashboardProps {
  kpis: KPIs;
  operativo: Operativo;
  resultados: Resultados;
  rendimiento: Rendimiento;
  base_temporal: Record<string, BaseTemporal>;
  opciones: {
    tecnicos: Array<{ id: number; name: string; activo: boolean }>;
    categorias: Array<{ id: number; nombre: string }>;
    clasificaciones: Array<{ id: number; nombre: string }>;
    estados: Array<{ clave: string; nombre: string }>;
  };
  esJefe: boolean;
  esTecnico: boolean;
  esRegistrador: boolean;
  filtros: FiltrosDashboard;
}

export const ETIQUETAS_TIPO: Record<string, string> = {
  corrupcion: 'CORRUPCIÓN',
  negacion: 'NEGACIÓN DE INFORMACIÓN',
};
