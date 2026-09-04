import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { EmbudoItem } from '@/types/dashboard';

const COLORES: Record<string, string> = {
    ingresada: '#818cf8',
    evaluacion_tecnica: '#a78bfa',
    admitida: '#60a5fa',
    asignada: '#22d3ee',
    investigacion: '#2dd4bf',
    informe: '#34d399',
    rechazada: '#9ca3af',
    cerrada: '#6b7280',
    cerrada_archivada: '#9ca3af',
};

export default function GraficoEmbudo({ data, onSelect }: { data: EmbudoItem[]; onSelect?: (estado: string, label: string) => void }) {
    return (
        <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ fill: onSelect ? 'rgba(105,11,178,0.08)' : 'rgba(0,0,0,0.05)' }} />
                    <Bar
                        dataKey="total"
                        name="Casos (clic para ver)"
                        radius={[0, 6, 6, 0]}
                        barSize={18}
                        onClick={(d) => {
                            const estado = (d as unknown as { estado?: string })?.estado;
                            const label = (d as unknown as { label?: string })?.label;
                            if (onSelect && estado) onSelect(estado, label ?? estado);
                        }}
                        style={onSelect ? { cursor: 'pointer' } : undefined}
                    >
                        {data.map((d) => (
                            <Cell key={d.estado} fill={COLORES[d.estado] ?? '#818cf8'} opacity={d.esTerminal ? 0.55 : 1} />
                        ))}
                        <LabelList dataKey="total" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#690bb2' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
