import { useState, useEffect, useMemo } from 'react';
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
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import SelectPadreDependencia from './SelectPadreDependencia';

interface ColumnConfig {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'boolean' | 'select' | 'date' | 'datetime' | 'count' | 'status';
    options?: Record<string, string>;
    readonly?: boolean;
}

interface CatalogoItem {
    id: number;
    [key: string]: unknown;
}

interface PadreOption {
    id: number | null;
    nombre: string;
}

interface ModalEditarItemProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    columns: ColumnConfig[];
    item: CatalogoItem | null;
    onSave: (data: Record<string, unknown>) => void;
    processing: boolean;
    readonly?: boolean;
    padre_options?: PadreOption[];
}

const EDITABLE_TYPES = ['text', 'textarea', 'select', 'date'];

function getDefaultValue(col: ColumnConfig): unknown {
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
    padre_options = [],
}: ModalEditarItemProps) {
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const editableColumns = useMemo(() => columns.filter((c) => EDITABLE_TYPES.includes(c.type)), [columns]);

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
                if (padre_options.length > 0) {
                    data.parent_id = (item.parent_id as number | null) ?? null;
                }
                setFormData(data);
            } else {
                const data: Record<string, unknown> = {};
                for (const col of editableColumns) {
                    data[col.key] = getDefaultValue(col);
                }
                if (padre_options.length > 0) {
                    data.parent_id = null;
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
            <DialogContent className="sm:max-w-xl w-[95vw] p-6 overflow-visible" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader className="shrink-0">
                    <DialogTitle>{isEditing ? 'Editar elemento' : 'Nuevo elemento'}</DialogTitle>
                    <DialogDescription>
                        Complete los campos para {isEditing ? 'actualizar' : 'crear'} el elemento del catálogo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-4">
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

                                {col.type === 'textarea' && (
                                    <Textarea
                                        id={col.key}
                                        value={String(formData[col.key] ?? '')}
                                        onChange={(e) => setField(col.key, e.target.value)}
                                        rows={3}
                                        style={{ textTransform: 'uppercase' }}
                                        disabled={col.readonly || readonly}
                                    />
                                )}

                                {col.type === 'date' && (
                                    <Input
                                        id={col.key}
                                        type="date"
                                        value={String(formData[col.key] ?? '')}
                                        onChange={(e) => setField(col.key, e.target.value)}
                                        disabled={col.readonly || readonly}
                                    />
                                )}

                                {col.type === 'select' && col.options && (
                                    <Select
                                        value={String(formData[col.key] ?? '')}
                                        onValueChange={(v) => setField(col.key, v)}
                                        disabled={col.readonly || readonly}
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

                        {padre_options.length > 0 && (
                            <div className="space-y-1.5">
                                <Label htmlFor="parent_id">Dependencia padre</Label>
                                <SelectPadreDependencia
                                    options={padre_options}
                                    value={(formData.parent_id as number | null) ?? null}
                                    onChange={(val) => setField('parent_id', val)}
                                    disabled={readonly}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Al cambiar el padre, la dependencia se moverá dentro del organigrama jerárquico.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t">
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

