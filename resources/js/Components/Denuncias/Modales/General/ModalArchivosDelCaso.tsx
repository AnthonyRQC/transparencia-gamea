import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Upload, X, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import TablaArchivosCaso from '../../Shared/TablaArchivosCaso';

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.docx';

function formatearTamano(bytes: number | string | null | undefined): string {
  const n = Number(bytes);
  if (!bytes || Number.isNaN(n) || n <= 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface ArchivoItem {
  id: number;
  denuncia_ticket: string;
  nombre: string;
  mime_type: string;
  tamano: string | null;
  descripcion?: string | null;
  contexto: string;
  fecha_subida: string;
}

interface ModalArchivosDelCasoProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextoInicial?: string;
  contextoIdInicial?: number | null;
}

export default function ModalArchivosDelCaso({ ticket, open, onOpenChange, contextoInicial, contextoIdInicial }: ModalArchivosDelCasoProps) {
  const [archivos, setArchivos] = useState<ArchivoItem[]>([]);
  const [search, setSearch] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contexto, setContexto] = useState('general');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && ticket) {
      setSearch('');
      setNombre('');
      setDescripcion('');
      setContexto(contextoInicial || 'general');
      setArchivo(null);
      setFileError(null);
      cargarArchivos(ticket);
    }
  }, [open, ticket, contextoInicial]);

  const cargarArchivos = (t: string) => {
    setLoading(true);
    fetch(route('denuncias.archivos.listar', { ticket: t }))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArchivos(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileError(null);

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|docx)$/i)) {
      setFileError('Formato no aceptado. Use PDF, JPG, PNG o DOCX.');
      setArchivo(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`El archivo excede el tamaño máximo de ${MAX_SIZE_MB}MB.`);
      setArchivo(null);
      return;
    }

    setArchivo(file);
    if (!nombre.trim()) setNombre(file.name);
  };

  const quitarArchivo = () => {
    setArchivo(null);
    setFileError(null);
  };

  const handleSubir = () => {
    if (!ticket || !archivo || !nombre.trim()) return;
    setProcessing(true);
    router.post(
      route('denuncias.archivos.subir', { ticket }),
      {
        archivo,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        contexto,
        contexto_id: contextoIdInicial ?? undefined,
      },
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Archivo '${nombre.trim()}' subido`);
          setArchivo(null);
          setFileError(null);
          setNombre('');
          setDescripcion('');
          setContexto('general');
          cargarArchivos(ticket);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al subir archivo');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  const handleEliminar = (id: number) => {
    router.post(
      route('denuncias.archivos.eliminar', { id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Archivo eliminado');
          setArchivos((prev) => prev.filter((a) => a.id !== id));
        },
        onError: () => toast.error('Error al eliminar archivo'),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!processing) onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archivos del caso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subir nuevo archivo</h4>
            <div className="space-y-2">
              <Label htmlFor="archivo-file" className="after:content-['*'] after:text-destructive after:ml-0.5">Archivo</Label>
              {archivo ? (
                <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 bg-muted/30">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{archivo.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatearTamano(archivo.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={quitarArchivo}
                    disabled={processing}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                    title="Quitar archivo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                    dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
                  )}
                >
                  <Upload className={cn('w-6 h-6 mb-2', dragOver ? 'text-primary' : 'text-muted-foreground')} />
                  <p className="text-xs font-medium">Arrastre el archivo o haga clic para seleccionar</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">PDF, JPG, PNG, DOCX · Máx {MAX_SIZE_MB}MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="archivo-file"
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                className="hidden"
                disabled={processing}
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              {fileError && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {fileError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="archivo-nombre" className="after:content-['*'] after:text-destructive after:ml-0.5">Nombre del archivo</Label>
              <Input
                id="archivo-nombre"
                placeholder="Ej: INFORME_FINAL_2026.PDF"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={200}
                disabled={processing}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="archivo-descripcion">Descripción (opcional)</Label>
              <Textarea
                id="archivo-descripcion"
                placeholder="Breve descripción del archivo..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                maxLength={500}
                disabled={processing}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="archivo-contexto">Contexto</Label>
              <Select value={contexto} onValueChange={setContexto} disabled={processing}>
                <SelectTrigger id="archivo-contexto"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="registro">Registro</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="solicitud">Solicitud</SelectItem>
                  <SelectItem value="descargo">Descargo</SelectItem>
                  <SelectItem value="informe">Informe Final</SelectItem>
                  <SelectItem value="cierre">Cierre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={processing || !archivo || !nombre.trim()}
              onClick={handleSubir}
              className="w-full"
            >
              {processing ? 'Subiendo...' : <><Upload className="w-4 h-4 mr-1.5" />Subir archivo</>}
            </Button>
          </div>

          <Separator />

          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Archivos subidos ({archivos.length})
          </h4>

          {loading ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">Cargando...</p>
          ) : (
            <TablaArchivosCaso
              archivos={archivos}
              onEliminar={handleEliminar}
              search={search}
              onSearchChange={setSearch}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


