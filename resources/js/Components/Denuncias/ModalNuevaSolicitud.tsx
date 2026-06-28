import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Plus, Save } from 'lucide-react';

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

const UNIDADES_VALUES = Object.keys(UNIDADES);

interface SolicitudItem {
  id: number;
  ticket: string;
  unidad_destino: string;
  detalle: string;
  plazo_dias?: number;
  estado: string;
}

interface ModalNuevaSolicitudProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitudToEdit?: SolicitudItem | null;
}

export default function ModalNuevaSolicitud({ ticket, open, onOpenChange, solicitudToEdit }: ModalNuevaSolicitudProps) {
  const isEdit = !!solicitudToEdit;
  const [esLibre, setEsLibre] = useState(false);
  const [unidadDestino, setUnidadDestino] = useState('');
  const [unidadLibre, setUnidadLibre] = useState('');
  const [plazoDias, setPlazoDias] = useState(10);
  const [detalle, setDetalle] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      if (solicitudToEdit) {
        const unidad = solicitudToEdit.unidad_destino;
        const isInCatalog = UNIDADES_VALUES.includes(unidad);
        setEsLibre(!isInCatalog);
        setUnidadDestino(isInCatalog ? unidad : '');
        setUnidadLibre(!isInCatalog ? unidad : '');
        setPlazoDias(solicitudToEdit.plazo_dias || 10);
        setDetalle(solicitudToEdit.detalle || '');
      } else {
        setEsLibre(false);
        setUnidadDestino('');
        setUnidadLibre('');
        setPlazoDias(10);
        setDetalle('');
      }
    }
  }, [open, solicitudToEdit]);

  const destinoValue = esLibre ? unidadLibre.trim() : unidadDestino;
  const canSubmit = (esLibre ? unidadLibre.trim().length >= 5 : unidadDestino)
    && detalle.trim().length >= 10
    && plazoDias >= 1 && plazoDias <= 45
    && (isEdit ? solicitudToEdit?.id : ticket);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);

    const payload = {
      unidad_destino: destinoValue,
      plazo_dias: plazoDias,
      detalle,
    };

    if (isEdit && solicitudToEdit) {
      router.post(
        route('denuncias.solicitudes.editar', { id: solicitudToEdit.id }),
        payload,
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success('Solicitud actualizada correctamente');
            onOpenChange(false);
          },
          onError: (errors) => {
            const keys = Object.keys(errors);
            toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al editar solicitud');
          },
          onFinish: () => setProcessing(false),
        }
      );
    } else {
      router.post(
        route('denuncias.solicitudes.store', { ticket }),
        payload,
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar solicitud' : 'Nueva solicitud de información'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifique los datos de la solicitud. Los cambios quedarán registrados en el historial.'
              : ticket
                ? `Solicitud para la denuncia ${ticket}.`
                : 'Seleccione una denuncia primero.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Switch id="es-libre" checked={esLibre} onCheckedChange={setEsLibre} />
            <Label htmlFor="es-libre" className="text-sm cursor-pointer">
              ¿Unidad o persona externa no registrada?
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidad-destino" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Unidad destino
            </Label>
            {esLibre ? (
              <Input
                id="unidad-destino"
                placeholder="Nombre de la entidad o persona externa..."
                value={unidadLibre}
                onChange={(e) => setUnidadLibre(e.target.value)}
                maxLength={200}
              />
            ) : (
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
            )}
            {esLibre && unidadLibre.length > 0 && unidadLibre.trim().length < 5 && (
              <p className="text-[11px] text-destructive font-medium">Mínimo 5 caracteres</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plazo-dias" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Plazo (días)
            </Label>
            <Input
              id="plazo-dias"
              type="number"
              min={1}
              max={45}
              value={plazoDias}
              onChange={(e) => setPlazoDias(Math.min(45, Math.max(1, parseInt(e.target.value) || 1)))}
            />
            <p className="text-[11px] text-muted-foreground">
              Plazo legal referencial: 10 días. Ajuste según urgencia o complejidad (1-45 días).
            </p>
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
            {processing ? (isEdit ? 'Guardando...' : 'Creando...') : (
              isEdit ? <><Save className="w-4 h-4 mr-1.5" />Guardar cambios</> : <><Plus className="w-4 h-4 mr-1.5" />Crear solicitud</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
