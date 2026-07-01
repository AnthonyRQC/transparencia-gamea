import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, SearchX, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import AppLayout from '@/Components/Layout/AppLayout';
import ItemNotificacion from '@/Components/Layout/ItemNotificacion';
import PanelDemo from '@/Components/Notificaciones/PanelDemo';

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  ticket: string | null;
  destino_url: string;
  leida: boolean;
  fecha_leida: string | null;
  fecha: string;
  icono: string;
  color: string;
}

interface PaginatedResult {
  items: Notificacion[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface PageProps {
  notificaciones: PaginatedResult;
  filtros: {
    tipo?: string;
    leida?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  };
  demo_mode?: boolean;
}

const TIPOS_NOTIFICACION = [
  { value: '', label: 'Todos los tipos' },
  { value: 'traspaso', label: 'Traspasos' },
  { value: 'ampliacion', label: 'Ampliaciones' },
  { value: 'denuncia_admitida', label: 'Denuncias admitidas' },
  { value: 'denuncia_rechazada', label: 'Denuncias rechazadas' },
  { value: 'plazo_por_vencer', label: 'Plazos por vencer' },
  { value: 'plazo_vencido', label: 'Plazos vencidos' },
  { value: 'plazo_informe', label: 'Informes por vencer' },
  { value: 'solicitud_vence', label: 'Solicitudes por vencer' },
  { value: 'descargo_vence', label: 'Descargos por vencer' },
  { value: 'sistema', label: 'Sistema' },
];

const ESTADOS_LECTURA = [
  { value: '', label: 'Todos' },
  { value: '0', label: 'No leídas' },
  { value: '1', label: 'Leídas' },
];

export default function NotificacionesIndex() {
  const { notificaciones, filtros: initialFiltros, demo_mode } = usePage().props as unknown as PageProps;

  const [filtroTipo, setFiltroTipo] = React.useState(initialFiltros.tipo ?? '');
  const [filtroLeida, setFiltroLeida] = React.useState(initialFiltros.leida ?? '');
  const [filtroDesde, setFiltroDesde] = React.useState(initialFiltros.fecha_desde ?? '');
  const [filtroHasta, setFiltroHasta] = React.useState(initialFiltros.fecha_hasta ?? '');

  const handleMarcarLeida = (id: number) => {
    router.post(route('notificaciones.marcar-leida', { id }));
  };

  const handleNavegar = (url: string) => {
    router.get(url);
  };

  const handleMarcarTodas = () => {
    router.post(route('notificaciones.marcar-todas'));
  };

  const aplicarFiltros = (page: number = 1) => {
    router.get(route('notificaciones.index', {
      page,
      tipo: filtroTipo || undefined,
      leida: filtroLeida || undefined,
      fecha_desde: filtroDesde || undefined,
      fecha_hasta: filtroHasta || undefined,
    }));
  };

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroLeida('');
    setFiltroDesde('');
    setFiltroHasta('');
    router.get(route('notificaciones.index'));
  };

  const irPagina = (page: number) => {
    aplicarFiltros(page);
  };

  const toggleDemo = () => {
    router.post(route('notificaciones.demo.toggle'), {
      active: demo_mode ? false : true,
    }, { preserveScroll: true });
  };

  const { items, page, total_pages, total } = notificaciones;

  return (
    <AppLayout>
      <Head title="Notificaciones" />

      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-foreground" />
            <h1 className="text-xl font-bold text-foreground">Notificaciones</h1>
            <span className="text-xs text-muted-foreground ml-1">
              ({total} en total)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDemo}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                demo_mode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'border-border/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              {demo_mode ? 'Modo demo activo' : 'Modo demo'}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarcarTodas}
              className="flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_NOTIFICACION.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Leída</label>
              <Select value={filtroLeida} onValueChange={setFiltroLeida}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_LECTURA.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Desde</label>
              <Input
                type="date"
                value={filtroDesde}
                onChange={(e) => setFiltroDesde(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hasta</label>
              <Input
                type="date"
                value={filtroHasta}
                onChange={(e) => setFiltroHasta(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={() => aplicarFiltros(1)}>
              Aplicar filtros
            </Button>
            <Button size="sm" variant="outline" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </div>
        </div>

        {/* Lista */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SearchX className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              No se encontraron notificaciones con esos filtros.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/60">
            {items.map((n) => (
              <ItemNotificacion
                key={n.id}
                notificacion={n}
                onMarcarLeida={handleMarcarLeida}
                onNavegar={handleNavegar}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {total_pages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6">
            <button
              onClick={() => irPagina(page - 1)}
              disabled={page <= 1}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                page <= 1
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-foreground hover:bg-muted cursor-pointer',
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            {Array.from({ length: total_pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => irPagina(p)}
                className={cn(
                  'w-8 h-8 text-sm font-medium rounded-lg transition-colors',
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted cursor-pointer',
                )}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => irPagina(page + 1)}
              disabled={page >= total_pages}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                page >= total_pages
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-foreground hover:bg-muted cursor-pointer',
              )}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Panel Demo (solo visible en modo demo) */}
        {demo_mode && <PanelDemo />}
      </div>
    </AppLayout>
  );
}
