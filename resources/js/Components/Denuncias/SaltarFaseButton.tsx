import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface SaltarFaseButtonProps {
  ticket: string;
  solicitudesPendientes?: number;
  descargosPendientes?: number;
}

export default function SaltarFaseButton({ ticket, solicitudesPendientes = 0, descargosPendientes = 0 }: SaltarFaseButtonProps) {
  const [open, setOpen] = useState(false);
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) setJustificacion('');
  }, [open]);

  const canSubmit = justificacion.trim().length >= 10;
  const totalPendientes = solicitudesPendientes + descargosPendientes;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    router.post(
      route('denuncias.saltar-fase', { ticket }),
      { justificacion },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} pasó a Informe Final`);
          setOpen(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al pasar a Informe Final');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300"
      >
        <ArrowRight className="w-4 h-4" />
        Pasar a Informe Final
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!processing) setOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pasar a Informe Final</DialogTitle>
            <DialogDescription>
              La denuncia {ticket} pasará de la fase de Investigación a Informe Final. Debe justificar esta decisión.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {totalPendientes > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-semibold">⚠️ Hay items pendientes:</p>
                  {solicitudesPendientes > 0 && <p>- {solicitudesPendientes} solicitud(es) de información sin respuesta</p>}
                  {descargosPendientes > 0 && <p>- {descargosPendientes} descargo(s) sin resolver</p>}
                  <p className="mt-1">Se recomienda completar todos los trámites antes de pasar a la siguiente fase.</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="justificacion-saltar" className="after:content-['*'] after:text-destructive after:ml-0.5">
                Justificación
              </Label>
              <Textarea
                id="justificacion-saltar"
                placeholder={
                  totalPendientes > 0
                    ? 'Explique por qué pasa a Informe Final a pesar de los items pendientes...'
                    : 'Explique por qué se concluye la investigación y se pasa a Informe Final...'
                }
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                rows={4}
                maxLength={2000}
                style={{ textTransform: 'uppercase' }}
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">{justificacion.length}/2000 · MAYÚSCULAS</p>
                {justificacion.length > 0 && justificacion.trim().length < 10 && (
                  <p className="text-[11px] text-destructive font-medium">Mínimo 10 caracteres</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={processing} onClick={() => setOpen(false)}>Cancelar</Button>
            <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
              {processing ? 'Procesando...' : 'Confirmar y pasar a Informe Final'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
