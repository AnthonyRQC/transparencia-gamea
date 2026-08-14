import GraficoCargaTecnicos from './GraficoCargaTecnicos';
import GraficoBarras from './GraficoBarras';
import TablaCasosUrgentes from './TablaCasosUrgentes';
import BaseTemporalBadge from './BaseTemporalBadge';
import type { BaseTemporal, Rendimiento } from '@/types/dashboard';

interface Props {
    rendimiento: Rendimiento;
    baseTemporal: Record<string, BaseTemporal>;
    esTecnico: boolean;
}

export default function TabRendimiento({ rendimiento, baseTemporal, esTecnico }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">
                        {rendimiento.modo === 'jefe' ? 'Carga por Técnico' : 'Mi Productividad Mensual'}
                    </h3>
                    <BaseTemporalBadge
                        base={baseTemporal[rendimiento.modo === 'jefe' ? 'rendimiento.cargaTecnicos' : 'rendimiento.productividad']}
                    />
                </div>
                {rendimiento.modo === 'jefe' ? (
                    <GraficoCargaTecnicos data={rendimiento.cargaTecnicos ?? []} />
                ) : (
                    <GraficoBarras data={(rendimiento.productividad ?? []).map((p) => ({ label: p.mes, value: p.cerrados }))} height={280} unit="Cerrados" />
                )}
            </div>
            <div className="border rounded-2xl bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">{esTecnico ? 'Mis Casos Urgentes' : 'Casos Urgentes'}</h3>
                    <BaseTemporalBadge base={baseTemporal['rendimiento.urgentes']} />
                </div>
                <TablaCasosUrgentes urgentes={rendimiento.urgentes} esTecnico={esTecnico} />
            </div>
        </div>
    );
}
