import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, GitCommit, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface PadreOption {
    id: number | null;
    nombre: string;
}

interface SelectPadreDependenciaProps {
    options: PadreOption[];
    value: number | null | string;
    onChange: (value: number | null) => void;
    disabled?: boolean;
}

interface ParsedOption {
    id: number | null;
    rawNombre: string;
    leafName: string;
    ancestorsArray: string[];
    depth: number;
    isRoot: boolean;
}

function isSameId(a: number | null | string | undefined, b: number | null | string | undefined): boolean {
    if ((a === null || a === undefined || a === '') && (b === null || b === undefined || b === '')) {
        return true;
    }
    if (a === null || a === undefined || a === '' || b === null || b === undefined || b === '') {
        return false;
    }
    return String(a) === String(b);
}

function getLevelStyle(depth: number, isRoot: boolean) {
    if (isRoot) {
        return {
            badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border-purple-200',
            border: 'border-l-purple-600',
            tag: 'RAÍZ / ALCALDÍA',
        };
    }
    switch (depth) {
        case 0:
        case 1:
            return {
                badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border-indigo-200',
                border: 'border-l-indigo-500',
                tag: 'SECRETARÍA / DESPACHO',
            };
        case 2:
            return {
                badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200 border-sky-200',
                border: 'border-l-sky-500',
                tag: 'DIRECCIÓN',
            };
        default:
            return {
                badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200',
                border: 'border-l-emerald-500',
                tag: 'UNIDAD / ÁREA',
            };
    }
}

export default function SelectPadreDependencia({
    options,
    value,
    onChange,
    disabled = false,
}: SelectPadreDependenciaProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [dropUp, setDropUp] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse options into structured hierarchy items
    const parsedOptions = useMemo<ParsedOption[]>(() => {
        return options.map((opt) => {
            if (opt.id === null) {
                return {
                    id: null,
                    rawNombre: opt.nombre,
                    leafName: opt.nombre,
                    ancestorsArray: [],
                    depth: 0,
                    isRoot: true,
                };
            }

            const parts = opt.nombre.split(' — ');
            const leafName = parts[parts.length - 1] ?? opt.nombre;
            const ancestorsArray = parts.slice(0, parts.length - 1);

            return {
                id: opt.id,
                rawNombre: opt.nombre,
                leafName,
                ancestorsArray,
                depth: Math.max(0, parts.length - 1),
                isRoot: false,
            };
        });
    }, [options]);

    // Selected option details with robust ID matching
    const selectedOpt = useMemo(() => {
        return parsedOptions.find((o) => isSameId(o.id, value)) ?? null;
    }, [parsedOptions, value]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return parsedOptions;
        const q = search.toLowerCase();
        return parsedOptions.filter(
            (opt) => opt.rawNombre.toLowerCase().includes(q) || opt.leafName.toLowerCase().includes(q)
        );
    }, [parsedOptions, search]);

    const selectedStyle = selectedOpt ? getLevelStyle(selectedOpt.depth, selectedOpt.isRoot) : null;

    // Detect available vertical space to flip upwards if near screen bottom
    useEffect(() => {
        if (open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 260) {
                setDropUp(true);
            } else {
                setDropUp(false);
            }
        }
    }, [open]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative w-full" ref={containerRef}>
            <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={cn(
                    "w-full justify-between font-normal text-left h-auto py-2.5 px-3 text-xs whitespace-normal break-words flex items-center min-h-[44px] border-input hover:bg-accent hover:text-accent-foreground bg-background transition-all shadow-xs rounded-xl",
                    open && "border-primary ring-2 ring-primary/20"
                )}
            >
                <div className="flex-1 min-w-0 pr-2">
                    {selectedOpt ? (
                        selectedOpt.isRoot ? (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn('text-[10px] font-semibold py-0.5 px-2', selectedStyle?.badge)}>
                                    <GitCommit className="w-3 h-3 mr-1" />
                                    {selectedOpt.leafName}
                                </Badge>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1 text-left">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-foreground text-xs leading-snug break-words">
                                        {selectedOpt.leafName}
                                    </span>
                                    <Badge variant="outline" className={cn('text-[9px] py-0 px-1.5 font-medium shrink-0', selectedStyle?.badge)}>
                                        {selectedStyle?.tag}
                                    </Badge>
                                </div>
                                {selectedOpt.ancestorsArray.length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap text-[10px] text-muted-foreground font-medium leading-relaxed">
                                        {selectedOpt.ancestorsArray.map((anc, idx) => (
                                            <span key={idx} className="flex items-center gap-1">
                                                {idx > 0 && <ChevronRight className="w-2.5 h-2.5 opacity-40 shrink-0" />}
                                                <span className="break-words">{anc}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <span className="text-muted-foreground">Seleccionar dependencia padre...</span>
                    )}
                </div>
                {open ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-primary ml-1" />
                ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-1" />
                )}
            </Button>

            {open && (
                <div
                    className={cn(
                        "absolute left-0 right-0 z-50 p-3 bg-popover text-popover-foreground border rounded-2xl shadow-2xl space-y-2.5 animate-in fade-in-50 zoom-in-95 duration-150",
                        dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
                    )}
                >
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar dependencia padre por nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 text-xs pl-8 pr-3 w-full rounded-xl bg-background"
                        />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 font-medium">
                        <span>Jerarquía del Organigrama ({filteredOptions.length})</span>
                        <span className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[9px]">
                                <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" /> Raíz
                            </span>
                            <span className="flex items-center gap-1 text-[9px]">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Sec.
                            </span>
                            <span className="flex items-center gap-1 text-[9px]">
                                <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Dir.
                            </span>
                            <span className="flex items-center gap-1 text-[9px]">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Unid.
                            </span>
                        </span>
                    </div>

                    <ScrollArea className="h-44 max-h-[190px] overflow-y-auto pr-1 border-t pt-2">
                        {filteredOptions.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-6 text-center">
                                No se encontraron dependencias coincidentes.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {filteredOptions.map((opt) => {
                                    const isSelected = isSameId(opt.id, value);
                                    const style = getLevelStyle(opt.depth, opt.isRoot);

                                    return (
                                        <button
                                            key={opt.id === null ? 'root' : opt.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(opt.id);
                                                setOpen(false);
                                                setSearch('');
                                            }}
                                            className={cn(
                                                'w-full text-left p-2.5 text-xs rounded-xl transition-all cursor-pointer block border-l-4 bg-background hover:bg-accent hover:border-primary shadow-2xs',
                                                style.border,
                                                isSelected && 'bg-primary/10 text-primary font-medium border-l-primary ring-1 ring-primary/30 shadow-xs'
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    {opt.isRoot ? (
                                                        <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 text-xs py-0.5">
                                                            <GitCommit className="w-4 h-4 shrink-0" />
                                                            <span>{opt.leafName}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-semibold text-foreground text-xs leading-snug break-words">
                                                                    {opt.leafName}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn('text-[9px] py-0 px-1.5 font-medium shrink-0', style.badge)}
                                                                >
                                                                    {style.tag}
                                                                </Badge>
                                                            </div>

                                                            {opt.ancestorsArray.length > 0 && (
                                                                <div className="flex items-center gap-1 flex-wrap text-[10px] text-muted-foreground font-normal leading-relaxed pt-0.5">
                                                                    {opt.ancestorsArray.map((anc, idx) => (
                                                                        <span key={idx} className="flex items-center gap-1">
                                                                            {idx > 0 && <ChevronRight className="w-2.5 h-2.5 opacity-40 shrink-0" />}
                                                                            <span className="break-words font-medium">{anc}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-primary shrink-0 self-center" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
