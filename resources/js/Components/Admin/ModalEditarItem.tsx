import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface ColumnConfig {
    key: string;
    label: string;
    type: 'text' | 'boolean' | 'select' | 'date' | 'datetime' | 'count' | 'status';
    options?: Record<string, string>;
    readonly?: boolean;
}

interface CatalogoItem {
    id: number;
    [key: string]: unknown;
}

interface ModalEditarItemProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    columns: ColumnConfig[];
    item: CatalogoItem | null;
    onSave: (data: Record<string, unknown>) => void;
    processing: boolean;
    readonly?: boolean;
}

const EDITABLE_TYPES = ['text', 'boolean', 'select', 'date'];

function getDefaultValue(col: ColumnConfig): unknown {
    if (col.type === 'boolean') return true;
    if (col.type === 'select' && col.options) {
        const keys = Object.keys(col.options);
        return keys.length > 0 ? keys[0] : '';
    }
    return '';
}

export default function ModalEditarItem({
    open,
    onOpenChange,
    columns,
    item,
    onSave,
    processing,
    readonly = false,
}: ModalEditarItemProps) {
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const editableColumns = columns.filter((c) => EDITABLE_TYPES.includes(c.type));

    useEffect(() => {
        if (open) {
            if (item) {
                const data: Record<string, unknown> = {};
                for (const col of editableColumns) {
                    let val = item[col.key];
                    if (col.type === 'date' && typeof val === 'string') {
                        val = val.substring(0, 10);
                    }
                    data[col.key] = val ?? getDefaultValue(col);
                }
                setFormData(data);
            } else {
                const data: Record<string, unknown> = {};
                for (const col of editableColumns) {
                    data[col.key] = getDefaultValue(col);
                }
                setFormData(data);
            }
        }
    }, [open, item]);

    function setField(key: string, value: unknown) {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave(formData);
    }

    const isEditing = item !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar elemento' : 'Nuevo elemento'}</DialogTitle>
                    <DialogDescription>
                        Complete los campos para {isEditing ? 'actualizar' : 'crear'} el elemento del catálogo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {editableColumns.map((col) => (
                        <div key={col.key} className="space-y-1.5">
                            <Label htmlFor={col.key}>{col.label}</Label>

                            {col.type === 'text' && (
                                <Input
                                    id={col.key}
                                    value={String(formData[col.key] ?? '')}
                                    onChange={(e) => setField(col.key, e.target.value)}
                                    style={{ textTransform: 'uppercase' }}
                                    disabled={col.readonly || readonly}
                                />
                            )}

                            {col.type === 'boolean' && (
                                <div className="flex items-center gap-2 pt-1">
                                    <Switch
                                        id={col.key}
                                        checked={Boolean(formData[col.key])}
                                        onCheckedChange={(v) => setField(col.key, v)}
                                        disabled={readonly}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {formData[col.key] ? 'Sí' : 'No'}
                                    </span>
                                </div>
                            )}

                            {col.type === 'date' && (
                                <Input
                                    id={col.key}
                                    type="date"
                                    value={String(formData[col.key] ?? '')}
                                    onChange={(e) => setField(col.key, e.target.value)}
                                />
                            )}

                            {col.type === 'select' && col.options && (
                                <Select
                                    value={String(formData[col.key] ?? '')}
                                    onValueChange={(v) => setField(col.key, v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(col.options).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    ))}

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        {!readonly && (
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
