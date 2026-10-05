import type { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { formatearFechaLarga } from '@/helpers/fechas';
import {
  ClipboardList, Archive, ChevronDown, ChevronRight, Play, ScrollText, FileSearch
} from 'lucide-react';
import DenunciaCard from '@/Components/Denuncias/Card/DenunciaCard';
import TabsDenuncias from '@/Components/Denuncias/Shared/TabsDenuncias';
import Paginacion from '@/Components/Denuncias/Shared/Paginacion';
import ListaVacia from '@/Components/Denuncias/Shared/ListaVacia';
import { isNewHours } from './helpers';
import { estadoLabels } from './tipos';
import type { Denuncia } from './tipos';

interface MetaPagina {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface MisCasosListaProps {
  tabs: Array<{ value: string; label: string; count?: number }>;
  activeTab: string;
  setActiveTab: (value: string) => void;
  /** Ítems de la página actual del servidor (ya con orden visual aplicado). */
  items: Denuncia[];
  meta: MetaPagina;
  onPaginaChange: (pagina: number) => void;
  investigadores: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  avisosPorTicket: Record<string, string[]>;
  evaluacionesDelegadas: any[];
  setSelectedDenuncia: (denuncia: Denuncia) => void;
  processingTicket: string | null;
  onIniciar: (ticket: string) => void;
  onToggleArchivar: (ticket: string) => void;
  archivadasOpen: boolean;
  setArchivadasOpen: (open: boolean) => void;
  renderEmptyState: (icon: any, titulo: string, descripcion: string) => ReactNode;
}

export default function MisCasosLista({ tabs, activeTab, setActiveTab, items, meta, onPaginaChange, investigadores, avisosPorTicket, evaluacionesDelegadas, setSelectedDenuncia, processingTicket, onIniciar, onToggleArchivar, archivadasOpen, setArchivadasOpen, renderEmptyState }: MisCasosListaProps) {
  const renderActions = (denuncia: Denuncia) => {
    if (denuncia.estado === 'asignada') {
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onIniciar(denuncia.ticket); }}
          disabled={processingTicket === denuncia.ticket}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          {processingTicket === denuncia.ticket ? 'Iniciando...' : 'Iniciar investigación'}
        </button>
      );
    }
    if (denuncia.estado === 'investigacion') {
      return null; // Se maneja en el footer del Sheet
    }
    if (denuncia.estado === 'informe') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
          <ScrollText className="w-3.5 h-3.5" />
          Informe pendiente
        </span>
      );
    }
    if (denuncia.estado === 'cerrada') {
      const isArchivada = denuncia.subestado === 'archivada';
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleArchivar(denuncia.ticket); }}
          disabled={processingTicket === denuncia.ticket}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold disabled:opacity-50 transition-colors"
        >
          <Archive className="w-3.5 h-3.5" />
          {isArchivada ? 'Desarchivar caso' : 'Archivar caso'}
        </button>
      );
    }
    return null;
  };

  return (
    <TabsDenuncias tabs={tabs} value={activeTab} onValueChange={setActiveTab}>
      {(value) => {
        if (value === 'evaluaciones') {
          const evaluacionesList = evaluacionesDelegadas;
          return (
            <div className="space-y-3">
              {evaluacionesList.length === 0 ? (
                <ListaVacia
                  icon={FileSearch}
                  titulo="No hay evaluaciones delegadas"
                  descripcion="Todas las evaluaciones han sido respondidas."
                />
              ) : (
                evaluacionesList.map((e: any) => (
                  <div key={e.id} className="w-full bg-card border border-border rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">{e.ticket}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Delegada el {formatearFechaLarga(e.delegada_at)}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => router.get(route('denuncias.evaluaciones'))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <FileSearch className="w-3.5 h-3.5" />
                        Ir a evaluaciones
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        }

        // Página del servidor (filtros + scope del tab ya aplicados).
        const isCierre = value === 'cerrada';
        const visible = isCierre ? items.filter((d) => !d.subestado) : items;
        const archivadas = isCierre ? items.filter((d) => d.subestado === 'archivada') : [];

        return (
          <div className="space-y-3">
            {visible.length === 0 && archivadas.length === 0 && (
              <>
                {renderEmptyState(
                  estadoLabels[value]?.icon || ClipboardList,
                  `Sin casos en ${estadoLabels[value]?.label?.toLowerCase() || value}`,
                  'No hay denuncias en esta fase actualmente.',
                )}
              </>
            )}

            {visible.map((d) => (
              <DenunciaCard
                key={d.ticket}
                denuncia={d}
                plazo={d.plazo}
                investigadores={investigadores}
                avisosPublicados={avisosPorTicket[d.ticket]}
                onClick={() => setSelectedDenuncia(d)}
                isNew={d.estado === 'asignada' && isNewHours(d.fecha_asignada || d.created_at)}
              >
                {renderActions(d) && (
                  <div className="pt-1">{renderActions(d)}</div>
                )}
              </DenunciaCard>
            ))}

            <Paginacion
              paginaActual={meta.current_page}
              totalPaginas={meta.last_page}
              totalElementos={meta.total}
              elementosPorPagina={meta.per_page}
              onPaginaChange={onPaginaChange}
            />

            {archivadas.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden mt-4">
                <button
                  type="button"
                  onClick={() => setArchivadasOpen(!archivadasOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  {archivadasOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <Archive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Archivadas</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground ml-auto">
                    {archivadas.length}
                  </span>
                </button>
                {archivadasOpen && (
                  <div className="space-y-2 p-3">
                    {archivadas.map((d) => (
                      <DenunciaCard
                        key={d.ticket}
                        denuncia={d}
                        plazo={null}
                        investigadores={investigadores}
                        avisosPublicados={avisosPorTicket[d.ticket]}
                        onClick={() => setSelectedDenuncia(d)}
                      >
                        {renderActions(d) && (
                          <div className="pt-1">{renderActions(d)}</div>
                        )}
                      </DenunciaCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }}
    </TabsDenuncias>
  );
}
