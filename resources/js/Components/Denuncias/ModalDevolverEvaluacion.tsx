import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';

interface Evaluacion {
  id: number;
  ticket: string;
  tecnico_id: string;
  tecnico_nombre: string;
  delegada_at: string;
  estado: string;
}

interface DenunciaInfo {
  ticket: string;
  hechos?: string;
  denunciante?: { nombres?: string };
  tipo?: string;
}

interface ModalDevolverEvaluacionProps {
  evaluacion: Evaluacion | null;
  denuncia?: DenunciaInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalDevolverEvaluacion({ evaluacion, denuncia, open, onOpenChange }: ModalDevolverEvaluacionProps) {
  const [texto, setTexto] = useState('');
  const [recomendacion, setRecomendacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setTexto('');
      setRecomendacion('');
      setProcessing(false);
    }
  }, [open]);

  if (!evaluacion) return null;

  const canSubmit = recomendacion && !processing;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    router.post(
      route('denuncias.evaluaciones.devolver', { id: evaluacion.id }),
      {
        texto_evaluacion: texto.trim(),
        recomendacion,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Evaluación devuelta para ${evaluacion.ticket}`);
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al devolver evaluación');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Devolver evaluación de la denuncia</DialogTitle>
          <DialogDescription>
            {evaluacion.ticket} — Delegada por el Jefe el{' '}
            {new Date(evaluacion.delegada_at).toLocaleDateString('es-BO')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {denuncia && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Denunciante:</span>
                <span className="font-medium">{denuncia.denunciante?.nombres || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Hechos:</span>
                <p className="text-xs mt-0.5 line-clamp-3 text-foreground/80">
                  {denuncia.hechos?.substring(0, 300) || '—'}
                </p>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="recomendacion" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Recomendación
            </Label>
            <Select value={recomendacion} onValueChange={setRecomendacion} disabled={processing}>
              <SelectTrigger id="recomendacion">
                <SelectValue placeholder="Seleccione recomendación..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admitir">Admitir</SelectItem>
                <SelectItem value="rechazar">Rechazar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="texto-evaluacion">
              Evaluación técnica resumida
              <span className="text-[10px] text-muted-foreground ml-1 font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="texto-evaluacion"
              placeholder="Describa su evaluación de la denuncia..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={5}
              maxLength={2000}
              disabled={processing}
            />
            <p className="text-[11px] text-muted-foreground">{texto.length}/2000</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {processing ? 'Devolviendo...' : 'Devolver al Jefe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
