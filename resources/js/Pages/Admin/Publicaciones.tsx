import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  Megaphone, Plus, Pencil, Trash2, Pin, PinOff,
  ChevronUp, ChevronDown, Eye, EyeOff, FileText, Search,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import ConfirmDialog from '@/Components/Denuncias/Shared/ConfirmDialog';
import ListaVacia from '@/Components/Denuncias/ListaVacia';
import Paginacion from '@/Components/Denuncias/Paginacion';
import TablaResponsive from '@/Components/Admin/TablaResponsive';
import PublicacionFormModal, { type PublicacionFormData } from '@/Components/Admin/PublicacionFormModal';
import { formatearFechaCorta } from '@/helpers/fechas';
import { EVENTO_CASO_LABEL, PRIORIDAD_PUBLICACION_COLOR } from '@/Components/Denuncias/Shared/semantica';
import { useCan } from '@/hooks/useCan';

interface PublicacionRow extends PublicacionFormData {
  tipo: string | null;
  tipo_nombre: string | null;
  prioridad: string | null;
  publicado: boolean;
  publicado_at: string | null;
  fijada: boolean;
  orden: number;
  ticket: string | null;
  evento: string | null;
}

interface PageProps {
  publicaciones: PublicacionRow[];
  tipos: Array<{ id: number; clave: string; nombre: string }>;
  prioridades: Array<{ id: number; clave: string; nombre: string }>;
}

export default function Publicaciones() {
  const { publicaciones, tipos, prioridades } = usePage().props as unknown as PageProps;
  const [modalForm, setModalForm] = useState<PublicacionFormData | null | undefined>(undefined);
  const [eliminarTarget, setEliminarTarget] = useState<PublicacionRow | null>(null);
  const puedeCrear = useCan('publicacion.crear');
  const puedeEditar = useCan('publicacion.editar');
  const puedeEliminar = useCan('publicacion.eliminar');
  const puedePublicar = useCan('publicacion.publicar');

  // Fila viva: tras quitar un adjunto (reload) el modal muestra datos frescos
  // sin cerrar ni borrar ediciones (el form solo se inicializa al abrir).
  const filaViva = modalForm
    ? (publicaciones.find((p) => p.id === modalForm.id) ?? modalForm)
    : modalForm;

  const post = (id: number, accion: string, data: { [key: string]: any } = {}) => {
    router.post(route(`admin.publicaciones.${accion}`, { id }), data, { preserveScroll: true });
  };

  const AccionesFila = ({ p }: { p: PublicacionRow }) => (
    <div className="flex items-center justify-end gap-1 flex-wrap">
      {puedeEditar && (
        <Button variant="ghost" size="icon" title="Editar" onClick={() => setModalForm(p)} className="cursor-pointer">
          <Pencil className="w-4 h-4" />
        </Button>
      )}
      {puedePublicar && (
        p.publicado ? (
          <Button variant="ghost" size="icon" title="Devolver a borrador" onClick={() => post(p.id, 'despublicar')} className="cursor-pointer">
            <EyeOff className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" title="Publicar" onClick={() => post(p.id, 'publicar')} className="cursor-pointer">
            <Eye className="w-4 h-4" />
          </Button>
        )
      )}
      {puedeEditar && (
        p.fijada ? (
          <>
            <Button variant="ghost" size="icon" title="Subir orden" onClick={() => post(p.id, 'mover', { direccion: 'subir' })} className="cursor-pointer">
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Bajar orden" onClick={() => post(p.id, 'mover', { direccion: 'bajar' })} className="cursor-pointer">
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Desfijar" onClick={() => post(p.id, 'desfijar')} className="cursor-pointer">
              <PinOff className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" title="Fijar en el panel" onClick={() => post(p.id, 'fijar')} className="cursor-pointer">
            <Pin className="w-4 h-4" />
          </Button>
        )
      )}
      {puedeEliminar && (
        <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setEliminarTarget(p)} className="cursor-pointer text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  const [buscarInput, setBuscarInput] = useState('');
  const [buscar, setBuscar] = useState('');
  const [avanzadosInput, setAvanzadosInput] = useState({ cite: '', ref: '', destinatario: '', ref_externa: '', ticket: '', emisor: '' });
  const [avanzados, setAvanzados] = useState({ cite: '', ref: '', destinatario: '', ref_externa: '', ticket: '', emisor: '' });
  const [filtroTipo, setFiltroTipo] = useState('');
  const [soloFijadas, setSoloFijadas] = useState(false);
  const [orden, setOrden] = useState('fecha-doc');
  const [tab, setTab] = useState<'borradores' | 'publicados'>('borradores');
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;
  const queryLeida = useRef(false);

  // Deep-links: ?aviso=<id> abre el borrador en el form; ?buscar= precarga texto.
  useEffect(() => {
    if (queryLeida.current || typeof window === 'undefined') return;
    queryLeida.current = true;
    const params = new URLSearchParams(window.location.search);
    const avisoId = params.get('aviso');
    if (avisoId) {
      const fila = publicaciones.find((p) => String(p.id) === avisoId);
      if (fila) setModalForm(fila);
    }
    const q = params.get('buscar');
    if (q) {
      setBuscarInput(q);
      setBuscar(q.trim());
    }
  }, [publicaciones]);

  const CAMPOS = [
    { clave: 'cite', etiqueta: 'CITE' },
    { clave: 'ref', etiqueta: 'Ref./título' },
    { clave: 'destinatario', etiqueta: 'Dirigido a' },
    { clave: 'ref_externa', etiqueta: 'Ref. externa' },
    { clave: 'ticket', etiqueta: 'Código de caso' },
    { clave: 'emisor', etiqueta: 'Emisor' },
  ] as const;

  const valorCampo = (p: PublicacionRow, clave: string): string => {
    switch (clave) {
      case 'cite': return p.cite ?? '';
      case 'ref': return p.ref_titulo;
      case 'destinatario': return p.destinatario_display ?? '';
      case 'ref_externa': return p.referencia_externa ?? '';
      case 'ticket': return p.ticket ?? '';
      case 'emisor': return p.emisor ?? '';
      default: return '';
    }
  };

  const filtrados = useMemo(() => {
    const q = buscar.trim().toUpperCase();
    const base = tab === 'borradores'
      ? publicaciones.filter((p) => !p.publicado)
      : publicaciones.filter((p) => p.publicado);
    const lista = base.filter((p) => {
      if (filtroTipo && p.tipo !== filtroTipo) return false;
      if (soloFijadas && !p.fijada) return false;
      if (q && ![p.ref_titulo, p.cite, p.referencia_externa, p.destinatario_display, p.ticket]
        .filter(Boolean).join(' ').toUpperCase().includes(q)) return false;
      for (const { clave } of CAMPOS) {
        const v = avanzados[clave as keyof typeof avanzados].trim().toUpperCase();
        if (v && !valorCampo(p, clave).toUpperCase().includes(v)) return false;
      }
      return true;
    });
    const porFechaDoc = (p: PublicacionRow) => p.fecha_documento ?? '';
    lista.sort((a, b) => {
      if (orden === 'recientes') return (b.publicado_at ?? '').localeCompare(a.publicado_at ?? '');
      if (orden === 'titulo') return a.ref_titulo.localeCompare(b.ref_titulo);
      // fecha-doc (default): sin fecha al final, resto descendente.
      const fa = porFechaDoc(a);
      const fb = porFechaDoc(b);
      if (!fa && !fb) return 0;
      if (!fa) return 1;
      if (!fb) return -1;
      return fb.localeCompare(fa);
    });
    return lista;
  }, [publicaciones, tab, buscar, avanzados, filtroTipo, soloFijadas, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

  const filtrar = (fn: () => void) => () => { fn(); setPagina(1); };

  // Texto y avanzada son draft: aplican con Buscar/Enter (no reactivo).
  const aplicarBusqueda = () => {
    setBuscar(buscarInput.trim());
    setAvanzados({ ...avanzadosInput });
    setPagina(1);
  };

  const limpiarBusqueda = () => {
    setBuscarInput('');
    setBuscar('');
    const vacio = { cite: '', ref: '', destinatario: '', ref_externa: '', ticket: '', emisor: '' };
    setAvanzadosInput(vacio);
    setAvanzados(vacio);
    setFiltroTipo('');
    setSoloFijadas(false);
    setPagina(1);
  };

  const cambiarTab = (t: 'borradores' | 'publicados') => {
    setTab(t);
    setPagina(1);
  };

  const nBorradores = publicaciones.filter((p) => !p.publicado).length;
  const nPublicados = publicaciones.length - nBorradores;

  const hayFiltros = buscar !== '' || filtroTipo !== '' || soloFijadas
    || Object.values(avanzados).some((v) => v.trim() !== '');

  return (
    <AppLayout>
      <Head title="Avisos — Transparencia UTLCC" />

      <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <PageHeader
          icon={<Megaphone className="shrink-0" />}
          titulo="Avisos del panel"
          subtitulo="Redacción y publicación de avisos del panel informativo."
          acciones={
            puedeCrear ? (
              <Button size="sm" onClick={() => setModalForm(null)} className="cursor-pointer">
                <Plus className="w-4 h-4" />
                Nuevo aviso
              </Button>
            ) : undefined
          }
        />

        {publicaciones.length === 0 ? (
          <ListaVacia
            icon={Megaphone}
            titulo="Sin avisos"
            descripcion="Aún no hay avisos creados. Use Nuevo aviso para redactar el primero."
          />
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, CITE, ref..."
                    value={buscarInput}
                    onChange={(e) => setBuscarInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') aplicarBusqueda(); }}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                <Select value={filtroTipo || 'todos'} onValueChange={(v) => filtrar(() => setFiltroTipo(v === 'todos' ? '' : v))()}>
                  <SelectTrigger className="h-9 text-sm lg:col-span-2">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={t.clave}>{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <details className="rounded-lg border border-border/60">
                <summary className="cursor-pointer px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors list-none flex items-center justify-between">
                  Búsqueda avanzada
                  <ChevronDown className="w-3.5 h-3.5" />
                </summary>
                <div className="px-2.5 pb-2.5 pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {CAMPOS.map(({ clave, etiqueta }) => (
                    <div key={clave}>
                      <label className="text-[11px] font-semibold text-muted-foreground mb-0.5 block">
                        {etiqueta}
                      </label>
                      <Input
                        value={avanzadosInput[clave as keyof typeof avanzadosInput]}
                        onChange={(e) => setAvanzadosInput((a) => ({ ...a, [clave]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') aplicarBusqueda(); }}
                        className="h-9 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </details>
              <div className="flex items-center gap-2">
                <Button size="sm" className="flex-1 cursor-pointer" onClick={aplicarBusqueda}>
                  Buscar
                </Button>
                <Button size="sm" variant="outline" className="flex-1 cursor-pointer" onClick={limpiarBusqueda}>
                  Limpiar
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Los filtros rápidos de abajo se aplican al instante, sin apretar Buscar.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={orden} onValueChange={(v) => filtrar(() => setOrden(v))()}>
                  <SelectTrigger className="h-9 text-sm flex-1 min-w-[140px]">
                    <SelectValue placeholder="Orden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fecha-doc">Fecha documento</SelectItem>
                    <SelectItem value="recientes">Más recientes</SelectItem>
                    <SelectItem value="titulo">Título A–Z</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant={soloFijadas ? 'default' : 'outline'}
                  onClick={filtrar(() => setSoloFijadas((v) => !v))}
                  className="cursor-pointer flex-1 min-w-[140px]"
                >
                  <Pin className="w-3.5 h-3.5" />
                  Solo fijados
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">
                  {filtrados.length} aviso{filtrados.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <Tabs value={tab} onValueChange={(v) => cambiarTab(v as 'borradores' | 'publicados')} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="borradores" className="text-xs">
                  Borradores ({nBorradores})
                </TabsTrigger>
                <TabsTrigger value="publicados" className="text-xs">
                  Publicados ({nPublicados})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {visibles.length === 0 ? (
              <ListaVacia
                icon={Search}
                titulo="Sin resultados"
                descripcion="No hay avisos con esos filtros."
              />
            ) : (
          <TablaResponsive
            desktop={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead>Aviso</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-28">Prioridad</TableHead>
                  <TableHead className="w-28">Doc.</TableHead>
                  <TableHead className="w-16 text-center" title="Adjuntos">Adj.</TableHead>
                  <TableHead className="w-40 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={p.publicado ? 'default' : 'secondary'} className="text-[11px]">
                          {p.publicado ? 'Publicado' : 'Borrador'}
                        </Badge>
                        {p.fijada && <Pin className="w-3.5 h-3.5 text-primary" />}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm font-semibold truncate">{p.ref_titulo}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        {[p.cite, p.fecha_documento ? (formatearFechaCorta(p.fecha_documento) ?? '') : ''].filter(Boolean).join(' · ')}
                      </p>
                      {p.ticket && (
                        <Link
                          href={`${route('denuncias.bandeja')}?destacar=${encodeURIComponent(p.ticket)}`}
                          className="text-[11px] font-mono font-semibold text-primary hover:underline"
                        >
                          {p.ticket}{p.evento ? ` · ${EVENTO_CASO_LABEL[p.evento] ?? p.evento}` : ''}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{p.tipo_nombre ?? '—'}</TableCell>
                    <TableCell>
                      {p.prioridad && p.prioridad !== 'ordinario' ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${PRIORIDAD_PUBLICACION_COLOR[p.prioridad] ?? ''}`}>
                          {p.prioridad}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.fecha_documento ? (formatearFechaCorta(p.fecha_documento) ?? '') : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.archivos_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="w-3.5 h-3.5" />
                          {p.archivos_count}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AccionesFila p={p} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            }
            mobile={visibles.map((p) => (
              <details key={p.id} className="bg-card border border-border rounded-xl">
                <summary className="cursor-pointer list-none p-3.5 flex items-center gap-2">
                  <Badge variant={p.publicado ? 'default' : 'secondary'} className="text-[11px] shrink-0">
                    {p.publicado ? 'Publicado' : 'Borrador'}
                  </Badge>
                  {p.fijada && <Pin className="w-3.5 h-3.5 text-primary shrink-0" />}
                  <span className="text-sm font-semibold truncate flex-1">{p.ref_titulo}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </summary>
                <div className="px-3.5 pb-3.5 pt-3 space-y-2 border-t border-border/60 text-sm">
                  <p className="font-bold leading-snug">{p.ref_titulo}</p>
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">Tipo</span>
                    <span className="font-medium text-right">{p.tipo_nombre ?? '—'}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">Documento</span>
                    <span className="font-medium text-right font-mono">
                      {[p.cite, p.fecha_documento ? (formatearFechaCorta(p.fecha_documento) ?? '') : ''].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </div>
                  {p.ticket && (
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Caso</span>
                      <Link
                        href={`${route('denuncias.bandeja')}?destacar=${encodeURIComponent(p.ticket)}`}
                        className="font-mono font-semibold text-primary hover:underline text-right"
                      >
                        {p.ticket}{p.evento ? ` · ${EVENTO_CASO_LABEL[p.evento] ?? p.evento}` : ''}
                      </Link>
                    </div>
                  )}
                  {p.archivos_count > 0 && (
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Adjuntos</span>
                      <span className="font-medium">{p.archivos_count}</span>
                    </div>
                  )}
                  <AccionesFila p={p} />
                </div>
              </details>
            ))}
          />
            )}

            <Paginacion
              paginaActual={paginaSegura}
              totalPaginas={totalPaginas}
              totalElementos={filtrados.length}
              elementosPorPagina={POR_PAGINA}
              onPaginaChange={setPagina}
              itemLabel="avisos"
            />
          </>
        )}

        {modalForm !== undefined && (
          <PublicacionFormModal
            open={modalForm !== undefined}
            onOpenChange={(v) => { if (!v) setModalForm(undefined); }}
            tipos={tipos}
            prioridades={prioridades}
            publicacion={filaViva}
          />
        )}

        <ConfirmDialog
          open={eliminarTarget !== null}
          onOpenChange={(v) => { if (!v) setEliminarTarget(null); }}
          onConfirm={() => {
            if (!eliminarTarget) return;
            router.post(route('admin.publicaciones.destroy', { id: eliminarTarget.id }), {}, { preserveScroll: true });
            setEliminarTarget(null);
          }}
          titulo="¿Eliminar aviso?"
          descripcion="El aviso desaparecerá del panel público. Esta acción no se puede deshacer."
          itemNombre={eliminarTarget?.ref_titulo ?? ''}
        />
      </div>
    </AppLayout>
  );
}
