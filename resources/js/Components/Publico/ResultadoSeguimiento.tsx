import { ShieldCheck, FileText, Clock, AlertTriangle } from 'lucide-react';
import StepperProgreso from '@/Components/Publico/StepperProgreso';

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

const clasificacionLabels: Record<string, { label: string; color: string }> = {
  penal: { label: 'Penal', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
  civil: { label: 'Civil', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  administrativo: { label: 'Administrativo', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  sin_indicios: { label: 'Sin Indicios', color: 'bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-400' },
  medida_correctiva: { label: 'Medida Correctiva', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
  archivado: { label: 'Archivado', color: 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400' },
};

const estadoBadge: Record<string, { label: string; color: string }> = {
  ingresada: { label: 'En Evaluación', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  admitida: { label: 'Admitida', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
  asignada: { label: 'En Investigación', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
  investigacion: { label: 'En Investigación', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
  informe: { label: 'Informe Final', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  cerrada: { label: 'Cerrada', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
  rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ResultadoSeguimiento({ denuncia }: ResultadoSeguimientoProps) {
  const badge = estadoBadge[denuncia.estado] ?? { label: denuncia.estado, color: 'bg-muted text-muted-foreground' };
  const clasifInfo = denuncia.clasificacion ? clasificacionLabels[denuncia.clasificacion] : null;
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
              <p className="font-semibold text-foreground">{formatDate(denuncia.fecha_ingreso)}</p>
            </div>
            {denuncia.fecha_vencimiento && !isRechazada && !denuncia.fecha_cierre && (
              <div>
                <p className="text-muted-foreground">Fecha estimada de cierre</p>
                <p className="font-semibold text-foreground">{formatDate(denuncia.fecha_vencimiento)}</p>
              </div>
            )}
            {denuncia.fecha_cierre && (
              <div>
                <p className="text-muted-foreground">Fecha de cierre</p>
                <p className="font-semibold text-foreground">{formatDate(denuncia.fecha_cierre)}</p>
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
