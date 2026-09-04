import GraficoEmbudo from './GraficoEmbudo';
import GraficoEvolucion from './GraficoEvolucion';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, Operativo } from '@/types/dashboard';

interface Props {
    operativo: Operativo;
    baseTemporal: Record<string, BaseTemporal>;
    onDrillEstado?: (estado: string, label: string) => void;
}

export default function TabOperativo({ operativo, baseTemporal, onDrillEstado }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">Embudo por Fase</h3>
                    <BaseTemporalBadge base={baseTemporal['operativo.embudo']} />
                </div>
                <GraficoEmbudo
                    data={operativo.embudo}
                    onSelect={
                        onDrillEstado
                            ? (estado, label) =>
                                  onDrillEstado(estado === 'cerrada_archivada' ? 'archivada' : estado, label)
                            : undefined
                    }
                />
                {onDrillEstado && (
                    <p className="text-[11px] text-muted-foreground">Clic en una barra para ver los casos.</p>
                )}
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
