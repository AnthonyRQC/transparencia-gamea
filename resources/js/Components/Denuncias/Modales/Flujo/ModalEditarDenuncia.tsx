import { useState, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Plus, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DenunciadoItem {
  conoce_identidad: boolean; nombres: string; dependencia: string; descripcion: string;
}

interface PruebaItem {
  tipo: string; descripcion: string; testigo_nombre: string; testigo_telefono: string; archivo_nombre: string;
}

interface ModalEditarDenunciaProps {
  denuncia: {
    ticket: string; tipo: string; escenario?: string;
    denunciante?: { nombres?: string; ci?: string; email?: string; telefono?: string };
    denunciados?: DenunciadoItem[];
    detalles?: { categoria?: string; fecha?: string; hora?: string; lugar?: string };
    hechos?: string; pruebas?: PruebaItem[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function cloneDeep<T>(v: T): T { return JSON.parse(JSON.stringify(v)) as T; }

function emptyDenunciado(): DenunciadoItem {
  return { conoce_identidad: true, nombres: '', dependencia: '', descripcion: '' };
}
function emptyPrueba(): PruebaItem {
  return { tipo: 'archivo', descripcion: '', testigo_nombre: '', testigo_telefono: '', archivo_nombre: '' };
}

const DEFAULT_CATEGORIAS: Record<string, string> = {
  cohecho: 'Cohecho / Soborno',
  peculado: 'Peculado / Malversación de fondos',
  enriquecimiento_ilicito: 'Enriquecimiento Ilícito',
  uso_indebido_bienes: 'Uso Indebido de Bienes y Servicios Públicos',
  negativa_informacion: 'Negativa Indebida de Información',
  incumplimiento_deberes: 'Incumplimiento de Deberes',
  trafico_influencias: 'Tráfico de Influencias',
  falsedad_documental: 'Falsedad Documental / Uso de Instrumento Falsificado',
  otro: 'Otro delito de corrupción',
};

export default function ModalEditarDenuncia({ denuncia, open, onOpenChange }: ModalEditarDenunciaProps) {
  const pageProps = usePage().props as unknown as { categorias?: Record<string, string> };
  const categoriasMap = pageProps.categorias && Object.keys(pageProps.categorias).length > 0
    ? pageProps.categorias
    : DEFAULT_CATEGORIAS;

  const [escenario, setEscenario] = useState('revelada');
  const [denominante, setDenominante] = useState({ nombres: '', ci: '', email: '', telefono: '' });
  const [denunciados, setDenunciados] = useState<DenunciadoItem[]>([emptyDenunciado()]);
  const [detalles, setDetalles] = useState({ categoria: '', fecha: '', hora: '', lugar: '' });
  const [hechos, setHechos] = useState('');
  const [pruebas, setPruebas] = useState<PruebaItem[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open && denuncia) {
      const d = denuncia as any;
      setEscenario(d.escenario || 'revelada');

      setDenominante(d.denunciante ? {
        nombres: d.denunciante.nombres || '',
        ci: d.denunciante.ci || '',
        email: d.denunciante.email || '',
        telefono: d.denunciante.telefono || '',
      } : { nombres: '', ci: '', email: '', telefono: '' });

      setDenunciados(d.denunciados && d.denunciados.length > 0
        ? cloneDeep(d.denunciados.map((item: any) => ({
            conoce_identidad: item.conoce_identidad !== false,
            nombres: item.nombres || '',
            dependencia: item.dependencia || '',
            descripcion: item.descripcion || '',
          })))
        : [emptyDenunciado()]
      );

      const catClave = d.categoria?.clave || d.detalles?.categoria || (d.categoria_id ? String(d.categoria_id) : '');
      const fechaVal = d.fecha_hechos ? String(d.fecha_hechos).substring(0, 10) : (d.detalles?.fecha || '');
      const horaVal = d.hora_hechos ? String(d.hora_hechos).substring(0, 5) : (d.detalles?.hora || '');
      const lugarVal = d.lugar_hechos || d.detalles?.lugar || '';

      setDetalles({
        categoria: catClave,
        fecha: fechaVal,
        hora: horaVal,
        lugar: lugarVal,
      });

      setHechos(d.hechos || '');

      setPruebas(d.pruebas && d.pruebas.length > 0 ? cloneDeep(d.pruebas.map((p: any) => ({
        tipo: p.tipo || 'archivo',
        descripcion: p.descripcion || '',
        testigo_nombre: p.testigo_nombre || '',
        testigo_telefono: p.testigo_telefono || '',
        archivo_nombre: p.archivo_nombre || '',
      }))) : []);
    }
  }, [open, denuncia]);

  const updateDenunciado = useCallback((i: number, field: string, value: unknown) => {
    setDenunciados(prev => { const n = cloneDeep(prev); (n[i] as any)[field] = value; return n; });
  }, []);

  const updatePrueba = useCallback((i: number, field: string, value: unknown) => {
    setPruebas(prev => { const n = cloneDeep(prev); (n[i] as any)[field] = value; return n; });
  }, []);

  const handleSubmit = () => {
    if (!denuncia) return;
    setProcessing(true);
    router.post(
      route('denuncias.editar', { ticket: denuncia.ticket }),
      {
        escenario,
        denunciante: denominante,
        denunciados,
        detalles,
        hechos: hechos.trim(),
        pruebas,
      } as any,
      {
        preserveScroll: false,
        onSuccess: () => {
          toast.success(`Denuncia ${denuncia.ticket} actualizada correctamente`);
          onOpenChange(false);
          router.reload();
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al actualizar la denuncia');
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  const esAnonimo = escenario === 'anonimo';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar denuncia {denuncia?.ticket}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <p className="text-xs text-muted-foreground">
            Solo puede editar denuncias en estado <strong>Ingresada</strong>.
          </p>

          <div className="space-y-2">
            <Label>Escenario</Label>
            <Select value={escenario} onValueChange={setEscenario}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revelada">Identidad Revelada</SelectItem>
                <SelectItem value="reservada">Identidad Reservada</SelectItem>
                <SelectItem value="anonimo">Anónimo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!esAnonimo && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Denunciante</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombres</Label>
                  <Input value={denominante.nombres} onChange={(e) => setDenominante(p => ({ ...p, nombres: e.target.value }))} style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="space-y-1.5">
                  <Label>CI</Label>
                  <Input value={denominante.ci} onChange={(e) => setDenominante(p => ({ ...p, ci: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={denominante.email} onChange={(e) => setDenominante(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input type="tel" value={denominante.telefono} onChange={(e) => setDenominante(p => ({ ...p, telefono: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Denunciados</h4>
              <button
                type="button"
                onClick={() => setDenunciados(p => [...p, emptyDenunciado()])}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>
            {denunciados.map((d, i) => (
              <div key={i} className="border border-border rounded-xl p-3 space-y-2 relative">
                {denunciados.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDenunciados(p => p.filter((_, j) => j !== i))}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">¿Conoce identidad?</label>
                  <Select value={d.conoce_identidad ? 'si' : 'no'} onValueChange={(v) => updateDenunciado(i, 'conoce_identidad', v === 'si')}>
                    <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {d.conoce_identidad ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Nombres" value={d.nombres} onChange={(e) => updateDenunciado(i, 'nombres', e.target.value)} style={{ textTransform: 'uppercase' }} />
                    <Input placeholder="Dependencia" value={d.dependencia} onChange={(e) => updateDenunciado(i, 'dependencia', e.target.value)} style={{ textTransform: 'uppercase' }} />
                  </div>
                ) : (
                  <Textarea placeholder="Descripción física" rows={2} value={d.descripcion} onChange={(e) => updateDenunciado(i, 'descripcion', e.target.value)} style={{ textTransform: 'uppercase' }} />
                )}
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Detalles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={detalles.categoria} onValueChange={(v) => setDetalles(p => ({ ...p, categoria: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoriasMap).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <Input type="date" value={detalles.fecha} onChange={(e) => setDetalles(p => ({ ...p, fecha: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Hora</Label>
                <Input type="time" value={detalles.hora} onChange={(e) => setDetalles(p => ({ ...p, hora: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Lugar</Label>
                <Input value={detalles.lugar} onChange={(e) => setDetalles(p => ({ ...p, lugar: e.target.value }))} style={{ textTransform: 'uppercase' }} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Hechos</h4>
            <Textarea rows={5} value={hechos} onChange={(e) => setHechos(e.target.value)} maxLength={8000} style={{ textTransform: 'uppercase' }} />
            <p className="text-[11px] text-muted-foreground">{hechos.length}/8000</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Pruebas / Testigos</h4>
              <button
                type="button"
                onClick={() => setPruebas(p => [...p, emptyPrueba()])}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>
            {pruebas.length === 0 && <p className="text-xs text-muted-foreground italic">Sin pruebas registradas</p>}
            {pruebas.map((p, i) => (
              <div key={i} className="border border-border rounded-xl p-3 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => setPruebas(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <Select value={p.tipo} onValueChange={(v) => updatePrueba(i, 'tipo', v)}>
                  <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="archivo">Archivo</SelectItem>
                    <SelectItem value="fisica">Prueba Física</SelectItem>
                    <SelectItem value="testigo">Testigo</SelectItem>
                  </SelectContent>
                </Select>
                {p.tipo === 'testigo' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Nombre del testigo" value={p.testigo_nombre} onChange={(e) => updatePrueba(i, 'testigo_nombre', e.target.value)} style={{ textTransform: 'uppercase' }} />
                    <Input type="tel" placeholder="Teléfono" value={p.testigo_telefono} onChange={(e) => updatePrueba(i, 'testigo_telefono', e.target.value)} />
                  </div>
                ) : (
                  <Textarea placeholder="Descripción" rows={2} value={p.descripcion} onChange={(e) => updatePrueba(i, 'descripcion', e.target.value)} style={{ textTransform: 'uppercase' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-border mt-4">
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)} className="w-full">
            Cancelar
          </Button>
          <Button disabled={processing} onClick={handleSubmit} className="w-full">
            {processing ? 'Guardando...' : <><Save className="w-4 h-4 mr-1.5" />Guardar cambios</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
