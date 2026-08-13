import { useState, useEffect, Fragment } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, Pencil, ToggleLeft, ToggleRight, Trash2, Lock, ChevronDown, ChevronUp, ChevronRight, CircleDot } from 'lucide-react';
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
    parent_id?: number | null;
    [key: string]: unknown;
}

interface AnioGroup {
    anio: number;
    items: CatalogoItem[];
    activos: number;
    inactivos: number;
}

interface PadreOption {
    id: number | null;
    nombre: string;
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
    es_arbol?: boolean;
    padre_options?: PadreOption[];
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
    es_arbol = false,
    padre_options = [],
}: TablaCatalogoProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmItem, setConfirmItem] = useState<CatalogoItem | null>(null);
    const [confirmMode, setConfirmMode] = useState<'desactivar' | 'eliminar'>('desactivar');
    const [processing, setProcessing] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [expandedAnios, setExpandedAnios] = useState<Record<number, boolean>>({});
    const [expandedArbol, setExpandedArbol] = useState<Set<number>>(new Set());
    const [expandedMobile, setExpandedMobile] = useState<Set<number>>(new Set());
    const [padreOptionsFiltrados, setPadreOptionsFiltrados] = useState<PadreOption[]>(padre_options);
    const [search, setSearch] = useState('');

    function toggleMobile(id: number) {
        setExpandedMobile((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

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

    // Mapa de hijos por parent_id para el árbol de dependencias
    const childrenMap = new Map<number, CatalogoItem[]>();
    const itemById = new Map<number, CatalogoItem>();
    if (es_arbol) {
        for (const item of flatItems) {
            itemById.set(item.id, item);
            const parentId = (item.parent_id as number) ?? 0;
            if (!childrenMap.has(parentId)) {
                childrenMap.set(parentId, []);
            }
            childrenMap.get(parentId)!.push(item);
        }
    }

    useEffect(() => {
        if (!es_arbol) return;
        const initial = new Set<number>();
        const walk = (parent: number, depth: number) => {
            for (const child of childrenMap.get(parent) ?? []) {
                if (depth < 2) {
                    initial.add(child.id);
                    walk(child.id, depth + 1);
                }
            }
        };
        walk(0, 0);
        setExpandedArbol(initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [es_arbol]);

    function rollUpSolicitudes(item: CatalogoItem): number {
        const direct = (item.solicitudes_count as number) ?? 0;
        return direct + (childrenMap.get(item.id) ?? []).reduce((acc, c) => acc + rollUpSolicitudes(c), 0);
    }

    function toggleArbolNode(id: number) {
        setExpandedArbol((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function handleCreate() {
        setEditingItem(null);
        setPadreOptionsFiltrados(es_arbol ? padre_options : []);
        setModalOpen(true);
    }

    function handleEdit(item: CatalogoItem) {
        setEditingItem(item);
        if (es_arbol) {
            const excluir = new Set<number>();
            const collect = (id: number) => {
                excluir.add(id);
                for (const c of childrenMap.get(id) ?? []) collect(c.id);
            };
            collect(item.id);
            setPadreOptionsFiltrados(padre_options.filter((o) => o.id === null || !excluir.has(o.id)));
        }
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

    function renderAcciones(item: CatalogoItem, asDiv = false) {
        if (readonly && !editable_only) return null;
        const content = (
            <div className={cn("flex gap-1", asDiv ? "justify-start" : "justify-end")}>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Editar">
                    <Pencil className="w-4 h-4" />
                </Button>
                {(item as any).protegido ? (
                    <Button variant="ghost" size="icon" disabled title="Protegido (no se puede eliminar)">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                    </Button>
                ) : !editable_only && is_json_based ? (
                    (item as any).usos > 0 ? (
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
                        title={isInactivo(item) ? 'Reactivar' : 'Desactivar'}
                        className={isInactivo(item) ? 'text-green-600 hover:text-green-700' : 'text-destructive hover:text-destructive'}
                    >
                        {isInactivo(item) ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </Button>
                )}
            </div>
        );
        return asDiv ? content : <TableCell className="text-right hidden md:table-cell">{content}</TableCell>;
    }

    function renderCell(item: CatalogoItem, col: ColumnConfig, inline?: React.ReactNode) {
        if (inline !== undefined) {
            return (
                <TableCell key={col.key} className={col.key !== 'nombre' ? 'hidden md:table-cell' : ''}>
                    {inline}
                </TableCell>
            );
        }
        if (col.key === 'nombre' && typeof item[col.key] === 'string' && ((item[col.key] as string).includes('—') || (item[col.key] as string).includes(' - ')) && !es_arbol) {
            return (
                <TableCell key={col.key}>
                    <div className="flex flex-col gap-1 max-w-[450px] whitespace-normal break-words py-1 text-xs">
                        {(item[col.key] as string).split(/—| - /).map((part, index) => {
                            const text = part.trim();
                            if (index === 0) {
                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground text-xs leading-snug">
                                            {text}
                                        </span>
                                        {(item as any).protegido && (
                                            <Badge variant="outline" className="text-[9px] py-0 px-1 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                                                <Lock className="w-2.5 h-2.5 mr-0.5" /> Protegido
                                            </Badge>
                                        )}
                                    </div>
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
                </TableCell>
            );
        }
        if (col.key === 'nombre') {
            return (
                <TableCell key={col.key}>
                    <div className="flex items-center gap-2 max-w-[450px] whitespace-normal break-words py-1 text-xs">
                        <span className="font-medium text-foreground">{formatValue(item, col)}</span>
                        {(item as any).protegido && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700 shrink-0">
                                <Lock className="w-2.5 h-2.5 mr-0.5" /> Protegido
                            </Badge>
                        )}
                    </div>
                </TableCell>
            );
        }
        if (col.type === 'status') {
            const inactive = isInactivo(item);
            return (
                <TableCell key={col.key} className="hidden md:table-cell">
                    {inactive ? (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">Inactivo</Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">Activo</Badge>
                    )}
                </TableCell>
            );
        }
        if (col.type === 'boolean') {
            const inactive = isInactivo(item);
            return (
                <TableCell key={col.key} className="hidden md:table-cell">
                    {inactive ? (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">Inactivo</Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">Activo</Badge>
                    )}
                </TableCell>
            );
        }
        return (
            <TableCell key={col.key} className="hidden md:table-cell">
                <div className="max-w-[450px] whitespace-normal break-words py-1 text-xs">
                    {formatValue(item, col)}
                </div>
            </TableCell>
        );
    }

    function renderTable(itemsList: CatalogoItem[]) {
        if (itemsList.length === 0) {
            return (
                <div className="border rounded-2xl overflow-hidden p-8 text-center text-muted-foreground bg-background">
                    No hay elementos en este catálogo.
                </div>
            );
        }

        const nombreCol = columns.find(c => c.key === 'nombre') ?? columns[0];
        const otherCols = columns.filter(c => c !== nombreCol);

        return (
            <>
                <div className="hidden md:block border rounded-2xl overflow-hidden">
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
                            {itemsList.map((item) => (
                                <TableRow key={item.id} className={isInactivo(item) ? 'opacity-50' : ''}>
                                    {columns.map((col) => renderCell(item, col))}
                                    {(!readonly || editable_only) && renderAcciones(item)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="block md:hidden space-y-2">
                    {itemsList.map((item) => {
                        const inactive = isInactivo(item);
                        const isExpanded = expandedMobile.has(item.id);

                        return (
                            <div key={item.id} className={cn("border rounded-xl overflow-hidden bg-background shadow-xs", inactive && 'opacity-60')}>
                                <button
                                    type="button"
                                    onClick={() => toggleMobile(item.id)}
                                    className="w-full flex items-start justify-between p-3.5 text-left hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 pr-4 min-w-0">
                                        <div className="font-semibold text-sm leading-snug break-words">
                                            {formatValue(item, nombreCol)}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {(item as any).protegido && (
                                                <Badge variant="outline" className="text-[9px] py-0 px-1 text-amber-600 border-amber-300">
                                                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Protegido
                                                </Badge>
                                            )}
                                            {inactive && <Badge variant="outline" className="text-[9px] text-muted-foreground border-dashed">Inactivo</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground shrink-0 mt-0.5">
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </button>
                                
                                {isExpanded && (
                                    <div className="px-3.5 pb-3.5 pt-1 border-t bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="space-y-3 mt-2">
                                            {otherCols.map((col) => (
                                                <div key={col.key}>
                                                    <div className="text-[10px] text-muted-foreground uppercase font-medium mb-0.5">{col.label}</div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {col.type === 'status' || col.type === 'boolean' ? (
                                                            isInactivo(item) ? (
                                                                <span className="text-muted-foreground">Inactivo</span>
                                                            ) : (
                                                                <span className="text-green-600 font-medium">Activo</span>
                                                            )
                                                        ) : (
                                                            formatValue(item, col) || <span className="text-muted-foreground/50">—</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {(!readonly || editable_only) && (
                                            <div className="mt-4 pt-3 border-t">
                                                {renderAcciones(item, true)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }

    function renderArbol() {
        const matching = new Set(filteredItems.map((i) => i.id));
        const searchActive = search.trim().length > 0;

        // Nodos visibles: los que matchean + todos sus ancestros
        const visibleIds = new Set<number>();
        if (searchActive) {
            for (const id of matching) {
                let cur = id;
                let guard = 0;
                while (cur && guard++ < 30) {
                    visibleIds.add(cur);
                    cur = itemById.get(cur)?.parent_id ?? 0;
                }
            }
        }

        const isVisible = (item: CatalogoItem) => (searchActive ? visibleIds.has(item.id) : !isInactivo(item) || showInactive);

        const renderNode = (node: CatalogoItem, depth: number): React.ReactNode => {
            const hijos = (childrenMap.get(node.id) ?? []).filter(isVisible);
            const tieneHijos = hijos.length > 0;
            const isExpanded = searchActive || expandedArbol.has(node.id);
            const inactive = isInactivo(node);

            return (
                <Fragment key={node.id}>
                    <TableRow className={inactive ? 'opacity-50' : ''}>
                        {columns.map((col) => {
                            if (col.key === 'nombre') {
                                const mobileBadges = (
                                    <div className="md:hidden flex flex-wrap gap-2 mt-1 mb-1 items-center text-xs">
                                        {isInactivo(node) ? (
                                            <Badge variant="outline" className="text-[9px] text-muted-foreground border-dashed">Inactivo</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[9px] text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">Activo</Badge>
                                        )}
                                        {columns.map(c => {
                                            if (c.key === 'solicitudes_count') {
                                                const count = rollUpSolicitudes(node);
                                                if (count > 0) return <Badge key={c.key} variant="secondary" className="text-[9px] font-normal">{count} solicitudes</Badge>;
                                            }
                                            return null;
                                        })}
                                        {(!readonly || editable_only) && renderAcciones(node, true)}
                                    </div>
                                );

                                return renderCell(node, col, (
                                    <div className="flex flex-col">
                                        <div
                                            className={cn(
                                                "flex items-center gap-1.5 py-1.5 rounded-md transition-colors",
                                                tieneHijos && "cursor-pointer select-none hover:text-primary"
                                            )}
                                            style={{ paddingLeft: depth * 20 }}
                                            onClick={tieneHijos ? () => toggleArbolNode(node.id) : undefined}
                                        >
                                            {tieneHijos ? (
                                                <div className="text-muted-foreground shrink-0 flex items-center justify-center">
                                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </div>
                                            ) : (
                                                <CircleDot className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                            )}
                                            <span className={cn('text-xs leading-snug', depth === 0 ? 'font-bold' : depth === 1 ? 'font-semibold' : '')}>
                                                {node.nombre as string}
                                            </span>
                                            {tieneHijos && (
                                                <span className="text-[10px] text-muted-foreground ml-1 shrink-0 opacity-80">
                                                    ({hijos.length})
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ paddingLeft: (depth * 20) + 24 }}>
                                            {mobileBadges}
                                        </div>
                                    </div>
                                ));
                            }
                            if (col.key === 'solicitudes_count') {
                                return renderCell(node, col, (
                                    <span className="text-xs font-medium">{rollUpSolicitudes(node)}</span>
                                ));
                            }
                            return renderCell(node, col);
                        })}
                        {(!readonly || editable_only) && renderAcciones(node)}
                    </TableRow>
                    {isExpanded && hijos.map((h) => renderNode(h, depth + 1))}
                </Fragment>
            );
        };

        const raices = (childrenMap.get(0) ?? []).filter(isVisible);

        return (
            <div className="border rounded-2xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key} className={col.key !== 'nombre' ? 'hidden md:table-cell' : ''}>
                                    {col.label}
                                </TableHead>
                            ))}
                            {(!readonly || editable_only) && <TableHead className="w-[100px] text-right hidden md:table-cell">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {raices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={(!readonly || editable_only) ? columns.length + 1 : columns.length} className="text-center py-8 text-muted-foreground">
                                    No hay elementos en este catálogo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            raices.map((r) => renderNode(r, 0))
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

            {es_arbol ? renderArbol() : agrupado_por_anio ? renderAgrupado() : renderTable(filteredItems)}

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
                padre_options={es_arbol ? padreOptionsFiltrados : []}
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
