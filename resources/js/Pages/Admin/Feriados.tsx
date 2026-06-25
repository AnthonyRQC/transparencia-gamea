import { Head } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';

export default function Feriados() {
    return (
        <AppLayout>
            <Head title="Calendario de Feriados — Transparencia UTLCC" />

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-7 h-7 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Calendario de Feriados</h1>
                </div>
                <p className="text-muted-foreground">
                    Administración de días no laborables para el cálculo automático de plazos.
                </p>
            </div>

            <div className="bg-card border rounded-2xl p-12 shadow-xs text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-xl font-bold">Sprint 8 — En construcción</h2>
                    <p className="text-sm text-muted-foreground">
                        Cuadrícula de calendario anual. Click sobre cualquier día para marcarlo o desmarcarlo
                        como feriado nacional, departamental o asueto.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
