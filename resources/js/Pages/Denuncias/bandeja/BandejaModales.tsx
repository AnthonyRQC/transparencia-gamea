import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import ModalAdmision from '@/Components/Denuncias/Modales/Admision/ModalAdmision';
import ModalRechazo from '@/Components/Denuncias/Modales/Admision/ModalRechazo';
import AsignacionModal from '@/Components/Denuncias/Modales/Flujo/AsignacionModal';
import TraspasoModal from '@/Components/Denuncias/Modales/Flujo/TraspasoModal';
import ReabrirModal from '@/Components/Denuncias/Modales/Flujo/ReabrirModal';
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
import ModalAmpliacionPlazo from '@/Components/Denuncias/Modales/Flujo/ModalAmpliacionPlazo';
import ModalDelegarEvaluacion from '@/Components/Denuncias/Modales/Flujo/ModalDelegarEvaluacion';
import ModalEditarDenuncia from '@/Components/Denuncias/Modales/Flujo/ModalEditarDenuncia';
import ModalArchivosDelCaso from '@/Components/Denuncias/Modales/General/ModalArchivosDelCaso';
import ModalConciliarFechas from '@/Components/Denuncias/Modales/General/ModalConciliarFechas';
import ModalConfirmar from '@/Components/Denuncias/Shared/ConfirmDialog';
import type { Denuncia, Solicitud, Descargo } from './tipos';

interface BandejaModalesProps {
  modalAdmisionTicket: string | null;
  setModalAdmisionTicket: (ticket: string | null) => void;
  modalRechazoTicket: string | null;
  setModalRechazoTicket: (ticket: string | null) => void;
  modalAsignacionTicket: string | null;
  setModalAsignacionTicket: (ticket: string | null) => void;
  modalTraspasoTicket: string | null;
  setModalTraspasoTicket: (ticket: string | null) => void;
  investigadorActualId: string | number | null;
  modalReabrirTicket: string | null;
  setModalReabrirTicket: (ticket: string | null) => void;
  modalNuevaSolTicket: string | null;
  setModalNuevaSolTicket: (ticket: string | null) => void;
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
  modalEditarSol: Solicitud | null;
  setModalEditarSol: (solicitud: Solicitud | null) => void;
  modalEliminarSol: { id: number; nombre: string } | null;
  setModalEliminarSol: (item: { id: number; nombre: string } | null) => void;
  modalEditarDesc: Descargo | null;
  setModalEditarDesc: (descargo: Descargo | null) => void;
  modalEliminarDesc: { id: number; nombre: string } | null;
  setModalEliminarDesc: (item: { id: number; nombre: string } | null) => void;
  processingEliminar: boolean;
  setProcessingEliminar: (processing: boolean) => void;
  modalAmpliarPlazoDenuncia: Denuncia | null;
  setModalAmpliarPlazoDenuncia: (denuncia: Denuncia | null) => void;
  modalArchivosTicket: string | null;
  setModalArchivosTicket: (ticket: string | null) => void;
  modalConciliarDenuncia: Denuncia | null;
  setModalConciliarDenuncia: (denuncia: Denuncia | null) => void;
  modalDelegarEvaluacionTicket: string | null;
  setModalDelegarEvaluacionTicket: (ticket: string | null) => void;
  modalReasumirEvaluacionTicket: string | null;
  setModalReasumirEvaluacionTicket: (ticket: string | null) => void;
  modalEditarDenuncia: Denuncia | null;
  setModalEditarDenuncia: (denuncia: Denuncia | null) => void;
  modalEliminarDenunciaTicket: string | null;
  setModalEliminarDenunciaTicket: (ticket: string | null) => void;
  setSelectedDenuncia: (denuncia: Denuncia | null) => void;
  selectedDenuncia: Denuncia | null;
  investigadores: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  cargaInvestigadores?: Array<{ id: string; nombre: string; iniciales: string; color: string; activos: number; por_vencer: number; vencidos: number }>;
}

export default function BandejaModales({ modalAdmisionTicket, setModalAdmisionTicket, modalRechazoTicket, setModalRechazoTicket, modalAsignacionTicket, setModalAsignacionTicket, modalTraspasoTicket, setModalTraspasoTicket, investigadorActualId, modalReabrirTicket, setModalReabrirTicket, modalNuevaSolTicket, setModalNuevaSolTicket, modalRespondeSolId, setModalRespondeSolId, modalAmpliaSolId, setModalAmpliaSolId, modalNotificarDescId, setModalNotificarDescId, modalRespDescId, setModalRespDescId, modalAmpliaDescId, setModalAmpliaDescId, modalCancelarSolId, setModalCancelarSolId, modalCancelarDescId, setModalCancelarDescId, modalNuevoDescTicket, setModalNuevoDescTicket, modalEditarSol, setModalEditarSol, modalEliminarSol, setModalEliminarSol, modalEditarDesc, setModalEditarDesc, modalEliminarDesc, setModalEliminarDesc, processingEliminar, setProcessingEliminar, modalAmpliarPlazoDenuncia, setModalAmpliarPlazoDenuncia, modalArchivosTicket, setModalArchivosTicket, modalConciliarDenuncia, setModalConciliarDenuncia, modalDelegarEvaluacionTicket, setModalDelegarEvaluacionTicket, modalReasumirEvaluacionTicket, setModalReasumirEvaluacionTicket, modalEditarDenuncia, setModalEditarDenuncia, modalEliminarDenunciaTicket, setModalEliminarDenunciaTicket, setSelectedDenuncia, selectedDenuncia, investigadores, cargaInvestigadores }: BandejaModalesProps) {
  return (
    <>
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
        investigadores={investigadores}
        cargaInvestigadores={cargaInvestigadores}
        onOpenChange={(v) => { if (!v) setModalAsignacionTicket(null); }}
      />
      <TraspasoModal
        ticket={modalTraspasoTicket}
        investigadorActualId={investigadorActualId}
        open={modalTraspasoTicket !== null}
        investigadores={investigadores}
        cargaInvestigadores={cargaInvestigadores}
        onOpenChange={(v) => { if (!v) setModalTraspasoTicket(null); }}
      />
      <ReabrirModal
        ticket={modalReabrirTicket}
        open={modalReabrirTicket !== null}
        onOpenChange={(v) => { if (!v) setModalReabrirTicket(null); }}
      />
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
      <ModalAmpliacionPlazo
        denuncia={modalAmpliarPlazoDenuncia}
        open={modalAmpliarPlazoDenuncia !== null}
        onOpenChange={(v) => { if (!v) setModalAmpliarPlazoDenuncia(null); }}
        investigadores={investigadores}
      />
      <ModalArchivosDelCaso
        ticket={modalArchivosTicket}
        open={modalArchivosTicket !== null}
        onOpenChange={(v) => { if (!v) setModalArchivosTicket(null); }}
      />
      <ModalConciliarFechas
        ticket={modalConciliarDenuncia?.ticket ?? null}
        denuncia={modalConciliarDenuncia}
        open={modalConciliarDenuncia !== null}
        onOpenChange={(v) => { if (!v) setModalConciliarDenuncia(null); }}
      />
      <ModalDelegarEvaluacion
        ticket={modalDelegarEvaluacionTicket}
        open={modalDelegarEvaluacionTicket !== null}
        onOpenChange={(v) => { if (!v) setModalDelegarEvaluacionTicket(null); }}
        investigadores={investigadores}
        cargaInvestigadores={cargaInvestigadores}
      />
      <ModalConfirmar
        variant="confirm"
        open={modalReasumirEvaluacionTicket !== null}
        onOpenChange={(v) => { if (!v) setModalReasumirEvaluacionTicket(null); }}
        onConfirm={() => {
          if (!modalReasumirEvaluacionTicket) return;
          const ticket = modalReasumirEvaluacionTicket;
          setModalReasumirEvaluacionTicket(null);
          router.post(route('denuncias.reasumir-evaluacion', { ticket }), {}, {
            preserveScroll: true,
            onSuccess: () => {
              toast.success('Evaluación reasumida correctamente');
            },
            onError: () => toast.error('Error al reasumir evaluación'),
          });
        }}
        titulo="¿Reasumir evaluación?"
        descripcion="El investigador ya no tendrá esta delegación. La denuncia volverá a 'Por admitir'."
        confirmText="Sí, reasumir"
        cancelText="Cancelar"
      />

      <ModalEditarDenuncia
        denuncia={modalEditarDenuncia as any}
        open={modalEditarDenuncia !== null}
        onOpenChange={(v) => { if (!v) setModalEditarDenuncia(null); }}
      />

      <ModalConfirmar
        variant="confirm"
        open={modalEliminarDenunciaTicket !== null}
        onOpenChange={(v) => { if (!v) setModalEliminarDenunciaTicket(null); }}
        onConfirm={() => {
          if (!modalEliminarDenunciaTicket) return;
          const ticket = modalEliminarDenunciaTicket;
          setModalEliminarDenunciaTicket(null);
          setSelectedDenuncia(null);
          router.post(route('denuncias.eliminar', { ticket }), {}, {
            preserveScroll: false,
            onSuccess: () => {
              toast.success(`Denuncia ${ticket} eliminada correctamente`);
              router.reload();
            },
            onError: () => toast.error('Error al eliminar denuncia'),
          });
        }}
        titulo="¿Eliminar denuncia?"
        descripcion="Esta denuncia se ocultará del sistema. Los datos se conservarán para auditoría."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
