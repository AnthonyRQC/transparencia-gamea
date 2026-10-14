import { useEffect, useMemo, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { FolderInput, Plus, Trash2, ChevronDown, UploadCloud } from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { cn } from '@/lib/utils';

export interface LegacyInvestigadorOption {
  id: number | string;
  nombre: string;
}

interface ClasificacionOption {
  id: number;
  clave: string;
  nombre: string;
}

interface ModalCargarLegacyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investigadores?: LegacyInvestigadorOption[];
}

type Modo = 'en_curso' | 'historico';

interface DepOpcion {
  id: number;
  nombre: string;
}

interface DenunciadoFila {
  conoce: boolean;
  nombres: string;
  dependencia: string;
  descripcion: string;
}

function filaVacia(): DenunciadoFila {
  return { conoce: true, nombres: '', dependencia: '', descripcion: '' };
}

function filaValida(f: DenunciadoFila): boolean {
  return f.conoce ? f.nombres.trim().length > 0 : f.descripcion.trim().length > 0;
}

/**
 * Dependencia híbrida: sugerencias del catálogo con texto libre permitido
 * (unidades históricas u organigramas previos). Patrón de ModalNuevaSolicitud.
 */
function DependenciaHibrida({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const { dependencias = [] } = usePage().props as unknown as { dependencias?: DepOpcion[] };
  const catalogo = (dependencias ?? []).filter((d) => d.nombre);
  const [libre, setLibre] = useState(() => value !== '' && !catalogo.some((d) => d.nombre === value));
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    if (abierto) document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto ]);

  const filtradas = catalogo
    .filter((d) => d.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .slice(0, 50);

  const textoSeleccionado = value
    ? (value.length > 45 ? `${value.slice(0, 42)}...` : value)
    : 'Seleccionar dependencia...';

  return (
    <div className="space-y-2" ref={ref}>
      <div className="flex items-center gap-2">
        <Switch id={`dep-libre-${value}`} checked={libre} onCheckedChange={(v) => { setLibre(v === true); setAbierto(false); }} disabled={disabled} />
        <Label className="text-xs cursor-pointer">Unidad histórica o no registrada</Label>
      </div>
      {libre ? (
        <Input
          placeholder="Nombre de la unidad o cargo (texto libre)..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={200}
          disabled={disabled}
          style={{ textTransform: 'uppercase' }}
        />
      ) : (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal text-xs min-w-0 max-w-full overflow-hidden"
            onClick={() => setAbierto(!abierto)}
            disabled={disabled}
          >
            <span className="text-left flex-1" title={value || undefined}>{textoSeleccionado}</span>
            <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
          </Button>
          {abierto && (
            <div className="absolute left-0 right-0 z-50 mt-1 p-2 bg-popover text-popover-foreground border rounded-md shadow-md">
              <Input
                placeholder="Buscar dependencia..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="h-8 text-xs w-full mb-2"
                autoFocus
              />
              <ScrollArea className="h-48 pr-1">
                {filtradas.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2 text-center">Sin coincidencias: active texto libre.</p>
                ) : (
                  <div className="space-y-1">
                    {filtradas.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        title={d.nombre}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer whitespace-normal break-words leading-snug"
                        onClick={() => { onChange(d.nombre); setAbierto(false); }}
                      >
                        {d.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ticketPreview(gestion: string, numero: string): string | null {
  const g = parseInt(gestion, 10);
  const n = parseInt(numero, 10);
  if (!g || !n) return null;
  return `DEN-${String(g).padStart(4, '0')}-${String(n).padStart(4, '0')}`;
}

export default function ModalCargarLegacy({ open, onOpenChange, investigadores = [] }: ModalCargarLegacyProps) {
  const puedeLegacy = useCan('denuncia.cargar-legacy');
  const puedeHistorico = useCan('denuncia.cargar-historico');
  const pageProps = usePage().props as unknown as {
    auth?: { user?: { id?: number; name?: string; rol?: string } | null } | null;
    clasificaciones?: ClasificacionOption[];
  };
  const rol = pageProps.auth?.user?.rol ?? '';
  const esInvestigador = rol === 'investigador';
  const nombreInvestigador = pageProps.auth?.user?.name ?? '';

  const opcionesResponsable: LegacyInvestigadorOption[] = useMemo(() => {
    if (esInvestigador) return [];
    const yo = pageProps.auth?.user;
    const lista = investigadores.filter((t) => String(t.id) !== String(yo?.id));
    return yo?.id ? [{ id: yo.id, nombre: `${yo.name ?? 'USUARIO'} (TÚ)` }, ...lista] : lista;
  }, [esInvestigador, investigadores]); // eslint-disable-line react-hooks/exhaustive-deps

  const modoInicial: Modo = puedeLegacy ? 'en_curso' : 'historico';
  const [modo, setModo] = useState<Modo>(modoInicial);
  const historico = modo === 'historico';

  const [tipo, setTipo] = useState('corrupcion');
  const [estado, setEstado] = useState('investigacion');
  const [hechos, setHechos] = useState('');
  const [escenario, setEscenario] = useState('revelada');
  const [denuncianteNombre, setDenuncianteNombre] = useState('');
  const [denuncianteCi, setDenuncianteCi] = useState('');
  const [denuncianteTelefono, setDenuncianteTelefono] = useState('');
  const anonimo = escenario === 'anonimo';
  const [denunciados, setDenunciados] = useState<DenunciadoFila[]>([filaVacia()]);

  const setFila = (i: number, campo: keyof DenunciadoFila, valor: string | boolean) =>
    setDenunciados((prev) => prev.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
  const agregarFila = () => setDenunciados((prev) => (prev.length >= 20 ? prev : [...prev, filaVacia()]));
  const quitarFila = (i: number) => setDenunciados((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  const [fechaRecepcion, setFechaRecepcion] = useState('');
  const [gestion, setGestion] = useState('');
  const [numeroTicket, setNumeroTicket] = useState('');
  const [investigadorId, setInvestigadorId] = useState('');
  const [investigadorReferencia, setInvestigadorReferencia] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');
  const [clasificacionId, setClasificacionId] = useState('');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [intentado, setIntentado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const agregarArchivos = (lista: FileList | null) => {
    if (!lista) return;
    setArchivos((prev) => [...prev, ...Array.from(lista)].slice(0, 5));
    resetFileInput();
  };
  const quitarArchivo = (i: number) => {
    setArchivos((prev) => prev.filter((_, idx) => idx !== i));
    resetFileInput();
  };

  useEffect(() => {
    if (open) {
      setModo(puedeLegacy ? 'en_curso' : 'historico');
      setTipo('corrupcion');
      setEstado('investigacion');
      setHechos('');
      setEscenario('revelada');
      setDenuncianteNombre('');
      setDenuncianteCi('');
      setDenuncianteTelefono('');
      setDenunciados([filaVacia()]);
      setFechaRecepcion('');
      setGestion('');
      setNumeroTicket('');
      setInvestigadorId('');
      setInvestigadorReferencia('');
      setFechaCierre('');
      setClasificacionId('');
      setArchivos([]);
      setIntentado(false);
      resetFileInput();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const clasificaciones = useMemo(
    () => (Array.isArray(pageProps.clasificaciones) ? pageProps.clasificaciones.filter((c) => c.clave && c.nombre) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  const muestraClasificacion = historico || estado === 'informe';
  const preview = historico ? ticketPreview(gestion, numeroTicket) : null;
  const hoy = new Date().toISOString().split('T')[0];

  // Validación inline: los mensajes solo se muestran tras el primer intento.
  const verErrores = intentado && !processing;
  const errorHechos = hechos.trim().length < 10 ? 'Mínimo 10 caracteres' : null;
  const errorDenunciante = !anonimo && denuncianteNombre.trim().length < 2 ? 'Nombre requerido' : null;
  const errorFechaRecepcion = fechaRecepcion === '' ? 'Fecha requerida' : null;
  const errorGestion = historico && gestion === '' ? 'Requerida' : null;
  const errorNumero = historico && numeroTicket === '' ? 'Requerido' : null;
  const errorFechaCierre = historico && fechaCierre === '' ? 'Fecha requerida' : null;
  const errorInvestigador = !historico && !esInvestigador && investigadorId === '' ? 'Seleccione responsable' : null;
  const errorFila = (f: DenunciadoFila) =>
    filaValida(f) ? null : (f.conoce ? 'Nombre requerido' : 'Descripción requerida');

  const formValido =
    !errorHechos &&
    !errorDenunciante &&
    denunciados.length > 0 &&
    denunciados.every(filaValida) &&
    !errorFechaRecepcion &&
    !errorGestion &&
    !errorNumero &&
    !errorFechaCierre &&
    !errorInvestigador;

  const handleSubmit = () => {
    if (processing) return;
    setIntentado(true);
    if (!formValido) return;
    setProcessing(true);
    router.post(
      route('denuncias.legacy'),
      {
        modo,
        tipo,
        ...(historico ? {} : { estado }),
        hechos,
        escenario,
        denunciante_nombre: anonimo ? null : denuncianteNombre || null,
        denunciante_ci: anonimo ? null : denuncianteCi || null,
        denunciante_telefono: anonimo ? null : denuncianteTelefono || null,
        denunciados: denunciados.map((f) => ({
          conoce_identidad: f.conoce,
          nombres: f.conoce ? f.nombres : null,
          dependencia: f.dependencia || null,
          descripcion: f.conoce ? null : f.descripcion,
        })),
        fecha_recepcion: fechaRecepcion,
        gestion: gestion !== '' ? parseInt(gestion, 10) : null,
        numero_ticket: numeroTicket !== '' ? parseInt(numeroTicket, 10) : null,
        ...(!historico && !esInvestigador ? { investigador_id: parseInt(investigadorId, 10) } : {}),
        ...(historico ? { investigador_referencia: investigadorReferencia || null, fecha_cierre: fechaCierre } : {}),
        ...(muestraClasificacion && clasificacionId !== '' ? { clasificacion_id: parseInt(clasificacionId, 10) } : {}),
        ...(archivos.length > 0 ? { archivos } : {}),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(preview ? `Expediente ${preview} cargado` : 'Expediente cargado');
          onOpenChange(false);
        },
        onError: (errors) => {
          const keys = Object.keys(errors);
          toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al cargar expediente');
        },
        onFinish: () => setProcessing(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cargar expediente preexistente</DialogTitle>
          <DialogDescription>
            {esInvestigador && !historico
              ? 'Su caso en curso: quedará asignado automáticamente a usted.'
              : historico
                ? 'Expediente cerrado de gestiones pasadas, sin investigador asignado.'
                : 'Caso en curso con número de carpeta física.'}
          </DialogDescription>
        </DialogHeader>

        {puedeLegacy && puedeHistorico && (
          <Tabs value={modo} onValueChange={(v) => setModo(v as Modo)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="en_curso">Mi caso en curso</TabsTrigger>
              <TabsTrigger value="historico">Expediente histórico</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo} disabled={processing}>
                <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrupcion" className="cursor-pointer">Corrupción</SelectItem>
                  <SelectItem value="negacion" className="cursor-pointer">Negación de información</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!historico && (
              <div className="space-y-2">
                <Label>Estado actual</Label>
                <Select value={estado} onValueChange={setEstado} disabled={processing}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investigacion" className="cursor-pointer">En investigación</SelectItem>
                    <SelectItem value="informe" className="cursor-pointer">En informe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {!historico && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Responsable</Label>
                {verErrores && errorInvestigador && <span className="text-[11px] font-medium text-destructive">{errorInvestigador}</span>}
              </div>
              {esInvestigador ? (
                <Input value={`${nombreInvestigador} (Asignado automáticamente)`} disabled />
              ) : (
                <Select value={investigadorId} onValueChange={setInvestigadorId} disabled={processing}>
                  <SelectTrigger className={cn('cursor-pointer', verErrores && errorInvestigador && 'border-destructive')}><SelectValue placeholder="Selecciona investigador" /></SelectTrigger>
                  <SelectContent>
                    {opcionesResponsable.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)} className="cursor-pointer">{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="lg-hechos" className="after:content-['*'] after:text-destructive after:ml-0.5">Hechos (resumen)</Label>
              {verErrores && errorHechos && <span className="text-[11px] font-medium text-destructive">{errorHechos}</span>}
            </div>
            <Textarea
              id="lg-hechos"
              placeholder="Relación sucinta de los hechos del expediente físico..."
              value={hechos}
              onChange={(e) => setHechos(e.target.value)}
              rows={3}
              maxLength={8000}
              disabled={processing}
              style={{ textTransform: 'uppercase' }}
              className={cn(verErrores && errorHechos && 'border-destructive')}
            />
            <p className="text-[11px] text-muted-foreground">Mínimo 10 caracteres ({hechos.trim().length}/8000)</p>
          </div>

          <div className="space-y-2">
            <Label>Identidad del denunciante</Label>
            <Select value={escenario} onValueChange={setEscenario} disabled={processing}>
              <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revelada" className="cursor-pointer">Identidad revelada</SelectItem>
                <SelectItem value="reservada" className="cursor-pointer">Identidad reservada</SelectItem>
                <SelectItem value="anonimo" className="cursor-pointer">Anónimo</SelectItem>
              </SelectContent>
            </Select>
            {escenario === 'reservada' && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                Identidad protegida (Ley 974): visible solo para usuarios con acceso al caso.
              </p>
            )}
            {!anonimo && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Nombre del denunciante</Label>
                    {verErrores && errorDenunciante && <span className="text-[11px] font-medium text-destructive">{errorDenunciante}</span>}
                  </div>
                  <Input
                    placeholder="Nombres y apellidos *"
                    value={denuncianteNombre}
                    onChange={(e) => setDenuncianteNombre(e.target.value)}
                    maxLength={100}
                    disabled={processing}
                    style={{ textTransform: 'uppercase' }}
                    className={cn(verErrores && errorDenunciante && 'border-destructive')}
                  />
                </div>
                <Input
                  placeholder="CI (opcional)"
                  value={denuncianteCi}
                  onChange={(e) => setDenuncianteCi(e.target.value)}
                  maxLength={20}
                  disabled={processing}
                  style={{ textTransform: 'uppercase' }}
                />
                <Input
                  placeholder="Teléfono (opcional)"
                  value={denuncianteTelefono}
                  onChange={(e) => setDenuncianteTelefono(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  inputMode="numeric"
                  maxLength={8}
                  disabled={processing}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Denunciados</Label>
            {denunciados.map((f, i) => (
              <div key={i} className="rounded-lg border border-border p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">Denunciado #{i + 1}</span>
                  <div className="flex items-center gap-1">
                    {verErrores && errorFila(f) && <span className="text-[11px] font-medium text-destructive">{errorFila(f)}</span>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={processing || denunciados.length <= 1}
                      onClick={() => quitarFila(i)}
                      className="h-7 px-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={f.conoce} onCheckedChange={(v) => setFila(i, 'conoce', v === true)} disabled={processing} />
                  <Label className="text-xs cursor-pointer">¿Conoce la identidad? {f.conoce ? 'Sí' : 'No'}</Label>
                </div>
                {f.conoce ? (
                  <Input
                    placeholder="Nombres y apellidos *"
                    value={f.nombres}
                    onChange={(e) => setFila(i, 'nombres', e.target.value)}
                    maxLength={100}
                    disabled={processing}
                    style={{ textTransform: 'uppercase' }}
                    className={cn(verErrores && errorFila(f) && 'border-destructive')}
                  />
                ) : (
                  <Textarea
                    placeholder="Descripción de la persona o grupo (ej. personal de ventanilla turno tarde) *"
                    value={f.descripcion}
                    onChange={(e) => setFila(i, 'descripcion', e.target.value)}
                    rows={2}
                    maxLength={2000}
                    disabled={processing}
                    style={{ textTransform: 'uppercase' }}
                    className={cn(verErrores && errorFila(f) && 'border-destructive')}
                  />
                )}
                <DependenciaHibrida value={f.dependencia} onChange={(v) => setFila(i, 'dependencia', v)} disabled={processing} />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={processing || denunciados.length >= 20}
              onClick={agregarFila}
              className="gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir denunciado
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="lg-recepcion" className="after:content-['*'] after:text-destructive after:ml-0.5">Fecha de recepción física</Label>
                {verErrores && errorFechaRecepcion && <span className="text-[11px] font-medium text-destructive">{errorFechaRecepcion}</span>}
              </div>
              <Input id="lg-recepcion" type="date" max={hoy} value={fechaRecepcion} onChange={(e) => setFechaRecepcion(e.target.value)} disabled={processing} className={cn(verErrores && errorFechaRecepcion && 'border-destructive')} />
            </div>
            {historico && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="lg-cierre" className="after:content-['*'] after:text-destructive after:ml-0.5">Fecha de cierre</Label>
                  {verErrores && errorFechaCierre && <span className="text-[11px] font-medium text-destructive">{errorFechaCierre}</span>}
                </div>
                <Input id="lg-cierre" type="date" max={hoy} value={fechaCierre} onChange={(e) => setFechaCierre(e.target.value)} disabled={processing} className={cn(verErrores && errorFechaCierre && 'border-destructive')} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="lg-gestion">Gestión {historico && <span className="text-destructive">*</span>}</Label>
                {verErrores && errorGestion && <span className="text-[11px] font-medium text-destructive">{errorGestion}</span>}
              </div>
              <Input id="lg-gestion" type="number" min={2016} placeholder={historico ? 'Ej. 2024' : 'Opcional'} value={gestion} onChange={(e) => setGestion(e.target.value)} disabled={processing} className={cn(verErrores && errorGestion && 'border-destructive')} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="lg-numero">N° de carpeta {historico && <span className="text-destructive">*</span>}</Label>
                {verErrores && errorNumero && <span className="text-[11px] font-medium text-destructive">{errorNumero}</span>}
              </div>
              <Input id="lg-numero" type="number" min={1} max={9999} placeholder={historico ? 'Ej. 15' : 'Auto si se omite'} value={numeroTicket} onChange={(e) => setNumeroTicket(e.target.value)} disabled={processing} className={cn(verErrores && errorNumero && 'border-destructive')} />
            </div>
          </div>
          {preview && <p className="text-xs text-muted-foreground">Ticket resultante: <span className="font-mono font-semibold">{preview}</span></p>}

          {historico && (
            <div className="space-y-2">
              <Label htmlFor="lg-referencia">Exabogado / exfuncionario a cargo (referencia)</Label>
              <Input
                id="lg-referencia"
                placeholder="Nombre de referencia (opcional)"
                value={investigadorReferencia}
                onChange={(e) => setInvestigadorReferencia(e.target.value)}
                maxLength={150}
                disabled={processing}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          )}

          {muestraClasificacion && clasificaciones.length > 0 && (
            <div className="space-y-2">
              <Label>Clasificación final (opcional)</Label>
              <Select value={clasificacionId} onValueChange={setClasificacionId} disabled={processing}>
                <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Sin clasificación" /></SelectTrigger>
                <SelectContent>
                  {clasificaciones.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} className="cursor-pointer">{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Adjuntos de respaldo (opcional, máx. 5)</Label>
            <Input
              ref={fileInputRef}
              id="lg-archivos"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={(e) => agregarArchivos(e.target.files)}
              disabled={processing || archivos.length >= 5}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing || archivos.length >= 5}
              className="w-full border-dashed gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" /> Seleccionar archivos de respaldo
            </Button>
            <p className="text-[11px] text-muted-foreground">PDF o imágenes, hasta 50 MB por archivo. Si omite este paso, podrá subirlos desde el visor del caso.</p>
            {archivos.map((f, i) => (
              <div key={`${f.name}-${f.size}-${i}`} className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5">
                <span className="text-xs truncate">{f.name} <span className="text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span></span>
                <Button type="button" variant="ghost" size="sm" disabled={processing} onClick={() => quitarArchivo(i)} className="h-7 px-2 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={processing} onClick={handleSubmit}>
            {processing ? 'Cargando...' : (<><FolderInput className="w-4 h-4 mr-1.5" />Cargar expediente</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
