import { UserX, Bell } from 'lucide-react';
import DescargoCard from './DescargoCard';
import ListaVacia from './ListaVacia';

interface DescargoDocumento {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface Descargo {
  id: number;
  ticket: string;
  denunciado_idx: number;
  nombres_denunciado: string;
  dependencia_denunciado?: string;
  fecha_notificacion?: string | null;
  medio?: string | null;
  fecha_vencimiento?: string | null;
  estado: string;
  resumen_descargo?: string | null;
  documentos?: DescargoDocumento[];
}

interface TabDescargosProps {
  descargos: Descargo[];
  canAct: boolean;
  ticket: string;
  onNotificar?: (id: number) => void;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
}

export default function TabDescargos({ descargos, canAct, ticket, onNotificar, onResponder, onAmpliar }: TabDescargosProps) {
  const sorted = [...descargos].sort((a, b) => {
    const aVen = a.fecha_vencimiento && a.estado !== 'respondido' ? new Date(a.fecha_vencimiento).getTime() : Infinity;
    const bVen = b.fecha_vencimiento && b.estado !== 'respondido' ? new Date(b.fecha_vencimiento).getTime() : Infinity;
    return aVen - bVen;
  });

  const pendientesNotificar = descargos.filter((d) => d.estado === 'pendiente_notif');

  if (descargos.length === 0) {
    return (
      <div className="space-y-3">
        {canAct && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                /* El técnico puede añadir descargos manualmente o el sistema los crea automáticos */
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <UserX className="w-3.5 h-3.5" />
              Añadir descargo
            </button>
          </div>
        )}
        <ListaVacia
          icon={UserX}
          titulo="Sin descargos registrados"
          descripcion={canAct ? 'Los descargos se crean automáticamente al admitir una denuncia con denunciados identificados.' : 'No hay descargos registrados para esta denuncia.'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canAct && pendientesNotificar.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onNotificar?.(pendientesNotificar[0].id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300"
          >
            <Bell className="w-3.5 h-3.5" />
            Notificar pendientes ({pendientesNotificar.length})
          </button>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((d) => (
          <DescargoCard
            key={d.id}
            descargo={d}
            canAct={canAct}
            onNotificar={onNotificar}
            onResponder={onResponder}
            onAmpliar={onAmpliar}
          />
        ))}
      </div>
    </div>
  );
}
