import { useState } from 'react';
import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { cn } from '@/lib/utils';
import { ETIQUETAS_TIPO, type DashboardProps, type FiltrosDashboard } from '@/types/dashboard';
import { ETIQUETAS_PRESET, PRESETS_FECHA, detectarPreset, rangoPreset, type PresetFechaKey } from '@/helpers/presetsFecha';

interface Props {
    filtros: FiltrosDashboard;
    opciones: DashboardProps['opciones'];
    esJefe: boolean;
    onChange: (next: FiltrosDashboard) => void;
}

const FILTROS_VACIOS: FiltrosDashboard = {
    desde: null,
    hasta: null,
    tecnico_id: null,
    tipo: null,
    categoria_id: null,
    clasificacion_id: null,
    estado: null,
    incluir_inactivos: false,
    tab: 'operativo',
};

export default function FiltrosDashboard({ filtros, opciones, esJefe, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FiltrosDashboard>(filtros);

    const abrir = () => {
        setForm({ ...filtros, tab: 'operativo' });
        setOpen(true);
    };

    const aplicar = () => {
        onChange(form);
        setOpen(false);
    };

    const restablecer = () => {
        const limpio = { ...FILTROS_VACIOS, tab: 'operativo' };
        setForm(limpio);
        onChange(limpio);
        setOpen(false);
    };

    const setCampo = <K extends keyof FiltrosDashboard>(key: K, valor: FiltrosDashboard[K]) => {
        setForm((f) => ({ ...f, [key]: valor }));
    };

    const chips: Array<{ key: string; label: string; clear: () => void }> = [];
    const presetActivo: PresetFechaKey = detectarPreset(filtros.desde, filtros.hasta);
    if (filtros.desde || filtros.hasta) {
        chips.push({
            key: 'rango',
            label: `Fecha: ${ETIQUETAS_PRESET[presetActivo]} (${filtros.desde ?? 'inicio'} → ${filtros.hasta ?? 'hoy'})`,
            clear: () => onChange({ ...filtros, desde: null, hasta: null }),
        });
    }
    if (filtros.tecnico_id) {
        const t = opciones.tecnicos.find((x) => x.id === filtros.tecnico_id);
        chips.push({
            key: 'tecnico',
            label: `Técnico: ${t?.name ?? filtros.tecnico_id}`,
            clear: () => onChange({ ...filtros, tecnico_id: null }),
        });
    }
    if (filtros.tipo) {
        chips.push({
            key: 'tipo',
            label: ETIQUETAS_TIPO[filtros.tipo] ?? filtros.tipo,
            clear: () => onChange({ ...filtros, tipo: null }),
        });
    }
    if (filtros.categoria_id) {
        const c = opciones.categorias.find((x) => x.id === filtros.categoria_id);
        chips.push({
            key: 'categoria',
            label: `Categoría: ${c?.nombre ?? filtros.categoria_id}`,
            clear: () => onChange({ ...filtros, categoria_id: null }),
        });
    }
    if (filtros.clasificacion_id) {
        const c = opciones.clasificaciones.find((x) => x.id === filtros.clasificacion_id);
        chips.push({
            key: 'clasificacion',
            label: `Clasificación: ${c?.nombre ?? filtros.clasificacion_id}`,
            clear: () => onChange({ ...filtros, clasificacion_id: null }),
        });
    }
    if (filtros.estado) {
        const e = opciones.estados.find((x) => x.clave === filtros.estado);
        chips.push({
            key: 'estado',
            label: `Estado: ${e?.nombre ?? filtros.estado}`,
            clear: () => onChange({ ...filtros, estado: null }),
        });
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={abrir} className="gap-1.5 shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {chips.length > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        {chips.length}
                    </span>
                )}
            </Button>

            {chips.map((chip) => (
                <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/60 border text-[11px] font-semibold"
                >
                    {chip.label}
                    <button
                        onClick={chip.clear}
                        className="ml-0.5 rounded-full hover:bg-muted p-0.5 transition-colors cursor-pointer"
                        aria-label={`Quitar filtro ${chip.label}`}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}

            {chips.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => onChange({ ...FILTROS_VACIOS, tab: 'operativo' })} className="gap-1 text-muted-foreground">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                </Button>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Filtros del Dashboard</SheetTitle>
                        <SheetDescription>
                            Los KPIs y el embudo muestran el estado actual; el resto usa el rango de fechas.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Rango de fechas</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {PRESETS_FECHA.map((p) => {
                                const activo = detectarPreset(form.desde, form.hasta) === p.key;
                                return (
                                    <Button
                                        key={p.key}
                                        type="button"
                                        variant={activo ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-7 px-2.5 text-xs"
                                        onClick={() => {
                                            const r = rangoPreset(p.key);
                                            setForm((f) => ({ ...f, desde: r.desde, hasta: r.hasta }));
                                        }}
                                    >
                                        {p.label}
                                    </Button>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="date" value={form.desde ?? ''} onChange={(e) => setCampo('desde', e.target.value || null)} />
                            <Input type="date" value={form.hasta ?? ''} onChange={(e) => setCampo('hasta', e.target.value || null)} />
                        </div>
                        {detectarPreset(form.desde, form.hasta) === 'personalizado' && (
                            <p className="text-[11px] text-muted-foreground">Rango personalizado (fuera de presets).</p>
                        )}
                    </div>

                        {esJefe && (
                            <>
                                <div className="space-y-2">
                                    <Label>Técnico</Label>
                                    <Select value={form.tecnico_id ? String(form.tecnico_id) : 'todos'} onValueChange={(v) => setCampo('tecnico_id', v === 'todos' ? null : Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos los técnicos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos los técnicos</SelectItem>
                                            {opciones.tecnicos.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Incluir técnicos inactivos</Label>
                                        <p className="text-[11px] text-muted-foreground">Recordatorio de técnicos a desactivar.</p>
                                    </div>
                                    <Switch checked={form.incluir_inactivos} onCheckedChange={(v) => setCampo('incluir_inactivos', v)} />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label>Tipo de denuncia</Label>
                            <Select value={form.tipo ?? 'todos'} onValueChange={(v) => setCampo('tipo', v === 'todos' ? null : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los tipos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los tipos</SelectItem>
                                    {Object.entries(ETIQUETAS_TIPO).map(([k, nombre]) => (
                                        <SelectItem key={k} value={k}>
                                            {nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select value={form.categoria_id ? String(form.categoria_id) : 'todas'} onValueChange={(v) => setCampo('categoria_id', v === 'todas' ? null : Number(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las categorías" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todas">Todas las categorías</SelectItem>
                                    {opciones.categorias.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Clasificación final</Label>
                            <Select value={form.clasificacion_id ? String(form.clasificacion_id) : 'todas'} onValueChange={(v) => setCampo('clasificacion_id', v === 'todas' ? null : Number(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las clasificaciones" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todas">Todas las clasificaciones</SelectItem>
                                    {opciones.clasificaciones.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={form.estado ?? 'todos'} onValueChange={(v) => setCampo('estado', v === 'todos' ? null : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los estados</SelectItem>
                                    {opciones.estados.map((e) => (
                                        <SelectItem key={e.clave} value={e.clave}>
                                            {e.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">
                                El estado solo cambia los dos gráficos de arriba (fase y evolución); los números de arriba siempre muestran hoy.
                            </p>
                        </div>
                    </div>

                    <SheetFooter className="gap-2">
                        <Button variant="outline" onClick={restablecer} className="gap-1.5">
                            <RotateCcw className="w-4 h-4" />
                            Restablecer
                        </Button>
                        <Button onClick={aplicar} className={cn('gap-1.5')}>
                            Aplicar filtros
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
