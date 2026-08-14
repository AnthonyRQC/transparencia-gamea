import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { route } from 'ziggy-js';
import { ETIQUETAS_TIPO } from '@/types/dashboard';

export interface ReportesFiltros {
    desde: string | null;
    hasta: string | null;
    tipo: string | null;
    estado: string | null;
    tecnico_id: number | null;
    categoria_id: number | null;
    clasificacion_id: number | null;
    busqueda: string | null;
}

export interface ReportesOpciones {
    tecnicos: Array<{ id: number; name: string }>;
    categorias: Array<{ id: number; nombre: string }>;
    clasificaciones: Array<{ id: number; nombre: string }>;
    estados: Record<string, string>;
}

interface Props {
    opciones: ReportesOpciones;
    filtros: ReportesFiltros;
}

export default function FiltrosReporte({ opciones, filtros }: Props) {
    const [busqueda, setBusqueda] = useState(filtros.busqueda ?? '');
    const [desde, setDesde] = useState(filtros.desde ?? '');
    const [hasta, setHasta] = useState(filtros.hasta ?? '');
    const [tipo, setTipo] = useState(filtros.tipo ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');
    const [tecnicoId, setTecnicoId] = useState(filtros.tecnico_id ? String(filtros.tecnico_id) : '');
    const [categoriaId, setCategoriaId] = useState(filtros.categoria_id ? String(filtros.categoria_id) : '');
    const [clasificacionId, setClasificacionId] = useState(filtros.clasificacion_id ? String(filtros.clasificacion_id) : '');

    const aplicar = () => {
        router.get(route('reportes.index'), {
            busqueda: busqueda || undefined,
            desde: desde || undefined,
            hasta: hasta || undefined,
            tipo: tipo || undefined,
            estado: estado || undefined,
            tecnico_id: tecnicoId || undefined,
            categoria_id: categoriaId || undefined,
            clasificacion_id: clasificacionId || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const limpiar = () => {
        setBusqueda(''); setDesde(''); setHasta('');
        setTipo(''); setEstado(''); setTecnicoId(''); setCategoriaId(''); setClasificacionId('');
        router.get(route('reportes.index'), {}, { preserveState: true, preserveScroll: true });
    };

    const inputCls = 'bg-card';

    return (
        <div className="border rounded-2xl bg-card/60 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Input
                    className={inputCls}
                    placeholder="Buscar por ticket o hechos…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && aplicar()}
                />
                <div className="grid grid-cols-2 gap-2">
                    <Input type="date" className={inputCls} value={desde} onChange={(e) => setDesde(e.target.value)} />
                    <Input type="date" className={inputCls} value={hasta} onChange={(e) => setHasta(e.target.value)} />
                </div>
                <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Tipo de denuncia" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los tipos</SelectItem>
                        {Object.entries(ETIQUETAS_TIPO).map(([k, n]) => (
                            <SelectItem key={k} value={k}>{n}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        {Object.entries(opciones.estados).map(([k, n]) => (
                            <SelectItem key={k} value={k}>{n}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={tecnicoId} onValueChange={setTecnicoId}>
                    <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Técnico" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los técnicos</SelectItem>
                        {opciones.tecnicos.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                    <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todas">Todas las categorías</SelectItem>
                        {opciones.categorias.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={clasificacionId} onValueChange={setClasificacionId}>
                    <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Clasificación" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todas">Todas las clasificaciones</SelectItem>
                        {opciones.clasificaciones.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex gap-2 lg:justify-end">
                    <Button variant="outline" onClick={limpiar} className="gap-1.5">
                        <RotateCcw className="w-4 h-4" />
                        Limpiar
                    </Button>
                    <Button onClick={aplicar} className="gap-1.5">
                        <Search className="w-4 h-4" />
                        Buscar
                    </Button>
                </div>
            </div>
        </div>
    );
}
