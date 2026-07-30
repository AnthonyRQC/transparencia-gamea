import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, Pencil, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, CircleDot } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
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
}

function formatValue(item: CatalogoItem, col: ColumnConfig): string {
    const val = item[col.key];
    if (val === null || val === undefined) return '—';
    if (col.type === 'boolean') return val ? 'Sí' : 'No';
    if (col.type === 'date' && typeof val === 'string') {
        const parts = val.split('-');
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
    if (item.activa === false) return true;
    return false;
}

export default function TablaCatalogo({
    tipo,
    items,
    columns,
    agrupado_por_anio = false,
    readonly = false,
}: TablaCatalogoProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [togglingItem, setTogglingItem] = useState<CatalogoItem | null>(null);
    const [processing, setProcessing] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [expandedAnios, setExpandedAnios] = useState<Record<number, boolean>>({});

    const displayColumns = columns.filter((c) => !['datetime', 'count', 'status'].includes(c.type) || c.key === 'nombre' || c.key === 'clave' || c.key === 'tipo_denuncia' || c.key === 'activa' || c.key === 'fecha' || c.key === 'recurrente');

    const flatItems = agrupado_por_anio
        ? (items as AnioGroup[]).flatMap((g) => g.items)
        : (items as CatalogoItem[]);

    const filteredItems = showInactive
        ? flatItems
        : flatItems.filter((i) => !isInactivo(i));

    function handleCreate() {
        setEditingItem(null);
        setModalOpen(true);
    }

    function handleEdit(item: CatalogoItem) {
        setEditingItem(item);
        setModalOpen(true);
    }

    function handleToggle(item: CatalogoItem) {
        setTogglingItem(item);
        setConfirmOpen(true);
    }

    function executeToggle() {
        if (!togglingItem) return;
        setProcessing(true);
        const isActive = !isInactivo(togglingItem);

        if (isActive) {
            router.post(route('admin.catalogos.destroy', { tipo, id: String(togglingItem.id) } as any), {} as any, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Elemento desactivado');
                    setConfirmOpen(false);
                    setTogglingItem(null);
                    setProcessing(false);
                },
                onError: () => {
                    toast.error('Error al desactivar');
                    setProcessing(false);
                },
            });
        } else {
            router.post(route('admin.catalogos.reactivar', { tipo, id: String(togglingItem.id) } as any), {} as any, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Elemento reactivado');
                    setConfirmOpen(false);
                    setTogglingItem(null);
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
                            {!readonly && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {itemsList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={readonly ? columns.length : columns.length + 1} className="text-center py-8 text-muted-foreground">
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
                                                {col.type === 'status' ? (
                                                    inactive ? (
                                                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">Inactivo</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">Activo</Badge>
                                                    )
                                                ) : col.type === 'boolean' ? (
                                                    inactive ? (
                                                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">No</Badge>
                                                    ) : (
                                                        formatValue(item, col)
                                                    )
                                                ) : (
                                                    formatValue(item, col)
                                                )}
                                            </TableCell>
                                        ))}
                                        {!readonly && (
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
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggle(item)}
                                                        title={inactive ? 'Reactivar' : 'Desactivar'}
                                                        className={inactive ? 'text-green-600 hover:text-green-700' : 'text-destructive hover:text-destructive'}
                                                    >
                                                        {inactive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                    </Button>
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
                    const isExpanded = expandedAnios[grupo.anio] ?? (grupo.anio === anioVigente);
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
                                        ({grupo.activos} activo{grupo.activos !== 1 ? 's' : ''}
                                        {grupo.inactivos > 0 ? `, ${grupo.inactivos} inactivo${grupo.inactivos !== 1 ? 's' : ''}` : ''})
                                    </span>
                                </div>
                                {grupo.anio === anioVigente && (
                                    <Badge variant="outline" className="text-[10px]">Vigente</Badge>
                                )}
                            </button>
                            {isExpanded && (
                                <div className="border-t">
                                    {renderTable(
                                        showInactive
                                            ? grupo.items
                                            : grupo.items.filter((i) => !isInactivo(i))
                                    )}
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
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        {filteredItems.length} elemento{filteredItems.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-2">
                        <Switch
                            id={`show-inactive-${tipo}`}
                            checked={showInactive}
                            onCheckedChange={setShowInactive}
                        />
                        <Label htmlFor={`show-inactive-${tipo}`} className="text-xs text-muted-foreground cursor-pointer">
                            Mostrar inactivos
                        </Label>
                    </div>
                </div>
                {!readonly && (
                    <Button onClick={handleCreate} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
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
                readonly={readonly}
            />

            <ModalConfirmarDesactivar
                open={confirmOpen}
                onOpenChange={(open) => {
                    setConfirmOpen(open);
                    if (!open) setTogglingItem(null);
                }}
                onConfirm={executeToggle}
                titulo={togglingItem && !isInactivo(togglingItem) ? 'Desactivar elemento' : 'Reactivar elemento'}
                nombreItem={togglingItem ? String(togglingItem.nombre ?? togglingItem.clave ?? togglingItem.id) : ''}
                dependencias={togglingItem && !isInactivo(togglingItem) ? getDependencias(togglingItem) : []}
                processing={processing}
            />
        </div>
    );
}
