import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    percent: number;
    totalFields: number;
    completedFields: number;
}

export default function ProgressBar({ percent, totalFields, completedFields }: ProgressBarProps) {
    const barRef = useRef<HTMLDivElement>(null);
    const [stuck, setStuck] = useState(false);

    useEffect(() => {
        const el = barRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setStuck(!entry.isIntersecting);
            },
            { threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div ref={barRef} className="h-px" />
            <div
                className={cn(
                    'transition-all duration-300',
                    stuck
                        ? 'fixed top-[73px] left-0 right-0 z-40 bg-background/90 backdrop-blur border-b border-border shadow-sm'
                        : 'relative'
                )}
            >
                <div className={cn('px-4 py-2', stuck && 'md:pl-[calc(var(--sidebar-width)+1rem)] md:pr-6')}>
                    <div className="flex items-center gap-3 max-w-4xl mx-auto">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-sidebar-accent rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap tabular-nums">
                            {completedFields}/{totalFields} completado
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
