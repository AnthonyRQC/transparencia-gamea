import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Rendimiento } from '@/types/dashboard';

export default function GraficoCargaTecnicos({
    data,
    onSelect,
}: {
    data: NonNullable<Rendimiento['cargaTecnicos']>;
    onSelect?: (tecnico: string) => void;
}) {
    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="tecnico" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ fill: onSelect ? 'rgba(105,11,178,0.08)' : 'rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                        dataKey="enPlazo"
                        name="En plazo"
                        stackId="a"
                        fill="#22c55e"
                        barSize={16}
                        onClick={(d) => {
                            const t = (d as unknown as { tecnico?: string })?.tecnico;
                            if (onSelect && t) onSelect(t);
                        }}
                        style={onSelect ? { cursor: 'pointer' } : undefined}
                    />
                    <Bar dataKey="proximos" name="Por vencer" stackId="a" fill="#eab308" barSize={16} />
                    <Bar dataKey="vencidos" name="Vencidos" stackId="a" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
