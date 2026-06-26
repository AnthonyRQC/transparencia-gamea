import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface StickyFooterProps {
    onCancel: () => void;
    onSubmit: () => void;
    submitDisabled?: boolean;
    submitLabel?: string;
}

export default function StickyFooter({
    onCancel,
    onSubmit,
    submitDisabled = true,
    submitLabel = 'Enviar denuncia',
}: StickyFooterProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShow(!entry.isIntersecting);
            },
            { threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div ref={sentinelRef} className="h-px" />
            <div
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur border-t border-border shadow-lg transition-all duration-300',
                    show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                )}
            >
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitDisabled}
                        className={cn(
                            'px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer',
                            submitDisabled
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-sm'
                        )}
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </>
    );
}
