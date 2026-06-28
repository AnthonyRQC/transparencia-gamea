import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import {
  ClipboardList, Search, FileText, Archive, ChevronDown, ChevronRight,
  Inbox, Eye, Play, CircleArrowRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import AppLayout from '@/Components/Layout/AppLayout';
import DenunciaCard from '@/Components/Denuncias/DenunciaCard';
import DenunciaSheet from '@/Components/Denuncias/DenunciaSheet';
import TabsDenuncias from '@/Components/Denuncias/TabsDenuncias';
import ListaVacia from '@/Components/Denuncias/ListaVacia';

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
  fecha_vencimiento?: string;
}

interface Denunciado {
  conoce_identidad: boolean;
  nombres?: string;
  dependencia?: string;
  descripcion?: string;
}

interface Prueba {
  tipo: string;
  descripcion: string;
  testigo_nombre?: string;
  testigo_telefono?: string;
  archivo_nombre?: string;
}

interface Denuncia {
  ticket: string;
  tipo: string;
  escenario?: string;
  denunciante?: { nombres?: string; ci?: string; email?: string; telefono?: string };
  denunciados?: Denunciado[];
  detalles?: { categoria?: string; fecha?: string; hora?: string; lugar?: string };
  hechos?: string;
  pruebas?: Prueba[];
  created_at: string;
  estado: string;
  subestado?: string | null;
  tecnico?: string | null;
  plazo: PlazoInfo | null;
}

interface Grouped {
  [estado: string]: Denuncia[];
}

interface PageProps {
  grouped: Grouped;
  tecnicoActual: string;
  tecnicos: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
}

const estadoLabels: Record<string, { label: string; icon: any }> = {
  asignada: { label: 'Bandeja de entrada', icon: Inbox },
  investigacion: { label: 'Investigación', icon: Eye },
  informe: { label: 'Informe Final', icon: FileText },
  cerrada: { label: 'Cierre', icon: Archive },
};

const estadoOrden = ['asignada', 'investigacion', 'informe', 'cerrada'];

export default function MisCasos({ grouped, tecnicoActual, tecnicos }: PageProps) {
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [archivadasOpen, setArchivadasOpen] = useState(false);
  const [processingTicket, setProcessingTicket] = useState<string | null>(null);

  const handleTecnicoChange = (value: string) => {
    router.get(route('denuncias.mis-casos'), { tecnico: value }, { preserveState: true, preserveScroll: true });
  };

  const handleIniciar = (ticket: string) => {
    setProcessingTicket(ticket);
    router.post(`/denuncias/${ticket}/iniciar`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Investigación iniciada para ${ticket}`);
        setProcessingTicket(null);
        setSelectedDenuncia(null);
      },
      onError: () => {
        toast.error('Error al iniciar investigación');
        setProcessingTicket(null);
      },
    });
  };

  const tabs = estadoOrden.map((estado) => {
    const items = grouped[estado] || [];
    const countVisible = estado === 'cerrada'
      ? items.filter((d) => !d.subestado).length
      : items.length;
    return {
      value: estado,
      label: estadoLabels[estado]?.label || estado,
      count: countVisible,
    };
  });

  const renderActions = (denuncia: Denuncia) => {
    if (denuncia.estado === 'asignada') {
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleIniciar(denuncia.ticket); }}
          disabled={processingTicket === denuncia.ticket}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          {processingTicket === denuncia.ticket ? 'Iniciando...' : 'Iniciar investigación'}
        </button>
      );
    }
    if (['investigacion', 'informe'].includes(denuncia.estado)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
          <CircleArrowRight className="w-3.5 h-3.5" />
          Continuar (Sprint 4)
        </span>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <Head title="Mis Casos — Transparencia UTLCC" />

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Mis Casos</h1>
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
        Gestión de casos asignados. Use el selector para ver como otro técnico.
      </p>

      <TabsDenuncias tabs={tabs}>
        {(value) => {
          const items = grouped[value] || [];
          const isCierre = value === 'cerrada';
          const visible = isCierre ? items.filter((d) => !d.subestado) : items;
          const archivadas = isCierre ? items.filter((d) => d.subestado === 'archivada') : [];

          return (
            <div className="space-y-3">
              {visible.length === 0 && archivadas.length === 0 && (
                <ListaVacia
                  icon={estadoLabels[value]?.icon || ClipboardList}
                  titulo={`Sin casos en ${estadoLabels[value]?.label?.toLowerCase() || value}`}
                  descripcion="No hay denuncias en esta fase actualmente."
                />
              )}

              {visible.map((d) => (
                <DenunciaCard
                  key={d.ticket}
                  denuncia={d}
                  plazo={d.plazo}
                  tecnicos={tecnicos}
                  onClick={() => setSelectedDenuncia(d)}
                >
                  {renderActions(d) && (
                    <div className="pt-1">{renderActions(d)}</div>
                  )}
                </DenunciaCard>
              ))}

              {archivadas.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setArchivadasOpen(!archivadasOpen)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    {archivadasOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Archive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Archivadas</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground ml-auto">
                      {archivadas.length}
                    </span>
                  </button>
                  {archivadasOpen && (
                    <div className="space-y-2 p-3">
                      {archivadas.map((d) => (
                        <DenunciaCard
                          key={d.ticket}
                          denuncia={d}
                          plazo={null}
                          tecnicos={tecnicos}
                          onClick={() => setSelectedDenuncia(d)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      </TabsDenuncias>

      {selectedDenuncia && (
        <DenunciaSheet
          denuncia={selectedDenuncia}
          plazo={selectedDenuncia.plazo}
          tecnicos={tecnicos}
          open={selectedDenuncia !== null}
          onOpenChange={(v) => { if (!v) setSelectedDenuncia(null); }}
        >
          {selectedDenuncia.estado === 'asignada' && (
            <button
              type="button"
              onClick={() => handleIniciar(selectedDenuncia.ticket)}
              disabled={processingTicket === selectedDenuncia.ticket}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              {processingTicket === selectedDenuncia.ticket ? 'Iniciando...' : 'Iniciar investigación'}
            </button>
          )}
        </DenunciaSheet>
      )}
    </AppLayout>
  );
}
