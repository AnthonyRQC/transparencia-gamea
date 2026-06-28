import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Separator } from '@/Components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import PlazoBadge from './PlazoBadge';
import TipoDenunciaBadge from './TipoDenunciaBadge';
import TabSolicitudes from './TabSolicitudes';
import TabDescargos from './TabDescargos';
import TabInformeCierre from './TabInformeCierre';
import { CheckCircle2, History, UserPlus, ArrowRightLeft, RotateCcw, XCircle, X as XIcon, FileSearch, UserX, FileText, ScrollText } from 'lucide-react';

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

interface ArchivoSimulado {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
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
  // Sprint 5 — Informe Final y Cierre
  informe_clasificacion?: string | null;
  informe_fojas?: number | null;
  informe_justificacion?: string | null;
  informe_archivos?: ArchivoSimulado[];
  informe_redactado_at?: string | null;
  informe_concluido_por?: string | null;
  informe_ediciones?: Array<{ fecha: string; cambios: string[]; usuario: string }>;
  informe_eliminado?: boolean;
  informe_fecha_eliminacion?: string | null;
  cierre_sitpreco?: string | null;
  cierre_notificado_denunciante?: boolean | null;
  cierre_notificacion_medio?: string | null;
  cierre_notificacion_fecha?: string | null;
  cierre_notificacion_descripcion?: string | null;
  cierre_no_notificado_motivo?: string | null;
  cierre_concluido_por?: string | null;
  cierre_descripcion?: string | null;
  cierre_archivos?: ArchivoSimulado[];
  cierre_cerrado_at?: string | null;
  cierre_ediciones?: Array<{ fecha: string; cambios: string[]; usuario: string }>;
  cierre_eliminado?: boolean;
  cierre_fecha_eliminacion?: string | null;
}

interface Solicitud {
  id: number;
  ticket: string;
  unidad_destino: string;
  detalle: string;
  fecha_envio: string;
  fecha_vencimiento: string;
  estado: string;
  archivos?: Array<{ nombre: string; tamano?: string; fecha_subida?: string }>;
}

interface Descargo {
  id: number;
  ticket: string;
  denunciado_idx: number;
  nombres_denunciado: string;
  dependencia_denunciado?: string;
  fecha_notificacion?: string | null;
  medio?: string | null;
  fecha_vencimiento?: string | null;
  estado: string;
  resumen_descargo?: string | null;
  documentos?: Array<{ nombre: string; tamano?: string; fecha_subida?: string }>;
}

interface DenunciaSheetProps {
  denuncia: DenunciaDetail | null;
  plazo: PlazoInfo | null;
  tecnicos?: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  tecnicoNombre?: string;

  // Sprint 4 props
  solicitudes?: Solicitud[];
  descargos?: Descargo[];
  canAct?: boolean;
  onNuevaSolicitud?: (ticket: string) => void;
  onResponderSolicitud?: (id: number) => void;
  onAmpliarSolicitud?: (id: number) => void;
  onCancelarSolicitud?: (id: number) => void;
  onEditarSolicitud?: (id: number) => void;
  onEliminarSolicitud?: (id: number) => void;
  onNotificarDescargo?: (id: number) => void;
  onResponderDescargo?: (id: number) => void;
  onAmpliarDescargo?: (id: number) => void;
  onNuevoDescargo?: (ticket: string) => void;
  onEditarDescargo?: (id: number) => void;
  onEliminarDescargo?: (id: number) => void;
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
  saltar_fase: <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
};

function formatDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

const estadosConTabs = ['asignada', 'investigacion', 'informe', 'cerrada'];

export default function DenunciaSheet({
  denuncia, plazo, tecnicos, open, onOpenChange, children, tecnicoNombre,
  solicitudes = [], descargos = [], canAct = false,
  onNuevaSolicitud, onResponderSolicitud, onAmpliarSolicitud, onCancelarSolicitud,
  onEditarSolicitud, onEliminarSolicitud,
  onNotificarDescargo, onResponderDescargo, onAmpliarDescargo, onNuevoDescargo,
  onEditarDescargo, onEliminarDescargo,
}: DenunciaSheetProps) {
  if (!denuncia) return null;

  const fecha = formatDate(denuncia.created_at);
  const tecnicoInfo = denuncia.tecnico && tecnicos ? tecnicos[denuncia.tecnico] : null;
  const tecnicoAnteriorInfo = denuncia.tecnico_anterior && tecnicos ? tecnicos[denuncia.tecnico_anterior] : null;
  const hechos = denuncia.hechos || '';
  const bitacora = denuncia.bitacora?.slice().reverse() || [];
  const showTabs = estadosConTabs.includes(denuncia.estado);

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

        {showTabs ? (
          <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
            <TabsList className="shrink-0 justify-start gap-0 bg-transparent border-b border-border rounded-none h-auto p-0">
              <TabsTrigger value="info" className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2">
                Información
              </TabsTrigger>
              <TabsTrigger value="solicitudes" className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2">
                Solicitudes {solicitudes.length > 0 && `(${solicitudes.length})`}
              </TabsTrigger>
              <TabsTrigger value="descargos" className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2">
                Descargos {descargos.length > 0 && `(${descargos.length})`}
              </TabsTrigger>
              {(denuncia.estado === 'informe' || denuncia.estado === 'cerrada') && (
                <TabsTrigger value="informe_cierre" className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2">
                  <ScrollText className="w-3.5 h-3.5 mr-1" />
                  Informe y Cierre
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="info" className="flex-1 overflow-y-auto py-4 space-y-5 mt-0 data-[state=inactive]:hidden">
              <SheetInfoContent denuncia={denuncia} hechos={hechos} tecnicoInfo={tecnicoInfo} tecnicoAnteriorInfo={tecnicoAnteriorInfo} bitacora={bitacora} formatDate={formatDate} />
            </TabsContent>

            <TabsContent value="solicitudes" className="flex-1 overflow-y-auto py-4 mt-0 data-[state=inactive]:hidden">
              {!canAct && (
                <p className="text-xs text-muted-foreground mb-3 italic">Modo lectura — use MisCasos con 'Ver como:' para actuar.</p>
              )}
              <TabSolicitudes
                solicitudes={solicitudes}
                canAct={canAct}
                ticket={denuncia.ticket}
                onNuevaSolicitud={onNuevaSolicitud}
                onResponder={onResponderSolicitud}
                onAmpliar={onAmpliarSolicitud}
                onCancelar={onCancelarSolicitud}
                onEditar={onEditarSolicitud}
                onEliminar={onEliminarSolicitud}
              />
            </TabsContent>

            <TabsContent value="descargos" className="flex-1 overflow-y-auto py-4 mt-0 data-[state=inactive]:hidden">
              {!canAct && (
                <p className="text-xs text-muted-foreground mb-3 italic">Modo lectura — use MisCasos con 'Ver como:' para actuar.</p>
              )}
              <TabDescargos
                descargos={descargos}
                canAct={canAct}
                ticket={denuncia.ticket}
                denunciados={denuncia.denunciados || []}
                onNotificar={onNotificarDescargo}
                onResponder={onResponderDescargo}
                onAmpliar={onAmpliarDescargo}
                onNuevoDescargo={onNuevoDescargo}
                onEditar={onEditarDescargo}
                onEliminar={onEliminarDescargo}
              />
            </TabsContent>

            {(denuncia.estado === 'informe' || denuncia.estado === 'cerrada') && (
              <TabsContent value="informe_cierre" className="flex-1 overflow-y-auto py-4 mt-0 data-[state=inactive]:hidden">
                {!canAct && (
                  <p className="text-xs text-muted-foreground mb-3 italic">Modo lectura — use MisCasos con 'Ver como:' para actuar.</p>
                )}
                <TabInformeCierre
                  denuncia={denuncia}
                  tecnicoNombre={tecnicoNombre || '—'}
                  canAct={canAct}
                />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            <SheetInfoContent denuncia={denuncia} hechos={hechos} tecnicoInfo={tecnicoInfo} tecnicoAnteriorInfo={tecnicoAnteriorInfo} bitacora={bitacora} formatDate={formatDate} />
          </div>
        )}

        {children && (
          <div className="shrink-0 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
            {children}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SheetInfoContent({ denuncia, hechos, tecnicoInfo, tecnicoAnteriorInfo, bitacora, formatDate }: {
  denuncia: DenunciaDetail;
  hechos: string;
  tecnicoInfo: { color: string; iniciales: string; nombre: string } | null;
  tecnicoAnteriorInfo: { color: string; iniciales: string; nombre: string } | null;
  bitacora: BitacoraEntry[];
  formatDate: (d?: string) => string;
}) {
  return (
    <>
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

      {hechos && (
        <>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Relación de Hechos</h4>
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{hechos}</p>
          </section>
          <Separator />
        </>
      )}

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
                  <TooltipContent side="top">Ver carga de trabajo</TooltipContent>
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
    </>
  );
}
