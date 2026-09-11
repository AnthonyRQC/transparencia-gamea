import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import ConfirmDialog from '@/Components/Denuncias/Shared/ConfirmDialog';

export interface PublicacionArchivoRow {
  id: number;
  nombre: string;
  tamano: string | null;
  eliminado: boolean;
  fecha_eliminacion: string | null;
}

export interface PublicacionFormData {
  id: number;
  tipo_id: number;
  prioridad_id: number;
  cite: string | null;
  fecha_documento: string | null;
  emisor: string | null;
  destinatario_display: string | null;
  ref_titulo: string;
  resumen: string | null;
  cuerpo: string | null;
  referencia_externa: string | null;
  publicado: boolean;
  archivos_count: number;
  archivos: PublicacionArchivoRow[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipos: Array<{ id: number; clave: string; nombre: string }>;
  prioridades: Array<{ id: number; clave: string; nombre: string }>;
  publicacion?: PublicacionFormData | null;
}

const VACIO = {
  tipo_id: '',
  prioridad_id: '',
  cite: '',
  fecha_documento: '',
  emisor: 'UTLCC',
  destinatario_display: '',
  ref_titulo: '',
  resumen: '',
  cuerpo: '',
  referencia_externa: '',
  publicar: true,
};

export default function PublicacionFormModal({ open, onOpenChange, tipos, prioridades, publicacion }: Props) {
  const { errors } = usePage().props as unknown as { errors: Record<string, string> };
  const [form, setForm] = useState<Record<string, string | boolean>>({ ...VACIO });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [avisoSinPdf, setAvisoSinPdf] = useState(false);
  const [quitarTarget, setQuitarTarget] = useState<PublicacionArchivoRow | null>(null);
  const abiertoAntes = useRef(false);

  const esEdicion = !!publicacion;

  useEffect(() => {
    if (!open) {
      abiertoAntes.current = false;
      return;
    }
    if (abiertoAntes.current) return;
    abiertoAntes.current = true;
    if (publicacion) {
      setForm({
        tipo_id: String(publicacion.tipo_id),
        prioridad_id: String(publicacion.prioridad_id),
        cite: publicacion.cite ?? '',
        fecha_documento: publicacion.fecha_documento ?? '',
        emisor: publicacion.emisor ?? 'UTLCC',
        destinatario_display: publicacion.destinatario_display ?? '',
        ref_titulo: publicacion.ref_titulo,
        resumen: publicacion.resumen ?? '',
        cuerpo: publicacion.cuerpo ?? '',
        referencia_externa: publicacion.referencia_externa ?? '',
        publicar: publicacion.publicado,
      });
    } else {
      setForm({ ...VACIO });
    }
    setArchivo(null);
    setAvisoSinPdf(false);
  }, [open, publicacion]);

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const tieneAdjunto = (publicacion?.archivos_count ?? 0) > 0 || archivo !== null;

  const enviar = () => {
    const payload: { [key: string]: any } = { ...form };
    if (archivo) payload.archivo = archivo;
    setProcessing(true);
    const url = esEdicion
      ? route('admin.publicaciones.update', { id: publicacion!.id })
      : route('admin.publicaciones.store');
    router.post(url, payload, {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => setProcessing(false),
      onSuccess: () => onOpenChange(false),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieneAdjunto) {
      setAvisoSinPdf(true);
      return;
    }
    enviar();
  };

  const err = (key: string) => errors[key] && (
    <p className="text-xs text-destructive mt-1">{errors[key]}</p>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{esEdicion ? 'Editar aviso' : 'Nuevo aviso'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Tipo *</label>
                <Select value={String(form.tipo_id)} onValueChange={(v) => set('tipo_id', v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {err('tipo_id')}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Prioridad *</label>
                <Select value={String(form.prioridad_id)} onValueChange={(v) => set('prioridad_id', v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {err('prioridad_id')}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">CITE</label>
                <Input
                  value={String(form.cite)}
                  onChange={(e) => set('cite', e.target.value)}
                  placeholder="GAMEA/UTLCC/N° 075/2026"
                  className="h-9 text-sm font-mono"
                />
                {err('cite')}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Fecha del documento</label>
                <Input
                  type="date"
                  value={String(form.fecha_documento)}
                  onChange={(e) => set('fecha_documento', e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="h-9 text-sm"
                />
                {err('fecha_documento')}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Emisor *</label>
                <Input
                  value={String(form.emisor)}
                  onChange={(e) => set('emisor', e.target.value)}
                  className="h-9 text-sm"
                />
                {err('emisor')}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Destinatario</label>
                <Input
                  value={String(form.destinatario_display)}
                  onChange={(e) => set('destinatario_display', e.target.value)}
                  placeholder="POBLACIÓN EN GENERAL"
                  className="h-9 text-sm"
                />
                {err('destinatario_display')}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold">Referencia / título *</label>
                <span className="text-[11px] text-muted-foreground">{String(form.ref_titulo).length}/140</span>
              </div>
              <Input
                value={String(form.ref_titulo)}
                onChange={(e) => set('ref_titulo', e.target.value.slice(0, 140))}
                placeholder="REF.: ..."
                className="h-9 text-sm font-semibold"
              />
              {err('ref_titulo')}
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Resumen (para la tarjeta del muro)</label>
              <textarea
                value={String(form.resumen)}
                onChange={(e) => set('resumen', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {err('resumen')}
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Contenido</label>
              <textarea
                value={String(form.cuerpo)}
                onChange={(e) => set('cuerpo', e.target.value)}
                rows={4}
                placeholder="Texto del aviso (opcional si adjunta el documento firmado)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {err('cuerpo')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Referencia externa</label>
                <Input
                  value={String(form.referencia_externa)}
                  onChange={(e) => set('referencia_externa', e.target.value)}
                  placeholder="SIPRECO / RA / HR..."
                  className="h-9 text-sm font-mono"
                />
                {err('referencia_externa')}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">
                  Documento (PDF/imagen, máx 20MB)
                </label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  className="h-9 text-sm"
                />
                {err('archivo')}
                {(publicacion?.archivos ?? []).filter((a) => !a.eliminado).length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {(publicacion?.archivos ?? []).filter((a) => !a.eliminado).map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-2.5 py-1.5">
                        <span className="truncate font-medium flex-1">{a.nombre}</span>
                        {a.tamano && <span className="text-muted-foreground shrink-0">{a.tamano}</span>}
                        <a
                          href={route('admin.publicaciones.descargar', { id: a.id })}
                          className="text-primary hover:underline shrink-0 font-semibold"
                        >
                          Ver
                        </a>
                        <button
                          type="button"
                          onClick={() => setQuitarTarget(a)}
                          className="text-destructive hover:underline shrink-0 font-semibold cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {(publicacion?.archivos ?? []).filter((a) => a.eliminado).length > 0 && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">
                      Historial de adjuntos ({(publicacion?.archivos ?? []).filter((a) => a.eliminado).length})
                    </summary>
                    <div className="mt-1.5 space-y-1">
                      {(publicacion?.archivos ?? []).filter((a) => a.eliminado).map((a) => (
                        <p key={a.id} className="text-muted-foreground truncate">
                          {a.nombre}
                          {a.fecha_eliminacion && <span> · quitado el {a.fecha_eliminacion}</span>}
                        </p>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.publicar === true}
                onChange={(e) => set('publicar', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="font-medium">Publicar inmediatamente</span>
              <span className="text-muted-foreground text-xs">(sin marcar queda como borrador)</span>
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        variant="confirm"
        open={quitarTarget !== null}
        onOpenChange={(v) => { if (!v) setQuitarTarget(null); }}
        onConfirm={() => {
          if (!quitarTarget) return;
          router.post(route('admin.publicaciones.quitar', { id: quitarTarget.id }), {}, { preserveScroll: true });
          setQuitarTarget(null);
        }}
        titulo="¿Quitar adjunto del muro?"
        descripcion={`"${quitarTarget?.nombre ?? ''}" dejará de verse en el panel, pero el archivo físico se conserva en el historial y la auditoría.`}
        confirmText="Sí, quitar"
        cancelText="Volver"
      />

      <ConfirmDialog
        variant="confirm"
        open={avisoSinPdf}
        onOpenChange={setAvisoSinPdf}
        onConfirm={() => { setAvisoSinPdf(false); enviar(); }}
        titulo="¿Publicar sin documento?"
        descripcion="Se publicará el aviso sin documento adjunto de respaldo. Puede adjuntarlo después editando el aviso."
        confirmText="Sí, publicar así"
        cancelText="Volver"
      />
    </>
  );
}
