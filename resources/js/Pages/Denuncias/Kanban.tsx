import { Head } from '@inertiajs/react';
import { KanbanSquare, Plus } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';

export default function Kanban() {
    return (
        <AppLayout>
            <Head title="Tablero Kanban — Transparencia UTLCC" />

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <KanbanSquare className="w-7 h-7 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Tablero Kanban</h1>
                </div>
                <p className="text-muted-foreground">
                    Vista general de todas las denuncias en proceso.
                </p>
            </div>

            <div className="bg-card border rounded-2xl p-12 shadow-xs text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <KanbanSquare className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-xl font-bold">Sprint 2 — En construcción</h2>
                    <p className="text-sm text-muted-foreground">
                        El tablero Kanban con sus 5 columnas (Ingresadas → Admitidas → Investigación → Informe → Cerradas)
                        se construirá en el siguiente sprint.
                    </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                        Pendiente
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}
