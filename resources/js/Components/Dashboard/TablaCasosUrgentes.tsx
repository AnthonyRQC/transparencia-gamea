import { Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { formatearDiasPlazo } from '@/helpers/fechas';
import { ETIQUETAS_ESTADO_CORTO, PLAZO_COLOR } from '@/Components/Denuncias/Shared/semantica';
import type { Urgente } from '@/types/dashboard';

const ETIQUETAS_ESTADO = ETIQUETAS_ESTADO_CORTO;

const badgeColor: Record<string, string> = {
    ...PLAZO_COLOR,
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
                        <TableHead className="text-right">Plazo / Vencimiento</TableHead>
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
                                    <Badge className={badgeColor[u.color] ?? badgeColor.gray}>
                                        {formatearDiasPlazo(u.diasRestantes)}
                                    </Badge>
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
