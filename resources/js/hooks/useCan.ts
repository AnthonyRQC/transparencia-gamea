import { usePage } from '@inertiajs/react';
import { Permiso } from '@/permissions';

type SharedProps = {
  auth?: {
    user?: {
      permisos?: Permiso[];
    } | null;
  } | null;
};

export function useCan(permiso: Permiso | Permiso[]): boolean {
  const { props } = usePage();
  // Fuente única: auth.user.permisos (HandleInertiaRequests). No existe
  // props.permisos a nivel raíz — leerlo ahí siempre niega (bug R1.5/13.2).
  const permisos = (props as unknown as SharedProps).auth?.user?.permisos ?? [];

  if (Array.isArray(permiso)) {
    return permiso.some((p) => permisos.includes(p));
  }
  return permisos.includes(permiso);
}
