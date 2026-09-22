import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import ModalNuevaSolicitud from '@/Components/Denuncias/Modales/Investigacion/ModalNuevaSolicitud';
import ModalResponderSolicitud from '@/Components/Denuncias/Modales/Investigacion/ModalResponderSolicitud';
import ModalAmpliarSolicitud from '@/Components/Denuncias/Modales/Investigacion/ModalAmpliarSolicitud';
import ModalNotificarDescargo from '@/Components/Denuncias/Modales/Investigacion/ModalNotificarDescargo';
import ModalResponderDescargo from '@/Components/Denuncias/Modales/Investigacion/ModalResponderDescargo';
import ModalAmpliarDescargo from '@/Components/Denuncias/Modales/Investigacion/ModalAmpliarDescargo';
import ModalCancelarSolicitud from '@/Components/Denuncias/Modales/Investigacion/ModalCancelarSolicitud';
import ModalNuevoDescargo from '@/Components/Denuncias/Modales/Investigacion/ModalNuevoDescargo';
import ModalCancelarDescargo from '@/Components/Denuncias/Modales/Investigacion/ModalCancelarDescargo';
import ModalConfirmarEliminar from '@/Components/Denuncias/Shared/ConfirmDialog';
import ModalArchivosDelCaso from '@/Components/Denuncias/Modales/General/ModalArchivosDelCaso';
import type { Denuncia, Solicitud, Descargo } from './tipos';

interface MisCasosModalesProps {
  modalNuevaSolTicket: string | null;
  setModalNuevaSolTicket: (ticket: string | null) => void;
  modalEditarSol: Solicitud | null;
  setModalEditarSol: (solicitud: Solicitud | null) => void;
  modalRespondeSolId: number | null;
  setModalRespondeSolId: (id: number | null) => void;
  modalAmpliaSolId: number | null;
  setModalAmpliaSolId: (id: number | null) => void;
  modalNotificarDescId: number | null;
  setModalNotificarDescId: (id: number | null) => void;
  modalRespDescId: number | null;
  setModalRespDescId: (id: number | null) => void;
  modalAmpliaDescId: number | null;
  setModalAmpliaDescId: (id: number | null) => void;
  modalCancelarSolId: number | null;
  setModalCancelarSolId: (id: number | null) => void;
  modalCancelarDescId: number | null;
  setModalCancelarDescId: (id: number | null) => void;
  modalNuevoDescTicket: string | null;
  setModalNuevoDescTicket: (ticket: string | null) => void;
  modalEditarDesc: Descargo | null;
  setModalEditarDesc: (descargo: Descargo | null) => void;
  modalEliminarSol: { id: number; nombre: string } | null;
  setModalEliminarSol: (item: { id: number; nombre: string } | null) => void;
  modalEliminarDesc: { id: number; nombre: string } | null;
  setModalEliminarDesc: (item: { id: number; nombre: string } | null) => void;
  processingEliminar: boolean;
  setProcessingEliminar: (processing: boolean) => void;
  modalArchivosTicket: string | null;
  setModalArchivosTicket: (ticket: string | null) => void;
  selectedDenuncia: Denuncia | null;
}

export default function MisCasosModales({ modalNuevaSolTicket, setModalNuevaSolTicket, modalEditarSol, setModalEditarSol, modalRespondeSolId, setModalRespondeSolId, modalAmpliaSolId, setModalAmpliaSolId, modalNotificarDescId, setModalNotificarDescId, modalRespDescId, setModalRespDescId, modalAmpliaDescId, setModalAmpliaDescId, modalCancelarSolId, setModalCancelarSolId, modalCancelarDescId, setModalCancelarDescId, modalNuevoDescTicket, setModalNuevoDescTicket, modalEditarDesc, setModalEditarDesc, modalEliminarSol, setModalEliminarSol, modalEliminarDesc, setModalEliminarDesc, processingEliminar, setProcessingEliminar, modalArchivosTicket, setModalArchivosTicket, selectedDenuncia }: MisCasosModalesProps) {
  return (
    <>
      {/* Sprint 4 modales */}
      <ModalNuevaSolicitud
        ticket={modalEditarSol ? modalEditarSol.ticket : modalNuevaSolTicket}
        solicitudToEdit={modalEditarSol}
        open={modalNuevaSolTicket !== null || modalEditarSol !== null}
        onOpenChange={(v) => { if (!v) { setModalNuevaSolTicket(null); setModalEditarSol(null); } }}
      />
      <ModalResponderSolicitud
        solicitudId={modalRespondeSolId}
        open={modalRespondeSolId !== null}
        onOpenChange={(v) => { if (!v) setModalRespondeSolId(null); }}
      />
      <ModalAmpliarSolicitud
        solicitudId={modalAmpliaSolId}
        open={modalAmpliaSolId !== null}
        onOpenChange={(v) => { if (!v) setModalAmpliaSolId(null); }}
      />
      <ModalNotificarDescargo
        descargoId={modalNotificarDescId}
        open={modalNotificarDescId !== null}
        onOpenChange={(v) => { if (!v) setModalNotificarDescId(null); }}
      />
      <ModalResponderDescargo
        descargoId={modalRespDescId}
        open={modalRespDescId !== null}
        onOpenChange={(v) => { if (!v) setModalRespDescId(null); }}
      />
      <ModalAmpliarDescargo
        descargoId={modalAmpliaDescId}
        open={modalAmpliaDescId !== null}
        onOpenChange={(v) => { if (!v) setModalAmpliaDescId(null); }}
      />
      <ModalCancelarSolicitud
        solicitudId={modalCancelarSolId}
        open={modalCancelarSolId !== null}
        onOpenChange={(v: boolean) => { if (!v) setModalCancelarSolId(null); }}
      />
      <ModalCancelarDescargo
        descargoId={modalCancelarDescId}
        open={modalCancelarDescId !== null}
        onOpenChange={(v: boolean) => { if (!v) setModalCancelarDescId(null); }}
      />
      <ModalNuevoDescargo
        ticket={modalEditarDesc ? modalEditarDesc.ticket : modalNuevoDescTicket}
        denunciados={selectedDenuncia?.denunciados || []}
        descargoToEdit={modalEditarDesc}
        open={modalNuevoDescTicket !== null || modalEditarDesc !== null}
        onOpenChange={(v: boolean) => { if (!v) { setModalNuevoDescTicket(null); setModalEditarDesc(null); } }}
      />
      <ModalConfirmarEliminar
        open={modalEliminarSol !== null}
        onOpenChange={(v) => { if (!v) setModalEliminarSol(null); }}
        onConfirm={() => {
          if (!modalEliminarSol) return;
          setProcessingEliminar(true);
          router.post(route('denuncias.solicitudes.eliminar', { id: modalEliminarSol.id }), {}, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Solicitud eliminada correctamente'); setModalEliminarSol(null); setProcessingEliminar(false); },
            onError: () => { toast.error('Error al eliminar solicitud'); setProcessingEliminar(false); },
            onFinish: () => setProcessingEliminar(false),
          });
        }}
        titulo="¿Eliminar solicitud?"
        descripcion="Esta solicitud se ocultará de la lista. Los datos se conservarán para auditoría."
        itemNombre={modalEliminarSol?.nombre || ''}
        processing={processingEliminar}
      />
      <ModalConfirmarEliminar
        open={modalEliminarDesc !== null}
        onOpenChange={(v) => { if (!v) setModalEliminarDesc(null); }}
        onConfirm={() => {
          if (!modalEliminarDesc) return;
          setProcessingEliminar(true);
          router.post(route('denuncias.descargos.eliminar', { id: modalEliminarDesc.id }), {}, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Descargo eliminado correctamente'); setModalEliminarDesc(null); setProcessingEliminar(false); },
            onError: () => { toast.error('Error al eliminar descargo'); setProcessingEliminar(false); },
            onFinish: () => setProcessingEliminar(false),
          });
        }}
        titulo="¿Eliminar descargo?"
        descripcion="Este descargo se ocultará de la lista. Los datos se conservarán para auditoría."
        itemNombre={modalEliminarDesc?.nombre || ''}
        processing={processingEliminar}
      />
      <ModalArchivosDelCaso
        ticket={modalArchivosTicket}
        open={modalArchivosTicket !== null}
        onOpenChange={(v) => { if (!v) setModalArchivosTicket(null); }}
      />
    </>
  );
}
