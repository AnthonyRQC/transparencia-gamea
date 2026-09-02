import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';

interface ModalRechazoProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalRechazo({ ticket, open, onOpenChange }: ModalRechazoProps) {
  const [justificacion, setJustificacion] = useState('');
  const [sitpreco, setSitpreco] = useState('');
  const [resumenRechazo, setResumenRechazo] = useState('');
  const [processing, setProcessing] = useState(false);

  const canSubmit = justificacion.trim().length >= 10;

  const handleSubmit = () => {
    if (!ticket || !canSubmit) return;
    setProcessing(true);
    router.post(
      route('denuncias.rechazar', { ticket }),
      {
        justificacion,
        sitpreco: sitpreco.trim() || null,
        resumen_rechazo: resumenRechazo.trim() || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} rechazada`);
          setJustificacion('');
          setSitpreco('');
          setResumenRechazo('');
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
        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <Label htmlFor="justificacion-rechazo" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Justificación del rechazo
            </Label>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Visible solo en el sistema interno (bandeja y detalle del caso).
            </p>
            <Textarea
              id="justificacion-rechazo"
              placeholder="Indique la causa legal del rechazo..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={4}
              maxLength={2000}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {justificacion.length}/2000
              </p>
              {!canSubmit && justificacion.length > 0 && (
                <p className="text-[11px] text-destructive font-medium">
                  Mínimo 5 caracteres
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sitpreco-rechazo">
              SITPRECO
            </Label>
            <Input
              id="sitpreco-rechazo"
              placeholder=""
              value={sitpreco}
              onChange={(e) => setSitpreco(e.target.value)}
              maxLength={50}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="resumen-rechazo">
              Resumen breve para el denunciante
            </Label>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Opcional. Este texto se mostrará al ciudadano en la consulta pública. Sea respetuoso y objetivo.
            </p>
            <Textarea
              id="resumen-rechazo"
              placeholder="Ej: La denuncia no proporciona pruebas suficientes para iniciar una investigación."
              value={resumenRechazo}
              onChange={(e) => setResumenRechazo(e.target.value)}
              rows={2}
              maxLength={200}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {resumenRechazo.length}/200
              </p>
            </div>
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
