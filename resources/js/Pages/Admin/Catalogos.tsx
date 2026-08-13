import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { BookOpen, Tag, Calendar, Building, Mail, FileCheck, Shield, AlertTriangle, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AppLayout from '@/Components/Layout/AppLayout';
import TablaCatalogo from '@/Components/Admin/TablaCatalogo';

interface CatalogoItem {
    id: number;
    [key: string]: unknown;
}

interface ColumnConfig {
    key: string;
    label: string;
    type: 'text' | 'boolean' | 'select' | 'date' | 'datetime' | 'count' | 'status';
    options?: Record<string, string>;
    readonly?: boolean;
}

interface CatalogoDef {
    label: string;
    items: CatalogoItem[];
    columns: ColumnConfig[];
    readonly?: boolean;
    editable_only?: boolean;
    is_json_based?: boolean;
    agrupado_por_anio?: boolean;
    usos_label?: string;
    es_arbol?: boolean;
    padre_options?: Array<{ id: number | null; nombre: string }>;
}

const ICONS: Record<string, React.ElementType> = {
    categorias: Tag,
    feriados: Calendar,
    dependencias: Building,
    medios_notificacion: Mail,
    clasificaciones: FileCheck,
    estados: Shield,
    tipos_denuncia: AlertTriangle,
};

export default function Catalogos() {
    const props = usePage().props as Record<string, any>;
    const catalogos = props.catalogos as Record<string, CatalogoDef>;
    const tipos = Object.keys(catalogos);
    const [activeTab, setActiveTab] = useState(tipos[0] ?? '');

    return (
        <AppLayout>
            <Head title="Catálogos del Sistema — Transparencia UTLCC" />

            <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-7 h-7 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Catálogos del Sistema</h1>
                </div>
                <p className="text-muted-foreground">
                    Administración de catálogos del sistema. Cada pestaña agrupa un tipo de catálogo.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 flex overflow-x-auto flex-nowrap w-full justify-start h-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`
                        .mb-6.flex::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {tipos.map((tipo) => {
                        const Icon = ICONS[tipo] || Layers;
                        return (
                            <TabsTrigger key={tipo} value={tipo} className="text-xs flex items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5" />
                                {catalogos[tipo].label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {tipos.map((tipo) => (
                    <TabsContent key={tipo} value={tipo}>
                        <TablaCatalogo
                            tipo={tipo}
                            items={catalogos[tipo].items}
                            columns={catalogos[tipo].columns}
                            agrupado_por_anio={catalogos[tipo].agrupado_por_anio ?? false}
                            readonly={catalogos[tipo].readonly ?? false}
                            editable_only={catalogos[tipo].editable_only ?? false}
                            is_json_based={catalogos[tipo].is_json_based ?? false}
                            usos_label={catalogos[tipo].usos_label ?? 'registro(s)'}
                            es_arbol={catalogos[tipo].es_arbol ?? false}
                            padre_options={catalogos[tipo].padre_options ?? []}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </AppLayout>
    );
}
