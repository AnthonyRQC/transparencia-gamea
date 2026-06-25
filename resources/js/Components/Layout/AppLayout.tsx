import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
    activeTab?: string;
    onSelectTab?: (tab: string) => void;
}

export default function AppLayout({ children }: AppLayoutProps) {
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

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

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
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col font-sans">
            <Header
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onToggleSidebar={handleToggleSidebar}
                isSidebarCollapsed={isSidebarCollapsed}
                isSidebarOpenMobile={isSidebarOpenMobile}
            />

            <div className="flex-1 flex flex-row relative min-h-[calc(100vh-73px)]">
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

                <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
