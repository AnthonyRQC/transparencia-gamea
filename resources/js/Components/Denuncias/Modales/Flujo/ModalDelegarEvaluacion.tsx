import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import TecnicoCargaCard from '../../Card/TecnicoCargaCard';

interface TecnicoCarga {
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
  tecnicos?: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  cargaTecnicos?: TecnicoCarga[];
  onOpenChange: (open: boolean) => void;
}

export default function ModalDelegarEvaluacion({ ticket, open, tecnicos: _tecnicos, cargaTecnicos, onOpenChange }: ModalDelegarEvaluacionProps) {
  const [selectedTecnico, setSelectedTecnico] = useState<string | null>(null);
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  const carga = cargaTecnicos || [];

  const handleSubmit = () => {
    if (!ticket || !selectedTecnico) return;
    setProcessing(true);
    router.post(
      route('denuncias.delegar-evaluacion', { ticket }),
      {
        tecnico_id: selectedTecnico,
        justificacion: justificacion.trim() || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`EvaluaciÃ³n delegada para ${ticket}`);
          setSelectedTecnico(null);
          setJustificacion('');
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Error al delegar evaluaciÃ³n');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delegar evaluaciÃ³n a un tÃ©cnico</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Seleccione el tÃ©cnico que evaluarÃ¡ ${ticket} antes de la admisiÃ³n.`
              : 'Seleccione una denuncia para delegar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ScrollArea className="h-60">
            <div className="space-y-2 pr-3">
              {carga.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No hay tÃ©cnicos disponibles</p>
              )}
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

          <div className="space-y-2">
            <Label htmlFor="justificacion-delegar">JustificaciÃ³n (opcional)</Label>
            <Textarea
              id="justificacion-delegar"
              placeholder="Describa el motivo de la delegaciÃ³n..."
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
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={processing || !selectedTecnico || !ticket} onClick={handleSubmit}>
            {processing ? 'Delegando...' : 'Delegar evaluaciÃ³n'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


