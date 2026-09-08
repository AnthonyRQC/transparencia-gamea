/**
 * @deprecated Usa `Button` de `@/Components/ui/button` directamente.
 * Wrapper de compatibilidad: re-exporta `<Button variant="outline">` de Shadcn.
 */
import { Button } from '@/Components/ui/button';
import { type ComponentProps, forwardRef } from 'react';

const SecondaryButton = forwardRef<HTMLButtonElement, ComponentProps<typeof Button>>(
    ({ children, ...props }, ref) => (
        <Button ref={ref} variant="outline" {...props}>
            {children}
        </Button>
    ),
);
SecondaryButton.displayName = 'SecondaryButton';

export default SecondaryButton;
