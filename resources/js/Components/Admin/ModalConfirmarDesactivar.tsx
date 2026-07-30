import { AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';

interface Dependencia {
    tipo: string;
    cantidad: number;
    detalle?: string;
}

interface ModalConfirmarDesactivarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    titulo: string;
    nombreItem: string;
    dependencias?: Dependencia[];
    processing?: boolean;
}

export default function ModalConfirmarDesactivar({
    open,
    onOpenChange,
    onConfirm,
    titulo,
    nombreItem,
    dependencias = [],
    processing = false,
}: ModalConfirmarDesactivarProps) {
    const tieneDependencias = dependencias.length > 0;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        {titulo}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <p>
                            ¿Está seguro de desactivar <strong>{nombreItem}</strong>?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Las referencias existentes a este elemento se mantienen. 
                            Solo desaparecerá de los formularios de nuevos registros.
                        </p>
                        {tieneDependencias && (
                            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                                <p className="text-xs font-semibold text-foreground">
                                    Este elemento está siendo usado en:
                                </p>
                                {dependencias.map((dep, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">{dep.tipo}</span>
                                        <span className="font-medium">{dep.cantidad}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={processing}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {processing ? 'Desactivando...' : 'Desactivar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
