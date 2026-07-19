import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { UserPlus, Save } from 'lucide-react';

interface DenunciadoItem {
  conoce_identidad: boolean;
  nombres?: string;
  dependencia?: string;
  descripcion?: string;
}

interface DescargoEditItem {
  id: number;
  ticket: string;
  nombres_denunciado: string;
  dependencia_denunciado?: string;
  estado: string;
}

interface ModalNuevoDescargoProps {
  ticket: string | null;
  denunciados: DenunciadoItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  descargoToEdit?: DescargoEditItem | null;
}

export default function ModalNuevoDescargo({ ticket, denunciados, open, onOpenChange, descargoToEdit }: ModalNuevoDescargoProps) {
  const isEdit = !!descargoToEdit;
  const [esExterno, setEsExterno] = useState(false);
  const [denunciadoIdx, setDenunciadoIdx] = useState('');
  const [nombreExterno, setNombreExterno] = useState('');
  const [dependenciaExterno, setDependenciaExterno] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      if (descargoToEdit) {
        const isFromDenunciados = denunciados.some(d =>
          d.conoce_identidad && d.nombres === descargoToEdit.nombres_denunciado
        );
        setEsExterno(!isFromDenunciados);
        if (isFromDenunciados) {
          const idx = denunciados.findIndex(d =>
            d.conoce_identidad && d.nombres === descargoToEdit.nombres_denunciado
          );
          setDenunciadoIdx(String(idx));
        } else {
          setNombreExterno(descargoToEdit.nombres_denunciado || '');
          setDependenciaExterno(descargoToEdit.dependencia_denunciado || '');
        }
      } else {
        setEsExterno(false);
        setDenunciadoIdx('');
        setNombreExterno('');
        setDependenciaExterno('');
      }
    }
  }, [open, descargoToEdit, denunciados]);

  const canSubmit = (isEdit ? descargoToEdit?.id : ticket) && (
    esExterno
      ? nombreExterno.trim().length >= 3
      : denunciadoIdx !== ''
  );

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);

    let nombres = '';
    let dependencia = '';
    let idx = -1;

    if (esExterno) {
      nombres = nombreExterno.trim();
      dependencia = dependenciaExterno.trim();
      idx = -1;
    } else {
      const denIdx = parseInt(denunciadoIdx, 10);
      const d = denunciados[denIdx];
      idx = denIdx;
      nombres = d.nombres || 'Anónimo';
      dependencia = d.dependencia || '';
    }

    if (isEdit && descargoToEdit) {
      router.post(
        route('denuncias.descargos.editar', { id: descargoToEdit.id }),
        { nombres: nombres.trim(), dependencia: dependencia.trim() },
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success(`Descargo actualizado correctamente`);
            onOpenChange(false);
          },
          onError: (errors) => {
            const keys = Object.keys(errors);
            toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al editar descargo');
          },
          onFinish: () => setProcessing(false),
        }
      );
    } else {
      router.post(
        route('denuncias.descargos.store', { ticket }),
        { denunciado_idx: idx, nombres, dependencia },
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success(`Descargo creado para ${nombres}`);
            onOpenChange(false);
          },
          onError: (errors) => {
            const keys = Object.keys(errors);
            toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al crear descargo');
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
          <DialogTitle>{isEdit ? 'Editar descargo' : 'Nuevo descargo'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifique los datos del denunciado. Los cambios quedarán registrados en el historial.'
              : 'Cree un registro de descargo para un denunciante. Luego podrá notificarlo y recibir su respuesta.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Switch id="es-externo" checked={esExterno} onCheckedChange={setEsExterno} />
            <Label htmlFor="es-externo" className="text-sm cursor-pointer">
              ¿Persona externa no registrada en la denuncia?
            </Label>
          </div>

          {esExterno ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="nombre-externo" className="after:content-['*'] after:text-destructive after:ml-0.5">
                  Nombre completo
                </Label>
                <Input
                  id="nombre-externo"
                  placeholder="Nombre del denunciante externo..."
                  value={nombreExterno}
                  onChange={(e) => setNombreExterno(e.target.value)}
                  maxLength={200}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dependencia-externo">Cargo / Dependencia (opcional)</Label>
                <Input
                  id="dependencia-externo"
                  placeholder="Ej: Funcionario de la Alcaldía de El Alto..."
                  value={dependenciaExterno}
                  onChange={(e) => setDependenciaExterno(e.target.value)}
                  maxLength={200}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="denunciado-select" className="after:content-['*'] after:text-destructive after:ml-0.5">
                Denunciado
              </Label>
              <Select value={denunciadoIdx} onValueChange={setDenunciadoIdx}>
                <SelectTrigger id="denunciado-select">
                  <SelectValue placeholder="Seleccionar denunciado..." />
                </SelectTrigger>
                <SelectContent>
                  {denunciados.map((d, i) => (
                    <SelectItem key={i} value={String(i)} disabled={!d.conoce_identidad && !d.nombres}>
                      {d.conoce_identidad ? `${d.nombres} — ${d.dependencia || 'Sin dependencia'}` : 'Anónimo / No se conoce identidad'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? (isEdit ? 'Guardando...' : 'Creando...') : (
              isEdit ? <><Save className="w-4 h-4 mr-1.5" />Guardar cambios</> : <><UserPlus className="w-4 h-4 mr-1.5" />Crear descargo</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
