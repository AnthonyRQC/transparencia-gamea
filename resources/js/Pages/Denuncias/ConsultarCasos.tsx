import { useState, useMemo, useEffect } from 'react';
import { formatearFechaCorta } from '@/helpers/fechas';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Eye, Key, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/Components/Layout/AppLayout';
import DenunciaSheet from '@/Components/Denuncias/DenunciaSheet';
import TipoDenunciaBadge from '@/Components/Denuncias/TipoDenunciaBadge';
import PlazoBadge from '@/Components/Denuncias/PlazoBadge';
import ModalConsultarCodigo from '@/Components/Denuncias/ModalConsultarCodigo';
import ModalEditarDenuncia from '@/Components/Denuncias/ModalEditarDenuncia';
import ModalConfirmarEliminar from '@/Components/Denuncias/ModalConfirmarEliminar';
import Paginacion from '@/Components/Denuncias/Paginacion';
import ListaVacia from '@/Components/Denuncias/ListaVacia';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { route } from 'ziggy-js';

const ESTADOS = ['ingresada', 'evaluacion_tecnica', 'admitida', 'rechazada', 'asignada', 'investigacion', 'informe', 'cerrada'];

const estadoLabels: Record<string, string> = {
  ingresada: 'Ingresada', evaluacion_tecnica: 'En evaluación', admitida: 'Admitida',
  rechazada: 'Rechazada', asignada: 'Asignada', investigacion: 'Investigación',
  informe: 'Informe Final', cerrada: 'Cerrada',
};

interface Denunciante { nombres?: string; ci?: string; email?: string; telefono?: string }
interface DenunciadoItem { conoce_identidad: boolean; nombres?: string; dependencia?: string; descripcion?: string }
interface PlazoInfoResult { dias_restantes: number; color: string; fecha_vencimiento?: string }
interface PruebaItem { tipo: string; descripcion: string; testigo_nombre?: string; testigo_telefono?: string; archivo_nombre?: string }

interface Denuncia {
  ticket: string; tipo: string; escenario?: string; estado: string; subestado?: string | null;
  created_at: string; denunciante?: Denunciante; denunciados?: DenunciadoItem[];
  hechos?: string; tecnico?: string | null; fecha_admitida?: string | null;
  fecha_rechazada?: string | null; fecha_asignada?: string | null;
  fecha_reapertura?: string | null; justificacion_rechazo?: string | null;
  ampliaciones?: Array<{ id: number; fecha: string; dias: number; justificacion: string; aprobado_por: string }>;
  bitacora?: Array<{ fecha: string; accion: string; detalle: string; usuario: string }>;
  plazo?: PlazoInfoResult | null;
  token_consulta?: string;
  [key: string]: unknown;
}

interface PageProps {
  denuncias: Denuncia[];
  tecnicos: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  filters: Record<string, string | string[] | undefined>;
}

/** @deprecated usa formatearFechaCorta del helper */
const formatDate = (d?: string): string => formatearFechaCorta(d) ?? '—';

export default function ConsultarCasos({ denuncias, tecnicos, filters }: PageProps) {
  const pageProps = usePage().props as unknown as any;
  const solicitudesByTicket = pageProps.solicitudesByTicket || {};
  const descargosByTicket = pageProps.descargosByTicket || {};

  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [codigoModal, setCodigoModal] = useState<{ ticket: string; token: string } | null>(null);
  const [modalEditarDenuncia, setModalEditarDenuncia] = useState<Denuncia | null>(null);
  const [modalEliminarDenuncia, setModalEliminarDenuncia] = useState<Denuncia | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEliminarDenuncia = () => {
    if (!modalEliminarDenuncia) return;
    setDeleting(true);
    router.post(
      route('denuncias.eliminar', { ticket: modalEliminarDenuncia.ticket }),
      {},
      {
        preserveScroll: false,
        onSuccess: () => {
          toast.success(`Denuncia ${modalEliminarDenuncia.ticket} eliminada correctamente`);
          setModalEliminarDenuncia(null);
          router.reload();
        },
        onError: () => toast.error('Error al eliminar la denuncia'),
        onFinish: () => setDeleting(false),
      }
    );
  };
  const [filterBusqueda, setFilterBusqueda] = useState(filters.busqueda as string || '');
  const [filterTicket, setFilterTicket] = useState(filters.ticket as string || '');
  const [filterEstado, setFilterEstado] = useState<string[]>((filters.estado as string) ? (filters.estado as string).split(',') : []);
  const [filterTipo, setFilterTipo] = useState(filters.tipo as string || '');
  const [filterEscenario, setFilterEscenario] = useState(filters.escenario as string || '');
  const [filterFechaDesde, setFilterFechaDesde] = useState(filters.fecha_desde as string || '');
  const [filterFechaHasta, setFilterFechaHasta] = useState(filters.fecha_hasta as string || '');
  const [filterTecnico, setFilterTecnico] = useState(filters.tecnico as string || '');
  const [showFilters, setShowFilters] = useState(false);

  const tecnicosList = useMemo(() => Object.values(tecnicos), [tecnicos]);

  // Sincroniza la denuncia seleccionada con los datos frescos que llegan de Inertia
  useEffect(() => {
    if (selectedDenuncia) {
      const updated = denuncias.find((d) => d.ticket === selectedDenuncia.ticket);
      if (updated) setSelectedDenuncia(updated);
    }
  }, [denuncias]);

  const aplicarFiltros = () => {
    const params: Record<string, string> = {};
    if (filterBusqueda) params.busqueda = filterBusqueda;
    if (filterTicket) params.ticket = filterTicket;
    if (filterEstado.length > 0) params.estado = filterEstado.join(',');
    if (filterTipo) params.tipo = filterTipo;
    if (filterEscenario) params.escenario = filterEscenario;
    if (filterFechaDesde) params.fecha_desde = filterFechaDesde;
    if (filterFechaHasta) params.fecha_hasta = filterFechaHasta;
    if (filterTecnico) params.tecnico = filterTecnico;

    router.get(route('denuncias.consultar'), params, { preserveState: true, preserveScroll: true });
  };

  const limpiarFiltros = () => {
    setFilterBusqueda(''); setFilterTicket(''); setFilterEstado([]);
    setFilterTipo(''); setFilterEscenario('');
    setFilterFechaDesde(''); setFilterFechaHasta(''); setFilterTecnico('');
    router.get(route('denuncias.consultar'), {}, { preserveState: true, preserveScroll: true });
  };

  const toggleEstado = (e: string) => {
    setFilterEstado(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const [pagina, setPagina] = useState(1);
  const pageSize = 10;
  const totalPaginas = Math.ceil(denuncias.length / pageSize) || 1;
  const paginatedDenuncias = denuncias.slice((pagina - 1) * pageSize, pagina * pageSize);

  useEffect(() => {
    setPagina(1);
  }, [denuncias]);

  return (
    <AppLayout>
      <Head title="Consultar Casos — Transparencia UTLCC" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Consultar Casos</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Búsqueda avanzada y filtrado histórico en toda la base de denuncias.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </div>

      {/* Panel de 7 filtros */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Búsqueda libre</p>
              <Input placeholder="N° de denuncia, hechos, nombres..." value={filterBusqueda} onChange={(e) => setFilterBusqueda(e.target.value)} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">N° de denuncia exacto</p>
              <Input placeholder="DEN-2026-XXXX" value={filterTicket} onChange={(e) => setFilterTicket(e.target.value)} style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Tipo</p>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Todos</SelectItem>
                  <SelectItem value="corrupcion">Corrupción</SelectItem>
                  <SelectItem value="negacion">Negación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Escenario</p>
              <Select value={filterEscenario} onValueChange={setFilterEscenario}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Todos</SelectItem>
                  <SelectItem value="revelada">Revelada</SelectItem>
                  <SelectItem value="reservada">Reservada</SelectItem>
                  <SelectItem value="anonimo">Anónimo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Fecha desde</p>
              <Input type="date" value={filterFechaDesde} onChange={(e) => setFilterFechaDesde(e.target.value)} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Fecha hasta</p>
              <Input type="date" value={filterFechaHasta} onChange={(e) => setFilterFechaHasta(e.target.value)} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Técnico</p>
              <Select value={filterTecnico} onValueChange={setFilterTecnico}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Todos</SelectItem>
                  {tecnicosList.map(t => <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estados multi-select */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Estado</p>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS.map(e => (
                <button
                  key={e}
                  onClick={() => toggleEstado(e)}
                  className={`text-[11px] font-medium px-2 py-1 rounded-full border transition-colors cursor-pointer ${
                    filterEstado.includes(e)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {estadoLabels[e]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={aplicarFiltros}>Buscar</Button>
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>Limpiar</Button>
          </div>
        </div>
      )}

      <Separator className="mb-4" />

      {/* Tabla de resultados */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{denuncias.length} resultado(s)</p>

        {denuncias.length === 0 && (
          <ListaVacia
            icon={Search}
            titulo="Sin resultados para la búsqueda"
            descripcion="No se encontraron denuncias con los filtros aplicados. Intente ajustar los criterios o limpiar los filtros."
            accionLabel="Limpiar filtros"
            onAccion={limpiarFiltros}
          />
        )}

        {/* Cards como tabla responsive */}
        <div className="space-y-2">
          {paginatedDenuncias.map((d) => {
            const tecnico = d.tecnico ? tecnicos[d.tecnico] : null;
            const denombres = d.denunciante?.nombres || '—';
            const denResumido = d.denunciados?.slice(0, 2).map(dd => dd.nombres || 'Sin identificar').join(', ') || '—';

            return (
              <div key={d.ticket} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-lg border border-border px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold" title={`N° de denuncia: ${d.ticket}`}>{d.ticket}</span>
                    <TipoDenunciaBadge tipo={d.tipo} />
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      d.estado === 'cerrada' ? 'bg-[#008F89]/10 text-[#008F89] border-[#008F89]/30' :
                      d.estado === 'rechazada' ? 'bg-[#F4007A]/10 text-[#F4007A] border-[#F4007A]/30' :
                      'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {estadoLabels[d.estado] || d.estado}
                      {d.subestado === 'archivada' && ' (Archivada)'}
                    </span>
                    <PlazoBadge plazo={(d.plazo || null) as any} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{formatDate(d.created_at)}</span>
                    <span>Denunciante: {denombres}</span>
                    <span>Denunciado(s): {denResumido}</span>
                    {tecnico && <span>Técnico: {tecnico.nombre}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => setSelectedDenuncia(d)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver detalle
                  </button>
                  <button
                    onClick={() => setCodigoModal({ ticket: d.ticket, token: d.token_consulta || '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/25 transition-colors dark:bg-amber-500/20 dark:text-amber-300 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Código
                  </button>

                  {d.estado === 'ingresada' && (
                    <button
                      onClick={() => setModalEditarDenuncia(d)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                      title="Editar denuncia"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          totalElementos={denuncias.length}
          elementosPorPagina={pageSize}
          onPaginaChange={(p) => setPagina(p)}
        />
      </div>

      {/* DenunciaSheet para "Ver detalle" (read-only) */}
      {selectedDenuncia && (
        <DenunciaSheet
          denuncia={selectedDenuncia as any}
          plazo={(selectedDenuncia.plazo || null) as any}
          tecnicos={tecnicos}
          open={selectedDenuncia !== null}
          onOpenChange={(v) => { if (!v) setSelectedDenuncia(null); }}
          canAct={false}
          solicitudes={(solicitudesByTicket[selectedDenuncia.ticket] || []) as any}
          descargos={(descargosByTicket[selectedDenuncia.ticket] || []) as any}
        />
      )}

      {/* ModalConsultarCodigo */}
      {codigoModal && (
        <ModalConsultarCodigo
          ticket={codigoModal.ticket}
          token={codigoModal.token}
          open={codigoModal !== null}
          onOpenChange={() => setCodigoModal(null)}
        />
      )}

      {/* ModalEditarDenuncia */}
      {modalEditarDenuncia && (
        <ModalEditarDenuncia
          denuncia={modalEditarDenuncia as any}
          open={modalEditarDenuncia !== null}
          onOpenChange={(open) => { if (!open) setModalEditarDenuncia(null); }}
        />
      )}
    </AppLayout>
  );
}
