import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    LayoutDashboard,
    FilePlus2,
    KanbanSquare,
    ClipboardList,
    BarChart3,
    CalendarDays,
    Bell,
    FileSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Permiso } from '@/permissions';

interface MenuItem {
    key: string;
    label: string;
    href: string;
    routeName: string;
    icon: React.ReactNode;
    badge?: number;
    permiso?: Permiso;
}

interface SidebarProps {
    isSidebarCollapsed: boolean;
    isSidebarOpenMobile: boolean;
    onCloseSidebarMobile: () => void;
}

export default function Sidebar({
    isSidebarCollapsed,
    isSidebarOpenMobile,
    onCloseSidebarMobile,
}: SidebarProps) {
    const sidebarProps = usePage().props as {
        logo_url?: string;
        notificaciones?: { no_leidas: number };
        currentUser?: { rol: string };
        usuarios?: Record<string, any>;
        permisos?: Permiso[];
    };
    const { logo_url } = sidebarProps;
    const noLeidas = sidebarProps.notificaciones?.no_leidas ?? 0;
    const permisos = sidebarProps.permisos ?? [];

    const todosLosItems: MenuItem[] = [
        {
            key: 'inicio',
            label: 'Inicio',
            href: route('dashboard'),
            routeName: 'dashboard',
            icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
            permiso: 'menu.dashboard',
        },
        {
            key: 'nueva-denuncia',
            label: 'Nueva Denuncia',
            href: route('denuncias.registrar'),
            routeName: 'denuncias.registrar',
            icon: <FilePlus2 className="w-5 h-5 shrink-0" />,
            permiso: 'menu.registrar-denuncia',
        },
        {
            key: 'bandeja',
            label: 'Bandeja de Admisión',
            href: route('denuncias.bandeja'),
            routeName: 'denuncias.bandeja',
            icon: <KanbanSquare className="w-5 h-5 shrink-0" />,
            permiso: 'menu.bandeja',
        },
        {
            key: 'mis-casos',
            label: 'Mis Casos [Técnico]',
            href: route('denuncias.mis-casos'),
            routeName: 'denuncias.mis-casos',
            icon: <ClipboardList className="w-5 h-5 shrink-0" />,
            permiso: 'menu.mis-casos',
        },
        {
            key: 'mi-resumen',
            label: 'Mi Resumen [Técnico]',
            href: route('denuncias.mi-resumen'),
            routeName: 'denuncias.mi-resumen',
            icon: <BarChart3 className="w-5 h-5 shrink-0" />,
            permiso: 'menu.mi-resumen',
        },
        {
            key: 'evaluaciones',
            label: 'Evaluaciones',
            href: route('denuncias.evaluaciones'),
            routeName: 'denuncias.evaluaciones',
            icon: <FileSearch className="w-5 h-5 shrink-0" />,
            permiso: 'menu.evaluaciones',
        },
        {
            key: 'notificaciones',
            label: 'Notificaciones',
            href: route('notificaciones.index'),
            routeName: 'notificaciones.*',
            icon: <Bell className="w-5 h-5 shrink-0" />,
            badge: noLeidas,
            permiso: 'menu.notificaciones',
        },
        {
            key: 'reportes',
            label: 'Reportes',
            href: route('reportes.index'),
            routeName: 'reportes.index',
            icon: <BarChart3 className="w-5 h-5 shrink-0" />,
            permiso: 'menu.reportes',
        },
        {
            key: 'feriados',
            label: 'Feriados',
            href: route('admin.feriados'),
            routeName: 'admin.feriados',
            icon: <CalendarDays className="w-5 h-5 shrink-0" />,
            permiso: 'menu.feriados',
        },
    ];

    const menuItems = todosLosItems.filter((item) => {
        if (!item.permiso) return true;
        return permisos.includes(item.permiso);
    });

    const isActive = (routeName: string) => {
        if (routeName === 'dashboard') {
            return route().current('dashboard');
        }
        return route().current(routeName);
    };

    return (
        <aside
            className={cn(
                'bg-sidebar border-r border-sidebar-border flex flex-col select-none shrink-0 transition-all duration-300 ease-in-out',
                'fixed inset-y-0 left-0 z-50 w-64 transform md:relative md:translate-x-0 md:z-auto text-sidebar-foreground',
                isSidebarOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
                isSidebarCollapsed ? 'md:w-16' : 'md:w-64'
            )}
        >
            {/* Mobile sidebar header */}
            <div className="flex md:hidden items-center justify-between px-4 pb-4 border-b border-sidebar-border/60 mb-4 shrink-0 pt-4">
                <div className="flex items-center gap-2">
                    <img
                        src={logo_url || ''}
                        alt="GAMEA"
                        className="w-8 h-8 object-contain drop-shadow-[0_2px_6px_rgba(255,255,255,0.2)] brightness-110"
                    />
                    <span className="font-bold text-sm tracking-tight">Transparencia</span>
                </div>
                <button
                    onClick={onCloseSidebarMobile}
                    className="p-1.5 rounded-lg hover:bg-sidebar-muted text-sidebar-foreground/60 transition-colors cursor-pointer"
                    aria-label="Cerrar menú"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Brand banner - desktop only */}
            <div
                className={cn(
                    'hidden md:flex flex-col items-center shrink-0 transition-all duration-300',
                    'relative overflow-hidden',
                    isSidebarCollapsed
                        ? 'py-3 mb-2'
                        : 'pt-6 pb-5 mb-3 mx-3 rounded-2xl bg-gradient-to-b from-sidebar-muted/80 to-sidebar'
                )}
            >
                {/* Subtle brand glow */}
                {!isSidebarCollapsed && (
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] to-transparent pointer-events-none" />
                )}

                {/* Logo */}
                <div
                    className={cn(
                        'relative z-10 flex items-center justify-center',
                        isSidebarCollapsed ? 'w-9 h-9' : 'w-14 h-14 mb-2.5'
                    )}
                >
                    <img
                        src={logo_url || ''}
                        alt="GAMEA - Gobierno Autónomo Municipal de El Alto"
                        className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)] brightness-110"
                    />
                </div>

                {/* Institution name - hidden on collapsed */}
                <div
                    className={cn(
                        'relative z-10 text-center transition-all duration-300 origin-top',
                        isSidebarCollapsed
                            ? 'opacity-0 h-0 scale-95 pointer-events-none overflow-hidden'
                            : 'opacity-100 h-auto'
                    )}
                >
                    <h2 className="text-xs font-extrabold tracking-[0.15em] text-sidebar-accent uppercase">
                        GAMEA · El Alto
                    </h2>
                    <p className="text-[11px] font-bold text-sidebar-foreground/90 leading-tight mt-1">
                        Transparencia
                    </p>
                    <p className="text-[9px] font-medium text-sidebar-foreground/50 leading-tight mt-0.5">
                        Unidad UTLCC
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto">
                {menuItems.map((item) => {
                    const active = isActive(item.routeName);

                    const linkContent = (
                        <Link
                            href={item.href}
                            onClick={onCloseSidebarMobile}
                            title={isSidebarCollapsed ? item.label : undefined}
                            className={cn(
                                'w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative group/link focus:outline-none',
                                active
                                    ? 'bg-sidebar-muted text-sidebar-accent'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-muted/50 hover:text-sidebar-foreground',
                                isSidebarCollapsed ? 'justify-center py-2' : 'px-3 py-2'
                            )}
                        >
                            {/* Active indicator bar */}
                            {active && (
                                <div
                                    className={cn(
                                        'absolute bg-sidebar-accent rounded-full',
                                        isSidebarCollapsed
                                            ? 'left-0 top-1/4 bottom-1/4 w-0.5'
                                            : 'left-0 top-1/4 bottom-1/4 w-0.5'
                                    )}
                                />
                            )}

                            {/* Icon */}
                            <span
                                className={cn(
                                    'shrink-0 transition-transform duration-200 group-hover/link:scale-110',
                                    active ? 'text-sidebar-accent' : ''
                                )}
                            >
                                {item.icon}
                            </span>

                            {/* Label */}
                            <span
                                className={cn(
                                    'transition-all duration-300 ease-in-out whitespace-nowrap text-left',
                                    isSidebarCollapsed
                                        ? 'opacity-0 w-0 overflow-hidden pointer-events-none'
                                        : 'opacity-100 w-auto'
                                )}
                            >
                                {item.label}
                            </span>

                            {/* Badge */}
                            {item.badge !== undefined && item.badge > 0 && (
                                <span
                                    className={cn(
                                        'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center transition-all',
                                        active
                                            ? 'bg-sidebar-accent text-sidebar'
                                            : 'bg-destructive text-destructive-foreground',
                                        isSidebarCollapsed ? 'hidden' : ''
                                    )}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );

                    return (
                        <div key={item.key} className={cn(isSidebarCollapsed ? 'flex justify-center' : '')}>
                            {linkContent}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="shrink-0 border-t border-sidebar-border/60">
                <div
                    className={cn(
                        'text-center transition-all duration-300',
                        isSidebarCollapsed ? 'py-2' : 'py-3'
                    )}
                >
                    {/* Dot indicator when collapsed */}
                    <div
                        className={cn(
                            'transition-all duration-300',
                            isSidebarCollapsed ? 'scale-100' : 'scale-0 h-0 overflow-hidden'
                        )}
                    >
                        <div className="w-1.5 h-1.5 rounded-full mx-auto bg-sidebar-accent/60" />
                    </div>

                    {/* Version text when expanded */}
                    <span
                        className={cn(
                            'text-[10px] text-sidebar-foreground/40 font-mono transition-all duration-300',
                            isSidebarCollapsed ? 'hidden' : 'block'
                        )}
                    >
                        Ley N° 974 · v0.1.0
                    </span>
                </div>
            </div>
        </aside>
    );
}
