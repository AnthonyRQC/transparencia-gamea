import { cn } from '@/lib/utils';

interface ProgressBarProps {
    percent: number;
    totalFields: number;
    completedFields: number;
}

export default function ProgressBar({ percent, totalFields, completedFields }: ProgressBarProps) {
    return (
        <div className="bg-background/95 backdrop-blur-md border-b border-border/80 shadow-xs animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="px-4 sm:px-6 md:px-8 py-2.5">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-sidebar-accent rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap tabular-nums">
                        {completedFields}/{totalFields} campo{totalFields !== 1 ? 's' : ''} completado{completedFields !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
}
