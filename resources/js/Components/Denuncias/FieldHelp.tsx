import { HelpCircle } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';

interface FieldHelpProps {
    text: string;
}

export default function FieldHelp({ text }: FieldHelpProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none"
                    aria-label="Ayuda"
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="center"
                className="text-xs text-muted-foreground max-w-64 p-3 leading-relaxed"
            >
                {text}
            </PopoverContent>
        </Popover>
    );
}
