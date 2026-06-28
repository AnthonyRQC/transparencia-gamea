import { FileSearch, Plus } from 'lucide-react';
import SolicitudCard from './SolicitudCard';
import ListaVacia from './ListaVacia';

interface SolicitudArchivo {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface Solicitud {
  id: number;
  ticket: string;
  unidad_destino: string;
  detalle: string;
  fecha_envio: string;
  fecha_vencimiento: string;
  estado: string;
  archivos?: SolicitudArchivo[];
}

interface TabSolicitudesProps {
  solicitudes: Solicitud[];
  canAct: boolean;
  ticket: string;
  onNuevaSolicitud?: (ticket: string) => void;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
}

export default function TabSolicitudes({ solicitudes, canAct, ticket, onNuevaSolicitud, onResponder, onAmpliar }: TabSolicitudesProps) {
  const sorted = [...solicitudes].sort((a, b) => {
    const aVencida = a.estado !== 'respondida' ? new Date(a.fecha_vencimiento).getTime() : Infinity;
    const bVencida = b.estado !== 'respondida' ? new Date(b.fecha_vencimiento).getTime() : Infinity;
    return aVencida - bVencida;
  });

  if (solicitudes.length === 0) {
    return (
      <div className="space-y-3">
        {canAct && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onNuevaSolicitud?.(ticket)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva solicitud
            </button>
          </div>
        )}
        <ListaVacia
          icon={FileSearch}
          titulo="Sin solicitudes de información"
          descripcion={canAct ? 'Cree una solicitud a una unidad externa para recabar documentación.' : 'El técnico no ha creado solicitudes aún.'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canAct && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onNuevaSolicitud?.(ticket)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva solicitud
          </button>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((s) => (
          <SolicitudCard
            key={s.id}
            solicitud={s}
            canAct={canAct}
            onResponder={onResponder}
            onAmpliar={onAmpliar}
          />
        ))}
      </div>
    </div>
  );
}
