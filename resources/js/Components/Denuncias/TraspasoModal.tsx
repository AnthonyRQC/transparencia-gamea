import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { ArrowRightLeft } from 'lucide-react';

interface TecnicoInfo {
  id: string;
  nombre: string;
  iniciales: string;
  color: string;
}

interface TraspasoModalProps {
  ticket: string | null;
  open: boolean;
  tecnicos?: Record<string, TecnicoInfo>;
  onOpenChange: (open: boolean) => void;
}

export default function TraspasoModal({ ticket, open, tecnicos, onOpenChange }: TraspasoModalProps) {
  const [tecnicoId, setTecnicoId] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setTecnicoId('');
      setJustificacion('');
    }
  }, [open]);

  const canSubmit = tecnicoId && justificacion.trim().length >= 5 && ticket;
  const tecnicosList = tecnicos ? Object.values(tecnicos) : [];

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    router.post(
      route('denuncias.traspasar', { ticket }),
      { tecnico_id: tecnicoId, justificacion },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} traspasada correctamente`);
          setTecnicoId('');
          setJustificacion('');
          onOpenChange(false);
        },
        onError: (errors) => {
          const msg = errors?.error || 'Error al traspasar la denuncia';
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
          <DialogTitle>Traspasar caso</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Está traspasando la denuncia ${ticket} a otro técnico.`
              : 'Seleccione una denuncia para traspasar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="tecnico-destino" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Técnico destino
            </Label>
            <Select value={tecnicoId} onValueChange={setTecnicoId}>
              <SelectTrigger id="tecnico-destino">
                <SelectValue placeholder="Seleccionar técnico..." />
              </SelectTrigger>
              <SelectContent>
                {tecnicosList.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificacion-traspaso" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Justificación del traspaso
            </Label>
            <Textarea
              id="justificacion-traspaso"
              placeholder="Indique el motivo del traspaso (vacaciones, licencia, carga de trabajo, etc.)..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
              maxLength={2000}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {justificacion.length}/2000 caracteres
              </p>
              {justificacion.length > 0 && justificacion.trim().length < 5 && (
                <p className="text-[11px] text-destructive font-medium">
                  Mínimo 5 caracteres
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
            {processing ? 'Traspasando...' : (
              <>
                <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                Traspasar caso
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
