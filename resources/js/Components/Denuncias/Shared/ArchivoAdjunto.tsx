import { FileText, Download, Trash2 } from 'lucide-react';

interface ArchivoAdjuntoProps {
  nombre: string;
  tamano?: string;
  onVer?: () => void;
  onEliminar?: () => void;
}

export default function ArchivoAdjunto({ nombre, tamano, onVer, onEliminar }: ArchivoAdjuntoProps) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors group">
      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{nombre}</p>
        {tamano && (
          <p className="text-[10px] text-muted-foreground">{tamano}</p>
        )}
      </div>
      {onEliminar && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEliminar(); }}
          className="p-1 rounded hover:bg-red-100 hover:text-red-600 transition-colors text-muted-foreground"
          title="Quitar archivo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      {onVer && (
        <button
          type="button"
          onClick={onVer}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-foreground/10"
          title="Ver archivo"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
