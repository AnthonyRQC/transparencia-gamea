import { type LucideIcon } from 'lucide-react';

interface ListaVaciaProps {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
  accionLabel?: string;
  onAccion?: () => void;
}

export default function ListaVacia({ icon: Icon, titulo, descripcion, accionLabel, onAccion }: ListaVaciaProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/70 flex items-center justify-center mb-3 shadow-2xs">
        <Icon className="w-7 h-7 text-muted-foreground/80" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1 tracking-tight">{titulo}</h3>
      <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">{descripcion}</p>
      {accionLabel && onAccion && (
        <button
          type="button"
          onClick={onAccion}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border shadow-2xs transition-colors cursor-pointer"
        >
          {accionLabel}
        </button>
      )}
    </div>
  );
}
