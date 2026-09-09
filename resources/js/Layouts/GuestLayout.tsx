import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import type { SharedPageProps } from '@/types';

export default function Guest({ children }: PropsWithChildren) {
    const { utlcc_logo_url } = usePage().props as unknown as SharedPageProps;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            {/* Logo institucional */}
            <div className="mb-6">
                <Link href="/" aria-label="Ir al inicio">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg ring-4 ring-primary/20">
                        <ApplicationLogo className="h-10 w-10 fill-current text-primary-foreground" />
                    </div>
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
