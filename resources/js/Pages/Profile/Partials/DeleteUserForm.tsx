import InputError from '@/Components/Form/InputError';
import InputLabel from '@/Components/Form/InputLabel';
import TextInput from '@/Components/Form/TextInput';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-foreground">
                    Eliminar cuenta
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Una vez eliminada tu cuenta, todos los datos serán borrados permanentemente.
                    Descarga cualquier información que desees conservar antes de continuar.
                </p>
            </header>

            <Button
                id="btn-eliminar-cuenta"
                variant="destructive"
                onClick={confirmUserDeletion}
                type="button"
            >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Eliminar mi cuenta
            </Button>

            <Dialog open={confirmingUserDeletion} onOpenChange={(open) => { if (!open) closeModal(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Confirmas la eliminación de tu cuenta?</DialogTitle>
                        <DialogDescription>
                            Esta acción es <strong>irreversible</strong>. Todos los recursos y datos
                            asociados a tu cuenta serán eliminados permanentemente.
                            Ingresa tu contraseña para confirmar.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={deleteUser}>
                        <div className="mt-2">
                            <InputLabel
                                htmlFor="delete-password"
                                value="Contraseña"
                                className="sr-only"
                            />

                            <TextInput
                                id="delete-password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="mt-1 block w-full"
                                isFocused
                                placeholder="Ingresa tu contraseña"
                            />

                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                id="btn-cancelar-eliminar"
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                                id="btn-confirmar-eliminar"
                            >
                                Sí, eliminar cuenta
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
