import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Eye, Key, ChevronDown, ChevronUp } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import DenunciaSheet from '@/Components/Denuncias/DenunciaSheet';
import TipoDenunciaBadge from '@/Components/Denuncias/TipoDenunciaBadge';
import PlazoBadge from '@/Components/Denuncias/PlazoBadge';
import ModalConsultarCodigo from '@/Components/Denuncias/ModalConsultarCodigo';
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

function formatDate(d?: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ConsultarCasos({ denuncias, tecnicos, filters }: PageProps) {
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [codigoModal, setCodigoModal] = useState<{ ticket: string; token: string } | null>(null);
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

  return (
    <AppLayout>
      <Head title="Consultar Casos — Transparencia UTLCC" />

      <div className="flex items-center gap-2 mb-4">
        <Search className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Consultar casos</h1>
      </div>

      {/* Botón toggle filtros */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
      </button>

      {/* Panel de 7 filtros */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Búsqueda libre</p>
              <Input placeholder="Ticket, hechos, nombres..." value={filterBusqueda} onChange={(e) => setFilterBusqueda(e.target.value)} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Ticket exacto</p>
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
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">Sin resultados</p>
            <p className="text-sm">Ajuste los filtros o intente con otros términos de búsqueda.</p>
          </div>
        )}

        {/* Cards como tabla responsive */}
        <div className="space-y-2">
          {denuncias.map((d) => {
            const tecnico = d.tecnico ? tecnicos[d.tecnico] : null;
            const denombres = d.denunciante?.nombres || '—';
            const denResumido = d.denunciados?.slice(0, 2).map(dd => dd.nombres || 'Anónimo').join(', ') || '—';

            return (
              <div key={d.ticket} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-lg border border-border px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold">{d.ticket}</span>
                    <TipoDenunciaBadge tipo={d.tipo} />
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      d.estado === 'cerrada' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      d.estado === 'rechazada' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setSelectedDenuncia(d)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 text-xs font-semibold hover:bg-sky-200 transition-colors dark:bg-sky-900/30 dark:text-sky-300 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver detalle
                  </button>
                  <button
                    onClick={() => setCodigoModal({ ticket: d.ticket, token: d.token_consulta || '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Código
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
          solicitudes={[]}
          descargos={[]}
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
    </AppLayout>
  );
}
