import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
            <Head title="Transparencia - Inicio" />
            
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6 max-w-lg w-full">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Sistema Municipal
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Laravel 11 + React 18 + shadcn/ui
                    </p>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                    <Button 
                        size="lg"
                        className="w-full text-md cursor-pointer"
                        onClick={() => alert('¡Entorno configurado con éxito!')}
                    >
                        Probar Componente
                    </Button>
                </div>
            </div>
        </div>
    );
}