import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { AlertTriangle, ChevronDown, ChevronRight, History, FileText, Trash2 } from 'lucide-react';
import ClasificacionBadge from './ClasificacionBadge';
import ArchivoAdjunto from './ArchivoAdjunto';

const clasificaciones = [
  { value: 'penal', label: 'Penal' },
  { value: 'civil', label: 'Civil' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'sin_indicios', label: 'Sin Indicios' },
  { value: 'medida_correctiva', label: 'Medida Correctiva' },
  { value: 'archivado', label: 'Archivado' },
];

interface ArchivoSimulado {
  nombre: string;
  tamano?: string;
  fecha_subida?: string;
}

interface InformeData {
  clasificacion: string | null;
  fojas: number | null;
  justificacion: string | null;
  archivos: ArchivoSimulado[];
  redactado_at: string | null;
  concluido_por: string | null;
  ediciones: Array<{ fecha: string; cambios: string[]; usuario: string }>;
  eliminado: boolean;
  fecha_eliminacion: string | null;
}

interface FormInformeFinalProps {
  ticket: string;
  informe: InformeData | null;
  tecnicoNombre: string;
  canAct: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function FormInformeFinal({ ticket, informe, tecnicoNombre, canAct, onEdit, onDelete }: FormInformeFinalProps) {
  const [openHistorial, setOpenHistorial] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isEditing = informe && !informe.eliminado && informe.clasificacion && informe.redactado_at;
  const showForm = canAct && (!isEditing || (informe && !informe.eliminado));

  if (!showForm && !informe) {
    return (
      <div className="text-sm text-muted-foreground italic py-4">Sin informe redactado.</div>
    );
  }

  return (
    <div className="space-y-5">
      {isEditing ? (
        <InformePreview
          informe={informe}
          tecnicoNombre={tecnicoNombre}
          canAct={canAct}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : canAct ? (
        <InformeForm
          ticket={ticket}
          informe={informe}
          tecnicoNombre={tecnicoNombre}
          processing={processing}
          setProcessing={setProcessing}
        />
      ) : null}

      {informe && !informe.eliminado && informe.ediciones && informe.ediciones.length > 0 && (
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
              Historial de cambios ({informe.ediciones.length})
            </button>
            {openHistorial && (
              <div className="mt-2 space-y-2">
                {informe.ediciones.map((ed, i) => (
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

function InformePreview({ informe, canAct, onEdit, onDelete }: {
  informe: InformeData;
  tecnicoNombre: string;
  canAct: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Informe Final</span>
          <ClasificacionBadge clasificacion={informe.clasificacion} />
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
          <span className="text-muted-foreground">Fojas:</span>
          <p className="font-medium">{informe.fojas}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Redactado por:</span>
          <p className="font-medium">{informe.concluido_por || '—'}</p>
        </div>
      </div>

      {informe.redactado_at && (
        <p className="text-xs text-muted-foreground">
          Redactado: {new Date(informe.redactado_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      )}

      {informe.justificacion && (
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">Justificación</h5>
          <p className="text-sm whitespace-pre-wrap break-words bg-muted/50 rounded-lg px-3 py-2">{informe.justificacion}</p>
        </div>
      )}

      {informe.archivos && informe.archivos.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">Archivos adjuntos ({informe.archivos.length})</h5>
          <div className="space-y-1">
            {informe.archivos.map((a, i) => (
              <ArchivoAdjunto key={i} nombre={a.nombre} tamano={a.tamano} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InformeForm({ ticket, informe, tecnicoNombre, processing, setProcessing }: {
  ticket: string;
  informe: InformeData | null;
  tecnicoNombre: string;
  processing: boolean;
  setProcessing: (v: boolean) => void;
}) {
  const [clasificacion, setClasificacion] = useState(informe?.clasificacion || '');
  const [fojas, setFojas] = useState(informe?.fojas?.toString() || '');
  const [justificacion, setJustificacion] = useState(informe?.justificacion || '');
  const [concluidoPor, setConcluidoPor] = useState(informe?.concluido_por || tecnicoNombre);
  const [archivos, setArchivos] = useState<ArchivoSimulado[]>(informe?.archivos || []);

  useEffect(() => {
    if (informe) {
      setClasificacion(informe.clasificacion || '');
      setFojas(informe.fojas?.toString() || '');
      setJustificacion(informe.justificacion || '');
      setConcluidoPor(informe.concluido_por || tecnicoNombre);
      setArchivos(informe.archivos || []);
    } else {
      setClasificacion('');
      setFojas('');
      setJustificacion('');
      setConcluidoPor(tecnicoNombre);
      setArchivos([]);
    }
  }, [informe, tecnicoNombre]);

  const canSubmit = clasificacion && parseInt(fojas) > 0 && justificacion.trim().length >= 20 && concluidoPor.trim().length >= 2;
  const isEdit = informe && informe.clasificacion;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    const routeName = isEdit ? 'denuncias.informe.editar' : 'denuncias.informe.guardar';
    router.post(
      route(routeName, { ticket }),
      {
        clasificacion,
        fojas: parseInt(fojas),
        justificacion,
        concluido_por: concluidoPor,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(isEdit ? 'Informe actualizado' : 'Informe redactado');
          setProcessing(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al guardar informe');
          setProcessing(false);
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{isEdit ? 'Editar Informe Final' : 'Redactar Informe Final'}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clasificacion" className="after:content-['*'] after:text-destructive after:ml-0.5">Clasificación</Label>
        <Select value={clasificacion} onValueChange={setClasificacion}>
          <SelectTrigger id="clasificacion">
            <SelectValue placeholder="Seleccione clasificación" />
          </SelectTrigger>
          <SelectContent>
            {clasificaciones.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fojas" className="after:content-['*'] after:text-destructive after:ml-0.5">Número de Fojas</Label>
        <Input
          id="fojas"
          type="number"
          min={1}
          max={9999}
          value={fojas}
          onChange={(e) => setFojas(e.target.value)}
          placeholder="Ej: 45"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="concluido-por" className="after:content-['*'] after:text-destructive after:ml-0.5">Concluido por</Label>
        <Input
          id="concluido-por"
          value={concluidoPor}
          onChange={(e) => setConcluidoPor(e.target.value)}
          placeholder="Nombre del responsable"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="justificacion" className="after:content-['*'] after:text-destructive after:ml-0.5">Justificación</Label>
        <Textarea
          id="justificacion"
          value={justificacion}
          onChange={(e) => setJustificacion(e.target.value)}
          rows={4}
          maxLength={5000}
          placeholder="Explique los fundamentos del informe final..."
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">{justificacion.length}/5000</p>
          {justificacion.length > 0 && justificacion.trim().length < 20 && (
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
          onClick={() => setArchivos([...archivos, { nombre: `documento_${archivos.length + 1}.pdf`, tamano: '1.2 MB', fecha_subida: new Date().toISOString() }])}
        >
          + Agregar archivo
        </Button>
      </div>

      <Button disabled={processing || !canSubmit} onClick={handleSubmit} className="w-full">
        {processing ? 'Procesando...' : isEdit ? 'Actualizar Informe' : 'Guardar Informe'}
      </Button>
    </div>
  );
}
