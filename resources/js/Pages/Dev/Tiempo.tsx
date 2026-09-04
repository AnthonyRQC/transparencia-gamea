import React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { CalendarClock, Eraser, FlaskConical } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

interface Props {
  simFecha?: string | null;
  hoy: string;
}

function sumarDias(base: string, dias: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export default function Tiempo() {
  const { simFecha, hoy } = usePage().props as unknown as Props;
  const [fecha, setFecha] = React.useState(simFecha ?? hoy);

  const fijar = (f: string) => {
    router.post(route('dev.tiempo.fijar'), { fecha: f });
  };

  return (
    <AppLayout>
      <Head title="Time Machine (dev)" />
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FlaskConical className="w-5 h-5" /> Time Machine <span className="text-xs font-mono text-muted-foreground">solo local</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simula la fecha del sistema sin tocar la BD. Plazos, badges, KPIs y alertas derivadas
            responden a la fecha simulada. Hoy real: <span className="font-mono">{hoy}</span>
            {simFecha && (
              <> · Simulando: <span className="font-mono font-bold text-amber-600">{simFecha}</span></>
            )}
          </p>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold">Fecha simulada</label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <Button onClick={() => fijar(fecha)}>
            <CalendarClock className="w-4 h-4 mr-1" /> Fijar
          </Button>
          <Button variant="outline" onClick={() => router.post(route('dev.tiempo.limpiar'))}>
            <Eraser className="w-4 h-4 mr-1" /> Hoy
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[7, 10, 30, 45].map((d) => (
            <Button key={d} variant="secondary" size="sm" onClick={() => fijar(sumarDias(hoy, d))}>
              +{d} días
            </Button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground border rounded-lg p-3 space-y-1">
          <p><strong>Cómo probar:</strong> crea una denuncia (45d en verde) → fija +40d → verás amarilla/roja, KPIs y campana con avisos → vuelve a Hoy.</p>
          <p>También funciona con <span className="font-mono">?sim_fecha=YYYY-MM-DD</span> en cualquier URL.</p>
          <p><Link className="underline" href={route('denuncias.bandeja')}>Ir a Bandeja</Link> · <Link className="underline" href={route('dashboard')}>Ir a Dashboard</Link></p>
        </div>
      </div>
    </AppLayout>
  );
}
