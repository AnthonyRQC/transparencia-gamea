import React from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowRightLeft, CalendarPlus, CheckCircle, XCircle,
  Clock, AlertTriangle, FileText, MailQuestion, MessageSquareWarning,
  RotateCcw,
} from 'lucide-react';

const SIMULACIONES = [
  { tipo: 'traspaso', label: 'Jefe traspasó caso a otro técnico', icon: ArrowRightLeft, color: 'text-blue-500' },
  { tipo: 'ampliacion', label: 'Jefe amplió plazo +10 días', icon: CalendarPlus, color: 'text-green-500' },
  { tipo: 'denuncia_admitida', label: 'Denuncia admitida', icon: CheckCircle, color: 'text-green-500' },
  { tipo: 'denuncia_rechazada', label: 'Denuncia rechazada', icon: XCircle, color: 'text-red-500' },
  { tipo: 'plazo_por_vencer', label: 'Plazo por vencer (≤3d)', icon: Clock, color: 'text-amber-500' },
  { tipo: 'plazo_vencido', label: 'Plazo vencido', icon: AlertTriangle, color: 'text-red-500' },
  { tipo: 'plazo_informe', label: 'Informe por vencer', icon: FileText, color: 'text-amber-500' },
  { tipo: 'solicitud_vence', label: 'Solicitud vence pronto', icon: MailQuestion, color: 'text-amber-500' },
  { tipo: 'descargo_vence', label: 'Descargo vence pronto', icon: MessageSquareWarning, color: 'text-amber-500' },
];

export default function PanelDemo() {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSimular = (tipo: string) => {
    setLoading(tipo);
    router.post(route('notificaciones.demo.simular'), { tipo }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Notificación simulada: ${tipo}`);
        setLoading(null);
      },
      onError: () => {
        toast.error('Error al simular notificación');
        setLoading(null);
      },
    });
  };

  const handleReset = () => {
    setLoading('reset');
    router.post(route('notificaciones.demo.reset'), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Datos restaurados al seed inicial');
        setLoading(null);
      },
      onError: () => {
        toast.error('Error al resetear');
        setLoading(null);
      },
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Simulación de eventos
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={loading === 'reset'}
          className="flex items-center gap-1.5 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Resetear datos
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Cada botón genera un evento real en el sistema. Los cambios son persistentes hasta que presiones "Resetear datos".
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {SIMULACIONES.map((s) => {
          const Icon = s.icon;
          const isLoading = loading === s.tipo;
          return (
            <button
              key={s.tipo}
              onClick={() => handleSimular(s.tipo)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 hover:bg-muted transition-colors text-left text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className={`w-4 h-4 shrink-0 ${s.color} ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-foreground font-medium truncate">{s.label}</span>
            </button>
          );
        })}
      </div>

      <Separator className="my-3" />

      <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
        <strong>Nota:</strong> Las simulaciones modifican datos reales del sistema (fechas, estados, ampliaciones).
        Usa "Resetear datos" para volver al estado inicial del seed. Si cambias de página, los cambios persisten en tu sesión.
      </p>
    </div>
  );
}
