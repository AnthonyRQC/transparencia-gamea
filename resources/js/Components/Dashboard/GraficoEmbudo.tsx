import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { EmbudoItem } from '@/types/dashboard';

/** Fases activas en rampa morada institucional; terminales en un solo gris. */
const COLORES: Record<string, string> = {
    ingresada: '#4B0090',
    evaluacion_tecnica: '#5E1AA8',
    admitida: '#6D28D9',
    asignada: '#7C3AED',
    investigacion: '#8B5CF6',
    informe: '#A78BFA',
    rechazada: '#6b7280',
    cerrada: '#6b7280',
    cerrada_archivada: '#6b7280',
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
                        <LabelList dataKey="total" position="right" style={{ fontSize: 11, fontWeight: 700 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
