import React from 'react';

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
    return (
        <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-50 px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Sidebar Toggle Button */}
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-foreground shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/40 mr-0.5 sm:mr-1"
                    aria-label="Toggle Sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        {/* Desktop paths: Hamburguesa si está colapsado, Chevron Izquierdo si está expandido */}
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={isSidebarCollapsed
                                ? "M4 6h16M4 12h16M4 18h16"
                                : "M15 19l-7-7 7-7"
                            }
                            className="hidden md:block"
                        />
                        {/* Mobile paths: X si está abierto, Hamburguesa si está cerrado */}
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={isSidebarOpenMobile
                                ? "M6 18L18 6M6 6l12 12"
                                : "M4 6h16M4 12h16M4 18h16"
                            }
                            className="block md:hidden"
                        />
                    </svg>
                </button>

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl shadow-md shadow-primary/20 hover:scale-110 hover:rotate-6 transition-all duration-300 shrink-0 cursor-pointer">
                        T
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm xs:text-base sm:text-xl font-bold tracking-tight text-foreground leading-tight truncate">Gobierno Autónomo Municipal El Alto</h1>
                        <p className="hidden xs:block text-[9px] sm:text-xs text-muted-foreground font-medium leading-none mt-0.5">Unidad de Transparencia y Lucha Contra la Corrupción</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={onToggleDarkMode}
                    className="p-2 sm:px-4 sm:py-2 rounded-lg bg-secondary text-secondary-foreground text-xs sm:text-sm font-semibold shadow hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                    {isDarkMode ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                            <span className="hidden xs:inline">Modo Claro</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                            <span className="hidden xs:inline">Modo Oscuro</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}
