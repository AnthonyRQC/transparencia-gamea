import { ShieldCheck, FileText, Clock, AlertTriangle } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import StepperProgreso from '@/Components/Publico/StepperProgreso';
import { formatearFechaLarga } from '@/helpers/fechas';
import { CLASIFICACION_COLOR as clasificacionColors, DEFAULT_CLASIFICACION_COLOR as DEFAULT_CLASIF_COLOR } from '@/Components/Denuncias/Shared/semantica';

interface DenunciaPublica {
  ticket: string;
  tipo: string;
  tipo_legible: string;
  estado: string;
  estado_legible: string;
  fecha_ingreso: string | null;
  fecha_vencimiento: string | null;
  plazo_total_dias: number | null;
  mensaje_avance: string;
  pasos: {
    recepcion: boolean;
    evaluacion: boolean;
    investigacion: boolean;
    resolucion: boolean;
    rechazada: boolean;
  };
  resumen_rechazo: string | null;
  clasificacion: string | null;
  fecha_cierre: string | null;
}

interface ResultadoSeguimientoProps {
  denuncia: DenunciaPublica;
}

const estadoBadge: Record<string, { label: string; color: string }> = {
  ingresada: { label: 'En Evaluación', color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  evaluacion_tecnica: { label: 'En Evaluación Técnica', color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  admitida: { label: 'Admitida', color: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300' },
  asignada: { label: 'En Investigación', color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  investigacion: { label: 'En Investigación', color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  informe: { label: 'Informe Final', color: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300' },
  cerrada: { label: 'Cerrada', color: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300' },
  rechazada: { label: 'Rechazada', color: 'bg-destructive/10 text-destructive border border-destructive/30 dark:bg-destructive/20 dark:text-destructive' },
};

export default function ResultadoSeguimiento({ denuncia }: ResultadoSeguimientoProps) {
  const badge = estadoBadge[denuncia.estado] ?? { label: denuncia.estado, color: 'bg-muted text-muted-foreground' };

  const props = usePage().props as Record<string, any>;
  const catalog = Array.isArray(props.clasificaciones) ? props.clasificaciones : [];
  const catalogItem = denuncia.clasificacion
    ? (catalog as Array<{ clave?: string | null; nombre?: string }>).find((c) => c.clave === denuncia.clasificacion)
    : null;
  const clasifLabel = catalogItem?.nombre ?? denuncia.clasificacion ?? null;
  const clasifInfo = clasifLabel
    ? {
        label: clasifLabel,
        color: denuncia.clasificacion && clasificacionColors[denuncia.clasificacion]
          ? clasificacionColors[denuncia.clasificacion]
          : DEFAULT_CLASIF_COLOR,
      }
    : null;
  const isRechazada = denuncia.estado === 'rechazada';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-card border border-primary/10 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-primary" />

        <div className="space-y-4 pl-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <p className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-bold inline-block uppercase">
                {denuncia.tipo_legible}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
                {denuncia.ticket}
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Fecha de ingreso</p>
              <p className="font-semibold text-foreground">{formatearFechaLarga(denuncia.fecha_ingreso) ?? '—'}</p>
            </div>
            {denuncia.fecha_vencimiento && !isRechazada && !denuncia.fecha_cierre && (
              <div>
                <p className="text-muted-foreground">Fecha estimada de cierre</p>
                <p className="font-semibold text-foreground">{formatearFechaLarga(denuncia.fecha_vencimiento) ?? '—'}</p>
              </div>
            )}
            {denuncia.fecha_cierre && (
              <div>
                <p className="text-muted-foreground">Fecha de cierre</p>
                <p className="font-semibold text-foreground">{formatearFechaLarga(denuncia.fecha_cierre) ?? '—'}</p>
              </div>
            )}
            {clasifInfo && (
              <div>
                <p className="text-muted-foreground">Clasificación</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${clasifInfo.color}`}>
                  {clasifInfo.label}
                </span>
              </div>
            )}
          </div>

          {denuncia.fecha_cierre && (
            <p className="text-[10px] text-muted-foreground italic">
              Para más información sobre la resolución de su caso, puede acercarse a la oficina de la UTLCC del GAMEA.
            </p>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-5 sm:p-6 shadow-sm">
        <StepperProgreso pasos={denuncia.pasos} />
      </div>

      <div className="bg-card border rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className={`absolute left-0 top-0 h-1 w-full ${isRechazada ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-secondary'}`} />
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isRechazada ? (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            ) : (
              <FileText className="w-4 h-4 text-primary" />
            )}
            {isRechazada ? 'Motivo de rechazo' : 'Estado de avance oficial'}
          </div>
          <p className="text-sm leading-relaxed text-foreground bg-muted/30 border p-4 rounded-xl font-medium">
            "{denuncia.mensaje_avance}"
          </p>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-md mx-auto">
          Sistema de Gestión de Denuncias — UTLCC GAMEA.
          Ley N° 974 de Transparencia y Lucha Contra la Corrupción.
        </p>
      </div>
    </div>
  );
}
