import InputError from '@/Components/Form/InputError';
import InputLabel from '@/Components/Form/InputLabel';
import TextInput from '@/Components/Form/TextInput';
import InvestigadorAvatar from '@/Components/Denuncias/Shared/InvestigadorAvatar';
import { Button } from '@/Components/ui/button';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { cn } from '@/lib/utils';

/** Paleta oficial (réplica de User::COLORES_AVATAR). */
export const COLORES_AVATAR = [
    'bg-primary',
    'bg-teal-600',
    'bg-amber-500',
    'bg-[#431377]',
    'bg-secondary',
    'bg-slate-500',
];

export default function UpdateProfileInformation({
    status,
    className = '',
}: {
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            nombres: (user.nombres as string | undefined) ?? user.name.split(' ')[0] ?? '',
            apellidos: (user.apellidos as string | undefined) ?? user.name.split(' ').slice(1).join(' ') ?? '',
            email: user.email ?? '',
            telefono: (user.telefono as string | undefined) ?? '',
            color: (user.color as string | undefined) ?? COLORES_AVATAR[0],
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-foreground">
                    Información del Perfil
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Actualiza tus datos. El CI, el usuario y el rol solo los cambia un administrador.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="nombres" value="Nombres" />

                        <TextInput
                            id="nombres"
                            className="mt-1 block w-full uppercase"
                            value={data.nombres}
                            onChange={(e) => setData('nombres', e.target.value)}
                            required
                            isFocused
                            autoComplete="off"
                        />

                        <InputError className="mt-2" message={errors.nombres} />
                    </div>

                    <div>
                        <InputLabel htmlFor="apellidos" value="Apellidos" />

                        <TextInput
                            id="apellidos"
                            className="mt-1 block w-full uppercase"
                            value={data.apellidos}
                            onChange={(e) => setData('apellidos', e.target.value)}
                            required
                            autoComplete="off"
                        />

                        <InputError className="mt-2" message={errors.apellidos} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="email"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    <div>
                        <InputLabel htmlFor="telefono" value="Teléfono" />

                        <TextInput
                            id="telefono"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.telefono}
                            onChange={(e) => setData('telefono', e.target.value)}
                            autoComplete="tel"
                        />

                        <InputError className="mt-2" message={errors.telefono} />
                    </div>
                </div>

                <div>
                    <InputLabel value="Color de avatar" />

                    <div className="mt-2 flex items-center gap-2">
                        {COLORES_AVATAR.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setData('color', c)}
                                aria-label={`Color ${c}`}
                                className={cn(
                                    'w-9 h-9 rounded-full cursor-pointer ring-offset-2 ring-offset-background',
                                    data.color === c && 'ring-2 ring-primary'
                                )}
                            >
                                <InvestigadorAvatar nombre={user.name} color={c} size="md" className="w-9 h-9" />
                            </button>
                        ))}
                    </div>

                    <InputError className="mt-2" message={errors.color} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="username" value="Usuario del sistema" />

                        <TextInput
                            id="username"
                            type="text"
                            className="mt-1 block w-full bg-muted/50 uppercase"
                            value={user.username}
                            disabled
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="ci" value="CI" />

                        <TextInput
                            id="ci"
                            type="text"
                            className="mt-1 block w-full bg-muted/50"
                            value={(user.ci as string | undefined) ?? ''}
                            disabled
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button id="btn-guardar-perfil" type="submit" disabled={processing}>
                        Guardar cambios
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-teal-700 dark:text-teal-400 font-medium">
                            ✓ Guardado correctamente.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
