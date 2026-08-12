import { useState, useEffect, useRef, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/Components/ui/popover';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Plus, Save, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

interface SolicitudItem {
  id: number;
  ticket: string;
  dependencia_destino: string;
  detalle: string;
  plazo_dias?: number;
  estado: string;
}

interface ModalNuevaSolicitudProps {
  ticket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitudToEdit?: SolicitudItem | null;
}

interface DepOption {
  id: number;
  nombre: string;
  parent_id?: number | null;
}

interface ArbolDep {
  id: number;
  nombre: string;
  nivel: number;
}

export default function ModalNuevaSolicitud({ ticket, open, onOpenChange, solicitudToEdit }: ModalNuevaSolicitudProps) {
  const { dependencias = [] } = usePage<PageProps>().props;
  const depOptions = dependencias as unknown as DepOption[];
  const isEdit = !!solicitudToEdit;
  const [esLibre, setEsLibre] = useState(false);
  const [unidadDestino, setUnidadDestino] = useState('');
  const [unidadLibre, setUnidadLibre] = useState('');
  const [plazoDias, setPlazoDias] = useState(10);
  const [fechaEnvio, setFechaEnvio] = useState(new Date().toISOString().split('T')[0]);
  const [detalle, setDetalle] = useState('');
  const [processing, setProcessing] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dependenciasArbol = useMemo<ArbolDep[]>(() => {
    const childrenMap = new Map<number, DepOption[]>();
    for (const dep of depOptions) {
      const parent = dep.parent_id ?? 0;
      if (!childrenMap.has(parent)) childrenMap.set(parent, []);
      childrenMap.get(parent)!.push(dep);
    }
    const out: ArbolDep[] = [];
    const walk = (parent: number, nivel: number) => {
      for (const dep of childrenMap.get(parent) ?? []) {
        out.push({ id: dep.id, nombre: dep.nombre, nivel });
        walk(dep.id, nivel + 1);
      }
    };
    walk(0, 0);
    return out;
  }, [depOptions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverOpen]);

  useEffect(() => {
    if (open) {
      if (solicitudToEdit) {
        const dependencia = solicitudToEdit.dependencia_destino;
        const isInCatalog = dependencias.some(d => d.nombre === dependencia);
        setEsLibre(!isInCatalog);
        setUnidadDestino(isInCatalog ? dependencia : '');
        setUnidadLibre(!isInCatalog ? dependencia : '');
        setPlazoDias(solicitudToEdit.plazo_dias || 10);
        setDetalle(solicitudToEdit.detalle || '');
      } else {
        setEsLibre(false);
        setUnidadDestino('');
        setUnidadLibre('');
        setPlazoDias(10);
        setFechaEnvio(new Date().toISOString().split('T')[0]);
        setDetalle('');
      }
    }
  }, [open, solicitudToEdit, dependencias]);

  const filteredDependencias = dependenciasArbol.filter(dep => 
    dep.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const destinoValue = esLibre ? unidadLibre.trim() : unidadDestino;
  const canSubmit = (esLibre ? unidadLibre.trim().length >= 5 : unidadDestino)
    && detalle.trim().length >= 5
    && plazoDias >= 1 && plazoDias <= 45
    && (isEdit ? solicitudToEdit?.id : ticket);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);

    const payload = {
      dependencia_destino: destinoValue,
      plazo_dias: plazoDias,
      fecha_envio: fechaEnvio,
      detalle,
    };

    if (isEdit && solicitudToEdit) {
      router.post(
        route('denuncias.solicitudes.editar', { id: solicitudToEdit.id }),
        payload,
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success('Solicitud actualizada correctamente');
            onOpenChange(false);
          },
          onError: (errors) => {
            const keys = Object.keys(errors);
            toast.error(keys.length > 0 ? errors[keys[0]] : 'Error al editar solicitud');
          },
          onFinish: () => setProcessing(false),
        }
      );
    } else {
      router.post(
        route('denuncias.solicitudes.store', { ticket }),
        payload,
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success('Solicitud creada correctamente');
            onOpenChange(false);
          },
          onError: (errors) => {
            const keys = Object.keys(errors);
            const msg = keys.length > 0 ? errors[keys[0]] : 'Error al crear solicitud';
            toast.error(msg);
          },
          onFinish: () => setProcessing(false),
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar solicitud' : 'Nueva solicitud de información'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifique los datos de la solicitud. Los cambios quedarán registrados en el historial.'
              : ticket
                ? `Solicitud para la denuncia ${ticket}.`
                : 'Seleccione una denuncia primero.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Switch id="es-libre" checked={esLibre} onCheckedChange={setEsLibre} />
            <Label htmlFor="es-libre" className="text-sm cursor-pointer">
              ¿Dependencia o persona externa no registrada?
            </Label>
          </div>

          <div className="space-y-2 relative" ref={dropdownRef}>
            <Label htmlFor="unidad-destino" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Dependencia destino
            </Label>
            {esLibre ? (
              <Input
                id="unidad-destino"
                placeholder="Nombre de la entidad o persona externa..."
                value={unidadLibre}
                onChange={(e) => setUnidadLibre(e.target.value)}
                maxLength={200}
                style={{ textTransform: 'uppercase' }}
              />
            ) : (
              <div className="relative w-full">
                <Button
                  id="unidad-destino"
                  type="button"
                  variant="outline"
                  className="w-full justify-between font-normal text-left h-auto py-2 px-3 text-xs whitespace-normal break-words align-top flex"
                  onClick={() => setPopoverOpen(!popoverOpen)}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    {unidadDestino ? (
                      unidadDestino.includes('—') ? (
                        <div className="flex flex-col gap-0.5 text-left">
                          {unidadDestino.split('—').map((part, index) => {
                            const text = part.trim();
                            if (index === 0) {
                              return <span key={index} className="font-semibold text-foreground text-xs">{text}</span>;
                            }
                            return (
                              <span key={index} className="text-muted-foreground text-[10px] uppercase font-medium leading-normal block pl-1.5 border-l border-muted-foreground/30">
                                {text}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs">{unidadDestino}</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">Seleccionar dependencia...</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50 self-start mt-0.5" />
                </Button>

                {popoverOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 p-2 bg-popover text-popover-foreground border rounded-md shadow-md">
                    <div className="space-y-2">
                      <Input
                        placeholder="Buscar dependencia..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 text-xs w-full"
                        autoFocus
                      />
                      <ScrollArea className="h-48 overflow-y-auto pr-1">
                        {filteredDependencias.length === 0 ? (
                          <p className="text-xs text-muted-foreground p-2 text-center">No se encontraron dependencias.</p>
                        ) : (
                          <div className="space-y-1">
                            {filteredDependencias.map((dep) => (
                              <button
                                key={dep.id}
                                type="button"
                                onClick={() => {
                                  setUnidadDestino(dep.nombre);
                                  setPopoverOpen(false);
                                  setSearchQuery('');
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1.5 text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-[11px] leading-tight block",
                                  unidadDestino === dep.nombre && "bg-accent font-semibold"
                                )}
                                style={{ paddingLeft: `${dep.nivel * 12 + 8}px` }}
                              >
                                {dep.nivel > 0 && (
                                  <span className="text-muted-foreground/40 mr-1 select-none">
                                    {'└ '}
                                  </span>
                                )}
                                {dep.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </div>
            )}
            {esLibre && unidadLibre.length > 0 && unidadLibre.trim().length < 5 && (
              <p className="text-[11px] text-destructive font-medium">Mínimo 5 caracteres</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plazo-dias" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Plazo (días hábiles)
            </Label>
            <Input
              id="plazo-dias"
              type="number"
              min={1}
              max={45}
              value={plazoDias}
              onChange={(e) => setPlazoDias(Math.min(45, Math.max(1, parseInt(e.target.value) || 1)))}
            />
            <p className="text-[11px] text-muted-foreground">
              Plazo legal referencial: 10 días hábiles. Ajuste según urgencia o complejidad (1-45 días hábiles).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha-envio">
              Fecha de envío
              <span className="text-[10px] text-muted-foreground ml-1 font-normal">(opcional)</span>
            </Label>
            <Input
              id="fecha-envio"
              type="date"
              value={fechaEnvio}
              onChange={(e) => setFechaEnvio(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalle-solicitud" className="after:content-['*'] after:text-destructive after:ml-0.5">
              Detalle de la solicitud
            </Label>
            <Textarea
              id="detalle-solicitud"
              placeholder="Describa qué documentación o información se solicita..."
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              rows={4}
              maxLength={2000}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{detalle.length}/2000</p>
              {detalle.length > 0 && detalle.trim().length < 5 && (
                <p className="text-[11px] text-destructive font-medium">Mínimo 5 caracteres</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={processing || !canSubmit} onClick={handleSubmit}>
            {processing ? (isEdit ? 'Guardando...' : 'Creando...') : (
              isEdit ? <><Save className="w-4 h-4 mr-1.5" />Guardar cambios</> : <><Plus className="w-4 h-4 mr-1.5" />Crear solicitud</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
