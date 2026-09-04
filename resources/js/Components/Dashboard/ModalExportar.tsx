import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Download, FileText, FileSpreadsheet, ExternalLink, Loader2, FileDown, ChevronLeft, ChevronRight, Columns3 } from 'lucide-react';
import axios from 'axios';
import { route } from 'ziggy-js';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
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

/** Columnas disponibles para el Excel (clave => etiqueta). Debe coincidir con ReporteController::COLUMNAS_EXCEL. */
export const COLUMNAS_EXCEL: Array<{ key: string; label: string; fija?: boolean }> = [
    { key: 'fecha_ingreso', label: 'Fecha de ingreso', fija: true },
    { key: 'ticket', label: 'Nro de denuncia', fija: true },
    { key: 'tipo', label: 'Tipo de denuncia' },
    { key: 'denunciante', label: 'Datos del denunciante' },
    { key: 'denunciados', label: 'Datos de los denunciados' },
    { key: 'sitpreco', label: 'Nro SITPRECO' },
    { key: 'tecnico', label: 'Técnico encargado' },
    { key: 'fecha_conclusion', label: 'Fecha de conclusión' },
    { key: 'resumen_conclusion', label: 'Resumen de conclusión' },
    { key: 'clasificacion', label: 'Clasificación final' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha_admision', label: 'Fecha admisión' },
    { key: 'fecha_rechazo', label: 'Fecha rechazo' },
    { key: 'escenario', label: 'Escenario' },
    { key: 'medio_cierre', label: 'Medio notificación cierre' },
    { key: 'fecha_cierre', label: 'Fecha cierre' },
    { key: 'dias_restantes', label: 'Días restantes' },
];

const COLUMNAS_DEFAULT = [
    'fecha_ingreso', 'ticket', 'tipo', 'denunciante', 'denunciados',
    'sitpreco', 'tecnico', 'fecha_conclusion', 'resumen_conclusion', 'clasificacion',
];

export default function ModalExportar({ filtros, open, onOpenChange }: Props) {
    const [formato, setFormato] = useState<'pdf' | 'excel'>('excel');
    const [columnas, setColumnas] = useState<string[]>(COLUMNAS_DEFAULT);
    const [rows, setRows] = useState<PreviewRow[]>([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [ultimaPagina, setUltimaPagina] = useState(1);
    const [cargando, setCargando] = useState(false);

    const queryParams = (page?: number) => {
        const p = new URLSearchParams();
        if (filtros.desde) p.set('desde', filtros.desde);
        if (filtros.hasta) p.set('hasta', filtros.hasta);
        if (filtros.tecnico_id) p.set('tecnico_id', String(filtros.tecnico_id));
        if (filtros.tipo) p.set('tipo', filtros.tipo);
        if (filtros.categoria_id) p.set('categoria_id', String(filtros.categoria_id));
        if (filtros.clasificacion_id) p.set('clasificacion_id', String(filtros.clasificacion_id));
        if (filtros.estado) p.set('estado', filtros.estado);
        if (page && page > 1) p.set('page', String(page));

        return p.toString();
    };

    const cargar = (page: number) => {
        setCargando(true);
        axios
            .get(route('reportes.preview'), { params: new URLSearchParams(queryParams(page)) })
            .then((res) => {
                setRows(res.data.rows ?? []);
                setTotal(res.data.total ?? 0);
                setPagina(res.data.current_page ?? 1);
                setUltimaPagina(res.data.last_page ?? 1);
            })
            .catch(() => {
                setRows([]);
                setTotal(0);
            })
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        if (!open) return;
        setColumnas(COLUMNAS_DEFAULT);
        cargar(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open ]);

    const toggleColumna = (key: string) => {
        setColumnas((cols) => (cols.includes(key) ? cols.filter((c) => c !== key) : [...cols, key]));
    };

    const resumenFiltros: string[] = [];
    if (filtros.desde || filtros.hasta) resumenFiltros.push(`${filtros.desde ?? 'inicio'} → ${filtros.hasta ?? 'hoy'}`);
    if (filtros.tipo) resumenFiltros.push(ETIQUETAS_TIPO[filtros.tipo] ?? filtros.tipo);
    if (filtros.estado) resumenFiltros.push(filtros.estado);
    if (filtros.categoria_id) resumenFiltros.push(`categoría ${filtros.categoria_id}`);
    if (filtros.clasificacion_id) resumenFiltros.push(`clasificación ${filtros.clasificacion_id}`);
    if (filtros.tecnico_id) resumenFiltros.push(`técnico ${filtros.tecnico_id}`);

    const descargar = () => {
        const p = new URLSearchParams(queryParams());
        if (formato === 'excel') {
            columnas.forEach((c) => p.append('columnas[]', c));
        }
        window.open(`${route('reportes.exportar')}?${p.toString()}&formato=${formato}`, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileDown className="w-5 h-5 text-primary" />
                        Exportar reporte
                    </DialogTitle>
                    <DialogDescription>
                        <strong className="text-foreground">{total} denuncia(s)</strong> con los filtros actuales
                        {formato === 'excel' ? ` — saldrán todas en el Excel con ${columnas.length} columnas.` : ' — saldrán todas en el PDF membretado.'}{' '}
                        El rango de fechas se aplica a la fecha de ingreso.
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

                {formato === 'excel' && (
                    <div className="border rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold flex items-center gap-1.5">
                            <Columns3 className="w-3.5 h-3.5" />
                            Columnas del Excel ({columnas.length} elegidas)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {COLUMNAS_EXCEL.map((c) => (
                                <label key={c.key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                    <Checkbox
                                        checked={columnas.includes(c.key)}
                                        disabled={c.fija}
                                        onCheckedChange={() => toggleColumna(c.key)}
                                    />
                                    <span className={c.fija ? 'text-muted-foreground' : ''}>{c.label}</span>
                                </label>
                            ))}
                        </div>
                        {columnas.length === 0 && (
                            <p className="text-xs text-destructive">Elige al menos una columna además del ticket.</p>
                        )}
                    </div>
                )}

                <div className="border rounded-xl overflow-hidden">
                    <div className="max-h-56 overflow-y-auto">
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
                    <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20">
                        <p className="text-[11px] text-muted-foreground">
                            Página {pagina} de {ultimaPagina} · {total} en total
                        </p>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled={pagina <= 1 || cargando} onClick={() => cargar(pagina - 1)} className="h-7 px-2">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled={pagina >= ultimaPagina || cargando} onClick={() => cargar(pagina + 1)} className="h-7 px-2">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Link
                        href={`${route('reportes.index')}?${queryParams()}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                        Abrir en Reportes
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex gap-2">
                        <Label className="text-xs text-muted-foreground self-center hidden sm:block">
                            Se descargarán los {total}
                        </Label>
                        <Button onClick={descargar} disabled={total === 0 || (formato === 'excel' && columnas.length === 0)} className="gap-1.5">
                            <Download className="w-4 h-4" />
                            Descargar {formato.toUpperCase()}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
