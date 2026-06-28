<?php

namespace App\Data;

use Carbon\Carbon;

class SolicitudData
{
    private const SESSION_KEY = 'solicitudes_mock';
    private const ID_COUNTER_KEY = 'solicitud_id_counter';

    // ──────────────────────────────────────────────
    //  GETTERS
    // ──────────────────────────────────────────────

    public static function getAll(): array
    {
        return session()->get(self::SESSION_KEY, []);
    }

    public static function getByTicket(string $ticket): array
    {
        return array_values(array_filter(self::getAll(), fn($s) => ($s['ticket'] ?? '') === $ticket));
    }

    public static function find(int $id): ?array
    {
        foreach (self::getAll() as $s) {
            if (($s['id'] ?? 0) === $id) return $s;
        }
        return null;
    }

    public static function getPlazoInfo(array $solicitud): ?array
    {
        $fechaVen = $solicitud['fecha_vencimiento'] ?? null;
        $estado = $solicitud['estado'] ?? 'pendiente';
        if (!$fechaVen) return null;

        $diasRestantes = (int) Carbon::now()->diffInDays(Carbon::parse($fechaVen), false);
        $vencida = $diasRestantes < 0;

        if ($estado === 'respondida') {
            $color = 'green';
            $texto = $solicitud['fecha_respuesta']
                ? 'Respondida ' . Carbon::parse($solicitud['fecha_respuesta'])->diffForHumans()
                : 'Respondida';
        } elseif ($vencida) {
            $color = 'red';
            $texto = 'Vencida hace ' . abs($diasRestantes) . 'd';
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

    public static function add(string $ticket, string $unidadDestino, string $detalle): int
    {
        $id = self::nextId();
        $now = Carbon::now();

        $solicitud = [
            'id' => $id,
            'ticket' => $ticket,
            'unidad_destino' => $unidadDestino,
            'detalle' => $detalle,
            'plazo_dias' => 10,
            'fecha_envio' => $now->toDateTimeString(),
            'fecha_vencimiento' => (clone $now)->addDays(10)->endOfDay()->toDateTimeString(),
            'fecha_respuesta' => null,
            'respuesta' => null,
            'archivos' => [],
            'estado' => 'pendiente',
            'ampliaciones' => [],
        ];

        $items = self::getAll();
        $items[] = $solicitud;
        session()->put(self::SESSION_KEY, $items);

        return $id;
    }

    public static function responder(int $id, string $respuesta, array $archivos = []): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $s) {
            if (($s['id'] ?? 0) === $id) {
                $items[$i]['estado'] = 'respondida';
                $items[$i]['respuesta'] = $respuesta;
                $items[$i]['fecha_respuesta'] = Carbon::now()->toDateTimeString();
                $items[$i]['archivos'] = $archivos;
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }

    public static function ampliar(int $id, int $dias, string $justificacion, ?array $archivo = null): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $s) {
            if (($s['id'] ?? 0) === $id) {
                $nuevaFechaVen = Carbon::parse($s['fecha_vencimiento'])->addDays($dias);
                $items[$i]['fecha_vencimiento'] = $nuevaFechaVen->endOfDay()->toDateTimeString();
                $items[$i]['estado'] = 'ampliada';
                $items[$i]['ampliaciones'][] = [
                    'dias' => $dias,
                    'justificacion' => $justificacion,
                    'fecha' => Carbon::now()->toDateTimeString(),
                    'archivo' => $archivo,
                ];
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
                'unidad_destino' => 'Unidad de Contrataciones',
                'detalle' => 'Solicitar copias de los contratos de compra de ambulancias, facturas y acta de recepción firmada por el Jefe de la Unidad de Contrataciones. Se requiere documentación completa para cotejar especificaciones técnicas.',
                'plazo_dias' => 10,
                'fecha_envio' => (clone $now)->subDays(2)->toDateTimeString(),
                'fecha_vencimiento' => (clone $now)->addDays(8)->endOfDay()->toDateTimeString(),
                'fecha_respuesta' => null,
                'respuesta' => null,
                'archivos' => [],
                'estado' => 'pendiente',
                'ampliaciones' => [],
            ],
            [
                'id' => 2,
                'ticket' => 'DEN-2026-0008',
                'unidad_destino' => 'Dirección de Ingresos',
                'detalle' => 'Solicitar registro de pagos de Bs 120,000 transferidos a la cuenta del proveedor de ambulancias, incluyendo autorizaciones y comprobantes de desembolso.',
                'plazo_dias' => 10,
                'fecha_envio' => (clone $now)->subDays(5)->toDateTimeString(),
                'fecha_vencimiento' => (clone $now)->addDays(5)->endOfDay()->toDateTimeString(),
                'fecha_respuesta' => (clone $now)->subDay()->toDateTimeString(),
                'respuesta' => 'Se adjuntan los comprobantes de pago solicitados. Los desembolsos fueron autorizados por la Dirección de Hacienda según memorándum DHA-2026-045. Se envió copia de los 3 desembolsos realizados al proveedor.',
                'archivos' => [
                    ['nombre' => 'comprobantes_pago_ambulancias.pdf', 'tamano' => '2.4 MB', 'fecha_subida' => (clone $now)->subDay()->toDateTimeString()],
                    ['nombre' => 'memorandum_DHA-2026-045.pdf', 'tamano' => '0.8 MB', 'fecha_subida' => (clone $now)->subDay()->toDateTimeString()],
                ],
                'estado' => 'respondida',
                'ampliaciones' => [],
            ],
            [
                'id' => 3,
                'ticket' => 'DEN-2026-0010',
                'unidad_destino' => 'Dirección de Recursos Humanos',
                'detalle' => 'Solicitar expediente completo del proceso de contratación del denunciante (Elena Vargas) incluyendo convocatoria, postulación, evaluación y contrato firmado.',
                'plazo_dias' => 10,
                'fecha_envio' => (clone $now)->subDays(15)->toDateTimeString(),
                'fecha_vencimiento' => (clone $now)->subDays(5)->endOfDay()->toDateTimeString(),
                'fecha_respuesta' => null,
                'respuesta' => null,
                'archivos' => [],
                'estado' => 'pendiente',
                'ampliaciones' => [],
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
}
