import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';

interface ModalRechazoProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalRechazo({ ticket, open, onOpenChange }: ModalRechazoProps) {
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  const canSubmit = justificacion.trim().length >= 10;

  const handleSubmit = () => {
    if (!ticket || !canSubmit) return;
    setProcessing(true);
    router.post(
      `/denuncias/${ticket}/rechazar`,
      { justificacion },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} rechazada`);
          setJustificacion('');
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Error al rechazar la denuncia');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rechazar denuncia</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Está rechazando la denuncia ${ticket}. La justificación es obligatoria según el Art. 23 de la Ley 974.`
              : 'Seleccione una denuncia para rechazar.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="justificacion-rechazo" className="after:content-['*'] after:text-destructive after:ml-0.5">
            Justificación del rechazo
          </Label>
          <Textarea
            id="justificacion-rechazo"
            placeholder="Indique la causa legal del rechazo..."
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            rows={4}
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {justificacion.length}/2000 caracteres
            </p>
            {!canSubmit && justificacion.length > 0 && (
              <p className="text-[11px] text-destructive font-medium">
                Mínimo 10 caracteres
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={processing || !canSubmit || !ticket}
            onClick={handleSubmit}
          >
            {processing ? 'Rechazando...' : 'Rechazar denuncia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
