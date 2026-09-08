import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TEMA } from '@/helpers/tema';
import type { EmbudoItem } from '@/types/dashboard';

/** Fases activas en rampa morada institucional; terminales en un solo gris. */
const COLORES_ACTIVOS = [TEMA.primario(), '#5E1AA8', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];

export default function GraficoEmbudo({ data, onSelect }: { data: EmbudoItem[]; onSelect?: (estado: string, label: string) => void }) {
    return (
        <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ fill: onSelect ? TEMA.cursorHover : 'rgba(0,0,0,0.05)' }} />
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
                        {data.map((d, i) => (
                            <Cell
                                key={d.estado}
                                fill={d.esTerminal ? TEMA.grisTerminal : (COLORES_ACTIVOS[i % COLORES_ACTIVOS.length] ?? TEMA.primario())}
                                opacity={d.esTerminal ? 0.55 : 1}
                            />
                        ))}
                        <LabelList dataKey="total" position="right" className="fill-foreground" style={{ fontSize: 11, fontWeight: 700 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
