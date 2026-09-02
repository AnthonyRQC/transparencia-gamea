import { useState } from 'react';
import { Plus, Trash2, FileText, User, Box } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import InputError from '../Shared/InputError';
import { cn } from '@/lib/utils';

export interface PruebaItem {
    id: string;
    tipo: string;
    descripcion: string;
    testigo_nombre: string;
    testigo_telefono: string;
}

interface BloquePruebaProps {
    items: PruebaItem[];
    onChange: (items: PruebaItem[]) => void;
    errors: Record<string, string>;
}

let idCounter = 0;
function newId() {
    return `prb-${++idCounter}`;
}

export function createPruebaItem(): PruebaItem {
    return {
        id: newId(),
        tipo: 'fisica',
        descripcion: '',
        testigo_nombre: '',
        testigo_telefono: '',
    };
}

function formatFilename(name: string, maxLen = 28) {
    if (name.length <= maxLen) return name;
    const dotIdx = name.lastIndexOf('.');
    const ext = dotIdx > 0 ? name.substring(dotIdx) : '';
    const baseMax = maxLen - ext.length - 2;
    const base = name.substring(0, baseMax);
    return `${base}..${ext}`;
}

export default function BloquePrueba({ items, onChange, errors }: BloquePruebaProps) {
    const [modalOpen, setModalOpen] = useState<string | null>(null);

    const updateItem = (id: string, patch: Partial<PruebaItem>) => {
        onChange(
            items.map((item) =>
                item.id === id ? { ...item, ...patch } : item
            )
        );
    };

    const removeItem = (id: string) => {
        onChange(items.filter((item) => item.id !== id));
    };

    const addItem = () => {
        onChange([...items, createPruebaItem()]);
    };

    const getError = (index: number, field: string) => {
        const key = `pruebas.${index}.${field}`;
        return errors[key];
    };

    const tipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'fisica': return <Box className="w-3.5 h-3.5" />;
            case 'testigo': return <User className="w-3.5 h-3.5" />;
            default: return <FileText className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">
                    Pruebas / Testigos <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                {items.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                        {items.length} {items.length === 1 ? 'elemento' : 'elementos'}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={item.id} className="relative border border-border rounded-xl p-4 space-y-3 bg-card">
                        <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            aria-label="Eliminar prueba"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Tipo selector */}
                        <div className="flex items-center gap-2 pr-8">
                            {tipoIcon(item.tipo)}
                            <Select
                                value={item.tipo}
                                onValueChange={(v) => {
                                    const patch: Partial<PruebaItem> = { tipo: v };
                                    if (v !== 'testigo') {
                                        patch.testigo_nombre = '';
                                        patch.testigo_telefono = '';
                                    }
                                    updateItem(item.id, patch);
                                }}
                            >
                                <SelectTrigger className={cn('w-full', getError(index, 'tipo') && 'border-destructive/50')}>
                                    <SelectValue placeholder="Tipo de evidencia" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fisica">Prueba FÃ­sica</SelectItem>
                                    <SelectItem value="testigo">Testigo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Prueba FÃ­sica */}
                        {item.tipo === 'fisica' && (
                            <div className="space-y-1.5">
                                <Label className={cn('text-xs font-medium', getError(index, 'descripcion') ? 'text-destructive' : 'text-muted-foreground')}>
                                    DescripciÃ³n de la prueba <span className="text-muted-foreground font-normal">(opcional)</span>
                                </Label>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Describa la prueba fÃ­sica: quÃ© es, dÃ³nde se encuentra, cÃ³mo identificarla"
                                        rows={2}
                                        value={item.descripcion}
                                        onChange={(e) => updateItem(item.id, { descripcion: e.target.value })}
                                        className={cn(getError(index, 'descripcion') && 'border-destructive/50 pr-8')}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    {getError(index, 'descripcion') && (
                                        <div className="absolute right-2.5 top-1.5">
                                            <InputError message={getError(index, 'descripcion')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Testigo */}
                        {item.tipo === 'testigo' && (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className={cn('text-xs font-medium', getError(index, 'descripcion') ? 'text-destructive' : 'text-muted-foreground')}>
                                        DescripciÃ³n <span className="text-muted-foreground font-normal">(opcional)</span>
                                    </Label>
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Describa quÃ© presenciÃ³ el testigo o quÃ© informaciÃ³n puede aportar"
                                            rows={2}
                                            value={item.descripcion}
                                            onChange={(e) => updateItem(item.id, { descripcion: e.target.value })}
                                            className={cn(getError(index, 'descripcion') && 'border-destructive/50 pr-8')}
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                        {getError(index, 'descripcion') && (
                                            <div className="absolute right-2.5 top-1.5">
                                                <InputError message={getError(index, 'descripcion')} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className={cn('text-xs font-medium', getError(index, 'testigo_nombre') ? 'text-destructive' : 'text-muted-foreground')}>
                                            Nombre del Testigo <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Nombre completo"
                                                value={item.testigo_nombre}
                                                onChange={(e) => updateItem(item.id, { testigo_nombre: e.target.value })}
                                                className={cn(getError(index, 'testigo_nombre') && 'border-destructive/50 pr-8')}
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                            {getError(index, 'testigo_nombre') && (
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                    <InputError message={getError(index, 'testigo_nombre')} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className={cn('text-xs font-medium', getError(index, 'testigo_telefono') ? 'text-destructive' : 'text-muted-foreground')}>
                                            TelÃ©fono de Contacto <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="tel"
                                                placeholder="70123456"
                                                value={item.testigo_telefono}
                                                onChange={(e) => updateItem(item.id, { testigo_telefono: e.target.value.replace(/\D/g, '') })}
                                                className={cn(getError(index, 'testigo_telefono') && 'border-destructive/50 pr-8')}
                                            />
                                            {getError(index, 'testigo_telefono') && (
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                    <InputError message={getError(index, 'testigo_telefono')} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                AÃ±adir otra prueba / testigo
            </button>

        </div>
    );
}

