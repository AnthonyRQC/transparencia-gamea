import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const PALETA = ['#690bb2', '#fecd2a', '#60a5fa', '#22c55e', '#f97316', '#e879f9', '#14b8a6', '#ef4444'];

interface Props {
    data: Array<{ label: string; value: number }>;
    height?: number;
    unit?: string;
}

export default function GraficoBarras({ data, height = 200, unit = 'Casos' }: Props) {
    return (
        <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="value" name={unit} radius={[0, 6, 6, 0]} barSize={16}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={PALETA[i % PALETA.length]} />
                        ))}
                        <LabelList dataKey="value" position="right" style={{ fontSize: 10, fontWeight: 700 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
