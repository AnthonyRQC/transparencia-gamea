import { cn } from '@/lib/utils';
import PlazoBadge from './PlazoBadge';
import TipoDenunciaBadge from './TipoDenunciaBadge';
import SubestadoBadge from './SubestadoBadge';

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
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
}

interface DenunciaCardProps {
  denuncia: DenunciaData;
  plazo: PlazoInfo | null;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const plazoDotColor: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

export default function DenunciaCard({ denuncia, plazo, onClick, className, children }: DenunciaCardProps) {
  const dotClass = plazo ? plazoDotColor[plazo.color] : 'bg-muted-foreground/30';
  const denuncianteNombre = denuncia.denunciante?.nombres || 'Anónimo';
  const fecha = new Date(denuncia.created_at).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

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
        'w-full flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 text-left group',
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
    </div>
  );
}
