import { AlertTriangle } from 'lucide-react';

interface ModalConfirmarProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ModalConfirmar({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Está seguro de cancelar?',
    message = 'Se perderán todos los datos ingresados en el formulario.',
    confirmText = 'Cancelar Denuncia',
    cancelText = 'Continuar Llenando',
}: ModalConfirmarProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200" 
            role="dialog" 
            aria-modal="true" 
            onClick={onClose}
        >
            <div
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-6 pb-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted text-foreground transition-all duration-200 cursor-pointer text-center"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm text-center"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
