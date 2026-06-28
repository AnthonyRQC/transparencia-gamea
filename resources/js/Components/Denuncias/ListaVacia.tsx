import { type LucideIcon } from 'lucide-react';

interface ListaVaciaProps {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
}

export default function ListaVacia({ icon: Icon, titulo, descripcion }: ListaVaciaProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{titulo}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{descripcion}</p>
    </div>
  );
}
