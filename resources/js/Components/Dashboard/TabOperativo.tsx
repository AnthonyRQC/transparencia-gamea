import GraficoEmbudo from './GraficoEmbudo';
import GraficoEvolucion from './GraficoEvolucion';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, Operativo } from '@/types/dashboard';

interface Props {
    operativo: Operativo;
    baseTemporal: Record<string, BaseTemporal>;
}

export default function TabOperativo({ operativo, baseTemporal }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">Embudo por Fase</h3>
                    <BaseTemporalBadge base={baseTemporal['operativo.embudo']} />
                </div>
                <GraficoEmbudo data={operativo.embudo} />
            </div>
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">Evolución Temporal</h3>
                    <BaseTemporalBadge base={baseTemporal['operativo.evolucion']} />
                </div>
                <GraficoEvolucion data={operativo.evolucion} />
            </div>
        </div>
    );
}
