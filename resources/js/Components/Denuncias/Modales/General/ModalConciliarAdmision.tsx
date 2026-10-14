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

interface ModalConciliarAdmisionProps {
  ticket: string | null;
  denuncia: {
    fecha_admitida?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateInput(d?: string | null): string {
  if (!d) return '';
  return d.substring(0, 10);
}

export default function ModalConciliarAdmision({ ticket, denuncia, open, onOpenChange }: ModalConciliarAdmisionProps) {
  const [fechaAdmitida, setFechaAdmitida] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open && denuncia) {
      setFechaAdmitida(toDateInput(denuncia.fecha_admitida));
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
        fecha_admitida: fechaAdmitida || null,
        justificacion,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Fecha de admisión conciliada para ${ticket}`);
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
          <DialogTitle>Conciliar fecha de admisión</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Ajuste la fecha de admisión de ${ticket}. La justificación es obligatoria.`
              : 'Seleccione una denuncia.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ca-admitida">Fecha de admisión</Label>
            <Input
              id="ca-admitida"
              type="date"
              value={fechaAdmitida}
              onChange={(e) => setFechaAdmitida(e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ca-justificacion" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Justificación
            </Label>
            <Textarea
              id="ca-justificacion"
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
