import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import {
  CheckCircle2,
  InboxIcon, X, UserPlus, RotateCcw, ArrowRightLeft, Search,
  MoreHorizontal, FolderOpen, Pencil
} from 'lucide-react';
import { FileSearch, Undo2, CalendarArrowUp, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import DenunciaSheet from '@/Components/Denuncias/Sheet/DenunciaSheet';
import ListaVacia from '@/Components/Denuncias/Shared/ListaVacia';
import BandejaFiltros from './bandeja/BandejaFiltros';
import BandejaLista from './bandeja/BandejaLista';
import BandejaModales from './bandeja/BandejaModales';
import type { PageProps, Denuncia, Solicitud, Descargo } from './bandeja/tipos';

export default function Bandeja({ denuncias, porAsignar, enCurso, historial, contadores, investigadores, cargaInvestigadores, solicitudesByTicket = {}, descargosByTicket = {}, evaluacionesByTicket = {}, avisosPorTicket = {}, canAct = false, destacar }: PageProps) {
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [menuMasAbierto, setMenuMasAbierto] = useState(false);
  const menuMasRef = useRef<HTMLDivElement>(null);
  const [modalAdmisionTicket, setModalAdmisionTicket] = useState<string | null>(null);
  const [modalRechazoTicket, setModalRechazoTicket] = useState<string | null>(null);
  const [modalAsignacionTicket, setModalAsignacionTicket] = useState<string | null>(null);
  const [modalTraspasoTicket, setModalTraspasoTicket] = useState<string | null>(null);
  const [modalReabrirTicket, setModalReabrirTicket] = useState<string | null>(null);
  // Sprint 8 — Ampliación de plazo
  const [modalAmpliarPlazoDenuncia, setModalAmpliarPlazoDenuncia] = useState<Denuncia | null>(null);
  // Sprint 7.5 — Editar/Eliminar denuncia raíz
  const [modalEditarDenuncia, setModalEditarDenuncia] = useState<Denuncia | null>(null);
  const [modalEliminarDenunciaTicket, setModalEliminarDenunciaTicket] = useState<string | null>(null);
  // Sprint 7.6 — Archivos del caso
  const [modalArchivosTicket, setModalArchivosTicket] = useState<string | null>(null);
  // Sprint 7.5 — Conciliación de fechas
  const [modalConciliarDenuncia, setModalConciliarDenuncia] = useState<Denuncia | null>(null);
  // Sprint 7 modals
  const [modalDelegarEvaluacionTicket, setModalDelegarEvaluacionTicket] = useState<string | null>(null);
  const [modalReasumirEvaluacionTicket, setModalReasumirEvaluacionTicket] = useState<string | null>(null);
  // Sprint 4 modals
  const [modalNuevaSolTicket, setModalNuevaSolTicket] = useState<string | null>(null);
  const [modalRespondeSolId, setModalRespondeSolId] = useState<number | null>(null);
  const [modalAmpliaSolId, setModalAmpliaSolId] = useState<number | null>(null);
  const [modalNotificarDescId, setModalNotificarDescId] = useState<number | null>(null);
  const [modalRespDescId, setModalRespDescId] = useState<number | null>(null);
  const [modalAmpliaDescId, setModalAmpliaDescId] = useState<number | null>(null);
  const [modalCancelarSolId, setModalCancelarSolId] = useState<number | null>(null);
  const [modalCancelarDescId, setModalCancelarDescId] = useState<number | null>(null);
  const [modalNuevoDescTicket, setModalNuevoDescTicket] = useState<string | null>(null);
  // Edit/Delete modals
  const [modalEditarSol, setModalEditarSol] = useState<Solicitud | null>(null);
  const [modalEliminarSol, setModalEliminarSol] = useState<{ id: number; nombre: string } | null>(null);
  const [modalEditarDesc, setModalEditarDesc] = useState<Descargo | null>(null);
  const [modalEliminarDesc, setModalEliminarDesc] = useState<{ id: number; nombre: string } | null>(null);
  const [processingEliminar, setProcessingEliminar] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [sortBy, setSortBy] = useState('plazo');

  const [activeTab, setActiveTab] = useState<string>('por-admitir');
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [activeTab, search, filterTipo, sortBy]);

  // Cerrar menú Más al hacer click afuera o cambiar/cerrar denuncia seleccionada
  useEffect(() => {
    if (!menuMasAbierto) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuMasRef.current && !menuMasRef.current.contains(e.target as Node)) {
        setMenuMasAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuMasAbierto]);

  useEffect(() => {
    setMenuMasAbierto(false);
  }, [selectedDenuncia]);

  // Auto-abrir sheet si viene desde notificación
  useEffect(() => {
    const ticketToHighlight = destacar || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('destacar') : null);
    if (ticketToHighlight) {
      const todas = [...denuncias, ...porAsignar, ...enCurso, ...historial];
      const found = todas.find((d) => d.ticket === ticketToHighlight);
      if (found) {
        setSelectedDenuncia(found);
        if (['ingresada', 'evaluacion_tecnica'].includes(found.estado)) setActiveTab('por-admitir');
        else if (found.estado === 'admitida') setActiveTab('por-asignar');
        else if (['asignada', 'investigacion', 'informe'].includes(found.estado)) setActiveTab('en-curso');
        else if (['rechazada', 'cerrada'].includes(found.estado)) setActiveTab('historial');
        const timer = setTimeout(() => {
          window.history.replaceState({}, '', route('denuncias.bandeja'));
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [destacar, denuncias, porAsignar, enCurso, historial]);

  // Sincroniza la denuncia seleccionada con los datos frescos que llegan de Inertia
  useEffect(() => {
    if (selectedDenuncia) {
      const todas = [...denuncias, ...porAsignar, ...enCurso, ...historial];
      const updated = todas.find((d) => d.ticket === selectedDenuncia.ticket);
      if (updated) setSelectedDenuncia(updated);
    }
  }, [denuncias, porAsignar, enCurso, historial]);

  useEffect(() => {
    if (destacar) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', route('denuncias.bandeja'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [destacar]);

  const tabs = [
    { value: 'por-admitir', label: 'Por admitir', count: contadores?.porAdmitir ?? ((contadores?.ingresada ?? 0) + (contadores?.evaluacion_tecnica ?? 0)) },
    { value: 'por-asignar', label: 'Por asignar', count: contadores?.porAsignar ?? (contadores?.admitida ?? 0) },
    { value: 'en-curso', label: 'En curso', count: contadores?.enCurso ?? ((contadores?.asignada ?? 0) + (contadores?.investigacion ?? 0) + (contadores?.informe ?? 0)) },
    { value: 'historial', label: 'Historial', count: contadores?.historial ?? ((contadores?.rechazada ?? 0) + (contadores?.cerrada ?? 0)) },
    { value: 'vision-general', label: 'Visión general' },
  ];

  const renderEmptyState = (icon: any, titulo: string, descripcion: string) => {
    const tieneFiltros = search.trim() !== '' || filterTipo !== 'all';
    if (tieneFiltros) {
      return (
        <ListaVacia
          icon={Search}
          titulo="Sin resultados para la búsqueda"
          descripcion={`No se encontraron denuncias que coincidan con ${search.trim() ? `"${search.trim()}"` : 'los filtros seleccionados'}.`}
          accionLabel="Limpiar filtros"
          onAccion={() => { setSearch(''); setFilterTipo('all'); }}
        />
      );
    }
    return (
      <ListaVacia
        icon={icon}
        titulo={titulo}
        descripcion={descripcion}
      />
    );
  };

  const pageSize = 10;

  const investigadorActualId = (() => {
    const found = modalTraspasoTicket ? [...denuncias, ...porAsignar, ...enCurso, ...historial].find(d => d.ticket === modalTraspasoTicket) : null;
    if (!found) return null;
    return (found as any).investigador_id || (typeof (found as any).investigador === 'object' ? (found as any).investigador?.id : null);
  })();

  return (
    <AppLayout>
      <Head title="Bandeja de Admisión — Transparencia UTLCC" />

      <PageHeader
        icon={<InboxIcon className="shrink-0" />}
        titulo="Bandeja de Admisión"
        subtitulo="Gestión de denuncias institucionales. Haz clic en un caso para ver su detalle y acciones."
      />

      <BandejaFiltros
        search={search}
        setSearch={setSearch}
        filterTipo={filterTipo}
        setFilterTipo={setFilterTipo}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <BandejaLista
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        denuncias={denuncias}
        porAsignar={porAsignar}
        enCurso={enCurso}
        historial={historial}
        contadores={contadores}
        investigadores={investigadores}
        avisosPorTicket={avisosPorTicket}
        search={search}
        filterTipo={filterTipo}
        sortBy={sortBy}
        pageSize={pageSize}
        pagina={pagina}
        setPagina={setPagina}
        renderEmptyState={renderEmptyState}
        setSelectedDenuncia={setSelectedDenuncia}
        setModalAdmisionTicket={setModalAdmisionTicket}
        setModalRechazoTicket={setModalRechazoTicket}
        setModalDelegarEvaluacionTicket={setModalDelegarEvaluacionTicket}
        setModalReasumirEvaluacionTicket={setModalReasumirEvaluacionTicket}
        setModalAsignacionTicket={setModalAsignacionTicket}
      />

      {selectedDenuncia && (
        <DenunciaSheet
          denuncia={selectedDenuncia}
          plazo={selectedDenuncia.plazo}
          investigadores={investigadores}
          open={selectedDenuncia !== null}
          onOpenChange={(v) => { if (!v) setSelectedDenuncia(null); }}
          investigadorNombre={typeof selectedDenuncia.investigador === 'object' ? selectedDenuncia.investigador?.name : (selectedDenuncia.investigador || '—')}
          solicitudes={solicitudesByTicket[selectedDenuncia.ticket] || []}
          descargos={descargosByTicket[selectedDenuncia.ticket] || []}
          evaluaciones={evaluacionesByTicket?.[selectedDenuncia.ticket] || []}
          avisosPorTicket={avisosPorTicket}
          canAct={canAct}
          onAbrirArchivos={(t) => { setModalArchivosTicket(t); }}
          onNuevaSolicitud={(t) => { setModalNuevaSolTicket(t); }}
          onResponderSolicitud={(id) => { setModalRespondeSolId(id); }}
          onAmpliarSolicitud={(id) => { setModalAmpliaSolId(id); }}
          onCancelarSolicitud={(id) => { setModalCancelarSolId(id); }}
          onNuevoDescargo={(t) => { setModalNuevoDescTicket(t); }}
          onNotificarDescargo={(id) => { setModalNotificarDescId(id); }}
          onResponderDescargo={(id) => { setModalRespDescId(id); }}
          onAmpliarDescargo={(id) => { setModalAmpliaDescId(id); }}
          onCancelarDescargo={(id) => { setModalCancelarDescId(id); }}
          onEditarSolicitud={(id) => {
            const sol = solicitudesByTicket[selectedDenuncia.ticket]?.find(s => s.id === id) || null;
            setModalEditarSol(sol);
          }}
          onEliminarSolicitud={(id) => {
            const sol = solicitudesByTicket[selectedDenuncia.ticket]?.find(s => s.id === id);
             if (sol) setModalEliminarSol({ id: sol.id, nombre: sol.dependencia_destino });
          }}
          onEditarDescargo={(id) => {
            const desc = descargosByTicket[selectedDenuncia.ticket]?.find(d => d.id === id) || null;
            setModalEditarDesc(desc);
          }}
          onEliminarDescargo={(id) => {
            const desc = descargosByTicket[selectedDenuncia.ticket]?.find(d => d.id === id);
            if (desc) setModalEliminarDesc({ id: desc.id, nombre: desc.nombres_denunciado });
          }}
        >
          <div className="w-full flex items-center justify-between gap-2 flex-wrap">
            {/* Acciones principales directas (según estado del caso) */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedDenuncia.estado === 'ingresada' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setModalAdmisionTicket(selectedDenuncia.ticket); }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Admitir
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModalRechazoTicket(selectedDenuncia.ticket); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors border border-destructive/20 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Rechazar
                  </button>
                </>
              )}
              {selectedDenuncia.estado === 'evaluacion_tecnica' && (
                <button
                  type="button"
                  onClick={() => { setModalReasumirEvaluacionTicket(selectedDenuncia.ticket); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/40 cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Reasumir evaluación
                </button>
              )}
              {selectedDenuncia.estado === 'admitida' && (
                <button
                  type="button"
                  onClick={() => { setModalAsignacionTicket(selectedDenuncia.ticket); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Asignar investigador
                </button>
              )}
              {['asignada', 'investigacion', 'informe'].includes(selectedDenuncia.estado) && selectedDenuncia.investigador && (
                <button
                  type="button"
                  onClick={() => { setModalTraspasoTicket(selectedDenuncia.ticket); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-900 hover:bg-amber-500/25 text-xs font-semibold transition-colors dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Traspasar
                </button>
              )}
              {['rechazada', 'cerrada'].includes(selectedDenuncia.estado) && (
                <button
                  type="button"
                  onClick={() => { setModalReabrirTicket(selectedDenuncia.ticket); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reabrir denuncia
                </button>
              )}
            </div>

            {/* Menú compacto de herramientas secundarias (sin Radix Portal ni bloqueos de body) */}
            <div className="relative" ref={menuMasRef}>
              <button
                type="button"
                onClick={() => setMenuMasAbierto((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
                aria-expanded={menuMasAbierto}
                aria-haspopup="true"
                title="Más opciones del caso"
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                <span>Más</span>
              </button>

              {menuMasAbierto && (
                <div
                  className="absolute bottom-full right-0 mb-2 w-52 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg z-50 animate-in fade-in-0 zoom-in-95"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuMasAbierto(false);
                      setModalArchivosTicket(selectedDenuncia.ticket);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span>Archivos del caso</span>
                  </button>

                  {selectedDenuncia.estado === 'ingresada' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuMasAbierto(false);
                        setModalDelegarEvaluacionTicket(selectedDenuncia.ticket);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                    >
                      <FileSearch className="w-4 h-4 text-muted-foreground" />
                      <span>Delegar evaluación</span>
                    </button>
                  )}

                  {['admitida', 'asignada', 'investigacion', 'informe'].includes(selectedDenuncia.estado) && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuMasAbierto(false);
                        setModalAmpliarPlazoDenuncia(selectedDenuncia);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                    >
                      <CalendarArrowUp className="w-4 h-4 text-muted-foreground" />
                      <span>Ampliar plazo</span>
                    </button>
                  )}

                  {selectedDenuncia.estado === 'ingresada' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuMasAbierto(false);
                        setModalEditarDenuncia(selectedDenuncia);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                      <span>Editar denuncia</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMenuMasAbierto(false);
                      setModalConciliarDenuncia(selectedDenuncia);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <CalendarArrowUp className="w-4 h-4 text-muted-foreground" />
                    <span>Conciliar fechas</span>
                  </button>

                  {selectedDenuncia.estado === 'ingresada' && (
                    <>
                      <div className="-mx-1 my-1 h-px bg-muted" />
                      <button
                        type="button"
                        onClick={() => {
                          setMenuMasAbierto(false);
                          setModalEliminarDenunciaTicket(selectedDenuncia.ticket);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar denuncia</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DenunciaSheet>
      )}

      <BandejaModales
        modalAdmisionTicket={modalAdmisionTicket}
        setModalAdmisionTicket={setModalAdmisionTicket}
        modalRechazoTicket={modalRechazoTicket}
        setModalRechazoTicket={setModalRechazoTicket}
        modalAsignacionTicket={modalAsignacionTicket}
        setModalAsignacionTicket={setModalAsignacionTicket}
        modalTraspasoTicket={modalTraspasoTicket}
        setModalTraspasoTicket={setModalTraspasoTicket}
        investigadorActualId={investigadorActualId}
        modalReabrirTicket={modalReabrirTicket}
        setModalReabrirTicket={setModalReabrirTicket}
        modalNuevaSolTicket={modalNuevaSolTicket}
        setModalNuevaSolTicket={setModalNuevaSolTicket}
        modalRespondeSolId={modalRespondeSolId}
        setModalRespondeSolId={setModalRespondeSolId}
        modalAmpliaSolId={modalAmpliaSolId}
        setModalAmpliaSolId={setModalAmpliaSolId}
        modalNotificarDescId={modalNotificarDescId}
        setModalNotificarDescId={setModalNotificarDescId}
        modalRespDescId={modalRespDescId}
        setModalRespDescId={setModalRespDescId}
        modalAmpliaDescId={modalAmpliaDescId}
        setModalAmpliaDescId={setModalAmpliaDescId}
        modalCancelarSolId={modalCancelarSolId}
        setModalCancelarSolId={setModalCancelarSolId}
        modalCancelarDescId={modalCancelarDescId}
        setModalCancelarDescId={setModalCancelarDescId}
        modalNuevoDescTicket={modalNuevoDescTicket}
        setModalNuevoDescTicket={setModalNuevoDescTicket}
        modalEditarSol={modalEditarSol}
        setModalEditarSol={setModalEditarSol}
        modalEliminarSol={modalEliminarSol}
        setModalEliminarSol={setModalEliminarSol}
        modalEditarDesc={modalEditarDesc}
        setModalEditarDesc={setModalEditarDesc}
        modalEliminarDesc={modalEliminarDesc}
        setModalEliminarDesc={setModalEliminarDesc}
        processingEliminar={processingEliminar}
        setProcessingEliminar={setProcessingEliminar}
        modalAmpliarPlazoDenuncia={modalAmpliarPlazoDenuncia}
        setModalAmpliarPlazoDenuncia={setModalAmpliarPlazoDenuncia}
        modalArchivosTicket={modalArchivosTicket}
        setModalArchivosTicket={setModalArchivosTicket}
        modalConciliarDenuncia={modalConciliarDenuncia}
        setModalConciliarDenuncia={setModalConciliarDenuncia}
        modalDelegarEvaluacionTicket={modalDelegarEvaluacionTicket}
        setModalDelegarEvaluacionTicket={setModalDelegarEvaluacionTicket}
        modalReasumirEvaluacionTicket={modalReasumirEvaluacionTicket}
        setModalReasumirEvaluacionTicket={setModalReasumirEvaluacionTicket}
        modalEditarDenuncia={modalEditarDenuncia}
        setModalEditarDenuncia={setModalEditarDenuncia}
        modalEliminarDenunciaTicket={modalEliminarDenunciaTicket}
        setModalEliminarDenunciaTicket={setModalEliminarDenunciaTicket}
        setSelectedDenuncia={setSelectedDenuncia}
        selectedDenuncia={selectedDenuncia}
        investigadores={investigadores}
        cargaInvestigadores={cargaInvestigadores}
      />
    </AppLayout>
  );
}
