import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import type { UsuarioRow } from './usuarios';

interface Impacto {
  casos_activos: Array<{ ticket: string; estado: string }>;
  total_casos: number;
}

interface Props {
  usuario: UsuarioRow | null;
  investigadores: Array<{ id: number; name: string }>;
  onOpenChange: (open: boolean) => void;
}

/** Desactivar con bloqueo duro + traspaso en lote si hay casos activos. */
export default function ModalImpactoDesactivar({ usuario, investigadores, onOpenChange }: Props) {
  const [impacto, setImpacto] = useState<Impacto | null>(null);
  const [destino, setDestino] = useState('');
  const [motivo, setMotivo] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!usuario) {
      setImpacto(null);
      setDestino('');
      setMotivo('');
      setJustificacion('');
      return;
    }
    fetch(route('admin.usuarios.impacto', { id: usuario.id }), {
      headers: { Accept: 'application/json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setImpacto)
      .catch(() => toast.error('No se pudo cargar el impacto.'));
  }, [usuario]);

  if (!usuario) return null;

  const conCasos = (impacto?.total_casos ?? usuario.casos_activos) > 0;

  const confirmar = () => {
    setProcessing(true);
    router.post(
      route('admin.usuarios.desactivar', { id: usuario.id }),
      { motivo_baja: motivo || null, traspaso_a: destino ? Number(destino) : null, justificacion: justificacion || null },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Usuario desactivado.');
          onOpenChange(false);
        },
        onError: (errors) => toast.error(Object.values(errors).flat().join(' ')),
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={!!usuario} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Desactivar a {usuario.name}</DialogTitle>
          <DialogDescription>
            Se revoca su sesión. El historial (casos, bitácora) se preserva.
            {impacto === null && ' Cargando impacto...'}
          </DialogDescription>
        </DialogHeader>

        {impacto && impacto.total_casos > 0 ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm">
              <p className="font-semibold">Tiene {impacto.total_casos} caso(s) activo(s). Bloqueo: elige destino de traspaso.</p>
              <ul className="mt-1.5 space-y-0.5 font-mono text-xs">
                {impacto.casos_activos.map((c) => (
                  <li key={c.ticket}>{c.ticket} · {c.estado}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1.5">
              <Label>Investigador destino *</Label>
              <Select value={destino} onValueChange={setDestino}>
                <SelectTrigger><SelectValue placeholder="Seleccionar destino" /></SelectTrigger>
                <SelectContent>
                  {investigadores
                    .filter((i) => i.id !== usuario.id)
                    .map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Justificación del traspaso *</Label>
              <Textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)} rows={2} />
            </div>
          </div>
        ) : (
          impacto && (
            <p className="text-sm text-muted-foreground">Sin casos activos. Se puede desactivar directo.</p>
          )
        )}

        <div className="space-y-1.5">
          <Label htmlFor="m-motivo">Motivo de baja (opcional)</Label>
          <Input id="m-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="RELEVO DE GESTIÓN" autoComplete="off" />
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={processing || (conCasos && (!destino || !justificacion))}
            onClick={confirmar}
          >
            {processing ? 'Desactivando...' : 'Desactivar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
