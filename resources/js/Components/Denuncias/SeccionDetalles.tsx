import { useState } from 'react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import FieldHelp from './FieldHelp';
import InputError from './InputError';
import { cn } from '@/lib/utils';

interface DetallesData {
    categoria: string;
    categoria_otro: string;
    fecha: string;
    hora: string;
    lugar: string;
}

interface SeccionDetallesProps {
    data: DetallesData;
    onChange: (field: string, value: string) => void;
    categorias: Record<string, string>;
    errors: Record<string, string>;
}

export default function SeccionDetalles({ data, onChange, categorias, errors }: SeccionDetallesProps) {
    const esOtro = data.categoria === 'otro';

    return (
        <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
                Detalles del Incidente
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categoría */}
                <div className="space-y-1.5">
                    <Label htmlFor="categoria" className="text-xs font-medium text-muted-foreground">
                        Categoría <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.categoria}
                        onValueChange={(v) => {
                            onChange('categoria', v);
                            if (v !== 'otro') onChange('categoria_otro', '');
                        }}
                    >
                        <SelectTrigger id="categoria" className={cn(errors['detalles.categoria'] && 'border-destructive/50')}>
                            <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(categorias).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors['detalles.categoria'] && (
                        <p className="text-xs text-destructive font-medium">{errors['detalles.categoria']}</p>
                    )}
                    {esOtro && (
                        <div className="mt-2">
                            <Input
                                placeholder="Especifique la categoría"
                                value={data.categoria_otro}
                                onChange={(e) => onChange('categoria_otro', e.target.value)}
                                className="text-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Fecha */}
                <div className="space-y-1.5">
                    <Label htmlFor="fecha" className="text-xs font-medium text-muted-foreground">
                        Fecha del incidente <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="fecha"
                            type="date"
                            value={data.fecha}
                            onChange={(e) => onChange('fecha', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className={cn(errors['detalles.fecha'] && 'border-destructive/50 pr-8')}
                        />
                        {errors['detalles.fecha'] && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <InputError message={errors['detalles.fecha']} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Hora */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="hora" className="text-xs font-medium text-muted-foreground">
                            Hora (opcional)
                        </Label>
                        <FieldHelp text="Si no la recuerda exacta, indique un aproximado en 'Relación de Hechos'." />
                    </div>
                    <Input
                        id="hora"
                        type="time"
                        value={data.hora}
                        onChange={(e) => onChange('hora', e.target.value)}
                    />
                </div>

                {/* Lugar */}
                <div className="space-y-1.5">
                    <Label htmlFor="lugar" className="text-xs font-medium text-muted-foreground">
                        Lugar <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="lugar"
                            placeholder="Ej: Oficina de Catastro, Edificio GAMEA piso 3"
                            value={data.lugar}
                            onChange={(e) => onChange('lugar', e.target.value)}
                            className={cn(errors['detalles.lugar'] && 'border-destructive/50 pr-8')}
                        />
                        {errors['detalles.lugar'] && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <InputError message={errors['detalles.lugar']} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
