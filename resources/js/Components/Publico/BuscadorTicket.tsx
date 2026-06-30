import { useState, useCallback, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';

interface BuscadorTicketProps {
  processing: boolean;
  onProcessingChange: (p: boolean) => void;
}

const TICKET_REGEX = /^DEN-\d{4}-\d{4}-\d{4}$/;

export default function BuscadorTicket({ processing, onProcessingChange }: BuscadorTicketProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    // Limpiar espacios invisibles, espacios finales que añaden los celulares, y guiones largos/inteligentes
    val = val.trim().replace(/\s+/g, '').replace(/[–—]/g, '-');
    setValue(val);
  }, []);

  const canSubmit = TICKET_REGEX.test(value);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || processing) return;

    onProcessingChange(true);
    router.get(
      route('seguimiento.buscar'),
      { ticket: value },
      {
        preserveState: true,
        preserveScroll: true,
        only: ['encontrado', 'denuncia', 'error'],
        onFinish: () => onProcessingChange(false),
      }
    );
  }, [value, canSubmit, processing, onProcessingChange]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-semibold text-foreground">
        Número de Ticket y Código de Seguridad
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="DEN-2026-0004-1004"
            maxLength={19}
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono tracking-wider"
            disabled={processing}
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit || processing}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Consultando...
            </span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Consultar Estado
            </>
          )}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Formato: <code className="font-mono text-primary">DEN-AAAA-NNNN-PPPP</code> — incluya los guiones tal como aparece en su comprobante
      </p>
    </form>
  );
}
