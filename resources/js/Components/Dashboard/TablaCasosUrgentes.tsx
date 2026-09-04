import { Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import type { Urgente } from '@/types/dashboard';

const ETIQUETAS_ESTADO: Record<string, string> = {
    ingresada: 'Ingresada',
    evaluacion_tecnica: 'En evaluación',
    admitida: 'Admitida',
    asignada: 'Asignada',
    investigacion: 'Investigación',
    informe: 'Informe Final',
    rechazada: 'Rechazada',
    cerrada: 'Cerrada',
};

const badgeColor: Record<string, string> = {
    green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    gray: 'bg-muted text-muted-foreground border-border',
};

interface Props {
    urgentes: Urgente[];
    esTecnico: boolean;
}

export default function TablaCasosUrgentes({ urgentes, esTecnico }: Props) {
    return (
        <div className="overflow-x-auto">
            {urgentes.length > 0 && (
                <p className="text-[11px] text-muted-foreground px-1 pb-1">
                    {urgentes.length} caso(s) que vencen pronto o ya vencieron.
                </p>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-32">Ticket</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead className="text-right">Días</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {urgentes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                                No hay casos urgentes con los filtros actuales.
                            </TableCell>
                        </TableRow>
                    ) : (
                        urgentes.map((u) => (
                            <TableRow key={u.ticket}>
                                <TableCell className="font-mono font-semibold text-primary text-xs">
                                    <Link href={esTecnico ? '/denuncias/mis-casos' : '/denuncias'} title="Ver en la bandeja">
                                        {u.ticket}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-xs">{u.tecnico}</TableCell>
                                <TableCell className="text-right">
                                    <Badge className={badgeColor[u.color] ?? badgeColor.gray}>{u.diasRestantes} d</Badge>
                                </TableCell>
                                <TableCell className="text-xs">{ETIQUETAS_ESTADO[u.estado] ?? u.estado}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
