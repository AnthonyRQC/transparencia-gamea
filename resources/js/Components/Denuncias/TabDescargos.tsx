import { useState } from 'react';
import { UserX, Bell, Plus } from 'lucide-react';
import DescargoCard from './DescargoCard';
import DescargoDetailModal from './DescargoDetailModal';
import ListaVacia from './ListaVacia';

interface DescargoDocumento {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface DescargoAmpliacion {
  dias: number;
  justificacion: string;
  fecha: string;
}

interface DescargoEdicion {
  fecha: string;
  campo: string;
  anterior?: unknown;
  nuevo?: unknown;
}

interface Descargo {
  id: number;
  ticket: string;
  denunciado_idx: number;
  nombres_denunciado: string;
  dependencia_denunciado?: string;
  fecha_notificacion?: string | null;
  medio?: string | null;
  respaldo_archivo?: { nombre: string; tamano?: string } | null;
  fecha_vencimiento?: string | null;
  fecha_respuesta?: string | null;
  resumen_descargo?: string | null;
  documentos?: DescargoDocumento[];
  estado: string;
  ampliaciones?: DescargoAmpliacion[];
  plazo_info?: { dias_restantes: number; color: string; texto: string; fecha_vencimiento: string };
  ediciones?: DescargoEdicion[];
}

interface DenunciadoItem {
  conoce_identidad: boolean;
  nombres?: string;
  dependencia?: string;
  descripcion?: string;
}

interface TabDescargosProps {
  descargos: Descargo[];
  canAct: boolean;
  ticket: string;
  denunciados?: DenunciadoItem[];
  onNotificar?: (id: number) => void;
  onResponder?: (id: number) => void;
  onAmpliar?: (id: number) => void;
  onNuevoDescargo?: (ticket: string) => void;
  onEditar?: (id: number) => void;
  onEliminar?: (id: number) => void;
  onCancelar?: (id: number) => void;
}

export default function TabDescargos({ descargos, canAct, ticket, denunciados = [], onNotificar, onResponder, onAmpliar, onNuevoDescargo, onEditar, onEliminar, onCancelar }: TabDescargosProps) {
  const [detailDescargoId, setDetailDescargoId] = useState<number | null>(null);

  const sorted = [...descargos].sort((a, b) => {
    const aVen = a.fecha_vencimiento && a.estado !== 'respondido' ? new Date(a.fecha_vencimiento).getTime() : Infinity;
    const bVen = b.fecha_vencimiento && b.estado !== 'respondido' ? new Date(b.fecha_vencimiento).getTime() : Infinity;
    return aVen - bVen;
  });

  const pendientesNotificar = descargos.filter((d) => d.estado === 'pendiente_notif');
  const detailDescargo = detailDescargoId ? descargos.find(d => d.id === detailDescargoId) || null : null;

  const handleClick = (d: Descargo) => {
    setDetailDescargoId(d.id);
  };

  if (descargos.length === 0) {
    return (
      <div className="space-y-3">
        {canAct && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onNuevoDescargo?.(ticket)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir descargo
            </button>
          </div>
        )}
        <ListaVacia
          icon={UserX}
          titulo="Sin descargos registrados"
          descripcion={canAct ? 'Añada un descargo para iniciar el proceso de notificación al denunciado.' : 'No hay descargos registrados para esta denuncia.'}
        />
        {detailDescargo && (
          <DescargoDetailModal
            descargo={detailDescargo}
            open={detailDescargoId !== null}
            onOpenChange={(v) => { if (!v) setDetailDescargoId(null); }}
            canAct={canAct}
            onNotificar={onNotificar}
            onResponder={onResponder}
            onAmpliar={onAmpliar}
            onCancelar={onCancelar}
            onEditar={(id) => { setDetailDescargoId(null); onEditar?.(id); }}
            onEliminar={(id) => { setDetailDescargoId(null); onEliminar?.(id); }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        {canAct && (
          <>
            {pendientesNotificar.length > 0 && (
              <button
                type="button"
                onClick={() => onNotificar?.(pendientesNotificar[0].id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300"
              >
                <Bell className="w-3.5 h-3.5" />
                Notificar pendientes ({pendientesNotificar.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => onNuevoDescargo?.(ticket)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir descargo
            </button>
          </>
        )}
      </div>

      <div className="space-y-2">
        {sorted.map((d) => (
          <DescargoCard
            key={d.id}
            descargo={d}
            canAct={canAct}
            onClick={handleClick}
            onNotificar={onNotificar}
            onResponder={onResponder}
            onAmpliar={onAmpliar}
            onCancelar={onCancelar}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ))}
      </div>

      {detailDescargo && (
        <DescargoDetailModal
          descargo={detailDescargo}
          open={detailDescargoId !== null}
          onOpenChange={(v) => { if (!v) setDetailDescargoId(null); }}
          canAct={canAct}
          onNotificar={onNotificar}
          onResponder={onResponder}
          onAmpliar={onAmpliar}
          onCancelar={onCancelar}
          onEditar={(id) => { setDetailDescargoId(null); onEditar?.(id); }}
          onEliminar={(id) => { setDetailDescargoId(null); onEliminar?.(id); }}
        />
      )}
    </div>
  );
}
