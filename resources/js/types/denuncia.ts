export type EstadoDenuncia =
  | 'ingresada'
  | 'evaluacion_tecnica'
  | 'admitida'
  | 'rechazada'
  | 'asignada'
  | 'investigacion'
  | 'informe'
  | 'cerrada';

export type SubestadoDenuncia = 'archivada' | null;

export type TipoDenuncia = 'corrupcion' | 'negacion';
export type EscenarioDenuncia = 'revelada' | 'reservada' | 'anonimo';
export type RolUsuario = 'jefe' | 'tecnico' | 'registrador';

export interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red' | 'gray';
  fecha_vencimiento: string;
}

export interface Denunciante {
  nombres?: string;
  ci?: string;
  email?: string;
  telefono?: string;
}

export interface Denunciado {
  conoce_identidad: boolean;
  nombres?: string;
  dependencia?: string;
  descripcion?: string;
}

export interface Prueba {
  tipo: 'archivo' | 'fisica' | 'testigo';
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
  estado: 'pendiente' | 'respondida' | 'ampliada' | 'cancelada' | 'pendiente_notif' | string;
  plazo_dias?: number;
  fecha_respuesta?: string;
  respuesta?: string;
  motivo_cancelacion?: string;
  fecha_cancelacion?: string;
  archivos?: Array<{ nombre: string; tamano?: string; fecha_subida?: string }>;
  ampliaciones?: Array<{ dias: number; justificacion: string; fecha: string; archivo?: unknown }>;
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
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
  estado: 'pendiente_notif' | 'notificado' | 'respondido' | 'ampliado' | 'cancelado' | string;
  resumen_descargo?: string | null;
  documentos?: Array<{ nombre: string; tamano?: string; fecha_subida?: string }>;
  ampliaciones?: Array<{ dias: number; justificacion: string; fecha: string }>;
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
}

export interface Denuncia {
  ticket: string;
  tipo: TipoDenuncia;
  escenario?: EscenarioDenuncia;
  denunciante?: Denunciante;
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
  tecnico_anterior?: string | null;
  bitacora?: BitacoraEntry[];
  estado: EstadoDenuncia;
  subestado?: SubestadoDenuncia;
  tecnico?: any;
  fecha_asignada?: string | null;
  fecha_traspaso?: string | null;
  justificacion_traspaso?: string | null;
  fecha_rechazada?: string | null;
  evaluacion_tecnica_tecnico_nombre?: string | null;
  evaluacion_tecnica_recomendacion?: string | null;
  evaluacion_tecnica_delegada_at?: string | null;
  evaluacion_tecnica_texto?: string | null;
  plazo: PlazoInfo | null;
  ampliaciones?: Array<{ id: number; fecha: string; dias: number; justificacion: string; aprobado_por: string; solicitado_por: string | null }>;
}

export interface Feriado {
  id: number;
  fecha: string;
  nombre: string;
  deleted_at?: string | null;
}
