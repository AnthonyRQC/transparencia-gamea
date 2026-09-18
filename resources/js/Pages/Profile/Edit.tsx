import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { KeyRound, User } from 'lucide-react';
import PreferenciasNotificacionForm from './Partials/PreferenciasNotificacionForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    status,
}: PageProps<{ status?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const debeCambiar = !!(auth?.user as { debe_cambiar_password?: boolean } | undefined)?.debe_cambiar_password;

    return (
        <AppLayout>
            <Head title="Mi Perfil" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <PageHeader
                    icon={<User className="shrink-0" />}
                    titulo="Mi Perfil"
                    subtitulo="Gestiona tu información personal y seguridad de cuenta."
                    className="mb-8"
                />

                <div className="mx-auto max-w-2xl space-y-6">
                    {debeCambiar && (
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                            <KeyRound className="w-5 h-5 shrink-0 text-amber-600" />
                            <p>
                                <span className="font-semibold">Tienes una contraseña temporal.</span>{' '}
                                Cámbiala abajo antes de continuar usando el sistema.
                            </p>
                        </div>
                    )}

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <UpdateProfileInformationForm
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <PreferenciasNotificacionForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
