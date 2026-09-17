import GraficoCargaInvestigadores from './GraficoCargaInvestigadores';
import GraficoBarras from './GraficoBarras';
import TablaCasosUrgentes from './TablaCasosUrgentes';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, Rendimiento } from '@/types/dashboard';

interface Props {
    rendimiento: Rendimiento;
    baseTemporal: Record<string, BaseTemporal>;
    esInvestigador: boolean;
    onDrillInvestigador?: (investigador: string) => void;
}

export default function TabRendimiento({ rendimiento, baseTemporal, esInvestigador, onDrillInvestigador }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                        <h3 className="font-bold text-sm">
                            {rendimiento.modo === 'jefe' ? '¿Quién está saturado?' : '¿Cómo voy este año?'}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            {rendimiento.modo === 'jefe'
                                ? 'Casos de hoy por investigador: en plazo, por vencer y vencidos.'
                                : 'Mis casos cerrados mes a mes.'}
                        </p>
                    </div>
                    <BaseTemporalBadge
                        base={baseTemporal[rendimiento.modo === 'jefe' ? 'rendimiento.cargaInvestigadores' : 'rendimiento.productividad']}
                    />
                </div>
                {rendimiento.modo === 'jefe' ? (
                    <GraficoCargaInvestigadores data={rendimiento.cargaInvestigadores ?? []} onSelect={onDrillInvestigador} />
                ) : (
                    <GraficoBarras data={(rendimiento.productividad ?? []).map((p) => ({ label: p.mes, value: p.cerrados }))} height={280} unit="Cerrados" />
                )}
                {rendimiento.modo === 'jefe' && onDrillInvestigador && (
                    <p className="text-[11px] text-muted-foreground">Clic en un investigador para ver sus casos y extraer su informe.</p>
                )}
            </div>
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                        <h3 className="font-bold text-sm">{esInvestigador ? '¿Qué atiendo primero?' : '¿Qué urge hoy?'}</h3>
                        <p className="text-[11px] text-muted-foreground">Ordenados del más vencido al más holgado.</p>
                    </div>
                    <BaseTemporalBadge base={baseTemporal['rendimiento.urgentes']} />
                </div>
                <TablaCasosUrgentes urgentes={rendimiento.urgentes} esInvestigador={esInvestigador} />
            </div>
        </div>
    );
}
