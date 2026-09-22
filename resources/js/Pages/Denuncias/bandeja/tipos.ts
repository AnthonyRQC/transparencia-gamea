import { Inbox, CheckCircle2, ClipboardList, Eye, FileText, FileSearch, Archive } from 'lucide-react';
import type { PlazoInfo } from '@/types/denuncia';

export type { PlazoInfo };

export interface Denunciado {
  conoce_identidad: boolean;
  nombres?: string;
  dependencia?: string;
  descripcion?: string;
}

export interface Prueba {
  tipo: string;
  descripcion: string;
  testigo_nombre?: string;
  testigo_telefono?: string;
  archivo_nombre?: string;
}

export interface BitacoraEntry {
  fecha: string;
  accion: string;
  detalle: string;
  usuario: string;
}

export interface Solicitud {
  id: number;
  ticket: string;
  dependencia_destino: string;
  detalle: string;
  fecha_envio: string;
  fecha_vencimiento: string;
  estado: string;
  plazo_dias?: number;
  fecha_respuesta?: string;
  respuesta?: string;
  motivo_cancelacion?: string;
  fecha_cancelacion?: string;
  archivos?: Array<{ nombre: string; tamano?: string; fecha_subida?: string }>;
  ampliaciones?: Array<{ dias: number; justificacion: string; fecha: string; archivo?: unknown }>;
  plazo_info?: PlazoInfo;
}

export interface Descargo {
  id: number;
  ticket: string;
  denunciado_idx: number;
  nombres_denunciado: string;
  dependencia_denunciado?: string;
  fecha_notificacion?: string | null;
  medio?: string | null;
  respaldo_archivo?: { nombre: string; tamano?: string } | null;
  fecha_vencimiento?: string | null;
  fecha_respuesta?: string | null;
  estado: string;
  resumen_descargo?: string | null;
  documentos?: Array<{ nombre: string; tamano?: string; fecha_subida?: string }>;
  ampliaciones?: Array<{ dias: number; justificacion: string; fecha: string }>;
}

export interface Denuncia {
  ticket: string;
  tipo: string;
  escenario?: string;
  denunciante?: { nombres?: string; ci?: string; email?: string; telefono?: string };
  denunciados?: Denunciado[];
  detalles?: { categoria?: string; fecha?: string; hora?: string; lugar?: string };
  hechos?: string;
  pruebas?: Prueba[];
  created_at: string;
  justificacion_admision?: string | null;
  fecha_admitida?: string | null;
  justificacion_rechazo?: string | null;
  justificacion_reapertura?: string | null;
  fecha_reapertura?: string | null;
  investigador_anterior?: string | null;
  bitacora?: BitacoraEntry[];
  estado: string;
  subestado?: string | null;
  investigador?: any;
  fecha_asignada?: string | null;
  fecha_traspaso?: string | null;
  justificacion_traspaso?: string | null;
  fecha_rechazada?: string | null;
  evaluacion_tecnica_investigador_nombre?: string | null;
  evaluacion_tecnica_recomendacion?: string | null;
  evaluacion_tecnica_delegada_at?: string | null;
  evaluacion_tecnica_texto?: string | null;
  plazo: PlazoInfo | null;
}

export interface Contador {
  ingresada?: number;
  evaluacion_tecnica?: number;
  admitida?: number;
  asignada?: number;
  investigacion?: number;
  informe?: number;
  rechazada?: number;
  cerrada?: number;
  porAdmitir?: number;
  porAsignar?: number;
  enCurso?: number;
  historial?: number;
  activos?: number;
  [key: string]: number | undefined;
}

export interface PageProps {
  denuncias: Denuncia[];
  porAsignar: Denuncia[];
  enCurso: Denuncia[];
  historial: Denuncia[];
  contadores: Contador;
  investigadores: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  cargaInvestigadores?: Array<{ id: string; nombre: string; iniciales: string; color: string; activos: number; por_vencer: number; vencidos: number }>;
  solicitudesByTicket?: Record<string, Solicitud[]>;
  descargosByTicket?: Record<string, Descargo[]>;
  evaluacionesByTicket?: Record<string, any[]>;
  avisosPorTicket?: Record<string, string[]>;
  canAct?: boolean;
  destacar?: string;
}

export const contadorConfig = [
  { key: 'ingresada', label: 'Ingresadas', icon: Inbox, color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  { key: 'evaluacion_tecnica', label: 'En evaluación', icon: FileSearch, color: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300' },
  { key: 'admitida', label: 'Admitidas', icon: CheckCircle2, color: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300' },
  { key: 'asignada', label: 'Asignadas', icon: ClipboardList, color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  { key: 'investigacion', label: 'Investigación', icon: Eye, color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  { key: 'informe', label: 'Informe Final', icon: FileText, color: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300' },
  { key: 'cerrada', label: 'Cerradas', icon: Archive, color: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300' },
];
