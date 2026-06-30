import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import InstitutionalLogo from '@/Components/Layout/InstitutionalLogo';
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
    jacha_url?: string;
    canLogin: boolean;
    canRegister: boolean;
}

export default function Welcome({ auth, jacha_url, canLogin, canRegister }: WelcomeProps) {
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

            <header className="border-b border-border bg-slate-950 text-slate-50 sticky top-0 z-50 px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
                <Link href={route('home')} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 group">
                    <InstitutionalLogo size="sm" />
                    <div className="min-w-0">
                        <h1 className="text-sm xs:text-base sm:text-lg font-bold tracking-tight text-slate-50 leading-tight truncate group-hover:text-slate-200 transition-colors">
                            <span className="sm:hidden">GAMEA</span>
                            <span className="hidden sm:inline">Gobierno Autónomo Municipal de El Alto</span>
                        </h1>
                        <p className="hidden xs:block text-[10px] sm:text-xs text-slate-400 font-medium leading-none mt-0.5 truncate">
                            Unidad de Transparencia y Lucha Contra la Corrupción · UTLCC
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <button
                        onClick={handleToggleDarkMode}
                        className="p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm shadow hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer border border-slate-700"
                        aria-label="Alternar modo oscuro"
                    >
                        {isDarkMode ? (
                            <>
                                <Sun className="w-4 h-4 text-secondary" />
                                <span className="hidden md:inline">Claro</span>
                            </>
                        ) : (
                            <>
                                <Moon className="w-4 h-4 text-primary" />
                                <span className="hidden md:inline">Oscuro</span>
                            </>
                        )}
                    </button>

                    <Link
                        href={route('design-system')}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                        <Palette className="w-3.5 h-3.5" />
                        Guía de Estilos
                    </Link>

                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Panel
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                        >
                            <Lock className="w-3.5 h-3.5" />
                            Acceder
                        </Link>
                    )}
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:py-16 space-y-16">

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="space-y-6 text-left order-2 lg:order-1">
                        <div className="space-y-2">
                            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-primary dark:text-secondary uppercase block">
                                GESTIÓN INSTITUCIONAL TRANSPARENTE
                            </span>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                                Consulta el estado actual de tu denuncia
                            </h2>
                        </div>

                        <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                            Verifica en qué etapa se encuentra tu denuncia y conoce su estado de forma rápida, segura y transparente, garantizando siempre el debido proceso.
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
                        </div>
                        
                        <div className="flex items-center gap-3 pt-4 border-t border-border mt-6">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background"><ShieldCheck className="w-4 h-4 text-primary" /></div>
                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-background"><Lock className="w-4 h-4 text-secondary-foreground" /></div>
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-background"><Eye className="w-4 h-4 text-emerald-600" /></div>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground">Proceso Seguro, Transparente y Auditado</span>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 w-full flex justify-center lg:justify-end relative">
                        {/* Decorative elements behind image */}
                        <div className="absolute top-[-5%] right-[-5%] w-3/4 h-3/4 bg-primary/10 dark:bg-primary/5 rounded-3xl blur-2xl -z-10"></div>
                        <div className="absolute bottom-[-5%] left-[-5%] w-1/2 h-1/2 bg-secondary/15 dark:bg-secondary/10 rounded-3xl blur-xl -z-10"></div>
                        
                        <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-border/50 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 pointer-events-none"></div>
                            <img 
                                src={jacha_url || '/jacha.jpg'} 
                                alt="Edificio Jacha Uta - Gobierno Autónomo Municipal de El Alto" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-20 flex items-end justify-between pointer-events-none">
                                <div>
                                    <h3 className="text-white font-bold text-lg sm:text-xl leading-none mb-1 shadow-black/50 drop-shadow-md">Casa Municipal Jacha Uta</h3>
                                    <p className="text-white/80 text-xs sm:text-sm font-medium shadow-black/50 drop-shadow-md">Sede Ejecutiva del GAMEA</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                                    <InstitutionalLogo size="sm" className="brightness-0 invert" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6 pt-2">
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
