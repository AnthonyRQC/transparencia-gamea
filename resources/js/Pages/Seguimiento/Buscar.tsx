import { Head } from '@inertiajs/react';
import { Search, ShieldCheck, Lock, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Buscar() {
    const [ticket, setTicket] = useState('');

    return (
        <>
            <Head title="Seguimiento de Denuncia — GAMEA UTLCC" />

            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 font-sans">
                {/* Top public header */}
                <header className="border-b border-border/40 bg-card/70 backdrop-blur sticky top-0 z-30">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-md shadow-primary/20">
                                T
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground leading-tight">
                                    Unidad de Transparencia
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                                    GAMEA · Ley N° 974
                                </p>
                            </div>
                        </div>
                        <a
                            href={route('login')}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                            Acceso Funcionarios
                            <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
                    {/* Hero */}
                    <section className="text-center space-y-4 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold tracking-wide uppercase">
                            <Sparkles className="w-3.5 h-3.5" />
                            Seguimiento Ciudadano
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                            Consulta el estado de tu <span className="text-primary">denuncia</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                            Ingresa el número de ticket que se te entregó al momento de registrar tu denuncia
                            para conocer su fase actual y las fechas estimadas del proceso.
                        </p>
                    </section>

                    {/* Search */}
                    <section className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                        <label className="block text-sm font-semibold text-foreground">
                            Número de Ticket
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={ticket}
                                    onChange={(e) => setTicket(e.target.value)}
                                    placeholder="Ej: DEN-2026-0004"
                                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                                />
                            </div>
                            <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Search className="w-4 h-4" />
                                Consultar Estado
                            </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            El ticket tiene el formato <code className="font-mono text-primary">DEN-AAAA-NNNN</code>.
                        </p>
                    </section>

                    {/* Confidencialidad */}
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                icon: ShieldCheck,
                                title: 'Proceso Legal',
                                desc: 'Conforme a la Ley N° 974',
                            },
                            {
                                icon: Lock,
                                title: 'Identidad Protegida',
                                desc: 'Reserva según Art. 24 y 29',
                            },
                            {
                                icon: Eye,
                                title: 'Transparencia',
                                desc: 'Solo datos no sensibles',
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="bg-card border rounded-xl p-4 text-center space-y-2"
                            >
                                <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-sm">{item.title}</h3>
                                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </section>

                    <p className="text-center text-[11px] text-muted-foreground">
                        Sprint 6 — El motor de búsqueda se conectará con datos mock en este sprint.
                    </p>
                </main>
            </div>
        </>
    );
}
