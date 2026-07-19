import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { CircleCheck } from 'lucide-react';
interface ModalResponderSolicitudProps {
  solicitudId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalResponderSolicitud({ solicitudId, open, onOpenChange }: ModalResponderSolicitudProps) {
  const [respuesta, setRespuesta] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setRespuesta('');
    }
  }, [open]);

  const canSubmit = respuesta.trim().length >= 5;

  const handleSubmit = () => {
    if (!canSubmit || !solicitudId) return;
    setProcessing(true);
    router.post(
      route('denuncias.solicitudes.responder', { id: solicitudId }),
      { respuesta },
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
              style={{ textTransform: 'uppercase' }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{respuesta.length}/5000 · MAYÚSCULAS</p>
              {respuesta.length > 0 && respuesta.trim().length < 5 && (
                <p className="text-[11px] text-destructive font-medium">Mínimo 5 caracteres</p>
              )}
            </div>
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
