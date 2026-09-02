import { useState } from 'react';
import { CheckCircle, Copy, Check } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

interface ModalExitoProps {
    ticket: string;
    token?: string;
    onClose: () => void;
}

export default function ModalExito({ ticket, token, onClose }: ModalExitoProps) {
    const [copied, setCopied] = useState(false);

    const fullCode = token ? `${ticket}-${token}` : ticket;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="modal-exito-title" onClick={onClose}>
            <div
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 id="modal-exito-title" className="text-xl font-bold text-foreground">Denuncia registrada</h3>
                        <p className="text-sm text-muted-foreground">
                            Su denuncia ha sido recibida exitosamente.
                        </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-5 py-4 border border-border/60 space-y-2 text-left">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide text-center">
                            Código para seguimiento
                        </p>
                        <div className="flex items-center gap-2">
                            <Input value={fullCode} readOnly className="font-mono font-bold text-center text-lg tracking-wider flex-1" />
                            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Guarde este código para dar seguimiento a su denuncia.
                        Puede ingresarlo en la página de seguimiento para consultar el estado.
                    </p>
                </div>
                <div className="flex justify-center px-8 pb-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm"
                    >
                        Finalizar
                    </button>
                </div>
            </div>
        </div>
    );
}
