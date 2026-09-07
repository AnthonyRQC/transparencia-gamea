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
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import type { DashboardProps, FiltrosDashboard as FiltrosState } from '@/types/dashboard';
import { PRESET_DEFAULT, rangoPreset } from '@/helpers/presetsFecha';

/** "2026-09-05" → "5 sep 2026" para encabezados legibles. */
function formatearFechaCorta(ymd: string | null): string | null {
    if (!ymd) return null;
    const d = new Date(ymd + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return ymd;
    return d.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard(props: DashboardProps) {
    const { kpis, operativo, resultados, rendimiento, base_temporal, opciones, esJefe, esTecnico, esRegistrador, filtros } = props;

    const [tab, setTab] = useState<'operativo' | 'resultados' | 'rendimiento'>(
        filtros.tab === 'resultados' || filtros.tab === 'rendimiento' ? filtros.tab : 'operativo'
    );
    const [exportOpen, setExportOpen] = useState(false);
    const [drillOpen, setDrillOpen] = useState(false);
    const [drillTitulo, setDrillTitulo] = useState('');
    const [drillDescripcion, setDrillDescripcion] = useState<string | undefined>(undefined);
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
            toast.info('Mostrando el último mes — puedes cambiarlo en Filtros', { duration: 4000 });
        } else {
            aplicoDefaultRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const abrirDrill = (titulo: string, d: DrillFiltros, descripcion?: string) => {
        setDrillTitulo(titulo);
        setDrillDescripcion(descripcion);
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

                {/* BANDA 1 — HOY: foto actual, ignora las fechas */}
                <section aria-label="Foto de hoy" className="space-y-2.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Hoy</span>
                        <span className="text-xs text-muted-foreground">Foto actual — no cambia con las fechas</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>
                    <KPICards
                        kpis={kpis}
                        baseTemporal={base_temporal}
                        esTecnico={esTecnico}
                        bandejaHref={route('denuncias.bandeja')}
                        misCasosHref={route('denuncias.mis-casos')}
                        onDrillRechazadas={
                            esJefe
                                ? () =>
                                      abrirDrill(
                                          'Casos rechazados en el período',
                                          { estado: 'rechazada', fecha_base: 'rechazo' },
                                          'Mismos casos de la tarjeta (por fecha de rechazo).'
                                      )
                                : undefined
                        }
                        onDrillIngresadas={
                            esJefe
                                ? () =>
                                      abrirDrill(
                                          'Casos ingresados en el período',
                                          { fecha_base: 'ingreso' },
                                          'Mismos casos de la tarjeta (por fecha de ingreso).'
                                      )
                                : undefined
                        }
                    />
                </section>

                {/* BANDA 2 — PERÍODO ELEGIDO */}
                <section aria-label="Período elegido" className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Período</span>
                        <span className="text-xs text-muted-foreground">
                            {filtros.desde || filtros.hasta
                                ? `${formatearFechaCorta(filtros.desde) ?? 'inicio'} → ${formatearFechaCorta(filtros.hasta) ?? 'hoy'}`
                                : 'Todo el historial'}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                    </div>
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
                                          abrirDrill(`Casos en: ${label}`, { estado, sinRango: true }, 'Estado actual de cada caso (foto de hoy).')
                                    : undefined
                            }
                            onDrillEvolucion={
                                esJefe
                                    ? (linea, item) => {
                                          const base =
                                              linea === 'ingresadas'
                                                  ? ({ fecha_base: 'ingreso' } as const)
                                                  : linea === 'cerradas'
                                                    ? ({ fecha_base: 'cierre' } as const)
                                                    : ({ estado: 'rechazada', fecha_base: 'rechazo' } as const);
                                          const titulo =
                                              linea === 'ingresadas'
                                                  ? `Ingresadas: ${item.periodo}`
                                                  : linea === 'cerradas'
                                                    ? `Cerradas: ${item.periodo}`
                                                    : `Rechazadas: ${item.periodo}`;
                                          abrirDrill(titulo, { ...base, desde: item.desde, hasta: item.hasta }, `Casos del ${item.desde} al ${item.hasta}.`);
                                      }
                                    : undefined
                            }
                            onDrillLinea={
                                esJefe
                                    ? (linea) =>
                                          abrirDrill(
                                              linea === 'ingresadas'
                                                  ? 'Ingresadas del período'
                                                  : linea === 'cerradas'
                                                    ? 'Cerradas del período'
                                                    : 'Rechazadas del período',
                                              linea === 'ingresadas'
                                                  ? { fecha_base: 'ingreso' }
                                                  : linea === 'cerradas'
                                                    ? { fecha_base: 'cierre' }
                                                    : { estado: 'rechazada', fecha_base: 'rechazo' },
                                              'Casos del rango elegido en Filtros.'
                                          )
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
                                          abrirDrill(
                                              `Casos terminados en: ${label}`,
                                              { clasificacion_id: id, fecha_base: 'informe' },
                                              'Mismos casos del gráfico (por fecha del informe).'
                                          )
                                    : undefined
                            }
                            onDrillMedio={
                                esJefe
                                    ? (id, label) =>
                                          abrirDrill(
                                              `Cierres notificados por: ${label}`,
                                              { medio_id: id, fecha_base: 'cierre' },
                                              'Mismos casos del gráfico (por fecha de cierre).'
                                          )
                                    : undefined
                            }
                            onDrillDependencia={
                                esJefe
                                    ? (id, label) =>
                                          abrirDrill(
                                              `Casos con solicitudes a: ${label}`,
                                              { dependencia_id: id },
                                              'Casos con solicitudes a esta unidad o sus subordinadas.'
                                          )
                                    : undefined
                            }
                        />
                    </TabsContent>
                    {!esRegistrador && (
                        <TabsContent value="rendimiento" className="mt-3">
                            <TabRendimiento
                                rendimiento={rendimiento}
                                baseTemporal={base_temporal}
                                esTecnico={esTecnico}
                                onDrillTecnico={
                                    esJefe
                                        ? (nombre) => {
                                              const t = opciones.tecnicos.find((x) => x.name === nombre);
                                              if (!t) return;
                                              abrirDrill(
                                                  `Casos de: ${nombre}`,
                                                  { tecnico_id: t.id, sinRango: true },
                                                  'Casos asignados hoy a este técnico.'
                                              );
                                          }
                                        : undefined
                                }
                            />
                        </TabsContent>
                    )}
                </Tabs>
                </section>
            </div>

            {esJefe && <ModalExportar filtros={filtros} open={exportOpen} onOpenChange={setExportOpen} />}
            {esJefe && (
                <ModalDrillDown
                    titulo={drillTitulo}
                    descripcion={drillDescripcion}
                    filtros={filtros}
                    drill={drill}
                    open={drillOpen}
                    onOpenChange={setDrillOpen}
                />
            )}
        </AppLayout>
    );
}
