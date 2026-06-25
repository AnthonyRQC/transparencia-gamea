import { usePage } from '@inertiajs/react';

interface InstitutionalLogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function InstitutionalLogo({ size = 'md', className = '' }: InstitutionalLogoProps) {
    const { logo_url } = usePage().props as { logo_url?: string };

    const sizeClasses: Record<string, string> = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    };

    return (
        <div className={`${sizeClasses[size]} ${className} relative shrink-0 flex items-center justify-center`}>
            <img
                src={logo_url || ''}
                alt="GAMEA - Gobierno Autónomo Municipal de El Alto"
                className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(255,255,255,0.2)] brightness-110"
            />
        </div>
    );
}
