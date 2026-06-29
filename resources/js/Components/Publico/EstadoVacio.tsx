import { Search } from 'lucide-react';

export default function EstadoVacio() {
  return (
    <div className="text-center py-8 space-y-3 animate-fade-in">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
        <Search className="w-7 h-7 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
        Ingresa tu número de ticket y código de seguridad para consultar el estado de tu denuncia.
      </p>
    </div>
  );
}
