import { useState, useCallback } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { Search, ShieldCheck, Lock, Eye, ArrowRight, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';
import InstitutionalLogo from '@/Components/Layout/InstitutionalLogo';
import BuscadorTicket from '@/Components/Publico/BuscadorTicket';
import ResultadoSeguimiento from '@/Components/Publico/ResultadoSeguimiento';
import EstadoVacio from '@/Components/Publico/EstadoVacio';
import EstadoNoEncontrado from '@/Components/Publico/EstadoNoEncontrado';
import EsqueletoBusqueda from '@/Components/Publico/EsqueletoBusqueda';

interface DenunciaPublica {
  ticket: string;
  tipo: string;
  tipo_legible: string;
  estado: string;
  estado_legible: string;
  fecha_ingreso: string | null;
  fecha_vencimiento: string | null;
  plazo_total_dias: number | null;
  mensaje_avance: string;
  pasos: {
    recepcion: boolean;
    evaluacion: boolean;
    investigacion: boolean;
    resolucion: boolean;
    rechazada: boolean;
  };
  resumen_rechazo: string | null;
  clasificacion: string | null;
  fecha_cierre: string | null;
}

interface PageProps {
  encontrado: boolean;
  denuncia: DenunciaPublica | null;
  error: string | null;
}

export default function Buscar() {
  const { encontrado, denuncia, error } = usePage().props as unknown as PageProps;
  const [processing, setProcessing] = useState(false);

  const handleReintentar = useCallback(() => {
    router.get(route('seguimiento.buscar'), {}, { preserveState: false });
  }, []);

  const showResult = encontrado && denuncia;
  const showNotFound = encontrado === false && error === 'no_encontrado';
  const showFormatError = encontrado === false && error === 'invalido';
  const showInitial = encontrado === false && !error;

  const confidencialidadItems = [
    { icon: ShieldCheck, title: 'Proceso Legal', desc: 'Conforme a la Ley N° 974' },
    { icon: Lock, title: 'Identidad Protegida', desc: 'Reserva según Art. 24 y 29' },
    { icon: Eye, title: 'Transparencia', desc: 'Solo datos no sensibles' },
  ];

  return (
    <>
      <Head title="Seguimiento de Denuncia — GAMEA UTLCC" />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 font-sans">
        <header className="border-b border-border bg-slate-950 text-slate-50 sticky top-0 z-50 px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <Link href={route('home')} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 group">
              <InstitutionalLogo size="sm" />
              <div className="min-w-0">
                  <h1 className="text-sm xs:text-base sm:text-lg font-bold tracking-tight text-slate-50 leading-tight truncate group-hover:text-slate-200 transition-colors">
                      <span className="sm:hidden">GAMEA</span>
                      <span className="hidden sm:inline">Gobierno Autónomo Municipal de El Alto</span>
                  </h1>
                  <p className="hidden xs:block text-[10px] sm:text-xs text-slate-400 font-medium leading-none mt-0.5 truncate">
                      Unidad de Transparencia y Lucha Contra la Corrupción · UTLCC
                  </p>
              </div>
          </Link>
          <div className="flex items-center shrink-0">
              <Link
                href={route('home')}
                className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold shadow-md hover:bg-slate-700 transition-all duration-200 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Volver al Inicio</span>
                <span className="sm:hidden">Volver</span>
              </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
          <section className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Seguimiento Ciudadano
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Consulta el estado de tu <span className="text-primary">denuncia</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Ingresa el número de ticket y código de seguridad que se te entregó al momento de registrar tu denuncia
              para conocer su fase actual y las fechas estimadas del proceso.
            </p>
          </section>

          <section className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <BuscadorTicket processing={processing} onProcessingChange={setProcessing} />

            {showFormatError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Formato inválido. El ticket debe tener el formato <strong>DEN-AAAA-NNNN-PPPP</strong>.
                </p>
              </div>
            )}
          </section>

          {processing && (
            <section className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
              <EsqueletoBusqueda />
            </section>
          )}

          {showResult && !processing && (
            <ResultadoSeguimiento denuncia={denuncia} />
          )}

          {showNotFound && !processing && (
            <section className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
              <EstadoNoEncontrado onReintentar={handleReintentar} />
            </section>
          )}

          {showInitial && !processing && (
            <section className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
              <EstadoVacio />
            </section>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {confidencialidadItems.map((item) => (
              <div
                key={item.title}
                className="bg-card border rounded-xl p-4 text-center space-y-2"
              >
                <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
