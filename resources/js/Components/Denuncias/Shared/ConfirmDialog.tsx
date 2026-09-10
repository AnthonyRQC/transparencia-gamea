import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';

export interface ConfirmDialogDependencia {
  tipo: string;
  cantidad: number;
  detalle?: string;
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /** confirm = genérico con textos propios · delete = eliminar con auditoría · deactivate = catálogos con dependencias */
  variant?: 'confirm' | 'delete' | 'deactivate';
  titulo?: string;
  descripcion?: string;
  itemNombre?: string;
  dependencias?: ConfirmDialogDependencia[];
  /** Solo deactivate: cambia copy y verbo del botón. */
  mode?: 'desactivar' | 'eliminar';
  /** Solo confirm. */
  confirmText?: string;
  /** Solo confirm. */
  cancelText?: string;
  processing?: boolean;
}

/**
 * Diálogo de confirmación único (Sprint 12.5 R1.5).
 * Absorbe ModalConfirmar, ModalConfirmarEliminar y ModalConfirmarDesactivar
 * (mismo esqueleto, distinta severidad; copies verbatim por variante).
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  variant = 'delete',
  titulo = '¿Está seguro de cancelar?',
  descripcion = 'Se perderán todos los datos ingresados en el formulario.',
  itemNombre = '',
  dependencias = [],
  mode = 'desactivar',
  confirmText = 'Cancelar Denuncia',
  cancelText = 'Continuar Llenando',
  processing = false,
}: ConfirmDialogProps) {
  const esEliminar = mode === 'eliminar';
  const accionLabel =
    variant === 'confirm'
      ? confirmText
      : variant === 'delete'
        ? (processing ? 'Eliminando...' : 'Eliminar')
        : (processing ? (esEliminar ? 'Eliminando...' : 'Desactivando...') : (esEliminar ? 'Eliminar' : 'Desactivar'));

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        {variant === 'deactivate' ? (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {titulo}
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                ¿Está seguro de {esEliminar ? 'eliminar' : 'desactivar'} <strong>{itemNombre}</strong>?
              </p>
              {esEliminar ? (
                <p className="text-xs text-muted-foreground">
                  Esta acción eliminará el elemento permanentemente y no se podrá recuperar.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Las referencias existentes a este elemento se mantienen.
                  Solo desaparecerá de los formularios de nuevos registros.
                </p>
              )}
              {dependencias.length > 0 && (
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
            </DialogDescription>
          </DialogHeader>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <DialogTitle>{titulo}</DialogTitle>
                  {variant === 'delete' && <DialogDescription>{descripcion}</DialogDescription>}
                </div>
              </div>
            </DialogHeader>
            {variant === 'confirm' ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {descripcion}
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Se eliminará: <span className="font-semibold text-foreground">{itemNombre}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  El registro quedará oculto pero se conservará para auditoría interna.
                </p>
              </>
            )}
          </>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={processing}
            onClick={() => onOpenChange(false)}
          >
            {variant === 'confirm' ? cancelText : 'Cancelar'}
          </Button>
          <Button
            variant="destructive"
            disabled={processing}
            onClick={() => { onConfirm(); if (variant === 'confirm') onOpenChange(false); }}
          >
            {accionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
