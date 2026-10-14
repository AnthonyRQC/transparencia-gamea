import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { CalendarArrowUp } from 'lucide-react';

interface ModalConciliarRechazoProps {
  ticket: string | null;
  denuncia: {
    fecha_rechazada?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateInput(d?: string | null): string {
  if (!d) return '';
  return d.substring(0, 10);
}

export default function ModalConciliarRechazo({ ticket, denuncia, open, onOpenChange }: ModalConciliarRechazoProps) {
  const [fechaRechazada, setFechaRechazada] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open && denuncia) {
      setFechaRechazada(toDateInput(denuncia.fecha_rechazada));
      setJustificacion('');
    }
  }, [open, denuncia]);

  const canSubmit = justificacion.trim().length >= 20 && ticket;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    router.post(
      route('denuncias.conciliar-fechas', { ticket }),
      {
        fecha_rechazada: fechaRechazada || null,
        justificacion,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Fecha de rechazo conciliada para ${ticket}`);
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al conciliar fecha');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conciliar fecha de rechazo</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Ajuste la fecha de rechazo de ${ticket}. La justificación es obligatoria.`
              : 'Seleccione una denuncia.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cr-rechazada">Fecha de rechazo</Label>
            <Input
              id="cr-rechazada"
              type="date"
              value={fechaRechazada}
              onChange={(e) => setFechaRechazada(e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cr-justificacion" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Justificación
            </Label>
            <Textarea
              id="cr-justificacion"
              placeholder="Explique detalladamente por qué se ajusta la fecha..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
              maxLength={2000}
              disabled={processing}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {justificacion.length < 20
                  ? `Mínimo 20 caracteres (${justificacion.length}/2000)`
                  : `${justificacion.length}/2000`}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? 'Conciliando...' : (
              <><CalendarArrowUp className="w-4 h-4 mr-1.5" />Conciliar fecha</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
