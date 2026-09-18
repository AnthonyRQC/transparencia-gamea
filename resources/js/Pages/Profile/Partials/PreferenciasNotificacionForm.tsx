import InputError from '@/Components/Form/InputError';
import InputLabel from '@/Components/Form/InputLabel';
import TextInput from '@/Components/Form/TextInput';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Umbrales {
  plazo?: number;
  informe?: number;
  solicitud?: number;
  descargo?: number;
}

/** Preferencias de notificación (18B): master + 4 umbrales en días (0-10). */
export default function PreferenciasNotificacionForm({ className = '' }: { className?: string }) {
  const user = usePage().props.auth.user;
  const pref = (user.preferencias ?? {}) as { notificaciones?: boolean; umbrales?: Umbrales };
  const umb = pref.umbrales ?? {};

  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
    notificaciones: pref.notificaciones ?? true,
    umbral_plazo: umb.plazo ?? 3,
    umbral_informe: umb.informe ?? 3,
    umbral_solicitud: umb.solicitud ?? 2,
    umbral_descargo: umb.descargo ?? 2,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    patch(route('profile.preferencias'));
  };

  const umbral = (key: 'umbral_plazo' | 'umbral_informe' | 'umbral_solicitud' | 'umbral_descargo', label: string, help: string) => (
    <div>
      <InputLabel htmlFor={key} value={label} />

      <TextInput
        id={key}
        type="number"
        min={0}
        max={10}
        className="mt-1 block w-full"
        value={String(data[key])}
        onChange={(e) => setData(key, Number(e.target.value))}
      />

      <p className="mt-1 text-xs text-muted-foreground">{help}</p>
      <InputError className="mt-2" message={errors[key]} />
    </div>
  );

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-semibold text-foreground">
          Notificaciones
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Cuántos días antes de cada vencimiento quieres el aviso (0 = solo vencidos).
        </p>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Avisos de plazo</p>
            <p className="text-xs text-muted-foreground">Apagado = campana sin alertas derivadas.</p>
          </div>
          <Switch
            checked={data.notificaciones}
            onCheckedChange={(v) => setData('notificaciones', v)}
            aria-label="Activar avisos de plazo"
          />
        </div>
        <InputError message={errors.notificaciones} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {umbral('umbral_plazo', 'Plazo total del caso', 'Días antes del vencimiento total.')}
          {umbral('umbral_informe', 'Informe final', 'Días antes del plazo de informe.')}
          {umbral('umbral_solicitud', 'Solicitudes', 'Días antes del vencimiento de solicitudes.')}
          {umbral('umbral_descargo', 'Descargos', 'Días antes del vencimiento de descargos.')}
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={processing}>
            Guardar preferencias
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
