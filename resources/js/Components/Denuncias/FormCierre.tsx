import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { AlertTriangle, ChevronDown, ChevronRight, History, Archive, Trash2 } from 'lucide-react';
import ArchivoAdjunto from './ArchivoAdjunto';

const mediosNotificacion = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Correo Electrónico' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'otro', label: 'Otro' },
];

interface ArchivoSimulado {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface CierreData {
  sitpreco: string | null;
  notificado_denunciante: boolean | null;
  notificacion_medio: string | null;
  notificacion_fecha: string | null;
  notificacion_descripcion: string | null;
  no_notificado_motivo: string | null;
  concluido_por: string | null;
  descripcion: string | null;
  archivos: ArchivoSimulado[];
  cerrado_at: string | null;
  ediciones: Array<{ fecha: string; cambios: string[]; usuario: string }>;
  eliminado: boolean;
  fecha_eliminacion: string | null;
}

interface FormCierreProps {
  ticket: string;
  cierre: CierreData | null;
  informeExiste: boolean;
  tecnicoNombre: string;
  canAct: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function FormCierre({ ticket, cierre, informeExiste, tecnicoNombre, canAct, onEdit, onDelete }: FormCierreProps) {
  const [openHistorial, setOpenHistorial] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isClosed = cierre && !cierre.eliminado && cierre.cerrado_at;
  const showForm = canAct && informeExiste && !isClosed;

  if (!informeExiste && !isClosed) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-800 dark:text-amber-300">
          <p className="font-semibold">⚠️ Falta redactar el Informe Final</p>
          <p className="mt-1">Debe redactar el Informe Final antes de cerrar el caso.</p>
        </div>
      </div>
    );
  }

  if (!showForm && !cierre) {
    return (
      <div className="text-sm text-muted-foreground italic py-4">Sin cierre registrado.</div>
    );
  }

  return (
    <div className="space-y-5">
      {isClosed ? (
        <CierrePreview
          cierre={cierre}
          canAct={canAct}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : canAct ? (
        <CierreForm
          ticket={ticket}
          cierre={cierre}
          tecnicoNombre={tecnicoNombre}
          processing={processing}
          setProcessing={setProcessing}
        />
      ) : null}

      {cierre && !cierre.eliminado && cierre.ediciones && cierre.ediciones.length > 0 && (
        <>
          <Separator />
          <section>
            <button
              type="button"
              onClick={() => setOpenHistorial(!openHistorial)}
              className="w-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {openHistorial ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <History className="w-3.5 h-3.5" />
              Historial de cambios ({cierre.ediciones.length})
            </button>
            {openHistorial && (
              <div className="mt-2 space-y-2">
                {cierre.ediciones.map((ed, i) => (
                  <div key={i} className="text-sm bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(ed.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {ed.usuario !== 'sistema' ? ` — ${ed.usuario}` : ''}
                    </p>
                    {ed.cambios.map((c, j) => (
                      <p key={j} className="text-xs mt-0.5">{c}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function CierrePreview({ cierre, canAct, onEdit, onDelete }: {
  cierre: CierreData;
  canAct: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Cierre</span>
        </div>
        {canAct && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">SITPRECO:</span>
          <p className="font-mono text-xs font-medium">{cierre.sitpreco || '—'}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Concluido por:</span>
          <p className="font-medium">{cierre.concluido_por || '—'}</p>
        </div>
      </div>

      {cierre.cerrado_at && (
        <p className="text-xs text-muted-foreground">
          Cerrado: {new Date(cierre.cerrado_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      )}

      <div>
        <h5 className="text-xs font-semibold text-muted-foreground mb-1">Notificación al denunciante</h5>
        {cierre.notificado_denunciante ? (
          <div className="text-sm bg-muted/50 rounded-lg px-3 py-2 space-y-1">
            <p><span className="text-muted-foreground">Medio:</span> {cierre.notificacion_medio || '—'}</p>
            {cierre.notificacion_fecha && <p><span className="text-muted-foreground">Fecha:</span> {new Date(cierre.notificacion_fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>}
            {cierre.notificacion_descripcion && <p><span className="text-muted-foreground">Detalle:</span> {cierre.notificacion_descripcion}</p>}
          </div>
        ) : (
          <div className="text-sm bg-muted/50 rounded-lg px-3 py-2 space-y-1">
            <p className="text-muted-foreground italic">No se notificó al denunciante.</p>
            {cierre.no_notificado_motivo && <p><span className="text-muted-foreground">Motivo:</span> {cierre.no_notificado_motivo}</p>}
          </div>
        )}
      </div>

      {cierre.descripcion && (
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">Descripción del cierre</h5>
          <p className="text-sm whitespace-pre-wrap break-words bg-muted/50 rounded-lg px-3 py-2">{cierre.descripcion}</p>
        </div>
      )}

      {cierre.archivos && cierre.archivos.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">Archivos adjuntos ({cierre.archivos.length})</h5>
          <div className="space-y-1">
            {cierre.archivos.map((a, i) => (
              <ArchivoAdjunto key={i} nombre={a.nombre} tamano={a.tamano} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CierreForm({ ticket, cierre, tecnicoNombre, processing, setProcessing }: {
  ticket: string;
  cierre: CierreData | null;
  tecnicoNombre: string;
  processing: boolean;
  setProcessing: (v: boolean) => void;
}) {
  const [sitpreco, setSitpreco] = useState(cierre?.sitpreco || '');
  const [notificadoDenunciante, setNotificadoDenunciante] = useState(cierre?.notificado_denunciante ?? true);
  const [notificacionMedio, setNotificacionMedio] = useState(cierre?.notificacion_medio || '');
  const [notificacionFecha, setNotificacionFecha] = useState(cierre?.notificacion_fecha || '');
  const [notificacionDescripcion, setNotificacionDescripcion] = useState(cierre?.notificacion_descripcion || '');
  const [noNotificadoMotivo, setNoNotificadoMotivo] = useState(cierre?.no_notificado_motivo || '');
  const [concluidoPor, setConcluidoPor] = useState(cierre?.concluido_por || tecnicoNombre);
  const [descripcion, setDescripcion] = useState(cierre?.descripcion || '');
  const [archivos, setArchivos] = useState<ArchivoSimulado[]>(cierre?.archivos || []);

  useEffect(() => {
    if (cierre) {
      setSitpreco(cierre.sitpreco || '');
      setNotificadoDenunciante(cierre.notificado_denunciante ?? true);
      setNotificacionMedio(cierre.notificacion_medio || '');
      setNotificacionFecha(cierre.notificacion_fecha || '');
      setNotificacionDescripcion(cierre.notificacion_descripcion || '');
      setNoNotificadoMotivo(cierre.no_notificado_motivo || '');
      setConcluidoPor(cierre.concluido_por || tecnicoNombre);
      setDescripcion(cierre.descripcion || '');
      setArchivos(cierre.archivos || []);
    } else {
      setSitpreco('');
      setNotificadoDenunciante(true);
      setNotificacionMedio('');
      setNotificacionFecha('');
      setNotificacionDescripcion('');
      setNoNotificadoMotivo('');
      setConcluidoPor(tecnicoNombre);
      setDescripcion('');
      setArchivos([]);
    }
  }, [cierre, tecnicoNombre]);

  const canSubmit = notificadoDenunciante
    ? concluidoPor.trim().length >= 2 && descripcion.trim().length >= 20 && notificacionMedio && notificacionFecha && notificacionDescripcion.trim().length >= 10
    : concluidoPor.trim().length >= 2 && descripcion.trim().length >= 20;

  const isEdit = cierre && cierre.cerrado_at;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    const routeName = isEdit ? 'denuncias.cierre.editar' : 'denuncias.cierre.guardar';
    router.post(
      route(routeName, { ticket }),
      {
        sitpreco: sitpreco || null,
        notificado_denunciante: notificadoDenunciante,
        notificacion_medio: notificadoDenunciante ? notificacionMedio : null,
        notificacion_fecha: notificadoDenunciante ? notificacionFecha : null,
        notificacion_descripcion: notificadoDenunciante ? notificacionDescripcion : null,
        no_notificado_motivo: notificadoDenunciante ? null : noNotificadoMotivo || null,
        concluido_por: concluidoPor,
        descripcion,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(isEdit ? 'Cierre actualizado' : 'Denuncia cerrada correctamente');
          setProcessing(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al guardar cierre');
          setProcessing(false);
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Archive className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{isEdit ? 'Editar Cierre' : 'Registrar Cierre'}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sitpreco">
          SITPRECO
          <span className="text-[10px] text-muted-foreground ml-1 font-normal">
            (opcional — código del sistema nacional de Bolivia)
          </span>
        </Label>
        <Input
          id="sitpreco"
          value={sitpreco}
          onChange={(e) => setSitpreco(e.target.value)}
          placeholder="Ej: SIT-UML-CC1-2026-0501"
          maxLength={50}
        />
        <p className="text-[11px] text-muted-foreground italic">
          ⚠️ Dato a coordinar con el cliente — actualmente campo opcional.
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <h5 className="text-xs font-semibold text-muted-foreground">Notificación al denunciante</h5>

        <div className="flex items-center gap-2">
          <Checkbox
            id="notificado"
            checked={notificadoDenunciante}
            onCheckedChange={(v) => setNotificadoDenunciante(v === true)}
          />
          <Label htmlFor="notificado" className="text-sm cursor-pointer">
            ¿Se notificó al denunciante?
          </Label>
        </div>

        {notificadoDenunciante ? (
          <div className="space-y-3 pl-6 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="medio" className="after:content-['*'] after:text-destructive after:ml-0.5">Medio</Label>
              <Select value={notificacionMedio} onValueChange={setNotificacionMedio}>
                <SelectTrigger id="medio">
                  <SelectValue placeholder="Seleccione medio" />
                </SelectTrigger>
                <SelectContent>
                  {mediosNotificacion.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha-notif" className="after:content-['*'] after:text-destructive after:ml-0.5">Fecha de notificación</Label>
              <Input
                id="fecha-notif"
                type="date"
                value={notificacionFecha}
                onChange={(e) => setNotificacionFecha(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc-notif" className="after:content-['*'] after:text-destructive after:ml-0.5">Descripción</Label>
              <Textarea
                id="desc-notif"
                value={notificacionDescripcion}
                onChange={(e) => setNotificacionDescripcion(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder="Ej: Notificado por WhatsApp al 7XXXXXXX..."
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">{notificacionDescripcion.length}/2000</p>
                {notificacionDescripcion.length > 0 && notificacionDescripcion.trim().length < 10 && (
                  <p className="text-[11px] text-destructive font-medium">Mínimo 10 caracteres</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="pl-6 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="motivo-no-notif">Motivo (opcional)</Label>
              <Textarea
                id="motivo-no-notif"
                value={noNotificadoMotivo}
                onChange={(e) => setNoNotificadoMotivo(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Ej: Denunciante anónimo sin datos de contacto..."
              />
              <p className="text-[11px] text-muted-foreground">{noNotificadoMotivo.length}/500</p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="concluido-cierre" className="after:content-['*'] after:text-destructive after:ml-0.5">Concluido por</Label>
        <Input
          id="concluido-cierre"
          value={concluidoPor}
          onChange={(e) => setConcluidoPor(e.target.value)}
          placeholder="Nombre del responsable"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion-cierre" className="after:content-['*'] after:text-destructive after:ml-0.5">Descripción del cierre</Label>
        <Textarea
          id="descripcion-cierre"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          maxLength={5000}
          placeholder="Explique los detalles del cierre del caso..."
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">{descripcion.length}/5000</p>
          {descripcion.length > 0 && descripcion.trim().length < 20 && (
            <p className="text-[11px] text-destructive font-medium">Mínimo 20 caracteres</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Archivos adjuntos</Label>
        <p className="text-[11px] text-muted-foreground">Los archivos se simulan en esta maqueta.</p>
        {archivos.map((a, i) => (
          <ArchivoAdjunto
            key={i}
            nombre={a.nombre}
            tamano={a.tamano}
            onEliminar={() => setArchivos(archivos.filter((_, j) => j !== i))}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setArchivos([...archivos, { nombre: `cierre_${archivos.length + 1}.pdf`, tamano: '1.2 MB', fecha_subida: new Date().toISOString() }])}
        >
          + Agregar archivo
        </Button>
      </div>

      <Button disabled={processing || !canSubmit} onClick={handleSubmit} className="w-full">
        {processing ? 'Procesando...' : isEdit ? 'Actualizar Cierre' : 'Cerrar Expediente'}
      </Button>
    </div>
  );
}
