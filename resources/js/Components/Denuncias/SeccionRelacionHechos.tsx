import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import FieldHelp from './FieldHelp';
import InputError from './InputError';
import { cn } from '@/lib/utils';

interface SeccionRelacionHechosProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const MAX_CHARS = 5000;

export default function SeccionRelacionHechos({ value, onChange, error }: SeccionRelacionHechosProps) {
    const chars = value.length;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5">
                <Label className={cn('text-sm font-semibold', error ? 'text-destructive' : 'text-foreground')}>
                    Relación de Hechos <span className="text-destructive">*</span>
                </Label>
                <FieldHelp text="Describa con claridad: qué pasó, cómo sucedió, dónde ocurrió, cuándo fue y quiénes participaron." />
            </div>
            <div className="relative">
                <Textarea
                    placeholder="Describa los hechos con claridad. Incluya toda la información relevante: qué pasó, cómo sucedió, dónde ocurrió, cuándo fue y quiénes participaron."
                    rows={6}
                    value={value}
                    onChange={(e) => {
                        if (e.target.value.length <= MAX_CHARS) {
                            onChange(e.target.value);
                        }
                    }}
                    className={cn(
                        'resize-y min-h-[120px]',
                        error && 'border-destructive/50'
                    )}
                />
                <div className="absolute bottom-2 right-3">
                    <span
                        className={`text-[10px] font-mono tabular-nums ${
                            chars < 20 ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                    >
                        {chars}/{MAX_CHARS}
                    </span>
                </div>
                {error && (
                    <div className="absolute right-2.5 top-2.5">
                        <InputError message={error} />
                    </div>
                )}
            </div>
        </div>
    );
}
