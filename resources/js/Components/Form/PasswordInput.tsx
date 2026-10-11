import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import TextInput from './TextInput';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isFocused?: boolean;
}

/** Input de contraseña con toggle Eye/EyeOff. */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <TextInput
          {...props}
          ref={ref as never}
          type={visible ? 'text' : 'password'}
          className={`pr-10 ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
