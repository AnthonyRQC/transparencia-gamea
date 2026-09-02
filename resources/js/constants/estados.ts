export const ESTADOS_DENUNCIA = {
  INGRESADA: 'ingresada',
  EVALUACION_TECNICA: 'evaluacion_tecnica',
  ADMITIDA: 'admitida',
  RECHAZADA: 'rechazada',
  ASIGNADA: 'asignada',
  INVESTIGACION: 'investigacion',
  INFORME: 'informe',
  CERRADA: 'cerrada',
} as const;

export const SUBESTADO_ARCHIVADA = 'archivada' as const;

export const ORDEN_EMBUDO = [
  'ingresada',
  'evaluacion_tecnica',
  'admitida',
  'asignada',
  'investigacion',
  'informe',
  'rechazada',
  'cerrada',
  'cerrada_archivada',
] as const;

export const ETIQUETAS_ESTADO: Record<string, string> = {
  ingresada: 'INGRESADA',
  evaluacion_tecnica: 'EVALUACIÓN TÉCNICA',
  admitida: 'ADMITIDA',
  asignada: 'ASIGNADA',
  investigacion: 'INVESTIGACIÓN',
  informe: 'INFORME',
  rechazada: 'RECHAZADA',
  cerrada: 'CERRADA',
  cerrada_archivada: 'CERRADA · ARCHIVADA',
};

export const ESTADOS_TERMINALES = ['rechazada', 'cerrada'] as const;

export const TIPOS_DENUNCIA = {
  CORRUPCION: 'corrupcion',
  NEGACION: 'negacion',
} as const;

export const ETIQUETAS_TIPO: Record<string, string> = {
  corrupcion: 'CORRUPCIÓN',
  negacion: 'NEGACIÓN DE INFORMACIÓN',
};

export const ESCENARIOS = {
  REVELADA: 'revelada',
  RESERVADA: 'reservada',
  ANONIMO: 'anonimo',
} as const;

export const ROLES = {
  JEFE: 'jefe',
  TECNICO: 'tecnico',
  REGISTRADOR: 'registrador',
} as const;
