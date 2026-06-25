import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    LayoutDashboard,
    FilePlus2,
    KanbanSquare,
    BarChart3,
    CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import InstitutionalLogo from './InstitutionalLogo';

interface MenuItem {
    key: string;
    label: string;
    href: string;
    routeName: string;
    icon: React.ReactNode;
    badge?: number;
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
    const menuItems: MenuItem[] = [
        {
            key: 'inicio',
            label: 'Inicio',
            href: route('dashboard'),
            routeName: 'dashboard',
            icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
        },
        {
            key: 'nueva-denuncia',
            label: 'Nueva Denuncia',
            href: route('denuncias.registrar'),
            routeName: 'denuncias.registrar',
            icon: <FilePlus2 className="w-5 h-5 shrink-0" />,
        },
        {
            key: 'kanban',
            label: 'Tablero Kanban',
            href: route('denuncias.kanban'),
            routeName: 'denuncias.kanban',
            icon: <KanbanSquare className="w-5 h-5 shrink-0" />,
        },
        {
            key: 'reportes',
            label: 'Reportes',
            href: route('reportes.index'),
            routeName: 'reportes.index',
            icon: <BarChart3 className="w-5 h-5 shrink-0" />,
        },
        {
            key: 'feriados',
            label: 'Feriados',
            href: route('admin.feriados'),
            routeName: 'admin.feriados',
            icon: <CalendarDays className="w-5 h-5 shrink-0" />,
        },
    ];

    const isActive = (routeName: string) => {
        if (routeName === 'dashboard') {
            return route().current('dashboard');
        }
        return route().current(routeName);
    };

    return (
        <aside
            className={cn(
                'bg-card border-r border-border flex flex-col pt-6 select-none shrink-0 transition-all duration-300 ease-in-out',
                'fixed inset-y-0 left-0 z-50 w-64 transform md:relative md:translate-x-0 md:z-auto',
                isSidebarOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
                isSidebarCollapsed ? 'md:w-16' : 'md:w-64'
            )}
        >
            {/* Mobile Sidebar Header with Close Button */}
            <div className="flex md:hidden items-center justify-between px-4 pb-4 border-b border-border/60 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <InstitutionalLogo size="sm" />
                    <span className="font-bold text-sm tracking-tight text-foreground">Transparencia</span>
                </div>
                <button
                    onClick={onCloseSidebarMobile}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    aria-label="Cerrar menú"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Logo Section (Desktop) */}
            <div
                className={cn(
                    'hidden md:flex items-center gap-3 px-4 pb-5 border-b border-border/60 mb-4 shrink-0',
                    isSidebarCollapsed ? 'md:justify-center md:px-2' : 'md:px-4'
                )}
            >
                <InstitutionalLogo size={isSidebarCollapsed ? 'sm' : 'md'} />
                <div
                    className={cn(
                        'min-w-0 transition-all duration-300 origin-left',
                        isSidebarCollapsed ? 'md:opacity-0 md:w-0 md:scale-95 md:pointer-events-none md:overflow-hidden' : 'md:opacity-100 md:w-auto'
                    )}
                >
                    <h2 className="font-bold text-sm tracking-tight text-foreground leading-tight truncate">
                        Transparencia
                    </h2>
                    <p className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
                        GAMEA · UTLCC
                    </p>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                    const active = isActive(item.routeName);
                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            onClick={onCloseSidebarMobile}
                            className={cn(
                                'w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative overflow-hidden group focus:outline-none',
                                active
                                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10'
                                    : 'text-muted-foreground hover:bg-primary/8 hover:text-primary'
                            )}
                            title={isSidebarCollapsed ? item.label : undefined}
                        >
                            {/* Sidebar Active Indicator Bar */}
                            {active && (
                                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-secondary rounded-full" />
                            )}

                            {/* Icon */}
                            <span
                                className={cn(
                                    'transition-transform duration-200 group-hover:scale-110',
                                    active ? 'text-inherit' : 'text-primary'
                                )}
                            >
                                {item.icon}
                            </span>

                            {/* Label Text - Responsive collapse */}
                            <span
                                className={cn(
                                    'transition-all duration-300 ease-in-out origin-left whitespace-nowrap text-left',
                                    'opacity-100 scale-100 w-auto',
                                    isSidebarCollapsed
                                        ? 'md:opacity-0 md:w-0 md:scale-95 md:pointer-events-none md:overflow-hidden'
                                        : 'md:opacity-100 md:w-auto'
                                )}
                            >
                                {item.label}
                            </span>

                            {/* Optional Badge */}
                            {item.badge !== undefined && item.badge > 0 && (
                                <span
                                    className={cn(
                                        'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                                        active
                                            ? 'bg-secondary text-secondary-foreground'
                                            : 'bg-destructive text-destructive-foreground'
                                    )}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Footer Info */}
            <div className="p-4 border-t border-border/60 text-center shrink-0">
                <div
                    className={cn(
                        'transition-all duration-300',
                        isSidebarCollapsed ? 'md:scale-0 md:h-0 md:overflow-hidden' : 'md:scale-100'
                    )}
                >
                    <span className="text-[10px] text-muted-foreground font-mono">
                        Ley N° 974 · v0.1.0
                    </span>
                </div>
                <div
                    className={cn(
                        'w-2.5 h-2.5 rounded-full mx-auto bg-primary transition-all duration-300',
                        isSidebarCollapsed ? 'md:scale-100' : 'md:scale-0 md:h-0'
                    )}
                />
            </div>
        </aside>
    );
}
