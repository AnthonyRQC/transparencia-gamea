import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Megaphone, Search, SearchX } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import Paginacion from '@/Components/Denuncias/Paginacion';
import ListaVacia from '@/Components/Denuncias/ListaVacia';
import AvisoCard, { type AvisoPublico } from '@/Components/Publico/AvisoCard';

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
    desde?: string;
    hasta?: string;
    historial?: boolean;
  };
}

export default function PanelInformativo({ panel }: { panel: PanelData }) {
  const { avisos, tipos, recientes, filtros } = panel;
  const [buscar, setBuscar] = useState(filtros.buscar ?? '');
  const [tipo, setTipo] = useState(filtros.tipo ?? '');
  const [desde, setDesde] = useState(filtros.desde ?? '');
  const [hasta, setHasta] = useState(filtros.hasta ?? '');
  const [historial, setHistorial] = useState(filtros.historial ?? false);

  const aplicar = (page: number = 1, overrides: { tipo?: string; historial?: boolean } = {}) => {
    const tipoFinal = overrides.tipo !== undefined ? overrides.tipo : tipo;
    const historialFinal = overrides.historial !== undefined ? overrides.historial : historial;
    router.get(route('home'), {
      buscar: buscar || undefined,
      tipo: tipoFinal || undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
      historial: historialFinal || undefined,
      page: page > 1 ? page : undefined,
    }, { preserveState: true, preserveScroll: true, only: ['panel'] });
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
              <AvisoCard key={aviso.id} aviso={aviso} />
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
    </section>
  );
}
