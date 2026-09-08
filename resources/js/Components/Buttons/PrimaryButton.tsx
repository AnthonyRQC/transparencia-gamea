/**
 * @deprecated Usa `Button` de `@/Components/ui/button` directamente.
 * Wrapper de compatibilidad: re-exporta `<Button variant="default">` de Shadcn.
 */
import { Button } from '@/Components/ui/button';
import { type ComponentProps, forwardRef } from 'react';

const PrimaryButton = forwardRef<HTMLButtonElement, ComponentProps<typeof Button>>(
    ({ children, ...props }, ref) => (
        <Button ref={ref} variant="default" {...props}>
            {children}
        </Button>
    ),
);
PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
