import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  Megaphone, Plus, Pencil, Trash2, Pin, PinOff,
  ChevronUp, ChevronDown, Eye, EyeOff, FileText,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import ConfirmDialog from '@/Components/Denuncias/Shared/ConfirmDialog';
import ListaVacia from '@/Components/Denuncias/ListaVacia';
import PublicacionFormModal, { type PublicacionFormData } from '@/Components/Admin/PublicacionFormModal';
import { formatearFechaCorta } from '@/helpers/fechas';
import { useCan } from '@/hooks/useCan';

interface PublicacionRow extends PublicacionFormData {
  tipo: string | null;
  tipo_nombre: string | null;
  prioridad: string | null;
  publicado: boolean;
  publicado_at: string | null;
  fijada: boolean;
  orden: number;
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
          <div className="border border-border rounded-xl bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead>Aviso</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-28">Doc.</TableHead>
                  <TableHead className="w-16 text-center" title="Adjuntos">Adj.</TableHead>
                  <TableHead className="w-40 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicaciones.map((p) => (
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
                    </TableCell>
                    <TableCell className="text-xs">{p.tipo_nombre ?? '—'}</TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
