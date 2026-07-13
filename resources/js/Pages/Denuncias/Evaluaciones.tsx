import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  FileSearch, CheckCircle2, List, FileText, SearchX
} from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import ListaVacia from '@/Components/Denuncias/ListaVacia';
import TabsDenuncias from '@/Components/Denuncias/TabsDenuncias';
import DenunciaSheet from '@/Components/Denuncias/DenunciaSheet';
import ModalDevolverEvaluacion from '@/Components/Denuncias/ModalDevolverEvaluacion';
import { cn } from '@/lib/utils';

interface Evaluacion {
  id: number;
  ticket: string;
  tecnico_nombre: string;
  delegada_at: string;
  texto_evaluacion?: string | null;
  recomendacion?: string | null;
  devuelta_at?: string | null;
  estado: string;
}

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
  fecha_vencimiento?: string;
}

interface DenunciaInfo {
  ticket: string;
  tipo?: string;
  estado?: string;
  hechos?: string;
  denunciante?: { nombres?: string; ci?: string; email?: string; telefono?: string };
  created_at?: string;
  plazo?: PlazoInfo | null;
}

interface PageProps {
  evaluacionesDelegadas: Evaluacion[];
  evaluacionesDevueltas: Evaluacion[];
  denunciasByTicket: Record<string, DenunciaInfo>;
  tecnicoActual: string;
  tecnicos: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
}

export default function Evaluaciones() {
  const props = usePage().props as unknown as PageProps;
  const { evaluacionesDelegadas, evaluacionesDevueltas, denunciasByTicket, tecnicos } = props;

  const [selectedDenuncia, setSelectedDenuncia] = useState<DenunciaInfo | null>(null);
  const [modalDevolverEval, setModalDevolverEval] = useState<Evaluacion | null>(null);

  const tabs = [
    { value: 'pendientes', label: 'Pendientes', count: evaluacionesDelegadas.length },
    { value: 'devueltas', label: 'Devueltas', count: evaluacionesDevueltas.length },
  ];

  const allTecnicos = tecnicos || {};

  return (
    <AppLayout>
      <Head title="Evaluaciones — Transparencia UTLCC" />

      <div className="flex items-center gap-2 mb-1">
        <FileSearch className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Evaluaciones Delegadas</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Evaluaciones técnicas previas delegadas por el Jefe de Unidad.
      </p>

      <TabsDenuncias tabs={tabs} defaultValue="pendientes">
        {(value) => {
          if (value === 'pendientes') {
            if (evaluacionesDelegadas.length === 0) {
              return (
                <ListaVacia
                  icon={FileSearch}
                  titulo="No hay evaluaciones pendientes"
                  descripcion="Todas las evaluaciones delegadas han sido respondidas."
                />
              );
            }
            return (
              <div className="space-y-3">
                {evaluacionesDelegadas.map((e) => {
                  const denuncia = denunciasByTicket[e.ticket];
                  return (
                    <div
                      key={e.id}
                      onClick={() => setSelectedDenuncia(denuncia || null)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 space-y-2 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">{e.ticket}</span>
                        <span className="text-xs text-muted-foreground">
                          {denuncia?.tipo === 'corrupcion' ? 'Corrupción' : 'Negación'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Delegada por el Jefe el{' '}
                        {new Date(e.delegada_at).toLocaleDateString('es-BO', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); setModalDevolverEval(e); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Evaluar y devolver
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // Devueltas
          if (evaluacionesDevueltas.length === 0) {
            return (
              <ListaVacia
                icon={CheckCircle2}
                titulo="No hay evaluaciones devueltas"
                descripcion="Las evaluaciones devueltas aparecerán aquí."
              />
            );
          }
          return (
            <div className="space-y-3">
              {evaluacionesDevueltas.map((e) => {
                const denuncia = denunciasByTicket[e.ticket];
                return (
                  <div
                    key={e.id}
                    onClick={() => setSelectedDenuncia(denuncia || null)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 space-y-2 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">{e.ticket}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        e.recomendacion === 'admitir'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        Recomienda: {e.recomendacion === 'admitir' ? 'Admitir' : 'Rechazar'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Devuelta el{' '}
                      {e.devuelta_at && new Date(e.devuelta_at).toLocaleDateString('es-BO', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                    {e.texto_evaluacion && (
                      <p className="text-sm whitespace-pre-wrap break-words bg-muted/30 rounded-lg px-3 py-2">
                        {e.texto_evaluacion}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }}
      </TabsDenuncias>

      {selectedDenuncia && (
        <DenunciaSheet
          denuncia={selectedDenuncia}
          plazo={selectedDenuncia.plazo}
          tecnicos={allTecnicos}
          open={selectedDenuncia !== null}
          onOpenChange={(v) => { if (!v) setSelectedDenuncia(null); }}
        />
      )}

      <ModalDevolverEvaluacion
        evaluacion={modalDevolverEval as any}
        denuncia={modalDevolverEval ? (denunciasByTicket[modalDevolverEval.ticket] ?? null) : null}
        open={modalDevolverEval !== null}
        onOpenChange={(v) => { if (!v) setModalDevolverEval(null); }}
      />
    </AppLayout>
  );
}
