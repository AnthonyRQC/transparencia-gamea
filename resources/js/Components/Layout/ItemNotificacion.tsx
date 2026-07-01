import React from 'react';
import { cn } from '@/lib/utils';
import {
  Bell, Clock, CheckCircle, XCircle, ArrowRightLeft,
  CalendarPlus, AlertTriangle, FileText, MailQuestion, MessageSquareWarning,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Bell: <Bell className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  CheckCircle: <CheckCircle className="w-4 h-4" />,
  XCircle: <XCircle className="w-4 h-4" />,
  ArrowRightLeft: <ArrowRightLeft className="w-4 h-4" />,
  CalendarPlus: <CalendarPlus className="w-4 h-4" />,
  AlertTriangle: <AlertTriangle className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  MailQuestion: <MailQuestion className="w-4 h-4" />,
  MessageSquareWarning: <MessageSquareWarning className="w-4 h-4" />,
};

const COLOR_MAP: Record<string, string> = {
  primary: 'text-primary',
  warning: 'text-amber-500',
  destructive: 'text-red-500',
  success: 'text-green-500',
  info: 'text-blue-500',
};

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

interface ItemNotificacionProps {
  notificacion: Notificacion;
  onMarcarLeida: (id: number) => void;
  onNavegar: (url: string) => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHr < 24) return `hace ${diffHr} h`;
  if (diffDay < 7) return `hace ${diffDay} día(s)`;
  return date.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ItemNotificacion({ notificacion, onMarcarLeida, onNavegar }: ItemNotificacionProps) {
  const icon = ICON_MAP[notificacion.icono] || <Bell className="w-4 h-4" />;
  const colorClass = COLOR_MAP[notificacion.color] || 'text-primary';

  const handleClick = () => {
    if (!notificacion.leida) {
      onMarcarLeida(notificacion.id);
    }
    onNavegar(notificacion.destino_url);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left px-4 py-3 transition-colors duration-150 border-l-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30',
        notificacion.leida
          ? 'border-l-transparent hover:bg-muted/30 opacity-60'
          : 'border-l-primary bg-muted/20 hover:bg-muted/40',
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn('shrink-0 mt-0.5', colorClass)}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm leading-tight', notificacion.leida ? 'font-medium' : 'font-semibold')}>
            {notificacion.titulo}
          </p>
          <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-2">
            {notificacion.mensaje}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            {timeAgo(notificacion.fecha)}
          </p>
        </div>
        {!notificacion.leida && (
          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
        )}
      </div>
    </button>
  );
}
