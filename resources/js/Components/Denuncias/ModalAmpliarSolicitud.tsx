import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ModalAmpliarSolicitudProps {
  solicitudId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalAmpliarSolicitud({ solicitudId, open, onOpenChange }: ModalAmpliarSolicitudProps) {
  const [dias, setDias] = useState(5);
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setDias(5);
      setJustificacion('');
    }
  }, [open]);

  const canSubmit = dias >= 1 && dias <= 5 && justificacion.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit || !solicitudId) return;
    setProcessing(true);
    router.post(
      route('denuncias.solicitudes.ampliar', { id: solicitudId }),
      { dias, justificacion },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Plazo ampliado ${dias} días correctamente`);
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al ampliar plazo');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ampliar plazo de solicitud</DialogTitle>
          <DialogDescription>
            Solicite una prórroga para la respuesta de la unidad externa (máx. 5 días adicionales).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dias-ampliar" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Días adicionales
            </Label>
            <Input
              id="dias-ampliar"
              type="number"
              min={1}
              max={5}
              value={dias}
              onChange={(e) => setDias(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
            />
            <p className="text-[11px] text-muted-foreground">Máximo 5 días según Art. 25 de la Ley 974</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificacion-ampliar" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Justificación de la prórroga
            </Label>
            <Textarea
              id="justificacion-ampliar"
              placeholder="Explique el motivo de la prórroga solicitada..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
              maxLength={2000}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{justificacion.length}/2000</p>
              {justificacion.length > 0 && justificacion.trim().length < 10 && (
                <p className="text-[11px] text-destructive font-medium">Mínimo 10 caracteres</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? 'Ampliando...' : (
              <><RotateCcw className="w-4 h-4 mr-1.5" />Ampliar plazo</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
