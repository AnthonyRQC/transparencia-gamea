import { Hourglass } from 'lucide-react';
import GraficoBarras from './GraficoBarras';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, Resultados } from '@/types/dashboard';

interface Props {
    resultados: Resultados;
    baseTemporal: Record<string, BaseTemporal>;
    onDrillClasificacion?: (id: number | undefined, label: string) => void;
    onDrillMedio?: (id: number | undefined, label: string) => void;
}

export default function TabResultados({ resultados, baseTemporal, onDrillClasificacion, onDrillMedio }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                        <h3 className="font-bold text-sm">¿En qué termina cada caso?</h3>
                        <p className="text-[11px] text-muted-foreground">Por fecha del informe final · clic para ver los casos.</p>
                    </div>
                    <BaseTemporalBadge base={baseTemporal['resultados.clasificaciones']} />
                </div>
                <GraficoBarras
                    data={resultados.clasificaciones}
                    height={220}
                    onSelect={onDrillClasificacion ? (item) => onDrillClasificacion(item.id, item.label) : undefined}
                />
            </div>
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                        <h3 className="font-bold text-sm">¿Qué unidades reciben más solicitudes?</h3>
                        <p className="text-[11px] text-muted-foreground">Por fecha de envío · suma cada unidad con sus subordinadas.</p>
                    </div>
                    <BaseTemporalBadge base={baseTemporal['resultados.dependencias']} />
                </div>
                <GraficoBarras data={resultados.dependencias} height={220} unit="Solicitudes" />
            </div>
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                        <h3 className="font-bold text-sm">¿Cómo se notificó cada cierre?</h3>
                        <p className="text-[11px] text-muted-foreground">Por fecha de cierre · clic para ver los casos.</p>
                    </div>
                    <BaseTemporalBadge base={baseTemporal['resultados.medios']} />
                </div>
                <GraficoBarras
                    data={resultados.medios}
                    height={220}
                    onSelect={onDrillMedio ? (item) => onDrillMedio(item.id, item.label) : undefined}
                />
            </div>
            <div className="border rounded-2xl border-dashed p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-[240px]">
                <Hourglass className="w-8 h-8" />
                <p className="text-xs font-semibold uppercase tracking-wide">Próximamente</p>
                <p className="text-[11px] text-center">Tiempos entre fases (Sprint 14)</p>
            </div>
        </div>
    );
}
