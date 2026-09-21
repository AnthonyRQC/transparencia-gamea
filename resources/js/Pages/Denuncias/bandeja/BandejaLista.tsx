import { cn } from '@/lib/utils';
import { formatearFechaCorta } from '@/helpers/fechas';
import {
  Inbox, CheckCircle2, ClipboardList, Eye, Archive,
  X, UserPlus, ArrowRightLeft
} from 'lucide-react';
import { FileSearch, Undo2 } from 'lucide-react';
import { RECOMENDACION_COLOR } from '@/Components/Denuncias/Shared/semantica';
import DenunciaCard from '@/Components/Denuncias/Card/DenunciaCard';
import ContadorCard from '@/Components/Denuncias/Shared/ContadorCard';
import TabsDenuncias from '@/Components/Denuncias/Shared/TabsDenuncias';
import Paginacion from '@/Components/Denuncias/Shared/Paginacion';
import { filterAndSort, isNewHours } from './helpers';
import { contadorConfig } from './tipos';
import type { Denuncia, Contador } from './tipos';
import type { ReactNode } from 'react';

interface BandejaListaProps {
  tabs: Array<{ value: string; label: string; count?: number }>;
  activeTab: string;
  setActiveTab: (value: string) => void;
  denuncias: Denuncia[];
  porAsignar: Denuncia[];
  enCurso: Denuncia[];
  historial: Denuncia[];
  contadores: Contador;
  investigadores: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  avisosPorTicket: Record<string, string[]>;
  search: string;
  filterTipo: string;
  sortBy: string;
  pageSize: number;
  pagina: number;
  setPagina: (pagina: number) => void;
  renderEmptyState: (icon: any, titulo: string, descripcion: string) => ReactNode;
  setSelectedDenuncia: (denuncia: Denuncia) => void;
  setModalAdmisionTicket: (ticket: string) => void;
  setModalRechazoTicket: (ticket: string) => void;
  setModalDelegarEvaluacionTicket: (ticket: string) => void;
  setModalReasumirEvaluacionTicket: (ticket: string) => void;
  setModalAsignacionTicket: (ticket: string) => void;
}

export default function BandejaLista({ tabs, activeTab, setActiveTab, denuncias, porAsignar, enCurso, historial, contadores, investigadores, avisosPorTicket, search, filterTipo, sortBy, pageSize, pagina, setPagina, renderEmptyState, setSelectedDenuncia, setModalAdmisionTicket, setModalRechazoTicket, setModalDelegarEvaluacionTicket, setModalReasumirEvaluacionTicket, setModalAsignacionTicket }: BandejaListaProps) {
  return (
    <TabsDenuncias tabs={tabs} value={activeTab} onValueChange={setActiveTab}>
      {(value) => {
        if (value === 'por-admitir') {
          const filtered = filterAndSort(denuncias, { search, filterTipo, sortBy, activeTab });
          const totalPaginas = Math.ceil(filtered.length / pageSize) || 1;
          const paginated = filtered.slice((pagina - 1) * pageSize, pagina * pageSize);
          return filtered.length === 0 ? (
            renderEmptyState(
              Inbox,
              "No hay denuncias por admitir",
              "Todas las denuncias ingresadas han sido procesadas."
            )
          ) : (
            <div>
              <div className="space-y-3">
                {paginated.map((d) => {
                  const enEvaluacion = d.estado === 'evaluacion_tecnica';
                  const evaluacionDevuelta = d.estado === 'ingresada' && (d.evaluacion_tecnica_recomendacion || d.evaluacion_tecnica_texto);
                  return (
                    <DenunciaCard
                      key={d.ticket}
                      denuncia={d}
                      plazo={d.plazo}
                      investigadores={investigadores}
                      avisosPublicados={avisosPorTicket[d.ticket]}
                      onClick={() => setSelectedDenuncia(d)}
                      isNew={d.estado === 'ingresada' && !evaluacionDevuelta && isNewHours(d.created_at)}
                    >
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {enEvaluacion ? (
                          <>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300">
                              <FileSearch className="w-3 h-3" />
                              En evaluación por {d.evaluacion_tecnica_investigador_nombre || 'investigador'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              (delegada {formatearFechaCorta(d.evaluacion_tecnica_delegada_at, true) ?? ''})
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setModalReasumirEvaluacionTicket(d.ticket); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-900 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold transition-colors dark:bg-amber-500/20 dark:text-amber-300 cursor-pointer"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Reasumir
                            </button>
                          </>
                        ) : evaluacionDevuelta ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setModalAdmisionTicket(d.ticket); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Admitir
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setModalRechazoTicket(d.ticket); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              Rechazar
                            </button>
                            <span className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border",
                              d.evaluacion_tecnica_recomendacion === 'admitir'
                                ? RECOMENDACION_COLOR.admitir
                                : d.evaluacion_tecnica_recomendacion === 'rechazar'
                                  ? RECOMENDACION_COLOR.rechazar
                                  : "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground"
                            )}>
                              <FileSearch className="w-3 h-3" />
                              Evaluada por {d.evaluacion_tecnica_investigador_nombre || 'investigador'}
                              {d.evaluacion_tecnica_recomendacion === 'admitir' ? ' · Recomienda admitir' : d.evaluacion_tecnica_recomendacion === 'rechazar' ? ' · Recomienda rechazar' : ''}
                            </span>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setModalAdmisionTicket(d.ticket); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Admitir
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setModalRechazoTicket(d.ticket); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              Rechazar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setModalDelegarEvaluacionTicket(d.ticket); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-colors"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              Delegar eval.
                            </button>
                          </>
                        )}
                      </div>
                    </DenunciaCard>
                  );
                })}
              </div>
              <Paginacion
                paginaActual={pagina}
                totalPaginas={totalPaginas}
                totalElementos={filtered.length}
                elementosPorPagina={pageSize}
                onPaginaChange={(p) => setPagina(p)}
              />
            </div>
          );
        }

        if (value === 'por-asignar') {
          const filtered = filterAndSort(porAsignar, { search, filterTipo, sortBy, activeTab });
          const totalPaginas = Math.ceil(filtered.length / pageSize) || 1;
          const paginated = filtered.slice((pagina - 1) * pageSize, pagina * pageSize);
          return filtered.length === 0 ? (
            renderEmptyState(
              ClipboardList,
              "No hay denuncias por asignar",
              "Todas las denuncias admitidas ya tienen un investigador asignado."
            )
          ) : (
            <div>
              <div className="space-y-3">
                {paginated.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    investigadores={investigadores}
                    avisosPublicados={avisosPorTicket[d.ticket]}
                    onClick={() => setSelectedDenuncia(d)}
                  >
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModalAsignacionTicket(d.ticket); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Asignar investigador
                      </button>
                    </div>
                  </DenunciaCard>
                ))}
              </div>
              <Paginacion
                paginaActual={pagina}
                totalPaginas={totalPaginas}
                totalElementos={filtered.length}
                elementosPorPagina={pageSize}
                onPaginaChange={(p) => setPagina(p)}
              />
            </div>
          );
        }

        if (value === 'en-curso') {
          const filtered = filterAndSort(enCurso, { search, filterTipo, sortBy, activeTab });
          const totalPaginas = Math.ceil(filtered.length / pageSize) || 1;
          const paginated = filtered.slice((pagina - 1) * pageSize, pagina * pageSize);
          return filtered.length === 0 ? (
            renderEmptyState(
              Eye,
              "No hay denuncias en curso",
              "Todas las denuncias admitidas ya fueron asignadas y están en proceso."
            )
          ) : (
            <div>
              <div className="space-y-3">
                {paginated.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    investigadores={investigadores}
                    avisosPublicados={avisosPorTicket[d.ticket]}
                    onClick={() => setSelectedDenuncia(d)}
                  />
                ))}
              </div>
              <Paginacion
                paginaActual={pagina}
                totalPaginas={totalPaginas}
                totalElementos={filtered.length}
                elementosPorPagina={pageSize}
                onPaginaChange={(p) => setPagina(p)}
              />
            </div>
          );
        }

        if (value === 'historial') {
          const filtered = filterAndSort(historial, { search, filterTipo, sortBy, activeTab });
          const totalPaginas = Math.ceil(filtered.length / pageSize) || 1;
          const paginated = filtered.slice((pagina - 1) * pageSize, pagina * pageSize);
          return filtered.length === 0 ? (
            renderEmptyState(
              Archive,
              "No hay denuncias en el historial",
              "No hay denuncias rechazadas o cerradas registradas."
            )
          ) : (
            <div>
              <div className="space-y-3">
                {paginated.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    investigadores={investigadores}
                    avisosPublicados={avisosPorTicket[d.ticket]}
                    onClick={() => setSelectedDenuncia(d)}
                  >
                    {d.estado === 'rechazada' && d.justificacion_rechazo && (
                      <div className="pt-1">
                        <p className="text-xs text-destructive italic line-clamp-2">{d.justificacion_rechazo}</p>
                      </div>
                    )}
                  </DenunciaCard>
                ))}
              </div>
              <Paginacion
                paginaActual={pagina}
                totalPaginas={totalPaginas}
                totalElementos={filtered.length}
                elementosPorPagina={pageSize}
                onPaginaChange={(p) => setPagina(p)}
              />
            </div>
          );
        }

        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {contadorConfig.map((c) => (
              <ContadorCard
                key={c.key}
                label={c.label}
                valor={contadores[c.key] ?? 0}
                icon={c.icon}
                color={c.color}
              />
            ))}
          </div>
        );
      }}
    </TabsDenuncias>
  );
}
