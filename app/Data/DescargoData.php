<?php

namespace App\Data;

use Carbon\Carbon;

class DescargoData
{
    private const SESSION_KEY = 'descargos_mock';
    private const ID_COUNTER_KEY = 'descargo_id_counter';

    public const MEDIOS = [
        'personal' => 'Notificación Personal',
        'cedula'   => 'Cédula de Notificación',
        'email'    => 'Correo Electrónico',
        'otro'     => 'Otro Medio',
    ];

    // ──────────────────────────────────────────────
    //  GETTERS
    // ──────────────────────────────────────────────

    public static function getAll(): array
    {
        return session()->get(self::SESSION_KEY, []);
    }

    public static function getByTicket(string $ticket): array
    {
        return array_values(array_filter(self::getAll(), fn($d) => ($d['ticket'] ?? '') === $ticket && empty($d['eliminado'])));
    }

    public static function find(int $id): ?array
    {
        foreach (self::getAll() as $d) {
            if (($d['id'] ?? 0) === $id) return $d;
        }
        return null;
    }

    public static function getPlazoInfo(array $descargo): ?array
    {
        $fechaVen = $descargo['fecha_vencimiento'] ?? null;
        $estado = $descargo['estado'] ?? 'pendiente_notif';
        if (!$fechaVen) return null;

        $diasRestantes = (int) Carbon::now()->diffInDays(Carbon::parse($fechaVen), false);
        $vencida = $diasRestantes < 0;

        if ($estado === 'respondido') {
            $color = 'green';
            $texto = $descargo['fecha_respuesta']
                ? 'Respondido ' . Carbon::parse($descargo['fecha_respuesta'])->diffForHumans()
                : 'Respondido';
        } elseif ($estado === 'pendiente_notif') {
            $color = 'gray';
            $texto = 'Pendiente de notificar';
        } elseif ($vencida) {
            $color = 'red';
            $texto = 'Vencido hace ' . abs($diasRestantes) . 'd';
        } else {
            $color = $diasRestantes > 5 ? 'green' : 'yellow';
            $texto = 'Vence en ' . $diasRestantes . 'd';
            if ($diasRestantes === 0) $texto = 'Vence hoy';
        }

        return [
            'dias_restantes' => $diasRestantes,
            'color' => $color,
            'texto' => $texto,
            'fecha_vencimiento' => Carbon::parse($fechaVen)->format('Y-m-d'),
        ];
    }

    // ──────────────────────────────────────────────
    //  ACCIONES
    // ──────────────────────────────────────────────

    public static function add(string $ticket, int $denunciadoIdx, string $nombres, string $dependencia = ''): int
    {
        $id = self::nextId();

        $descargo = [
            'id' => $id,
            'ticket' => $ticket,
            'denunciado_idx' => $denunciadoIdx,
            'nombres_denunciado' => $nombres,
            'dependencia_denunciado' => $dependencia,
            'fecha_notificacion' => null,
            'medio' => null,
            'respaldo_archivo' => null,
            'fecha_vencimiento' => null,
            'fecha_respuesta' => null,
            'resumen_descargo' => null,
            'documentos' => [],
            'estado' => 'pendiente_notif',
            'ampliaciones' => [],
            'ediciones' => [],
            'eliminado' => false,
            'fecha_eliminacion' => null,
        ];

        $items = self::getAll();
        $items[] = $descargo;
        session()->put(self::SESSION_KEY, $items);

        return $id;
    }

    public static function notificar(int $id, string $fechaNotificacion, string $medio, ?array $respaldo = null, int $plazoDias = 10): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $d) {
            if (($d['id'] ?? 0) === $id) {
                $fechaVen = Carbon::parse($fechaNotificacion)->addDays($plazoDias)->endOfDay();
                $items[$i]['estado'] = 'notificado';
                $items[$i]['fecha_notificacion'] = Carbon::parse($fechaNotificacion)->toDateTimeString();
                $items[$i]['medio'] = $medio;
                $items[$i]['respaldo_archivo'] = $respaldo;
                $items[$i]['fecha_vencimiento'] = $fechaVen->toDateTimeString();
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }

    public static function responder(int $id, string $resumen, array $documentos = []): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $d) {
            if (($d['id'] ?? 0) === $id) {
                $items[$i]['estado'] = 'respondido';
                $items[$i]['resumen_descargo'] = $resumen;
                $items[$i]['documentos'] = $documentos;
                $items[$i]['fecha_respuesta'] = Carbon::now()->toDateTimeString();
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }

    public static function cancelar(int $id, string $motivo): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $d) {
            if (($d['id'] ?? 0) === $id) {
                if (in_array($d['estado'] ?? '', ['respondido', 'cancelado'])) return false;
                $items[$i]['estado'] = 'cancelado';
                $items[$i]['motivo_cancelacion'] = $motivo;
                $items[$i]['fecha_cancelacion'] = Carbon::now()->toDateTimeString();
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }

    public static function ampliar(int $id, int $dias, string $justificacion): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $d) {
            if (($d['id'] ?? 0) === $id) {
                $nuevaFechaVen = Carbon::parse($d['fecha_vencimiento'])->addDays($dias);
                $items[$i]['fecha_vencimiento'] = $nuevaFechaVen->endOfDay()->toDateTimeString();
                $items[$i]['estado'] = 'ampliado';
                $items[$i]['ampliaciones'][] = [
                    'dias' => $dias,
                    'justificacion' => $justificacion,
                    'fecha' => Carbon::now()->toDateTimeString(),
                ];
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }

    public static function editar(int $id, array $cambios): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $d) {
            if (($d['id'] ?? 0) === $id) {
                if (!empty($d['eliminado'])) return false;

                $ediciones = [];
                $camposPermitidos = ['nombres_denunciado', 'dependencia_denunciado'];
                foreach ($camposPermitidos as $campo) {
                    if (array_key_exists($campo, $cambios) && ($d[$campo] ?? null) !== $cambios[$campo]) {
                        $ediciones[] = [
                            'fecha' => Carbon::now()->toDateTimeString(),
                            'campo' => $campo,
                            'anterior' => $d[$campo] ?? null,
                            'nuevo' => $cambios[$campo],
                        ];
                        $items[$i][$campo] = $cambios[$campo];
                    }
                }

                $items[$i]['ediciones'] = array_merge($d['ediciones'] ?? [], $ediciones);
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }

    public static function eliminar(int $id): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $d) {
            if (($d['id'] ?? 0) === $id) {
                if (!empty($d['eliminado'])) return false;
                $items[$i]['eliminado'] = true;
                $items[$i]['fecha_eliminacion'] = Carbon::now()->toDateTimeString();
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }

    // ──────────────────────────────────────────────
    //  HELPERS
    // ──────────────────────────────────────────────

    public static function seedDemoData(): void
    {
        if (!empty(self::getAll())) return;

        $now = Carbon::now();

        $items = [
            [
                'id' => 1,
                'ticket' => 'DEN-2026-0008',
                'denunciado_idx' => 0,
                'nombres_denunciado' => 'Marcelo Álvarez',
                'dependencia_denunciado' => 'Unidad de Contrataciones',
                'fecha_notificacion' => (clone $now)->subDays(5)->toDateTimeString(),
                'medio' => 'cedula',
                'respaldo_archivo' => ['nombre' => 'cedula_notificacion_001.pdf', 'tamano' => '0.3 MB'],
                'fecha_vencimiento' => (clone $now)->addDays(5)->endOfDay()->toDateTimeString(),
                'fecha_respuesta' => null,
                'resumen_descargo' => null,
                'documentos' => [],
                'estado' => 'notificado',
                'ampliaciones' => [],
                'ediciones' => [],
                'eliminado' => false,
                'fecha_eliminacion' => null,
            ],
            [
                'id' => 2,
                'ticket' => 'DEN-2026-0010',
                'denunciado_idx' => 0,
                'nombres_denunciado' => 'Guillermo Méndez',
                'dependencia_denunciado' => 'Dirección de Recursos Humanos',
                'fecha_notificacion' => (clone $now)->subDays(12)->toDateTimeString(),
                'medio' => 'personal',
                'respaldo_archivo' => ['nombre' => 'acta_notificacion_personal.pdf', 'tamano' => '0.5 MB'],
                'fecha_vencimiento' => (clone $now)->subDays(2)->endOfDay()->toDateTimeString(),
                'fecha_respuesta' => (clone $now)->subDays(4)->toDateTimeString(),
                'resumen_descargo' => 'El denunciado manifiesta que no ha exigido pago alguno para la contratación. Señala que el proceso se realizó conforme a la normativa vigente y que el pago denunciado corresponde a un "aporte voluntario" al fondo de bienestar social de la institución, el cual es practicado por todos los nuevos funcionarios. Adjunta el recibo de ingreso del fondo de bienestar como respaldo.',
                'documentos' => [
                    ['nombre' => 'recibo_fondo_bienestar_2026.pdf', 'tamano' => '0.6 MB', 'fecha_subida' => (clone $now)->subDays(4)->toDateTimeString()],
                    ['nombre' => 'certificado_contratacion_legal.pdf', 'tamano' => '1.1 MB', 'fecha_subida' => (clone $now)->subDays(4)->toDateTimeString()],
                ],
                'estado' => 'respondido',
                'ampliaciones' => [],
                'ediciones' => [],
                'eliminado' => false,
                'fecha_eliminacion' => null,
            ],
        ];

        session()->put(self::SESSION_KEY, $items);
        session()->put(self::ID_COUNTER_KEY, count($items));
    }

    // ──────────────────────────────────────────────
    //  HELPERS
    // ──────────────────────────────────────────────

    private static function nextId(): int
    {
        $counter = session()->get(self::ID_COUNTER_KEY, 0) + 1;
        session()->put(self::ID_COUNTER_KEY, $counter);
        return $counter;
    }

    public static function getMedioLabel(?string $medio): string
    {
        return self::MEDIOS[$medio] ?? ($medio ?? '—');
    }
}
