import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
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
    router.get(route('denuncias.mi-resumen'), { tecnico: value }, { preserveState: true, preserveScroll: true });
  };

  const cards = [
    { label: 'Activos', valor: contadores.activos, icon: Activity, color: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground' },
    { label: 'Vencidos', valor: contadores.vencidos, icon: AlertTriangle, color: 'bg-pink-600/10 text-pink-800 border border-pink-600/30 dark:bg-pink-600/20 dark:text-pink-300' },
    { label: 'Por vencer', valor: contadores.porVencer, icon: Clock, color: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300' },
    { label: 'Cerrados', valor: contadores.cerrados, icon: Archive, color: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300' },
  ];

  return (
    <AppLayout>
      <Head title="Mi Resumen — Transparencia UTLCC" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Mi Resumen</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Indicadores personales de carga de trabajo, distribución de casos y cumplimiento de plazos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground font-medium">Ver como:</span>
          <Select value={tecnicoActual} onValueChange={handleTecnicoChange}>
            <SelectTrigger className="w-44 h-8 text-sm cursor-pointer">
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
