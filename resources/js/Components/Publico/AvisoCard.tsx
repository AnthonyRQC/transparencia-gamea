import { Download, FileText, Pin } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { formatearFechaCorta, formatearFechaLarga } from '@/helpers/fechas';
import { EVENTO_CASO_LABEL, PRIORIDAD_PUBLICACION_COLOR } from '@/Components/Denuncias/Shared/semantica';

export interface AvisoPublico {
  id: number;
  tipo: string | null;
  tipo_nombre: string | null;
  prioridad: string | null;
  cite: string | null;
  fecha_documento: string | null;
  emisor: string | null;
  destinatario: string | null;
  titulo: string;
  resumen: string | null;
  referencia_externa: string | null;
  ticket: string | null;
  evento: string | null;
  fijada: boolean;
  publicado_at: string | null;
  archivos: Array<{ id: number; nombre: string; tamano: string | null }>;
}

export default function AvisoCard({ aviso }: { aviso: AvisoPublico }) {
  return (
    <article className={`bg-card border rounded-2xl p-5 space-y-3 ${aviso.fijada ? 'border-primary/40 shadow-sm' : 'border-border'}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {aviso.tipo_nombre && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
            {aviso.tipo_nombre}
          </Badge>
        )}
        {aviso.prioridad && aviso.prioridad !== 'ordinario' && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${PRIORIDAD_PUBLICACION_COLOR[aviso.prioridad] ?? ''}`}>
            {aviso.prioridad}
          </span>
        )}
        {aviso.fijada && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
            <Pin className="w-3 h-3" />
            Fijado
          </span>
        )}
        {aviso.evento && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-800 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300">
            {EVENTO_CASO_LABEL[aviso.evento] ?? aviso.evento}
          </span>
        )}
      </div>

      <h4 className="font-bold text-base leading-snug">{aviso.titulo}</h4>
      {aviso.resumen && (
        <p className="text-sm text-muted-foreground leading-relaxed">{aviso.resumen}</p>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {aviso.cite && (
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground shrink-0">CITE:</dt>
            <dd className="font-mono font-semibold">{aviso.cite}</dd>
          </div>
        )}
        {aviso.fecha_documento && (
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground shrink-0">Fecha:</dt>
            <dd className="font-medium">{formatearFechaCorta(aviso.fecha_documento) ?? ''}</dd>
          </div>
        )}
        {aviso.ticket && (
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground shrink-0">Caso:</dt>
            <dd className="font-mono font-semibold text-primary">{aviso.ticket}</dd>
          </div>
        )}
        {aviso.destinatario && (
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground shrink-0">Dirigido a:</dt>
            <dd className="font-medium">{aviso.destinatario}</dd>
          </div>
        )}
        {aviso.referencia_externa && (
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground shrink-0">Ref. externa:</dt>
            <dd className="font-mono">{aviso.referencia_externa}</dd>
          </div>
        )}
        {aviso.emisor && (
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground shrink-0">Emite:</dt>
            <dd className="font-medium">{aviso.emisor}</dd>
          </div>
        )}
      </dl>

      {aviso.archivos.length > 0 && (
        <div className="space-y-1.5">
          {aviso.archivos.map((a) => (
            <a
              key={a.id}
              href={route('panel.descargar', { id: a.id })}
              className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground">{a.nombre}</span>
              {a.tamano && <span className="shrink-0">· {a.tamano}</span>}
              <Download className="w-3.5 h-3.5 shrink-0 ml-auto text-primary" />
            </a>
          ))}
        </div>
      )}

      {aviso.publicado_at && (
        <p className="text-[11px] text-muted-foreground">
          Publicado: {formatearFechaLarga(aviso.publicado_at.slice(0, 10)) ?? ''}
        </p>
      )}
    </article>
  );
}
