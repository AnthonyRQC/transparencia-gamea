import { useState, useCallback, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { FilePlus2 } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/Components/Layout/AppLayout';
import { Separator } from '@/Components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import SeccionEncabezado from '@/Components/Denuncias/SeccionEncabezado';
import SeccionConfidencialidad from '@/Components/Denuncias/SeccionConfidencialidad';
import SeccionDenunciante from '@/Components/Denuncias/SeccionDenunciante';
import BloqueDenunciado, { createDenunciadoItem } from '@/Components/Denuncias/BloqueDenunciado';
import SeccionDetalles from '@/Components/Denuncias/SeccionDetalles';
import SeccionRelacionHechos from '@/Components/Denuncias/SeccionRelacionHechos';
import BloquePrueba, { createPruebaItem } from '@/Components/Denuncias/BloquePrueba';
import PieFormulario from '@/Components/Denuncias/PieFormulario';
import FormularioAcompaniamiento from '@/Components/Denuncias/FormularioAcompaniamiento';
import FormularioIntervencion from '@/Components/Denuncias/FormularioIntervencion';
import ModalExito from '@/Components/Denuncias/ModalExito';
import ProgressBar from '@/Components/Denuncias/ProgressBar';
import StickyFooter from '@/Components/Denuncias/StickyFooter';
import ModalConfirmar from '@/Components/Denuncias/ModalConfirmar';

interface DenuncianteData {
    nombres: string;
    ci: string;
    email: string;
    telefono: string;
}

interface DetallesData {
    categoria: string;
    categoria_otro: string;
    fecha: string;
    hora: string;
    lugar: string;
}

interface FormState {
    tipo: string;
    escenario: string;
    denunciante: DenuncianteData;
    denunciados: ReturnType<typeof createDenunciadoItem>[];
    detalles: DetallesData;
    hechos: string;
    pruebas: ReturnType<typeof createPruebaItem>[];
    declaracion_jurada: boolean;
    // Simple form fields (flat at root for backend compatibility)
    nombres: string;
    ci: string;
    dependencia_funcionario: string;
    motivo: string;
    resolucion: string;
    dependencia_observada: string;
    referencia_nota: string;
    archivo: string;
    archivo_data: string;
}

const initialDenunciante: DenuncianteData = { nombres: '', ci: '', email: '', telefono: '' };
const initialDetalles: DetallesData = { categoria: '', categoria_otro: '', fecha: '', hora: '', lugar: '' };

const initialForm: FormState = {
    tipo: '',
    escenario: 'revelada',
    denunciante: { ...initialDenunciante },
    denunciados: [createDenunciadoItem()],
    detalles: { ...initialDetalles },
    hechos: '',
    pruebas: [],
    declaracion_jurada: false,
    nombres: '',
    ci: '',
    dependencia_funcionario: '',
    motivo: '',
    resolucion: '',
    dependencia_observada: '',
    referencia_nota: '',
    archivo: '',
    archivo_data: '',
};

const staticErrors: Record<string, string> = {};
const staticCategorias: Record<string, string> = {};

export default function RegistroDenuncia() {
    const { categorias = staticCategorias, errors: serverErrors = staticErrors, success, ticket: successTicket } = usePage().props as unknown as {
        categorias: Record<string, string>;
        errors: Record<string, string>;
        success?: boolean;
        ticket?: string;
    };

    const [form, setForm] = useState<FormState>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [ticket, setTicket] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (success && successTicket) {
            setTicket(successTicket);
            setShowSuccess(true);
            setForm(initialForm);
            toast.success(`Denuncia N° ${successTicket} registrada exitosamente`);
        }
    }, [success, successTicket]);

    // Funciones temporales para llenar el formulario con datos ficticios
    const fillCorrupcion = () => {
        setErrors({});
        setForm({
            tipo: 'corrupcion',
            escenario: 'revelada',
            denunciante: {
                nombres: 'Juan Pérez Mamani',
                ci: '1234567',
                email: 'juan.perez@gmail.com',
                telefono: '71234567',
            },
            denunciados: [
                {
                    id: 'mock-den-1',
                    conoce_identidad: true,
                    nombres: 'Ing. René Choque Vilca',
                    dependencia: 'Jefe de Unidad de Adquisiciones',
                    descripcion: '',
                }
            ],
            detalles: {
                categoria: 'cohecho',
                categoria_otro: '',
                fecha: new Date().toISOString().split('T')[0],
                hora: '10:30',
                lugar: 'Edificio Central GAMEA, Piso 3',
            },
            hechos: 'El funcionario público en cuestión solicitó una comisión del 10% en efectivo para agilizar el pago de las planillas correspondientes a la construcción de la jardinera central de la Avenida 6 de Marzo, bajo amenaza de retrasar la firma del informe de conformidad.',
            pruebas: [
                {
                    id: 'mock-prb-1',
                    tipo: 'testigo',
                    archivo_nombre: '',
                    archivo_data: '',
                    descripcion: 'El señor asistente de almacén presenció el momento en que se exigió el dinero.',
                    testigo_nombre: 'Pedro Quispe Callisaya',
                    testigo_telefono: '60123456',
                },
                {
                    id: 'mock-prb-2',
                    tipo: 'archivo',
                    archivo_nombre: 'conversacion_whatsapp.pdf',
                    archivo_data: 'data:application/pdf;base64,MOCK_PDF_DATA',
                    descripcion: 'Capturas de pantalla del chat de WhatsApp donde se menciona el porcentaje.',
                    testigo_nombre: '',
                    testigo_telefono: '',
                }
            ],
            declaracion_jurada: true,
            nombres: '',
            ci: '',
            dependencia_funcionario: '',
            motivo: '',
            resolucion: '',
            dependencia_observada: '',
            referencia_nota: '',
            archivo: '',
            archivo_data: '',
        });
        toast.info('Formulario de Corrupción cargado con datos de demostración');
    };

    const fillNegacion = () => {
        setErrors({});
        setForm({
            tipo: 'negacion',
            escenario: 'anonimo',
            denunciante: {
                nombres: '',
                ci: '',
                email: 'ciudadano.alto@gmail.com',
                telefono: '78912345',
            },
            denunciados: [
                {
                    id: 'mock-den-1',
                    conoce_identidad: true,
                    nombres: 'Dra. María Laura Miranda',
                    dependencia: 'Responsable de la Dirección de Recursos Humanos',
                    descripcion: '',
                }
            ],
            detalles: {
                categoria: 'incumplimiento',
                categoria_otro: '',
                fecha: new Date().toISOString().split('T')[0],
                hora: '14:15',
                lugar: 'Oficina de Recursos Humanos - Jach\'a Uta',
            },
            hechos: 'Se solicitó formalmente el reporte de planillas y designaciones de personal eventual mediante nota recibida el 05 de junio. Habiendo transcurrido los plazos legales, la responsable se niega a recibir la solicitud de insistencia y argumenta verbalmente que dicha información es confidencial sin sustento legal alguno.',
            pruebas: [
                {
                    id: 'mock-prb-1',
                    tipo: 'archivo',
                    archivo_nombre: 'solicitud_recibida.pdf',
                    archivo_data: 'data:application/pdf;base64,MOCK_PDF_DATA',
                    descripcion: 'Copia digitalizada de la nota de solicitud inicial con sello de recepción y fecha visible.',
                    testigo_nombre: '',
                    testigo_telefono: '',
                }
            ],
            declaracion_jurada: true,
            nombres: '',
            ci: '',
            dependencia_funcionario: '',
            motivo: '',
            resolucion: '',
            dependencia_observada: '',
            referencia_nota: '',
            archivo: '',
            archivo_data: '',
        });
        toast.info('Formulario de Negación de Información cargado con datos de demostración');
    };

    const fillAcompaniamiento = () => {
        setErrors({});
        setForm({
            tipo: 'acompaniamiento',
            escenario: 'revelada',
            denunciante: { ...initialDenunciante },
            denunciados: [createDenunciadoItem()],
            detalles: { ...initialDetalles },
            hechos: '',
            pruebas: [],
            declaracion_jurada: true,
            nombres: 'Carlos Condori Ticona',
            ci: '8765432',
            dependencia_funcionario: 'Secretaría de Movilidad Urbana - Técnico Evaluador de Líneas',
            motivo: 'El ciudadano manifiesta que lleva esperando más de 3 meses por la homologación de su ruta de transporte sindical, siendo que el trámite cuenta con todos los informes técnicos favorables y se encuentra estancado sin justificación.',
            resolucion: 'Se realizó la mediación presencial. El técnico se comprometió a remitir la carpeta para firma del Secretario en el plazo máximo de 48 horas bajo acta de compromiso suscrita.',
            dependencia_observada: '',
            referencia_nota: '',
            archivo: '',
            archivo_data: '',
        });
        toast.info('Formulario de Acompañamiento cargado con datos de demostración');
    };

    const fillIntervencion = () => {
        setErrors({});
        setForm({
            tipo: 'intervencion',
            escenario: 'revelada',
            denunciante: { ...initialDenunciante },
            denunciados: [createDenunciadoItem()],
            detalles: { ...initialDetalles },
            hechos: '',
            pruebas: [],
            declaracion_jurada: true,
            nombres: '',
            ci: '',
            dependencia_funcionario: '',
            motivo: 'Se evidencia que de forma sistemática se está solicitando a los contribuyentes fotocopias de documentos de identidad vigentes de gestiones pasadas que ya constan digitalizados en la base de datos de Ruat, contraviniendo el principio de desburocratización y simplificación de trámites.',
            resolucion: '',
            dependencia_observada: 'Dirección de Recaudaciones - Sección Patentes',
            referencia_nota: 'REF: NOTA-UTLCC-2026-042',
            archivo: 'informe_inspeccion_patentes.pdf',
            archivo_data: 'data:application/pdf;base64,MOCK_PDF_DATA',
        });
        toast.info('Formulario de Intervención cargado con datos de demostración');
    };

    const isComplejo = form.tipo === 'corrupcion' || form.tipo === 'negacion';

    const updateField = useCallback((section: string, field: string, value: unknown) => {
        setForm((prev) => {
            if (section === 'denunciante') {
                return { ...prev, denunciante: { ...prev.denunciante, [field]: value as string } };
            }
            if (section === 'detalles') {
                return { ...prev, detalles: { ...prev.detalles, [field]: value as string } };
            }
            if (section === 'denunciados') {
                return { ...prev, denunciados: value as FormState['denunciados'] };
            }
            if (section === 'pruebas') {
                return { ...prev, pruebas: value as FormState['pruebas'] };
            }
            return { ...prev, [field]: value };
        });
    }, []);

    const handleSubmit = useCallback(() => {
        setSubmitting(true);
        setErrors({});

        router.post(
            route('denuncias.store'),
            { ...form, declaracion_jurada: form.declaracion_jurada ? 1 : 0 } as any,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitting(false);
                },
                onError: (errs) => {
                    setSubmitting(false);
                    setErrors(errs as Record<string, string>);
                    const firstError = document.querySelector('[class*="border-destructive"]');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                },
                onFinish: () => setSubmitting(false),
            }
        );
    }, [form]);

    const progressFields = useMemo(() => {
        if (!isComplejo) {
            if (form.tipo === 'acompaniamiento') {
                const total = 5;
                let completed = 0;
                if (form.nombres.length >= 2) completed += 1;
                if (form.dependencia_funcionario.length >= 2) completed += 1;
                if (form.motivo.length >= 20) completed += 1;
                if (form.resolucion.length >= 10) completed += 1;
                if (form.declaracion_jurada) completed += 1;
                return { total, completed };
            }
            if (form.tipo === 'intervencion') {
                const total = 5;
                let completed = 0;
                if (form.dependencia_observada.length >= 2) completed += 1;
                if (form.referencia_nota.length >= 2) completed += 1;
                if (form.motivo.length >= 20) completed += 1;
                if (form.archivo.length > 0) completed += 1;
                if (form.declaracion_jurada) completed += 1;
                return { total, completed };
            }
            return { total: 0, completed: 0 };
        }

        let total = 0;
        let completed = 0;

        total += 1;
        if (form.escenario) completed += 1;

        if (form.escenario !== 'anonimo') {
            total += 4;
            if (form.denunciante.nombres.length >= 2) completed += 1;
            if (form.denunciante.ci.length >= 6) completed += 1;
            if (form.denunciante.email.includes('@')) completed += 1;
            if (form.denunciante.telefono.length === 8) completed += 1;
        } else {
            total += 1;
            if (form.denunciante.email?.includes('@') || form.denunciante.telefono?.length === 8) completed += 1;
        }

        total += 1;
        if (form.denunciados.length > 0) {
            const first = form.denunciados[0];
            if (first.conoce_identidad) {
                if (first.nombres.length >= 2 && first.dependencia.length >= 2) completed += 1;
            } else {
                if (first.descripcion.length >= 2) completed += 1;
            }
        }

        total += 3;
        if (form.detalles.categoria) completed += 1;
        if (form.detalles.fecha) completed += 1;
        if (form.detalles.lugar.length >= 2) completed += 1;

        total += 1;
        if (form.hechos.length >= 20) completed += 1;

        total += 1;
        if (form.declaracion_jurada) completed += 1;

        return { total, completed };
    }, [form, isComplejo]);

    const percent = progressFields.total > 0
        ? Math.round((progressFields.completed / progressFields.total) * 100)
        : 0;

    const sectionClasses = 'border-l-2 border-sidebar-accent/40 hover:border-sidebar-accent transition-all duration-200 pl-4 space-y-4';

    if (showSuccess && ticket) {
        return (
            <AppLayout>
                <Head title="Registrar Denuncia — Transparencia UTLCC" />
                <ModalExito ticket={ticket} onClose={() => setShowSuccess(false)} />
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-muted-foreground">Denuncia registrada. Puede registrar otra desde el menú lateral.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            headerBottom={
                form.tipo ? (
                    <ProgressBar
                        percent={percent}
                        totalFields={progressFields.total}
                        completedFields={progressFields.completed}
                    />
                ) : null
            }
        >
            <Head title="Registrar Denuncia — Transparencia UTLCC" />

            <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-2">
                    <FilePlus2 className="w-7 h-7 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Registrar Denuncia</h1>
                </div>
                <p className="text-muted-foreground">
                    Complete el formulario correspondiente al tipo de denuncia.
                </p>
            </div>

            <div className={`max-w-4xl mx-auto w-full space-y-6 ${form.tipo ? 'pb-20' : ''}`}>
                
                {/* Demo filling tools (temporal) */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 shadow-sm animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Modo Demostración (Llenado Rápido)
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Complete instantáneamente cualquiera de las variantes del formulario con información ficticia.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={fillCorrupcion}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 transition-all duration-200 cursor-pointer shadow-2xs"
                            >
                                ⚡ Corrupción
                            </button>
                            <button
                                type="button"
                                onClick={fillNegacion}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 transition-all duration-200 cursor-pointer shadow-2xs"
                            >
                                ⚡ Negación
                            </button>
                            <button
                                type="button"
                                onClick={fillAcompaniamiento}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 transition-all duration-200 cursor-pointer shadow-2xs"
                            >
                                ⚡ Acompañamiento
                            </button>
                            <button
                                type="button"
                                onClick={fillIntervencion}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 transition-all duration-200 cursor-pointer shadow-2xs"
                            >
                                ⚡ Intervención
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-xs p-5 sm:p-6 md:p-8 space-y-6">
                    {/* Tipo selector */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-foreground">
                                Tipo de Denuncia <span className="text-destructive">*</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <Select
                                    value={form.tipo}
                                    onValueChange={(v) => setForm((prev) => ({ ...prev, tipo: v }))}
                                >
                                    <SelectTrigger className={errors.tipo ? 'border-destructive/50' : ''}>
                                        <SelectValue placeholder="Seleccionar tipo de denuncia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="corrupcion">Corrupción (hasta 45 días)</SelectItem>
                                        <SelectItem value="negacion">Negación de Información (hasta 20 días)</SelectItem>
                                        <SelectItem value="acompaniamiento">Acompañamiento (resolución en el momento)</SelectItem>
                                        <SelectItem value="intervencion">Intervención / Medida Correctiva</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {errors.tipo && (
                            <p className="text-xs text-destructive font-medium">{errors.tipo}</p>
                        )}

                        {/* Info plazos */}
                        {!form.tipo && (
                            <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 leading-relaxed">
                                <strong>Plazos según Ley 974:</strong> Corrupción: hasta 45 días · Negación: hasta 20 días ·
                                Acompañamiento: resolución en el momento · Intervención: según evaluación
                            </div>
                        )}
                    </div>

                    {form.tipo && <Separator className="my-2" />}

                    {/* Formulario Complejo */}
                    {isComplejo && (
                        <div className="space-y-6">
                            <div className={sectionClasses}>
                                <p className="text-[10px] font-semibold text-sidebar-accent uppercase tracking-widest">Encabezado</p>
                                <SeccionEncabezado />
                            </div>

                            <div className={sectionClasses}>
                                <p className="text-[10px] font-semibold text-sidebar-accent uppercase tracking-widest">Confidencialidad</p>
                                <SeccionConfidencialidad
                                    value={form.escenario}
                                    onChange={(v) => setForm((prev) => ({ ...prev, escenario: v }))}
                                    error={errors.escenario}
                                />
                            </div>

                            <div className={sectionClasses}>
                                <p className="text-[10px] font-semibold text-sidebar-accent uppercase tracking-widest">Denunciante</p>
                                <SeccionDenunciante
                                    escenario={form.escenario}
                                    data={form.denunciante}
                                    onChange={(f, v) => updateField('denunciante', f, v)}
                                    errors={errors}
                                />
                            </div>

                            <div className={sectionClasses}>
                                <p className="text-[10px] font-semibold text-sidebar-accent uppercase tracking-widest">Denunciado(s)</p>
                                <BloqueDenunciado
                                    items={form.denunciados}
                                    onChange={(v) => updateField('denunciados', 'items', v)}
                                    errors={errors}
                                />
                            </div>

                            <div className={sectionClasses}>
                                <p className="text-[10px] font-semibold text-sidebar-accent uppercase tracking-widest">Detalles del Incidente</p>
                                <SeccionDetalles
                                    data={form.detalles}
                                    onChange={(f, v) => updateField('detalles', f, v)}
                                    categorias={categorias}
                                    errors={errors}
                                />
                            </div>

                            <div className={sectionClasses}>
                                <p className="text-[10px] font-semibold text-sidebar-accent uppercase tracking-widest">Relación de Hechos</p>
                                <SeccionRelacionHechos
                                    value={form.hechos}
                                    onChange={(v) => setForm((prev) => ({ ...prev, hechos: v }))}
                                    error={errors.hechos}
                                />
                            </div>

                            <div className={sectionClasses}>
                                <p className="text-[10px] font-semibold text-sidebar-accent uppercase tracking-widest">Pruebas / Testigos</p>
                                <BloquePrueba
                                    items={form.pruebas}
                                    onChange={(v) => updateField('pruebas', 'items', v)}
                                    errors={errors}
                                />
                            </div>

                            <div className={sectionClasses}>
                                <p className="text-[10px] font-semibold text-sidebar-accent uppercase tracking-widest">Declaración y Envío</p>
                                <PieFormulario
                                    declaracionJurada={form.declaracion_jurada}
                                    onDeclaracionChange={(v) => setForm((prev) => ({ ...prev, declaracion_jurada: v }))}
                                    onSubmit={handleSubmit}
                                    submitDisabled={!form.tipo || !form.declaracion_jurada}
                                    submitting={submitting}
                                    error={errors.declaracion_jurada}
                                />
                            </div>
                        </div>
                    )}

                    {/* Formulario Acompañamiento */}
                    {form.tipo === 'acompaniamiento' && (
                        <div className="space-y-4">
                            <div className={sectionClasses}>
                                <FormularioAcompaniamiento
                                    data={{
                                        nombres: form.nombres,
                                        ci: form.ci,
                                        dependencia_funcionario: form.dependencia_funcionario,
                                        motivo: form.motivo,
                                        resolucion: form.resolucion,
                                    }}
                                    onChange={(f, v) => setForm((prev) => ({ ...prev, [f]: v }))}
                                    errors={errors}
                                />
                            </div>
                            <Separator />
                            <PieFormulario
                                declaracionJurada={form.declaracion_jurada}
                                onDeclaracionChange={(v) => setForm((prev) => ({ ...prev, declaracion_jurada: v }))}
                                onSubmit={handleSubmit}
                                submitDisabled={!form.tipo || !form.declaracion_jurada}
                                submitting={submitting}
                            />
                        </div>
                    )}

                    {/* Formulario Intervención */}
                    {form.tipo === 'intervencion' && (
                        <div className="space-y-4">
                            <div className={sectionClasses}>
                                <FormularioIntervencion
                                    data={{
                                        dependencia_observada: form.dependencia_observada,
                                        referencia_nota: form.referencia_nota,
                                        motivo: form.motivo,
                                        archivo: form.archivo,
                                        archivo_data: form.archivo_data,
                                    }}
                                    onChange={(f, v) => setForm((prev) => ({ ...prev, [f]: v }))}
                                    errors={errors}
                                />
                            </div>
                            <Separator />
                            <PieFormulario
                                declaracionJurada={form.declaracion_jurada}
                                onDeclaracionChange={(v) => setForm((prev) => ({ ...prev, declaracion_jurada: v }))}
                                onSubmit={handleSubmit}
                                submitDisabled={!form.tipo || !form.declaracion_jurada}
                                submitting={submitting}
                            />
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                {form.tipo && (
                    <StickyFooter
                        onCancel={() => setShowCancelConfirm(true)}
                        onSubmit={handleSubmit}
                        submitDisabled={!form.tipo || !form.declaracion_jurada}
                    />
                )}
            </div>

            <ModalConfirmar
                isOpen={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onConfirm={() => {
                    setForm(initialForm);
                    toast.info('Formulario cancelado y restablecido');
                }}
            />
        </AppLayout>
    );
}
