import { Head } from '@inertiajs/react';
import { FilePlus2 } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';

export default function RegistroDenuncia() {
    return (
        <AppLayout>
            <Head title="Registrar Denuncia — Transparencia UTLCC" />

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <FilePlus2 className="w-7 h-7 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Registrar Denuncia</h1>
                </div>
                <p className="text-muted-foreground">
                    Complete el formulario correspondiente al tipo de denuncia.
                </p>
            </div>

            <div className="bg-card border rounded-2xl p-12 shadow-xs text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FilePlus2 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-xl font-bold">Sprint 1 — En construcción</h2>
                    <p className="text-sm text-muted-foreground">
                        El formulario completo de registro (con dropdown de tipo y sus 3 variantes: Corrupción/Negación,
                        Acompañamiento, Intervención) se construirá en el siguiente sprint.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
