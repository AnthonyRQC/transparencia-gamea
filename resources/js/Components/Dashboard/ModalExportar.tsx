import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Download, FileText, FileSpreadsheet, ExternalLink, Loader2, FileDown } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { cn } from '@/lib/utils';
import { ETIQUETAS_TIPO, type FiltrosDashboard } from '@/types/dashboard';

interface Props {
    filtros: FiltrosDashboard;
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

export default function ModalExportar({ filtros, open, onOpenChange }: Props) {
    const [formato, setFormato] = useState<'pdf' | 'excel'>('excel');
    const [rows, setRows] = useState<PreviewRow[]>([]);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(false);

    const queryParams = () => {
        const p = new URLSearchParams();
        if (filtros.desde) p.set('desde', filtros.desde);
        if (filtros.hasta) p.set('hasta', filtros.hasta);
        if (filtros.tecnico_id) p.set('tecnico_id', String(filtros.tecnico_id));
        if (filtros.tipo) p.set('tipo', filtros.tipo);
        if (filtros.categoria_id) p.set('categoria_id', String(filtros.categoria_id));
        if (filtros.clasificacion_id) p.set('clasificacion_id', String(filtros.clasificacion_id));
        if (filtros.estado) p.set('estado', filtros.estado);

        return p.toString();
    };

    useEffect(() => {
        if (!open) return;
        setCargando(true);
        axios
            .get('/reportes/preview', { params: new URLSearchParams(queryParams()) })
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

    const resumenFiltros: string[] = [];
    if (filtros.desde || filtros.hasta) resumenFiltros.push(`${filtros.desde ?? 'inicio'} → ${filtros.hasta ?? 'hoy'}`);
    if (filtros.tipo) resumenFiltros.push(ETIQUETAS_TIPO[filtros.tipo] ?? filtros.tipo);
    if (filtros.estado) resumenFiltros.push(filtros.estado);
    if (filtros.categoria_id) resumenFiltros.push(`categoría ${filtros.categoria_id}`);
    if (filtros.clasificacion_id) resumenFiltros.push(`clasificación ${filtros.clasificacion_id}`);
    if (filtros.tecnico_id) resumenFiltros.push(`técnico ${filtros.tecnico_id}`);

    const descargar = () => {
        window.open(`/reportes/exportar?${queryParams()}&formato=${formato}`, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileDown className="w-5 h-5 text-primary" />
                        Exportar reporte
                    </DialogTitle>
                    <DialogDescription>
                        {total} denuncia(s) con los filtros actuales. El rango de fechas se aplica a la fecha de ingreso.
                    </DialogDescription>
                </DialogHeader>

                {resumenFiltros.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {resumenFiltros.map((f) => (
                            <span key={f} className="px-2 py-0.5 rounded-full bg-secondary/60 border text-[11px] font-semibold">
                                {f}
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setFormato('excel')}
                        className={cn(
                            'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors cursor-pointer',
                            formato === 'excel' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                        )}
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel (.xlsx)
                    </button>
                    <button
                        onClick={() => setFormato('pdf')}
                        className={cn(
                            'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors cursor-pointer',
                            formato === 'pdf' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                        )}
                    >
                        <FileText className="w-4 h-4" />
                        PDF (membretado)
                    </button>
                </div>

                <div className="border rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>F. Ingreso</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-20 text-center">
                                        <Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground text-sm">
                                        Sin resultados para los filtros.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((r) => (
                                    <TableRow key={r.ticket}>
                                        <TableCell className="font-mono text-xs text-primary">{r.ticket}</TableCell>
                                        <TableCell className="text-xs">{ETIQUETAS_TIPO[r.tipo] ?? r.tipo}</TableCell>
                                        <TableCell className="text-xs">{r.estado}</TableCell>
                                        <TableCell className="text-xs">{r.created_at}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Link
                        href={`/reportes?${queryParams()}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                        Abrir en Reportes
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Button onClick={descargar} className="gap-1.5">
                        <Download className="w-4 h-4" />
                        Descargar {formato.toUpperCase()}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
