import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { CircleCheck } from 'lucide-react';
interface ModalResponderDescargoProps {
  descargoId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalResponderDescargo({ descargoId, open, onOpenChange }: ModalResponderDescargoProps) {
  const [resumen, setResumen] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setResumen('');
    }
  }, [open]);

  const canSubmit = resumen.trim().length >= 5;

  const handleSubmit = () => {
    if (!canSubmit || !descargoId) return;
    setProcessing(true);
    router.post(
      route('denuncias.descargos.responder', { id: descargoId }),
      { resumen_descargo: resumen },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Descargo registrado correctamente');
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al registrar descargo');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar respuesta de descargo</DialogTitle>
          <DialogDescription>
            Registre el resumen del descargo presentado por el denunciado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="resumen-descargo" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Resumen del descargo
            </Label>
            <Textarea
              id="resumen-descargo"
              placeholder="Resuma los argumentos y pruebas presentados por el denunciado..."
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              rows={4}
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{resumen.length}/5000</p>
              {resumen.length > 0 && resumen.trim().length < 5 && (
                <p className="text-[11px] text-destructive font-medium">Mínimo 5 caracteres</p>
              )}
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? 'Guardando...' : (
              <><CircleCheck className="w-4 h-4 mr-1.5" />Registrar descargo</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
