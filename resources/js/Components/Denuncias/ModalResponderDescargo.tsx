import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { CircleCheck, Paperclip } from 'lucide-react';
import ArchivoAdjunto from './ArchivoAdjunto';

interface MockDocumento {
  nombre: string;
  tamano: string;
}

interface ModalResponderDescargoProps {
  descargoId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalResponderDescargo({ descargoId, open, onOpenChange }: ModalResponderDescargoProps) {
  const [resumen, setResumen] = useState('');
  const [documentos, setDocumentos] = useState<MockDocumento[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setResumen('');
      setDocumentos([]);
    }
  }, [open]);

  const canSubmit = resumen.trim().length >= 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const tamano = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setDocumentos((prev) => [...prev, { nombre: file.name, tamano }]);
    }
    e.target.value = '';
  };

  const removeDocumento = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!canSubmit || !descargoId) return;
    setProcessing(true);
    router.post(
      route('denuncias.descargos.responder', { id: descargoId }),
      {
        resumen_descargo: resumen,
        documentos: documentos.map((d) => ({ nombre: d.nombre, tamano: d.tamano })),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Descargo registrado correctamente');
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al registrar descargo');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar respuesta de descargo</DialogTitle>
          <DialogDescription>
            Registre el resumen del descargo presentado por el denunciado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="resumen-descargo" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Resumen del descargo
            </Label>
            <Textarea
              id="resumen-descargo"
              placeholder="Resuma los argumentos y pruebas presentados por el denunciado..."
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              rows={4}
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{resumen.length}/5000</p>
              {resumen.length > 0 && resumen.trim().length < 10 && (
                <p className="text-[11px] text-destructive font-medium">Mínimo 10 caracteres</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Documentos del descargo</Label>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted cursor-pointer transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
              Adjuntar documentos
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
            {documentos.length > 0 && (
              <div className="space-y-1 mt-2">
                {documentos.map((d, i) => (
                  <ArchivoAdjunto key={i} nombre={d.nombre} tamano={d.tamano} onEliminar={() => removeDocumento(i)} />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? 'Guardando...' : (
              <><CircleCheck className="w-4 h-4 mr-1.5" />Registrar descargo</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
