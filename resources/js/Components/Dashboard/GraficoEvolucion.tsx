import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EvolucionItem } from '@/types/dashboard';

export default function GraficoEvolucion({ data }: { data: EvolucionItem[] }) {
    return (
        <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="gradIngresadas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#690bb2" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#690bb2" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradCerradas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradRechazadas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="ingresadas" name="Ingresadas" stroke="#690bb2" fill="url(#gradIngresadas)" strokeWidth={2} />
                    <Area type="monotone" dataKey="cerradas" name="Cerradas" stroke="#22c55e" fill="url(#gradCerradas)" strokeWidth={2} />
                    <Area type="monotone" dataKey="rechazadas" name="Rechazadas" stroke="#ef4444" fill="url(#gradRechazadas)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
