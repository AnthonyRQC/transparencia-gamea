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
    type: 'text' | 'boolean' | 'select' | 'date';
    options?: Record<string, string>;
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
}

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
}: ModalEditarItemProps) {
    const [formData, setFormData] = useState<Record<string, unknown>>({});

    useEffect(() => {
        if (open) {
            if (item) {
                const data: Record<string, unknown> = {};
                for (const col of columns) {
                    data[col.key] = item[col.key] ?? getDefaultValue(col);
                }
                setFormData(data);
            } else {
                const data: Record<string, unknown> = {};
                for (const col of columns) {
                    data[col.key] = getDefaultValue(col);
                }
                setFormData(data);
            }
        }
    }, [open, item, columns]);

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
                    {columns.map((col) => (
                        <div key={col.key} className="space-y-1.5">
                            <Label htmlFor={col.key}>{col.label}</Label>

                            {col.type === 'text' && (
                                <Input
                                    id={col.key}
                                    value={String(formData[col.key] ?? '')}
                                    onChange={(e) => setField(col.key, e.target.value)}
                                    style={{ textTransform: 'uppercase' }}
                                />
                            )}

                            {col.type === 'boolean' && (
                                <div className="flex items-center gap-2 pt-1">
                                    <Switch
                                        id={col.key}
                                        checked={Boolean(formData[col.key])}
                                        onCheckedChange={(v) => setField(col.key, v)}
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
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
