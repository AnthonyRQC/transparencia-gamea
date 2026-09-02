import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';

interface PieFormularioProps {
    declaracionJurada: boolean;
    onDeclaracionChange: (checked: boolean) => void;
    onSubmit: () => void;
    submitDisabled: boolean;
    submitting: boolean;
    error?: string;
}

export default function PieFormulario({
    declaracionJurada,
    onDeclaracionChange,
    onSubmit,
    submitDisabled,
    submitting,
    error,
}: PieFormularioProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/60">
                <Checkbox
                    id="declaracion"
                    checked={declaracionJurada}
                    onCheckedChange={(v) => onDeclaracionChange(v === true)}
                    className="mt-0.5"
                />
                <Label
                    htmlFor="declaracion"
                    className="text-sm text-foreground leading-relaxed cursor-pointer"
                >
                    Declaro bajo juramento que los hechos descritos son verdaderos y que la presente denuncia
                    no es presentada de mala fe. <span className="text-destructive">*</span>
                </Label>
            </div>
            {error && (
                <p className="text-xs text-destructive font-medium">{error}</p>
            )}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitDisabled || submitting}
                    className={cn(
                        'px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer',
                        submitDisabled || submitting
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-sm'
                    )}
                >
                    {submitting ? 'Enviando...' : 'Enviar denuncia'}
                </button>
            </div>
        </div>
    );
}
