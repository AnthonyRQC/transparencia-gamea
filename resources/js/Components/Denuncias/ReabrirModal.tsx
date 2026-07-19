import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { cn } from '@/lib/utils';

interface ReabrirModalProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReabrirModal({ ticket, open, onOpenChange }: ReabrirModalProps) {
  const [justificacion, setJustificacion] = useState('');
  const [nuevaFechaLimite, setNuevaFechaLimite] = useState<Date | undefined>(undefined);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setJustificacion('');
      setNuevaFechaLimite(undefined);
    }
  }, [open]);

  const canSubmit = justificacion.trim().length >= 20 && nuevaFechaLimite && ticket;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    router.post(
      route('denuncias.reabrir', { ticket }),
      {
        justificacion,
        nueva_fecha_limite: format(nuevaFechaLimite!, 'yyyy-MM-dd'),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} reabierta correctamente`);
          setJustificacion('');
          setNuevaFechaLimite(undefined);
          onOpenChange(false);
        },
        onError: (errors) => {
          const msg = errors?.error || 'Error al reabrir la denuncia';
          toast.error(msg);
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reabrir denuncia</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Está reabriendo la denuncia ${ticket}. Volverá a la bandeja "Por admitir" y deberá ser admitida nuevamente.`
              : 'Seleccione una denuncia para reabrir.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nueva-fecha-limite" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Nueva fecha límite
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="nueva-fecha-limite"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !nuevaFechaLimite && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {nuevaFechaLimite
                    ? format(nuevaFechaLimite, 'PPP', { locale: es })
                    : 'Seleccionar fecha...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nuevaFechaLimite}
                  onSelect={setNuevaFechaLimite}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            <p className="text-[11px] text-muted-foreground">
              Defina la nueva fecha límite para la denuncia reabierta.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificacion-reapertura" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Justificación de la reapertura
            </Label>
            <Textarea
              id="justificacion-reapertura"
              placeholder="Explique detalladamente por qué se reabre esta denuncia..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={4}
              maxLength={2000}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {justificacion.length}/2000 caracteres · MAYÚSCULAS
              </p>
              {justificacion.length > 0 && justificacion.trim().length < 20 && (
                <p className="text-[11px] text-destructive font-medium">
                  Mínimo 20 caracteres
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? 'Reabriendo...' : (
              <>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reabrir denuncia
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
