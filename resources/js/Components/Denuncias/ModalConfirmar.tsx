import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';

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
    return (
        <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                        </div>
                    </div>
                </DialogHeader>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {message}
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
