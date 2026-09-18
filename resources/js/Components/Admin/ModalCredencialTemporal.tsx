import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Copy, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export interface CredencialTemporal {
  username: string;
  password: string;
  nombre: string;
}

interface Props {
  credencial: CredencialTemporal | null;
  onClose: () => void;
}

/** Contraseña mostrada UNA sola vez, con botón copiar (crear y reset). */
export default function ModalCredencialTemporal({ credencial, onClose }: Props) {
  if (!credencial) return null;

  const copiar = (texto: string, que: string) => {
    navigator.clipboard.writeText(texto).then(
      () => toast.success(`${que} copiado.`),
      () => toast.error('No se pudo copiar.')
    );
  };

  return (
    <Dialog open={!!credencial} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Credencial temporal
          </DialogTitle>
          <DialogDescription>
            {credencial.nombre} — anótala ahora, no se volverá a mostrar.
            El usuario deberá cambiarla en su primer login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {[
            { label: 'Usuario', valor: credencial.username },
            { label: 'Contraseña', valor: credencial.password },
          ].map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{f.label}</p>
                <p className="font-mono font-bold">{f.valor}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copiar(f.valor, f.label)} className="gap-1.5 cursor-pointer">
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="cursor-pointer">Entendido, ya la anoté</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
