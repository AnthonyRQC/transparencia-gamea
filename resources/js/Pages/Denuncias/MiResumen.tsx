import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  BarChart3, Activity, AlertTriangle, Clock, Archive
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import ContadorCard from '@/Components/Denuncias/ContadorCard';
import { RESUMEN_COLOR } from '@/Components/Denuncias/Shared/semantica';

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
    { label: 'Activos', valor: contadores.activos, icon: Activity, color: RESUMEN_COLOR.activos },
    { label: 'Vencidos', valor: contadores.vencidos, icon: AlertTriangle, color: RESUMEN_COLOR.vencidos },
    { label: 'Por vencer', valor: contadores.porVencer, icon: Clock, color: RESUMEN_COLOR.porVencer },
    { label: 'Cerrados', valor: contadores.cerrados, icon: Archive, color: RESUMEN_COLOR.cerrados },
  ];

  return (
    <AppLayout>
      <Head title="Mi Resumen — Transparencia UTLCC" />

      <PageHeader
        icon={<BarChart3 className="shrink-0" />}
        titulo="Mi Resumen"
        subtitulo="Indicadores personales de carga de trabajo, distribución de casos y cumplimiento de plazos."
        acciones={
          <>
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
          </>
        }
      />

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
