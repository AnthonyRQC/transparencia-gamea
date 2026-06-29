import { CheckCircle2, Clock, XCircle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProgresoProps {
  pasos: {
    recepcion: boolean;
    evaluacion: boolean;
    investigacion: boolean;
    resolucion: boolean;
    rechazada: boolean;
  };
}

const steps = [
  { key: 'recepcion' as const, label: 'Recepción', desc: 'Registro de la denuncia' },
  { key: 'evaluacion' as const, label: 'Evaluación del Jefe', desc: 'Análisis de admisibilidad' },
  { key: 'investigacion' as const, label: 'Investigación', desc: 'Búsqueda y análisis' },
  { key: 'resolucion' as const, label: 'Resolución / Cierre', desc: 'Informe final' },
];

export default function StepperProgreso({ pasos }: StepperProgresoProps) {
  const isRejected = pasos.rechazada;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
        Línea de avance del proceso
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
        {steps.map((step, idx) => {
          const isCompleted = pasos[step.key];
          const isCurrent = !isCompleted && (
            idx === 0 || steps.slice(0, idx).every(s => pasos[s.key])
          );
          const stepIndex = idx + 1;

          return (
            <div key={step.key} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
              {idx < steps.length - 1 && (
                <div className={cn(
                  "hidden sm:block absolute left-6 top-4 w-[calc(100%-1.5rem)] h-0.5 -z-10",
                  isCompleted ? "bg-primary" : "bg-border"
                )} />
              )}
              {isCompleted ? (
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : isCurrent && !isRejected ? (
                <div className="w-8 h-8 shrink-0 rounded-full bg-secondary flex items-center justify-center ring-4 ring-secondary/20 animate-pulse">
                  <Clock className="w-5 h-5 text-secondary-foreground" />
                </div>
              ) : isRejected && idx === 1 ? (
                <div className="w-8 h-8 shrink-0 rounded-full bg-destructive flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive-foreground" />
                </div>
              ) : (
                <div className="w-8 h-8 shrink-0 rounded-full border bg-background flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">{stepIndex}</span>
                </div>
              )}
              <div className="sm:mt-1.5">
                <p className={cn(
                  "text-xs font-bold",
                  isCompleted && !isRejected && "text-primary",
                  isCurrent && !isRejected && "text-secondary-foreground",
                  isRejected && step.key === 'evaluacion' && "text-destructive",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}>
                  {isRejected && step.key === 'evaluacion' ? 'Rechazada' : step.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {isRejected && step.key === 'evaluacion' ? 'Denuncia no admitida' : step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
