import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TEMA } from '@/helpers/tema';
import type { EvolucionItem } from '@/types/dashboard';

export type LineaEvolucion = 'ingresadas' | 'cerradas' | 'rechazadas';

export default function GraficoEvolucion({
    data,
    onSelect,
}: {
    data: EvolucionItem[];
    onSelect?: (linea: LineaEvolucion, item: EvolucionItem) => void;
}) {
    const clickLinea = (linea: LineaEvolucion) => ({
        onClick: (d: unknown) => {
            const item = (d as unknown as { payload?: EvolucionItem })?.payload;
            if (onSelect && item?.periodo) onSelect(linea, item);
        },
        style: onSelect ? ({ cursor: 'pointer' } as React.CSSProperties) : undefined,
    });

    return (
        <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="gradIngresadas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={TEMA.primario()} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={TEMA.primario()} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradCerradas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={TEMA.teal} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={TEMA.teal} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradRechazadas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={TEMA.magenta} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={TEMA.magenta} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="ingresadas" name="Ingresadas" stroke={TEMA.primario()} fill="url(#gradIngresadas)" strokeWidth={2} {...clickLinea('ingresadas')} />
                    <Area type="monotone" dataKey="cerradas" name="Cerradas" stroke={TEMA.teal} fill="url(#gradCerradas)" strokeWidth={2} {...clickLinea('cerradas')} />
                    <Area type="monotone" dataKey="rechazadas" name="Rechazadas" stroke={TEMA.magenta} fill="url(#gradRechazadas)" strokeWidth={2} {...clickLinea('rechazadas')} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
