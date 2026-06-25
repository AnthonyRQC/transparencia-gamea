import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import AppLayout from '@/Components/Layout/AppLayout';
import { 
    Clock, 
    Lock, 
    Unlock, 
    Upload, 
    Check, 
    Plus, 
    Trash2, 
    UserCheck, 
    RefreshCw, 
    AlertCircle, 
    Eye, 
    EyeOff, 
    FileText, 
    ShieldAlert, 
    ChevronRight, 
    MoreVertical 
} from 'lucide-react';

export default function DesignSystem() {
    const [activeTab, setActiveTab] = useState('inicio');
    const [clickCount, setClickCount] = useState(0);

    // Estados para el Playground Interactivos
    const [revealIdentity, setRevealIdentity] = useState(false);
    const [auditLog, setAuditLog] = useState<string[]>([]);
    
    // Estado para carga de archivos
    const [uploadedFile, setUploadedFile] = useState<{name: string, size: string} | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Estado para solicitudes de información mock
    const [requestsList, setRequestsList] = useState([
        { id: 1, entity: 'Dirección de Finanzas', request: 'Kardex de pagos gestión 2025', date: '2026-06-20', limitDays: 10, status: 'Pendiente' },
        { id: 2, entity: 'Recursos Humanos', request: 'Planilla de asistencia biométrica', date: '2026-06-18', limitDays: 5, status: 'Recibida' },
        { id: 3, entity: 'Asesoría Jurídica', request: 'Informe legal de adquisiciones', date: '2026-06-22', limitDays: 10, status: 'Pendiente' }
    ]);

    const handleToggleIdentity = () => {
        const nextState = !revealIdentity;
        setRevealIdentity(nextState);
        
        if (nextState) {
            const time = new Date().toLocaleTimeString();
            const logMsg = `[${time}] AUDITORÍA: El usuario "Jefe de Unidad" reveló la identidad del denunciante.`;
            setAuditLog(prev => [logMsg, ...prev]);
            console.warn(logMsg);
        }
    };

    const handleSimulateUpload = () => {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadedFile(null);
        
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            setUploadProgress(currentProgress);
            if (currentProgress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                setUploadedFile({
                    name: 'documento_de_prueba_escaneado.pdf',
                    size: '2.4 MB'
                });
            }
        }, 150);
    };

    const handleResolveRequest = (id: number) => {
        setRequestsList(prev => 
            prev.map(req => 
                req.id === id 
                    ? { ...req, status: req.status === 'Pendiente' ? 'Recibida' : 'Pendiente' } 
                    : req
            )
        );
    };

    return (
        <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
            <Head title="Guía de Estilos Visuales - Transparencia" />

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

            {/* Separador Horizontal */}
            <hr className="my-10 border-border" />

            {/* NUEVA SECCIÓN: Playground de Módulos de Gestión */}
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight">Playground de Componentes para Módulos de Gestión</h3>
                        <p className="text-sm text-muted-foreground">Maquetas visuales e interactivas para tableros Kanban, flujos de investigación y protección al denunciante.</p>
                    </div>
                    <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-secondary/20 text-secondary-foreground border border-secondary/30">
                        Playground Interactivo
                    </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* 1. Kanban Card Showcase (Col 4) */}
                    <div className="xl:col-span-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-md text-foreground">Tarjeta Kanban de Expediente</h4>
                            <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 font-bold px-2 py-0.5 rounded">Urgente</span>
                        </div>

                        {/* Kanban Card Component */}
                        <div className="bg-card border-y border-r border-l-4 border-l-destructive rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-3 cursor-grab active:cursor-grabbing relative group">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-muted-foreground">DEN-2026-0002</span>
                                <span className="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                                    Negación Info.
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                <h5 className="font-bold text-sm text-foreground line-clamp-1">Inconsistencias en Obras del Distrito 4</h5>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    Se alega ocultación intencionada de facturas y reportes de avance financiero solicitados en reiteradas oportunidades.
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px]">
                                        AT
                                    </div>
                                    <span>Ana Torres (Analista)</span>
                                </div>
                                <span className="flex items-center gap-1 font-semibold text-destructive">
                                    <Clock className="w-3.5 h-3.5" />
                                    3 días plazo
                                </span>
                            </div>

                            {/* Acciones simuladas */}
                            <div className="pt-3 flex gap-2">
                                <Button size="sm" className="w-full text-[10px] h-8 bg-primary hover:bg-primary/95">
                                    Asignar
                                </Button>
                                <Button size="sm" variant="outline" className="w-full text-[10px] h-8">
                                    Ver Expediente
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Escudo de Privacidad - Reserva de Identidad (Col 4) */}
                    <div className="xl:col-span-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-md text-foreground">Escudo de Privacidad (Reserva)</h4>
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded">Seguridad</span>
                        </div>

                        {/* Privacy Shield Component */}
                        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
                            
                            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider pb-2 border-b">
                                <ShieldAlert className="w-4 h-4 text-primary" />
                                Reserva de Identidad
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-muted-foreground block mb-0.5">Nombre del Denunciante:</span>
                                    <strong className={`text-sm tracking-wide font-semibold block transition-all duration-300 ${
                                        revealIdentity ? 'text-foreground' : 'blur-md select-none text-muted-foreground'
                                    }`}>
                                        Juan Carlos Pérez Ramos
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-0.5">Documento de Identidad:</span>
                                    <strong className={`font-mono block tracking-wider transition-all duration-300 ${
                                        revealIdentity ? 'text-foreground' : 'blur-md select-none text-muted-foreground'
                                    }`}>
                                        4728912 LP
                                    </strong>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    onClick={handleToggleIdentity}
                                    className="w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-sm"
                                >
                                    {revealIdentity ? (
                                        <>
                                            <EyeOff className="w-3.5 h-3.5" />
                                            Ocultar Identidad
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-3.5 h-3.5" />
                                            Revelar Identidad
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Historial de Auditoría Local */}
                            {auditLog.length > 0 && (
                                <div className="mt-3 pt-3 border-t space-y-1">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold font-mono">Bitácora de Auditoría (Simulación)</span>
                                    <div className="bg-muted p-2 rounded text-[10px] font-mono text-foreground leading-relaxed max-h-20 overflow-y-auto">
                                        {auditLog.map((log, i) => (
                                            <div key={i} className="border-b border-border/40 py-0.5 last:border-0">{log}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Drag & Drop File Uploader (Col 4) */}
                    <div className="xl:col-span-4 space-y-4">
                        <h4 className="font-bold text-md text-foreground">Carga de Medios de Prueba</h4>
                        
                        {/* Drag and Drop Box */}
                        <div className="bg-card border-2 border-dashed border-border rounded-xl p-5 shadow-sm text-center flex flex-col items-center justify-center min-h-[175px] space-y-3 relative group hover:border-primary/50 transition-colors">
                            {!uploadedFile && !isUploading ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-foreground">Arrastra tus archivos aquí o haz clic</p>
                                        <p className="text-[10px] text-muted-foreground">PDF, PNG, JPG (Máx. 10MB)</p>
                                    </div>
                                    <button 
                                        onClick={handleSimulateUpload}
                                        className="px-3 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-all text-[10px] border font-bold cursor-pointer"
                                    >
                                        Simular Selección
                                    </button>
                                </>
                            ) : isUploading ? (
                                <div className="w-full space-y-3 px-4">
                                    <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-foreground">Subiendo archivo...</p>
                                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-primary h-full transition-all duration-150"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-muted-foreground font-mono">{uploadProgress}% cargado</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 w-full px-2">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-foreground truncate max-w-full">{uploadedFile?.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono">{uploadedFile?.size}</p>
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => setUploadedFile(null)}
                                            className="px-3 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-all text-[10px] font-bold cursor-pointer"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Solicitudes de Información Table (Col 12 - Full Width) */}
                    <div className="xl:col-span-12 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-md text-foreground">Bandeja de Solicitudes de Información (Técnico / Analista)</h4>
                            <span className="text-[10px] bg-secondary/15 text-secondary-foreground border border-secondary/30 px-2 py-0.5 rounded font-mono font-bold">Mock de Requerimientos</span>
                        </div>

                        {/* Interactive Table Mock */}
                        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border/80 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                                            <th className="p-3">Destinatario</th>
                                            <th className="p-3">Información Requerida</th>
                                            <th className="p-3">Fecha Solicitud</th>
                                            <th className="p-3">Plazo Límite</th>
                                            <th className="p-3">Estado</th>
                                            <th className="p-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {requestsList.map((req) => (
                                            <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="p-3 font-semibold text-foreground">{req.entity}</td>
                                                <td className="p-3 text-muted-foreground">{req.request}</td>
                                                <td className="p-3 font-mono text-[11px]">{req.date}</td>
                                                <td className="p-3 font-mono text-[11px] font-semibold text-destructive">{req.limitDays} días hábiles</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        req.status === 'Recibida' 
                                                            ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                                                            : 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleResolveRequest(req.id)}
                                                        className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-[10px] font-bold cursor-pointer transition-colors"
                                                    >
                                                        {req.status === 'Pendiente' ? 'Registrar Respuesta' : 'Marcar Pendiente'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
