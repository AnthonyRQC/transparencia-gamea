import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    FolderKanban,
    Inbox,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    UserX,
    Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, KPIs } from '@/types/dashboard';

interface Props {
    kpis: KPIs;
    baseTemporal: Record<string, BaseTemporal>;
    esTecnico: boolean;
}

interface CardDef {
    key: string;
    label: string;
    subtitulo: string;
    value: string | number;
    icon: typeof FolderKanban;
    baseKey: string;
    accent?: 'default' | 'red' | 'amber';
    hiddenTecnico?: boolean;
    href?: string;
}

export default function KPICards({ kpis, baseTemporal, esTecnico }: Props) {
    const cards: CardDef[] = [
        { key: 'activos', label: 'Abiertos hoy', subtitulo: 'Todo lo no cerrado', value: kpis.activos, icon: FolderKanban, baseKey: 'kpis.activos' },
        { key: 'pendientesAdmision', label: 'Por admitir', subtitulo: 'Plazo legal: 5 días', value: kpis.pendientesAdmision, icon: Inbox, baseKey: 'kpis.pendientesAdmision' },
        { key: 'proximosAVencer', label: 'Por vencer', subtitulo: 'Vencen en ≤5 días', value: kpis.proximosAVencer, icon: Clock, baseKey: 'kpis.proximosAVencer', accent: 'amber' },
        { key: 'vencidos', label: 'Vencidos', subtitulo: 'Pasaron su plazo', value: kpis.vencidos, icon: AlertTriangle, baseKey: 'kpis.vencidos', accent: 'red' },
        {
            key: 'cumplimiento',
            label: 'Cerrados a tiempo',
            subtitulo: kpis.cumplimiento == null ? 'Sin cierres en el período' : 'Del período elegido',
            value: kpis.cumplimiento == null ? '—' : `${kpis.cumplimiento}%`,
            icon: CheckCircle2,
            baseKey: 'kpis.cumplimiento',
        },
        { key: 'rechazadas', label: 'Rechazadas', subtitulo: 'Por fecha de rechazo', value: kpis.rechazadas, icon: XCircle, baseKey: 'kpis.rechazadas', hiddenTecnico: true },
        {
            key: 'sinAsignar',
            label: 'Sin técnico',
            subtitulo: 'Toca asignar',
            value: kpis.sinAsignar,
            icon: UserX,
            baseKey: 'kpis.sinAsignar',
            accent: 'amber',
            hiddenTecnico: true,
            href: route('denuncias.bandeja'),
        },
    ];

    const visibles = cards.filter((c) => !(esTecnico && c.hiddenTecnico));
    const totalSplit = kpis.split.corrupcion + kpis.split.negacion;
    const pctCorrupcion = totalSplit > 0 ? Math.round((kpis.split.corrupcion / totalSplit) * 100) : 0;
    const pctNegacion = totalSplit > 0 ? Math.round((kpis.split.negacion / totalSplit) * 100) : 0;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
            {visibles.map((card) => {
                const contenido = (
                    <>
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                                {card.label}
                            </span>
                            <span
                                className={cn(
                                    'p-1 rounded-md shrink-0',
                                    card.accent === 'red'
                                        ? 'bg-destructive/10 text-destructive'
                                        : card.accent === 'amber'
                                          ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
                                          : 'bg-primary/10 text-primary'
                                )}
                            >
                                <card.icon className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div
                            className={cn(
                                'text-2xl font-extrabold tracking-tight font-mono leading-none',
                                card.accent === 'red' ? 'text-destructive' : 'text-foreground'
                            )}
                        >
                            {card.value}
                        </div>
                        <p className="text-[10px] leading-tight text-muted-foreground">{card.subtitulo}</p>
                        <BaseTemporalBadge base={baseTemporal[card.baseKey]} />
                    </>
                );

                return card.href ? (
                    <Link
                        key={card.key}
                        href={card.href}
                        title="Ir a asignar"
                        className="border border-border rounded-xl bg-card p-3 space-y-2 flex flex-col min-w-0 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
                    >
                        {contenido}
                    </Link>
                ) : (
                    <div
                        key={card.key}
                        className="border border-border rounded-xl bg-card p-3 space-y-2 flex flex-col min-w-0"
                    >
                        {contenido}
                    </div>
                );
            })}

            {/* Card #8 — Split Tipo */}
            <div className="border border-border rounded-xl bg-card p-3 space-y-2 flex flex-col min-w-0">
                <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                        Qué ingresó
                    </span>
                    <span className="p-1 rounded-md bg-secondary/20 text-muted-foreground shrink-0">
                        <Scale className="w-3.5 h-3.5" />
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-primary">CORRUPCIÓN</span>
                        <span className="font-mono">{pctCorrupcion}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pctCorrupcion}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-muted-foreground">NEGACIÓN</span>
                        <span className="font-mono">{pctNegacion}%</span>
                    </div>
                </div>
                <p className="text-[10px] leading-tight text-muted-foreground">Del período, sin filtro de tipo</p>
                <BaseTemporalBadge base={baseTemporal['kpis.split']} />
            </div>
        </div>
    );
}
