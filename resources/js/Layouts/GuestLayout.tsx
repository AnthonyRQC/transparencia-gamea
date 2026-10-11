import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import type { SharedPageProps } from '@/types';

export default function Guest({ children }: PropsWithChildren) {
    const { logo_url, utlcc_logo_url } = usePage().props as unknown as SharedPageProps;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            {/* Escudo institucional GAMEA */}
            <div className="mb-6">
                <Link href="/" aria-label="Ir al inicio">
                    <img
                        src={logo_url || '/LOGO-OFICIAL-EL-ALTO.png'}
                        alt="GAMEA - Gobierno Autónomo Municipal de El Alto"
                        className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-md brightness-110"
                    />
                </Link>
            </div>

            {/* Tarjeta del formulario */}
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card px-8 py-8 shadow-xl">
                {children}
            </div>

            {/* Pie institucional */}
            <p className="mt-6 text-xs text-muted-foreground text-center">
                Sistema de Transparencia — UTLCC · GAMEA
            </p>
            {utlcc_logo_url && (
                <div className="mt-3 rounded-xl bg-white px-4 py-2 shadow-sm">
                    <img
                        src={utlcc_logo_url}
                        alt="UTLCC — Unidad de Transparencia y Lucha Contra la Corrupción"
                        className="h-9 w-auto object-contain"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = '/LOGO-UTLCC.png';
                        }}
                    />
                </div>
            )}
        </div>
    );
}
