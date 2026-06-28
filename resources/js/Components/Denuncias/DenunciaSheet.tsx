import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { Separator } from '@/Components/ui/separator';
import PlazoBadge from './PlazoBadge';
import TipoDenunciaBadge from './TipoDenunciaBadge';

interface PlazoInfo {
  dias_restantes: number;
  color: 'green' | 'yellow' | 'red';
}

interface Denunciado {
  conoce_identidad: boolean;
  nombres?: string;
  dependencia?: string;
  descripcion?: string;
}

interface Prueba {
  tipo: string;
  descripcion: string;
  testigo_nombre?: string;
  testigo_telefono?: string;
  archivo_nombre?: string;
}

interface DenunciaDetail {
  ticket: string;
  tipo: string;
  escenario?: string;
  denunciante?: { nombres?: string; ci?: string; email?: string; telefono?: string };
  denunciados?: Denunciado[];
  detalles?: { categoria?: string; fecha?: string; hora?: string; lugar?: string };
  hechos?: string;
  pruebas?: Prueba[];
  tecnico?: string | null;
  created_at: string;
  estado: string;
}

interface DenunciaSheetProps {
  denuncia: DenunciaDetail | null;
  plazo: PlazoInfo | null;
  tecnicos?: Record<string, { id: string; nombre: string; iniciales: string; color: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

const escenarioLabel: Record<string, string> = {
  revelada: 'Identidad Revelada',
  reservada: 'Identidad Reservada',
  anonimo: 'Anónimo',
};

const tipoPruebaLabel: Record<string, string> = {
  archivo: 'Archivo',
  fisica: 'Prueba Física',
  testigo: 'Testigo',
};

export default function DenunciaSheet({ denuncia, plazo, tecnicos, open, onOpenChange, children }: DenunciaSheetProps) {
  if (!denuncia) return null;

  const fecha = new Date(denuncia.created_at).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const tecnicoInfo = denuncia.tecnico && tecnicos ? tecnicos[denuncia.tecnico] : null;
  const hechos = denuncia.hechos || '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader className="shrink-0">
          <div className="flex items-center gap-2 flex-wrap pr-6">
            <SheetTitle className="font-mono">{denuncia.ticket}</SheetTitle>
            <TipoDenunciaBadge tipo={denuncia.tipo} />
            <PlazoBadge plazo={plazo} />
          </div>
          <p className="text-sm text-muted-foreground">Ingresada: {fecha}</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Denunciante */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Denunciante</h4>
            {denuncia.escenario === 'anonimo' ? (
              <p className="text-sm font-medium">Anónimo</p>
            ) : (
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{denuncia.denunciante?.nombres || '—'}</p>
                  {denuncia.escenario && denuncia.escenario !== 'revelada' && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
                      {escenarioLabel[denuncia.escenario]}
                    </span>
                  )}
                </div>
                {denuncia.denunciante?.ci && <p className="text-muted-foreground">CI: {denuncia.denunciante.ci}</p>}
                {denuncia.denunciante?.email && <p className="text-muted-foreground">Email: {denuncia.denunciante.email}</p>}
                {denuncia.denunciante?.telefono && <p className="text-muted-foreground">Tel: {denuncia.denunciante.telefono}</p>}
              </div>
            )}
          </section>
          <Separator />

          {/* Denunciados */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Denunciado(s) {denuncia.denunciados ? `(${denuncia.denunciados.length})` : ''}
            </h4>
            {denuncia.denunciados?.map((d, i) => (
              <div key={i} className="text-sm space-y-0.5 mb-3 last:mb-0">
                {d.conoce_identidad ? (
                  <>
                    <p className="font-medium">{d.nombres || '—'}</p>
                    <p className="text-muted-foreground">{d.dependencia || '—'}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">No se conoce la identidad</p>
                )}
                {!d.conoce_identidad && d.descripcion && (
                  <p className="text-sm text-muted-foreground mt-0.5">{d.descripcion}</p>
                )}
              </div>
            )) || <p className="text-sm text-muted-foreground italic">Sin denunciados registrados</p>}
          </section>
          <Separator />

          {/* Detalles del Incidente */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Detalles del Incidente</h4>
            <div className="text-sm space-y-1">
              {denuncia.detalles?.categoria && <p><span className="text-muted-foreground">Categoría:</span> {denuncia.detalles.categoria}</p>}
              {denuncia.detalles?.fecha && <p><span className="text-muted-foreground">Fecha:</span> {denuncia.detalles.fecha}</p>}
              {denuncia.detalles?.hora && <p><span className="text-muted-foreground">Hora:</span> {denuncia.detalles.hora}</p>}
              {denuncia.detalles?.lugar && <p><span className="text-muted-foreground">Lugar:</span> {denuncia.detalles.lugar}</p>}
            </div>
          </section>
          <Separator />

          {/* Relación de Hechos */}
          {hechos && (
            <>
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Relación de Hechos</h4>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{hechos}</p>
              </section>
              <Separator />
            </>
          )}

          {/* Pruebas */}
          {denuncia.pruebas && denuncia.pruebas.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Pruebas / Testigos ({denuncia.pruebas.length})
              </h4>
              <div className="space-y-2">
                {denuncia.pruebas.map((p, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/70">
                        {tipoPruebaLabel[p.tipo] || p.tipo}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{p.descripcion}</p>
                    {p.tipo === 'testigo' && (
                      <p className="text-xs mt-1">
                        <span className="text-muted-foreground">Contacto:</span> {p.testigo_nombre} — {p.testigo_telefono}
                      </p>
                    )}
                    {p.archivo_nombre && (
                      <p className="text-xs mt-1">
                        <span className="text-muted-foreground">Archivo:</span> {p.archivo_nombre}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Técnico asignado */}
          {tecnicoInfo && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Técnico Asignado</h4>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-6 h-6 rounded-full ${tecnicoInfo.color} text-white text-[10px] font-bold flex items-center justify-center`}>
                  {tecnicoInfo.iniciales}
                </span>
                <p className="font-medium">{tecnicoInfo.nombre}</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer actions */}
        {children && (
          <div className="shrink-0 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
            {children}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
