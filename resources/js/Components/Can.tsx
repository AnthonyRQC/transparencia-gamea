import { ReactNode } from 'react';
import { Permiso } from '@/permissions';
import { useCan } from '@/hooks/useCan';

interface CanProps {
  permiso: Permiso | Permiso[];
  children: ReactNode;
  fallback?: ReactNode;
}

export default function Can({ permiso, children, fallback = null }: CanProps) {
  const allowed = useCan(permiso);
  return <>{allowed ? children : fallback}</>;
}
