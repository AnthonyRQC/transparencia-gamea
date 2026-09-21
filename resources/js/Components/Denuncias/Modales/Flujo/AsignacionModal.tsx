import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Loader2, UserPlus } from 'lucide-react';
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

interface AsignacionModalProps {
  ticket: string | null;
  open: boolean;
  investigadores?: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  cargaInvestigadores?: InvestigadorCarga[];
  onOpenChange: (open: boolean) => void;
}

export default function AsignacionModal({ ticket, open, investigadores: _investigadores, cargaInvestigadores, onOpenChange }: AsignacionModalProps) {
  const [selectedInvestigador, setSelectedInvestigador] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const carga = cargaInvestigadores || [];

  const handleSubmit = () => {
    if (!ticket || !selectedInvestigador) return;
    setProcessing(true);
    router.post(
      route('denuncias.asignar', { ticket }),
      { investigador_id: selectedInvestigador },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} asignada correctamente`);
          setSelectedInvestigador(null);
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Error al asignar la denuncia');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!processing) onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar investigador</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Seleccione el investigador para la denuncia ${ticket}.`
              : 'Seleccione una denuncia para asignar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {carga.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay investigadores disponibles.</p>
          ) : (
            <ScrollArea className="h-[280px] pr-2">
              <div className="space-y-2">
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
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={handleClose}>
            Cancelar
          </Button>
          <Button disabled={processing || !selectedInvestigador || !ticket} onClick={handleSubmit}>
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Asignando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1.5" />
                Asignar investigador
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


