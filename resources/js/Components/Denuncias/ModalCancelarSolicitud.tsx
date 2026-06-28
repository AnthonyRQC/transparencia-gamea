import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { XCircle } from 'lucide-react';

interface ModalCancelarSolicitudProps {
  solicitudId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalCancelarSolicitud({ solicitudId, open, onOpenChange }: ModalCancelarSolicitudProps) {
  const [motivo, setMotivo] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) setMotivo('');
  }, [open]);

  const canSubmit = motivo.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit || !solicitudId) return;
    setProcessing(true);
    router.post(
      route('denuncias.solicitudes.cancelar', { id: solicitudId }),
      { motivo },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Solicitud cancelada correctamente');
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al cancelar solicitud');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar solicitud</DialogTitle>
          <DialogDescription>
            La solicitud quedará registrada como cancelada. No se esperará respuesta de la unidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="motivo-cancelacion" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Motivo de cancelación
            </Label>
            <Textarea
              id="motivo-cancelacion"
              placeholder="Indique por qué se cancela esta solicitud (ej: la información ya no es necesaria, se obtuvo por otra vía, etc.)..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{motivo.length}/2000</p>
              {motivo.length > 0 && motivo.trim().length < 10 && (
                <p className="text-[11px] text-destructive font-medium">Mínimo 10 caracteres</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Volver</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit} variant="destructive">
            {processing ? 'Cancelando...' : (
              <><XCircle className="w-4 h-4 mr-1.5" />Cancelar solicitud</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
