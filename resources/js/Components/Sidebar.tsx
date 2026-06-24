import React from 'react';

interface MenuItem {
    key: string;
    label: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    isSidebarCollapsed: boolean;
    isSidebarOpenMobile: boolean;
    onCloseSidebarMobile: () => void;
    activeTab: string;
    onSelectTab: (tab: string) => void;
}

export default function Sidebar({
    isSidebarCollapsed,
    isSidebarOpenMobile,
    onCloseSidebarMobile,
    activeTab,
    onSelectTab,
}: SidebarProps) {
    const menuItems: MenuItem[] = [
        {
            key: 'inicio',
            label: 'Inicio',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="9" x="3" y="3" rx="1"/>
                    <rect width="7" height="5" x="14" y="3" rx="1"/>
                    <rect width="7" height="9" x="14" y="12" rx="1"/>
                    <rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
            )
        },
        {
            key: 'transparencia',
            label: 'Transparencia Activa',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" x2="8" y1="13" y2="13"/>
                    <line x1="16" x2="8" y1="17" y2="17"/>
                    <line x1="10" x2="8" y1="9" y2="9"/>
                </svg>
            )
        },
        {
            key: 'solicitudes',
            label: 'Solicitudes',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            )
        },
        {
            key: 'finanzas',
            label: 'Finanzas Públicas',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" x2="12" y1="2" y2="22"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            )
        },
        {
            key: 'configuracion',
            label: 'Configuración',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
            )
        }
    ];

    return (
        <aside 
            className={`
                bg-card border-r border-border flex flex-col pt-6 select-none shrink-0 transition-all duration-300 ease-in-out
                fixed inset-y-0 left-0 z-50 w-64 transform md:relative md:translate-x-0 md:z-auto
                ${isSidebarOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
                ${isSidebarCollapsed ? 'md:w-16' : 'md:w-64'}
            `}
        >
            {/* Mobile Sidebar Header with Close Button */}
            <div className="flex md:hidden items-center justify-between px-4 pb-4 border-b border-border/60 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
                        T
                    </div>
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

            {/* Navigation Items */}
            <nav className="flex-1 px-3 space-y-1.5">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={() => {
                                onSelectTab(item.key);
                                onCloseSidebarMobile();
                            }}
                            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative overflow-hidden group focus:outline-none ${
                                isActive 
                                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10' 
                                    : 'text-muted-foreground hover:bg-primary/8 hover:text-primary'
                            }`}
                            title={isSidebarCollapsed ? item.label : undefined}
                        >
                            {/* Sidebar Active Indicator Bar */}
                            {isActive && (
                                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-secondary rounded-full" />
                            )}

                            {/* Icon */}
                            <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-inherit' : 'text-primary'}`}>
                                {item.icon}
                            </span>

                            {/* Label Text - Responsive collapse */}
                            <span 
                                className={`
                                    transition-all duration-300 ease-in-out origin-left whitespace-nowrap text-left
                                    opacity-100 scale-100 w-auto
                                    md:${isSidebarCollapsed ? 'opacity-0 w-0 scale-95 pointer-events-none overflow-hidden' : 'opacity-100 w-auto'}
                                `}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Sidebar Footer Info */}
            <div className="p-4 border-t border-border/60 text-center shrink-0">
                <div className={`transition-all duration-300 md:${isSidebarCollapsed ? 'scale-0 h-0 overflow-hidden' : 'scale-100'}`}>
                    <span className="text-[10px] text-muted-foreground font-mono">v1.0.0 Alpha</span>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full mx-auto bg-primary transition-all duration-300 md:${isSidebarCollapsed ? 'scale-100' : 'scale-0 h-0'}`} />
            </div>
        </aside>
    );
}
