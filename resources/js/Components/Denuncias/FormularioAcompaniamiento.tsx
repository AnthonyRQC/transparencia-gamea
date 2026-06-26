import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';

interface FormularioAcompaniamientoProps {
    data: Record<string, string>;
    onChange: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function FormularioAcompaniamiento({ data, onChange, errors }: FormularioAcompaniamientoProps) {
    const fields = [
        { key: 'nombres', label: 'Nombres y Apellidos', required: true, placeholder: 'Juan Pérez Mamani' },
        { key: 'ci', label: 'Cédula de Identidad', required: false, placeholder: '1234567 (opcional)' },
        { key: 'dependencia_funcionario', label: 'Dependencia o Funcionario Involucrado', required: true, placeholder: 'Ej: Dirección de Catastro, Dr. Juan Pérez' },
    ];

    return (
        <div className="space-y-4">
            <Label className="text-sm font-semibold text-foreground">Formulario de Acompañamiento</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((f) => (
                    <div key={f.key} className="space-y-1.5">
                        <Label className={cn('text-xs font-medium', errors[f.key] ? 'text-destructive' : 'text-muted-foreground')}>
                            {f.label} {f.required && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            placeholder={f.placeholder}
                            value={data[f.key] || ''}
                            onChange={(e) => onChange(f.key, e.target.value)}
                            className={cn(errors[f.key] && 'border-destructive/50')}
                        />
                        {errors[f.key] && <p className="text-xs text-destructive font-medium">{errors[f.key]}</p>}
                    </div>
                ))}
                <div className="space-y-1.5">
                    <Label className={cn('text-xs font-medium', errors.motivo ? 'text-destructive' : 'text-muted-foreground')}>
                        Motivo del Reclamo <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        rows={4}
                        placeholder="Describa el motivo del reclamo"
                        value={data.motivo || ''}
                        onChange={(e) => onChange('motivo', e.target.value)}
                        className={cn(errors.motivo && 'border-destructive/50')}
                    />
                    {errors.motivo && <p className="text-xs text-destructive font-medium">{errors.motivo}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label className={cn('text-xs font-medium', errors.resolucion ? 'text-destructive' : 'text-muted-foreground')}>
                        Resolución / Acuerdo <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        rows={4}
                        placeholder="Describa la resolución o acuerdo propuesto"
                        value={data.resolucion || ''}
                        onChange={(e) => onChange('resolucion', e.target.value)}
                        className={cn(errors.resolucion && 'border-destructive/50')}
                    />
                    {errors.resolucion && <p className="text-xs text-destructive font-medium">{errors.resolucion}</p>}
                </div>
            </div>
        </div>
    );
}
