import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import {
  ClipboardList, Search, FileText, Archive, ChevronDown, ChevronRight,
  Inbox, Eye, Play, CircleArrowRight, ArrowUpDown, ScrollText
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import AppLayout from '@/Components/Layout/AppLayout';
import DenunciaCard from '@/Components/Denuncias/DenunciaCard';
import DenunciaSheet from '@/Components/Denuncias/DenunciaSheet';
import TabsDenuncias from '@/Components/Denuncias/TabsDenuncias';
import ListaVacia from '@/Components/Denuncias/ListaVacia';
import SaltarFaseButton from '@/Components/Denuncias/SaltarFaseButton';
import ModalNuevaSolicitud from '@/Components/Denuncias/ModalNuevaSolicitud';
import ModalResponderSolicitud from '@/Components/Denuncias/ModalResponderSolicitud';
import ModalAmpliarSolicitud from '@/Components/Denuncias/ModalAmpliarSolicitud';
import ModalNotificarDescargo from '@/Components/Denuncias/ModalNotificarDescargo';
import ModalResponderDescargo from '@/Components/Denuncias/ModalResponderDescargo';
import ModalAmpliarDescargo from '@/Components/Denuncias/ModalAmpliarDescargo';
import ModalCancelarSolicitud from '@/Components/Denuncias/ModalCancelarSolicitud';
import ModalNuevoDescargo from '@/Components/Denuncias/ModalNuevoDescargo';
import ModalCancelarDescargo from '@/Components/Denuncias/ModalCancelarDescargo';
import ModalConfirmarEliminar from '@/Components/Denuncias/ModalConfirmarEliminar';
import ModalAmpliacionPlazo from '@/Components/Denuncias/ModalAmpliacionPlazo';

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
  fecha_vencimiento?: string;
}

interface Denunciado {
  conoce_identidad: boolean;
  nombres?: string;
  dependencia?: string;
  descripcion?: string;
}

interface Prueba {
  tipo: string;
  descripcion: string;
  testigo_nombre?: string;
  testigo_telefono?: string;
  archivo_nombre?: string;
}

interface BitacoraEntry {
  fecha: string;
  accion: string;
  detalle: string;
  usuario: string;
}

interface Solicitud {
  id: number;
  ticket: string;
  unidad_destino: string;
  detalle: string;
  fecha_envio: string;
  fecha_vencimiento: string;
  estado: string;
  plazo_dias?: number;
  fecha_respuesta?: string;
  respuesta?: string;
  motivo_cancelacion?: string;
  fecha_cancelacion?: string;
  archivos?: Array<{ nombre: string; tamano?: string; fecha_subida?: string }>;
  ampliaciones?: Array<{ dias: number; justificacion: string; fecha: string; archivo?: unknown }>;
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
}

interface Descargo {
  id: number;
  ticket: string;
  denunciado_idx: number;
  nombres_denunciado: string;
  dependencia_denunciado?: string;
  fecha_notificacion?: string | null;
  medio?: string | null;
  respaldo_archivo?: { nombre: string; tamano?: string } | null;
  fecha_vencimiento?: string | null;
  fecha_respuesta?: string | null;
  estado: string;
  resumen_descargo?: string | null;
  documentos?: Array<{ nombre: string; tamano?: string; fecha_subida?: string }>;
  ampliaciones?: Array<{ dias: number; justificacion: string; fecha: string }>;
}

interface Denuncia {
  ticket: string;
  tipo: string;
  escenario?: string;
  denunciante?: { nombres?: string; ci?: string; email?: string; telefono?: string };
  denunciados?: Denunciado[];
  detalles?: { categoria?: string; fecha?: string; hora?: string; lugar?: string };
  hechos?: string;
  pruebas?: Prueba[];
  created_at: string;
  estado: string;
  subestado?: string | null;
  tecnico?: string | null;
  fecha_asignada?: string | null;
  plazo: PlazoInfo | null;
  bitacora?: BitacoraEntry[];
}

interface Grouped {
  [estado: string]: Denuncia[];
}

interface PageProps {
  grouped: Grouped;
  tecnicoActual: string;
  tecnicos: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  solicitudesByTicket?: Record<string, Solicitud[]>;
  descargosByTicket?: Record<string, Descargo[]>;
  canAct?: boolean;
}

const estadoLabels: Record<string, { label: string; icon: any }> = {
  asignada: { label: 'Bandeja de entrada', icon: Inbox },
  investigacion: { label: 'Investigación', icon: Eye },
  informe: { label: 'Informe Final', icon: FileText },
  cerrada: { label: 'Cierre', icon: Archive },
};

const estadoOrden = ['asignada', 'investigacion', 'informe', 'cerrada'];

export default function MisCasos({ grouped, tecnicoActual, tecnicos, solicitudesByTicket = {}, descargosByTicket = {}, canAct = true }: PageProps) {
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
  // Sprint 8 — Ampliación de plazo
  const [modalAmpliarPlazoDenuncia, setModalAmpliarPlazoDenuncia] = useState<Denuncia | null>(null);
  // Edit/Delete modals
  const [modalEditarSol, setModalEditarSol] = useState<Solicitud | null>(null);
  const [modalEliminarSol, setModalEliminarSol] = useState<{ id: number; nombre: string } | null>(null);
  const [modalEditarDesc, setModalEditarDesc] = useState<Descargo | null>(null);
  const [modalEliminarDesc, setModalEliminarDesc] = useState<{ id: number; nombre: string } | null>(null);
  const [processingEliminar, setProcessingEliminar] = useState(false);

  const handleTecnicoChange = (value: string) => {
    router.get(route('denuncias.mis-casos'), { tecnico: value }, { preserveState: true, preserveScroll: true });
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

  const tabs = estadoOrden.map((estado) => {
    const items = grouped[estado] || [];
    const countVisible = estado === 'cerrada'
      ? items.filter((d) => !d.subestado).length
      : items.length;
    return {
      value: estado,
      label: estadoLabels[estado]?.label || estado,
      count: countVisible,
    };
  });

  const isNewHours = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return (Date.now() - d.getTime()) / (1000 * 60 * 60) < 24;
  };

  const sortItems = (items: Denuncia[]): Denuncia[] => {
    return [...items].sort((a, b) => {
      if (sortBy === 'fecha') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'tecnico') return (a.tecnico || '').localeCompare(b.tecnico || '');
      return (a.plazo?.dias_restantes ?? 999) - (b.plazo?.dias_restantes ?? 999);
    });
  };

  const renderActions = (denuncia: Denuncia) => {
    if (denuncia.estado === 'asignada') {
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleIniciar(denuncia.ticket); }}
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
    return null;
  };

  const countPendientes = (denuncia: Denuncia) => {
    const sols = solicitudesByTicket[denuncia.ticket] || [];
    const descs = descargosByTicket[denuncia.ticket] || [];
    const solsPend = sols.filter(s => s.estado === 'pendiente').length;
    const descsPend = descs.filter(d => ['pendiente_notif', 'notificado'].includes(d.estado)).length;
    return { solicitudes: solsPend, descargos: descsPend };
  };

  return (
    <AppLayout>
      <Head title="Mis Casos — Transparencia UTLCC" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Mis Casos</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Ver como:</span>
            <Select value={tecnicoActual} onValueChange={handleTecnicoChange}>
              <SelectTrigger className="w-full sm:w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tecnicos).map(([id, t]) => (
                  <SelectItem key={id} value={id}>{t.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Ordenar:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-28 h-8 text-sm">
                <ArrowUpDown className="w-3 h-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plazo">Plazo</SelectItem>
                <SelectItem value="fecha">Fecha</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <p className="text-muted-foreground mb-6">
        Gestión de casos asignados. Use el selector para ver como otro técnico.
      </p>

      <TabsDenuncias tabs={tabs}>
        {(value) => {
          const items = grouped[value] || [];
          const isCierre = value === 'cerrada';
          const sorted = sortItems(items);
          const visible = isCierre ? sorted.filter((d) => !d.subestado) : sorted;
          const archivadas = isCierre ? items.filter((d) => d.subestado === 'archivada') : [];

          return (
            <div className="space-y-3">
              {visible.length === 0 && archivadas.length === 0 && (
                <ListaVacia
                  icon={estadoLabels[value]?.icon || ClipboardList}
                  titulo={`Sin casos en ${estadoLabels[value]?.label?.toLowerCase() || value}`}
                  descripcion="No hay denuncias en esta fase actualmente."
                />
              )}

              {visible.map((d) => (
                <DenunciaCard
                  key={d.ticket}
                  denuncia={d}
                  plazo={d.plazo}
                  tecnicos={tecnicos}
                  onClick={() => setSelectedDenuncia(d)}
                  isNew={d.estado === 'asignada' && isNewHours(d.fecha_asignada || d.created_at)}
                >
                  {renderActions(d) && (
                    <div className="pt-1">{renderActions(d)}</div>
                  )}
                </DenunciaCard>
              ))}

              {archivadas.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden">
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
                      {sortItems(archivadas).map((d) => (
                        <DenunciaCard
                          key={d.ticket}
                          denuncia={d}
                          plazo={null}
                          tecnicos={tecnicos}
                          onClick={() => setSelectedDenuncia(d)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      </TabsDenuncias>

      {selectedDenuncia && (
        <DenunciaSheet
          denuncia={selectedDenuncia}
          plazo={selectedDenuncia.plazo}
          tecnicos={tecnicos}
          open={selectedDenuncia !== null}
          onOpenChange={(v) => { if (!v) setSelectedDenuncia(null); }}
          tecnicoNombre={tecnicos[tecnicoActual]?.nombre || tecnicoActual}
          solicitudes={solicitudesByTicket[selectedDenuncia.ticket] || []}
          descargos={descargosByTicket[selectedDenuncia.ticket] || []}
          canAct={canAct}
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
            if (sol) setModalEliminarSol({ id: sol.id, nombre: sol.unidad_destino });
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
          {selectedDenuncia.estado === 'asignada' && (
            <button
              type="button"
              onClick={() => handleIniciar(selectedDenuncia.ticket)}
              disabled={processingTicket === selectedDenuncia.ticket}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              {processingTicket === selectedDenuncia.ticket ? 'Iniciando...' : 'Iniciar investigación'}
            </button>
          )}
          {selectedDenuncia.estado === 'investigacion' && (
            <SaltarFaseButton
              ticket={selectedDenuncia.ticket}
              solicitudesPendientes={countPendientes(selectedDenuncia).solicitudes}
              descargosPendientes={countPendientes(selectedDenuncia).descargos}
            />
          )}
          {['admitida', 'asignada', 'investigacion', 'informe'].includes(selectedDenuncia.estado) && (
            <button
              type="button"
              onClick={() => { setModalAmpliarPlazoDenuncia(selectedDenuncia); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-800 text-sm font-semibold hover:bg-indigo-200 transition-colors dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Ampliar plazo
            </button>
          )}
        </DenunciaSheet>
      )}

      {/* Sprint 4 modales */}
      <ModalNuevaSolicitud
        ticket={modalEditarSol ? modalEditarSol.ticket : modalNuevaSolTicket}
        solicitudToEdit={modalEditarSol}
        open={modalNuevaSolTicket !== null || modalEditarSol !== null}
        onOpenChange={(v) => { if (!v) { setModalNuevaSolTicket(null); setModalEditarSol(null); } }}
      />
      <ModalResponderSolicitud
        solicitudId={modalRespondeSolId}
        open={modalRespondeSolId !== null}
        onOpenChange={(v) => { if (!v) setModalRespondeSolId(null); }}
      />
      <ModalAmpliarSolicitud
        solicitudId={modalAmpliaSolId}
        open={modalAmpliaSolId !== null}
        onOpenChange={(v) => { if (!v) setModalAmpliaSolId(null); }}
      />
      <ModalNotificarDescargo
        descargoId={modalNotificarDescId}
        open={modalNotificarDescId !== null}
        onOpenChange={(v) => { if (!v) setModalNotificarDescId(null); }}
      />
      <ModalResponderDescargo
        descargoId={modalRespDescId}
        open={modalRespDescId !== null}
        onOpenChange={(v) => { if (!v) setModalRespDescId(null); }}
      />
      <ModalAmpliarDescargo
        descargoId={modalAmpliaDescId}
        open={modalAmpliaDescId !== null}
        onOpenChange={(v) => { if (!v) setModalAmpliaDescId(null); }}
      />
      <ModalCancelarSolicitud
        solicitudId={modalCancelarSolId}
        open={modalCancelarSolId !== null}
        onOpenChange={(v: boolean) => { if (!v) setModalCancelarSolId(null); }}
      />
      <ModalCancelarDescargo
        descargoId={modalCancelarDescId}
        open={modalCancelarDescId !== null}
        onOpenChange={(v: boolean) => { if (!v) setModalCancelarDescId(null); }}
      />
      <ModalNuevoDescargo
        ticket={modalEditarDesc ? modalEditarDesc.ticket : modalNuevoDescTicket}
        denunciados={selectedDenuncia?.denunciados || []}
        descargoToEdit={modalEditarDesc}
        open={modalNuevoDescTicket !== null || modalEditarDesc !== null}
        onOpenChange={(v: boolean) => { if (!v) { setModalNuevoDescTicket(null); setModalEditarDesc(null); } }}
      />
      <ModalConfirmarEliminar
        open={modalEliminarSol !== null}
        onOpenChange={(v) => { if (!v) setModalEliminarSol(null); }}
        onConfirm={() => {
          if (!modalEliminarSol) return;
          setProcessingEliminar(true);
          router.post(route('denuncias.solicitudes.eliminar', { id: modalEliminarSol.id }), {}, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Solicitud eliminada correctamente'); setModalEliminarSol(null); setProcessingEliminar(false); },
            onError: () => { toast.error('Error al eliminar solicitud'); setProcessingEliminar(false); },
            onFinish: () => setProcessingEliminar(false),
          });
        }}
        titulo="¿Eliminar solicitud?"
        descripcion="Esta solicitud se ocultará de la lista. Los datos se conservarán para auditoría."
        itemNombre={modalEliminarSol?.nombre || ''}
        processing={processingEliminar}
      />
      <ModalConfirmarEliminar
        open={modalEliminarDesc !== null}
        onOpenChange={(v) => { if (!v) setModalEliminarDesc(null); }}
        onConfirm={() => {
          if (!modalEliminarDesc) return;
          setProcessingEliminar(true);
          router.post(route('denuncias.descargos.eliminar', { id: modalEliminarDesc.id }), {}, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Descargo eliminado correctamente'); setModalEliminarDesc(null); setProcessingEliminar(false); },
            onError: () => { toast.error('Error al eliminar descargo'); setProcessingEliminar(false); },
            onFinish: () => setProcessingEliminar(false),
          });
        }}
        titulo="¿Eliminar descargo?"
        descripcion="Este descargo se ocultará de la lista. Los datos se conservarán para auditoría."
        itemNombre={modalEliminarDesc?.nombre || ''}
        processing={processingEliminar}
      />
      <ModalAmpliacionPlazo
        denuncia={modalAmpliarPlazoDenuncia}
        open={modalAmpliarPlazoDenuncia !== null}
        onOpenChange={(v) => { if (!v) setModalAmpliarPlazoDenuncia(null); }}
        tecnicos={tecnicos}
      />
    </AppLayout>
  );
}
