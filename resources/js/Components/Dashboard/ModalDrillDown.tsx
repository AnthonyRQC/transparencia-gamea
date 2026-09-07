import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ExternalLink, Eye, Loader2, MousePointerClick } from 'lucide-react';
import axios from 'axios';
import { route } from 'ziggy-js';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { ETIQUETAS_TIPO, type FiltrosDashboard } from '@/types/dashboard';

export interface DrillFiltros {
    estado?: string;
    tecnico_id?: number;
    clasificacion_id?: number;
    medio_id?: number;
    dependencia_id?: number;
    /** Base del rango: ingreso | informe (redactado_at) | cierre (cerrado_at) | rechazo. */
    fecha_base?: 'ingreso' | 'informe' | 'cierre' | 'rechazo';
    /** Rango propio (drill de Evolución): reemplaza al rango global. */
    desde?: string;
    hasta?: string;
    /** El embudo y la carga son snapshot HOY: no heredan rango de fechas. */
    sinRango?: boolean;
}

interface Props {
    titulo: string;
    descripcion?: string;
    filtros: FiltrosDashboard;
    drill: DrillFiltros | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface PreviewRow {
    ticket: string;
    tipo: string;
    categoria: string;
    tecnico: string;
    estado: string;
    created_at: string;
}

export default function ModalDrillDown({ titulo, descripcion, filtros, drill, open, onOpenChange }: Props) {
    const [rows, setRows] = useState<PreviewRow[]>([]);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(false);

    const queryParams = () => {
        const p = new URLSearchParams();
        const desde = drill?.desde ?? (!drill?.sinRango ? filtros.desde : null);
        const hasta = drill?.hasta ?? (!drill?.sinRango ? filtros.hasta : null);
        if (desde) p.set('desde', desde);
        if (hasta) p.set('hasta', hasta);
        if (filtros.tecnico_id) p.set('tecnico_id', String(filtros.tecnico_id));
        if (filtros.tipo) p.set('tipo', filtros.tipo);
        if (filtros.categoria_id) p.set('categoria_id', String(filtros.categoria_id));
        if (drill?.estado) p.set('estado', drill.estado);
        if (drill?.tecnico_id) p.set('tecnico_id', String(drill.tecnico_id));
        if (drill?.clasificacion_id) p.set('clasificacion_id', String(drill.clasificacion_id));
        if (drill?.medio_id) p.set('medio_id', String(drill.medio_id));
        if (drill?.dependencia_id) p.set('dependencia_id', String(drill.dependencia_id));
        if (drill?.fecha_base) p.set('fecha_base', drill.fecha_base);
        // El filtro Estado global no aplica: la barra clicada lo define.
        return p.toString();
    };

    useEffect(() => {
        if (!open || !drill) return;
        setCargando(true);
        axios
            .get(route('reportes.preview'), { params: new URLSearchParams(queryParams()) })
            .then((res) => {
                setRows(res.data.rows ?? []);
                setTotal(res.data.total ?? 0);
            })
            .catch(() => {
                setRows([]);
                setTotal(0);
            })
            .finally(() => setCargando(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MousePointerClick className="w-5 h-5 text-primary" />
                        {titulo}
                    </DialogTitle>
                    <DialogDescription>
                        {descripcion ?? `${total} caso(s). Los filtros activos del dashboard se mantienen.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="border rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>F. Ingreso</TableHead>
                                <TableHead className="w-12 text-right">Ver</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-20 text-center">
                                        <Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground text-sm">
                                        Sin casos para esta selección.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((r) => (
                                    <TableRow key={r.ticket}>
                                        <TableCell className="font-mono text-xs text-primary">{r.ticket}</TableCell>
                                        <TableCell className="text-xs">{ETIQUETAS_TIPO[r.tipo] ?? r.tipo}</TableCell>
                                        <TableCell className="text-xs">{r.estado}</TableCell>
                                        <TableCell className="text-xs">{r.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`${route('denuncias.bandeja')}?destacar=${r.ticket}`}
                                                title={`Ver ${r.ticket}`}
                                                className="inline-flex p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between items-center gap-2 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                        {total > rows.length ? `Mostrando ${rows.length} de ${total}.` : `${total} caso(s).`}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`${route('reportes.index')}?${queryParams()}`}>
                            Abrir en Reportes para más detalle
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
