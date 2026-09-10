import { useState } from 'react';
import { Separator } from '@/Components/ui/separator';
import { ChevronDown, ChevronRight, History, FileSearch, UserCheck } from 'lucide-react';
import ListaVacia from '../Shared/ListaVacia';
import { formatearFechaLarga } from '@/helpers/fechas';
import { RECOMENDACION_COLOR as recomendacionColor, RECOMENDACION_LABEL as recomendacionLabel } from '../Shared/semantica';

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

export default function TabEvaluacionPrevia({ evaluaciones = [] }: TabEvaluacionPreviaProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  if (evaluaciones.length === 0) {
    return (
      <ListaVacia
        icon={FileSearch}
        titulo="Sin evaluación técnica previa"
        descripcion="Esta denuncia no requirió evaluación técnica preliminar."
      />
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
                      delegado el {formatearFechaLarga(e.delegada_at) ?? ''}
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
                        <span className="font-medium">Devuelta el {formatearFechaLarga(e.devuelta_at) ?? ''}</span>
                        {e.recomendacion && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${recomendacionColor[e.recomendacion] || ''}`}>
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
