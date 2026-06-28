import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { Separator } from '@/Components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import PlazoBadge from './PlazoBadge';
import TipoDenunciaBadge from './TipoDenunciaBadge';
import { CheckCircle2, History, UserPlus, ArrowRightLeft, RotateCcw, XCircle, X as XIcon } from 'lucide-react';

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

interface BitacoraEntry {
  fecha: string;
  accion: string;
  detalle: string;
  usuario: string;
}

interface DenunciaDetail {
  ticket: string;
  tipo: string;
  escenario?: string;
  denunciante?: { nombres?: string; ci?: string; email?: string; telefono?: string };
  denunciados?: Denunciado[];
  detalles?: { categoria?: string; fecha?: string; hora?: string; lugar?: string };
  hechos?: string;
  pruebas?: Prueba[];
  tecnico?: string | null;
  tecnico_anterior?: string | null;
  created_at: string;
  estado: string;
  subestado?: string | null;
  fecha_admitida?: string | null;
  fecha_rechazada?: string | null;
  justificacion_admision?: string | null;
  justificacion_rechazo?: string | null;
  fecha_asignada?: string | null;
  fecha_traspaso?: string | null;
  justificacion_traspaso?: string | null;
  fecha_reapertura?: string | null;
  justificacion_reapertura?: string | null;
  bitacora?: BitacoraEntry[];
}

interface DenunciaSheetProps {
  denuncia: DenunciaDetail | null;
  plazo: PlazoInfo | null;
  tecnicos?: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

const escenarioLabel: Record<string, string> = {
  revelada: 'Identidad Revelada',
  reservada: 'Identidad Reservada',
  anonimo: 'Anónimo',
};

const tipoPruebaLabel: Record<string, string> = {
  archivo: 'Archivo',
  fisica: 'Prueba Física',
  testigo: 'Testigo',
};

const accionIcon: Record<string, React.ReactNode> = {
  admitida: <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />,
  rechazada: <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />,
  asignada: <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
  traspaso: <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
  investigacion: <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
  reapertura: <RotateCcw className="w-3.5 h-3.5 text-primary" />,
};

function formatDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function DenunciaSheet({ denuncia, plazo, tecnicos, open, onOpenChange, children }: DenunciaSheetProps) {
  if (!denuncia) return null;

  const fecha = formatDate(denuncia.created_at);
  const tecnicoInfo = denuncia.tecnico && tecnicos ? tecnicos[denuncia.tecnico] : null;
  const tecnicoAnteriorInfo = denuncia.tecnico_anterior && tecnicos ? tecnicos[denuncia.tecnico_anterior] : null;
  const hechos = denuncia.hechos || '';
  const bitacora = denuncia.bitacora?.slice().reverse() || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader className="shrink-0">
          <div className="flex items-center gap-2 flex-wrap pr-6">
            <SheetTitle className="font-mono">{denuncia.ticket}</SheetTitle>
            <TipoDenunciaBadge tipo={denuncia.tipo} />
            <PlazoBadge plazo={plazo} />
          </div>
          <p className="text-sm text-muted-foreground">Ingresada: {fecha}</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Denunciante */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Denunciante</h4>
            {denuncia.escenario === 'anonimo' ? (
              <p className="text-sm font-medium">Anónimo</p>
            ) : (
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{denuncia.denunciante?.nombres || '—'}</p>
                  {denuncia.escenario && denuncia.escenario !== 'revelada' && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
                      {escenarioLabel[denuncia.escenario]}
                    </span>
                  )}
                </div>
                {denuncia.denunciante?.ci && <p className="text-muted-foreground">CI: {denuncia.denunciante.ci}</p>}
                {denuncia.denunciante?.email && <p className="text-muted-foreground">Email: {denuncia.denunciante.email}</p>}
                {denuncia.denunciante?.telefono && <p className="text-muted-foreground">Tel: {denuncia.denunciante.telefono}</p>}
              </div>
            )}
          </section>
          <Separator />

          {/* Denunciados */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Denunciado(s) {denuncia.denunciados ? `(${denuncia.denunciados.length})` : ''}
            </h4>
            {denuncia.denunciados?.map((d, i) => (
              <div key={i} className="text-sm space-y-0.5 mb-3 last:mb-0">
                {d.conoce_identidad ? (
                  <>
                    <p className="font-medium">{d.nombres || '—'}</p>
                    <p className="text-muted-foreground">{d.dependencia || '—'}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">No se conoce la identidad</p>
                )}
                {!d.conoce_identidad && d.descripcion && (
                  <p className="text-sm text-muted-foreground mt-0.5">{d.descripcion}</p>
                )}
              </div>
            )) || <p className="text-sm text-muted-foreground italic">Sin denunciados registrados</p>}
          </section>
          <Separator />

          {/* Detalles del Incidente */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Detalles del Incidente</h4>
            <div className="text-sm space-y-1">
              {denuncia.detalles?.categoria && <p><span className="text-muted-foreground">Categoría:</span> {denuncia.detalles.categoria}</p>}
              {denuncia.detalles?.fecha && <p><span className="text-muted-foreground">Fecha:</span> {denuncia.detalles.fecha}</p>}
              {denuncia.detalles?.hora && <p><span className="text-muted-foreground">Hora:</span> {denuncia.detalles.hora}</p>}
              {denuncia.detalles?.lugar && <p><span className="text-muted-foreground">Lugar:</span> {denuncia.detalles.lugar}</p>}
            </div>
          </section>
          <Separator />

          {/* Relación de Hechos */}
          {hechos && (
            <>
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Relación de Hechos</h4>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{hechos}</p>
              </section>
              <Separator />
            </>
          )}

          {/* Pruebas */}
          {denuncia.pruebas && denuncia.pruebas.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Pruebas / Testigos ({denuncia.pruebas.length})
              </h4>
              <div className="space-y-2">
                {denuncia.pruebas.map((p, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/70">
                        {tipoPruebaLabel[p.tipo] || p.tipo}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{p.descripcion}</p>
                    {p.tipo === 'testigo' && (
                      <p className="text-xs mt-1">
                        <span className="text-muted-foreground">Contacto:</span> {p.testigo_nombre} — {p.testigo_telefono}
                      </p>
                    )}
                    {p.archivo_nombre && (
                      <p className="text-xs mt-1">
                        <span className="text-muted-foreground">Archivo:</span> {p.archivo_nombre}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Admisión (Sprint 3) */}
          {denuncia.estado !== 'ingresada' && denuncia.fecha_admitida && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  Admisión
                </h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Fecha:</span> {formatDate(denuncia.fecha_admitida)}</p>
                  {denuncia.justificacion_admision && (
                    <p><span className="text-muted-foreground">Justificación:</span> {denuncia.justificacion_admision}</p>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Rechazo (Sprint 3) */}
          {denuncia.estado === 'rechazada' && denuncia.justificacion_rechazo && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <XIcon className="w-3.5 h-3.5 text-destructive" />
                  Rechazo
                </h4>
                <div className="text-sm space-y-1">
                  {denuncia.fecha_rechazada && <p><span className="text-muted-foreground">Fecha:</span> {formatDate(denuncia.fecha_rechazada)}</p>}
                  <p><span className="text-muted-foreground">Justificación:</span></p>
                  <p className="text-sm bg-muted/50 rounded-lg px-3 py-2">{denuncia.justificacion_rechazo}</p>
                </div>
              </section>
            </>
          )}

          {/* Técnico Asignado (Sprint 3 - mejorado) */}
          {tecnicoInfo && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Técnico Asignado
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`w-7 h-7 rounded-full ${tecnicoInfo.color} text-white text-[10px] font-bold flex items-center justify-center cursor-help`}>
                          {tecnicoInfo.iniciales}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Ver carga de trabajo
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div>
                    <p className="font-medium">{tecnicoInfo.nombre}</p>
                    {denuncia.fecha_asignada && (
                      <p className="text-[11px] text-muted-foreground">Asignado: {formatDate(denuncia.fecha_asignada)}</p>
                    )}
                  </div>
                </div>
                {tecnicoAnteriorInfo && denuncia.fecha_traspaso && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3" />
                    Traspasado desde {tecnicoAnteriorInfo.nombre} el {formatDate(denuncia.fecha_traspaso)}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Reapertura (Sprint 3) */}
          {denuncia.fecha_reapertura && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-primary" />
                  Reapertura
                </h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Fecha:</span> {formatDate(denuncia.fecha_reapertura)}</p>
                  {denuncia.justificacion_reapertura && (
                    <p><span className="text-muted-foreground">Justificación:</span> {denuncia.justificacion_reapertura}</p>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Bitácora (Sprint 3) */}
          {bitacora.length > 0 && (
            <>
              <Separator />
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-muted-foreground" />
                  Historial del caso ({bitacora.length})
                </h4>
                <div className="space-y-2">
                  {bitacora.map((entry, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <div className="mt-0.5 shrink-0">
                        {accionIcon[entry.accion] || <History className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.fecha)} {entry.usuario !== 'sistema' ? `— ${entry.usuario}` : ''}
                        </p>
                        <p className="text-sm">{entry.detalle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer actions */}
        {children && (
          <div className="shrink-0 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
            {children}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
