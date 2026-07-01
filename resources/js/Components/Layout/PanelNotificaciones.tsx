import React from 'react';
import { router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Separator } from '@/Components/ui/separator';
import { Button } from '@/Components/ui/button';
import { route } from 'ziggy-js';
import ItemNotificacion from './ItemNotificacion';

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

interface PanelNotificacionesProps {
  notificaciones: Notificacion[];
  noLeidas?: number;
  onCerrar: () => void;
}

export default function PanelNotificaciones({ notificaciones, noLeidas = 0, onCerrar }: PanelNotificacionesProps) {
  const noLeidasItems = notificaciones.filter((n) => !n.leida);
  const leidasItems = notificaciones.filter((n) => n.leida);

  const handleMarcarLeida = (id: number) => {
    router.post(route('notificaciones.marcar-leida', { id }));
  };

  const handleNavegar = (url: string) => {
    onCerrar();
    router.get(url);
  };

  const handleMarcarTodas = () => {
    router.post(route('notificaciones.marcar-todas'));
  };

  const handleVerTodas = () => {
    onCerrar();
    router.get(route('notificaciones.index'));
  };

  return (
    <div className="w-[380px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-xl shadow-primary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-foreground" />
          <span className="text-sm font-semibold text-foreground">Notificaciones</span>
          {noLeidas > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
              {noLeidas}
            </span>
          )}
        </div>
        {noLeidas > 0 && (
          <button
            onClick={handleMarcarTodas}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todas
          </button>
        )}
      </div>

      {/* List */}
      {notificaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <Bell className="w-8 h-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No hay notificaciones</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Las novedades aparecerán aquí</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[460px]">
          {/* No leídas */}
          {noLeidasItems.map((n, i) => (
            <React.Fragment key={`no-leida-${n.id}`}>
              {i > 0 && <Separator className="bg-border/30" />}
              <ItemNotificacion
                notificacion={n}
                onMarcarLeida={handleMarcarLeida}
                onNavegar={handleNavegar}
              />
            </React.Fragment>
          ))}

          {/* Separador entre leídas y no leídas */}
          {noLeidasItems.length > 0 && leidasItems.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Separator className="flex-1 bg-border/30" />
                <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                  Leídas
                </span>
                <Separator className="flex-1 bg-border/30" />
              </div>
            </div>
          )}

          {/* Leídas */}
          {leidasItems.map((n, i) => (
            <React.Fragment key={`leida-${n.id}`}>
              {i > 0 && <Separator className="bg-border/30" />}
              <ItemNotificacion
                notificacion={n}
                onMarcarLeida={handleMarcarLeida}
                onNavegar={handleNavegar}
              />
            </React.Fragment>
          ))}
        </ScrollArea>
      )}

      {/* Footer — solo si hay suficientes */}
      {notificaciones.length > 5 && (
        <div className="border-t border-border/60 px-4 py-2.5">
          <button
            onClick={handleVerTodas}
            className="w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Ver todas las notificaciones &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
