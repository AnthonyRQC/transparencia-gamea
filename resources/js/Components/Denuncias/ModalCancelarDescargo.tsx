import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { XCircle } from 'lucide-react';

interface ModalCancelarDescargoProps {
  descargoId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalCancelarDescargo({ descargoId, open, onOpenChange }: ModalCancelarDescargoProps) {
  const [motivo, setMotivo] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) setMotivo('');
  }, [open]);

  const canSubmit = motivo.trim().length >= 5;

  const handleSubmit = () => {
    if (!canSubmit || !descargoId) return;
    setProcessing(true);
    router.post(
      route('denuncias.descargos.cancelar', { id: descargoId }),
      { motivo },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Descargo cancelado correctamente');
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al cancelar descargo');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar descargo</DialogTitle>
          <DialogDescription>
            El descargo quedará registrado como cancelado. No se exigirá respuesta al denunciado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="motivo-cancelacion" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Motivo de cancelación
            </Label>
            <Textarea
              id="motivo-cancelacion"
              placeholder="Indique por qué se cancela esta solicitud de descargo (ej: ya no es necesario, se obtuvo la información por otra vía, etc.)..."
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
              <><XCircle className="w-4 h-4 mr-1.5" />Cancelar descargo</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
