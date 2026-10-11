import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import InputError from '@/Components/Form/InputError';
import PasswordInput from '@/Components/Form/PasswordInput';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ROL_LABEL, previewUsername } from './usuarios';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rolesCreables: string[];
}

const VACIO = { nombres: '', apellidos: '', ci: '', rol: '', email: '', telefono: '', password: '' };

export default function ModalCrearUsuario({ open, onOpenChange, rolesCreables }: Props) {
  const [form, setForm] = useState(VACIO);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof VACIO) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const usernamePreview = previewUsername(form.nombres, form.apellidos, form.ci);

  const generarPassword = () => {
    const ci = form.ci.trim();
    if (ci !== '') {
      setForm((f) => ({ ...f, password: `Gamea-${ci}` }));
    } else {
      const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let extra = '';
      for (let i = 0; i < 8; i++) {
        extra += alfabeto[Math.floor(Math.random() * alfabeto.length)];
      }
      setForm((f) => ({ ...f, password: `Gamea-${extra}` }));
    }
  };

  const guardar = () => {
    setProcessing(true);
    setErrors({});
    router.post(route('admin.usuarios.store'), { ...form, email: form.email || null }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Usuario creado. Guarda la credencial temporal.');
        setForm(VACIO);
        onOpenChange(false);
      },
      onError: (errs) => setErrors(errs as Record<string, string>),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            El username se genera solo (iniciales + CI) y no se puede editar.
            La contraseña inicial debe cambiarse en el primer login.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="u-nombres">Nombres *</Label>
            <Input id="u-nombres" value={form.nombres} onChange={set('nombres')} placeholder="JUAN CARLOS" autoComplete="off" />
            <InputError message={errors.nombres} className="mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-apellidos">Apellidos *</Label>
            <Input id="u-apellidos" value={form.apellidos} onChange={set('apellidos')} placeholder="PÉREZ LÓPEZ" autoComplete="off" />
            <InputError message={errors.apellidos} className="mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-ci">CI * (único)</Label>
            <Input id="u-ci" value={form.ci} onChange={set('ci')} placeholder="123456-1A" autoComplete="off" />
            <InputError message={errors.ci} className="mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-rol">Rol *</Label>
            <Select value={form.rol} onValueChange={(v) => setForm((f) => ({ ...f, rol: v }))}>
              <SelectTrigger id="u-rol" className="max-w-full"><SelectValue placeholder="Seleccionar rol" className="truncate" /></SelectTrigger>
              <SelectContent>
                {rolesCreables.map((r) => (
                  <SelectItem key={r} value={r}>{ROL_LABEL[r] ?? r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.rol} className="mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-email">Email (opcional)</Label>
            <Input id="u-email" type="email" value={form.email} onChange={set('email')} placeholder="usuario@gam-ea.bo" autoComplete="off" />
            <InputError message={errors.email} className="mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-tel">Teléfono (opcional)</Label>
            <Input id="u-tel" value={form.telefono} onChange={set('telefono')} placeholder="71234567" autoComplete="off" />
            <InputError message={errors.telefono} className="mt-1" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="u-pass">Contraseña inicial * (mín. 10, mayúscula, minúscula y número)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <PasswordInput id="u-pass" value={form.password} onChange={set('password')} placeholder="Temporal que se muestra una vez" autoComplete="new-password" />
              </div>
              <Button type="button" variant="outline" onClick={generarPassword} className="shrink-0 cursor-pointer">
                Generar Gamea-CI
              </Button>
            </div>
            <InputError message={errors.password} className="mt-1" />
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Username generado: </span>
          <span className="font-mono font-bold">{usernamePreview || '—'}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={processing} onClick={guardar}>
            {processing ? 'Creando...' : 'Crear usuario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
