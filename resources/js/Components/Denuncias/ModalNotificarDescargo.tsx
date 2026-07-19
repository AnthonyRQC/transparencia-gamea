import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Bell } from 'lucide-react';

interface ModalNotificarDescargoProps {
  descargoId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalNotificarDescargo({ descargoId, open, onOpenChange }: ModalNotificarDescargoProps) {
  const [fechaNotificacion, setFechaNotificacion] = useState(new Date().toISOString().split('T')[0]);
  const [medio, setMedio] = useState('');
  const [plazoDias, setPlazoDias] = useState(10);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setFechaNotificacion(new Date().toISOString().split('T')[0]);
      setMedio('');
      setPlazoDias(10);
    }
  }, [open]);

  const canSubmit = fechaNotificacion && medio && plazoDias > 0;

  const handleSubmit = () => {
    if (!canSubmit || !descargoId) return;
    setProcessing(true);
    router.post(
      route('denuncias.descargos.notificar', { id: descargoId }),
      {
        fecha_notificacion: fechaNotificacion,
        medio,
        plazo_dias: plazoDias,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Notificación registrada correctamente');
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al registrar notificación');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notificar descargo</DialogTitle>
          <DialogDescription>
            Registre la notificación al denunciado para que presente su descargo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="fecha-notificacion" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Fecha de notificación
            </Label>
            <input
              id="fecha-notificacion"
              type="date"
              value={fechaNotificacion}
              onChange={(e) => setFechaNotificacion(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medio-notificacion" className="after:content-['*'] after:text-destructive after:ml-0.5">
                Medio de notificación
              </Label>
              <Input
                id="medio-notificacion"
                placeholder="Ej: PRESENCIAL, WHATSAPP, CÉDULA, CARTA NOTARIADA, ETC."
                value={medio}
                onChange={(e) => setMedio(e.target.value)}
                maxLength={200}
                style={{ textTransform: 'uppercase' }}
              />
              <p className="text-[10px] text-muted-foreground">Se guardará en MAYÚSCULAS</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plazo-dias" className="after:content-['*'] after:text-destructive after:ml-0.5">
                Plazo (días hábiles)
              </Label>
              <input
                id="plazo-dias"
                type="number"
                min="1"
                max="30"
                value={plazoDias}
                onChange={(e) => setPlazoDias(parseInt(e.target.value) || 0)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? 'Guardando...' : (
              <><Bell className="w-4 h-4 mr-1.5" />Registrar notificación</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
