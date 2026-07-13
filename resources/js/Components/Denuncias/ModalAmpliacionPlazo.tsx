import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';

interface AmpliacionItem {
  id: number;
  fecha: string;
  dias: number;
  justificacion: string;
  aprobado_por: string;
  solicitado_por: string | null;
}

interface DenunciaInfo {
  ticket: string;
  tipo: string;
  estado: string;
  created_at: string;
  ampliaciones?: AmpliacionItem[];
  plazo_reapertura?: string | null;
  plazo?: { dias_restantes: number; color: string; fecha_vencimiento?: string } | null;
}

interface TecnicoOption {
  id: string;
  nombre: string;
}

interface ModalAmpliacionPlazoProps {
  denuncia: DenunciaInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tecnicos?: Record<string, TecnicoOption>;
}

function formatDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function getPlazoBase(tipo: string): number {
  if (tipo === 'corrupcion') return 45;
  if (tipo === 'negacion') return 20;
  return 0;
}

function getMaxAmpliacion(tipo: string): number {
  if (tipo === 'corrupcion') return 45;
  if (tipo === 'negacion') return 10;
  return 0;
}

function getTotalAmpliaciones(ampliaciones: AmpliacionItem[] | undefined): number {
  return (ampliaciones || []).reduce((sum, a) => sum + a.dias, 0);
}

export default function ModalAmpliacionPlazo({ denuncia, open, onOpenChange, tecnicos }: ModalAmpliacionPlazoProps) {
  const [dias, setDias] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [huboSolicitud, setHuboSolicitud] = useState(false);
  const [solicitadoPor, setSolicitadoPor] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      setDias('');
      setJustificacion('');
      setHuboSolicitud(false);
      setSolicitadoPor('');
      setProcessing(false);
      setErrorMsg('');
    }
  }, [open]);

  if (!denuncia) return null;

  const plazoBase = getPlazoBase(denuncia.tipo);
  const maxAmpliacion = getMaxAmpliacion(denuncia.tipo);
  const sumaActual = getTotalAmpliaciones(denuncia.ampliaciones);
  const restante = maxAmpliacion - sumaActual;
  const numAmpliaciones = (denuncia.ampliaciones || []).length;
  const diasNum = parseInt(dias, 10) || 0;
  const exceed = diasNum > restante;
  const canSubmit = diasNum >= 1 && diasNum <= maxAmpliacion && justificacion.trim().length >= 10 && !exceed && !processing;

  const warningClass = exceed
    ? 'text-destructive border-destructive/50 bg-destructive/10'
    : restante <= 5
      ? 'text-amber-600 border-amber-300 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20'
      : 'text-muted-foreground';

  const handleSubmit = () => {
    if (!denuncia || !canSubmit) return;
    setProcessing(true);
    setErrorMsg('');

    router.post(
      route('denuncias.ampliar-plazo', { ticket: denuncia.ticket }),
      {
        dias: diasNum,
        justificacion: justificacion.trim(),
        ...(huboSolicitud && solicitadoPor ? { solicitado_por: solicitadoPor } : {}),
      } as any,
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Plazo ampliado ${diasNum} días para ${denuncia.ticket}`);
          onOpenChange(false);
        },
        onError: (errors) => {
          const msg = typeof errors === 'string' ? errors : Object.values(errors).join(', ');
          setErrorMsg(msg);
          toast.error(msg || 'Error al ampliar el plazo');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  const tecnicosList = tecnicos ? Object.values(tecnicos) : [];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ampliar plazo total</DialogTitle>
          <DialogDescription>
            {denuncia.tipo === 'corrupcion' ? 'Corrupción' : 'Negación de Información'}
            {' · '}
            {denuncia.ticket}
            {' · '}
            Ingresada: {formatDate(denuncia.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 px-4 py-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plazo base:</span>
              <span className="font-medium">{plazoBase} días</span>
            </div>
            {numAmpliaciones > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ampliaciones previas:</span>
                <span className="font-medium">{numAmpliaciones} (total: +{sumaActual}d)</span>
              </div>
            )}
            <Separator className="my-1.5" />
            <div className="flex justify-between font-semibold">
              <span>Plazo efectivo:</span>
              <span>{plazoBase + sumaActual} días</span>
            </div>
            {denuncia.plazo?.dias_restantes !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Días restantes:</span>
                <span className={cn(
                  denuncia.plazo.dias_restantes > 5 ? 'text-green-600' :
                  denuncia.plazo.dias_restantes >= 1 ? 'text-amber-600' : 'text-destructive'
                )}>
                  {denuncia.plazo.dias_restantes} días
                </span>
              </div>
            )}
            <Separator className="my-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Máximo legal ampliable:</span>
              <span className="font-medium">+{maxAmpliacion} días (total: {plazoBase + maxAmpliacion})</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dias-ampliar">Días a ampliar</Label>
            <Input
              id="dias-ampliar"
              type="number"
              min={1}
              max={45}
              placeholder="Ej: 15"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              disabled={processing}
            />
            {diasNum > 0 && (
              <p className={cn('text-xs px-2 py-1 rounded border', warningClass)}>
                {exceed
                  ? `Excede el máximo legal de ${maxAmpliacion} días adicionales (restan ${Math.max(0, restante)}).`
                  : restante > 0
                    ? `Puede ampliar hasta ${restante} días más (límite legal: ${maxAmpliacion}).`
                    : 'Límite legal alcanzado.'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificacion-ampliar">Justificación</Label>
            <Textarea
              id="justificacion-ampliar"
              placeholder="Describa el motivo de la ampliación..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={processing}
            />
            <p className="text-[11px] text-muted-foreground">
              {justificacion.length < 10
                ? `Mínimo 10 caracteres (${justificacion.length}/500)`
                : `${justificacion.length}/500 caracteres`}
            </p>
          </div>

          <Separator />

          <div className="flex items-start gap-2">
            <Checkbox
              id="hubo-solicitud"
              checked={huboSolicitud}
              onCheckedChange={(v) => setHuboSolicitud(v === true)}
              disabled={processing}
            />
            <div className="space-y-1">
              <Label htmlFor="hubo-solicitud" className="text-sm font-normal cursor-pointer">
                Hubo solicitud previa del técnico
              </Label>
              {huboSolicitud && (
                <div className="pt-2">
                  <Select value={solicitadoPor} onValueChange={setSolicitadoPor} disabled={processing}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar técnico..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tecnicosList.map((t) => (
                        <SelectItem key={t.id} value={t.nombre}>{t.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-destructive font-medium">{errorMsg}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {processing ? 'Ampliando...' : 'Aprobar ampliación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
