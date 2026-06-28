import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { FileText, Archive, Trash2 } from 'lucide-react';
import FormInformeFinal from './FormInformeFinal';
import FormCierre from './FormCierre';
import ModalConfirmarEliminar from './ModalConfirmarEliminar';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

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

interface DenunciaData {
  ticket: string;
  estado: string;
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

interface TabInformeCierreProps {
  denuncia: DenunciaData;
  tecnicoNombre?: string;
  canAct?: boolean;
}

export default function TabInformeCierre({ denuncia, tecnicoNombre = '—', canAct = false }: TabInformeCierreProps) {
  const [subTab, setSubTab] = useState('informe');
  const [processingEliminar, setProcessingEliminar] = useState(false);
  const [eliminarTarget, setEliminarTarget] = useState<'informe' | 'cierre' | null>(null);

  const informe: InformeData | null = denuncia.informe_clasificacion || denuncia.informe_redactado_at
    ? {
        clasificacion: denuncia.informe_clasificacion ?? null,
        fojas: denuncia.informe_fojas ?? null,
        justificacion: denuncia.informe_justificacion ?? null,
        archivos: denuncia.informe_archivos ?? [],
        redactado_at: denuncia.informe_redactado_at ?? null,
        concluido_por: denuncia.informe_concluido_por ?? null,
        ediciones: denuncia.informe_ediciones ?? [],
        eliminado: denuncia.informe_eliminado ?? false,
        fecha_eliminacion: denuncia.informe_fecha_eliminacion ?? null,
      }
    : null;

  const cierre: CierreData | null = denuncia.cierre_cerrado_at
    ? {
        sitpreco: denuncia.cierre_sitpreco ?? null,
        notificado_denunciante: denuncia.cierre_notificado_denunciante ?? null,
        notificacion_medio: denuncia.cierre_notificacion_medio ?? null,
        notificacion_fecha: denuncia.cierre_notificacion_fecha ?? null,
        notificacion_descripcion: denuncia.cierre_notificacion_descripcion ?? null,
        no_notificado_motivo: denuncia.cierre_no_notificado_motivo ?? null,
        concluido_por: denuncia.cierre_concluido_por ?? null,
        descripcion: denuncia.cierre_descripcion ?? null,
        archivos: denuncia.cierre_archivos ?? [],
        cerrado_at: denuncia.cierre_cerrado_at ?? null,
        ediciones: denuncia.cierre_ediciones ?? [],
        eliminado: denuncia.cierre_eliminado ?? false,
        fecha_eliminacion: denuncia.cierre_fecha_eliminacion ?? null,
      }
    : null;

  const handleEliminarConfirm = () => {
    if (!eliminarTarget) return;
    setProcessingEliminar(true);
    const routeName = eliminarTarget === 'informe' ? 'denuncias.informe.eliminar' : 'denuncias.cierre.eliminar';
    router.post(
      route(routeName, { ticket: denuncia.ticket }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(eliminarTarget === 'informe' ? 'Informe eliminado' : 'Cierre eliminado');
          setEliminarTarget(null);
          setProcessingEliminar(false);
        },
        onError: () => {
          toast.error('Error al eliminar');
          setProcessingEliminar(false);
        },
        onFinish: () => setProcessingEliminar(false),
      }
    );
  };

  return (
    <>
      <Tabs value={subTab} onValueChange={setSubTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="shrink-0 justify-start gap-0 bg-transparent border-b border-border rounded-none h-auto p-0">
          <TabsTrigger value="informe" className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Informe Final
          </TabsTrigger>
          <TabsTrigger value="cierre" className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2">
            <Archive className="w-3.5 h-3.5 mr-1.5" />
            Cierre
          </TabsTrigger>
        </TabsList>

        <TabsContent value="informe" className="flex-1 overflow-y-auto py-4 mt-0 data-[state=inactive]:hidden space-y-4">
          {informe?.eliminado && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <Trash2 className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-xs text-destructive">
                <p className="font-semibold">Informe eliminado</p>
                {informe.fecha_eliminacion && <p className="mt-0.5">Eliminado: {new Date(informe.fecha_eliminacion).toLocaleDateString('es-BO')}</p>}
              </div>
            </div>
          )}

          <FormInformeFinal
            ticket={denuncia.ticket}
            informe={informe}
            tecnicoNombre={tecnicoNombre}
            canAct={canAct && !denuncia.informe_eliminado}
            onEdit={() => {
              setSubTab('informe');
            }}
            onDelete={() => setEliminarTarget('informe')}
          />
        </TabsContent>

        <TabsContent value="cierre" className="flex-1 overflow-y-auto py-4 mt-0 data-[state=inactive]:hidden space-y-4">
          {cierre?.eliminado && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <Trash2 className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-xs text-destructive">
                <p className="font-semibold">Cierre eliminado</p>
                {cierre.fecha_eliminacion && <p className="mt-0.5">Eliminado: {new Date(cierre.fecha_eliminacion).toLocaleDateString('es-BO')}</p>}
              </div>
            </div>
          )}

          <FormCierre
            ticket={denuncia.ticket}
            cierre={cierre}
            informeExiste={!denuncia.informe_eliminado && (denuncia.informe_clasificacion !== null || denuncia.informe_redactado_at !== null)}
            tecnicoNombre={tecnicoNombre}
            canAct={canAct && !denuncia.cierre_eliminado}
            onEdit={() => {
              setSubTab('cierre');
            }}
            onDelete={() => setEliminarTarget('cierre')}
          />
        </TabsContent>
      </Tabs>

      <ModalConfirmarEliminar
        open={eliminarTarget !== null}
        onOpenChange={(v) => { if (!v) setEliminarTarget(null); }}
        onConfirm={handleEliminarConfirm}
        titulo={eliminarTarget === 'informe' ? '¿Eliminar Informe Final?' : '¿Eliminar Cierre?'}
        descripcion={eliminarTarget === 'informe'
          ? 'El informe se ocultará de la lista. Los datos se conservarán para auditoría.'
          : 'El cierre se eliminará (soft delete). La denuncia volverá a estado Informe Final.'}
        itemNombre={eliminarTarget === 'informe' ? denuncia.ticket : denuncia.ticket}
        processing={processingEliminar}
      />
    </>
  );
}
