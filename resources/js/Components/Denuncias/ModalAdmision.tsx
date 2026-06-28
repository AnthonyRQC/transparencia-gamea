import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';

interface ModalAdmisionProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalAdmision({ ticket, open, onOpenChange }: ModalAdmisionProps) {
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = () => {
    if (!ticket) return;
    setProcessing(true);
    router.post(
      `/denuncias/${ticket}/admitir`,
      { justificacion },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} admitida`);
          setJustificacion('');
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Error al admitir la denuncia');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admitir denuncia</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Está admitiendo la denuncia ${ticket}.`
              : 'Seleccione una denuncia para admitir.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="justificacion-admision">Justificación (opcional)</Label>
          <Textarea
            id="justificacion-admision"
            placeholder="Describa el motivo de la admisión..."
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-[11px] text-muted-foreground">
            {justificacion.length}/500 caracteres
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={processing || !ticket} onClick={handleSubmit}>
            {processing ? 'Admitiendo...' : 'Admitir denuncia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
