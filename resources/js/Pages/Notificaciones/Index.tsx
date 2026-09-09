import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import ItemNotificacion from '@/Components/Layout/ItemNotificacion';
import ListaVacia from '@/Components/Denuncias/ListaVacia';

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
}

const TIPOS_NOTIFICACION = [
  { value: '', label: 'Todos los tipos' },
  { value: 'nueva_denuncia', label: 'Nuevas denuncias' },
  { value: 'evaluacion', label: 'Evaluaciones previas' },
  { value: 'traspaso', label: 'Traspasos de caso' },
  { value: 'ampliacion', label: 'Ampliaciones de plazo' },
  { value: 'denuncia_admitida', label: 'Denuncias admitidas' },
  { value: 'denuncia_rechazada', label: 'Denuncias rechazadas' },
  { value: 'solicitud', label: 'Solicitudes de información' },
  { value: 'descargo', label: 'Descargos de imputados' },
  { value: 'sistema', label: 'Sistema' },
];

const ESTADOS_LECTURA = [
  { value: '', label: 'Todos' },
  { value: '0', label: 'No leídas' },
  { value: '1', label: 'Leídas' },
];

export default function NotificacionesIndex() {
  const { notificaciones, filtros: initialFiltros } = usePage().props as unknown as PageProps;

  const [filtroTipo, setFiltroTipo] = React.useState(initialFiltros.tipo ?? '');
  const [filtroLeida, setFiltroLeida] = React.useState(initialFiltros.leida ?? '');
  const [filtroDesde, setFiltroDesde] = React.useState(initialFiltros.fecha_desde ?? '');
  const [filtroHasta, setFiltroHasta] = React.useState(initialFiltros.fecha_hasta ?? '');

  const handleMarcarLeida = (id: number) => {
    router.post(route('notificaciones.marcar-leida', { id }));
  };

  const handleNavegar = (url: string) => {
    const cleanUrl = url ? url.replace('/denuncias/bandeja', '/denuncias') : '/denuncias';
    router.get(cleanUrl);
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

  const { items, page, total_pages, total } = notificaciones;

  return (
    <AppLayout>
      <Head title="Notificaciones" />

      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <PageHeader
          icon={<Bell className="shrink-0" />}
          titulo="Notificaciones"
          tituloExtra={
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {total}
            </span>
          }
          subtitulo="Historial de alertas y avisos del sistema sobre sus casos y actividades."
          acciones={
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarcarTodas}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como leídas
            </Button>
          }
        />

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
          <ListaVacia
            icon={SearchX}
            titulo="Sin resultados"
            descripcion="No se encontraron notificaciones con esos filtros."
          />
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

      </div>
    </AppLayout>
  );
}
