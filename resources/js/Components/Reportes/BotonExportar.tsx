import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import ModalExportar from '@/Components/Dashboard/ModalExportar';
import type { ReportesFiltros } from './FiltrosReporte';
import type { FiltrosDashboard } from '@/types/dashboard';

interface Props {
    filtros: ReportesFiltros;
}

export default function BotonExportar({ filtros }: Props) {
    const [open, setOpen] = useState(false);

    // El modal trabaja con filtros de dashboard; se mapean los de reportes.
    const filtrosDashboard: FiltrosDashboard = {
        desde: filtros.desde,
        hasta: filtros.hasta,
        tecnico_id: filtros.tecnico_id,
        tipo: filtros.tipo,
        categoria_id: filtros.categoria_id,
        clasificacion_id: filtros.clasificacion_id,
        estado: filtros.estado,
        incluir_inactivos: false,
        tab: 'operativo',
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} className="gap-1.5">
                <Download className="w-4 h-4" />
                Exportar
            </Button>
            <ModalExportar filtros={filtrosDashboard} open={open} onOpenChange={setOpen} />
        </>
    );
}
