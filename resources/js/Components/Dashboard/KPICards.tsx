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
    ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, KPIs } from '@/types/dashboard';

interface Props {
    kpis: KPIs;
    baseTemporal: Record<string, BaseTemporal>;
    esTecnico: boolean;
    bandejaHref: string;
    misCasosHref: string;
}

interface CardDef {
    key: string;
    label: string;
    subtitulo: string;
    value: string | number;
    icon: typeof FolderKanban;
    baseKey: string;
    accent?: 'default' | 'red' | 'amber';
    href?: string;
    hrefTitulo?: string;
}

/**
 * Dos niveles: 5 primarias grandes (la foto de hoy + cumplimiento) y
 * 3 secundarias compactas. Números en Outfit semibold (no mono) y
 * etiquetas sin truncate para 1280px.
 */
export default function KPICards({ kpis, baseTemporal, esTecnico, bandejaHref, misCasosHref }: Props) {
    const primarias: CardDef[] = [
        { key: 'activos', label: 'Abiertos hoy', subtitulo: 'Todo lo no cerrado', value: kpis.activos, icon: FolderKanban, baseKey: 'kpis.activos' },
        { key: 'pendientesAdmision', label: 'Por admitir', subtitulo: 'Plazo legal: 5 días', value: kpis.pendientesAdmision, icon: Inbox, baseKey: 'kpis.pendientesAdmision' },
        {
            key: 'proximosAVencer',
            label: 'Por vencer',
            subtitulo: 'Vencen en 5 días o menos',
            value: kpis.proximosAVencer,
            icon: Clock,
            baseKey: 'kpis.proximosAVencer',
            accent: 'amber',
            href: esTecnico ? misCasosHref : bandejaHref,
            hrefTitulo: 'Ver casos por vencer',
        },
        {
            key: 'vencidos',
            label: 'Vencidos',
            subtitulo: 'Ya pasaron su plazo',
            value: kpis.vencidos,
            icon: AlertTriangle,
            baseKey: 'kpis.vencidos',
            accent: 'red',
            href: esTecnico ? misCasosHref : bandejaHref,
            hrefTitulo: 'Ver casos vencidos',
        },
        {
            key: 'cumplimiento',
            label: 'Cerrados a tiempo',
            subtitulo: kpis.cumplimiento == null ? 'Sin cierres en el período' : 'Del período elegido',
            value: kpis.cumplimiento == null ? '—' : `${kpis.cumplimiento}%`,
            icon: CheckCircle2,
            baseKey: 'kpis.cumplimiento',
        },
    ];

    const secundarias: CardDef[] = esTecnico
        ? []
        : [
              { key: 'rechazadas', label: 'Rechazadas', subtitulo: 'Por fecha de rechazo', value: kpis.rechazadas, icon: XCircle, baseKey: 'kpis.rechazadas' },
              {
                  key: 'sinAsignar',
                  label: 'Sin técnico',
                  subtitulo: 'Toca asignar',
                  value: kpis.sinAsignar,
                  icon: UserX,
                  baseKey: 'kpis.sinAsignar',
                  accent: 'amber',
                  href: bandejaHref,
                  hrefTitulo: 'Ir a asignar',
              },
          ];

    const totalSplit = kpis.split.corrupcion + kpis.split.negacion;
    const pctCorrupcion = totalSplit > 0 ? Math.round((kpis.split.corrupcion / totalSplit) * 100) : 0;
    const pctNegacion = totalSplit > 0 ? Math.round((kpis.split.negacion / totalSplit) * 100) : 0;

    const tarjeta = (card: CardDef, grande: boolean) => {
        const contenido = (
            <>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
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
                        <card.icon className="w-4 h-4" />
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span
                        className={cn(
                            'font-sans font-bold tracking-tight leading-none',
                            grande ? 'text-3xl' : 'text-xl',
                            card.accent === 'red' ? 'text-destructive' : 'text-foreground'
                        )}
                    >
                        {card.value}
                    </span>
                    {card.href && <ArrowUpRight className="w-4 h-4 text-muted-foreground" />}
                </div>
                <p className="text-[11px] leading-tight text-muted-foreground">{card.subtitulo}</p>
                <BaseTemporalBadge base={baseTemporal[card.baseKey]} />
            </>
        );

        const cls = cn(
            'border border-border rounded-xl bg-card flex flex-col min-w-0 transition-all',
            grande ? 'p-4 space-y-2' : 'p-3 space-y-1.5',
            card.href && 'hover:border-primary/50 hover:shadow-sm cursor-pointer'
        );

        return card.href ? (
            <Link key={card.key} href={card.href} title={card.hrefTitulo ?? card.label} className={cls}>
                {contenido}
            </Link>
        ) : (
            <div key={card.key} className={cls}>
                {contenido}
            </div>
        );
    };

    return (
        <div className="space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
                {primarias.map((c) => tarjeta(c, true))}
            </div>
            {secundarias.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {secundarias.map((c) => tarjeta(c, false))}
                    {/* Qué ingresó */}
                    <div className="border border-border rounded-xl bg-card p-3 space-y-1.5 flex flex-col min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">Qué ingresó</span>
                            <span className="p-1 rounded-md bg-secondary/20 text-muted-foreground shrink-0">
                                <Scale className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-primary">Corrupción</span>
                                <span>
                                    {kpis.split.corrupcion} ({pctCorrupcion}%)
                                </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${pctCorrupcion}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-muted-foreground">Negación de información</span>
                                <span>
                                    {kpis.split.negacion} ({pctNegacion}%)
                                </span>
                            </div>
                        </div>
                        <p className="text-[11px] leading-tight text-muted-foreground">Del período, sin filtro de tipo</p>
                        <BaseTemporalBadge base={baseTemporal['kpis.split']} />
                    </div>
                </div>
            )}
        </div>
    );
}
