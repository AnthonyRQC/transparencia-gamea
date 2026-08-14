import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import type { ReportesFiltros } from './FiltrosReporte';

interface Props {
    filtros: ReportesFiltros;
}

export default function BotonExportar({ filtros }: Props) {
    const queryParams = () => {
        const p = new URLSearchParams();
        if (filtros.desde) p.set('desde', filtros.desde);
        if (filtros.hasta) p.set('hasta', filtros.hasta);
        if (filtros.tipo) p.set('tipo', filtros.tipo);
        if (filtros.estado) p.set('estado', filtros.estado);
        if (filtros.tecnico_id) p.set('tecnico_id', String(filtros.tecnico_id));
        if (filtros.categoria_id) p.set('categoria_id', String(filtros.categoria_id));
        if (filtros.clasificacion_id) p.set('clasificacion_id', String(filtros.clasificacion_id));
        if (filtros.busqueda) p.set('busqueda', filtros.busqueda);

        return p.toString();
    };

    const descargar = (formato: 'pdf' | 'excel') => {
        window.open(`/reportes/exportar?${queryParams()}&formato=${formato}`, '_blank');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="gap-1.5">
                    <Download className="w-4 h-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => descargar('excel')} className="gap-2 cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => descargar('pdf')} className="gap-2 cursor-pointer">
                    <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                    PDF (membretado)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
