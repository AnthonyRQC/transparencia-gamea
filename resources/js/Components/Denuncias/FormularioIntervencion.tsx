import { Label } from '@/Components/ui/label';

interface FormularioIntervencionProps {
    data: Record<string, string>;
    onChange: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function FormularioIntervencion({ data, onChange, errors }: FormularioIntervencionProps) {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-semibold text-foreground">Formulario de Intervención / Medida Correctiva</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Dependencia Observada o Denunciada <span className="text-destructive">*</span>
                    </Label>
                    <input
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Ej: Dirección de Obras, Catastro, etc."
                        value={data.dependencia_observada || ''}
                        onChange={(e) => onChange('dependencia_observada', e.target.value)}
                    />
                    {errors.dependencia_observada && <p className="text-xs text-destructive font-medium">{errors.dependencia_observada}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Referencia de la Nota <span className="text-destructive">*</span>
                    </Label>
                    <input
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="N° de nota o código interno"
                        value={data.referencia_nota || ''}
                        onChange={(e) => onChange('referencia_nota', e.target.value)}
                    />
                    {errors.referencia_nota && <p className="text-xs text-destructive font-medium">{errors.referencia_nota}</p>}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Motivo / Descripción del Patrón <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                        rows={4}
                        className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        placeholder="Describa el patrón identificado o motivo de la intervención"
                        value={data.motivo || ''}
                        onChange={(e) => onChange('motivo', e.target.value)}
                    />
                    {errors.motivo && <p className="text-xs text-destructive font-medium">{errors.motivo}</p>}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Archivo Adjunto <span className="text-destructive">*</span>
                    </Label>
                    <input
                        type="file"
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:font-semibold file:text-primary hover:file:bg-muted/50"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onChange('archivo', file.name);
                        }}
                    />
                    {errors.archivo && <p className="text-xs text-destructive font-medium">{errors.archivo}</p>}
                </div>
            </div>
        </div>
    );
}
