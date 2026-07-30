import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
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
    agrupado_por_anio?: boolean;
}

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
                <TabsList className="mb-6 flex-wrap h-auto">
                    {tipos.map((tipo) => (
                        <TabsTrigger key={tipo} value={tipo} className="text-xs">
                            {catalogos[tipo].label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {tipos.map((tipo) => (
                    <TabsContent key={tipo} value={tipo}>
                        <TablaCatalogo
                            tipo={tipo}
                            items={catalogos[tipo].items}
                            columns={catalogos[tipo].columns}
                            agrupado_por_anio={catalogos[tipo].agrupado_por_anio ?? false}
                            readonly={catalogos[tipo].readonly ?? false}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </AppLayout>
    );
}
