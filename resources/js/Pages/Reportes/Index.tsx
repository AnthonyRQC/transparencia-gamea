import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';

export default function Reportes() {
    return (
        <AppLayout>
            <Head title="Reportes — Transparencia UTLCC" />

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-7 h-7 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                </div>
                <p className="text-muted-foreground">
                    Métricas, indicadores y gráficos del sistema de denuncias.
                </p>
            </div>

            <div className="bg-card border rounded-2xl p-12 shadow-xs text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-xl font-bold">Sprint 7 — En construcción</h2>
                    <p className="text-sm text-muted-foreground">
                        Dashboard con KPIs, gráficos de barras, torta y líneas, además de tablas de reportes
                        con filtros.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
