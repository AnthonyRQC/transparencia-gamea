import { X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalExitoProps {
    ticket: string;
    onClose: () => void;
}

export default function ModalExito({ ticket, onClose }: ModalExitoProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-foreground">Denuncia registrada</h3>
                        <p className="text-sm text-muted-foreground">
                            Su denuncia ha sido recibida exitosamente.
                        </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-5 py-4 border border-border/60">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                            N° de Denuncia
                        </p>
                        <p className="text-2xl font-bold text-primary tracking-wider font-mono">
                            {ticket}
                        </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Guarde este número para dar seguimiento a su denuncia.
                        Puede consultar el estado ingresando el código en la página de seguimiento.
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
