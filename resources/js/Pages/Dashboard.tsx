import AppLayout from '@/Components/Layout/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowRight,
    FilePlus2,
    KanbanSquare,
    BarChart3,
} from 'lucide-react';

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Inicio — Transparencia UTLCC" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
                <div className="absolute right-0 bottom-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold tracking-wide uppercase">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Panel de Control
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                        Sistema de Gestión de <span className="text-primary">Denuncias</span>
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Bienvenido al sistema de la Unidad de Transparencia y Lucha Contra la Corrupción del
                        Gobierno Autónomo Municipal de El Alto. Aquí podrá registrar, dar seguimiento y resolver
                        las denuncias ciudadanas conforme a la Ley N° 974.
                    </p>
                </div>
            </section>

            {/* Quick Access */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Accesos rápidos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/denuncias/registrar"
                        className="group bg-card border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-primary/40"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FilePlus2 className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h4 className="font-bold mb-1">Registrar Denuncia</h4>
                        <p className="text-xs text-muted-foreground">
                            Iniciar el registro de una nueva denuncia ciudadana.
                        </p>
                    </Link>

                    <Link
                        href="/denuncias"
                        className="group bg-card border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-primary/40"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-11 h-11 rounded-xl bg-secondary/20 text-secondary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                                <KanbanSquare className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h4 className="font-bold mb-1">Tablero Kanban</h4>
                        <p className="text-xs text-muted-foreground">
                            Ver el flujo de todas las denuncias por fase.
                        </p>
                    </Link>

                    <Link
                        href="/reportes"
                        className="group bg-card border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-primary/40"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h4 className="font-bold mb-1">Reportes</h4>
                        <p className="text-xs text-muted-foreground">
                            Métricas, indicadores y gráficos del sistema.
                        </p>
                    </Link>
                </div>
            </section>

            {/* KPIs (placeholder para Sprint 7) */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Indicadores (Sprint 7)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Denuncias Activas', icon: Clock, value: '—', color: 'text-primary', bg: 'bg-primary/10' },
                        { label: 'Pendientes Admisión', icon: AlertTriangle, value: '—', color: 'text-secondary-foreground', bg: 'bg-secondary/20' },
                        { label: 'Cumplimiento de Plazo', icon: CheckCircle2, value: '—', color: 'text-primary', bg: 'bg-primary/10' },
                    ].map((kpi) => (
                        <div key={kpi.label} className="border border-border rounded-xl p-4 bg-card space-y-3">
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span className="font-medium uppercase tracking-wider">{kpi.label}</span>
                                <span className={`p-1.5 rounded-lg ${kpi.bg}`}>
                                    <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                                </span>
                            </div>
                            <div className="text-3xl font-extrabold tracking-tight font-mono text-muted-foreground">
                                {kpi.value}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Se mostrará cuando se conecten los datos mock.
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}
