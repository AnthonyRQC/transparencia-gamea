import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Users, UserPlus, Pencil, KeyRound, UserX, UserCheck } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import TablaResponsive from '@/Components/Admin/TablaResponsive';
import ConfirmDialog from '@/Components/Denuncias/Shared/ConfirmDialog';
import InvestigadorAvatar from '@/Components/Denuncias/Shared/InvestigadorAvatar';
import ListaVacia from '@/Components/Denuncias/Shared/ListaVacia';
import ModalCrearUsuario from '@/Components/Admin/ModalCrearUsuario';
import ModalEditarUsuario from '@/Components/Admin/ModalEditarUsuario';
import ModalCredencialTemporal, { type CredencialTemporal } from '@/Components/Admin/ModalCredencialTemporal';
import ModalImpactoDesactivar from '@/Components/Admin/ModalImpactoDesactivar';
import { ROL_LABEL, type UsuarioRow } from '@/Components/Admin/usuarios';
import { useCan } from '@/hooks/useCan';
import type { SharedPageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

interface Props extends SharedPageProps {
  usuarios: UsuarioRow[];
  filtros: { q: string; rol: string; estado: string };
  contadores: { admins: number; jefes: number };
  roles_creables: string[];
}

export default function Usuarios() {
  const { usuarios, filtros, contadores, roles_creables, credencialTemporal } = usePage().props as unknown as Props;
  const puedeCrear = useCan('usuario.crear');
  const puedeEditar = useCan('usuario.editar');
  const puedeReset = useCan('usuario.reset-password');
  const puedeDesactivar = useCan('usuario.desactivar');

  const [crearOpen, setCrearOpen] = useState(false);
  const [editar, setEditar] = useState<UsuarioRow | null>(null);
  const [desactivar, setDesactivar] = useState<UsuarioRow | null>(null);
  const [resetTarget, setResetTarget] = useState<UsuarioRow | null>(null);
  const [reactivarTarget, setReactivarTarget] = useState<UsuarioRow | null>(null);
  const [credencial, setCredencial] = useState<CredencialTemporal | null>(null);
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [q, setQ] = useState(filtros.q);

  useEffect(() => {
    if (credencialTemporal) setCredencial(credencialTemporal as CredencialTemporal);
  }, [credencialTemporal]);

  const aplicarFiltros = (next: Partial<Props['filtros']>) => {
    router.get(route('admin.usuarios.index'), { ...filtros, ...next }, { preserveState: true, preserveScroll: true });
  };

  const postSimple = (url: string, data: Parameters<typeof router.post>[1], ok: string) => {
    router.post(url, data, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(ok);
        setSeleccion([]);
        setResetTarget(null);
        setReactivarTarget(null);
      },
      onError: (errors) => toast.error(Object.values(errors).flat().join(' ')),
    });
  };

  const toggleSel = (id: number) =>
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const investigadores = usuarios.filter((u) => u.activo && (u.rol === 'investigador' || u.rol === 'jefe'));

  const celdaUsuario = (u: UsuarioRow) => (
    <div className="flex items-center gap-2.5">
      <InvestigadorAvatar nombre={u.name} color={u.color} size="sm" />
      <div>
        <p className="font-semibold text-sm leading-tight">{u.name}</p>
        <p className="font-mono text-xs text-muted-foreground">{u.username}</p>
      </div>
    </div>
  );

  const celdaContacto = (u: UsuarioRow) => (
    <div className="text-sm">
      <p className="font-mono">{u.ci ?? '—'}</p>
      <p className="text-xs text-muted-foreground">{[u.email, u.telefono].filter(Boolean).join(' · ') || '—'}</p>
    </div>
  );

  const celdaRol = (u: UsuarioRow) => (
    <div className="flex flex-col gap-1 items-start">
      <Badge variant="outline">{ROL_LABEL[u.rol] ?? u.rol}</Badge>
      {u.activo ? (
        <Badge className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">Activo</Badge>
      ) : (
        <Badge className="bg-muted text-muted-foreground border">Inactivo{u.desactivado_at ? ` · ${u.desactivado_at.slice(0, 10)}` : ''}</Badge>
      )}
        {u.casos_activos > 0 && (
          <span className="text-xs text-muted-foreground">{u.casos_activos} caso(s)</span>
        )}
        {(u.delegaciones_activas ?? 0) > 0 && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Delegación activa</span>
        )}
      </div>
  );

  const acciones = (u: UsuarioRow) => (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {puedeEditar && (
        <Button variant="outline" size="sm" onClick={() => setEditar(u)} className="gap-1 cursor-pointer">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Button>
      )}
      {puedeReset && (
        <Button variant="outline" size="sm" onClick={() => setResetTarget(u)} className="gap-1 cursor-pointer">
          <KeyRound className="w-3.5 h-3.5" /> Reset
        </Button>
      )}
      {puedeDesactivar && u.activo && (
        <Button variant="outline" size="sm" onClick={() => setDesactivar(u)} className="gap-1 cursor-pointer">
          <UserX className="w-3.5 h-3.5" /> Desactivar
        </Button>
      )}
      {puedeDesactivar && !u.activo && (
        <Button variant="outline" size="sm" onClick={() => setReactivarTarget(u)} className="gap-1 cursor-pointer">
          <UserCheck className="w-3.5 h-3.5" /> Reactivar
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout>
      <Head title="Usuarios — Transparencia UTLCC" />

      <div className="flex flex-col gap-4">
        <PageHeader
          icon={<Users className="shrink-0" />}
          titulo="Usuarios"
          subtitulo={`Admins activos: ${contadores.admins} · Jefes activos: ${contadores.jefes}`}
          acciones={
            puedeCrear ? (
              <Button size="sm" onClick={() => setCrearOpen(true)} className="gap-1.5 cursor-pointer">
                <UserPlus className="w-4 h-4" />
                Nuevo usuario
              </Button>
            ) : undefined
          }
          className="mb-0"
        />

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltros({ q }); }}
            placeholder="Buscar nombre, username o CI..."
            className="sm:max-w-xs"
          />
          <Select value={filtros.rol || 'todos'} onValueChange={(v) => aplicarFiltros({ rol: v === 'todos' ? '' : v })}>
            <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los roles</SelectItem>
              {['admin', 'jefe', 'investigador', 'registrador'].map((r) => (
                <SelectItem key={r} value={r}>{ROL_LABEL[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtros.estado} onValueChange={(v) => aplicarFiltros({ estado: v })}>
            <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => aplicarFiltros({ q })} className="cursor-pointer">
            Buscar
          </Button>
        </div>

        {seleccion.length > 0 && puedeDesactivar && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <span className="font-semibold">{seleccion.length} seleccionado(s)</span>
            <Button variant="outline" size="sm" onClick={() => postSimple(route('admin.usuarios.masivo'), { ids: seleccion, accion: 'desactivar' }, 'Lote desactivado.')} className="cursor-pointer">
              Desactivar lote
            </Button>
            <Button variant="outline" size="sm" onClick={() => postSimple(route('admin.usuarios.masivo'), { ids: seleccion, accion: 'reactivar' }, 'Lote reactivado.')} className="cursor-pointer">
              Reactivar lote
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSeleccion([])} className="cursor-pointer">
              Limpiar
            </Button>
          </div>
        )}

        {usuarios.length === 0 ? (
          <ListaVacia icon={Users} titulo="Sin usuarios" descripcion="Ajusta los filtros o crea el primero." />
        ) : (
          <TablaResponsive
            desktop={
              <Table>
                <TableHeader>
                  <TableRow>
                    {puedeDesactivar && <TableHead className="w-10" />}
                    <TableHead>Usuario</TableHead>
                    <TableHead>CI / Contacto</TableHead>
                    <TableHead>Rol / Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.id} className={!u.activo ? 'opacity-60' : undefined}>
                      {puedeDesactivar && (
                        <TableCell>
                          <Checkbox
                            checked={seleccion.includes(u.id)}
                            onCheckedChange={() => toggleSel(u.id)}
                            aria-label={`Seleccionar ${u.username}`}
                          />
                        </TableCell>
                      )}
                      <TableCell>{celdaUsuario(u)}</TableCell>
                      <TableCell>{celdaContacto(u)}</TableCell>
                      <TableCell>{celdaRol(u)}</TableCell>
                      <TableCell className="text-right">{acciones(u)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            }
            mobile={
              <>
                {usuarios.map((u) => (
                  <details key={u.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center gap-2.5">
                        {puedeDesactivar && (
                          <span onClick={(e) => e.stopPropagation()}>
                            <Checkbox checked={seleccion.includes(u.id)} onCheckedChange={() => toggleSel(u.id)} aria-label={`Seleccionar ${u.username}`} />
                          </span>
                        )}
                        <InvestigadorAvatar nombre={u.name} color={u.color} size="sm" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{u.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{u.username} · {ROL_LABEL[u.rol] ?? u.rol}</p>
                        </div>
                        {u.activo
                          ? <Badge className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">Activo</Badge>
                          : <Badge className="bg-muted text-muted-foreground border">Inactivo</Badge>}
                      </div>
                    </summary>
                    <div className="text-sm space-y-1 pt-1">
                      <p><span className="text-muted-foreground">CI:</span> <span className="font-mono">{u.ci ?? '—'}</span></p>
                      <p><span className="text-muted-foreground">Contacto:</span> {[u.email, u.telefono].filter(Boolean).join(' · ') || '—'}</p>
                      {u.casos_activos > 0 && <p><span className="text-muted-foreground">Casos:</span> {u.casos_activos}</p>}
                      {acciones(u)}
                    </div>
                  </details>
                ))}
              </>
            }
          />
        )}
      </div>

      <ModalCrearUsuario open={crearOpen} onOpenChange={setCrearOpen} rolesCreables={roles_creables} />
      <ModalEditarUsuario usuario={editar} onOpenChange={(v) => { if (!v) setEditar(null); }} rolesCreables={roles_creables} />
      <ModalImpactoDesactivar usuario={desactivar} investigadores={investigadores} onOpenChange={(v) => { if (!v) setDesactivar(null); }} />
      <ModalCredencialTemporal credencial={credencial} onClose={() => setCredencial(null)} />

      <ConfirmDialog
        open={!!resetTarget}
        onOpenChange={(v) => { if (!v) setResetTarget(null); }}
        variant="confirm"
        titulo={`Resetear contraseña de ${resetTarget?.username ?? ''}`}
        descripcion="Se genera una temporal (una sola vez) y se cierran sus sesiones. Deberá cambiarla al entrar."
        confirmText="Generar temporal"
        cancelText="Cancelar"
        onConfirm={() => resetTarget && postSimple(route('admin.usuarios.reset', { id: resetTarget.id }), {}, 'Temporal generada.')}
      />
      <ConfirmDialog
        open={!!reactivarTarget}
        onOpenChange={(v) => { if (!v) setReactivarTarget(null); }}
        variant="confirm"
        titulo={`Reactivar a ${reactivarTarget?.username ?? ''}`}
        descripcion="Vuelve a tener acceso con su misma contraseña."
        confirmText="Reactivar"
        cancelText="Cancelar"
        onConfirm={() => reactivarTarget && postSimple(route('admin.usuarios.reactivar', { id: reactivarTarget.id }), {}, 'Usuario reactivado.')}
      />
    </AppLayout>
  );
}
