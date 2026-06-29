import { AlertCircle, RefreshCw } from 'lucide-react';

interface EstadoNoEncontradoProps {
  onReintentar: () => void;
}

export default function EstadoNoEncontrado({ onReintentar }: EstadoNoEncontradoProps) {
  return (
    <div className="text-center py-8 space-y-4 animate-fade-in">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-sm text-foreground">Denuncia no encontrada</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          No se encontró ninguna denuncia con el ticket y código de seguridad ingresados.
          Verifica que los datos sean correctos.
        </p>
      </div>
      <button
        onClick={onReintentar}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Volver a buscar
      </button>
    </div>
  );
}
