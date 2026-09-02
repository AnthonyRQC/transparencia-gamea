import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

interface ModalConsultarCodigoProps {
  ticket: string;
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalConsultarCodigo({ ticket, token, open, onOpenChange }: ModalConsultarCodigoProps) {
  const [copied, setCopied] = useState(false);

  const fullCode = `${ticket}-${token}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullCode);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (e) {
      console.warn('Clipboard fallback failed:', e);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Consultar código</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide text-center">
            Código completo para consulta
          </p>

          <div className="flex items-center gap-2">
            <Input value={fullCode} readOnly className="font-mono font-bold text-center text-lg tracking-wider flex-1" />
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
            Esta consulta no se registra en bitácora. El Registrador es responsable de la información que consulta.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
