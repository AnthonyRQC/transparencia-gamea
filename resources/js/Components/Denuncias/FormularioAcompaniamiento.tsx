import { Label } from '@/Components/ui/label';

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
                        <Label className="text-xs font-medium text-muted-foreground">
                            {f.label} {f.required && <span className="text-destructive">*</span>}
                        </Label>
                        <input
                            className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={f.placeholder}
                            value={data[f.key] || ''}
                            onChange={(e) => onChange(f.key, e.target.value)}
                        />
                        {errors[f.key] && <p className="text-xs text-destructive font-medium">{errors[f.key]}</p>}
                    </div>
                ))}
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Motivo del Reclamo <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                        rows={4}
                        className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        placeholder="Describa el motivo del reclamo"
                        value={data.motivo || ''}
                        onChange={(e) => onChange('motivo', e.target.value)}
                    />
                    {errors.motivo && <p className="text-xs text-destructive font-medium">{errors.motivo}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Resolución / Acuerdo <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                        rows={4}
                        className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        placeholder="Describa la resolución o acuerdo propuesto"
                        value={data.resolucion || ''}
                        onChange={(e) => onChange('resolucion', e.target.value)}
                    />
                    {errors.resolucion && <p className="text-xs text-destructive font-medium">{errors.resolucion}</p>}
                </div>
            </div>
        </div>
    );
}
