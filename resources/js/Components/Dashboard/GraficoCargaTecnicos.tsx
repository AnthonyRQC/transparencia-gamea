import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Rendimiento } from '@/types/dashboard';

export default function GraficoCargaTecnicos({ data }: { data: NonNullable<Rendimiento['cargaTecnicos']> }) {
    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="tecnico" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="enPlazo" name="En plazo" stackId="a" fill="#22c55e" />
                    <Bar dataKey="proximos" name="Próximos" stackId="a" fill="#eab308" />
                    <Bar dataKey="vencidos" name="Vencidos" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
