import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { ClipboardList, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import MisCasosLista from './mis-casos/MisCasosLista';
import MisCasosSheet from './mis-casos/MisCasosSheet';
import MisCasosModales from './mis-casos/MisCasosModales';
import { estadoLabels, estadoOrden } from './mis-casos/tipos';
import type { PageProps, Denuncia, Solicitud, Descargo } from './mis-casos/tipos';

export default function MisCasos({ grouped, investigadorActual, investigadores,
solicitudesByTicket = {}, descargosByTicket = {}, evaluacionesByTicket = {}, avisosPorTicket = {}, evaluacionesDelegadas = [],
evaluacionesDevueltas = [], canAct = true, destacar }: PageProps) {
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [archivadasOpen, setArchivadasOpen] = useState(false);
  const [processingTicket, setProcessingTicket] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('plazo');
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

  const [activeTab, setActiveTab] = useState<string>('asignada');
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [activeTab, sortBy]);

  useEffect(() => {
    const ticketToHighlight = destacar || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('destacar') : null);
    if (ticketToHighlight) {
      const todas: Denuncia[] = Object.values(grouped).flatMap(g => g);
      const found = todas.find((d) => d.ticket === ticketToHighlight);
      if (found) {
        setSelectedDenuncia(found);
        if (found.estado && estadoOrden.includes(found.estado)) {
          setActiveTab(found.estado);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const timer = setTimeout(() => {
          window.history.replaceState({}, '', route('denuncias.mis-casos'));
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [destacar, grouped]);

  // Sincroniza la denuncia seleccionada con los datos frescos que llegan de Inertia
  useEffect(() => {
    if (selectedDenuncia) {
      const todas: Denuncia[] = Object.values(grouped).flatMap(g => g as Denuncia[]);
      const updated = todas.find((d) => d.ticket === selectedDenuncia.ticket);
      if (updated) setSelectedDenuncia(updated);
    }
  }, [grouped]);

  const handleInvestigadorChange = (value: string) => {
    router.get(route('denuncias.mis-casos'), { investigador: value }, { preserveState: true, preserveScroll: true });
  };

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
  const countVisible = (estado: string) => {
    const items = grouped[estado] || [];
    return estado === 'cerrada' ? items.filter(d => !d.subestado).length : items.length;
  };

  const tabs = [
    ...estadoOrden.map((estado) => {
      return {
        value: estado,
        label: estadoLabels[estado]?.label || estado,
        count: countVisible(estado),
      };
    }),
    ...(evaluacionesPendientes > 0 ? [{
      value: 'evaluaciones',
      label: 'Evaluaciones delegadas',
      count: evaluacionesPendientes,
    }] : []),
  ];

  const pageSize = 10;

  return (
    <AppLayout>
      <Head title="Mis Casos — Transparencia UTLCC" />

      <PageHeader
        icon={<ClipboardList className="shrink-0" />}
        titulo="Mis Casos"
        subtitulo="Gestión de casos asignados y seguimiento de plazos de investigación."
        acciones={
          <>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Ordenar:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8 text-sm cursor-pointer">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plazo">Plazo</SelectItem>
                <SelectItem value="fecha">Fecha</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <MisCasosLista
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        grouped={grouped}
        sortBy={sortBy}
        investigadores={investigadores}
        avisosPorTicket={avisosPorTicket}
        evaluacionesDelegadas={evaluacionesDelegadas}
        pageSize={pageSize}
        pagina={pagina}
        setPagina={setPagina}
        setSelectedDenuncia={setSelectedDenuncia}
        processingTicket={processingTicket}
        onIniciar={handleIniciar}
        onToggleArchivar={handleToggleArchivar}
        archivadasOpen={archivadasOpen}
        setArchivadasOpen={setArchivadasOpen}
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
