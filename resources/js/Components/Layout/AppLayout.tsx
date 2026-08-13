import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Toaster } from '@/Components/ui/sonner';
import Header from './Header';
import Sidebar from './Sidebar';
import { useNotificacionesSSE } from '@/hooks/useNotificacionesSSE';

interface AppLayoutProps {
    children: React.ReactNode;
    activeTab?: string;
    onSelectTab?: (tab: string) => void;
    headerBottom?: React.ReactNode;
}

export default function AppLayout({ children, headerBottom }: AppLayoutProps) {
    const { props } = usePage();
    const auth = (props as any).auth;
    const notificacionesInertia = (props as any).notificaciones;

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dark_mode') === 'true';
        }
        return false;
    });

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar_collapsed');
            return saved !== null ? saved === 'true' : false;
        }
        return false;
    });

    const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

    // SSE: notificaciones en tiempo real.
    // Se activa solo si el usuario está autenticado.
    const { noLeidas, recientes } = useNotificacionesSSE({
        initialNoLeidas: notificacionesInertia?.no_leidas ?? 0,
        initialRecientes: notificacionesInertia?.recientes ?? [],
        enabled: !!auth?.user,
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        document.documentElement.style.setProperty(
            '--sidebar-width',
            isSidebarCollapsed ? '64px' : '256px'
        );
    }, [isSidebarCollapsed]);

    const handleToggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpenMobile((v) => !v);
        } else {
            const nextState = !isSidebarCollapsed;
            setIsSidebarCollapsed(nextState);
            localStorage.setItem('sidebar_collapsed', String(nextState));
        }
    };

    const handleToggleDarkMode = () => {
        const nextState = !isDarkMode;
        setIsDarkMode(nextState);
        localStorage.setItem('dark_mode', String(nextState));
    };

    return (
        <div className="h-screen flex bg-background text-foreground transition-colors duration-300 font-sans overflow-hidden">
            {/*
              * Toaster top-center: los toasts de notificación SSE aparecen debajo
              * del navbar, centrados en la pantalla. expand=false limita a 3 toasts
              * visibles apilados. closeButton para cerrar manualmente.
              */}
            <Toaster position="top-center" richColors expand={false} closeButton />

            {isSidebarOpenMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 animate-fade-in"
                    onClick={() => setIsSidebarOpenMobile(false)}
                />
            )}

            <Sidebar
                isSidebarCollapsed={isSidebarCollapsed}
                isSidebarOpenMobile={isSidebarOpenMobile}
                onCloseSidebarMobile={() => setIsSidebarOpenMobile(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={handleToggleDarkMode}
                    onToggleSidebar={handleToggleSidebar}
                    isSidebarCollapsed={isSidebarCollapsed}
                    isSidebarOpenMobile={isSidebarOpenMobile}
                    noLeidas={noLeidas}
                    recientes={recientes}
                />

                {headerBottom}

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 space-y-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
