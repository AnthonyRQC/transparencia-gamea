import AppLayout from '@/Components/Layout/AppLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    status,
}: PageProps<{ status?: string }>) {
    return (
        <AppLayout>
            <Head title="Mi Perfil" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Mi Perfil</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Gestiona tu información personal y seguridad de cuenta.</p>
                </div>

                <div className="mx-auto max-w-2xl space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <UpdateProfileInformationForm
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="rounded-2xl border border-destructive/20 bg-card p-6 shadow-sm">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
