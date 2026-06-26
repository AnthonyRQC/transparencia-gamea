import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import FieldHelp from './FieldHelp';
import { cn } from '@/lib/utils';

interface SeccionConfidencialidadProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const opciones = [
    {
        value: 'revelada',
        label: 'Identidad Revelada',
        desc: 'La UTLCC conocerá y divulgará su identidad en el proceso.',
    },
    {
        value: 'reservada',
        label: 'Identidad Reservada',
        desc: 'La UTLCC conocerá su identidad pero no la divulgará a terceros (Ley 974, Art. 24).',
    },
    {
        value: 'anonimo',
        label: 'Anónimo',
        desc: 'No se registrarán sus datos personales. Solo podrá consultar el estado con el código generado en la UTLCC — sin posibilidad de seguimiento por correo o celular si no los proporciona.',
    },
];

export default function SeccionConfidencialidad({ value, onChange, error }: SeccionConfidencialidadProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Label className={cn('text-sm font-semibold', error ? 'text-destructive' : 'text-foreground')}>
                    Confidencialidad <span className="text-destructive">*</span>
                </Label>
                <FieldHelp text="Seleccione cómo desea que la UTLCC maneje su identidad durante el proceso de denuncia." />
            </div>
            <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
                {opciones.map((op) => (
                    <label
                        key={op.value}
                        className={cn(
                            'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                            value === op.value
                                ? error
                                    ? 'border-destructive/50 bg-destructive/5'
                                    : 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/30'
                        )}
                    >
                        <RadioGroupItem value={op.value} className="mt-0.5" />
                        <div className="space-y-0.5">
                            <span className="text-sm font-semibold text-foreground block">
                                {op.label}
                            </span>
                            <span className="text-xs text-muted-foreground leading-relaxed block">
                                {op.desc}
                            </span>
                        </div>
                    </label>
                ))}
            </RadioGroup>
            {error && (
                <p className="text-xs text-destructive font-medium">{error}</p>
            )}
        </div>
    );
}
