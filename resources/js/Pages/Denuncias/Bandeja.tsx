import { useState, useEffect, useRef } from 'react';
import { formatearFechaCorta } from '@/helpers/fechas';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Inbox, CheckCircle2, ClipboardList, Eye, Archive,
  InboxIcon, X, UserPlus, RotateCcw, ArrowRightLeft, Search,
  MoreHorizontal, FolderOpen, Pencil
} from 'lucide-react';
import { FileText, FileSearch, Undo2, CalendarArrowUp, Trash2 } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import AppLayout from '@/Components/Layout/AppLayout';
import DenunciaCard from '@/Components/Denuncias/DenunciaCard';
import DenunciaSheet from '@/Components/Denuncias/DenunciaSheet';
import ContadorCard from '@/Components/Denuncias/ContadorCard';
import TabsDenuncias from '@/Components/Denuncias/TabsDenuncias';
import Paginacion from '@/Components/Denuncias/Paginacion';
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
import ModalCancelarDescargo from '@/Components/Denuncias/ModalCancelarDescargo';
import ModalConfirmarEliminar from '@/Components/Denuncias/ModalConfirmarEliminar';
import ModalAmpliacionPlazo from '@/Components/Denuncias/ModalAmpliacionPlazo';
import ModalDelegarEvaluacion from '@/Components/Denuncias/ModalDelegarEvaluacion';
import ModalEditarDenuncia from '@/Components/Denuncias/ModalEditarDenuncia';
import ModalArchivosDelCaso from '@/Components/Denuncias/ModalArchivosDelCaso';
import ModalConciliarFechas from '@/Components/Denuncias/ModalConciliarFechas';
import ModalConfirmar from '@/Components/Denuncias/ModalConfirmar';

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
  dependencia_destino: string;
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
  tecnico?: any;
  fecha_asignada?: string | null;
  fecha_traspaso?: string | null;
  justificacion_traspaso?: string | null;
  fecha_rechazada?: string | null;
  evaluacion_tecnica_tecnico_nombre?: string | null;
  evaluacion_tecnica_recomendacion?: string | null;
  evaluacion_tecnica_delegada_at?: string | null;
  evaluacion_tecnica_texto?: string | null;
  plazo: PlazoInfo | null;
}

interface Contador {
  ingresada?: number;
  evaluacion_tecnica?: number;
  admitida?: number;
  asignada?: number;
  investigacion?: number;
  informe?: number;
  rechazada?: number;
  cerrada?: number;
  porAdmitir?: number;
  porAsignar?: number;
  enCurso?: number;
  historial?: number;
  activos?: number;
  [key: string]: number | undefined;
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
  evaluacionesByTicket?: Record<string, any[]>;
  canAct?: boolean;
  destacar?: string;
}

const contadorConfig = [
  { key: 'ingresada', label: 'Ingresadas', icon: Inbox, color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  { key: 'evaluacion_tecnica', label: 'En evaluación', icon: FileSearch, color: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300' },
  { key: 'admitida', label: 'Admitidas', icon: CheckCircle2, color: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300' },
  { key: 'asignada', label: 'Asignadas', icon: ClipboardList, color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  { key: 'investigacion', label: 'Investigación', icon: Eye, color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
  { key: 'informe', label: 'Informe Final', icon: FileText, color: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300' },
  { key: 'cerrada', label: 'Cerradas', icon: Archive, color: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300' },
];

export default function Bandeja({ denuncias, porAsignar, enCurso, historial, contadores, tecnicos, cargaTecnicos, solicitudesByTicket = {}, descargosByTicket = {}, evaluacionesByTicket = {}, canAct = false, destacar }: PageProps) {
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

  const isNewHours = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return (Date.now() - d.getTime()) / (1000 * 60 * 60) < 24;
  };

  const filterAndSort = (items: Denuncia[]): Denuncia[] => {
    let filtered = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((d) =>
        d.ticket.toLowerCase().includes(q) ||
        (d.denunciante?.nombres && d.denunciante.nombres.toLowerCase().includes(q))
      );
    }
    if (filterTipo !== 'all') {
      filtered = filtered.filter((d) => d.tipo === filterTipo);
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'fecha') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'tecnico') {
        const tecA = typeof a.tecnico === 'object' ? (a.tecnico?.name || '') : (a.tecnico || '');
        const tecB = typeof b.tecnico === 'object' ? (b.tecnico?.name || '') : (b.tecnico || '');
        return tecA.localeCompare(tecB);
      }
      if (activeTab === 'por-admitir') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return (a.plazo?.dias_restantes ?? 999) - (b.plazo?.dias_restantes ?? 999);
    });
  };

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

  return (
    <AppLayout>
      <Head title="Bandeja de Admisión — Transparencia UTLCC" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <InboxIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Bandeja de Admisión</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Gestión de denuncias institucionales. Haz clic en un caso para ver su detalle y acciones.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por N° de denuncia o denunciante..."
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

      <TabsDenuncias tabs={tabs} value={activeTab} onValueChange={setActiveTab}>
        {(value) => {
          if (value === 'por-admitir') {
            const filtered = filterAndSort(denuncias);
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
                        tecnicos={tecnicos}
                        onClick={() => setSelectedDenuncia(d)}
                        isNew={d.estado === 'ingresada' && !evaluacionDevuelta && isNewHours(d.created_at)}
                      >
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {enEvaluacion ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300">
                                <FileSearch className="w-3 h-3" />
                                En evaluación por {d.evaluacion_tecnica_tecnico_nombre || 'técnico'}
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
                                  ? "bg-teal-500/10 text-teal-800 border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300"
                                  : d.evaluacion_tecnica_recomendacion === 'rechazar'
                                    ? "bg-pink-600/10 text-pink-800 border-pink-600/30 dark:bg-pink-600/20 dark:text-pink-300"
                                    : "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground"
                              )}>
                                <FileSearch className="w-3 h-3" />
                                Evaluada por {d.evaluacion_tecnica_tecnico_nombre || 'técnico'}
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
            const filtered = filterAndSort(porAsignar);
            const totalPaginas = Math.ceil(filtered.length / pageSize) || 1;
            const paginated = filtered.slice((pagina - 1) * pageSize, pagina * pageSize);
            return filtered.length === 0 ? (
              renderEmptyState(
                ClipboardList,
                "No hay denuncias por asignar",
                "Todas las denuncias admitidas ya tienen un técnico asignado."
              )
            ) : (
              <div>
                <div className="space-y-3">
                  {paginated.map((d) => (
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
            const filtered = filterAndSort(enCurso);
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
                      tecnicos={tecnicos}
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
            const filtered = filterAndSort(historial);
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

      {selectedDenuncia && (
        <DenunciaSheet
          denuncia={selectedDenuncia}
          plazo={selectedDenuncia.plazo}
          tecnicos={tecnicos}
          open={selectedDenuncia !== null}
          onOpenChange={(v) => { if (!v) setSelectedDenuncia(null); }}
          tecnicoNombre={typeof selectedDenuncia.tecnico === 'object' ? selectedDenuncia.tecnico?.name : (selectedDenuncia.tecnico || '—')}
          solicitudes={solicitudesByTicket[selectedDenuncia.ticket] || []}
          descargos={descargosByTicket[selectedDenuncia.ticket] || []}
          evaluaciones={evaluacionesByTicket?.[selectedDenuncia.ticket] || []}
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
                  Asignar técnico
                </button>
              )}
              {['asignada', 'investigacion', 'informe'].includes(selectedDenuncia.estado) && selectedDenuncia.tecnico && (
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
        tecnicoActualId={(() => {
          const found = modalTraspasoTicket ? [...denuncias, ...porAsignar, ...enCurso, ...historial].find(d => d.ticket === modalTraspasoTicket) : null;
          if (!found) return null;
          return (found as any).tecnico_id || (typeof (found as any).tecnico === 'object' ? (found as any).tecnico?.id : null);
        })()}
        open={modalTraspasoTicket !== null}
        tecnicos={tecnicos}
        cargaTecnicos={cargaTecnicos}
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
      <ModalArchivosDelCaso
        ticket={modalArchivosTicket}
        open={modalArchivosTicket !== null}
        onOpenChange={(v) => { if (!v) setModalArchivosTicket(null); }}
      />
      <ModalConciliarFechas
        ticket={modalConciliarDenuncia?.ticket ?? null}
        denuncia={modalConciliarDenuncia}
        open={modalConciliarDenuncia !== null}
        onOpenChange={(v) => { if (!v) setModalConciliarDenuncia(null); }}
      />
      <ModalDelegarEvaluacion
        ticket={modalDelegarEvaluacionTicket}
        open={modalDelegarEvaluacionTicket !== null}
        onOpenChange={(v) => { if (!v) setModalDelegarEvaluacionTicket(null); }}
        tecnicos={tecnicos}
        cargaTecnicos={cargaTecnicos}
      />
      <ModalConfirmar
        isOpen={modalReasumirEvaluacionTicket !== null}
        onClose={() => setModalReasumirEvaluacionTicket(null)}
        onConfirm={() => {
          if (!modalReasumirEvaluacionTicket) return;
          const ticket = modalReasumirEvaluacionTicket;
          setModalReasumirEvaluacionTicket(null);
          router.post(route('denuncias.reasumir-evaluacion', { ticket }), {}, {
            preserveScroll: true,
            onSuccess: () => {
              toast.success('Evaluación reasumida correctamente');
            },
            onError: () => toast.error('Error al reasumir evaluación'),
          });
        }}
        title="¿Reasumir evaluación?"
        message="El técnico ya no tendrá esta delegación. La denuncia volverá a 'Por admitir'."
        confirmText="Sí, reasumir"
        cancelText="Cancelar"
      />

      <ModalEditarDenuncia
        denuncia={modalEditarDenuncia as any}
        open={modalEditarDenuncia !== null}
        onOpenChange={(v) => { if (!v) setModalEditarDenuncia(null); }}
      />

      <ModalConfirmar
        isOpen={modalEliminarDenunciaTicket !== null}
        onClose={() => setModalEliminarDenunciaTicket(null)}
        onConfirm={() => {
          if (!modalEliminarDenunciaTicket) return;
          const ticket = modalEliminarDenunciaTicket;
          setModalEliminarDenunciaTicket(null);
          setSelectedDenuncia(null);
          router.post(route('denuncias.eliminar', { ticket }), {}, {
            preserveScroll: false,
            onSuccess: () => {
              toast.success(`Denuncia ${ticket} eliminada correctamente`);
              router.reload();
            },
            onError: () => toast.error('Error al eliminar denuncia'),
          });
        }}
        title="¿Eliminar denuncia?"
        message="Esta denuncia se ocultará del sistema. Los datos se conservarán para auditoría."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </AppLayout>
  );
}
