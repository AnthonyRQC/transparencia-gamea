import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';

const UNIDADES: Record<string, string> = {
  'sistemas': 'Unidad de Sistemas',
  'adquisiciones': 'Dirección de Adquisiciones',
  'recursos-humanos': 'Dirección de Recursos Humanos',
  'transito': 'Dirección de Tránsito',
  'catastro': 'Unidad de Catastro',
  'obras-publicas': 'Dirección de Obras Públicas',
  'ingresos': 'Dirección de Ingresos',
  'secretaria-general': 'Secretaría General',
  'contrataciones': 'Unidad de Contrataciones',
  'hacienda': 'Dirección de Hacienda',
  'auditoria': 'Unidad de Auditoría Interna',
  'archivo': 'Archivo Central',
  'ministerio-justicia': 'Ministerio de Justicia y Transparencia Institucional',
  'otro': 'Otra (especificar)',
};

interface ModalNuevaSolicitudProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalNuevaSolicitud({ ticket, open, onOpenChange }: ModalNuevaSolicitudProps) {
  const [unidadDestino, setUnidadDestino] = useState('');
  const [detalle, setDetalle] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setUnidadDestino('');
      setDetalle('');
    }
  }, [open]);

  const canSubmit = unidadDestino && detalle.trim().length >= 10 && ticket;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    router.post(
      route('denuncias.solicitudes.store', { ticket }),
      { unidad_destino: unidadDestino, detalle },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Solicitud creada correctamente');
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          const msg = keys.length > 0 ? errors[keys[0]] : 'Error al crear solicitud';
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
          <DialogTitle>Nueva solicitud de información</DialogTitle>
          <DialogDescription>
            {ticket
              ? `Solicitud para la denuncia ${ticket}. Plazo legal: 10 días naturales.`
              : 'Seleccione una denuncia primero.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="unidad-destino" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Unidad destino
            </Label>
            <Select value={unidadDestino} onValueChange={setUnidadDestino}>
              <SelectTrigger id="unidad-destino">
                <SelectValue placeholder="Seleccionar unidad..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(UNIDADES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalle-solicitud" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Detalle de la solicitud
            </Label>
            <Textarea
              id="detalle-solicitud"
              placeholder="Describa qué documentación o información se solicita..."
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              rows={4}
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{detalle.length}/2000</p>
              {detalle.length > 0 && detalle.trim().length < 10 && (
                <p className="text-[11px] text-destructive font-medium">Mínimo 10 caracteres</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? 'Creando...' : (
              <><Plus className="w-4 h-4 mr-1.5" />Crear solicitud</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
