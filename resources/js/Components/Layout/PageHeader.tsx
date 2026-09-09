import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    /** Icono lucide de la página (se pinta en text-primary, w-7/8) */
    icon: React.ReactNode;
    /** Título h1 de la página */
    titulo: string;
    /** Contenido extra junto al título (ej. contador) */
    tituloExtra?: React.ReactNode;
    /** Subtítulo descriptivo (una línea, sin jerga dev) */
    subtitulo?: React.ReactNode;
    /** Acciones a la derecha (botones). En móvil van debajo del título. */
    acciones?: React.ReactNode;
    className?: string;
}

/**
 * Cabecera institucional canónica (DESIGN.md §4).
 * Toda página con AppLayout la usa en vez de un h1 custom.
 */
export default function PageHeader({ icon, titulo, tituloExtra, subtitulo, acciones, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6', className)}>
            <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 text-primary [&>svg]:w-7 [&>svg]:h-7 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
                    {icon}
                </span>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{titulo}</h1>
                        {tituloExtra}
                    </div>
                    {subtitulo && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitulo}</p>
                    )}
                </div>
            </div>
            {acciones && <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">{acciones}</div>}
        </div>
    );
}
