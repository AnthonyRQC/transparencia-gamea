import { FileText, Trash2, Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';
import { formatearFechaCorta } from '@/helpers/fechas';

interface ArchivoItem {
  id: number;
  denuncia_ticket: string;
  nombre: string;
  mime_type: string;
  tamano: string;
  descripcion?: string | null;
  contexto: string;
  fecha_subida: string;
}

interface TablaArchivosCasoProps {
  archivos: ArchivoItem[];
  onEliminar: (id: number) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const contextoColor: Record<string, string> = {
  general: 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground',
  informe: 'bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
  cierre: 'bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300',
};

export default function TablaArchivosCaso({ archivos, onEliminar, search, onSearchChange }: TablaArchivosCasoProps) {
  const filtrados = archivos.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.nombre.toLowerCase().includes(q) || (a.descripcion?.toLowerCase() || '').includes(q);
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar archivos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </div>

      {filtrados.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-4 text-center">
          {search ? 'Sin resultados' : 'No hay archivos subidos.'}
        </p>
      )}

      <div className="space-y-1.5">
        {filtrados.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 bg-card hover:bg-muted/30 transition-colors"
          >
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{a.nombre}</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{a.tamano}</span>
                <span>·</span>
                <span>{formatearFechaCorta(a.fecha_subida) ?? ''}</span>
                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', contextoColor[a.contexto] || '')}>
                  {a.contexto}
                </span>
              </div>
              {a.descripcion && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.descripcion}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onEliminar(a.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Eliminar archivo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
