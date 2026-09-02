export default function SeccionEncabezado() {
    const today = new Date().toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex items-center justify-between py-3 px-5 bg-muted/30 rounded-xl border border-border/60">
            <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground font-medium">Fecha de registro</span>
                <p className="text-sm font-semibold text-foreground">{today}</p>
            </div>
            <div className="text-right space-y-0.5">
                <span className="text-xs text-muted-foreground font-medium">N° de Denuncia</span>
                <p className="text-sm font-semibold text-muted-foreground italic">Se generará al enviar</p>
            </div>
        </div>
    );
}
