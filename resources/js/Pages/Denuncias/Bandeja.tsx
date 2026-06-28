import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  Inbox, CheckCircle2, ClipboardList, Eye, Archive,
  InboxIcon, X, UserPlus, RotateCcw, ArrowRightLeft
} from 'lucide-react';
import { FileText } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import DenunciaCard from '@/Components/Denuncias/DenunciaCard';
import DenunciaSheet from '@/Components/Denuncias/DenunciaSheet';
import ContadorCard from '@/Components/Denuncias/ContadorCard';
import TabsDenuncias from '@/Components/Denuncias/TabsDenuncias';
import ListaVacia from '@/Components/Denuncias/ListaVacia';
import ModalAdmision from '@/Components/Denuncias/ModalAdmision';
import ModalRechazo from '@/Components/Denuncias/ModalRechazo';
import AsignacionModal from '@/Components/Denuncias/AsignacionModal';
import TraspasoModal from '@/Components/Denuncias/TraspasoModal';
import ReabrirModal from '@/Components/Denuncias/ReabrirModal';

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
  justificacion_admision?: string | null;
  fecha_admitida?: string | null;
  justificacion_rechazo?: string | null;
  justificacion_reapertura?: string | null;
  fecha_reapertura?: string | null;
  tecnico_anterior?: string | null;
  bitacora?: Array<{ fecha: string; accion: string; detalle: string; usuario: string }>;
  estado: string;
  subestado?: string | null;
  tecnico?: string | null;
  plazo: PlazoInfo | null;
}

interface Contador {
  ingresada: number;
  admitida: number;
  asignada: number;
  investigacion: number;
  informe: number;
  cerrada: number;
  [key: string]: number;
}

interface PageProps {
  denuncias: Denuncia[];
  porAsignar: Denuncia[];
  enCurso: Denuncia[];
  historial: Denuncia[];
  contadores: Contador;
  tecnicos: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  cargaTecnicos?: Array<{ id: string; nombre: string; iniciales: string; color: string; activos: number; por_vencer: number; vencidos: number }>;
}

interface BitacoraEntry {
  fecha: string;
  accion: string;
  detalle: string;
  usuario: string;
}

const contadorConfig = [
  { key: 'ingresada', label: 'Ingresadas', icon: Inbox, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { key: 'admitida', label: 'Admitidas', icon: CheckCircle2, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { key: 'asignada', label: 'Asignadas', icon: ClipboardList, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { key: 'investigacion', label: 'Investigación', icon: Eye, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { key: 'informe', label: 'Informe Final', icon: FileText, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { key: 'cerrada', label: 'Cerradas', icon: Archive, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
];

export default function Bandeja({ denuncias, porAsignar, enCurso, historial, contadores, tecnicos, cargaTecnicos }: PageProps) {
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [modalAdmisionTicket, setModalAdmisionTicket] = useState<string | null>(null);
  const [modalRechazoTicket, setModalRechazoTicket] = useState<string | null>(null);
  const [modalAsignacionTicket, setModalAsignacionTicket] = useState<string | null>(null);
  const [modalTraspasoTicket, setModalTraspasoTicket] = useState<string | null>(null);
  const [modalReabrirTicket, setModalReabrirTicket] = useState<string | null>(null);

  const tabs = [
    { value: 'por-admitir', label: 'Por admitir', count: contadores.ingresada },
    { value: 'por-asignar', label: 'Por asignar', count: contadores.admitida },
    { value: 'en-curso', label: 'En curso', count: contadores.asignada + contadores.investigacion + contadores.informe },
    { value: 'historial', label: 'Historial', count: contadores.rechazada + contadores.cerrada },
    { value: 'vision-general', label: 'Visión general' },
  ];

  return (
    <AppLayout>
      <Head title="Bandeja de Admisión — Transparencia UTLCC" />

      <div className="flex items-center gap-2 mb-1">
        <InboxIcon className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Bandeja de Admisión</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Gestión de denuncias. Click en una card para ver detalle y acciones.
      </p>

      <TabsDenuncias tabs={tabs} defaultValue="por-admitir">
        {(value) => {
          if (value === 'por-admitir') {
            return denuncias.length === 0 ? (
              <ListaVacia
                icon={Inbox}
                titulo="No hay denuncias por admitir"
                descripcion="Todas las denuncias ingresadas han sido procesadas."
              />
            ) : (
              <div className="space-y-3">
                {denuncias.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    tecnicos={tecnicos}
                    onClick={() => setSelectedDenuncia(d)}
                  >
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModalAdmisionTicket(d.ticket); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Admitir
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModalRechazoTicket(d.ticket); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Rechazar
                      </button>
                    </div>
                  </DenunciaCard>
                ))}
              </div>
            );
          }

          if (value === 'por-asignar') {
            return porAsignar.length === 0 ? (
              <ListaVacia
                icon={ClipboardList}
                titulo="No hay denuncias por asignar"
                descripcion="Todas las denuncias admitidas ya tienen un técnico asignado."
              />
            ) : (
              <div className="space-y-3">
                {porAsignar.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    tecnicos={tecnicos}
                    onClick={() => setSelectedDenuncia(d)}
                  >
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModalAsignacionTicket(d.ticket); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Asignar técnico
                      </button>
                    </div>
                  </DenunciaCard>
                ))}
              </div>
            );
          }

          if (value === 'en-curso') {
            return enCurso.length === 0 ? (
              <ListaVacia
                icon={Eye}
                titulo="No hay denuncias en curso"
                descripcion="Todas las denuncias admitidas ya fueron asignadas y están en proceso."
              />
            ) : (
              <div className="space-y-3">
                {enCurso.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    tecnicos={tecnicos}
                    onClick={() => setSelectedDenuncia(d)}
                  />
                ))}
              </div>
            );
          }

          if (value === 'historial') {
            return historial.length === 0 ? (
              <ListaVacia
                icon={Archive}
                titulo="No hay denuncias en el historial"
                descripcion="No hay denuncias rechazadas o cerradas registradas."
              />
            ) : (
              <div className="space-y-3">
                {historial.map((d) => (
                  <DenunciaCard
                    key={d.ticket}
                    denuncia={d}
                    plazo={d.plazo}
                    tecnicos={tecnicos}
                    onClick={() => setSelectedDenuncia(d)}
                  >
                    {d.estado === 'rechazada' && d.justificacion_rechazo && (
                      <div className="pt-1">
                        <p className="text-xs text-destructive italic line-clamp-2">{d.justificacion_rechazo}</p>
                      </div>
                    )}
                  </DenunciaCard>
                ))}
              </div>
            );
          }

          // vision-general
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {contadorConfig.map((c) => (
                <ContadorCard
                  key={c.key}
                  label={c.label}
                  valor={contadores[c.key]}
                  icon={c.icon}
                  color={c.color}
                />
              ))}
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
          {selectedDenuncia.estado === 'ingresada' && (
            <>
              <button
                type="button"
                onClick={() => { const t = selectedDenuncia.ticket; setSelectedDenuncia(null); setModalAdmisionTicket(t); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Admitir
              </button>
              <button
                type="button"
                onClick={() => { const t = selectedDenuncia.ticket; setSelectedDenuncia(null); setModalRechazoTicket(t); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors"
              >
                <X className="w-4 h-4" />
                Rechazar
              </button>
            </>
          )}
          {selectedDenuncia.estado === 'admitida' && (
            <button
              type="button"
              onClick={() => { const t = selectedDenuncia.ticket; setSelectedDenuncia(null); setModalAsignacionTicket(t); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Asignar técnico
            </button>
          )}
          {['asignada', 'investigacion', 'informe'].includes(selectedDenuncia.estado) && selectedDenuncia.tecnico && (
            <button
              type="button"
              onClick={() => { setModalTraspasoTicket(selectedDenuncia.ticket); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm font-semibold hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Traspasar
            </button>
          )}
          {['rechazada', 'cerrada'].includes(selectedDenuncia.estado) && (
            <button
              type="button"
              onClick={() => { setModalReabrirTicket(selectedDenuncia.ticket); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reabrir denuncia
            </button>
          )}
        </DenunciaSheet>
      )}

      <ModalAdmision
        ticket={modalAdmisionTicket}
        open={modalAdmisionTicket !== null}
        onOpenChange={(v) => { if (!v) setModalAdmisionTicket(null); }}
      />
      <ModalRechazo
        ticket={modalRechazoTicket}
        open={modalRechazoTicket !== null}
        onOpenChange={(v) => { if (!v) setModalRechazoTicket(null); }}
      />
      <AsignacionModal
        ticket={modalAsignacionTicket}
        open={modalAsignacionTicket !== null}
        tecnicos={tecnicos}
        cargaTecnicos={cargaTecnicos}
        onOpenChange={(v) => { if (!v) setModalAsignacionTicket(null); }}
      />
      <TraspasoModal
        ticket={modalTraspasoTicket}
        open={modalTraspasoTicket !== null}
        tecnicos={tecnicos}
        onOpenChange={(v) => { if (!v) setModalTraspasoTicket(null); }}
      />
      <ReabrirModal
        ticket={modalReabrirTicket}
        open={modalReabrirTicket !== null}
        onOpenChange={(v) => { if (!v) setModalReabrirTicket(null); }}
      />
    </AppLayout>
  );
}
