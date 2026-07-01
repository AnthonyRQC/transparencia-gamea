import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import PanelNotificaciones from './PanelNotificaciones';

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  ticket: string | null;
  destino_url: string;
  leida: boolean;
  fecha_leida: string | null;
  fecha: string;
  icono: string;
  color: string;
}

interface CampanaNotificacionesProps {
  noLeidas: number;
  recientes: Notificacion[];
}

export default function CampanaNotificaciones({ noLeidas, recientes }: CampanaNotificacionesProps) {
  const prevCountRef = React.useRef(noLeidas);
  const [pulse, setPulse] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (noLeidas > prevCountRef.current) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      prevCountRef.current = noLeidas;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = noLeidas;
  }, [noLeidas]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-sidebar-muted transition-colors cursor-pointer text-sidebar-foreground/60 hover:text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring/40"
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {noLeidas > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground shadow-sm',
                pulse && 'animate-pulse',
              )}
            >
              {noLeidas > 99 ? '99+' : noLeidas}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-auto p-0 bg-transparent border-none shadow-none"
      >
        <PanelNotificaciones
          notificaciones={recientes}
          noLeidas={noLeidas}
          onCerrar={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
