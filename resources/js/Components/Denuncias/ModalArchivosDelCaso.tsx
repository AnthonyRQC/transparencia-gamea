import { useState, useEffect } from 'react';
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
import { Upload } from 'lucide-react';
import TablaArchivosCaso from './TablaArchivosCaso';

interface ArchivoItem {
  id: number;
  denuncia_ticket: string;
  nombre: string;
  mime_type: string;
  tamano: string;
  descripcion?: string | null;
  contexto: string;
  fecha_subida: string;
}

interface ModalArchivosDelCasoProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalArchivosDelCaso({ ticket, open, onOpenChange }: ModalArchivosDelCasoProps) {
  const [archivos, setArchivos] = useState<ArchivoItem[]>([]);
  const [search, setSearch] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contexto, setContexto] = useState('general');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && ticket) {
      setSearch('');
      setNombre('');
      setDescripcion('');
      setContexto('general');
      cargarArchivos(ticket);
    }
  }, [open, ticket]);

  const cargarArchivos = (t: string) => {
    setLoading(true);
    fetch(`/transparencia/public/denuncias/${t}/archivos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArchivos(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSubir = () => {
    if (!ticket || !nombre.trim()) return;
    setProcessing(true);
    router.post(
      route('denuncias.archivos.subir', { ticket }),
      {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        contexto,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Archivo '${nombre.trim()}' subido`);
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
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archivos del caso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subir nuevo archivo</h4>
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
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="informe">Informe Final</SelectItem>
                  <SelectItem value="cierre">Cierre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={processing || !nombre.trim()}
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
