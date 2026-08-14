import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { ETIQUETAS_TIPO } from '@/types/dashboard';

export interface ReporteRow {
    ticket: string;
    tipo: string;
    estado: string;
    subestado?: string | null;
    created_at: string;
    fecha_admitida?: string | null;
    fecha_rechazada?: string | null;
    categoria?: { nombre: string } | null;
    tecnico?: { name: string } | null;
    plazo?: { dias_restantes: number; color: string } | null;
}

const badgeColor: Record<string, string> = {
    green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    gray: 'bg-muted text-muted-foreground border-border',
};

interface Props {
    rows: ReporteRow[];
    estados: Record<string, string>;
}

function formatDate(d?: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TablaReporte({ rows, estados }: Props) {
    return (
        <div className="border rounded-2xl bg-card overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-32">Ticket</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Días</TableHead>
                        <TableHead>F. Ingreso</TableHead>
                        <TableHead className="w-16 text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                                No hay denuncias con los filtros seleccionados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((r) => {
                            const labelEstado = r.estado === 'cerrada' && r.subestado === 'archivada'
                                ? 'CERRADA · ARCHIVADA'
                                : (estados[r.estado] ?? r.estado);

                            return (
                                <TableRow key={r.ticket}>
                                    <TableCell className="font-mono text-xs font-semibold text-primary">{r.ticket}</TableCell>
                                    <TableCell className="text-xs">{ETIQUETAS_TIPO[r.tipo] ?? r.tipo}</TableCell>
                                    <TableCell className="text-xs">{r.categoria?.nombre ?? '—'}</TableCell>
                                    <TableCell className="text-xs">{r.tecnico?.name ?? '—'}</TableCell>
                                    <TableCell className="text-xs">{labelEstado}</TableCell>
                                    <TableCell className="text-right">
                                        {r.plazo ? (
                                            <Badge className={badgeColor[r.plazo.color] ?? badgeColor.gray}>
                                                {r.plazo.dias_restantes} d
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs">{formatDate(r.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href="/denuncias"
                                            title="Ver en la bandeja"
                                            className="inline-flex p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
