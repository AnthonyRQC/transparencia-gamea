import type { ReactNode } from 'react';

/**
 * Tabla responsive estándar para admin (Sprint 13.2).
 * Desktop (`md+`): tabla shadcn. Móvil: tarjetas colapsables (<details>).
 * Patrón documentado en DESIGN.md § Tablas. Próxima: migrar Catálogos.
 */
export default function TablaResponsive({
  desktop,
  mobile,
}: {
  desktop: ReactNode;
  mobile: ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block border border-border rounded-xl bg-card overflow-x-auto">
        {desktop}
      </div>
      <div className="md:hidden space-y-3">
        {mobile}
      </div>
    </>
  );
}
