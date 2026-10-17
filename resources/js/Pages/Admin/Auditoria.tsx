import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  ShieldCheck,
  Search,
  RotateCcw,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
} from 'lucide-react';
import AppLayout from '@/Components/Layout/AppLayout';
import PageHeader from '@/Components/Layout/PageHeader';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import ListaVacia from '@/Components/Denuncias/Shared/ListaVacia';
import Paginacion from '@/Components/Denuncias/Shared/Paginacion';

export interface EventoAuditoria {
  id: number;
  fecha: string;
  actor: string;
  accion: string;
  accion_label: string;
  ticket: string | null;
  user_agent: string | null;
}

interface AuditoriaProps {
  eventos: {
    data: EventoAuditoria[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  filtros: {
    desde?: string;
    hasta?: string;
    usuario_id?: string | number;
    accion?: string;
    ticket?: string;
    tipo?: string;
  };
  usuarios: Array<{ id: number; name: string }>;
  acciones: Array<{ value: string; label: string }>;
}

export default function Auditoria({
  eventos,
  filtros,
  usuarios,
  acciones,
}: AuditoriaProps) {
  const [desde, setDesde] = useState(filtros.desde || '');
  const [hasta, setHasta] = useState(filtros.hasta || '');
  const [usuarioId, setUsuarioId] = useState(filtros.usuario_id ? String(filtros.usuario_id) : 'todos');
  const [accion, setAccion] = useState(filtros.accion || 'todas');
  const [ticket, setTicket] = useState(filtros.ticket || '');
  const [soloDescargas, setSoloDescargas] = useState(filtros.tipo === 'descargas');

  const aplicarFiltros = (overrides: Record<string, unknown> = {}) => {
    const params: Record<string, unknown> = {
      desde: desde || undefined,
      hasta: hasta || undefined,
      usuario_id: usuarioId !== 'todos' ? usuarioId : undefined,
      accion: accion !== 'todas' ? accion : undefined,
      ticket: ticket ? ticket.trim().toUpperCase() : undefined,
      tipo: soloDescargas ? 'descargas' : undefined,
      ...overrides,
    };

    // Limpiar claves undefined
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

    router.get(route('admin.auditoria.index'), params as any, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const limpiarFiltros = () => {
    setDesde('');
    setHasta('');
    setUsuarioId('todos');
    setAccion('todas');
    setTicket('');
    setSoloDescargas(false);

    router.get(route('admin.auditoria.index'), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handlePaginaChange = (page: number) => {
    aplicarFiltros({ page });
  };

  return (
    <AppLayout>
      <Head title="Panel de Auditoría — Transparencia UTLCC" />

      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <PageHeader
          icon={<ShieldCheck className="w-6 h-6 shrink-0" />}
          titulo="Panel de Auditoría"
          subtitulo="Actividad, accesos y descargas del sistema. Vista técnica — sin contenido de expedientes."
          className="mb-0"
        />

        {/* Barra de Filtros */}
        <div className="bg-card border rounded-lg p-4 shadow-sm flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Rango Desde */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Desde</label>
              <Input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Rango Hasta */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hasta</label>
              <Input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Selector de Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Usuario</label>
              <Select value={usuarioId} onValueChange={setUsuarioId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="todos">Todos los usuarios</SelectItem>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)} title={u.name}>
                      <span className="truncate block max-w-[200px]">{u.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Acción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Acción</label>
              <Select value={accion} onValueChange={setAccion}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="todas">Todas las acciones</SelectItem>
                  {acciones.map((a) => (
                    <SelectItem key={a.value} value={a.value} title={a.label}>
                      <span className="truncate block max-w-[200px]">{a.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* N° de denuncia / Ticket */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">N° de denuncia</label>
              <Input
                type="text"
                placeholder="DEN-2026-..."
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="h-9 uppercase"
              />
            </div>

            {/* Toggle Solo Descargas */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 h-9 px-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={soloDescargas}
                  onChange={(e) => setSoloDescargas(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs font-medium flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  Solo descargas
                </span>
              </label>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={limpiarFiltros}
              className="gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={() => aplicarFiltros()}
              className="gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Tabla de Eventos */}
        {eventos.data.length === 0 ? (
          <ListaVacia
            icon={ShieldCheck}
            titulo="Sin eventos registrados"
            descripcion="No hay movimientos para los filtros aplicados. Ajuste los criterios o limpie los filtros."
            accionLabel="Limpiar filtros"
            onAccion={limpiarFiltros}
          />
        ) : (
          <div className="bg-card border rounded-lg shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/60 text-muted-foreground text-xs uppercase font-semibold border-b">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-16">N°</th>
                    <th scope="col" className="px-4 py-3 w-36">Fecha</th>
                    <th scope="col" className="px-4 py-3">Actor</th>
                    <th scope="col" className="px-4 py-3">Acción</th>
                    <th scope="col" className="px-4 py-3">Expediente</th>
                    <th scope="col" className="px-4 py-3">Navegador</th>
                    <th scope="col" className="px-4 py-3 w-28 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {eventos.data.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-semibold">
                        #{e.id}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {e.fecha}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {e.actor}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border">
                          {e.accion_label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {e.ticket ? (
                          <span className="font-mono text-xs font-semibold text-primary">
                            {e.ticket}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {e.user_agent ? (
                          <span
                            className="font-mono text-[11px] max-w-[220px] truncate block text-muted-foreground"
                            title={e.user_agent}
                          >
                            {e.user_agent}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {e.ticket ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 cursor-pointer text-xs"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                                Extracto
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem asChild>
                                <a
                                  href={route('admin.auditoria.extracto', { ticket: e.ticket, formato: 'pdf' })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 cursor-pointer w-full"
                                >
                                  <FileText className="w-4 h-4 text-rose-600" />
                                  <span>PDF (legible)</span>
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a
                                  href={route('admin.auditoria.extracto', { ticket: e.ticket, formato: 'xlsx' })}
                                  className="flex items-center gap-2 cursor-pointer w-full"
                                >
                                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                  <span>Excel (cotejo)</span>
                                </a>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {eventos.last_page > 1 && (
              <div className="p-4 border-t flex justify-center">
                <Paginacion
                  paginaActual={eventos.current_page}
                  totalPaginas={eventos.last_page}
                  totalElementos={eventos.total}
                  elementosPorPagina={eventos.per_page}
                  onPaginaChange={handlePaginaChange}
                  mode="server"
                  itemLabel="eventos"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
