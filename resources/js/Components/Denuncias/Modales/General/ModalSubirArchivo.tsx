import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.docx';

interface ModalSubirArchivoProps {
    onSelect: (fileName: string, fileData: string) => void;
    onClose: () => void;
}

export default function ModalSubirArchivo({ onSelect, onClose }: ModalSubirArchivoProps) {
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ name: string; data: string; type: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);

        if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|docx)$/i)) {
            setError('Formato no aceptado. Use PDF, JPG, PNG o DOCX.');
            return;
        }

        if (file.size > MAX_SIZE_BYTES) {
            setError(`El archivo excede el tamaño máximo de ${MAX_SIZE_MB}MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result as string;
            setPreview({ name: file.name, data, type: file.type });
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleConfirm = () => {
        if (preview) {
            onSelect(preview.name, preview.data);
        }
    };

    return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="modal-upload-title" onClick={onClose}>
            <div
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 id="modal-upload-title" className="text-base font-bold text-foreground">Subir archivo</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Drop zone */}
                    {!preview && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className={cn(
                                'flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
                                dragOver
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
                            )}
                        >
                            <Upload className={cn('w-10 h-10 mb-3 transition-colors', dragOver ? 'text-primary' : 'text-muted-foreground')} />
                            <p className="text-sm font-semibold text-foreground mb-1">
                                {dragOver ? 'Suelte el archivo aquí' : 'Arrastre el archivo o haga clic para seleccionar'}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                PDF, JPG, PNG, DOCX · Máx {MAX_SIZE_MB}MB
                            </p>
                        </div>
                    )}

                    {/* Preview */}
                    {preview && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/60">
                                <FileText className="w-8 h-8 text-primary shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold truncate">{preview.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {preview.type || 'Archivo'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setPreview(null); setError(null); }}
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0"
                                    aria-label="Cambiar archivo"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {preview.type.startsWith('image/') && (
                                <div className="rounded-xl overflow-hidden border border-border max-h-48">
                                    <img
                                        src={preview.data}
                                        alt={preview.name}
                                        className="w-full h-full object-contain bg-muted/20"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-sidebar-accent" />
                                Formatos: PDF, JPG, PNG, DOCX · Máx {MAX_SIZE_MB}MB
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-destructive font-medium flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {error}
                        </p>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED_EXTENSIONS}
                        className="hidden"
                        onChange={handleInputChange}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border bg-muted/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!preview}
                        className={cn(
                            'px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer',
                            preview
                                ? 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98]'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                        )}
                    >
                        Subir archivo
                    </button>
                </div>
            </div>
        </div>
    );
}
