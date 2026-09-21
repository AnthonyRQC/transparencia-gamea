import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Megaphone, Search, SearchX, ChevronDown } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import Paginacion from '@/Components/Denuncias/Shared/Paginacion';
import ListaVacia from '@/Components/Denuncias/Shared/ListaVacia';
import AvisoCard, { type AvisoPublico } from '@/Components/Publico/AvisoCard';
import AvisoDetailModal from '@/Components/Publico/AvisoDetailModal';

interface TipoOption {
  id: number;
  clave: string;
  nombre: string;
}

interface PanelData {
  avisos: {
    data: AvisoPublico[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  tipos: TipoOption[];
  recientes: boolean;
  filtros: {
    tipo?: string;
    buscar?: string;
    cite?: string;
    ref?: string;
    destinatario?: string;
    ref_externa?: string;
    ticket?: string;
    emisor?: string;
    desde?: string;
    hasta?: string;
    historial?: boolean;
  };
}

const CAMPOS_AVANZADOS: Array<{ clave: string; etiqueta: string; placeholder: string }> = [
  { clave: 'cite', etiqueta: 'CITE', placeholder: 'GAMEA/UTLCC/N°...' },
  { clave: 'ref', etiqueta: 'Ref./título', placeholder: 'Título del aviso...' },
  { clave: 'destinatario', etiqueta: 'Dirigido a', placeholder: 'Persona o dependencia...' },
  { clave: 'ref_externa', etiqueta: 'Ref. externa', placeholder: 'SIPRECO / RA / HR...' },
  { clave: 'ticket', etiqueta: 'Código de caso', placeholder: 'DEN-2026-XXXX...' },
  { clave: 'emisor', etiqueta: 'Emisor', placeholder: 'UTLCC...' },
];

export default function PanelInformativo({ panel }: { panel: PanelData }) {
  const { avisos, tipos, recientes, filtros } = panel;
  const [buscar, setBuscar] = useState(filtros.buscar ?? '');
  const [tipo, setTipo] = useState(filtros.tipo ?? '');
  const [avanzados, setAvanzados] = useState<Record<string, string>>({
    cite: filtros.cite ?? '',
    ref: filtros.ref ?? '',
    destinatario: filtros.destinatario ?? '',
    ref_externa: filtros.ref_externa ?? '',
    ticket: filtros.ticket ?? '',
    emisor: filtros.emisor ?? '',
  });
  const [desde, setDesde] = useState(filtros.desde ?? '');
  const [hasta, setHasta] = useState(filtros.hasta ?? '');
  const [historial, setHistorial] = useState(filtros.historial ?? false);
  const [detalle, setDetalle] = useState<AvisoPublico | null>(null);

  const setAvanzado = (clave: string, valor: string) =>
    setAvanzados((a) => ({ ...a, [clave]: valor }));

  const aplicar = (page: number = 1, overrides: { tipo?: string; historial?: boolean } = {}) => {
    const tipoFinal = overrides.tipo !== undefined ? overrides.tipo : tipo;
    const historialFinal = overrides.historial !== undefined ? overrides.historial : historial;
    const params: { [key: string]: any } = {
      buscar: buscar || undefined,
      tipo: tipoFinal || undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
      historial: historialFinal ? 1 : undefined,
      page: page > 1 ? page : undefined,
    };
    for (const { clave } of CAMPOS_AVANZADOS) {
      params[clave] = avanzados[clave]?.trim() ? avanzados[clave].trim() : undefined;
    }
    router.get(route('home'), params, { preserveState: true, preserveScroll: true, only: ['panel'] });
  };

  const elegirTipo = (clave: string) => {
    setTipo(clave);
    aplicar(1, { tipo: clave });
  };

  const verHistorial = () => {
    setHistorial(true);
    aplicar(1, { historial: true });
  };

  const limpiar = () => {
    setBuscar('');
    setTipo('');
    setAvanzados({ cite: '', ref: '', destinatario: '', ref_externa: '', ticket: '', emisor: '' });
    setDesde('');
    setHasta('');
    setHistorial(false);
    router.get(route('home'), {}, { preserveState: true, preserveScroll: true, only: ['panel'] });
  };

  return (
    <section id="panel" className="space-y-6 pt-2 scroll-mt-6" aria-label="Panel informativo">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-widest text-primary dark:text-secondary uppercase">
          <Megaphone className="w-4 h-4" />
          Panel informativo
        </span>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
          Avisos de la Unidad
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
          Consulta instructivos, respuestas, comunicados y notificaciones de casos publicadas por la Unidad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-3 lg:sticky lg:top-6 self-start bg-card border border-border rounded-2xl p-4 space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
            Filtro documental
          </p>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="CITE, título, código de caso..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') aplicar(1); }}
              className="pl-8 h-10 text-sm"
            />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Tipo de aviso
            </p>
            <button
              type="button"
              onClick={() => elegirTipo('')}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                tipo === '' ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-muted/60 text-foreground',
              )}
            >
              Todos los avisos
              <span className={cn(
                'text-[11px] font-bold px-2 py-0.5 rounded-full',
                tipo === '' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}>
                {avisos.total}
              </span>
            </button>
            {tipos.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => elegirTipo(t.clave)}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left',
                  tipo === t.clave ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-muted/60 text-foreground',
                )}
              >
                {t.nombre}
              </button>
            ))}
          </div>

          <details className="rounded-lg border border-border/60">
            <summary className="cursor-pointer px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors list-none flex items-center justify-between">
              Búsqueda avanzada
              <ChevronDown className="w-3.5 h-3.5" />
            </summary>
            <div className="px-2.5 pb-2.5 pt-1 space-y-2">
              {CAMPOS_AVANZADOS.map(({ clave, etiqueta, placeholder }) => (
                <div key={clave}>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-0.5 block">
                    {etiqueta}
                  </label>
                  <Input
                    value={avanzados[clave] ?? ''}
                    onChange={(e) => setAvanzado(clave, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') aplicar(1); }}
                    placeholder={placeholder}
                    className="h-9 text-sm"
                  />
                </div>
              ))}
            </div>
          </details>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Desde</label>
              <Input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="h-9 text-sm w-full min-w-0"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Hasta</label>
              <Input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="h-9 text-sm w-full min-w-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Button size="sm" className="w-full" onClick={() => aplicar(1)}>
              Buscar
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={limpiar}>
              Limpiar filtros
            </Button>
          </div>

          {recientes && !historial && (
            <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/40 rounded-lg px-2.5 py-2">
              Mostrando los últimos 12 meses.{' '}
              <button
                type="button"
                onClick={verHistorial}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                Ver historial completo
              </button>
            </p>
          )}
        </aside>

        <div className="lg:col-span-9 space-y-4 min-w-0">
          {avisos.data.length === 0 ? (
            <ListaVacia
              icon={SearchX}
              titulo="Sin avisos"
              descripcion="No se encontraron avisos con esos filtros."
            />
          ) : (
            avisos.data.map((aviso) => (
              <AvisoCard key={aviso.id} aviso={aviso} onVer={setDetalle} />
            ))
          )}

          <Paginacion
            mode="server"
            paginaActual={avisos.current_page}
            totalPaginas={avisos.last_page}
            totalElementos={avisos.total}
            elementosPorPagina={avisos.per_page}
            onPaginaChange={(p) => aplicar(p)}
          />
        </div>
      </div>

      <AvisoDetailModal
        aviso={detalle}
        open={detalle !== null}
        onOpenChange={(v) => { if (!v) setDetalle(null); }}
      />
    </section>
  );
}
