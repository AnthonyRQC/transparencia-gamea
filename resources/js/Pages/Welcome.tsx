import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Search, 
    FileText, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Moon, 
    Sun, 
    ArrowRight, 
    LayoutDashboard, 
    Palette, 
    ShieldCheck, 
    Lock,
    HelpCircle,
    PhoneCall,
    Mail,
    FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface WelcomeProps {
    auth: {
        user?: any;
    };
    canLogin: boolean;
    canRegister: boolean;
}

// Estructura de tickets mock para simulación en la Fase 0
const MOCK_TICKETS = [
    {
        code: 'DEN-2026-0001',
        type: 'Corrupción',
        description: 'Presunto desvío de fondos destinados a refacciones escolares en la Unidad de Adquisiciones.',
        status: 'Cerrado',
        currentStep: 4,
        dateReceived: '10 de Mayo, 2026',
        lastUpdated: '12 de Junio, 2026',
        resolutionType: 'Sin Indicios / Archivado',
        advanceDetail: 'El expediente de investigación concluyó que no existen indicios suficientes de responsabilidad administrativa ni civil en contra del personal sindicado. Se emitió la resolución de archivo UTLCC-012/2026 de acuerdo con la normativa legal vigente, notificando a las partes y remitiendo copia digital al SITPRECO.',
        statusColor: 'green'
    },
    {
        code: 'DEN-2026-0002',
        type: 'Negación de Información',
        description: 'Negativa injustificada de entrega de informes financieros relativos a la construcción de la plaza distrital.',
        status: 'En Investigación',
        currentStep: 3,
        dateReceived: '18 de Junio, 2026',
        lastUpdated: '24 de Junio, 2026',
        resolutionType: 'Pendiente',
        advanceDetail: 'La denuncia fue admitida. Actualmente, el analista asignado se encuentra evaluando las pruebas y ha formalizado solicitudes de información complementaria a la Dirección Administrativa y Financiera, otorgando un plazo máximo de descargo hasta el 02 de Julio de 2026.',
        statusColor: 'purple'
    },
    {
        code: 'DEN-2026-0003',
        type: 'Corrupción',
        description: 'Cobro irregular de aranceles y comisiones en trámites de catastro técnico.',
        status: 'En Evaluación',
        currentStep: 2,
        dateReceived: '22 de Junio, 2026',
        lastUpdated: '23 de Junio, 2026',
        resolutionType: 'Pendiente',
        advanceDetail: 'El expediente está siendo evaluado por el Jefe de la Unidad para determinar su admisibilidad legal. Se está verificando que cumpla con los requisitos mínimos de competencia territorial y descripción clara de hechos. Plazo máximo estimado de admisión: 29 de Junio de 2026.',
        statusColor: 'yellow'
    },
    {
        code: 'DEN-2026-0004',
        type: 'Corrupción',
        description: 'Uso indebido de vehículos oficiales del municipio fuera de horarios y días laborales.',
        status: 'Recepción',
        currentStep: 1,
        dateReceived: '24 de Junio, 2026',
        lastUpdated: '24 de Junio, 2026',
        resolutionType: 'Pendiente',
        advanceDetail: 'Denuncia registrada de manera presencial en la ventanilla de transparencia. Se ha generado la versión digital del expediente y está en cola para la asignación inmediata de un analista técnico de la UTLCC.',
        statusColor: 'blue'
    }
];

export default function Welcome({ auth, canLogin, canRegister }: WelcomeProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedTicket, setSearchedTicket] = useState<typeof MOCK_TICKETS[0] | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchError, setSearchError] = useState('');
    
    // Modo oscuro local
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dark_mode') === 'true';
        }
        return false;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const handleToggleDarkMode = () => {
        const nextState = !isDarkMode;
        setIsDarkMode(nextState);
        localStorage.setItem('dark_mode', String(nextState));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim().toUpperCase();
        
        if (!trimmedQuery) {
            setSearchError('Por favor ingrese un código de ticket.');
            setSearchedTicket(null);
            setHasSearched(false);
            return;
        }

        const ticket = MOCK_TICKETS.find(t => t.code === trimmedQuery);
        
        setHasSearched(true);
        if (ticket) {
            setSearchedTicket(ticket);
            setSearchError('');
        } else {
            setSearchedTicket(null);
            setSearchError(`No se encontró ningún ticket con el código "${trimmedQuery}". Intente con: DEN-2026-0002`);
        }
    };

    const handleQuickSelect = (code: string) => {
        setSearchQuery(code);
        const ticket = MOCK_TICKETS.find(t => t.code === code);
        setHasSearched(true);
        if (ticket) {
            setSearchedTicket(ticket);
            setSearchError('');
        }
    };

    const steps = [
        { name: 'Recepción', desc: 'Registro de denuncia' },
        { name: 'Evaluación', desc: 'Análisis de admisibilidad' },
        { name: 'Investigación', desc: 'Búsqueda y análisis de pruebas' },
        { name: 'Resolución / Cierre', desc: 'Informe final y SITPRECO' }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col font-sans">
            <Head title="Seguimiento Ciudadano - Transparencia" />

            {/* Header Público */}
            <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-50 px-4 py-3 sm:px-8 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md shadow-primary/20 hover:scale-105 hover:rotate-3 transition-all cursor-pointer">
                        T
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">Portal de Transparencia</h1>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Unidad de Transparencia y Lucha Contra la Corrupción</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Botón Modo Oscuro */}
                    <button
                        onClick={handleToggleDarkMode}
                        className="p-2 rounded-lg bg-muted text-foreground border hover:bg-accent/15 transition-all duration-200 flex items-center justify-center cursor-pointer"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 text-secondary" /> : <Moon className="w-4 h-4 text-primary" />}
                    </button>

                    {/* Guía de Estilos (Ruta maqueta visible) */}
                    <Link
                        href={route('design-system')}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-muted transition-colors"
                    >
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Guía de Estilos
                    </Link>

                    {/* Links de Autenticación */}
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md shadow-primary/10 hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Panel de Control
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md shadow-primary/10 hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                        >
                            <Lock className="w-3.5 h-3.5" />
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 space-y-12">
                {/* Hero Section */}
                <section className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-xs text-secondary-foreground font-bold tracking-wide uppercase">
                        <ShieldCheck className="w-4 h-4 text-secondary" />
                        Trámite Transparente e Informativo
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                        Consulta el Estado de tu <span className="text-primary bg-clip-text">Denuncia</span>
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Ingresa el código único del ticket otorgado por la Unidad de Transparencia para conocer en qué fase de resolución se encuentra tu solicitud.
                    </p>
                </section>

                {/* Formulario de Búsqueda */}
                <section className="bg-card border rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden max-w-2xl mx-auto">
                    <div className="absolute left-0 top-0 w-2 h-full bg-primary" />
                    <form onSubmit={handleSearch} className="space-y-4">
                        <label htmlFor="ticket-search" className="block text-sm font-bold tracking-wide uppercase text-muted-foreground">
                            Código de Ticket Ciudadano
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="ticket-search"
                                    type="text"
                                    placeholder="Ej: DEN-2026-0002"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono font-bold tracking-wider text-base text-foreground"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                Consultar Estado
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>

                    {/* Accesos rápidos maqueta */}
                    <div className="mt-5 pt-4 border-t border-dashed flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            Tickets de prueba para la maqueta:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {MOCK_TICKETS.map(t => (
                                <button
                                    key={t.code}
                                    onClick={() => handleQuickSelect(t.code)}
                                    className="px-2.5 py-1 rounded bg-muted border border-border text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors cursor-pointer font-mono font-bold"
                                >
                                    {t.code}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Resultados de la Búsqueda */}
                {hasSearched && (
                    <div className="animate-fade-in space-y-6">
                        {searchError ? (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-5 rounded-2xl flex items-start gap-3 max-w-2xl mx-auto shadow-sm">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm">Código No Encontrado</h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{searchError}</p>
                                </div>
                            </div>
                        ) : (
                            searchedTicket && (
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {/* Cabecera del Expediente */}
                                    <div className="bg-card border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground font-mono font-bold">{searchedTicket.type}</span>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground">{searchedTicket.code}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    searchedTicket.status === 'Cerrado' 
                                                        ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' 
                                                        : searchedTicket.status === 'En Investigación'
                                                        ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
                                                        : searchedTicket.status === 'En Evaluación'
                                                        ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400'
                                                        : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                                                }`}>
                                                    {searchedTicket.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{searchedTicket.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:flex md:flex-col md:text-right gap-3 text-xs border-t md:border-t-0 pt-3 md:pt-0">
                                            <div>
                                                <span className="text-muted-foreground block">Fecha Registro</span>
                                                <strong className="text-foreground">{searchedTicket.dateReceived}</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Última Actualización</span>
                                                <strong className="text-foreground">{searchedTicket.lastUpdated}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stepper Visual */}
                                    <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
                                        <h4 className="font-bold text-sm text-muted-foreground tracking-wide uppercase">Línea de Avance del Proceso</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                            {steps.map((step, idx) => {
                                                const stepNum = idx + 1;
                                                const isCompleted = stepNum < searchedTicket.currentStep;
                                                const isActive = stepNum === searchedTicket.currentStep;
                                                const isPending = stepNum > searchedTicket.currentStep;

                                                return (
                                                    <div key={idx} className="relative flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-3 group">
                                                        {/* Conector Lineal en Desktop */}
                                                        {idx < steps.length - 1 && (
                                                            <div className="hidden md:block absolute left-6 top-6 right-0 h-1 bg-border -z-10">
                                                                <div 
                                                                    className="h-full bg-primary transition-all duration-500" 
                                                                    style={{ 
                                                                        width: isCompleted ? '100%' : isActive ? '50%' : '0%' 
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Círculo del Indicador */}
                                                        <div className="relative">
                                                            {isCompleted ? (
                                                                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 scale-100">
                                                                    <CheckCircle2 className="w-6 h-6" />
                                                                </div>
                                                            ) : isActive ? (
                                                                <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg shadow-secondary/30 ring-4 ring-secondary/20 animate-pulse">
                                                                    <Clock className="w-6 h-6" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full border bg-background text-muted-foreground flex items-center justify-center">
                                                                    <span className="font-bold font-mono text-sm">{stepNum}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Textos del Paso */}
                                                        <div className="flex-1 md:mt-2 text-left">
                                                            <div className="flex items-center gap-1.5">
                                                                <h5 className={`font-bold text-sm ${isActive ? 'text-secondary-foreground' : isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                    {step.name}
                                                                </h5>
                                                                {isActive && (
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-snug mt-0.5">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Detalle Informativo */}
                                    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
                                        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-primary to-secondary" />
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <FileText className="w-4 h-4 text-primary" />
                                            Estado de Avance Oficial
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-sm sm:text-base leading-relaxed text-foreground bg-muted/30 border p-4 sm:p-5 rounded-xl font-medium">
                                                "{searchedTicket.advanceDetail}"
                                            </p>
                                            
                                            {searchedTicket.status === 'Cerrado' && (
                                                <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                    El trámite de este ticket ha finalizado formalmente.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Sección Informativa para el Ciudadano (Guía FAQ) */}
                <hr className="border-border" />
                <section className="space-y-6">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-center">Información y Preguntas Frecuentes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card border rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-base">Garantía de Confidencialidad</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                El sistema resguarda de manera encriptada y bajo estricto control administrativo los datos personales de todo denunciante que requiera reserva de identidad.
                            </p>
                        </div>

                        <div className="bg-card border rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-base">Tipos de Denuncia Permitidas</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Se atienden hechos concretos referidos a Corrupción (desvíos, cobros ilícitos) y Negación de Información Pública garantizando el derecho a la rendición de cuentas.
                            </p>
                        </div>

                        <div className="bg-card border rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-base">Plazos y Tiempos de Respuesta</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Las denuncias son evaluadas en un lapso máximo de 5 días hábiles. Las solicitudes de informe a dependencias externas gozan de 10 días hábiles.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Canales de Soporte */}
                <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h4 className="font-bold text-lg">¿Necesitas asistencia técnica o registrar una denuncia?</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">Puedes comunicarte con la ventanilla única de atención para guías procedimentales.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <a 
                            href="tel:+591000000" 
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border text-xs font-semibold hover:bg-muted transition-colors text-foreground"
                        >
                            <PhoneCall className="w-3.5 h-3.5 text-primary" />
                            Llamar Soporte
                        </a>
                        <a 
                            href="mailto:transparencia@example.com" 
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border text-xs font-semibold hover:bg-muted transition-colors text-foreground"
                        >
                            <Mail className="w-3.5 h-3.5 text-secondary" />
                            Enviar Correo
                        </a>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground bg-card/20 font-mono mt-auto">
                <p>Portal de Transparencia — Gobierno Autónomo Municipal</p>
                <p className="text-[10px] opacity-75 mt-1">Línea Gráfica Premium • React & Tailwind • 2026</p>
            </footer>
        </div>
    );
}