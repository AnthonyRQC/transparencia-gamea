import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

export default function Welcome() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col font-sans">
            <Head title="Línea Gráfica - Transparencia" />

            {/* Top Navigation / Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md shadow-primary/20 animate-pulse">
                        T
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">Portal de Transparencia</h1>
                        <p className="text-xs text-muted-foreground font-medium">Línea Gráfica & Componentes</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setIsDarkMode(!isDarkMode);
                            // Toggle real dark class on html tag for testing real dark mode
                            document.documentElement.classList.toggle('dark');
                        }}
                        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold shadow hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    >
                        {isDarkMode ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                                Modo Claro
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                                Modo Oscuro
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-10">
                {/* Hero section */}
                <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 rounded-3xl p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute right-0 bottom-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold tracking-wide uppercase">
                            Visual Design System
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            Línea Gráfica Premium para <span className="text-primary bg-clip-text">Shadcn + React</span>
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
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
                            <div className="flex items-center justify-between border-b pb-4">
                                <h4 className="font-bold text-lg">Dashboard Mockup (Tarjeta de Muestra)</h4>
                                <div className="flex gap-1.5">
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
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground bg-card/20 mt-12 font-mono">
                <p>Laravel 11 + Inertia.js + React 18 + Tailwind CSS v3</p>
                <p className="text-[11px] opacity-75 mt-1">Línea Gráfica Establecida con Éxito</p>
            </footer>
        </div>
    );
}