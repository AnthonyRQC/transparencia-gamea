import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import FieldHelp from './FieldHelp';
import ModalSubirArchivo from './ModalSubirArchivo';
import { cn } from '@/lib/utils';

function formatFilename(name: string, maxLen = 28) {
    if (name.length <= maxLen) return name;
    const dotIdx = name.lastIndexOf('.');
    const ext = dotIdx > 0 ? name.substring(dotIdx) : '';
    const baseMax = maxLen - ext.length - 2;
    const base = name.substring(0, baseMax);
    return `${base}..${ext}`;
}

interface FormularioIntervencionProps {
    data: Record<string, string>;
    onChange: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function FormularioIntervencion({ data, onChange, errors }: FormularioIntervencionProps) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="space-y-4">
            <Label className="text-sm font-semibold text-foreground">Formulario de Intervención / Medida Correctiva</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className={cn('text-xs font-medium', errors.dependencia_observada ? 'text-destructive' : 'text-muted-foreground')}>
                        Dependencia o Funcionario Observado/Denunciado <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        placeholder="Ej: Dirección de Obras, Catastro, Juan Pérez, etc."
                        value={data.dependencia_observada || ''}
                        onChange={(e) => onChange('dependencia_observada', e.target.value)}
                        className={cn(errors.dependencia_observada && 'border-destructive/50')}
                    />
                    {errors.dependencia_observada && <p className="text-xs text-destructive font-medium">{errors.dependencia_observada}</p>}
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Label className={cn('text-xs font-medium', errors.referencia_nota ? 'text-destructive' : 'text-muted-foreground')}>
                            Referencia de la Nota <span className="text-destructive">*</span>
                        </Label>
                        <FieldHelp text="Número o código de la nota interna que motiva la intervención." />
                    </div>
                    <Input
                        placeholder="N° de nota o código interno"
                        value={data.referencia_nota || ''}
                        onChange={(e) => onChange('referencia_nota', e.target.value)}
                        className={cn(errors.referencia_nota && 'border-destructive/50')}
                    />
                    {errors.referencia_nota && <p className="text-xs text-destructive font-medium">{errors.referencia_nota}</p>}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <Label className={cn('text-xs font-medium', errors.motivo ? 'text-destructive' : 'text-muted-foreground')}>
                        Motivo / Descripción del Patrón <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        rows={4}
                        placeholder="Describa el patrón identificado o motivo de la intervención"
                        value={data.motivo || ''}
                        onChange={(e) => onChange('motivo', e.target.value)}
                        className={cn(errors.motivo && 'border-destructive/50')}
                    />
                    {errors.motivo && <p className="text-xs text-destructive font-medium">{errors.motivo}</p>}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <Label className={cn('text-xs font-medium', errors.archivo ? 'text-destructive' : 'text-muted-foreground')}>
                        Archivo Adjunto <span className="text-destructive">*</span>
                    </Label>
                    {data.archivo ? (
                        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 border border-border/60">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-sm font-medium truncate">{formatFilename(data.archivo)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('archivo', '');
                                    onChange('archivo_data', '');
                                }}
                                className="text-xs text-destructive hover:text-destructive/80 font-semibold cursor-pointer"
                            >
                                Quitar
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                        >
                            <Upload className="w-5 h-5" />
                            <span className="text-sm font-medium">Seleccionar archivo</span>
                        </button>
                    )}
                    {errors.archivo && <p className="text-xs text-destructive font-medium">{errors.archivo}</p>}
                </div>
            </div>

            {modalOpen && (
                <ModalSubirArchivo
                    onSelect={(fileName, fileData) => {
                        onChange('archivo', fileName);
                        onChange('archivo_data', fileData);
                        setModalOpen(false);
                    }}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
}
