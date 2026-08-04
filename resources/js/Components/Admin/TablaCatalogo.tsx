import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, Pencil, ToggleLeft, ToggleRight, Trash2, Lock, ChevronDown, ChevronRight, CircleDot } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import ModalEditarItem from './ModalEditarItem';
import ModalConfirmarDesactivar from './ModalConfirmarDesactivar';

interface ColumnConfig {
    key: string;
    label: string;
    type: 'text' | 'boolean' | 'select' | 'date' | 'datetime' | 'count' | 'status';
    options?: Record<string, string>;
    readonly?: boolean;
}

interface CatalogoItem {
    id: number;
    activa?: boolean;
    deleted_at?: string | null;
    [key: string]: unknown;
}

interface AnioGroup {
    anio: number;
    items: CatalogoItem[];
    activos: number;
    inactivos: number;
}

interface TablaCatalogoProps {
    tipo: string;
    items: CatalogoItem[] | AnioGroup[];
    columns: ColumnConfig[];
    agrupado_por_anio?: boolean;
    readonly?: boolean;
    editable_only?: boolean;
    is_json_based?: boolean;
    usos_label?: string;
}

function formatValue(item: CatalogoItem, col: ColumnConfig): string {
    const val = item[col.key];
    if (val === null || val === undefined) return '—';
    if (col.type === 'boolean') return val ? 'Sí' : 'No';
    if (col.type === 'date' && typeof val === 'string') {
        const dateStr = val.substring(0, 10);
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
    }
    if (col.type === 'datetime' && typeof val === 'string') {
        const d = new Date(val);
        return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (col.type === 'count' && typeof val === 'number') return String(val);
    if (col.type === 'status') {
        if (item.deleted_at) return 'Inactivo';
        return 'Activo';
    }
    if (col.type === 'select' && col.options && typeof val === 'string') {
        return col.options[val] ?? val;
    }
    return String(val);
}

function isInactivo(item: CatalogoItem): boolean {
    if (item.deleted_at !== undefined && item.deleted_at !== null) return true;
    const activa = item.activa as any;
    const activo = item.activo as any;
    if ('activa' in item && (activa === false || activa === 0 || activa === '0')) return true;
    if ('activo' in item && (activo === false || activo === 0 || activo === '0')) return true;
    return false;
}

export default function TablaCatalogo({
    tipo,
    items,
    columns,
    agrupado_por_anio = false,
    readonly = false,
    editable_only = false,
    is_json_based = false,
    usos_label = 'registro(s)',
}: TablaCatalogoProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmItem, setConfirmItem] = useState<CatalogoItem | null>(null);
    const [confirmMode, setConfirmMode] = useState<'desactivar' | 'eliminar'>('desactivar');
    const [processing, setProcessing] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [expandedAnios, setExpandedAnios] = useState<Record<number, boolean>>({});
    const [search, setSearch] = useState('');

    const displayColumns = columns.filter((c) => !['datetime', 'count', 'status'].includes(c.type) || c.key === 'nombre' || c.key === 'clave' || c.key === 'tipo_denuncia' || c.key === 'activa' || c.key === 'fecha');

    const flatItems = agrupado_por_anio
        ? (items as AnioGroup[]).flatMap((g) => g.items)
        : (items as CatalogoItem[]);

    const activeFilteredItems = showInactive
        ? flatItems
        : flatItems.filter((i) => !isInactivo(i));

    const filteredItems = activeFilteredItems.filter(item => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return columns.some(col => {
            const val = formatValue(item, col).toLowerCase();
            return val.includes(query);
        });
    });

    function handleCreate() {
        setEditingItem(null);
        setModalOpen(true);
    }

    function handleEdit(item: CatalogoItem) {
        setEditingItem(item);
        setModalOpen(true);
    }

    function handleToggle(item: CatalogoItem) {
        setConfirmMode('desactivar');
        setConfirmItem(item);
        setConfirmOpen(true);
    }

    function handleDelete(item: CatalogoItem) {
        setConfirmMode('eliminar');
        setConfirmItem(item);
        setConfirmOpen(true);
    }

    function executeConfirm() {
        if (!confirmItem) return;
        setProcessing(true);
        const item = confirmItem;

        if (confirmMode === 'eliminar') {
            router.post(route('admin.catalogos.destroy', { tipo, id: String(item.id) } as any), {} as any, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Elemento eliminado');
                    setConfirmOpen(false);
                    setConfirmItem(null);
                    setProcessing(false);
                },
                onError: () => {
                    toast.error('Error al eliminar');
                    setProcessing(false);
                },
            });
            return;
        }

        const isActive = !isInactivo(item);

        if (isActive) {
            router.post(route('admin.catalogos.destroy', { tipo, id: String(item.id) } as any), {} as any, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Elemento desactivado');
                    setConfirmOpen(false);
                    setConfirmItem(null);
                    setProcessing(false);
                },
                onError: () => {
                    toast.error('Error al desactivar');
                    setProcessing(false);
                },
            });
        } else {
            router.post(route('admin.catalogos.reactivar', { tipo, id: String(item.id) } as any), {} as any, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Elemento reactivado');
                    setConfirmOpen(false);
                    setConfirmItem(null);
                    setProcessing(false);
                },
                onError: () => {
                    toast.error('Error al reactivar');
                    setProcessing(false);
                },
            });
        }
    }

    function handleSave(data: Record<string, unknown>) {
        setProcessing(true);
        const isUpdate = editingItem !== null;

        let url: string;
        if (isUpdate) {
            url = (route as any)('admin.catalogos.update', { tipo, id: String(editingItem.id) });
        } else {
            url = (route as any)('admin.catalogos.store', { tipo });
        }

        router.post(url, data as any, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isUpdate ? 'Elemento actualizado' : 'Elemento creado');
                setModalOpen(false);
                setEditingItem(null);
                setProcessing(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors).flat().join(', ');
                toast.error(msg || 'Error al guardar');
                setProcessing(false);
            },
        });
    }

    function toggleAnio(anio: number) {
        setExpandedAnios((prev) => ({ ...prev, [anio]: !prev[anio] }));
    }

    function getDependencias(item: CatalogoItem) {
        const deps: Array<{ tipo: string; cantidad: number }> = [];
        const denCount = item.denuncias_count as number | undefined;
        const solCount = item.solicitudes_count as number | undefined;
        if (denCount && denCount > 0) {
            deps.push({ tipo: 'Denuncias', cantidad: denCount });
        }
        if (solCount && solCount > 0) {
            deps.push({ tipo: 'Solicitudes de información', cantidad: solCount });
        }
        return deps;
    }

    function renderTable(itemsList: CatalogoItem[]) {
        return (
            <div className="border rounded-2xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key}>{col.label}</TableHead>
                            ))}
                            {(!readonly || editable_only) && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {itemsList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={(!readonly || editable_only) ? columns.length + 1 : columns.length} className="text-center py-8 text-muted-foreground">
                                    No hay elementos en este catálogo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            itemsList.map((item) => {
                                const inactive = isInactivo(item);
                                return (
                                    <TableRow key={item.id} className={inactive ? 'opacity-50' : ''}>
                                        {columns.map((col) => (
                                            <TableCell key={col.key}>
                                                {col.key === 'nombre' && typeof item[col.key] === 'string' && ((item[col.key] as string).includes('—') || (item[col.key] as string).includes(' - ')) ? (
                                                    <div className="flex flex-col gap-1 max-w-[450px] whitespace-normal break-words py-1 text-xs">
                                                        {(item[col.key] as string).split(/—| - /).map((part, index) => {
                                                            const text = part.trim();
                                                            if (index === 0) {
                                                                return (
                                                                    <span key={index} className="font-semibold text-foreground text-xs leading-snug">
                                                                        {text}
                                                                    </span>
                                                                );
                                                            }
                                                            return (
                                                                <div key={index} className="flex items-start gap-1.5 pl-2 border-l border-muted-foreground/30 mt-0.5">
                                                                    <span className="text-muted-foreground text-[10px] uppercase font-medium leading-tight">
                                                                        {text}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : col.key === 'nombre' ? (
                                                    <div className="max-w-[450px] whitespace-normal break-words py-1 text-xs">
                                                        {formatValue(item, col)}
                                                    </div>
                                                ) : col.type === 'status' ? (
                                                    inactive ? (
                                                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">Inactivo</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">Activo</Badge>
                                                    )
                                                ) : col.type === 'boolean' ? (
                                                    inactive ? (
                                                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">Inactivo</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">Activo</Badge>
                                                    )
                                                ) : (
                                                    formatValue(item, col)
                                                )}
                                            </TableCell>
                                        ))}
                                        {(!readonly || editable_only) && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(item)}
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    {!editable_only && (is_json_based ? (
                                                        (item as any).protegido ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled
                                                                title="Protegido (no se puede eliminar)"
                                                            >
                                                                <Lock className="w-4 h-4 text-muted-foreground" />
                                                            </Button>
                                                        ) : (item as any).usos > 0 ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled
                                                                title={`En uso en ${(item as any).usos} ${usos_label}, no se puede eliminar`}
                                                                className="text-muted-foreground"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(item)}
                                                                title="Eliminar"
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleToggle(item)}
                                                            title={inactive ? 'Reactivar' : 'Desactivar'}
                                                            className={inactive ? 'text-green-600 hover:text-green-700' : 'text-destructive hover:text-destructive'}
                                                        >
                                                            {inactive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    }

    function renderAgrupado() {
        const grupos = items as AnioGroup[];
        const anioVigente = new Date().getFullYear();

        return (
            <div className="space-y-3">
                {grupos.map((grupo) => {
                    const matchedItems = grupo.items
                        .filter((i) => showInactive || !isInactivo(i))
                        .filter(item => {
                            if (!search.trim()) return true;
                            const query = search.toLowerCase();
                            return columns.some(col => {
                                const val = formatValue(item, col).toLowerCase();
                                return val.includes(query);
                            });
                        });

                    if (search.trim() && matchedItems.length === 0) return null;

                    const isExpanded = expandedAnios[grupo.anio] ?? (grupo.anio === anioVigente || !!search.trim());
                    const activosCount = matchedItems.filter(i => !isInactivo(i)).length;
                    const inactivosCount = matchedItems.filter(i => isInactivo(i)).length;

                    return (
                        <div key={grupo.anio} className="border rounded-2xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleAnio(grupo.anio)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    <span className="font-semibold text-sm">{grupo.anio}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({activosCount} activo{activosCount !== 1 ? 's' : ''}
                                        {inactivosCount > 0 ? `, ${inactivosCount} inactivo${inactivosCount !== 1 ? 's' : ''}` : ''})
                                    </span>
                                </div>
                                {grupo.anio === anioVigente && (
                                    <Badge variant="outline" className="text-[10px]">Vigente</Badge>
                                )}
                            </button>
                            {isExpanded && (
                                <div className="border-t">
                                    {renderTable(matchedItems)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-full sm:w-64">
                        <Input
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-muted-foreground">
                            {filteredItems.length} elemento{filteredItems.length !== 1 ? 's' : ''}
                        </p>
                        {!is_json_based && !editable_only && (
                            <div className="flex items-center gap-2">
                                <Switch
                                    id={`show-inactive-${tipo}`}
                                    checked={showInactive}
                                    onCheckedChange={setShowInactive}
                                />
                                <Label htmlFor={`show-inactive-${tipo}`} className="text-xs text-muted-foreground cursor-pointer select-none">
                                    Mostrar inactivos
                                </Label>
                            </div>
                        )}
                    </div>
                </div>
                {!readonly && !editable_only && (
                    <Button onClick={handleCreate} size="sm" className="h-8 text-xs shrink-0">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Nuevo
                    </Button>
                )}
            </div>

            {agrupado_por_anio ? renderAgrupado() : renderTable(filteredItems)}

            <ModalEditarItem
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setEditingItem(null);
                }}
                columns={columns}
                item={editingItem}
                onSave={handleSave}
                processing={processing}
                readonly={readonly && !editable_only}
            />

            <ModalConfirmarDesactivar
                open={confirmOpen}
                onOpenChange={(open) => {
                    setConfirmOpen(open);
                    if (!open) setConfirmItem(null);
                }}
                onConfirm={executeConfirm}
                mode={confirmMode}
                titulo={confirmMode === 'eliminar'
                    ? 'Eliminar elemento'
                    : confirmItem && !isInactivo(confirmItem)
                        ? 'Desactivar elemento'
                        : 'Reactivar elemento'}
                nombreItem={confirmItem ? String(confirmItem.nombre ?? confirmItem.clave ?? confirmItem.id) : ''}
                dependencias={confirmMode === 'eliminar' ? [] : confirmItem && !isInactivo(confirmItem) ? getDependencias(confirmItem) : []}
                processing={processing}
            />
        </div>
    );
}
