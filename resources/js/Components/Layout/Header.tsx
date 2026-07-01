import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import InstitutionalLogo from './InstitutionalLogo';
import CampanaNotificaciones from './CampanaNotificaciones';

interface HeaderProps {
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onToggleSidebar: () => void;
    isSidebarCollapsed: boolean;
    isSidebarOpenMobile: boolean;
}

export default function Header({
    isDarkMode,
    onToggleDarkMode,
    onToggleSidebar,
    isSidebarCollapsed,
    isSidebarOpenMobile,
}: HeaderProps) {
    const { props } = usePage();
    const user = (props as any).auth?.user;
    const notificaciones = (props as any).notificaciones;
    const noLeidas = notificaciones?.no_leidas ?? 0;
    const recientes = notificaciones?.recientes ?? [];

    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="border-b border-sidebar-border bg-sidebar sticky top-0 z-50 px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Sidebar Toggle Button */}
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-sidebar-muted transition-colors cursor-pointer text-sidebar-foreground shrink-0 focus:outline-none focus:ring-2 focus:ring-sidebar-ring/40"
                    aria-label="Toggle Sidebar"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={isSidebarCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M15 19l-7-7 7-7'}
                            className="hidden md:block"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={isSidebarOpenMobile ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                            className="block md:hidden"
                        />
                    </svg>
                </button>

                {/* Logo + Title */}
                <Link href={route('home')} className="flex items-center gap-2 sm:gap-3 min-w-0 group">
                    <InstitutionalLogo size="sm" className="hidden sm:block" />
                    <div className="min-w-0">
                        <h1 className="text-sm xs:text-base sm:text-lg font-bold tracking-tight text-sidebar-foreground leading-tight truncate group-hover:text-sidebar-accent transition-colors">
                            Gobierno Autónomo Municipal de El Alto
                        </h1>
                        <p className="hidden xs:block text-[10px] sm:text-xs text-sidebar-foreground/60 font-medium leading-none mt-0.5 truncate">
                            Unidad de Transparencia y Lucha Contra la Corrupción · UTLCC
                        </p>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* Notifications Bell */}
                <CampanaNotificaciones noLeidas={noLeidas} recientes={recientes} />

                {/* Dark Mode Toggle */}
                <button
                    onClick={onToggleDarkMode}
                    className="p-2 sm:px-3 sm:py-2 rounded-lg bg-sidebar-accent text-sidebar font-semibold text-xs sm:text-sm shadow hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                >
                    {isDarkMode ? (
                        <>
                            <Sun className="w-4 h-4" />
                            <span className="hidden md:inline">Claro</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4" />
                            <span className="hidden md:inline">Oscuro</span>
                        </>
                    )}
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((o) => !o)}
                        className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-2 rounded-lg hover:bg-sidebar-muted transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sidebar-ring/40"
                    >
                        <div className="w-8 h-8 rounded-full bg-sidebar-accent text-sidebar font-bold text-sm flex items-center justify-center shrink-0">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="hidden lg:flex flex-col items-start min-w-0">
                            <span className="text-sm font-semibold text-sidebar-foreground truncate max-w-[140px]">
                                {user?.name || 'Usuario'}
                            </span>
                            <span className="text-[10px] text-sidebar-foreground/60 truncate max-w-[140px]">
                                {user?.email || ''}
                            </span>
                        </div>
                        <ChevronDown
                            className={`w-4 h-4 text-sidebar-foreground/60 transition-transform duration-200 hidden sm:block ${
                                dropdownOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg shadow-primary/5 py-2 animate-fade-in z-50">
                            <div className="px-4 py-2 border-b border-border/60">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {user?.name || 'Usuario'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email || ''}
                                </p>
                            </div>
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                Mi Perfil
                            </Link>
                            <div className="border-t border-border/60 my-1" />
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
