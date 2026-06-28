import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';

interface ModalConfirmarEliminarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  titulo: string;
  descripcion: string;
  itemNombre: string;
  processing?: boolean;
}

export default function ModalConfirmarEliminar({
  open, onOpenChange, onConfirm, titulo, descripcion, itemNombre, processing = false,
}: ModalConfirmarEliminarProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>{titulo}</DialogTitle>
              <DialogDescription>{descripcion}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Se eliminará: <span className="font-semibold text-foreground">{itemNombre}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          El registro quedará oculto pero se conservará para auditoría interna.
        </p>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" disabled={processing} onClick={onConfirm}>
            {processing ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
