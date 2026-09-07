import { Button } from '@/Components/ui/button';
import GraficoEmbudo from './GraficoEmbudo';
import GraficoEvolucion, { type LineaEvolucion } from './GraficoEvolucion';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, EvolucionItem, Operativo } from '@/types/dashboard';

interface Props {
    operativo: Operativo;
    baseTemporal: Record<string, BaseTemporal>;
    onDrillEstado?: (estado: string, label: string) => void;
    onDrillEvolucion?: (linea: LineaEvolucion, item: EvolucionItem) => void;
    onDrillLinea?: (linea: LineaEvolucion) => void;
}

export default function TabOperativo({ operativo, baseTemporal, onDrillEstado, onDrillEvolucion, onDrillLinea }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                        <h3 className="font-bold text-sm">¿En qué fase están los casos hoy?</h3>
                        <p className="text-[11px] text-muted-foreground">Foto de hoy — no cambia con las fechas.</p>
                    </div>
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
                    <div>
                        <h3 className="font-bold text-sm">¿Ingresamos más de lo que cerramos?</h3>
                        <p className="text-[11px] text-muted-foreground">Ingresadas por fecha de ingreso · cerradas por fecha de cierre · rechazadas por fecha de rechazo.</p>
                    </div>
                    <BaseTemporalBadge base={baseTemporal['operativo.evolucion']} />
                </div>
                <GraficoEvolucion data={operativo.evolucion} onSelect={onDrillEvolucion} />
                {onDrillLinea ? (
                    <div className="flex flex-wrap gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onDrillLinea('ingresadas')}>
                            Ver ingresadas
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onDrillLinea('cerradas')}>
                            Ver cerradas
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onDrillLinea('rechazadas')}>
                            Ver rechazadas
                        </Button>
                    </div>
                ) : (
                    onDrillEvolucion && (
                        <p className="text-[11px] text-muted-foreground">Clic en un punto para ver los casos de ese período.</p>
                    )
                )}
            </div>
        </div>
    );
}
