import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import FieldHelp from './FieldHelp';

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
        desc: 'No se registrarán sus datos personales. Solo podrá consultar el caso con el código generado.',
    },
];

export default function SeccionConfidencialidad({ value, onChange, error }: SeccionConfidencialidadProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-foreground">
                    Confidencialidad {error && <span className="text-destructive">*</span>}
                </Label>
                <FieldHelp text="Seleccione cómo desea que la UTLCC maneje su identidad durante el proceso de denuncia." />
            </div>
            <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
                {opciones.map((op) => (
                    <label
                        key={op.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            value === op.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/30'
                        }`}
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
