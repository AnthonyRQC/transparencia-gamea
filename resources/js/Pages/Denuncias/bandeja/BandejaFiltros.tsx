import { Search, ChevronDown, ChevronUp, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { ETIQUETAS_ESTADO_CORTO } from '@/Components/Denuncias/Shared/semantica';
import { ETIQUETAS_TIPO } from '@/types/dashboard';
import { formatearRangoFechas } from '@/helpers/fechas';
import { ETIQUETAS_PRESET, PRESETS_FECHA, detectarPreset, rangoPreset, type PresetFechaKey } from '@/helpers/presetsFecha';
import type { DenunciaFiltersApi, FiltrosBandejaForm } from './useDenunciaFilters';
import type { OpcionesBandeja } from './tipos';

const ESTADOS = ['ingresada', 'evaluacion_tecnica', 'admitida', 'rechazada', 'asignada', 'investigacion', 'informe', 'cerrada'];

type InvestigadorItem = { id: number | string; name?: string; nombre?: string };

interface BandejaFiltrosProps {
  api: DenunciaFiltersApi;
  activeTab: string;
  investigadores: Array<InvestigadorItem> | Record<string, InvestigadorItem>;
  opciones: OpcionesBandeja;
  onRestablecer: () => void;
}

function listaInvestigadores(inv: BandejaFiltrosProps['investigadores']): InvestigadorItem[] {
  return Array.isArray(inv) ? inv : Object.values(inv);
}

export default function BandejaFiltros({ api, activeTab, investigadores, opciones, onRestablecer }: BandejaFiltrosProps) {
  const { form, setCampo, toggleEstado, showFilters, setShowFilters, cantidadFiltros } = api;
  const investigadoresList = listaInvestigadores(investigadores);

  const quitar = (next: FiltrosBandejaForm) => api.aplicarCon(next, activeTab);
  const sin = (patch: Partial<FiltrosBandejaForm>): FiltrosBandejaForm => ({ ...form, ...patch });

  const chips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (form.search.trim()) {
    chips.push({ key: 'search', label: `Búsqueda: ${form.search.trim()}`, clear: () => quitar(sin({ search: '' })) });
  }
  if (form.ticket.trim()) {
    chips.push({ key: 'ticket', label: `Ticket: ${form.ticket.trim().toUpperCase()}`, clear: () => quitar(sin({ ticket: '' })) });
  }
  if (form.tipo !== 'all') {
    chips.push({ key: 'tipo', label: ETIQUETAS_TIPO[form.tipo] ?? form.tipo, clear: () => quitar(sin({ tipo: 'all' })) });
  }
  if (form.escenario) {
    const etiqueta = form.escenario === 'revelada' ? 'REVELADA' : form.escenario === 'reservada' ? 'RESERVADA' : 'ANÓNIMO';
    chips.push({ key: 'escenario', label: `Escenario: ${etiqueta}`, clear: () => quitar(sin({ escenario: '' })) });
  }
  if (form.fecha_desde || form.fecha_hasta) {
    const preset: PresetFechaKey = detectarPreset(form.fecha_desde || null, form.fecha_hasta || null);
    chips.push({
      key: 'rango',
      label: `Fecha: ${ETIQUETAS_PRESET[preset]} (${formatearRangoFechas(form.fecha_desde || null, form.fecha_hasta || null)})`,
      clear: () => quitar(sin({ fecha_desde: '', fecha_hasta: '' })),
    });
  }
  if (form.investigador_id) {
    const t = investigadoresList.find((x) => String(x.id) === form.investigador_id);
    chips.push({
      key: 'investigador',
      label: `Investigador: ${t?.name ?? t?.nombre ?? 'Investigador'}`,
      clear: () => quitar(sin({ investigador_id: '' })),
    });
  }
  if (form.categoria_id) {
    const c = opciones.categorias.find((x) => String(x.id) === form.categoria_id);
    chips.push({
      key: 'categoria',
      label: `Categoría: ${c?.nombre ?? 'Categoría'}`,
      clear: () => quitar(sin({ categoria_id: '' })),
    });
  }
  if (form.clasificacion_id) {
    const c = opciones.clasificaciones.find((x) => String(x.id) === form.clasificacion_id);
    chips.push({
      key: 'clasificacion',
      label: `Clasificación: ${c?.nombre ?? 'Clasificación'}`,
      clear: () => quitar(sin({ clasificacion_id: '' })),
    });
  }
  if (form.estado.length > 0) {
    chips.push({
      key: 'estado',
      label: `Estado (${form.estado.length}): ${form.estado.map((e) => ETIQUETAS_ESTADO_CORTO[e] ?? e).join(', ')}`,
      clear: () => quitar(sin({ estado: [] })),
    });
  }

  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por N° de denuncia, hechos o nombres..."
            value={form.search}
            onChange={(e) => setCampo('search', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') api.aplicar(activeTab); }}
            className="pl-8 h-9 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={form.tipo} onValueChange={(v) => { setCampo('tipo', v); }}>
            <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="corrupcion">Corrupción</SelectItem>
              <SelectItem value="negacion">Negación</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.sortBy} onValueChange={(v) => setCampo('sortBy', v)}>
            <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plazo">Plazo</SelectItem>
              <SelectItem value="fecha">Fecha</SelectItem>
              <SelectItem value="investigador">Investigador</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 h-9 shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {cantidadFiltros > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                {cantidadFiltros}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/60 border text-[11px] font-semibold"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5 transition-colors cursor-pointer"
                aria-label={`Quitar filtro ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <Button variant="ghost" size="sm" onClick={onRestablecer} className="gap-1 text-muted-foreground h-7 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar
          </Button>
        </div>
      )}

      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">N° de denuncia exacto</p>
              <Input
                placeholder="DEN-2026-XXXX"
                value={form.ticket}
                onChange={(e) => setCampo('ticket', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') api.aplicar(activeTab); }}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Escenario</p>
              <Select value={form.escenario || 'todos'} onValueChange={(v) => setCampo('escenario', v === 'todos' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="revelada">Revelada</SelectItem>
                  <SelectItem value="reservada">Reservada</SelectItem>
                  <SelectItem value="anonimo">Anónimo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Investigador</p>
              <Select value={form.investigador_id || 'todos'} onValueChange={(v) => setCampo('investigador_id', v === 'todos' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {investigadoresList.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name ?? t.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Categoría</p>
              <Select value={form.categoria_id || 'todas'} onValueChange={(v) => setCampo('categoria_id', v === 'todas' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {opciones.categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Clasificación final</p>
              <Select value={form.clasificacion_id || 'todas'} onValueChange={(v) => setCampo('clasificacion_id', v === 'todas' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {opciones.clasificaciones.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Rango de fechas</p>
              <div className="flex flex-wrap gap-1.5 pb-1">
                {PRESETS_FECHA.map((p) => {
                  const activo = detectarPreset(form.fecha_desde || null, form.fecha_hasta || null) === p.key;
                  return (
                    <Button
                      key={p.key}
                      type="button"
                      variant={activo ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => {
                        const r = rangoPreset(p.key);
                        setCampo('fecha_desde', r.desde ?? '');
                        setCampo('fecha_hasta', r.hasta ?? '');
                      }}
                    >
                      {p.label}
                    </Button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={form.fecha_desde} onChange={(e) => setCampo('fecha_desde', e.target.value)} />
                <Input type="date" value={form.fecha_hasta} onChange={(e) => setCampo('fecha_hasta', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Estado (refina dentro del tab activo)</p>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEstado(e)}
                  className={`text-[11px] font-medium px-2 py-1 rounded-full border transition-colors cursor-pointer ${
                    form.estado.includes(e)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {ETIQUETAS_ESTADO_CORTO[e]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={() => api.aplicar(activeTab)} className="cursor-pointer">Buscar</Button>
            <Button variant="outline" size="sm" onClick={onRestablecer} className="cursor-pointer">Limpiar</Button>
          </div>
        </div>
      )}

    </div>
  );
}
