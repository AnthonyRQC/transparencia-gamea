import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import FiltrosReporte, { type ReportesFiltros, type ReportesOpciones } from '@/Components/Reportes/FiltrosReporte';
import TablaReporte, { type ReporteRow } from '@/Components/Reportes/TablaReporte';
import BotonExportar from '@/Components/Reportes/BotonExportar';
import Paginacion from '@/Components/Denuncias/Paginacion';
import { route } from 'ziggy-js';

interface Props {
    denuncias: {
        data: ReporteRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    opciones: ReportesOpciones;
    filtros: ReportesFiltros;
}

export default function Reportes({ denuncias, opciones, filtros }: Props) {
    const [pagina, setPagina] = useState(denuncias.current_page);

    const irAPagina = (page: number) => {
        setPagina(page);
        router.get(
            route('reportes.index'),
            {
                busqueda: filtros.busqueda ?? undefined,
                desde: filtros.desde ?? undefined,
                hasta: filtros.hasta ?? undefined,
                tipo: filtros.tipo ?? undefined,
                estado: filtros.estado ?? undefined,
                tecnico_id: filtros.tecnico_id ?? undefined,
                categoria_id: filtros.categoria_id ?? undefined,
                clasificacion_id: filtros.clasificacion_id ?? undefined,
                page,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout>
            <Head title="Reportes — Transparencia UTLCC" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight leading-tight">Reportes</h1>
                            <p className="text-sm text-muted-foreground">
                                Listado filtrable y exportación PDF / Excel institucional.
                            </p>
                        </div>
                    </div>
                    <BotonExportar filtros={filtros} />
                </div>

                <FiltrosReporte opciones={opciones} filtros={filtros} />

                <TablaReporte rows={denuncias.data} estados={opciones.estados} />

                <Paginacion
                    paginaActual={denuncias.current_page}
                    totalPaginas={denuncias.last_page}
                    totalElementos={denuncias.total}
                    elementosPorPagina={denuncias.per_page}
                    onPaginaChange={irAPagina}
                />
            </div>
        </AppLayout>
    );
}
