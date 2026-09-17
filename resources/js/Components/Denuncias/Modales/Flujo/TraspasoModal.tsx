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

interface InvestigadorInfo {
  id: string | number;
  nombre?: string;
  name?: string;
  iniciales?: string;
  color?: string;
}

interface TraspasoModalProps {
  ticket: string | null;
  investigadorActualId?: string | number | null;
  open: boolean;
  investigadores?: Record<string, InvestigadorInfo> | InvestigadorInfo[];
  cargaInvestigadores?: InvestigadorInfo[];
  onOpenChange: (open: boolean) => void;
}

export default function TraspasoModal({ ticket, investigadorActualId, open, investigadores, cargaInvestigadores, onOpenChange }: TraspasoModalProps) {
  const [investigadorId, setInvestigadorId] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setInvestigadorId('');
      setJustificacion('');
    }
  }, [open]);

  const canSubmit = investigadorId && justificacion.trim().length >= 5 && ticket;

  const rawList = cargaInvestigadores && cargaInvestigadores.length > 0
    ? cargaInvestigadores
    : (investigadores ? (Array.isArray(investigadores) ? investigadores : Object.values(investigadores)) : []);

  const investigadoresList = rawList
    .map((t) => ({
      id: String(t.id),
      nombre: t.nombre || t.name || `Investigador #${t.id}`,
    }))
    .filter((t) => !investigadorActualId || String(t.id) !== String(investigadorActualId));

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    router.post(
      route('denuncias.traspasar', { ticket }),
      { investigador_id: investigadorId, justificacion },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} traspasada correctamente`);
          setInvestigadorId('');
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

  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!processing) {
          if (!v && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Traspasar caso</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Está traspasando la denuncia ${ticket} a otro investigador.`
              : 'Seleccione una denuncia para traspasar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="investigador-destino" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Investigador destino
            </Label>
            <Select value={investigadorId} onValueChange={setInvestigadorId}>
              <SelectTrigger id="investigador-destino">
                <SelectValue placeholder="Seleccionar investigador..." />
              </SelectTrigger>
              <SelectContent>
                {investigadoresList.map((t) => (
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
          <Button variant="outline" disabled={processing} onClick={handleClose}>
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
