import { useState } from 'react';
import { FileSearch, Plus } from 'lucide-react';
import SolicitudCard from './SolicitudCard';
import SolicitudDetailModal from './SolicitudDetailModal';
import ListaVacia from './ListaVacia';

interface SolicitudArchivo {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface SolicitudAmpliacion {
  dias: number;
  justificacion: string;
  fecha: string;
  archivo?: unknown;
}

interface SolicitudEdicion {
  fecha: string;
  campo: string;
  anterior?: unknown;
  nuevo?: unknown;
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
  ampliaciones?: SolicitudAmpliacion[];
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
  plazo_dias?: number;
  fecha_respuesta?: string;
  respuesta?: string;
  motivo_cancelacion?: string;
  fecha_cancelacion?: string;
  ediciones?: SolicitudEdicion[];
}

interface TabSolicitudesProps {
  solicitudes: Solicitud[];
  canAct: boolean;
  ticket: string;
  onNuevaSolicitud?: (ticket: string) => void;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
  onCancelar?: (id: number) => void;
  onEditar?: (id: number) => void;
  onEliminar?: (id: number) => void;
}

export default function TabSolicitudes({ solicitudes, canAct, ticket, onNuevaSolicitud, onResponder, onAmpliar, onCancelar, onEditar, onEliminar }: TabSolicitudesProps) {
  const [detailSolicitudId, setDetailSolicitudId] = useState<number | null>(null);

  const pendientes = solicitudes.filter(s => !['respondida', 'cancelada'].includes(s.estado));
  const completadas = solicitudes.filter(s => ['respondida', 'cancelada'].includes(s.estado));
  const sorted = [
    ...pendientes.sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()),
    ...completadas.sort((a, b) => new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime()),
  ];

  const detailSolicitud = detailSolicitudId ? solicitudes.find(s => s.id === detailSolicitudId) || null : null;

  const handleClick = (s: Solicitud) => {
    setDetailSolicitudId(s.id);
  };

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
        {detailSolicitud && (
          <SolicitudDetailModal
            solicitud={detailSolicitud}
            open={detailSolicitudId !== null}
            onOpenChange={(v) => { if (!v) setDetailSolicitudId(null); }}
            canAct={canAct}
            onResponder={onResponder}
            onAmpliar={onAmpliar}
            onCancelar={onCancelar}
            onEditar={(id) => { setDetailSolicitudId(null); onEditar?.(id); }}
            onEliminar={(id) => { setDetailSolicitudId(null); onEliminar?.(id); }}
          />
        )}
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
            onClick={handleClick}
            onResponder={onResponder}
            onAmpliar={onAmpliar}
            onCancelar={onCancelar}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ))}
      </div>

      {detailSolicitud && (
        <SolicitudDetailModal
          solicitud={detailSolicitud}
          open={detailSolicitudId !== null}
          onOpenChange={(v) => { if (!v) setDetailSolicitudId(null); }}
          canAct={canAct}
          onResponder={onResponder}
          onAmpliar={onAmpliar}
          onCancelar={onCancelar}
          onEditar={(id) => { setDetailSolicitudId(null); onEditar?.(id); }}
          onEliminar={(id) => { setDetailSolicitudId(null); onEliminar?.(id); }}
        />
      )}
    </div>
  );
}
