import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { LayoutDashboard, Download, RefreshCw, BarChart3, Users } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import KPICards from '@/Components/Dashboard/KPICards';
import FiltrosDashboard from '@/Components/Dashboard/FiltrosDashboard';
import TabOperativo from '@/Components/Dashboard/TabOperativo';
import TabResultados from '@/Components/Dashboard/TabResultados';
import TabRendimiento from '@/Components/Dashboard/TabRendimiento';
import ModalExportar from '@/Components/Dashboard/ModalExportar';
import ModalDrillDown, { type DrillFiltros } from '@/Components/Dashboard/ModalDrillDown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { route } from 'ziggy-js';
import type { DashboardProps, FiltrosDashboard as FiltrosState } from '@/types/dashboard';
import { PRESET_DEFAULT, rangoPreset } from '@/helpers/presetsFecha';

export default function Dashboard(props: DashboardProps) {
    const { kpis, operativo, resultados, rendimiento, base_temporal, opciones, esJefe, esTecnico, esRegistrador, filtros } = props;

    const [tab, setTab] = useState<'operativo' | 'resultados' | 'rendimiento'>(
        filtros.tab === 'resultados' || filtros.tab === 'rendimiento' ? filtros.tab : 'operativo'
    );
    const [exportOpen, setExportOpen] = useState(false);
    const [drillOpen, setDrillOpen] = useState(false);
    const [drillTitulo, setDrillTitulo] = useState('');
    const [drill, setDrill] = useState<DrillFiltros | null>(null);
    const aplicoDefaultRef = useRef(false);

    const aplicarFiltros = useCallback(
        (next: FiltrosState) => {
            router.get(
                route('dashboard'),
                {
                    desde: next.desde ?? undefined,
                    hasta: next.hasta ?? undefined,
                    tecnico_id: next.tecnico_id ?? undefined,
                    tipo: next.tipo ?? undefined,
                    categoria_id: next.categoria_id ?? undefined,
                    clasificacion_id: next.clasificacion_id ?? undefined,
                    estado: next.estado ?? undefined,
                    incluir_inactivos: next.incluir_inactivos || undefined,
                    tab,
                },
                { preserveState: true, preserveScroll: true }
            );
        },
        [tab]
    );

    // Rango por defecto (Sprint 12 §6 Q3): al entrar sin fechas, aplicar preset
    // "Último mes" una sola vez. Reset manual (Todo) no se re-aplica.
    useEffect(() => {
        if (!aplicoDefaultRef.current && filtros.desde == null && filtros.hasta == null) {
            aplicoDefaultRef.current = true;
            const r = rangoPreset(PRESET_DEFAULT);
            aplicarFiltros({ ...filtros, desde: r.desde, hasta: r.hasta });
        } else {
            aplicoDefaultRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const abrirDrill = (titulo: string, d: DrillFiltros) => {
        setDrillTitulo(titulo);
        setDrill(d);
        setDrillOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Dashboard — Transparencia UTLCC" />

            <div className="flex flex-col gap-4">
                {/* Cabecera */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-7 h-7 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight leading-tight">Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                {esJefe ? 'Supervisión global de la unidad' : esTecnico ? 'Mi rendimiento personal' : 'Vista general del sistema'}
                            </p>
                        </div>
                    </div>
                    {esJefe && (
                        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1.5">
                            <Download className="w-4 h-4" />
                            Exportar
                        </Button>
                    )}
                </div>

                {/* Chips de filtros + Sheet */}
                <FiltrosDashboard filtros={filtros} opciones={opciones} esJefe={esJefe} onChange={aplicarFiltros} />

                {/* KPIs — siempre visibles */}
                <KPICards kpis={kpis} baseTemporal={base_temporal} esTecnico={esTecnico} />

                {/* Tabs */}
                <Tabs value={tab} onValueChange={(v) => setTab(v as 'operativo' | 'resultados' | 'rendimiento')}>
                    <TabsList>
                        <TabsTrigger value="operativo" className="gap-1.5">
                            <RefreshCw className="w-4 h-4" />
                            Operativo
                        </TabsTrigger>
                        <TabsTrigger value="resultados" className="gap-1.5">
                            <BarChart3 className="w-4 h-4" />
                            Resultados
                        </TabsTrigger>
                        {!esRegistrador && (
                            <TabsTrigger value="rendimiento" className="gap-1.5">
                                <Users className="w-4 h-4" />
                                Rendimiento
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="operativo" className="mt-3">
                        <TabOperativo
                            operativo={operativo}
                            baseTemporal={base_temporal}
                            onDrillEstado={
                                esJefe
                                    ? (estado, label) =>
                                          abrirDrill(`Casos en estado: ${label}`, { estado, sinRango: true })
                                    : undefined
                            }
                        />
                    </TabsContent>
                    <TabsContent value="resultados" className="mt-3">
                        <TabResultados
                            resultados={resultados}
                            baseTemporal={base_temporal}
                            onDrillClasificacion={
                                esJefe
                                    ? (id, label) =>
                                          abrirDrill(`Casos con clasificación: ${label}`, { clasificacion_id: id })
                                    : undefined
                            }
                            onDrillMedio={
                                esJefe
                                    ? (id, label) => abrirDrill(`Cierres por medio: ${label}`, { medio_id: id })
                                    : undefined
                            }
                        />
                    </TabsContent>
                    {!esRegistrador && (
                        <TabsContent value="rendimiento" className="mt-3">
                            <TabRendimiento rendimiento={rendimiento} baseTemporal={base_temporal} esTecnico={esTecnico} />
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {esJefe && <ModalExportar filtros={filtros} open={exportOpen} onOpenChange={setExportOpen} />}
            {esJefe && (
                <ModalDrillDown
                    titulo={drillTitulo}
                    filtros={filtros}
                    drill={drill}
                    open={drillOpen}
                    onOpenChange={setDrillOpen}
                />
            )}
        </AppLayout>
    );
}
