import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import ModalEditarItem from './ModalEditarItem';

interface ColumnConfig {
    key: string;
    label: string;
    type: 'text' | 'boolean' | 'select' | 'date';
    options?: Record<string, string>;
}

interface CatalogoItem {
    id: number;
    [key: string]: unknown;
}

interface TablaCatalogoProps {
    tipo: string;
    items: CatalogoItem[];
    columns: ColumnConfig[];
}

function formatValue(item: CatalogoItem, col: ColumnConfig): string {
    const val = item[col.key];
    if (val === null || val === undefined) return '—';
    if (col.type === 'boolean') return val ? 'Sí' : 'No';
    if (col.type === 'date' && typeof val === 'string') {
        const parts = val.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
    }
    if (col.type === 'select' && col.options && typeof val === 'string') {
        return col.options[val] ?? val;
    }
    return String(val);
}

export default function TablaCatalogo({ tipo, items, columns }: TablaCatalogoProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    function handleCreate() {
        setEditingItem(null);
        setModalOpen(true);
    }

    function handleEdit(item: CatalogoItem) {
        setEditingItem(item);
        setModalOpen(true);
    }

    function handleSave(data: Record<string, unknown>) {
        setProcessing(true);
        const isUpdate = editingItem !== null;

        let url: string;
        if (isUpdate) {
            const params = { tipo, id: String(editingItem.id) };
            url = (route as any)('admin.catalogos.update', params);
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

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function executeDelete() {
        if (deleteId === null) return;
        setProcessing(true);
        const url = (route as any)('admin.catalogos.destroy', { tipo, id: String(deleteId) });
        router.post(url, {} as any, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Elemento eliminado');
                setDeleteId(null);
                setProcessing(false);
            },
            onError: () => {
                toast.error('Error al eliminar');
                setProcessing(false);
            },
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {items.length} elemento{items.length !== 1 ? 's' : ''}
                </p>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Nuevo
                </Button>
            </div>

            <div className="border rounded-2xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key}>{col.label}</TableHead>
                            ))}
                            <TableHead className="w-[100px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                                    No hay elementos en este catálogo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>{formatValue(item, col)}</TableCell>
                                    ))}
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
                                                onClick={() => confirmDelete(item.id)}
                                                title="Eliminar"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

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
            />

            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar elemento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El elemento será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} disabled={processing}>
                            {processing ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
