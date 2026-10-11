import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import InputError from '@/Components/Form/InputError';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ROL_LABEL, type UsuarioRow } from './usuarios';

interface Props {
  usuario: UsuarioRow | null;
  onOpenChange: (open: boolean) => void;
  rolesCreables: string[];
}

export default function ModalEditarUsuario({ usuario, onOpenChange, rolesCreables }: Props) {
  const [form, setForm] = useState({ nombres: '', apellidos: '', email: '', telefono: '', rol: '' });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (usuario) {
      const [nom, ...ape] = usuario.name.split(' ');
      setForm({
        nombres: nom ?? '',
        apellidos: ape.join(' ') || '',
        email: usuario.email ?? '',
        telefono: usuario.telefono ?? '',
        rol: usuario.rol,
      });
      setErrors({});
    }
  }, [usuario]);

  if (!usuario) return null;

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const guardar = () => {
    setProcessing(true);
    setErrors({});
    router.post(route('admin.usuarios.update', { id: usuario.id }), { ...form, email: form.email || null }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Usuario actualizado.');
        onOpenChange(false);
      },
      onError: (errs) => setErrors(errs as Record<string, string>),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <Dialog open={!!usuario} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            <span className="font-mono font-bold">{usuario.username}</span>
            {' · '}CI {usuario.ci ?? '—'}. El username y el CI no se editan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="e-nombres">Nombres *</Label>
            <Input id="e-nombres" value={form.nombres} onChange={set('nombres')} autoComplete="off" />
            <InputError message={errors.nombres} className="mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-apellidos">Apellidos *</Label>
            <Input id="e-apellidos" value={form.apellidos} onChange={set('apellidos')} autoComplete="off" />
            <InputError message={errors.apellidos} className="mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-email">Email</Label>
            <Input id="e-email" type="email" value={form.email} onChange={set('email')} autoComplete="off" />
            <InputError message={errors.email} className="mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-tel">Teléfono</Label>
            <Input id="e-tel" value={form.telefono} onChange={set('telefono')} autoComplete="off" />
            <InputError message={errors.telefono} className="mt-1" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="e-rol">Rol *</Label>
            <Select value={form.rol} onValueChange={(v) => setForm((f) => ({ ...f, rol: v }))}>
              <SelectTrigger id="e-rol" className="max-w-full"><SelectValue className="truncate" /></SelectTrigger>
              <SelectContent>
                {rolesCreables.map((r) => (
                  <SelectItem key={r} value={r}>{ROL_LABEL[r] ?? r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.rol} className="mt-1" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={processing} onClick={guardar}>
            {processing ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
