import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import InvestigadorCargaCard from '../../Card/InvestigadorCargaCard';

interface InvestigadorCarga {
  id: string;
  nombre: string;
  iniciales: string;
  color: string;
  activos: number;
  por_vencer: number;
  vencidos: number;
}

interface ModalDelegarEvaluacionProps {
  ticket: string | null;
  open: boolean;
  investigadores?: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  cargaInvestigadores?: InvestigadorCarga[];
  onOpenChange: (open: boolean) => void;
}

export default function ModalDelegarEvaluacion({ ticket, open, investigadores: _investigadores, cargaInvestigadores, onOpenChange }: ModalDelegarEvaluacionProps) {
  const [selectedInvestigador, setSelectedInvestigador] = useState<string | null>(null);
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  const carga = cargaInvestigadores || [];

  const handleSubmit = () => {
    if (!ticket || !selectedInvestigador) return;
    setProcessing(true);
    router.post(
      route('denuncias.delegar-evaluacion', { ticket }),
      {
        investigador_id: selectedInvestigador,
        justificacion: justificacion.trim() || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Evaluación delegada para ${ticket}`);
          setSelectedInvestigador(null);
          setJustificacion('');
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Error al delegar evaluación');
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
          <DialogTitle>Delegar evaluación a un investigador</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Seleccione el investigador que evaluará ${ticket} antes de la admisión.`
              : 'Seleccione una denuncia para delegar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ScrollArea className="h-60">
            <div className="space-y-2 pr-3">
              {carga.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No hay investigadores disponibles</p>
              )}
              {carga.map((t) => (
                <InvestigadorCargaCard
                  key={t.id}
                  investigador={t}
                  selected={selectedInvestigador === t.id}
                  onSelect={() => setSelectedInvestigador(t.id)}
                />
              ))}
            </div>
          </ScrollArea>

          <div className="space-y-2">
            <Label htmlFor="justificacion-delegar">Justificación (opcional)</Label>
            <Textarea
              id="justificacion-delegar"
              placeholder="Describa el motivo de la delegación..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={processing}
              style={{ textTransform: 'uppercase' }}
            />
            <p className="text-[11px] text-muted-foreground">{justificacion.length}/500</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={handleClose}>
            Cancelar
          </Button>
          <Button disabled={processing || !selectedInvestigador || !ticket} onClick={handleSubmit}>
            {processing ? 'Delegando...' : 'Delegar evaluación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


