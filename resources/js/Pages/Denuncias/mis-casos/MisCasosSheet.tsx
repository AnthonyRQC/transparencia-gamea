import { Play } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import DenunciaSheet from '@/Components/Denuncias/Sheet/DenunciaSheet';
import SaltarFaseButton from '@/Components/Denuncias/Modales/Flujo/SaltarFaseButton';
import { countPendientes } from './helpers';
import type { Denuncia, Solicitud, Descargo } from './tipos';

interface MisCasosSheetProps {
  denuncia: Denuncia;
  investigadores: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  solicitudesByTicket: Record<string, Solicitud[]>;
  descargosByTicket: Record<string, Descargo[]>;
  evaluacionesByTicket: Record<string, any[]>;
  avisosPorTicket: Record<string, string[]>;
  canAct: boolean;
  processingTicket: string | null;
  onIniciar: (ticket: string) => void;
  onClose: () => void;
  onAbrirArchivos: (ticket: string) => void;
  onNuevaSolicitud: (ticket: string) => void;
  onResponderSolicitud: (id: number) => void;
  onAmpliarSolicitud: (id: number) => void;
  onCancelarSolicitud: (id: number) => void;
  onNuevoDescargo: (ticket: string) => void;
  onNotificarDescargo: (id: number) => void;
  onResponderDescargo: (id: number) => void;
  onAmpliarDescargo: (id: number) => void;
  onCancelarDescargo: (id: number) => void;
  onEditarSolicitud: (solicitud: Solicitud | null) => void;
  onEliminarSolicitud: (item: { id: number; nombre: string } | null) => void;
  onEditarDescargo: (descargo: Descargo | null) => void;
  onEliminarDescargo: (item: { id: number; nombre: string } | null) => void;
}

export default function MisCasosSheet({ denuncia, investigadores, solicitudesByTicket, descargosByTicket, evaluacionesByTicket, avisosPorTicket, canAct, processingTicket, onIniciar, onClose, onAbrirArchivos, onNuevaSolicitud, onResponderSolicitud, onAmpliarSolicitud, onCancelarSolicitud, onNuevoDescargo, onNotificarDescargo, onResponderDescargo, onAmpliarDescargo, onCancelarDescargo, onEditarSolicitud, onEliminarSolicitud, onEditarDescargo, onEliminarDescargo }: MisCasosSheetProps) {
  return (
    <DenunciaSheet
      denuncia={denuncia}
      plazo={denuncia.plazo}
      investigadores={investigadores}
      open={denuncia !== null}
      onOpenChange={(v) => { if (!v) onClose(); }}
      investigadorNombre={denuncia && typeof denuncia.investigador === 'object' ? (denuncia.investigador as any)?.name : (denuncia?.investigador || '—')}
      solicitudes={solicitudesByTicket[denuncia.ticket] || []}
      descargos={descargosByTicket[denuncia.ticket] || []}
      evaluaciones={evaluacionesByTicket?.[denuncia.ticket] || []}
      avisosPorTicket={avisosPorTicket}
      canAct={canAct}
      onAbrirArchivos={(t) => { onAbrirArchivos(t); }}
      onNuevaSolicitud={(t) => { onNuevaSolicitud(t); }}
      onResponderSolicitud={(id) => { onResponderSolicitud(id); }}
      onAmpliarSolicitud={(id) => { onAmpliarSolicitud(id); }}
      onCancelarSolicitud={(id) => { onCancelarSolicitud(id); }}
      onNuevoDescargo={(t) => { onNuevoDescargo(t); }}
      onNotificarDescargo={(id) => { onNotificarDescargo(id); }}
      onResponderDescargo={(id) => { onResponderDescargo(id); }}
      onAmpliarDescargo={(id) => { onAmpliarDescargo(id); }}
      onCancelarDescargo={(id) => { onCancelarDescargo(id); }}
      onEditarSolicitud={(id) => {
        const sol = solicitudesByTicket[denuncia.ticket]?.find(s => s.id === id) || null;
        onEditarSolicitud(sol);
      }}
      onEliminarSolicitud={(id) => {
        const sol = solicitudesByTicket[denuncia.ticket]?.find(s => s.id === id);
         if (sol) onEliminarSolicitud({ id: sol.id, nombre: sol.dependencia_destino });
      }}
      onEditarDescargo={(id) => {
        const desc = descargosByTicket[denuncia.ticket]?.find(d => d.id === id) || null;
        onEditarDescargo(desc);
      }}
      onEliminarDescargo={(id) => {
        const desc = descargosByTicket[denuncia.ticket]?.find(d => d.id === id);
        if (desc) onEliminarDescargo({ id: desc.id, nombre: desc.nombres_denunciado });
      }}
    >
      {/* Sección: Acciones del Caso */}
      {(denuncia.estado === 'asignada' || denuncia.estado === 'investigacion') && (
        <div className="w-full space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>⚡ Acciones del Caso</span>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground/70 hover:text-foreground">ℹ️</span>
                </TooltipTrigger>
                <TooltipContent side="top">Inicia la investigación o traslada la denuncia a Informe Final.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {denuncia.estado === 'asignada' && (
              <button
                type="button"
                onClick={() => onIniciar(denuncia.ticket)}
                disabled={processingTicket === denuncia.ticket}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {processingTicket === denuncia.ticket ? 'Iniciando...' : 'Iniciar investigación'}
              </button>
            )}
            {denuncia.estado === 'investigacion' && (
              <SaltarFaseButton
                ticket={denuncia.ticket}
                solicitudesPendientes={countPendientes(denuncia, solicitudesByTicket, descargosByTicket).solicitudes}
                descargosPendientes={countPendientes(denuncia, solicitudesByTicket, descargosByTicket).descargos}
              />
            )}
          </div>
        </div>
      )}
    </DenunciaSheet>
  );
}
