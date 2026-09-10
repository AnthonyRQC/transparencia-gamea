/**
 * Fuente única de semántica visual (Sprint 12.5 R1.1).
 * Mapas de badges/colores/etiquetas antes duplicados en 5+ sitios.
 * Regla: mismo output visual salvo migración pink-600 → destructive
 * (cierra brecha "magenta solo gráficos"; referencia: KPICards ya usa destructive).
 */

/** Plazo green/yellow/red — badges (PlazoBadge, TablaReporte, TablaCasosUrgentes). */
export const PLAZO_COLOR: Record<string, string> = {
  green: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30',
  yellow: 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/30',
  red: 'bg-destructive/10 text-destructive dark:text-destructive border-destructive/30',
};

/** Clasificación final 6 valores (ClasificacionBadge, ResultadoSeguimiento). */
export const CLASIFICACION_COLOR: Record<string, string> = {
  penal: 'bg-destructive/10 text-destructive border border-destructive/30 dark:bg-destructive/20 dark:text-destructive',
  civil: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground',
  administrativo: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
  sin_indicios: 'bg-muted text-muted-foreground border border-border',
  medida_correctiva: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300',
  archivado: 'bg-muted text-muted-foreground border border-border',
};

export const DEFAULT_CLASIFICACION_COLOR = 'bg-muted text-muted-foreground border border-border';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

/** Estados de solicitud de información (SolicitudCard, SolicitudDetailModal). */
export const SOLICITUD_ESTADO: Record<string, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: 'Pendiente', variant: 'outline' },
  respondida: { label: 'Respondida', variant: 'default' },
  vencida: { label: 'Vencida', variant: 'destructive' },
  ampliada: { label: 'Ampliada', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'outline' },
};

/** Estados de descargo (DescargoCard, DescargoDetailModal). */
export const DESCARGO_ESTADO: Record<string, { label: string; variant: BadgeVariant }> = {
  pendiente_notif: { label: 'Pendiente de notificar', variant: 'outline' },
  notificado: { label: 'Notificado', variant: 'secondary' },
  respondido: { label: 'Respondido', variant: 'default' },
  vencido: { label: 'Vencido', variant: 'destructive' },
  ampliado: { label: 'Ampliado', variant: 'secondary' },
  cancelado: { label: 'Cancelado', variant: 'outline' },
};

/** Escenario de identidad (DenunciaCard, DenunciaSheet). */
export const ESCENARIO_LABEL: Record<string, string> = {
  revelada: 'Identidad Revelada',
  reservada: 'Identidad Reservada',
  anonimo: 'Anónimo',
};

/** Recomendación de evaluación técnica (TabEvaluacionPrevia, DenunciaCard, Bandeja, Evaluaciones). */
export const RECOMENDACION_COLOR: Record<string, string> = {
  admitir: 'bg-teal-500/10 text-teal-800 border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300',
  rechazar: 'bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-destructive',
};

export const RECOMENDACION_LABEL: Record<string, string> = {
  admitir: 'Admitir',
  rechazar: 'Rechazar',
};

/** Etiquetas cortas de estado (TablaCasosUrgentes, ConsultarCasos). */
export const ETIQUETAS_ESTADO_CORTO: Record<string, string> = {
  ingresada: 'Ingresada',
  evaluacion_tecnica: 'En evaluación',
  admitida: 'Admitida',
  asignada: 'Asignada',
  investigacion: 'Investigación',
  informe: 'Informe Final',
  rechazada: 'Rechazada',
  cerrada: 'Cerrada',
};

/** Botón Cancelar en cards (SolicitudCard, DescargoCard). */
export const BOTON_CANCELAR_CARD =
  'inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 text-[11px] font-semibold hover:bg-destructive/20 transition-colors dark:bg-destructive/20 dark:text-destructive cursor-pointer';

/** Botón Cancelar en modales (SolicitudDetailModal, DescargoDetailModal). */
export const BOTON_CANCELAR_MODAL =
  'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 text-xs font-semibold hover:bg-destructive/20 transition-colors dark:bg-destructive/20 dark:text-destructive cursor-pointer';

/** Borde lateral de plazo en cards (DenunciaCard). */
export const PLAZO_BORDE: Record<string, string> = {
  green: 'border-l-4 border-l-teal-600 dark:border-l-teal-400',
  yellow: 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400',
  red: 'border-l-4 border-l-destructive dark:border-l-destructive',
};

/** Contadores MiResumen (Activos/Vencidos/Por vencer/Cerrados). */
export const RESUMEN_COLOR: Record<string, string> = {
  activos: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground',
  vencidos: 'bg-destructive/10 text-destructive border border-destructive/30 dark:bg-destructive/20 dark:text-destructive',
  porVencer: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
  cerrados: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300',
};
