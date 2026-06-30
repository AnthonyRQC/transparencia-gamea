import { cn } from '@/lib/utils';
import PlazoBadge from './PlazoBadge';
import TipoDenunciaBadge from './TipoDenunciaBadge';
import SubestadoBadge from './SubestadoBadge';
import ClasificacionBadge from './ClasificacionBadge';
import { User, Clock } from 'lucide-react';
import { ArrowRightLeft } from 'lucide-react';

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
  fecha_vencimiento?: string;
}

interface TecnicoData {
  id: string;
  nombre: string;
  iniciales: string;
  color: string;
}

interface AmpliacionItem {
  id: number;
  dias: number;
}

interface DenunciaData {
  ticket: string;
  tipo: string;
  escenario?: string;
  denunciante?: { nombres?: string; ci?: string };
  detalles?: { categoria?: string; categoria_otro?: string };
  created_at: string;
  estado: string;
  subestado?: string | null;
  tecnico?: string | null;
  fecha_traspaso?: string | null;
  fecha_admitida?: string | null;
  fecha_asignada?: string | null;
  fecha_rechazada?: string | null;
  fecha_reapertura?: string | null;
  plazo_reapertura?: string | null;
  ampliaciones?: AmpliacionItem[];
  // Sprint 5
  informe_clasificacion?: string | null;
  cierre_sitpreco?: string | null;
  cierre_cerrado_at?: string | null;
}

interface DenunciaCardProps {
  denuncia: DenunciaData;
  plazo: PlazoInfo | null;
  tecnicos?: Record<string, TecnicoData>;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  isNew?: boolean;
}

const plazoDotColor: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

const escenarioLabel: Record<string, string> = {
  revelada: 'Identidad Revelada',
  reservada: 'Identidad Reservada',
  anonimo: 'Anónimo',
};

function daysAgo(dateStr?: string | null): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function fmt(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = daysAgo(dateStr);
  if (d === 0) return 'hoy';
  if (d === 1) return 'ayer';
  return `hace ${d}d`;
}

function fmtDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
}

function getContextualText(denuncia: DenunciaData): string {
  switch (denuncia.estado) {
    case 'ingresada':
      return `Ingresada ${fmt(denuncia.created_at)}`;
    case 'admitida':
      return `Admitida ${fmt(denuncia.fecha_admitida || denuncia.created_at)}`;
    case 'asignada':
      return `Asignada ${fmt(denuncia.fecha_asignada || denuncia.created_at)}`;
    case 'investigacion':
      return `En investigación ${fmt(denuncia.fecha_asignada || denuncia.created_at)}`;
    case 'informe':
      return `En informe final ${fmt(denuncia.fecha_asignada || denuncia.created_at)}`;
    case 'rechazada':
      return `Rechazada ${fmt(denuncia.fecha_rechazada || denuncia.created_at)}`;
    case 'cerrada':
      return denuncia.subestado === 'archivada'
        ? `Archivada ${fmt(denuncia.cierre_cerrado_at || denuncia.created_at)}`
        : `Cerrada ${fmt(denuncia.cierre_cerrado_at || denuncia.created_at)}`;
    default:
      return '';
  }
}

export default function DenunciaCard({ denuncia, plazo, tecnicos, onClick, className, children, isNew }: DenunciaCardProps) {
  const dotClass = plazo ? plazoDotColor[plazo.color] : 'bg-muted-foreground/30';
  const denuncianteNombre = denuncia.denunciante?.nombres || 'Anónimo';
  const tecnicoInfo = denuncia.tecnico && tecnicos ? tecnicos[denuncia.tecnico] : null;
  const isRecentlyTraspasado = denuncia.fecha_traspaso && daysAgo(denuncia.fecha_traspaso) < 7;
  const totalAmpliacionesDias = (denuncia.ampliaciones || []).reduce((sum, a) => sum + a.dias, 0);
  const contextualText = getContextualText(denuncia);

  const reabiertaText = denuncia.fecha_reapertura
    ? `Reabierta ${fmt(denuncia.fecha_reapertura)}${denuncia.plazo_reapertura ? ` · Plazo: ${fmtDate(denuncia.plazo_reapertura)}` : ''}`
    : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={cn(
        'w-full flex items-start gap-3 bg-card border rounded-xl px-4 py-3 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 text-left group relative',
        isNew ? 'border-l-4 border-l-primary' : 'border-border',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
    >
      <span className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', dotClass)} />
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Fila 1: Ticket + tipo·categoria + subestado + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-bold text-foreground">{denuncia.ticket}</span>
          <TipoDenunciaBadge
            tipo={denuncia.tipo}
            categoria={denuncia.detalles?.categoria}
            categoriaOtro={denuncia.detalles?.categoria_otro}
          />
          <SubestadoBadge subestado={denuncia.subestado ?? null} />
          {isNew && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              NUEVO
            </span>
          )}
          {isRecentlyTraspasado && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
              <ArrowRightLeft className="w-3 h-3" />
              Reasignado
            </span>
          )}
          {totalAmpliacionesDias > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Ampliada +{totalAmpliacionesDias}d
            </span>
          )}
        </div>
        {/* Fila 2: Denunciante + escenario */}
        <p className="text-sm truncate flex items-center gap-2">
          <User className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground/70 shrink-0">Denunciante:</span>
          <span className="truncate font-medium text-foreground">{denuncianteNombre}</span>
          {denuncia.escenario && denuncia.escenario !== 'revelada' && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
              {escenarioLabel[denuncia.escenario] || denuncia.escenario}
            </span>
          )}
        </p>
        {/* Fila 3: Técnico + fecha contextual */}
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
          {tecnicoInfo ? (
            <>
              <span className="text-muted-foreground/70 shrink-0">Asignado a:</span>
              <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0', tecnicoInfo.color)}>
                {tecnicoInfo.iniciales}
              </span>
              <span className="font-medium text-foreground">{tecnicoInfo.nombre}</span>
              <span className="text-muted-foreground/40">·</span>
            </>
          ) : null}
          <Clock className="w-3 h-3 shrink-0" />
          <span>{reabiertaText || contextualText}</span>
        </p>
        {/* Fila 3.5: Clasificación + SITPRECO (cerradas) */}
        {denuncia.estado === 'cerrada' && (
          <div className="flex items-center gap-2 flex-wrap">
            <ClasificacionBadge clasificacion={denuncia.informe_clasificacion} />
            {denuncia.cierre_sitpreco && (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {denuncia.cierre_sitpreco}
              </span>
            )}
            {denuncia.cierre_cerrado_at && (
              <span className="text-[11px] text-muted-foreground">
                {new Date(denuncia.cierre_cerrado_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        )}
        {/* Fila 4: Acciones contextuales */}
        {children && <div className="pt-1">{children}</div>}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <PlazoBadge plazo={plazo} />
      </div>
    </div>
  );
}
