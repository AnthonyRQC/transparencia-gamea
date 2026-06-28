import { Head, router } from '@inertiajs/react';
import {
  BarChart3, Activity, AlertTriangle, Clock, Archive
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import AppLayout from '@/Components/Layout/AppLayout';
import ContadorCard from '@/Components/Denuncias/ContadorCard';

interface Contadores {
  activos: number;
  vencidos: number;
  porVencer: number;
  cerrados: number;
}

interface PageProps {
  contadores: Contadores;
  tecnicoActual: string;
  tecnicos: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
}

export default function MiResumen({ contadores, tecnicoActual, tecnicos }: PageProps) {
  const handleTecnicoChange = (value: string) => {
    router.get('/denuncias/mi-resumen', { tecnico: value }, { preserveState: true, preserveScroll: true });
  };

  const cards = [
    { label: 'Activos', valor: contadores.activos, icon: Activity, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Vencidos', valor: contadores.vencidos, icon: AlertTriangle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { label: 'Por vencer', valor: contadores.porVencer, icon: Clock, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { label: 'Cerrados', valor: contadores.cerrados, icon: Archive, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  ];

  return (
    <AppLayout>
      <Head title="Mi Resumen — Transparencia UTLCC" />

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Mi Resumen</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Ver como:</span>
          <Select value={tecnicoActual} onValueChange={handleTecnicoChange}>
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tecnicos).map(([id, t]) => (
                <SelectItem key={id} value={id}>{t.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-muted-foreground mb-6">
        Indicadores personales del técnico. Los gráficos detallados se agregarán en Sprint 7.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <ContadorCard
            key={c.label}
            label={c.label}
            valor={c.valor}
            icon={c.icon}
            color={c.color}
          />
        ))}
      </div>
    </AppLayout>
  );
}
