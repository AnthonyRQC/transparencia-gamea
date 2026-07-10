import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ChevronDown, UserCheck } from 'lucide-react';

interface Usuario {
  id: string;
  nombre: string;
  iniciales: string;
  color: string;
  rol: string;
  rol_label: string;
}

interface SelectorUsuarioDemoProps {
  currentUser: Usuario;
  usuarios: Record<string, Usuario>;
}

export default function SelectorUsuarioDemo({ currentUser, usuarios }: SelectorUsuarioDemoProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lista = Object.values(usuarios);

  const cambiarA = (id: string) => {
    setOpen(false);
    if (id === currentUser.id) return;
    router.post(route('cambiar-usuario'), { usuario_id: id }, {
      preserveScroll: true,
      onSuccess: () => {
        window.location.reload();
      },
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-sidebar-accent hover:bg-muted transition-colors cursor-pointer border border-border/40"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${currentUser.color}`}>
          {currentUser.iniciales}
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-xs font-semibold text-sidebar-foreground leading-tight truncate">{currentUser.nombre}</p>
          <p className="text-[9px] text-sidebar-foreground/60 leading-tight">{currentUser.rol_label}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/60 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-xl shadow-lg z-[100] py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Simular usuario</p>

          {lista.map((u) => {
            const activo = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => cambiarA(u.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors cursor-pointer
                  ${activo ? 'bg-accent text-accent-foreground' : 'text-popover-foreground hover:bg-muted'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.color}`}>
                  {u.iniciales}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-tight truncate">{u.nombre}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{u.rol_label}</p>
                </div>
                {activo && (
                  <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
