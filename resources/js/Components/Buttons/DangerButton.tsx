/**
 * @deprecated Usa `Button` de `@/Components/ui/button` directamente.
 * Wrapper de compatibilidad: re-exporta `<Button variant="destructive">` de Shadcn.
 */
import { Button } from '@/Components/ui/button';
import { type ComponentProps, forwardRef } from 'react';

const DangerButton = forwardRef<HTMLButtonElement, ComponentProps<typeof Button>>(
    ({ children, ...props }, ref) => (
        <Button ref={ref} variant="destructive" {...props}>
            {children}
        </Button>
    ),
);
DangerButton.displayName = 'DangerButton';

export default DangerButton;
