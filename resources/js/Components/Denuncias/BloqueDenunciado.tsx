import { Trash2, Plus } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import InputError from './InputError';
import { cn } from '@/lib/utils';

export interface DenunciadoItem {
    id: string;
    conoce_identidad: boolean;
    nombres: string;
    dependencia: string;
    descripcion: string;
}

interface BloqueDenunciadoProps {
    items: DenunciadoItem[];
    onChange: (items: DenunciadoItem[]) => void;
    errors: Record<string, string>;
}

let idCounter = 0;
function newId() {
    return `den-${++idCounter}`;
}

export function createDenunciadoItem(): DenunciadoItem {
    return {
        id: newId(),
        conoce_identidad: true,
        nombres: '',
        dependencia: '',
        descripcion: '',
    };
}

export default function BloqueDenunciado({ items, onChange, errors }: BloqueDenunciadoProps) {
    const updateItem = (id: string, field: keyof DenunciadoItem, value: unknown) => {
        onChange(
            items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const removeItem = (id: string) => {
        if (items.length <= 1) return;
        onChange(items.filter((item) => item.id !== id));
    };

    const addItem = () => {
        onChange([...items, createDenunciadoItem()]);
    };

    const getError = (index: number, field: string) => {
        const key = `denunciados.${index}.${field}`;
        return errors[key];
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">
                    Denunciado(s) <span className="text-destructive">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">
                    {items.length} {items.length === 1 ? 'persona' : 'personas'}
                </span>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="relative border border-border rounded-xl p-4 space-y-3 bg-card"
                    >
                        {/* Remove button */}
                        {items.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                aria-label="Eliminar denunciado"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}

                        <div className="flex items-center justify-between gap-4 pr-8">
                            <Label className="text-xs font-medium text-muted-foreground">
                                ¿Conoce la identidad de esta persona?
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {item.conoce_identidad ? 'Sí' : 'No'}
                                </span>
                                <Switch
                                    checked={item.conoce_identidad}
                                    onCheckedChange={(v) => updateItem(item.id, 'conoce_identidad', v)}
                                />
                            </div>
                        </div>

                        {item.conoce_identidad ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Nombres y Apellidos <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Nombre completo"
                                            value={item.nombres}
                                            onChange={(e) => updateItem(item.id, 'nombres', e.target.value)}
                                            className={cn(getError(index, 'nombres') && 'border-destructive/50 pr-8')}
                                        />
                                        {getError(index, 'nombres') && (
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                <InputError message={getError(index, 'nombres')} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Cargo y/o Dependencia de trabajo <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Ej: Director de Catastro, Jefe de Compras, etc."
                                            value={item.dependencia}
                                            onChange={(e) => updateItem(item.id, 'dependencia', e.target.value)}
                                            className={cn(getError(index, 'dependencia') && 'border-destructive/50 pr-8')}
                                        />
                                        {getError(index, 'dependencia') && (
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                <InputError message={getError(index, 'dependencia')} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    Descripción física y vestimenta <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Indique rasgos físicos visibles (estatura, complexión, color de cabello) y vestimenta que llevaba al momento del hecho."
                                        rows={3}
                                        value={item.descripcion}
                                        onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                                        className={cn(getError(index, 'descripcion') && 'border-destructive/50 pr-8')}
                                    />
                                    {getError(index, 'descripcion') && (
                                        <div className="absolute right-2.5 top-3">
                                            <InputError message={getError(index, 'descripcion')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
                <Plus className="w-3.5 h-3.5" />
                Añadir otro denunciado
            </button>
        </div>
    );
}
