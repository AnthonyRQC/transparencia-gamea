import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
  Inbox, CheckCircle2, ClipboardList, Eye, Archive,
  InboxIcon, X, UserPlus, RotateCcw, ArrowRightLeft, Search
} from 'lucide-react';
import { FileText } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import AppLayout from '@/Components/Layout/AppLayout';
import DenunciaCard from '@/Components/Denuncias/DenunciaCard';
import DenunciaSheet from '@/Components/Denuncias/DenunciaSheet';
import ContadorCard from '@/Components/Denuncias/ContadorCard';
import TabsDenuncias from '@/Components/Denuncias/TabsDenuncias';
import ListaVacia from '@/Components/Denuncias/ListaVacia';
import ModalAdmision from '@/Components/Denuncias/ModalAdmision';
import ModalRechazo from '@/Components/Denuncias/ModalRechazo';
import AsignacionModal from '@/Components/Denuncias/AsignacionModal';
import TraspasoModal from '@/Components/Denuncias/TraspasoModal';
import ReabrirModal from '@/Components/Denuncias/ReabrirModal';
import ModalNuevaSolicitud from '@/Components/Denuncias/ModalNuevaSolicitud';
import ModalResponderSolicitud from '@/Components/Denuncias/ModalResponderSolicitud';
import ModalAmpliarSolicitud from '@/Components/Denuncias/ModalAmpliarSolicitud';
import ModalNotificarDescargo from '@/Components/Denuncias/ModalNotificarDescargo';
import ModalResponderDescargo from '@/Components/Denuncias/ModalResponderDescargo';
import ModalAmpliarDescargo from '@/Components/Denuncias/ModalAmpliarDescargo';
import ModalCancelarSolicitud from '@/Components/Denuncias/ModalCancelarSolicitud';
import ModalNuevoDescargo from '@/Components/Denuncias/ModalNuevoDescargo';
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
  justificacion_admision?: string | null;
  fecha_admitida?: string | null;
  justificacion_rechazo?: string | null;
  justificacion_reapertura?: string | null;
  fecha_reapertura?: string | null;
  tecnico_anterior?: string | null;
  bitacora?: BitacoraEntry[];
  estado: string;
  subestado?: string | null;
  tecnico?: string | null;
  fecha_asignada?: string | null;
  fecha_traspaso?: string | null;
  justificacion_traspaso?: string | null;
  fecha_rechazada?: string | null;
  plazo: PlazoInfo | null;
}

interface Contador {
  ingresada: number;
  admitida: number;
  asignada: number;
  investigacion: number;
  informe: number;
  cerrada: number;
  [key: string]: number;
}

interface PageProps {
  denuncias: Denuncia[];
  porAsignar: Denuncia[];
  enCurso: Denuncia[];
  historial: Denuncia[];
  contadores: Contador;
  tecnicos: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  cargaTecnicos?: Array<{ id: string; nombre: string; iniciales: string; color: string; activos: number; por_vencer: number; vencidos: number }>;
  solicitudesByTicket?: Record<string, Solicitud[]>;
  descargosByTicket?: Record<string, Descargo[]>;
  canAct?: boolean;
  destacar?: string;
}

const contadorConfig = [
  { key: 'ingresada', label: 'Ingresadas', icon: Inbox, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { key: 'admitida', label: 'Admitidas', icon: CheckCircle2, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { key: 'asignada', label: 'Asignadas', icon: ClipboardList, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { key: 'investigacion', label: 'Investigación', icon: Eye, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { key: 'informe', label: 'Informe Final', icon: FileText, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { key: 'cerrada', label: 'Cerradas', icon: Archive, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
];

export default function Bandeja({ denuncias, porAsignar, enCurso, historial, contadores, tecnicos, cargaTecnicos, solicitudesByTicket = {}, descargosByTicket = {}, canAct = false, destacar }: PageProps) {
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [modalAdmisionTicket, setModalAdmisionTicket] = useState<string | null>(null);
  const [modalRechazoTicket, setModalRechazoTicket] = useState<string | null>(null);
  const [modalAsignacionTicket, setModalAsignacionTicket] = useState<string | null>(null);
  const [modalTraspasoTicket, setModalTraspasoTicket] = useState<string | null>(null);
  const [modalReabrirTicket, setModalReabrirTicket] = useState<string | null>(null);
  // Sprint 8 — Ampliación de plazo
  const [modalAmpliarPlazoDenuncia, setModalAmpliarPlazoDenuncia] = useState<Denuncia | null>(null);
  // Sprint 4 modals
  const [modalNuevaSolTicket, setModalNuevaSolTicket] = useState<string | null>(null);
  const [modalRespondeSolId, setModalRespondeSolId] = useState<number | null>(null);
  const [modalAmpliaSolId, setModalAmpliaSolId] = useState<number | null>(null);
  const [modalNotificarDescId, setModalNotificarDescId] = useState<number | null>(null);
  const [modalRespDescId, setModalRespDescId] = useState<number | null>(null);
  const [modalAmpliaDescId, setModalAmpliaDescId] = useState<number | null>(null);
  const [modalCancelarSolId, setModalCancelarSolId] = useState<number | null>(null);
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

  // Auto-abrir sheet si viene desde notificación
  useEffect(() => {
    if (destacar) {
      const todas = [...denuncias, ...porAsignar, ...enCurso, ...historial];
      const found = todas.find((d) => d.ticket === destacar);
      if (found) {
        setSelectedDenuncia(found);
        const timer = setTimeout(() => {
          window.history.replaceState({}, '', route('denuncias.bandeja'));
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [destacar]);

  const tabs = [
    { value: 'por-admitir', label: 'Por admitir', count: contadores.ingresada },
    { value: 'por-asignar', label: 'Por asignar', count: contadores.admitida },
    { value: 'en-curso', label: 'En curso', count: contadores.asignada + contadores.investigacion + contadores.informe },
    { value: 'historial', label: 'Historial', count: contadores.rechazada + contadores.cerrada },
    { value: 'vision-general', label: 'Visión general' },
  ];

  const isNewHours = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return (Date.now() - d.getTime()) / (1000 * 60 * 60) < 24;
  };

  const filterAndSort = (items: Denuncia[]): Denuncia[] => {
    let filtered = items;
    if (search) {
      filtered = filtered.filter((d) =>
        d.ticket.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterTipo !== 'all') {
      filtered = filtered.filter((d) => d.tipo === filterTipo);
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'fecha') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'tecnico') return (a.tecnico || '').localeCompare(b.tecnico || '');
      return (a.plazo?.dias_restantes ?? 999) - (b.plazo?.dias_restantes ?? 999);
    });
  };

  return (
    <AppLayout>
      <Head title="Bandeja de Admisión — Transparencia UTLCC" />

      <div className="flex items-center gap-2 mb-1">
        <InboxIcon className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Bandeja de Admisión</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Gestión de denuncias. Click en una card para ver detalle y acciones.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ticket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="corrupcion">Corrupción</SelectItem>
              <SelectItem value="negacion">Negación</SelectItem>
              <SelectItem value="acompaniamiento">Acompañamiento</SelectItem>
              <SelectItem value="intervencion">Intervención</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plazo">Plazo</SelectItem>
              <SelectItem value="fecha">Fecha</SelectItem>
              <SelectItem value="tecnico">Técnico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TabsDenuncias tabs={tabs} defaultValue="por-admitir">
        {(value) => {
          if (value === 'por-admitir') {
            const filtered = filterAndSort(denuncias);
            return filtered.length === 0 ? (
              <ListaVacia
                icon={Inbox}
                titulo="No hay denuncias por admitir"
                descripcion="Todas las denuncias ingresadas han sido procesadas."
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((d) => (
                    <DenunciaCard
                      key={d.ticket}
                      denuncia={d}
                      plazo={d.plazo}
                      tecnicos={tecnicos}
                      onClick={() => setSelectedDenuncia(d)}
                      isNew={d.estado === 'ingresada' && isNewHours(d.created_at)}
                    >
                      <div className="flex items-center gap-2 pt-1">
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
                    </div>
                  </DenunciaCard>
                ))}
              </div>
            );
          }

          if (value === 'por-asignar') {
            const filtered = filterAndSort(porAsignar);
            return filtered.length === 0 ? (
              <ListaVacia
                icon={ClipboardList}
                titulo="No hay denuncias por asignar"
                descripcion="Todas las denuncias admitidas ya tienen un técnico asignado."
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    tecnicos={tecnicos}
                    onClick={() => setSelectedDenuncia(d)}
                  >
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModalAsignacionTicket(d.ticket); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Asignar técnico
                      </button>
                    </div>
                  </DenunciaCard>
                ))}
              </div>
            );
          }

          if (value === 'en-curso') {
            const filtered = filterAndSort(enCurso);
            return filtered.length === 0 ? (
              <ListaVacia
                icon={Eye}
                titulo="No hay denuncias en curso"
                descripcion="Todas las denuncias admitidas ya fueron asignadas y están en proceso."
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    tecnicos={tecnicos}
                    onClick={() => setSelectedDenuncia(d)}
                  />
                ))}
              </div>
            );
          }

          if (value === 'historial') {
            const filtered = filterAndSort(historial);
            return filtered.length === 0 ? (
              <ListaVacia
                icon={Archive}
                titulo="No hay denuncias en el historial"
                descripcion="No hay denuncias rechazadas o cerradas registradas."
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    tecnicos={tecnicos}
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
            );
          }

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {contadorConfig.map((c) => (
                <ContadorCard
                  key={c.key}
                  label={c.label}
                  valor={contadores[c.key]}
                  icon={c.icon}
                  color={c.color}
                />
              ))}
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
          tecnicoNombre={selectedDenuncia.tecnico && tecnicos[selectedDenuncia.tecnico]?.nombre || selectedDenuncia.tecnico || '—'}
          solicitudes={solicitudesByTicket[selectedDenuncia.ticket] || []}
          descargos={descargosByTicket[selectedDenuncia.ticket] || []}
          canAct={canAct}
          onNuevaSolicitud={(t) => { setSelectedDenuncia(null); setModalNuevaSolTicket(t); }}
          onResponderSolicitud={(id) => { setSelectedDenuncia(null); setModalRespondeSolId(id); }}
          onAmpliarSolicitud={(id) => { setSelectedDenuncia(null); setModalAmpliaSolId(id); }}
          onCancelarSolicitud={(id) => { setSelectedDenuncia(null); setModalCancelarSolId(id); }}
          onNuevoDescargo={(t) => { setSelectedDenuncia(null); setModalNuevoDescTicket(t); }}
          onNotificarDescargo={(id) => { setSelectedDenuncia(null); setModalNotificarDescId(id); }}
          onResponderDescargo={(id) => { setSelectedDenuncia(null); setModalRespDescId(id); }}
          onAmpliarDescargo={(id) => { setSelectedDenuncia(null); setModalAmpliaDescId(id); }}
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
          {selectedDenuncia.estado === 'ingresada' && (
            <>
              <button
                type="button"
                onClick={() => { const t = selectedDenuncia.ticket; setSelectedDenuncia(null); setModalAdmisionTicket(t); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Admitir
              </button>
              <button
                type="button"
                onClick={() => { const t = selectedDenuncia.ticket; setSelectedDenuncia(null); setModalRechazoTicket(t); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors"
              >
                <X className="w-4 h-4" />
                Rechazar
              </button>
            </>
          )}
          {selectedDenuncia.estado === 'admitida' && (
            <button
              type="button"
              onClick={() => { const t = selectedDenuncia.ticket; setSelectedDenuncia(null); setModalAsignacionTicket(t); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Asignar técnico
            </button>
          )}
          {['asignada', 'investigacion', 'informe'].includes(selectedDenuncia.estado) && selectedDenuncia.tecnico && (
            <button
              type="button"
              onClick={() => { setModalTraspasoTicket(selectedDenuncia.ticket); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Traspasar
            </button>
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
          {['rechazada', 'cerrada'].includes(selectedDenuncia.estado) && (
            <button
              type="button"
              onClick={() => { setModalReabrirTicket(selectedDenuncia.ticket); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reabrir denuncia
            </button>
          )}
        </DenunciaSheet>
      )}

      <ModalAdmision
        ticket={modalAdmisionTicket}
        open={modalAdmisionTicket !== null}
        onOpenChange={(v) => { if (!v) setModalAdmisionTicket(null); }}
      />
      <ModalRechazo
        ticket={modalRechazoTicket}
        open={modalRechazoTicket !== null}
        onOpenChange={(v) => { if (!v) setModalRechazoTicket(null); }}
      />
      <AsignacionModal
        ticket={modalAsignacionTicket}
        open={modalAsignacionTicket !== null}
        tecnicos={tecnicos}
        cargaTecnicos={cargaTecnicos}
        onOpenChange={(v) => { if (!v) setModalAsignacionTicket(null); }}
      />
      <TraspasoModal
        ticket={modalTraspasoTicket}
        open={modalTraspasoTicket !== null}
        tecnicos={tecnicos}
        onOpenChange={(v) => { if (!v) setModalTraspasoTicket(null); }}
      />
      <ReabrirModal
        ticket={modalReabrirTicket}
        open={modalReabrirTicket !== null}
        onOpenChange={(v) => { if (!v) setModalReabrirTicket(null); }}
      />
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
