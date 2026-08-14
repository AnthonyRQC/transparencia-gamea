import { Hourglass } from 'lucide-react';
import GraficoBarras from './GraficoBarras';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, Resultados } from '@/types/dashboard';

interface Props {
    resultados: Resultados;
    baseTemporal: Record<string, BaseTemporal>;
}

export default function TabResultados({ resultados, baseTemporal }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">Casos por Clasificación Final</h3>
                    <BaseTemporalBadge base={baseTemporal['resultados.clasificaciones']} />
                </div>
                <GraficoBarras data={resultados.clasificaciones} height={220} />
            </div>
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">Top Dependencias GAMEA</h3>
                    <BaseTemporalBadge base={baseTemporal['resultados.dependencias']} />
                </div>
                <GraficoBarras data={resultados.dependencias} height={220} unit="Solicitudes" />
            </div>
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">Cierres por Medio de Notificación</h3>
                    <BaseTemporalBadge base={baseTemporal['resultados.medios']} />
                </div>
                <GraficoBarras data={resultados.medios} height={220} />
            </div>
            <div className="border rounded-2xl border-dashed p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-[240px]">
                <Hourglass className="w-8 h-8" />
                <p className="text-xs font-semibold uppercase tracking-wide">Próximamente</p>
                <p className="text-[11px] text-center">Tiempos entre fases (Sprint 14)</p>
            </div>
        </div>
    );
}
