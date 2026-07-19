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

interface ModalConciliarFechasProps {
  ticket: string | null;
  denuncia: {
    created_at?: string | null;
    fecha_admitida?: string | null;
    fecha_asignada?: string | null;
    fecha_rechazada?: string | null;
    fecha_reapertura?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateInput(d?: string | null): string {
  if (!d) return '';
  return d.substring(0, 10);
}

export default function ModalConciliarFechas({ ticket, denuncia, open, onOpenChange }: ModalConciliarFechasProps) {
  const [createdAt, setCreatedAt] = useState('');
  const [fechaAdmitida, setFechaAdmitida] = useState('');
  const [fechaAsignada, setFechaAsignada] = useState('');
  const [fechaRechazada, setFechaRechazada] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open && denuncia) {
      setCreatedAt(toDateInput(denuncia.created_at));
      setFechaAdmitida(toDateInput(denuncia.fecha_admitida));
      setFechaAsignada(toDateInput(denuncia.fecha_asignada));
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
        created_at: createdAt || null,
        fecha_admitida: fechaAdmitida || null,
        fecha_asignada: fechaAsignada || null,
        fecha_rechazada: fechaRechazada || null,
        justificacion,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Fechas conciliadas para ${ticket}`);
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al conciliar fechas');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conciliar fechas</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Ajuste las fechas de ${ticket}. La justificación es obligatoria.`
              : 'Seleccione una denuncia.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cf-created-at">Fecha de ingreso</Label>
            <Input
              id="cf-created-at"
              type="date"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-admitida">Fecha de admisión</Label>
            <Input
              id="cf-admitida"
              type="date"
              value={fechaAdmitida}
              onChange={(e) => setFechaAdmitida(e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-asignada">Fecha de asignación</Label>
            <Input
              id="cf-asignada"
              type="date"
              value={fechaAsignada}
              onChange={(e) => setFechaAsignada(e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-rechazada">Fecha de rechazo</Label>
            <Input
              id="cf-rechazada"
              type="date"
              value={fechaRechazada}
              onChange={(e) => setFechaRechazada(e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-justificacion" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Justificación
            </Label>
            <Textarea
              id="cf-justificacion"
              placeholder="Explique detalladamente por qué se ajustan las fechas..."
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
                  : `${justificacion.length}/2000 · MAYÚSCULAS`}
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
              <><CalendarArrowUp className="w-4 h-4 mr-1.5" />Conciliar fechas</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
