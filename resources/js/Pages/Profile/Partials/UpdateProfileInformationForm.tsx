import InputError from '@/Components/Form/InputError';
import InputLabel from '@/Components/Form/InputLabel';
import TextInput from '@/Components/Form/TextInput';
import { Button } from '@/Components/ui/button';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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
            name: user.name,
            telefono: user.telefono ?? '',
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
                    Actualiza tu nombre y datos de contacto.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nombre completo" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full uppercase"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
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

                <div>
                    <InputLabel htmlFor="username" value="Usuario del sistema" />

                    <TextInput
                        id="username"
                        type="text"
                        className="mt-1 block w-full bg-muted/50 uppercase"
                        value={user.username}
                        disabled
                    />
                    <p className="mt-1 text-xs text-muted-foreground">El usuario del sistema no puede modificarse.</p>
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
