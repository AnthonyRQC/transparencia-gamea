import { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { ClipboardList, Search, FolderInput } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import ListaVacia from '@/Components/Denuncias/Shared/ListaVacia';
import ModalCargarLegacy from '@/Components/Denuncias/Modales/General/ModalCargarLegacy';
import { Button } from '@/Components/ui/button';
import { useCan } from '@/hooks/useCan';
import BandejaFiltros from './bandeja/BandejaFiltros';
import MisCasosLista from './mis-casos/MisCasosLista';
import MisCasosSheet from './mis-casos/MisCasosSheet';
import MisCasosModales from './mis-casos/MisCasosModales';
import { estadoLabels, estadoOrden } from './mis-casos/tipos';
import type { PageProps, Denuncia, Solicitud, Descargo } from './mis-casos/tipos';
import { esDelTab, sortItems, tabDesdeEstado } from './mis-casos/helpers';
import { useMisCasosFilters } from './mis-casos/useMisCasosFilters';
export default function MisCasos({ denuncias, contadores = {}, investigadorActual, investigadores,
solicitudesByTicket = {}, descargosByTicket = {}, evaluacionesByTicket = {}, avisosPorTicket = {}, opciones, filters, evaluacionesDelegadas = [],
evaluacionesDevueltas = [], canAct = true, destacar, destacarDenuncia = null }: PageProps) {
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [archivadasOpen, setArchivadasOpen] = useState(false);
  const [processingTicket, setProcessingTicket] = useState<string | null>(null);
  // Slice 2: filtros server-side (init desde el eco `filters` del servidor).
  // El filtro de investigador queda oculto: solo casos propios (forzado en servidor).
  const filtrosApi = useMisCasosFilters(filters);
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
  const [modalArchivosTicket, setModalArchivosTicket] = useState<string | null>(null);
  // Edit/Delete modals
  const [modalEditarSol, setModalEditarSol] = useState<Solicitud | null>(null);
  const [modalEliminarSol, setModalEliminarSol] = useState<{ id: number; nombre: string } | null>(null);
  const [modalEditarDesc, setModalEditarDesc] = useState<Descargo | null>(null);
  const [modalEliminarDesc, setModalEliminarDesc] = useState<{ id: number; nombre: string } | null>(null);
  const [processingEliminar, setProcessingEliminar] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(() => tabDesdeEstado(filters?.estado));
  // Fase B — Carga legacy (investigador: en curso autoasignado)
  const [modalLegacyOpen, setModalLegacyOpen] = useState(false);
  const puedeCargarLegacy = useCan('denuncia.cargar-legacy');

  // Página actual del servidor + orden visual del cliente (plazo display-only).
  // El servidor ya aplicó el scope del tab; se re-filtra por tab para la
  // semántica de intersección (igual que Bandeja: estado refina en el tab).
  const items = useMemo(
    () => sortItems(
      (denuncias?.data ?? []).filter((d) => activeTab === 'evaluaciones' || esDelTab(d.estado, activeTab)),
      filtrosApi.form.sortBy,
      activeTab,
    ),
    [denuncias, filtrosApi.form.sortBy, activeTab],
  );
  const meta = {
    current_page: denuncias?.current_page ?? 1,
    last_page: denuncias?.last_page ?? 1,
    per_page: denuncias?.per_page ?? 10,
    total: denuncias?.total ?? 0,
  };

  const cambiarTab = (nuevo: string) => {
    setActiveTab(nuevo);
    if (nuevo !== 'evaluaciones') filtrosApi.cambiarTab(nuevo);
  };

  const restablecerTodo = () => {
    setActiveTab('asignada');
    filtrosApi.restablecer();
  };

  const renderEmptyState = (icon: any, titulo: string, descripcion: string) => {
    if (filtrosApi.hayFiltros) {
      return (
        <ListaVacia
          icon={Search}
          titulo="Sin resultados para la búsqueda"
          descripcion="No se encontraron casos propios que coincidan con los filtros aplicados."
          accionLabel="Limpiar filtros"
          onAccion={restablecerTodo}
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

  useEffect(() => {
    const ticketToHighlight = destacar || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('destacar') : null);
    if (ticketToHighlight) {
      const candidatas = destacarDenuncia ? [destacarDenuncia, ...(denuncias?.data ?? [])] : (denuncias?.data ?? []);
      const found = candidatas.find((d) => d.ticket === ticketToHighlight);
      if (found) {
        setSelectedDenuncia(found);
        const tab = found.estado === 'admitida' ? 'asignada' : found.estado;
        if (estadoOrden.includes(tab)) {
          setActiveTab(tab);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const timer = setTimeout(() => {
          window.history.replaceState({}, '', route('denuncias.mis-casos'));
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [destacar, destacarDenuncia, denuncias]);

  // Sincroniza la denuncia seleccionada con los datos frescos que llegan de Inertia
  useEffect(() => {
    if (selectedDenuncia) {
      const candidatas = destacarDenuncia ? [destacarDenuncia, ...(denuncias?.data ?? [])] : (denuncias?.data ?? []);
      const updated = candidatas.find((d) => d.ticket === selectedDenuncia.ticket);
      if (updated) setSelectedDenuncia(updated);
    }
  }, [denuncias, destacarDenuncia]);

  const handleIniciar = (ticket: string) => {
    setProcessingTicket(ticket);
    router.post(route('denuncias.iniciar', { ticket }), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Investigación iniciada para ${ticket}`);
        setProcessingTicket(null);
        setSelectedDenuncia(null);
      },
      onError: () => {
        toast.error('Error al iniciar investigación');
        setProcessingTicket(null);
      },
    });
  };

  const handleToggleArchivar = (ticket: string) => {
    setProcessingTicket(ticket);
    router.post(route('denuncias.archivar', { ticket }), {}, {
      preserveScroll: true,
      onSuccess: () => {
        setProcessingTicket(null);
      },
      onError: () => {
        toast.error('Error al cambiar estado de archivado');
        setProcessingTicket(null);
      },
    });
  };

  const evaluacionesPendientes = evaluacionesDelegadas.length ?? 0;

  const tabs = [
    ...estadoOrden.map((estado) => {
      const count = estado === 'asignada'
        ? ((contadores?.asignada ?? 0) + (contadores?.admitida ?? 0))
        : (contadores?.[estado] ?? 0);
      return {
        value: estado,
        label: estadoLabels[estado]?.label || estado,
        count,
      };
    }),
    ...(evaluacionesPendientes > 0 ? [{
      value: 'evaluaciones',
      label: 'Evaluaciones delegadas',
      count: evaluacionesPendientes,
    }] : []),
  ];

  return (
    <AppLayout>
      <Head title="Mis Casos — Transparencia UTLCC" />

      <PageHeader
        icon={<ClipboardList className="shrink-0" />}
        titulo="Mis Casos"
        subtitulo="Gestión de casos asignados y seguimiento de plazos de investigación."
        acciones={
          puedeCargarLegacy ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setModalLegacyOpen(true)} className="gap-1.5 cursor-pointer">
              <FolderInput className="w-3.5 h-3.5" />
              Cargar caso en curso
            </Button>
          ) : undefined
        }
      />

      <BandejaFiltros
        api={filtrosApi}
        activeTab={activeTab}
        opciones={opciones}
        onRestablecer={restablecerTodo}
      />

      <MisCasosLista
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={cambiarTab}
        items={items}
        meta={meta}
        onPaginaChange={(p) => filtrosApi.irAPagina(activeTab, p)}
        investigadores={investigadores}
        avisosPorTicket={avisosPorTicket}
        evaluacionesDelegadas={evaluacionesDelegadas}
        setSelectedDenuncia={setSelectedDenuncia}
        processingTicket={processingTicket}
        onIniciar={handleIniciar}
        onToggleArchivar={handleToggleArchivar}
        archivadasOpen={archivadasOpen}
        setArchivadasOpen={setArchivadasOpen}
        renderEmptyState={renderEmptyState}
      />

      {selectedDenuncia && (
        <MisCasosSheet
          denuncia={selectedDenuncia}
          investigadores={investigadores}
          solicitudesByTicket={solicitudesByTicket}
          descargosByTicket={descargosByTicket}
          evaluacionesByTicket={evaluacionesByTicket}
          avisosPorTicket={avisosPorTicket}
          canAct={canAct}
          processingTicket={processingTicket}
          onIniciar={handleIniciar}
          onClose={() => setSelectedDenuncia(null)}
          onAbrirArchivos={setModalArchivosTicket}
          onNuevaSolicitud={setModalNuevaSolTicket}
          onResponderSolicitud={setModalRespondeSolId}
          onAmpliarSolicitud={setModalAmpliaSolId}
          onCancelarSolicitud={setModalCancelarSolId}
          onNuevoDescargo={setModalNuevoDescTicket}
          onNotificarDescargo={setModalNotificarDescId}
          onResponderDescargo={setModalRespDescId}
          onAmpliarDescargo={setModalAmpliaDescId}
          onCancelarDescargo={setModalCancelarDescId}
          onEditarSolicitud={setModalEditarSol}
          onEliminarSolicitud={setModalEliminarSol}
          onEditarDescargo={setModalEditarDesc}
          onEliminarDescargo={setModalEliminarDesc}
        />
      )}

      <ModalCargarLegacy open={modalLegacyOpen} onOpenChange={setModalLegacyOpen} />

      <MisCasosModales
        modalNuevaSolTicket={modalNuevaSolTicket}
        setModalNuevaSolTicket={setModalNuevaSolTicket}
        modalEditarSol={modalEditarSol}
        setModalEditarSol={setModalEditarSol}
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
        modalEditarDesc={modalEditarDesc}
        setModalEditarDesc={setModalEditarDesc}
        modalEliminarSol={modalEliminarSol}
        setModalEliminarSol={setModalEliminarSol}
        modalEliminarDesc={modalEliminarDesc}
        setModalEliminarDesc={setModalEliminarDesc}
        processingEliminar={processingEliminar}
        setProcessingEliminar={setProcessingEliminar}
        modalArchivosTicket={modalArchivosTicket}
        setModalArchivosTicket={setModalArchivosTicket}
        selectedDenuncia={selectedDenuncia}
      />
    </AppLayout>
  );
}
