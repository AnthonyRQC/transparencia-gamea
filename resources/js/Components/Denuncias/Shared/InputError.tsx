import { AlertCircle } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';

interface InputErrorProps {
    message?: string;
}

export default function InputError({ message }: InputErrorProps) {
    if (!message) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center justify-center text-destructive shrink-0 cursor-pointer focus:outline-none"
                    aria-label="Error"
                >
                    <AlertCircle className="w-4 h-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="center"
                className="text-xs text-destructive font-medium max-w-48 p-2.5 leading-tight"
            >
                {message}
            </PopoverContent>
        </Popover>
    );
}
