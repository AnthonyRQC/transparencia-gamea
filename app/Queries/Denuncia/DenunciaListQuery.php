<?php

namespace App\Queries\Denuncia;

use App\Models\Denuncia;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * Query builder único de listados de denuncias (Slice 1: Bandeja;
 * MisCasos lo reutiliza en un slice posterior).
 *
 * Replica los filtros de `ConsultaCasosController` con `when()` al estilo
 * `DashboardQueryBase::denuncias()`, y conserva el tab scoping histórico
 * de `BandejaController` (por-admitir / por-asignar / en-curso / historial).
 *
 * Decisiones Slice 1:
 * - El multi-`estado` refina DENTRO del tab activo (intersección estricta
 *   con el scope del tab); no se amplía el scope por el filtro.
 * - Los contadores por tab aplican los mismos filtros EXCEPTO `estado`,
 *   para que los badges reflejen la distribución del resto de filtros.
 * - `plazo` es SOLO display (accessor `$d->plazo`): no hay `where` sobre
 *   plazo en SQL. El orden visual por plazo vive en el cliente.
 */
class DenunciaListQuery
{
    public const ESTADOS = [
        'ingresada', 'evaluacion_tecnica', 'admitida', 'rechazada',
        'asignada', 'investigacion', 'informe', 'cerrada',
    ];

    public const TAB_ESTADOS = [
        'por-admitir' => ['ingresada', 'evaluacion_tecnica'],
        'por-asignar' => ['admitida'],
        'en-curso' => ['asignada', 'investigacion', 'informe'],
        'historial' => ['rechazada', 'cerrada'],
    ];

    public const PER_PAGE = 10;

    /**
     * Relaciones del detalle de Bandeja (idénticas a las del controlador
     * anterior; el frontend las espera en DenunciaSheet).
     */
    public static function with(): array
    {
        return [
            'denunciante', 'denunciados', 'pruebas', 'categoria', 'investigador',
            'registradoPor:id,name',
            'informe.clasificacionRel', 'cierre.medioNotificacion',
            'solicitudes.dependenciaDestino', 'solicitudes.ampliaciones',
            'descargos.denunciado', 'descargos.ampliaciones',
            'evaluaciones', 'bitacora.usuario',
        ];
    }

    public static function base(array $f): Builder
    {
        return Denuncia::query()
            ->with(self::with())
            ->whereNull('denuncias.deleted_at')
            ->when($f['search'] ?? null, function (Builder $q, string $search) {
                $needle = mb_strtoupper(trim($search));
                $q->where(function (Builder $sq) use ($needle) {
                    $sq->where('denuncias.ticket', 'like', "%{$needle}%")
                        ->orWhere('denuncias.hechos', 'like', "%{$needle}%")
                        ->orWhereHas('denunciante', fn (Builder $d) => $d->where('nombres', 'like', "%{$needle}%"))
                        ->orWhereHas('denunciados', fn (Builder $d) => $d->where('nombres', 'like', "%{$needle}%"))
                        ->orWhereHas('denunciados', fn (Builder $d) => $d->where('dependencia', 'like', "%{$needle}%"))
                        ->orWhere('denuncias.resumen_rechazo', 'like', "%{$needle}%");
                });
            })
            ->when($f['ticket'] ?? null, fn (Builder $q, string $ticket) => $q->where('denuncias.ticket', $ticket))
            ->when($f['estado'] ?? null, fn (Builder $q, array $estados) => $q->whereIn('denuncias.estado', $estados))
            ->when($f['tipo'] ?? null, fn (Builder $q, string $tipo) => $q->where('denuncias.tipo', $tipo))
            ->when($f['escenario'] ?? null, fn (Builder $q, string $escenario) => $q->where('denuncias.escenario', $escenario))
            ->when($f['fecha_desde'] ?? null, fn (Builder $q, string $desde) => $q->whereDate('denuncias.created_at', '>=', Carbon::parse($desde)))
            ->when($f['fecha_hasta'] ?? null, fn (Builder $q, string $hasta) => $q->whereDate('denuncias.created_at', '<=', Carbon::parse($hasta)))
            ->when($f['investigador_id'] ?? null, fn (Builder $q, int $id) => $q->where('denuncias.investigador_id', $id))
            ->when($f['categoria_id'] ?? null, fn (Builder $q, int $id) => $q->where('denuncias.categoria_id', $id))
            ->when($f['clasificacion_id'] ?? null, function (Builder $q, int $id) {
                $q->whereExists(function ($sub) use ($id) {
                    $sub->selectRaw('1')->from('informes_finales')
                        ->whereColumn('informes_finales.denuncia_id', 'denuncias.id')
                        ->where('informes_finales.eliminado', false)
                        ->where('informes_finales.clasificacion_id', $id);
                });
            });
    }

    public static function forTab(array $f, string $tab): Builder
    {
        // vision-general no lista casos: reutiliza el scope por defecto
        // (el frontend ignora la lista en ese tab y muestra contadores).
        $scope = self::TAB_ESTADOS[$tab] ?? self::TAB_ESTADOS['por-admitir'];

        return self::base($f)->whereIn('denuncias.estado', $scope);
    }

    public static function paginar(array $f, string $tab, int $perPage = self::PER_PAGE): LengthAwarePaginator
    {
        return self::forTab($f, $tab)->latest()->paginate($perPage)->withQueryString();
    }

    /**
     * Contadores con las mismas claves históricas del controlador anterior
     * (`ingresadas` duplica a `ingresada` por compatibilidad).
     */
    public static function contadores(array $f): array
    {
        $sinEstado = array_merge($f, ['estado' => null]);

        $porEstado = [];
        foreach (self::ESTADOS as $estado) {
            $porEstado[$estado] = self::base($sinEstado)->where('denuncias.estado', $estado)->count();
        }

        $porEstado['ingresadas'] = $porEstado['ingresada'];
        $porEstado['porAdmitir'] = $porEstado['ingresada'] + $porEstado['evaluacion_tecnica'];
        $porEstado['porAsignar'] = $porEstado['admitida'];
        $porEstado['enCurso'] = $porEstado['asignada'] + $porEstado['investigacion'] + $porEstado['informe'];
        $porEstado['historial'] = $porEstado['rechazada'] + $porEstado['cerrada'];
        $porEstado['activos'] = self::base($sinEstado)->whereNotIn('denuncias.estado', ['rechazada', 'cerrada'])->count();

        return $porEstado;
    }
}
