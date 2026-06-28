import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Loader2, UserPlus } from 'lucide-react';
import TecnicoCargaCard from './TecnicoCargaCard';

interface TecnicoCarga {
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
  tecnicos?: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  cargaTecnicos?: TecnicoCarga[];
  onOpenChange: (open: boolean) => void;
}

export default function AsignacionModal({ ticket, open, tecnicos: _tecnicos, cargaTecnicos, onOpenChange }: AsignacionModalProps) {
  const [selectedTecnico, setSelectedTecnico] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const carga = cargaTecnicos || [];

  const handleSubmit = () => {
    if (!ticket || !selectedTecnico) return;
    setProcessing(true);
    router.post(
      route('denuncias.asignar', { ticket }),
      { tecnico_id: selectedTecnico },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Denuncia ${ticket} asignada correctamente`);
          setSelectedTecnico(null);
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Error al asignar la denuncia');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar técnico</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Seleccione el técnico para la denuncia ${ticket}.`
              : 'Seleccione una denuncia para asignar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {carga.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay técnicos disponibles.</p>
          ) : (
            <ScrollArea className="max-h-[280px] pr-2">
              <div className="space-y-2">
                {carga.map((t) => (
                  <TecnicoCargaCard
                    key={t.id}
                    tecnico={t}
                    selected={selectedTecnico === t.id}
                    onSelect={() => setSelectedTecnico(t.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={processing || !selectedTecnico || !ticket} onClick={handleSubmit}>
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Asignando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1.5" />
                Asignar técnico
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
