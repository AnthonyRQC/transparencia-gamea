import { cn } from '@/lib/utils';
import PlazoBadge from './PlazoBadge';
import TipoDenunciaBadge from './TipoDenunciaBadge';
import SubestadoBadge from './SubestadoBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
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

interface DenunciaData {
  ticket: string;
  tipo: string;
  escenario?: string;
  denunciante?: { nombres?: string; ci?: string };
  created_at: string;
  estado: string;
  subestado?: string | null;
  tecnico?: string | null;
  fecha_traspaso?: string | null;
}

interface DenunciaCardProps {
  denuncia: DenunciaData;
  plazo: PlazoInfo | null;
  tecnicos?: Record<string, TecnicoData>;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const plazoDotColor: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

function daysAgo(dateStr?: string | null): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DenunciaCard({ denuncia, plazo, tecnicos, onClick, className, children }: DenunciaCardProps) {
  const dotClass = plazo ? plazoDotColor[plazo.color] : 'bg-muted-foreground/30';
  const denuncianteNombre = denuncia.denunciante?.nombres || 'Anónimo';
  const fecha = new Date(denuncia.created_at).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const tecnicoInfo = denuncia.tecnico && tecnicos ? tecnicos[denuncia.tecnico] : null;
  const isRecentlyTraspasado = denuncia.fecha_traspaso && daysAgo(denuncia.fecha_traspaso) < 7;

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
        'w-full flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 text-left group relative',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
    >
      <span className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', dotClass)} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-bold text-foreground">{denuncia.ticket}</span>
          <TipoDenunciaBadge tipo={denuncia.tipo} />
          <SubestadoBadge subestado={denuncia.subestado ?? null} />
          {isRecentlyTraspasado && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
              <ArrowRightLeft className="w-3 h-3" />
              Reasignado
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {denuncianteNombre}
        </p>
        {children && <div className="pt-1">{children}</div>}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <PlazoBadge plazo={plazo} />
        <span className="text-[11px] text-muted-foreground">{fecha}</span>
      </div>

      {/* Avatar del técnico asignado (esquina superior derecha) */}
      {tecnicoInfo && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs border-2 border-card',
                  tecnicoInfo.color
                )}
              >
                {tecnicoInfo.iniciales}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              Asignado a: {tecnicoInfo.nombre}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
