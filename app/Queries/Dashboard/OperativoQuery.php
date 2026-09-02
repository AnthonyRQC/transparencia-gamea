<?php

namespace App\Queries\Dashboard;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Denuncia;

class OperativoQuery
{
    private const ORDEN_EMBUDO = [
        'ingresada', 'evaluacion_tecnica', 'admitida', 'asignada',
        'investigacion', 'informe', 'rechazada', 'cerrada', 'cerrada_archivada',
    ];

    private const ETIQUETAS_ESTADO = [
        'ingresada' => 'INGRESADA',
        'evaluacion_tecnica' => 'EVALUACIÓN TÉCNICA',
        'admitida' => 'ADMITIDA',
        'asignada' => 'ASIGNADA',
        'investigacion' => 'INVESTIGACIÓN',
        'informe' => 'INFORME',
        'rechazada' => 'RECHAZADA',
        'cerrada' => 'CERRADA',
        'cerrada_archivada' => 'CERRADA · ARCHIVADA',
    ];

    public static function calcular(array $f): array
    {
        $embudoRows = DashboardQueryBase::denuncias($f)
            ->selectRaw('estado, subestado, COUNT(*) as total')
            ->groupBy('estado', 'subestado')
            ->get();

        $porEstado = [];
        foreach ($embudoRows as $r) {
            $clave = $r->estado;
            if ($r->estado === 'cerrada' && $r->subestado === 'archivada') {
                $clave = 'cerrada_archivada';
            }
            $porEstado[$clave] = ($porEstado[$clave] ?? 0) + (int) $r->total;
        }

        $embudo = [];
        foreach (self::ORDEN_EMBUDO as $estado) {
            if (! isset($porEstado[$estado])) {
                $porEstado[$estado] = 0;
            }
            $embudo[] = [
                'estado' => $estado,
                'label' => self::ETIQUETAS_ESTADO[$estado],
                'total' => $porEstado[$estado],
                'esTerminal' => in_array($estado, ['rechazada', 'cerrada', 'cerrada_archivada'], true),
            ];
        }

        return [
            'embudo' => $embudo,
            'evolucion' => self::evolucion($f),
            'granularidad' => self::granularidad($f),
        ];
    }

    private static function evolucion(array $f): array
    {
        $desde = $f['desde'] ? Carbon::parse($f['desde'])->startOfDay() : Carbon::now()->subMonth()->startOfDay();
        $hasta = $f['hasta'] ? Carbon::parse($f['hasta'])->endOfDay() : Carbon::now()->endOfDay();

        if ($desde->gt($hasta)) {
            [$desde, $hasta] = [$hasta, $desde];
        }

        $dias = $desde->diffInDays($hasta) + 1;
        $granularidad = $dias <= 14 ? 'day' : ($dias <= 90 ? 'week' : 'month');

        $periodos = self::construirPeriodos($desde, $hasta, $granularidad);

        $clavePorFecha = function (string $fecha) use ($granularidad): string {
            if ($granularidad === 'day') {
                return $fecha;
            }
            if ($granularidad === 'week') {
                $d = Carbon::parse($fecha);
                return sprintf('%04d-W%02d', $d->isoWeekYear, $d->isoWeek);
            }
            return substr($fecha, 0, 7);
        };

        $ingresadas = DashboardQueryBase::denuncias($f)
            ->whereDate('created_at', '>=', $desde->toDateString())
            ->whereDate('created_at', '<=', $hasta->toDateString())
            ->selectRaw('DATE(created_at) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->get()
            ->mapWithKeys(fn ($r) => [$clavePorFecha($r->fecha) => (int) $r->total]);

        $cerradas = DB::table('cierres')
            ->join('denuncias', 'cierres.denuncia_id', '=', 'denuncias.id')
            ->whereNull('denuncias.deleted_at')
            ->where('cierres.eliminado', false)
            ->whereDate('cierres.cerrado_at', '>=', $desde->toDateString())
            ->whereDate('cierres.cerrado_at', '<=', $hasta->toDateString())
            ->when($f['tecnico_id'], fn ($q, $v) => $q->where('denuncias.tecnico_id', $v))
            ->when($f['tipo'], fn ($q, $v) => $q->where('denuncias.tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('denuncias.categoria_id', $v))
            ->when($f['estado'], fn ($q) => $q->where('denuncias.estado', $f['estado']))
            ->selectRaw('DATE(cierres.cerrado_at) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->get()
            ->mapWithKeys(fn ($r) => [$clavePorFecha($r->fecha) => (int) $r->total]);

        $rechazadas = Denuncia::whereNull('deleted_at')
            ->where('estado', 'rechazada')
            ->whereNotNull('fecha_rechazada')
            ->whereDate('fecha_rechazada', '>=', $desde->toDateString())
            ->whereDate('fecha_rechazada', '<=', $hasta->toDateString())
            ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
            ->selectRaw('DATE(fecha_rechazada) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->get()
            ->mapWithKeys(fn ($r) => [$clavePorFecha($r->fecha) => (int) $r->total]);

        return array_map(fn ($p) => [
            'periodo' => $p['periodo'],
            'ingresadas' => $ingresadas[$p['clave']] ?? 0,
            'cerradas' => $cerradas[$p['clave']] ?? 0,
            'rechazadas' => $rechazadas[$p['clave']] ?? 0,
        ], array_values($periodos));
    }

    private static function construirPeriodos(Carbon $desde, Carbon $hasta, string $granularidad): array
    {
        $periodos = [];

        if ($granularidad === 'day') {
            $d = $desde->copy();
            while ($d->lte($hasta)) {
                $clave = $d->format('Y-m-d');
                $periodos[] = ['clave' => $clave, 'periodo' => $d->format('d/m')];
                $d->addDay();
            }
            return $periodos;
        }

        if ($granularidad === 'week') {
            $d = $desde->copy()->startOfWeek();
            while ($d->lte($hasta)) {
                $clave = sprintf('%04d-W%02d', $d->isoWeekYear, $d->isoWeek);
                $periodos[] = ['clave' => $clave, 'periodo' => 'Sem ' . $d->format('d/m')];
                $d->addWeek();
            }
            return $periodos;
        }

        $d = $desde->copy()->startOfMonth();
        while ($d->lte($hasta)) {
            $clave = $d->format('Y-m');
            $periodos[] = ['clave' => $clave, 'periodo' => $d->isoFormat('MMM YYYY')];
            $d->addMonth();
        }

        return $periodos;
    }

    private static function granularidad(array $f): string
    {
        $desde = $f['desde'] ? Carbon::parse($f['desde']) : Carbon::now()->subMonth();
        $hasta = $f['hasta'] ? Carbon::parse($f['hasta']) : Carbon::now();
        $dias = $desde->diffInDays($hasta) + 1;

        return $dias <= 14 ? 'day' : ($dias <= 90 ? 'week' : 'month');
    }
}
