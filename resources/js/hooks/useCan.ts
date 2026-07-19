import { usePage } from '@inertiajs/react';
import { Permiso } from '@/permissions';

type SharedProps = {
  permisos?: Permiso[];
};

export function useCan(permiso: Permiso | Permiso[]): boolean {
  const { props } = usePage();
  const permisos = (props as unknown as SharedProps).permisos ?? [];

  if (Array.isArray(permiso)) {
    return permiso.some((p) => permisos.includes(p));
  }
  return permisos.includes(permiso);
}
