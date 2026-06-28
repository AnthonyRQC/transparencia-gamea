import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { CircleCheck, Paperclip } from 'lucide-react';
import ArchivoAdjunto from './ArchivoAdjunto';

interface MockArchivo {
  nombre: string;
  tamano: string;
}

interface ModalResponderSolicitudProps {
  solicitudId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalResponderSolicitud({ solicitudId, open, onOpenChange }: ModalResponderSolicitudProps) {
  const [respuesta, setRespuesta] = useState('');
  const [archivos, setArchivos] = useState<MockArchivo[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setRespuesta('');
      setArchivos([]);
    }
  }, [open]);

  const canSubmit = respuesta.trim().length >= 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const tamano = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setArchivos((prev) => [...prev, { nombre: file.name, tamano }]);
    }
    e.target.value = '';
  };

  const removeArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!canSubmit || !solicitudId) return;
    setProcessing(true);
    router.post(
      route('denuncias.solicitudes.responder', { id: solicitudId }),
      { respuesta, archivos: archivos.map((a) => ({ nombre: a.nombre, tamano: a.tamano })) },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Respuesta registrada correctamente');
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al registrar respuesta');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Responder solicitud</DialogTitle>
          <DialogDescription>
            Registre la respuesta recibida de la unidad externa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="respuesta-solicitud" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Respuesta recibida
            </Label>
            <Textarea
              id="respuesta-solicitud"
              placeholder="Detalle la información recibida..."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              rows={4}
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{respuesta.length}/5000</p>
              {respuesta.length > 0 && respuesta.trim().length < 10 && (
                <p className="text-[11px] text-destructive font-medium">Mínimo 10 caracteres</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Archivos recibidos</Label>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted cursor-pointer transition-colors">
                <Paperclip className="w-3.5 h-3.5" />
                Adjuntar archivo
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            {archivos.length > 0 && (
              <div className="space-y-1 mt-2">
                {archivos.map((a, i) => (
                  <ArchivoAdjunto key={i} nombre={a.nombre} tamano={a.tamano} onEliminar={() => removeArchivo(i)} />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? 'Guardando...' : (
              <><CircleCheck className="w-4 h-4 mr-1.5" />Registrar respuesta</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
