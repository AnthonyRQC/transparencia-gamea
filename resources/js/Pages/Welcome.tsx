import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import AppLayout from '@/Layouts/AppLayout';

export default function Welcome() {
    const [activeTab, setActiveTab] = useState('inicio');
    const [clickCount, setClickCount] = useState(0);

    return (
        <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
            <Head title="Línea Gráfica - Transparencia" />

            {/* Hero section */}
            <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
                <div className="absolute right-0 bottom-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold tracking-wide uppercase">
                        Visual Design System
                    </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                Línea Gráfica Premium para <span className="text-primary bg-clip-text">Shadcn + React</span>
                            </h2>
                            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                                Diseño contemporáneo con paleta personalizada usando el color principal <strong className="text-foreground">#690bb2 (Morado)</strong> y el secundario <strong className="text-foreground">#fecd2a (Amarillo)</strong>. Implementado nativamente en el espacio de color <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-primary font-bold">OKLCH</code> con soporte para opacidad dinámica y modo oscuro automático.
                            </p>
                        </div>
                    </section>

                    {/* Grid Layout: Palettes and Live Previews */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Design System Tokens (5 Cols) */}
                        <section className="lg:col-span-5 space-y-6">
                            <h3 className="text-2xl font-bold tracking-tight">Paleta de Colores</h3>
                            
                            {/* Primary Color Card */}
                            <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-md bg-primary" />
                                    <span className="font-bold">Color Principal (Primary)</span>
                                </div>
                                <div className="bg-primary text-primary-foreground p-4 rounded-xl space-y-1">
                                    <div className="text-lg font-bold">#690bb2</div>
                                    <div className="text-xs opacity-90 font-mono">oklch(0.4685 0.264 301.12)</div>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    <div className="h-10 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">10%</div>
                                    <div className="h-10 rounded-lg bg-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">30%</div>
                                    <div className="h-10 rounded-lg bg-primary/50 flex items-center justify-center text-[10px] font-bold text-primary-foreground">50%</div>
                                    <div className="h-10 rounded-lg bg-primary/75 flex items-center justify-center text-[10px] font-bold text-primary-foreground">75%</div>
                                    <div className="h-10 rounded-lg bg-primary/90 flex items-center justify-center text-[10px] font-bold text-primary-foreground">90%</div>
                                </div>
                            </div>

                            {/* Secondary Color Card */}
                            <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-md bg-secondary" />
                                    <span className="font-bold">Color Secundario (Secondary)</span>
                                </div>
                                <div className="bg-secondary text-secondary-foreground p-4 rounded-xl space-y-1">
                                    <div className="text-lg font-bold">#fecd2a</div>
                                    <div className="text-xs opacity-90 font-mono">oklch(0.884 0.165 91.5)</div>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    <div className="h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-[10px] font-bold text-secondary-foreground/70">10%</div>
                                    <div className="h-10 rounded-lg bg-secondary/30 flex items-center justify-center text-[10px] font-bold text-secondary-foreground/80">30%</div>
                                    <div className="h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-[10px] font-bold text-secondary-foreground/90">50%</div>
                                    <div className="h-10 rounded-lg bg-secondary/75 flex items-center justify-center text-[10px] font-bold text-secondary-foreground">75%</div>
                                    <div className="h-10 rounded-lg bg-secondary/90 flex items-center justify-center text-[10px] font-bold text-secondary-foreground">90%</div>
                                </div>
                            </div>

                            {/* Typography Showcase */}
                            <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
                                <h4 className="font-bold text-lg">Tipografía del Sistema</h4>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-muted-foreground font-mono">Fuente Principal (Sans-serif)</span>
                                        <div className="text-xl font-bold">Outfit</div>
                                        <p className="text-xs text-muted-foreground">Utilizada para encabezados, menús y textos generales de alta legibilidad.</p>
                                    </div>
                                    <hr className="border-border" />
                                    <div>
                                        <span className="text-xs text-muted-foreground font-mono">Fuente Código (Monospace)</span>
                                        <div className="text-sm font-mono">Fira Code</div>
                                        <p className="text-xs text-muted-foreground">Utilizada para datos estructurados, números, tablas y código.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Right Column: Interactive Previews (7 Cols) */}
                        <section className="lg:col-span-7 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold tracking-tight">Componentes & Dashboard</h3>
                                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-semibold">Interactivo</span>
                            </div>

                            {/* Button Showcase */}
                            <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-4">
                                <h4 className="font-bold text-lg">Variaciones de Botón (Shadcn Button)</h4>
                                <div className="flex flex-wrap gap-3">
                                    <Button 
                                        className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                                        onClick={() => setClickCount(c => c + 1)}
                                    >
                                        Botón Principal
                                    </Button>
                                    
                                    <Button 
                                        variant="secondary" 
                                        className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                                        onClick={() => setClickCount(c => c + 1)}
                                    >
                                        Botón Secundario
                                    </Button>

                                    <Button 
                                        variant="outline" 
                                        className="cursor-pointer transition-all duration-200 hover:bg-accent/10"
                                    >
                                        Delineado
                                    </Button>

                                    <Button 
                                        variant="ghost" 
                                        className="cursor-pointer hover:bg-primary/5 hover:text-primary"
                                    >
                                        Fantasma
                                    </Button>

                                    <Button 
                                        variant="link" 
                                        className="text-primary hover:text-primary/80"
                                    >
                                        Enlace
                                    </Button>
                                </div>
                                
                                {clickCount > 0 && (
                                    <p className="text-xs text-muted-foreground font-mono animate-fade-in">
                                        Acción disparada: Botón presionado <strong className="text-primary">{clickCount}</strong> veces.
                                    </p>
                                )}
                            </div>

                            {/* Visual Card Component Showcase (Inspired by Hotel Dashboard design) */}
                            <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-lg">Panel de Control</h4>
                                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono uppercase">
                                            Vista: {activeTab}
                                        </span>
                                    </div>
                                    <div className="flex gap-1.5 self-end sm:self-auto">
                                        <span className="w-3 h-3 rounded-full bg-red-400" />
                                        <span className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <span className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                </div>

                                {/* Dashboard Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Card 1: Main Metric */}
                                    <div className="border border-border rounded-xl p-4 bg-background hover:shadow-md transition-all duration-300 space-y-3 group">
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span className="font-medium uppercase tracking-wider">Solicitudes Totales</span>
                                            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold">+12.4%</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-3xl font-extrabold tracking-tight font-mono text-foreground">1,248</div>
                                            <p className="text-xs text-muted-foreground">Solicitudes recibidas este mes</p>
                                        </div>
                                        {/* Mini visual indicator graph */}
                                        <div className="flex items-end gap-1.5 h-10 pt-2">
                                            {[30, 45, 35, 60, 50, 75, 90, 85, 95].map((h, i) => (
                                                <div
                                                    key={i}
                                                    style={{ height: `${h}%` }}
                                                    className={`w-full rounded-t-sm transition-all duration-300 ${
                                                        i === 8 ? 'bg-primary' : 'bg-primary/30 group-hover:bg-primary/50'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card 2: Secondary Metric */}
                                    <div className="border border-border rounded-xl p-4 bg-background hover:shadow-md transition-all duration-300 space-y-3 group">
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span className="font-medium uppercase tracking-wider">Tasa de Respuesta</span>
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Excelente</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-3xl font-extrabold tracking-tight font-mono text-foreground">94.8%</div>
                                            <p className="text-xs text-muted-foreground">Tiempo promedio de respuesta: 24h</p>
                                        </div>
                                        {/* Progress Bar using Secondary color */}
                                        <div className="pt-2">
                                            <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-secondary h-full rounded-full transition-all duration-1000 shadow-sm"
                                                    style={{ width: '94.8%' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                                            <span>Meta: 90%</span>
                                            <span>Actual: 94.8%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Badge and Status Showcase */}
                                <div className="space-y-3">
                                    <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Estados y Avisos</h5>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                            Principal / Activo
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary-foreground border border-secondary/30">
                                            Secundario / Alerta
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">
                                            Muted / Inactivo
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                                            Destructivo / Error
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
        </AppLayout>
    );
}