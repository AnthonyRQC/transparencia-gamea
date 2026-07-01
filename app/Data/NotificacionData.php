<?php

namespace App\Data;

use Carbon\Carbon;

class NotificacionData
{
    private const SESSION_KEY = 'notificaciones_mock';

    // ──────────────────────────────────────────────
    //  INICIALIZACIÓN
    // ──────────────────────────────────────────────

    private static function init(): void
    {
        if (!session()->has(self::SESSION_KEY)) {
            session([self::SESSION_KEY => [
                'notificaciones' => [],
                'next_id' => 1,
            ]]);
        }
    }

    // ──────────────────────────────────────────────
    //  GENERACIÓN DERIVADA
    // ──────────────────────────────────────────────

    public static function generarParaUsuario(): array
    {
        self::init();
        $sessionData = session(self::SESSION_KEY);
        $persistentes = $sessionData['notificaciones'] ?? [];

        $derivadas = [];
        $now = Carbon::now();
        $denuncias = DenunciaData::getAll();

        foreach ($denuncias as $d) {
            $ticket = $d['ticket'] ?? '';
            $tipoDenuncia = $d['tipo'] ?? '';
            $estado = $d['estado'] ?? '';

            // Resolver nombre del técnico
            $tecnicoId = $d['tecnico'] ?? null;
            $tecnicoNombre = $tecnicoId
                ? (DenunciaData::TECNICOS_MOCK[$tecnicoId]['nombre'] ?? $tecnicoId)
                : null;

            // --- Plazo total por vencer (≤ 3d) ---
            $plazoInfo = DenunciaData::getPlazoInfo($d);
            if ($plazoInfo !== null) {
                $diasRestantes = $plazoInfo['dias_restantes'];
                if ($diasRestantes >= 0 && $diasRestantes <= 3) {
                    $derivadas[] = self::createNotificacion(
                        tipo: 'plazo_por_vencer',
                        titulo: 'Plazo total por vencer',
                        mensaje: "{$ticket} · {$tipoDenuncia} · {$diasRestantes} día(s) restante(s)",
                        ticket: $ticket,
                        destinoUrl: "/denuncias/{$ticket}",
                        icono: 'Clock',
                        color: 'warning',
                    );
                } elseif ($diasRestantes < 0) {
                    $derivadas[] = self::createNotificacion(
                        tipo: 'plazo_vencido',
                        titulo: 'Plazo vencido',
                        mensaje: "{$ticket} · Vencido hace " . abs($diasRestantes) . ' día(s)',
                        ticket: $ticket,
                        destinoUrl: "/denuncias/{$ticket}",
                        icono: 'AlertTriangle',
                        color: 'destructive',
                    );
                }
            }

            // --- Plazo de informe por vencer ---
            if ($estado === 'informe' && !empty($d['informe_created_at'])) {
                $fechaInforme = Carbon::parse($d['informe_created_at']);
                $diasInforme = (int)$now->diffInDays($fechaInforme, false);
                if ($diasInforme >= 0 && $diasInforme <= 3) {
                    $derivadas[] = self::createNotificacion(
                        tipo: 'plazo_informe',
                        titulo: 'Informe final por vencer',
                        mensaje: "{$ticket} · {$diasInforme} día(s) para concluir informe",
                        ticket: $ticket,
                        destinoUrl: "/denuncias/{$ticket}",
                        icono: 'FileText',
                        color: 'warning',
                    );
                }
            }

            // --- Traspasos recientes (< 7 días) ---
            if (!empty($d['fecha_traspaso'])) {
                $fechaTraspaso = Carbon::parse($d['fecha_traspaso']);
                if ($now->diffInDays($fechaTraspaso) <= 7) {
                    $destino = $tecnicoNombre ?? 'otro técnico';
                    $derivadas[] = self::createNotificacion(
                        tipo: 'traspaso',
                        titulo: 'Caso traspasado',
                        mensaje: "{$ticket} fue asignado a {$destino}",
                        ticket: $ticket,
                        destinoUrl: "/denuncias/{$ticket}",
                        icono: 'ArrowRightLeft',
                        color: 'info',
                    );
                }
            }

            // --- Ampliaciones recientes (< 7 días) ---
            foreach ($d['ampliaciones'] ?? [] as $amp) {
                $fechaAmp = Carbon::parse($amp['fecha']);
                if ($now->diffInDays($fechaAmp) <= 7) {
                    $just = !empty($amp['justificacion']) ? substr($amp['justificacion'], 0, 60) . '…' : '';
                    $derivadas[] = self::createNotificacion(
                        tipo: 'ampliacion',
                        titulo: 'Plazo ampliado',
                        mensaje: "{$ticket} · +{$amp['dias']} día(s) — {$just}",
                        ticket: $ticket,
                        destinoUrl: "/denuncias/{$ticket}",
                        icono: 'CalendarPlus',
                        color: 'success',
                    );
                }
            }

            // --- Cambios de estado recientes (feed de actividad) ---
            if (in_array($estado, ['admitida', 'rechazada'])) {
                $fechaCambio = $estado === 'admitida'
                    ? ($d['fecha_admitida'] ?? null)
                    : ($d['fecha_rechazada'] ?? null);

                if ($fechaCambio) {
                    $fechaC = Carbon::parse($fechaCambio);
                    if ($now->diffInDays($fechaC) <= 7) {
                        $esAdmitida = $estado === 'admitida';
                        $derivadas[] = self::createNotificacion(
                            tipo: $esAdmitida ? 'denuncia_admitida' : 'denuncia_rechazada',
                            titulo: $esAdmitida ? 'Denuncia admitida' : 'Denuncia rechazada',
                            mensaje: "{$ticket} fue " . ($esAdmitida ? 'admitida' : 'rechazada'),
                            ticket: $ticket,
                            destinoUrl: "/denuncias/{$ticket}",
                            icono: $esAdmitida ? 'CheckCircle' : 'XCircle',
                            color: $esAdmitida ? 'success' : 'destructive',
                        );
                    }
                }
            }
        }

        // --- Solicitudes próximas a vencer ---
        $solicitudes = SolicitudData::getAll();
        foreach ($solicitudes as $s) {
            if (!in_array($s['estado'] ?? '', ['pendiente', 'ampliada'])) continue;
            $fechaVence = Carbon::parse($s['fecha_vencimiento']);
            $diasRestantes = (int)$now->diffInDays($fechaVence, false);
            if ($diasRestantes >= 0 && $diasRestantes <= 3) {
                $derivadas[] = self::createNotificacion(
                    tipo: 'solicitud_vence',
                    titulo: 'Solicitud de información por vencer',
                    mensaje: "{$s['ticket']} · {$s['unidad_destino']} · {$diasRestantes} día(s)",
                    ticket: $s['ticket'],
                    destinoUrl: "/denuncias/{$s['ticket']}",
                    icono: 'MailQuestion',
                    color: 'warning',
                );
            }
        }

        // --- Descargos próximos a vencer ---
        $descargos = DescargoData::getAll();
        foreach ($descargos as $desc) {
            if (!in_array($desc['estado'] ?? '', ['notificado', 'ampliado'])) continue;
            $fechaBase = Carbon::parse($desc['fecha_notificacion'] ?? $desc['created_at']);
            $fechaVence = (clone $fechaBase)->addDays(10);
            $diasRestantes = (int)$now->diffInDays($fechaVence, false);
            if ($diasRestantes >= 0 && $diasRestantes <= 3) {
                $derivadas[] = self::createNotificacion(
                    tipo: 'descargo_vence',
                    titulo: 'Descargo por vencer',
                    mensaje: "{$desc['ticket']} · {$diasRestantes} día(s) para responder",
                    ticket: $desc['ticket'],
                    destinoUrl: "/denuncias/{$desc['ticket']}",
                    icono: 'MessageSquareWarning',
                    color: 'warning',
                );
            }
        }

        // Fusionar derivadas con persistentes (leídas)
        $todas = self::fusionar($derivadas, $persistentes);
        $todas = self::ordenar($todas);

        $sessionData['notificaciones'] = $todas;
        session([self::SESSION_KEY => $sessionData]);

        return $todas;
    }

    private static function fusionar(array $derivadas, array $persistentes): array
    {
        $leidas = [];
        foreach ($persistentes as $p) {
            if (!empty($p['leida'])) {
                $leidas[self::key($p)] = $p;
            }
        }

        $resultado = [];
        foreach ($derivadas as $d) {
            $k = self::key($d);
            if (isset($leidas[$k])) {
                $d['id'] = $leidas[$k]['id'];
                $d['leida'] = true;
                $d['fecha_leida'] = $leidas[$k]['fecha_leida'];
            }
            $resultado[] = $d;
        }

        return $resultado;
    }

    private static function key(array $n): string
    {
        return ($n['tipo'] ?? '') . '|' . ($n['ticket'] ?? '');
    }

    private static function ordenar(array $items): array
    {
        usort($items, fn($a, $b) => strcmp($b['fecha'] ?? '', $a['fecha'] ?? ''));
        return array_values($items);
    }

    // ──────────────────────────────────────────────
    //  CRUD
    // ──────────────────────────────────────────────

    public static function getAll(): array
    {
        self::init();
        return session(self::SESSION_KEY . '.notificaciones', []);
    }

    public static function getUnreadCount(): int
    {
        self::init();
        $items = session(self::SESSION_KEY . '.notificaciones', []);
        return count(array_filter($items, fn($n) => empty($n['leida'])));
    }

    public static function getRecientes(int $limit = 5): array
    {
        $todas = self::getAll();
        return array_slice($todas, 0, $limit);
    }

    public static function getPaginated(int $page = 1, int $perPage = 10, array $filtros = []): array
    {
        $todas = self::getAll();

        if (!empty($filtros['tipo'])) {
            $todas = array_filter($todas, fn($n) => ($n['tipo'] ?? '') === $filtros['tipo']);
        }
        if (isset($filtros['leida']) && $filtros['leida'] !== '') {
            $leer = filter_var($filtros['leida'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($leer !== null) {
                $todas = array_filter($todas, fn($n) => !empty($n['leida']) === $leer);
            }
        }
        if (!empty($filtros['fecha_desde'])) {
            $desde = Carbon::parse($filtros['fecha_desde'])->startOfDay();
            $todas = array_filter($todas, fn($n) => Carbon::parse($n['fecha'] ?? '') >= $desde);
        }
        if (!empty($filtros['fecha_hasta'])) {
            $hasta = Carbon::parse($filtros['fecha_hasta'])->endOfDay();
            $todas = array_filter($todas, fn($n) => Carbon::parse($n['fecha'] ?? '') <= $hasta);
        }

        $todas = array_values($todas);
        $total = count($todas);
        $totalPages = max(1, (int)ceil($total / max($perPage, 1)));
        $offset = ($page - 1) * $perPage;
        $items = array_slice($todas, $offset, $perPage);

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => $totalPages,
        ];
    }

    public static function marcarLeida(int $id): bool
    {
        self::init();
        $items = session(self::SESSION_KEY . '.notificaciones', []);
        foreach ($items as &$n) {
            if (($n['id'] ?? 0) === $id) {
                $n['leida'] = true;
                $n['fecha_leida'] = now()->toDateTimeString();
                session([self::SESSION_KEY . '.notificaciones' => $items]);
                return true;
            }
        }
        return false;
    }

    public static function marcarTodasLeidas(): void
    {
        self::init();
        $items = session(self::SESSION_KEY . '.notificaciones', []);
        foreach ($items as &$n) {
            if (empty($n['leida'])) {
                $n['leida'] = true;
                $n['fecha_leida'] = now()->toDateTimeString();
            }
        }
        session([self::SESSION_KEY . '.notificaciones' => $items]);
    }

    // ──────────────────────────────────────────────
    //  SIMULACIÓN (Modo demo) — Fase 0
    // ──────────────────────────────────────────────

    /**
     * Simula un evento real del sistema y retorna el tipo de notificación generada.
     * Modifica los datos subyacentes (DenunciaData, SolicitudData, DescargoData)
     * para que la simulación sea coherente con el resto del sistema.
     */
    public static function simular(string $tipo): string
    {
        self::init();
        $now = now();

        switch ($tipo) {
            case 'traspaso':
                // Traspasar DEN-2026-0006 (asignada a tec-1) a tec-3
                $denuncias = session('denuncias_mock', []);
                $targetIdx = null;
                $targetTicket = null;
                foreach ($denuncias as $i => $d) {
                    if (($d['ticket'] ?? '') === 'DEN-2026-0006') {
                        $targetIdx = $i;
                        $targetTicket = $d['ticket'];
                        $tecnicoViejo = DenunciaData::TECNICOS_MOCK[$d['tecnico'] ?? '']['nombre'] ?? $d['tecnico'] ?? '—';
                        $tecnicoNuevo = DenunciaData::TECNICOS_MOCK['tec-3']['nombre'];
                        $denuncias[$i]['tecnico_anterior'] = $d['tecnico'];
                        $denuncias[$i]['tecnico'] = 'tec-3';
                        $denuncias[$i]['fecha_traspaso'] = $now->toDateTimeString();
                        $denuncias[$i]['justificacion_traspaso'] = 'Por redistribución de carga laboral (demo)';
                        self::addBitacoraEntry($denuncias, $i, 'traspaso', "Traspasado de {$tecnicoViejo} → {$tecnicoNuevo}. Justificación: Por redistribución de carga laboral (demo)");
                        break;
                    }
                }
                if ($targetIdx === null) break;
                session(['denuncias_mock' => $denuncias]);
                return self::createNotificacion(
                    tipo: 'traspaso', titulo: 'Caso traspasado',
                    mensaje: "{$targetTicket} fue asignado a Luis Mamani",
                    ticket: $targetTicket, destinoUrl: "/denuncias/{$targetTicket}",
                    icono: 'ArrowRightLeft', color: 'info',
                );

            case 'ampliacion':
                $denuncias = session('denuncias_mock', []);
                foreach ($denuncias as $i => $d) {
                    if (($d['ticket'] ?? '') === 'DEN-2026-0004' && $d['estado'] === 'admitida') {
                        $sumaActual = array_sum(array_column($d['ampliaciones'] ?? [], 'dias'));
                        $numAmpliacion = count($d['ampliaciones'] ?? []) + 1;
                        $denuncias[$i]['ampliaciones'][] = [
                            'id' => $numAmpliacion,
                            'fecha' => $now->toDateTimeString(),
                            'dias' => 10,
                            'justificacion' => 'Ampliación por demo — Solicitud de documentación adicional a unidad externa.',
                            'aprobado_por' => 'Jefe de Unidad',
                            'solicitado_por' => null,
                        ];
                        self::addBitacoraEntry($denuncias, $i, 'ampliacion_plazo', "Plazo ampliado 10 días (ampliación #{$numAmpliacion}). Justificación: Ampliación por demo.");
                        session(['denuncias_mock' => $denuncias]);
                        return self::createNotificacion(
                            tipo: 'ampliacion', titulo: 'Plazo ampliado',
                            mensaje: "DEN-2026-0004 · +10 día(s) — Ampliación por demo…",
                            ticket: 'DEN-2026-0004', destinoUrl: "/denuncias/DEN-2026-0004",
                            icono: 'CalendarPlus', color: 'success',
                        );
                    }
                }
                break;

            case 'denuncia_admitida':
                $denuncias = session('denuncias_mock', []);
                foreach ($denuncias as $i => $d) {
                    if (($d['ticket'] ?? '') === 'DEN-2026-0003' && $d['estado'] === 'ingresada') {
                        $denuncias[$i]['estado'] = 'admitida';
                        $denuncias[$i]['fecha_admitida'] = $now->toDateTimeString();
                        $denuncias[$i]['justificacion_admision'] = 'Admitida por cumplir requisitos (demo)';
                        self::addBitacoraEntry($denuncias, $i, 'admitida', 'Admitida por cumplir requisitos (demo)');
                        session(['denuncias_mock' => $denuncias]);
                        return self::createNotificacion(
                            tipo: 'denuncia_admitida', titulo: 'Denuncia admitida',
                            mensaje: "DEN-2026-0003 fue admitida",
                            ticket: 'DEN-2026-0003', destinoUrl: "/denuncias/DEN-2026-0003",
                            icono: 'CheckCircle', color: 'success',
                        );
                    }
                }
                break;

            case 'denuncia_rechazada':
                $denuncias = session('denuncias_mock', []);
                foreach ($denuncias as $i => $d) {
                    if (($d['ticket'] ?? '') === 'DEN-2026-0002' && $d['estado'] === 'ingresada') {
                        $denuncias[$i]['estado'] = 'rechazada';
                        $denuncias[$i]['fecha_rechazada'] = $now->toDateTimeString();
                        $denuncias[$i]['justificacion_rechazo'] = 'No cumple con los requisitos del Art. 22 de la Ley 974 (demo)';
                        $denuncias[$i]['resumen_rechazo'] = 'No cumple con los requisitos de admisibilidad.';
                        self::addBitacoraEntry($denuncias, $i, 'rechazada', 'Rechazada: No cumple requisitos (demo)');
                        session(['denuncias_mock' => $denuncias]);
                        return self::createNotificacion(
                            tipo: 'denuncia_rechazada', titulo: 'Denuncia rechazada',
                            mensaje: "DEN-2026-0002 fue rechazada",
                            ticket: 'DEN-2026-0002', destinoUrl: "/denuncias/DEN-2026-0002",
                            icono: 'XCircle', color: 'destructive',
                        );
                    }
                }
                break;

            case 'plazo_por_vencer':
                // Simular que DEN-2026-0006 tiene 2 días restantes
                $denuncias = session('denuncias_mock', []);
                foreach ($denuncias as $i => $d) {
                    if (($d['ticket'] ?? '') === 'DEN-2026-0006') {
                        $denuncias[$i]['created_at'] = (clone $now)->subDays(43)->toDateTimeString();
                        session(['denuncias_mock' => $denuncias]);
                        return self::createNotificacion(
                            tipo: 'plazo_por_vencer', titulo: 'Plazo total por vencer',
                            mensaje: "DEN-2026-0006 · corrupcion · 2 día(s) restante(s)",
                            ticket: 'DEN-2026-0006', destinoUrl: "/denuncias/DEN-2026-0006",
                            icono: 'Clock', color: 'warning',
                        );
                    }
                }
                break;

            case 'plazo_vencido':
                // Simular que DEN-2026-0007 (negacion, 20d) está vencida
                $denuncias = session('denuncias_mock', []);
                foreach ($denuncias as $i => $d) {
                    if (($d['ticket'] ?? '') === 'DEN-2026-0007') {
                        $denuncias[$i]['created_at'] = (clone $now)->subDays(25)->toDateTimeString();
                        session(['denuncias_mock' => $denuncias]);
                        return self::createNotificacion(
                            tipo: 'plazo_vencido', titulo: 'Plazo vencido',
                            mensaje: "DEN-2026-0007 · Vencido hace 5 día(s)",
                            ticket: 'DEN-2026-0007', destinoUrl: "/denuncias/DEN-2026-0007",
                            icono: 'AlertTriangle', color: 'destructive',
                        );
                    }
                }
                break;

            case 'plazo_informe':
                // Poner DEN-2026-0010 en informe con informe_created_at de hace 2 días
                $denuncias = session('denuncias_mock', []);
                foreach ($denuncias as $i => $d) {
                    if (($d['ticket'] ?? '') === 'DEN-2026-0010' && $d['estado'] === 'informe') {
                        $denuncias[$i]['informe_created_at'] = (clone $now)->subDays(2)->toDateTimeString();
                        session(['denuncias_mock' => $denuncias]);
                        return self::createNotificacion(
                            tipo: 'plazo_informe', titulo: 'Informe final por vencer',
                            mensaje: "DEN-2026-0010 · 2 día(s) para concluir informe",
                            ticket: 'DEN-2026-0010', destinoUrl: "/denuncias/DEN-2026-0010",
                            icono: 'FileText', color: 'warning',
                        );
                    }
                }
                break;

            case 'solicitud_vence':
                $solicitudes = session('solicitudes_mock', []);
                foreach ($solicitudes as $i => $s) {
                    if (($s['id'] ?? 0) === 1 && $s['estado'] === 'pendiente') {
                        $solicitudes[$i]['fecha_vencimiento'] = (clone $now)->addDays(2)->endOfDay()->toDateTimeString();
                        session(['solicitudes_mock' => $solicitudes]);
                        return self::createNotificacion(
                            tipo: 'solicitud_vence', titulo: 'Solicitud de información por vencer',
                            mensaje: "DEN-2026-0008 · Unidad de Contrataciones · 2 día(s)",
                            ticket: 'DEN-2026-0008', destinoUrl: "/denuncias/DEN-2026-0008",
                            icono: 'MailQuestion', color: 'warning',
                        );
                    }
                }
                break;

            case 'descargo_vence':
                $descargos = session('descargos_mock', []);
                foreach ($descargos as $i => $d) {
                    if (($d['id'] ?? 0) === 1 && $d['estado'] === 'notificado') {
                        $descargos[$i]['fecha_notificacion'] = (clone $now)->subDays(8)->toDateTimeString();
                        $descargos[$i]['fecha_vencimiento'] = (clone $now)->addDays(2)->endOfDay()->toDateTimeString();
                        session(['descargos_mock' => $descargos]);
                        return self::createNotificacion(
                            tipo: 'descargo_vence', titulo: 'Descargo por vencer',
                            mensaje: "DEN-2026-0008 · 2 día(s) para responder",
                            ticket: 'DEN-2026-0008', destinoUrl: "/denuncias/DEN-2026-0008",
                            icono: 'MessageSquareWarning', color: 'warning',
                        );
                    }
                }
                break;
        }

        return self::createNotificacion(
            tipo: 'sistema', titulo: 'Simulación completada',
            mensaje: "Se generó una notificación de tipo: {$tipo}",
            ticket: null, destinoUrl: '/notificaciones',
            icono: 'Bell', color: 'primary',
        );
    }

    /**
     * Resetea TODOS los datos mock al estado seed inicial.
     */
    public static function reset(): void
    {
        // Limpiar sesiones mock
        session()->forget('denuncias_mock');
        session()->forget('denuncia_counter');
        session()->forget('solicitudes_mock');
        session()->forget('solicitud_counter');
        session()->forget('descargos_mock');
        session()->forget('descargo_counter');
        session()->forget(self::SESSION_KEY);

        // Repoblar desde seed
        DenunciaData::seedDemoData();
        self::generarParaUsuario();
    }

    private static function addBitacoraEntry(array &$denuncias, int $index, string $accion, string $detalle): void
    {
        $denuncias[$index]['bitacora'][] = [
            'fecha' => now()->toDateTimeString(),
            'accion' => $accion,
            'detalle' => $detalle,
            'usuario' => 'sistema',
        ];
    }

    // ──────────────────────────────────────────────
    //  HELPERS
    // ──────────────────────────────────────────────

    private static function createNotificacion(
        string $tipo,
        string $titulo,
        string $mensaje,
        ?string $ticket = null,
        string $destinoUrl = '#',
        string $icono = 'Bell',
        string $color = 'primary',
    ): array {
        self::init();
        $sessionData = session(self::SESSION_KEY);
        $id = $sessionData['next_id'];
        $sessionData['next_id']++;
        session([self::SESSION_KEY => $sessionData]);

        return [
            'id' => $id,
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'ticket' => $ticket,
            'destino_url' => $destinoUrl,
            'leida' => false,
            'fecha_leida' => null,
            'fecha' => now()->toDateTimeString(),
            'icono' => $icono,
            'color' => $color,
        ];
    }
}
