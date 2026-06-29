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
    FileSpreadsheet,
    Eye
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface WelcomeProps {
    auth: {
        user?: any;
    };
    canLogin: boolean;
    canRegister: boolean;
}

export default function Welcome({ auth, canLogin, canRegister }: WelcomeProps) {
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b19] text-foreground transition-colors duration-300 flex flex-col font-sans relative overflow-x-hidden">
            <Head title="Seguimiento Ciudadano - Transparencia" />

            <style>{`
                @keyframes orbital-rotate-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes orbital-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-orbital-rotate {
                    animation: orbital-rotate-slow 40s linear infinite;
                }
                .animate-orbital-float-1 {
                    animation: orbital-float 4.5s ease-in-out infinite;
                }
                .animate-orbital-float-2 {
                    animation: orbital-float 6s ease-in-out infinite 1s;
                }
                .animate-orbital-float-3 {
                    animation: orbital-float 5s ease-in-out infinite 2s;
                }
                .glow-effect {
                    box-shadow: 0 0 40px 10px rgba(105, 11, 178, 0.15);
                }
                .glow-secondary {
                    box-shadow: 0 0 30px 5px rgba(254, 205, 42, 0.2);
                }
            `}</style>

            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none -z-10" />

            <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-50 px-4 py-3 sm:px-8 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md shadow-primary/20 hover:scale-105 hover:rotate-3 transition-all cursor-pointer">
                        T
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground leading-none">GOBIERNO AUTÓNOMO MUNICIPAL DE EL ALTO</h1>
                        </div>
                        <span className="hidden xs:inline-block text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Unidad de Transparencia y Lucha Contra la Corrupción</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={handleToggleDarkMode}
                        className="p-2 rounded-lg bg-muted text-foreground border hover:bg-accent/15 transition-all duration-200 flex items-center justify-center cursor-pointer"
                        aria-label="Alternar modo oscuro"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 text-secondary" /> : <Moon className="w-4 h-4 text-primary" />}
                    </button>

                    <Link
                        href={route('design-system')}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-muted transition-colors"
                    >
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Guía de Estilos
                    </Link>

                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Panel de Control
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                        >
                            <Lock className="w-3.5 h-3.5" />
                            Iniciar sesión
                        </Link>
                    )}
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:py-16 space-y-16">

                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6 text-left">
                        <div className="space-y-2">
                            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-secondary uppercase block">
                                TRANSPARENCIA CON TRAZABILIDAD
                            </span>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                                Consulta el estado actual de tu denuncia
                            </h2>
                        </div>

                        <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                            Verifica en qué etapa se encuentra tu denuncia y conoce su estado de forma segura, anónima y transparente.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link
                                href={route('seguimiento.buscar')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                            >
                                <Search className="w-4 h-4" />
                                Consultar estado de denuncia
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-semibold tracking-wide uppercase">
                                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                                Transparencia y lucha contra la corrupción
                            </span>
                        </div>
                    </div>

                    <div className="lg:col-span-5 hidden md:flex items-center justify-center relative min-h-[350px] select-none">
                        <div className="absolute w-[300px] h-[300px] rounded-full border border-primary/10 dark:border-primary/5 animate-orbital-rotate" />
                        <div className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-primary/20 dark:border-primary/10" />
                        <div className="absolute w-[140px] h-[140px] rounded-full border border-primary/20 dark:border-primary/15" />

                        <div className="absolute w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 border-2 border-primary flex items-center justify-center glow-effect z-10 transition-transform duration-300 hover:scale-110">
                            <div className="relative">
                                <FileText className="w-8 h-8 text-primary" />
                                <Search className="w-4 h-4 text-secondary absolute -bottom-1 -right-1 stroke-[3px]" />
                            </div>
                        </div>

                        <div className="absolute top-[12%] left-[-5%] bg-card/90 dark:bg-slate-900/95 border border-primary/25 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg text-xs font-bold text-foreground animate-orbital-float-1">
                            <div className="w-5 h-5 rounded bg-primary/15 flex items-center justify-center">
                                <Lock className="w-3.5 h-3.5 text-primary" />
                            </div>
                            Consulta segura
                        </div>

                        <div className="absolute top-[45%] right-[-10%] bg-card/90 dark:bg-slate-900/95 border border-primary/25 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg text-xs font-bold text-foreground animate-orbital-float-2">
                            <div className="w-5 h-5 rounded bg-secondary/20 flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5 text-secondary-foreground" />
                            </div>
                            Estado actual
                        </div>

                        <div className="absolute bottom-[10%] left-[10%] bg-card/90 dark:bg-slate-900/95 border border-primary/25 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg text-xs font-bold text-foreground animate-orbital-float-3">
                            <div className="w-5 h-5 rounded bg-primary/15 flex items-center justify-center">
                                <Eye className="w-3.5 h-3.5 text-primary" />
                            </div>
                            Seguimiento visible
                        </div>
                    </div>
                </section>

                <hr className="border-border" />

                <section className="space-y-6">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-center">Información y Preguntas Frecuentes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card border rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2.5 rounded-bl-full pointer-events-none" />
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-base">Garantía de Confidencialidad</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                El sistema resguarda de manera encriptada y bajo estricto control administrativo los datos personales de todo denunciante que requiera reserva de identidad.
                            </p>
                        </div>

                        <div className="bg-card border rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full pointer-events-none" />
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-base">Tipos de Denuncia Permitidas</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Se atienden hechos concretos referidos a Corrupción (desvíos, cobros ilícitos) y Negación de Información Pública garantizando el derecho a la rendición de cuentas.
                            </p>
                        </div>

                        <div className="bg-card border rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2.5 rounded-bl-full pointer-events-none" />
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

                <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent border border-primary/15 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h4 className="font-bold text-lg">¿Necesitas asistencia técnica o registrar una denuncia?</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">Puedes comunicarte con la ventanilla única de atención para guías procedimentales.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <a
                            href="tel:+591000000"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border hover:bg-muted transition-colors text-xs font-bold text-foreground"
                        >
                            <PhoneCall className="w-3.5 h-3.5 text-primary" />
                            Llamar Soporte
                        </a>
                        <a
                            href="mailto:transparencia@example.com"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border hover:bg-muted transition-colors text-xs font-bold text-foreground"
                        >
                            <Mail className="w-3.5 h-3.5 text-secondary" />
                            Enviar Correo
                        </a>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground bg-card/20 font-mono mt-auto">
                <p>Portal de Transparencia — Gobierno Autónomo Municipal</p>
                <p className="text-[10px] opacity-75 mt-1">Unidad de Transparencia y Lucha Contra la Corrupción • 2026</p>
            </footer>
        </div>
    );
}
