import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import FieldHelp from './FieldHelp';
import InputError from './InputError';
import { cn } from '@/lib/utils';

interface DenuncianteData {
    nombres: string;
    ci: string;
    email: string;
    telefono: string;
}

interface SeccionDenuncianteProps {
    escenario: string;
    data: DenuncianteData;
    onChange: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function SeccionDenunciante({ escenario, data, onChange, errors }: SeccionDenuncianteProps) {
    const esAnonimo = escenario === 'anonimo';

    if (esAnonimo) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold text-foreground">Datos de contacto (opcional)</Label>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                    Si proporciona un correo electrónico o teléfono podrá recibir actualizaciones del caso.
                    Si no, solo podrá consultarlo con el código del sistema o presencialmente en la UTLCC.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Label htmlFor="email-anonimo" className="text-xs font-medium text-muted-foreground">
                                Correo electrónico
                            </Label>
                            <FieldHelp text="Correo electrónico para notificaciones del caso." />
                        </div>
                        <div className="relative">
                            <Input
                                id="email-anonimo"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={data.email}
                                onChange={(e) => onChange('email', e.target.value)}
                                className={cn(errors['denunciante.email'] && 'border-destructive/50 pr-8')}
                            />
                            {errors['denunciante.email'] && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                    <InputError message={errors['denunciante.email']} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Label htmlFor="telefono-anonimo" className="text-xs font-medium text-muted-foreground">
                                Teléfono / Celular
                            </Label>
                            <FieldHelp text="8 dígitos, sin código de país. Ej: 70123456" />
                        </div>
                        <div className="relative">
                            <Input
                                id="telefono-anonimo"
                                type="tel"
                                placeholder="70123456"
                                value={data.telefono}
                                onChange={(e) => onChange('telefono', e.target.value)}
                                className={cn(errors['denunciante.telefono'] && 'border-destructive/50 pr-8')}
                            />
                            {errors['denunciante.telefono'] && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                    <InputError message={errors['denunciante.telefono']} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-foreground">Datos del Denunciante</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="nombres" className={cn('text-xs font-medium', errors['denunciante.nombres'] ? 'text-destructive' : 'text-muted-foreground')}>
                        Nombres y Apellidos <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="nombres"
                            placeholder="Juan Pérez Mamani"
                            value={data.nombres}
                            onChange={(e) => onChange('nombres', e.target.value)}
                            className={cn(errors['denunciante.nombres'] && 'border-destructive/50 pr-8')}
                        />
                        {errors['denunciante.nombres'] && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <InputError message={errors['denunciante.nombres']} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="ci" className={cn('text-xs font-medium', errors['denunciante.ci'] ? 'text-destructive' : 'text-muted-foreground')}>
                            Cédula de Identidad <span className="text-muted-foreground font-normal">(opcional)</span>
                        </Label>
                        <FieldHelp text="Ingrese el número sin puntos ni guiones. Ej: 1234567" />
                    </div>
                    <div className="relative">
                        <Input
                            id="ci"
                            type="tel"
                            placeholder="1234567"
                            value={data.ci}
                            onChange={(e) => onChange('ci', e.target.value.replace(/\D/g, ''))}
                            className={cn(errors['denunciante.ci'] && 'border-destructive/50 pr-8')}
                        />
                        {errors['denunciante.ci'] && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <InputError message={errors['denunciante.ci']} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="email" className={cn('text-xs font-medium', errors['denunciante.email'] ? 'text-destructive' : 'text-muted-foreground')}>
                            Correo electrónico <span className="text-muted-foreground font-normal">(opcional)</span>
                        </Label>
                        <FieldHelp text="Correo electrónico válido para notificaciones del caso." />
                    </div>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={data.email}
                            onChange={(e) => onChange('email', e.target.value)}
                            className={cn(errors['denunciante.email'] && 'border-destructive/50 pr-8')}
                        />
                        {errors['denunciante.email'] && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <InputError message={errors['denunciante.email']} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="telefono" className={cn('text-xs font-medium', errors['denunciante.telefono'] ? 'text-destructive' : 'text-muted-foreground')}>
                            Teléfono / Celular <span className="text-muted-foreground font-normal">(opcional)</span>
                        </Label>
                        <FieldHelp text="8 dígitos, sin código de país. Ej: 70123456" />
                    </div>
                    <div className="relative">
                        <Input
                            id="telefono"
                            type="tel"
                            placeholder="70123456"
                            value={data.telefono}
                            onChange={(e) => onChange('telefono', e.target.value.replace(/\D/g, ''))}
                            className={cn(errors['denunciante.telefono'] && 'border-destructive/50 pr-8')}
                        />
                        {errors['denunciante.telefono'] && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <InputError message={errors['denunciante.telefono']} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
