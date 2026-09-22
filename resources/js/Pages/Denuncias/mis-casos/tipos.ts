import { Inbox, Eye, FileText, Archive } from 'lucide-react';
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
  estado: string;
  subestado?: string | null;
  investigador?: string | null;
  fecha_asignada?: string | null;
  plazo: PlazoInfo | null;
  bitacora?: BitacoraEntry[];
}

export interface Grouped {
  [estado: string]: Denuncia[];
}

export interface PageProps {
  grouped: Grouped;
  investigadorActual: string;
  investigadores: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  solicitudesByTicket?: Record<string, Solicitud[]>;
  descargosByTicket?: Record<string, Descargo[]>;
  evaluacionesByTicket?: Record<string, any[]>;
  avisosPorTicket?: Record<string, string[]>;
  evaluacionesDelegadas?: any[];
  evaluacionesDevueltas?: any[];
  canAct?: boolean;
  destacar?: string;
}

export const estadoLabels: Record<string, { label: string; icon: any }> = {
  asignada: { label: 'Bandeja de entrada', icon: Inbox },
  investigacion: { label: 'Investigación', icon: Eye },
  informe: { label: 'Informe Final', icon: FileText },
  cerrada: { label: 'Cierre', icon: Archive },
};

export const estadoOrden = ['asignada', 'investigacion', 'informe', 'cerrada'];
