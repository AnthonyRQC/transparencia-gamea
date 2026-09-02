import { useState } from 'react';
import { Separator } from '@/Components/ui/separator';
import { ChevronDown, ChevronRight, History, FileSearch, UserCheck } from 'lucide-react';

interface EvaluacionEntry {
  id: number;
  ticket: string;
  tecnico_nombre: string;
  delegada_por: string;
  delegada_at: string;
  justificacion_delegacion?: string | null;
  texto_evaluacion?: string | null;
  recomendacion?: string | null;
  devuelta_at?: string | null;
  estado: string;
}

interface TabEvaluacionPreviaProps {
  evaluaciones?: EvaluacionEntry[];
}

const recomendacionLabel: Record<string, string> = {
  admitir: 'Admitir',
  rechazar: 'Rechazar',
};

const recomendacionColor: Record<string, string> = {
  admitir: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rechazar: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

function formatDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function TabEvaluacionPrevia({ evaluaciones = [] }: TabEvaluacionPreviaProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  if (evaluaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileSearch className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Sin evaluación técnica previa</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Esta denuncia no pasó por evaluación técnica.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evaluaciones.map((e, i) => {
        const isExpanded = expanded[e.id] ?? (i === evaluaciones.length - 1);
        return (
          <div key={e.id} className="space-y-2">
            {i > 0 && <Separator />}
            <button
              type="button"
              onClick={() => setExpanded((prev) => ({ ...prev, [e.id]: !prev[e.id] }))}
              className="w-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <UserCheck className="w-3.5 h-3.5" />
              Evaluación por {e.tecnico_nombre}
            </button>

            {isExpanded && (
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium">{e.tecnico_nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      delegado el {formatDate(e.delegada_at)}
                    </span>
                  </div>
                  {e.justificacion_delegacion && (
                    <p className="text-xs text-muted-foreground">
                      Justificación: {e.justificacion_delegacion}
                    </p>
                  )}
                </div>

                {e.estado === 'devuelta' && e.devuelta_at && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <History className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-medium">Devuelta el {formatDate(e.devuelta_at)}</span>
                        {e.recomendacion && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${recomendacionColor[e.recomendacion] || ''}`}>
                            Recomienda: {recomendacionLabel[e.recomendacion] || e.recomendacion}
                          </span>
                        )}
                      </div>
                      {e.texto_evaluacion && (
                        <p className="text-sm whitespace-pre-wrap break-words bg-muted/30 rounded-lg px-3 py-2">
                          {e.texto_evaluacion}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
