import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import InstitutionalLogo from '@/Components/Layout/InstitutionalLogo';

interface PublicHeaderProps {
    /** Acciones a la derecha (toggle dark, accesos, volver, etc.) */
    acciones?: React.ReactNode;
}

/**
 * Cabecera pública canónica (DESIGN.md §4).
 * Morado casi negro institucional #1E0A33 (token sidebar), igual que la app interna.
 * La usan Welcome y Seguimiento/Buscar en vez de headers duplicados.
 */
export default function PublicHeader({ acciones }: PublicHeaderProps) {
    return (
        <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 z-50 px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
            <Link href={route('home')} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 group">
                <InstitutionalLogo size="sm" />
                <div className="min-w-0">
                    <h1 className="text-sm xs:text-base sm:text-lg font-bold tracking-tight text-sidebar-foreground leading-tight truncate group-hover:text-sidebar-accent transition-colors">
                        <span className="sm:hidden">GAMEA</span>
                        <span className="hidden sm:inline">Gobierno Autónomo Municipal de El Alto</span>
                    </h1>
                    <p className="hidden xs:block text-[10px] sm:text-xs text-sidebar-foreground/60 font-medium leading-none mt-0.5 truncate">
                        Unidad de Transparencia y Lucha Contra la Corrupción · UTLCC
                    </p>
                </div>
            </Link>

            {acciones && <div className="flex items-center gap-2 sm:gap-4 shrink-0">{acciones}</div>}
        </header>
    );
}
