import { type LucideIcon } from 'lucide-react';

interface ContadorCardProps {
  label: string;
  valor: number;
  icon: LucideIcon;
  color?: string;
  onClick?: () => void;
}

export default function ContadorCard({ label, valor, icon: Icon, color, onClick }: ContadorCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 text-left w-full"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color ?? 'bg-primary/10 text-primary'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold tracking-tight font-mono">{valor}</p>
        <p className="text-[11px] text-muted-foreground font-medium truncate">{label}</p>
      </div>
    </button>
  );
}
