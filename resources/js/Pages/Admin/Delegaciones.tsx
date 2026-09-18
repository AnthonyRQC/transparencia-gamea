import { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { KeyRound, Plus } from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import TablaResponsive from '@/Components/Admin/TablaResponsive';
import ConfirmDialog from '@/Components/Denuncias/Shared/ConfirmDialog';
import ListaVacia from '@/Components/Denuncias/Shared/ListaVacia';
import { ROL_LABEL } from '@/Components/Admin/usuarios';
import { useCan } from '@/hooks/useCan';
import type { SharedPageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';

interface DelegacionRow {
  id: number;
  beneficiario: string | null;
  beneficiario_username: string | null;
  beneficiario_rol: string | null;
  permisos: string[];
  desde: string | null;
  hasta: string | null;
  motivo: string;
  otorgado_por: string | null;
  revocado_at: string | null;
  programada: boolean;
  vigente: boolean;
}

interface Elegible {
  id: number;
  name: string;
  username: string;
  rol: string;
}

interface Props extends SharedPageProps {
  delegaciones: DelegacionRow[];
  elegibles: Elegible[];
  paquetes: Record<string, string[]>;
  delegable: string[];
}

const PAQUETE_LABEL: Record<string, string> = {
  jefe_interino: 'Jefe interino (operación)',
  bandeja_admision: 'Bandeja y admisión',
  reportes: 'Reportes y dashboard',
  consulta: 'Consulta y códigos',
  avisos: 'Avisos del portal',
};

const GRUPOS: Array<{ titulo: string; prefijos: string[] }> = [
  { titulo: 'Casos', prefijos: ['caso.', 'denuncia.'] },
  { titulo: 'Bandeja y reportes', prefijos: ['menu.bandeja', 'menu.reportes', 'reporte.'] },
  { titulo: 'Consulta', prefijos: ['menu.consultar', 'consulta.'] },
  { titulo: 'Archivos', prefijos: ['archivo.'] },
  { titulo: 'Avisos', prefijos: ['menu.publicaciones', 'publicacion.'] },
  { titulo: 'Notificaciones', prefijos: ['menu.notificaciones', 'notificacion.'] },
];

export default function Delegaciones() {
  const { delegaciones, elegibles, paquetes, delegable } = usePage().props as unknown as Props;
  const puedeEditar = useCan('usuario.editar');

  const [tab, setTab] = useState<'activas' | 'programadas' | 'historial'>('activas');
  const [crearOpen, setCrearOpen] = useState(false);
  const [revocar, setRevocar] = useState<DelegacionRow | null>(null);

  const [beneficiario, setBeneficiario] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [processing, setProcessing] = useState(false);

  const filtradas = useMemo(() => {
    if (tab === 'activas') return delegaciones.filter((d) => d.vigente);
    if (tab === 'programadas') return delegaciones.filter((d) => !d.vigente && !d.revocado_at && d.programada);
    return delegaciones.filter((d) => d.revocado_at || (!d.vigente && !d.programada));
  }, [delegaciones, tab]);

  const togglePermiso = (p: string) =>
    setSeleccionados((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));

  const aplicarPaquete = (key: string) => setSeleccionados([...(paquetes[key] ?? [])]);

  const guardar = () => {
    setProcessing(true);
    router.post(route('admin.delegaciones.store'), {
      user_id: Number(beneficiario),
      permisos: seleccionados,
      desde: desde || null,
      hasta: hasta || null,
      motivo,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Funciones delegadas.');
        setCrearOpen(false);
        setBeneficiario('');
        setSeleccionados([]);
        setDesde('');
        setHasta('');
        setMotivo('');
      },
      onError: (errors) => toast.error(Object.values(errors).flat().join(' ')),
      onFinish: () => setProcessing(false),
    });
  };

  const fila = (d: DelegacionRow) => (
    <div className="space-y-1">
      <p className="font-semibold text-sm">{d.beneficiario} <span className="font-mono text-xs text-muted-foreground">{d.beneficiario_username}</span></p>
      <p className="text-xs text-muted-foreground">
        {[ROL_LABEL[d.beneficiario_rol ?? ''] ?? d.beneficiario_rol, `${d.permisos.length} permiso(s)`, d.hasta ? `hasta ${d.hasta.slice(0, 10)}` : 'sin fin', `por ${d.otorgado_por ?? '—'}`].join(' · ')}
      </p>
      <p className="text-xs italic text-muted-foreground">“{d.motivo}”</p>
    </div>
  );

  return (
    <AppLayout>
      <Head title="Delegaciones — Transparencia UTLCC" />

      <div className="flex flex-col gap-4">
        <PageHeader
          icon={<KeyRound className="shrink-0" />}
          titulo="Delegaciones temporales"
          subtitulo="Misma cuenta, dos funciones. Nunca usuarios ni administración."
          acciones={
            puedeEditar ? (
              <Button size="sm" onClick={() => setCrearOpen(true)} className="gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" />
                Delegar funciones
              </Button>
            ) : undefined
          }
          className="mb-0"
        />

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="activas">Activas ({delegaciones.filter((d) => d.vigente).length})</TabsTrigger>
            <TabsTrigger value="programadas">Programadas</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>
        </Tabs>

        {filtradas.length === 0 ? (
          <ListaVacia icon={KeyRound} titulo="Sin delegaciones" descripcion="Nadie opera con funciones delegadas ahora." />
        ) : (
          <TablaResponsive
            desktop={
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beneficiario / detalle</TableHead>
                    <TableHead>Estado</TableHead>
                    {puedeEditar && tab !== 'historial' && <TableHead className="text-right">Acción</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{fila(d)}</TableCell>
                      <TableCell>
                        {d.revocado_at
                          ? <Badge className="bg-muted text-muted-foreground border">Revocada</Badge>
                          : d.programada
                            ? <Badge variant="outline">Desde {d.desde?.slice(0, 10)}</Badge>
                            : <Badge className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">Vigente</Badge>}
                      </TableCell>
                      {puedeEditar && tab !== 'historial' && (
                        <TableCell className="text-right">
                          {!d.revocado_at && (
                            <Button variant="outline" size="sm" onClick={() => setRevocar(d)} className="cursor-pointer">
                              Revocar
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            }
            mobile={
              <>
                {filtradas.map((d) => (
                  <div key={d.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                    {fila(d)}
                    <div className="flex items-center justify-between">
                      {d.revocado_at
                        ? <Badge className="bg-muted text-muted-foreground border">Revocada</Badge>
                        : <Badge className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">Vigente</Badge>}
                      {puedeEditar && !d.revocado_at && tab !== 'historial' && (
                        <Button variant="outline" size="sm" onClick={() => setRevocar(d)} className="cursor-pointer">
                          Revocar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            }
          />
        )}
      </div>

      <Dialog open={crearOpen} onOpenChange={(v) => { if (!processing) setCrearOpen(v); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delegar funciones</DialogTitle>
            <DialogDescription>
              El beneficiario conserva su rol y suma estos permisos hasta la fecha fin o revocación.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Beneficiario *</Label>
              <Select value={beneficiario} onValueChange={setBeneficiario}>
                <SelectTrigger><SelectValue placeholder="Seleccionar persona" /></SelectTrigger>
                <SelectContent>
                  {elegibles.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name} · {ROL_LABEL[e.rol] ?? e.rol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Paquete (atajo)</Label>
              <Select value="" onValueChange={aplicarPaquete}>
                <SelectTrigger><SelectValue placeholder="Elegir paquete..." /></SelectTrigger>
                <SelectContent>
                  {Object.keys(paquetes).map((k) => (
                    <SelectItem key={k} value={k}>{PAQUETE_LABEL[k] ?? k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-desde">Desde (vacío = ahora)</Label>
              <Input id="d-desde" type="datetime-local" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-hasta">Hasta (vacío = hasta revocar)</Label>
              <Input id="d-hasta" type="datetime-local" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="d-motivo">Motivo *</Label>
              <Textarea id="d-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} placeholder="VACACIONES DEL TITULAR DEL 05 AL 12..." />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Permisos ({seleccionados.length})</p>
            {GRUPOS.map((g) => {
              const items = delegable.filter((p) => g.prefijos.some((x) => p.startsWith(x)));
              if (items.length === 0) return null;
              return (
                <div key={g.titulo} className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.titulo}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {items.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm rounded-lg border border-border px-2.5 py-1.5 cursor-pointer hover:bg-muted/50">
                        <Checkbox checked={seleccionados.includes(p)} onCheckedChange={() => togglePermiso(p)} />
                        <span className="font-mono text-xs">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={processing} onClick={() => setCrearOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={processing || !beneficiario || seleccionados.length === 0 || motivo.trim().length < 5}
              onClick={guardar}
            >
              {processing ? 'Delegando...' : 'Delegar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!revocar}
        onOpenChange={(v) => { if (!v) setRevocar(null); }}
        variant="confirm"
        titulo={`Revocar delegación de ${revocar?.beneficiario ?? ''}`}
        descripcion="Pierde las funciones delegadas de inmediato. Su rol base no cambia."
        confirmText="Revocar"
        cancelText="Cancelar"
        onConfirm={() => revocar && router.post(route('admin.delegaciones.revocar', { id: revocar.id }), {}, {
          preserveScroll: true,
          onSuccess: () => {
            toast.success('Delegación revocada.');
            setRevocar(null);
          },
          onError: (errors) => toast.error(Object.values(errors).flat().join(' ')),
        })}
      />
    </AppLayout>
  );
}
