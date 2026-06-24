import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
    activeTab?: string;
    onSelectTab?: (tab: string) => void;
}

export default function AppLayout({
    children,
    activeTab = 'inicio',
    onSelectTab = () => {},
}: AppLayoutProps) {
    // Modo oscuro inicializado de localStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dark_mode') === 'true';
        }
        return false;
    });

    // Sidebar colapsado por defecto (true) a menos que haya un estado guardado en localStorage
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar_collapsed');
            return saved !== null ? saved === 'true' : true;
        }
        return true;
    });

    const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

    // Sincronizar clase .dark reactivamente
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const handleToggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpenMobile(!isSidebarOpenMobile);
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
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col font-sans">
            {/* Header */}
            <Header
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onToggleSidebar={handleToggleSidebar}
                isSidebarCollapsed={isSidebarCollapsed}
                isSidebarOpenMobile={isSidebarOpenMobile}
            />

            {/* Sidebar + Main Layout Wrapper */}
            <div className="flex-1 flex flex-row relative min-h-[calc(100vh-73px)]">
                
                {/* Mobile Drawer Backdrop */}
                {isSidebarOpenMobile && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 animate-fade-in"
                        onClick={() => setIsSidebarOpenMobile(false)}
                    />
                )}

                {/* Sidebar */}
                <Sidebar
                    isSidebarCollapsed={isSidebarCollapsed}
                    isSidebarOpenMobile={isSidebarOpenMobile}
                    onCloseSidebarMobile={() => setIsSidebarOpenMobile(false)}
                    activeTab={activeTab}
                    onSelectTab={onSelectTab}
                />

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-8 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground bg-card/20 font-mono z-10">
                <p>Laravel 11 + Inertia.js + React 18 + Tailwind CSS v3</p>
                <p className="text-[11px] opacity-75 mt-1">Línea Gráfica Establecida con Éxito</p>
            </footer>
        </div>
    );
}
