<?php

namespace App\Data;

use Carbon\Carbon;
use App\Data\SolicitudData;
use App\Data\DescargoData;

class DenunciaData
{
    private const SESSION_KEY = 'denuncias_mock';
    private const COUNTER_KEY = 'denuncia_counter';

    public const TECNICOS_MOCK = [
        'tec-1' => ['id' => 'tec-1', 'nombre' => 'Carlos Quispe', 'iniciales' => 'CQ', 'color' => 'bg-blue-500'],
        'tec-2' => ['id' => 'tec-2', 'nombre' => 'Ana Torres', 'iniciales' => 'AT', 'color' => 'bg-pink-500'],
        'tec-3' => ['id' => 'tec-3', 'nombre' => 'Luis Mamani', 'iniciales' => 'LM', 'color' => 'bg-green-500'],
    ];

    // ──────────────────────────────────────────────
    //  GETTERS GENERALES
    // ──────────────────────────────────────────────

    public static function getAll(): array
    {
        return session()->get(self::SESSION_KEY, []);
    }

    public static function getByEstado(string $estado): array
    {
        return array_values(array_filter(self::getAll(), fn($d) => ($d['estado'] ?? '') === $estado));
    }

    public static function getByTecnico(string $tecnicoId): array
    {
        return array_values(array_filter(self::getAll(), fn($d) => ($d['tecnico'] ?? '') === $tecnicoId));
    }

    public static function find(string $ticket): ?array
    {
        foreach (self::getAll() as $d) {
            if (($d['ticket'] ?? '') === $ticket) return $d;
        }
        return null;
    }

    // ──────────────────────────────────────────────
    //  ACCIONES MOCK
    // ──────────────────────────────────────────────

    public static function add(array $data): string
    {
        $ticket = self::generateTicket();
        $data['ticket'] = $ticket;
        $data['created_at'] = now()->toDateTimeString();
        $data['estado'] = 'ingresada';
        $data['subestado'] = null;
        $data['tecnico'] = null;
        $data['fecha_admitida'] = null;
        $data['fecha_asignada'] = null;
        $data['justificacion_admision'] = null;
        $data['justificacion_rechazo'] = null;
        $data['resumen_rechazo'] = null;
        $data['fecha_rechazada'] = null;
        $data['justificacion_traspaso'] = null;
        $data['fecha_traspaso'] = null;
        $data['tecnico_anterior'] = null;
        $data['fecha_reapertura'] = null;
        $data['justificacion_reapertura'] = null;
        $data['plazo_reapertura'] = null;
        $data['ampliaciones'] = [];
        $data['bitacora'] = [];
        $data['token_consulta'] = self::generateToken();

        // Sprint 5 — Informe Final y Cierre
        $data['informe_clasificacion'] = null;
        $data['informe_fojas'] = null;
        $data['informe_justificacion'] = null;
        $data['informe_archivos'] = [];
        $data['informe_redactado_at'] = null;
        $data['informe_concluido_por'] = null;
        $data['informe_ediciones'] = [];
        $data['informe_eliminado'] = false;
        $data['informe_fecha_eliminacion'] = null;
        $data['cierre_sitpreco'] = null;
        $data['cierre_notificado_denunciante'] = null;
        $data['cierre_notificacion_medio'] = null;
        $data['cierre_notificacion_fecha'] = null;
        $data['cierre_notificacion_descripcion'] = null;
        $data['cierre_no_notificado_motivo'] = null;
        $data['cierre_concluido_por'] = null;
        $data['cierre_descripcion'] = null;
        $data['cierre_archivos'] = [];
        $data['cierre_cerrado_at'] = null;
        $data['cierre_ediciones'] = [];
        $data['cierre_eliminado'] = false;
        $data['cierre_fecha_eliminacion'] = null;

        $denuncias = self::getAll();
        $denuncias[] = $data;
        session()->put(self::SESSION_KEY, $denuncias);

        return $ticket;
    }

    public static function generateTicket(): string
    {
        $year = now()->year;
        $counter = session()->get(self::COUNTER_KEY, 0) + 1;
        session()->put(self::COUNTER_KEY, $counter);

        return sprintf('DEN-%d-%04d', $year, $counter);
    }

    public static function generateToken(): string
    {
        return str_pad((string) random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
    }

    public static function findByTicketAndToken(string $ticket, string $token): ?array
    {
        foreach (self::getAll() as $d) {
            if (($d['ticket'] ?? '') === $ticket && ($d['token_consulta'] ?? '') === $token) {
                return $d;
            }
        }
        return null;
    }

    public static function admitir(string $ticket, ?string $justificacion): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket) {
                $denuncias[$i]['estado'] = 'admitida';
                $denuncias[$i]['fecha_admitida'] = now()->toDateTimeString();
                $denuncias[$i]['justificacion_admision'] = $justificacion;
                self::addBitacoraEntry($denuncias, $i, 'admitida', $justificacion ? "Admitida con justificación: {$justificacion}" : 'Admitida sin justificación', 'sistema');
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function rechazar(string $ticket, string $justificacion, ?string $resumenRechazo = null): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket) {
                $denuncias[$i]['estado'] = 'rechazada';
                $denuncias[$i]['fecha_rechazada'] = now()->toDateTimeString();
                $denuncias[$i]['justificacion_rechazo'] = $justificacion;
                $denuncias[$i]['resumen_rechazo'] = $resumenRechazo;
                self::addBitacoraEntry($denuncias, $i, 'rechazada', "Rechazada: {$justificacion}", 'sistema');
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function iniciarInvestigacion(string $ticket): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && ($d['estado'] ?? '') === 'asignada') {
                $denuncias[$i]['estado'] = 'investigacion';
                self::addBitacoraEntry($denuncias, $i, 'investigacion', 'Investigación iniciada', 'sistema');
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    // ──────────────────────────────────────────────
    //  SPRINT 3 — NUEVAS ACCIONES
    // ──────────────────────────────────────────────

    public static function asignarTecnico(string $ticket, string $tecnicoId, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && ($d['estado'] ?? '') === 'admitida') {
                $denuncias[$i]['estado'] = 'asignada';
                $denuncias[$i]['tecnico'] = $tecnicoId;
                $denuncias[$i]['fecha_asignada'] = now()->toDateTimeString();
                $nombreTecnico = self::TECNICOS_MOCK[$tecnicoId]['nombre'] ?? $tecnicoId;
                self::addBitacoraEntry($denuncias, $i, 'asignada', "Asignada a {$nombreTecnico}", $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function traspasar(string $ticket, string $nuevoTecnicoId, string $justificacion, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && in_array($d['estado'] ?? '', ['asignada', 'investigacion', 'informe'])) {
                $denuncias[$i]['tecnico_anterior'] = $d['tecnico'] ?? null;
                $denuncias[$i]['tecnico'] = $nuevoTecnicoId;
                $denuncias[$i]['fecha_traspaso'] = now()->toDateTimeString();
                $denuncias[$i]['justificacion_traspaso'] = $justificacion;
                $viejo = self::TECNICOS_MOCK[$d['tecnico'] ?? '']['nombre'] ?? $d['tecnico'] ?? '—';
                $nuevo = self::TECNICOS_MOCK[$nuevoTecnicoId]['nombre'] ?? $nuevoTecnicoId;
                self::addBitacoraEntry($denuncias, $i, 'traspaso', "Traspasado de {$viejo} → {$nuevo}. Justificación: {$justificacion}", $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function reabrir(string $ticket, string $justificacion, string $nuevaFechaLimite, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && in_array($d['estado'] ?? '', ['rechazada', 'cerrada'])) {
                $denuncias[$i]['estado'] = 'ingresada';
                $denuncias[$i]['subestado'] = null;
                $denuncias[$i]['tecnico_anterior'] = $d['tecnico'] ?? null;
                $denuncias[$i]['tecnico'] = null;
                $denuncias[$i]['justificacion_admision'] = null;
                $denuncias[$i]['justificacion_rechazo'] = null;
                $denuncias[$i]['fecha_admitida'] = null;
                $denuncias[$i]['fecha_asignada'] = null;
                $denuncias[$i]['fecha_rechazada'] = null;
                $denuncias[$i]['justificacion_traspaso'] = null;
                $denuncias[$i]['fecha_traspaso'] = null;
                $denuncias[$i]['fecha_reapertura'] = now()->toDateTimeString();
                $denuncias[$i]['justificacion_reapertura'] = $justificacion;
                $denuncias[$i]['plazo_reapertura'] = $nuevaFechaLimite;
                $denuncias[$i]['ampliaciones'] = [];
                self::addBitacoraEntry($denuncias, $i, 'reapertura', "Reabierta. Nuevo plazo: {$nuevaFechaLimite}. Ampliaciones previas eliminadas. Justificación: {$justificacion}", $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function getCargaTecnicos(): array
    {
        $denuncias = self::getAll();
        $carga = [];

        foreach (self::TECNICOS_MOCK as $id => $info) {
            $activos = 0;
            $porVencer = 0;
            $vencidos = 0;

            foreach ($denuncias as $d) {
                if (($d['tecnico'] ?? '') !== $id) continue;
                $e = $d['estado'] ?? '';
                if (!in_array($e, ['asignada', 'investigacion', 'informe'])) continue;

                $activos++;
                $plazoInfo = self::getPlazoInfo($d);
                if ($plazoInfo) {
                    if ($plazoInfo['color'] === 'red') $vencidos++;
                    if ($plazoInfo['color'] === 'yellow') $porVencer++;
                }
            }

            $carga[] = [
                'id' => $id,
                'nombre' => $info['nombre'],
                'iniciales' => $info['iniciales'],
                'color' => $info['color'],
                'activos' => $activos,
                'por_vencer' => $porVencer,
                'vencidos' => $vencidos,
            ];
        }

        return $carga;
    }

    public static function getBitacora(string $ticket): array
    {
        $d = self::find($ticket);
        return $d['bitacora'] ?? [];
    }

    // ──────────────────────────────────────────────
    //  SPRINT 4 — Solicitudes, Descargos, Saltar Fase
    // ──────────────────────────────────────────────

    public static function getSolicitudes(string $ticket): array
    {
        return SolicitudData::getByTicket($ticket);
    }

    public static function getDescargos(string $ticket): array
    {
        return DescargoData::getByTicket($ticket);
    }

    public static function saltarFase(string $ticket, string $justificacion, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && ($d['estado'] ?? '') === 'investigacion') {
                $denuncias[$i]['estado'] = 'informe';
                self::addBitacoraEntry($denuncias, $i, 'saltar_fase', "Fase de investigación saltada. Justificación: {$justificacion}", $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function registrarAccion(string $ticket, string $accion, string $detalle, string $usuario = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket) {
                self::addBitacoraEntry($denuncias, $i, $accion, $detalle, $usuario);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    // ──────────────────────────────────────────────
    //  SPRINT 5 — Informe Final y Cierre
    // ──────────────────────────────────────────────

    public static function guardarInforme(string $ticket, array $data, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && in_array($d['estado'] ?? '', ['informe', 'cerrada'])) {
                $denuncias[$i]['informe_clasificacion'] = $data['clasificacion'];
                $denuncias[$i]['informe_fojas'] = $data['fojas'];
                $denuncias[$i]['informe_justificacion'] = $data['justificacion'] ?? null;
                $denuncias[$i]['informe_archivos'] = $data['archivos'] ?? [];
                $denuncias[$i]['informe_redactado_at'] = now()->toDateTimeString();
                $denuncias[$i]['informe_concluido_por'] = $data['concluido_por'];
                $denuncias[$i]['informe_eliminado'] = false;
                $denuncias[$i]['informe_fecha_eliminacion'] = null;
                self::addBitacoraEntry($denuncias, $i, 'informe_redactado', "Informe Final redactado. Clasificación: {$data['clasificacion']}. Fojas: {$data['fojas']}", $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function editarInforme(string $ticket, array $data, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && in_array($d['estado'] ?? '', ['informe', 'cerrada'])) {
                $cambios = [];
                $map = [
                    'clasificacion' => 'informe_clasificacion',
                    'fojas' => 'informe_fojas',
                    'justificacion' => 'informe_justificacion',
                    'archivos' => 'informe_archivos',
                    'concluido_por' => 'informe_concluido_por',
                ];
                foreach ($map as $campo => $key) {
                    if (array_key_exists($campo, $data)) {
                        $anterior = $denuncias[$i][$key] ?? null;
                        $nuevo = $data[$campo];
                        if ($anterior !== $nuevo && $campo !== 'archivos') {
                            $cambios[] = "{$campo}: '{$anterior}' → '{$nuevo}'";
                        }
                        $denuncias[$i][$key] = $nuevo;
                    }
                }
                $denuncias[$i]['informe_redactado_at'] = now()->toDateTimeString();
                $denuncias[$i]['informe_eliminado'] = false;
                $denuncias[$i]['informe_fecha_eliminacion'] = null;
                $denuncias[$i]['informe_ediciones'][] = [
                    'fecha' => now()->toDateTimeString(),
                    'cambios' => $cambios,
                    'usuario' => $usuarioId,
                ];
                self::addBitacoraEntry($denuncias, $i, 'informe_editado', "Informe Final editado. Cambios: " . implode('; ', $cambios), $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function eliminarInforme(string $ticket, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && in_array($d['estado'] ?? '', ['informe', 'cerrada'])) {
                $denuncias[$i]['informe_eliminado'] = true;
                $denuncias[$i]['informe_fecha_eliminacion'] = now()->toDateTimeString();
                self::addBitacoraEntry($denuncias, $i, 'informe_eliminado', "Informe Final eliminado (soft delete)", $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function guardarCierre(string $ticket, array $data, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && ($d['estado'] ?? '') === 'informe') {
                $denuncias[$i]['cierre_sitpreco'] = $data['sitpreco'] ?? null;
                $denuncias[$i]['cierre_notificado_denunciante'] = $data['notificado_denunciante'] ?? false;
                $denuncias[$i]['cierre_notificacion_medio'] = $data['notificacion_medio'] ?? null;
                $denuncias[$i]['cierre_notificacion_fecha'] = $data['notificacion_fecha'] ?? null;
                $denuncias[$i]['cierre_notificacion_descripcion'] = $data['notificacion_descripcion'] ?? null;
                $denuncias[$i]['cierre_no_notificado_motivo'] = $data['no_notificado_motivo'] ?? null;
                $denuncias[$i]['cierre_concluido_por'] = $data['concluido_por'];
                $denuncias[$i]['cierre_descripcion'] = $data['descripcion'];
                $denuncias[$i]['cierre_archivos'] = $data['archivos'] ?? [];
                $denuncias[$i]['cierre_cerrado_at'] = now()->toDateTimeString();
                $denuncias[$i]['cierre_eliminado'] = false;
                $denuncias[$i]['cierre_fecha_eliminacion'] = null;
                $denuncias[$i]['estado'] = 'cerrada';
                $sitpreco = $data['sitpreco'] ?? '—';
                self::addBitacoraEntry($denuncias, $i, 'cierre_registrado', "Cierre registrado. SITPRECO: {$sitpreco}. Estado: cerrada", $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function editarCierre(string $ticket, array $data, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && ($d['estado'] ?? '') === 'cerrada') {
                $cambios = [];
                $map = [
                    'sitpreco' => 'cierre_sitpreco',
                    'notificado_denunciante' => 'cierre_notificado_denunciante',
                    'notificacion_medio' => 'cierre_notificacion_medio',
                    'notificacion_fecha' => 'cierre_notificacion_fecha',
                    'notificacion_descripcion' => 'cierre_notificacion_descripcion',
                    'no_notificado_motivo' => 'cierre_no_notificado_motivo',
                    'concluido_por' => 'cierre_concluido_por',
                    'descripcion' => 'cierre_descripcion',
                    'archivos' => 'cierre_archivos',
                ];
                foreach ($map as $campo => $key) {
                    if (array_key_exists($campo, $data)) {
                        $anterior = $denuncias[$i][$key] ?? null;
                        $nuevo = $data[$campo];
                        if ($anterior !== $nuevo && $campo !== 'archivos') {
                            $cambios[] = "{$campo}: '" . (is_string($anterior) ? $anterior : json_encode($anterior)) . "' → '" . (is_string($nuevo) ? $nuevo : json_encode($nuevo)) . "'";
                        }
                        $denuncias[$i][$key] = $nuevo;
                    }
                }
                $denuncias[$i]['cierre_eliminado'] = false;
                $denuncias[$i]['cierre_fecha_eliminacion'] = null;
                $denuncias[$i]['cierre_ediciones'][] = [
                    'fecha' => now()->toDateTimeString(),
                    'cambios' => $cambios,
                    'usuario' => $usuarioId,
                ];
                self::addBitacoraEntry($denuncias, $i, 'cierre_editado', "Cierre editado. Cambios: " . implode('; ', $cambios), $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function eliminarCierre(string $ticket, string $usuarioId = 'sistema'): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket && ($d['estado'] ?? '') === 'cerrada') {
                $denuncias[$i]['cierre_eliminado'] = true;
                $denuncias[$i]['cierre_fecha_eliminacion'] = now()->toDateTimeString();
                $denuncias[$i]['estado'] = 'informe';
                self::addBitacoraEntry($denuncias, $i, 'cierre_eliminado', "Cierre eliminado (soft delete). Estado vuelve a informe", $usuarioId);
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    private static function addBitacoraEntry(array &$denuncias, int $index, string $accion, string $detalle, string $usuarioId): void
    {
        $entry = [
            'fecha' => now()->toDateTimeString(),
            'accion' => $accion,
            'detalle' => $detalle,
            'usuario' => $usuarioId,
        ];
        $denuncias[$index]['bitacora'][] = $entry;
    }

    // ──────────────────────────────────────────────
    //  DATOS AGREGADOS
    // ──────────────────────────────────────────────

    public static function getContadores(): array
    {
        $contadores = [
            'ingresada' => 0, 'admitida' => 0, 'asignada' => 0,
            'investigacion' => 0, 'informe' => 0, 'cerrada' => 0, 'rechazada' => 0,
        ];
        foreach (self::getAll() as $d) {
            $e = $d['estado'] ?? '';
            if (isset($contadores[$e])) $contadores[$e]++;
        }
        return $contadores;
    }

    public static function getContadoresTecnico(string $tecnicoId): array
    {
        $denuncias = self::getByTecnico($tecnicoId);
        $activos = 0;
        $vencidos = 0;
        $porVencer = 0;
        $cerrados = 0;

        foreach ($denuncias as $d) {
            $e = $d['estado'] ?? '';
            if (in_array($e, ['investigacion', 'informe'])) {
                $activos++;
                $info = self::getPlazoInfo($d);
                if ($info) {
                    if ($info['color'] === 'red') $vencidos++;
                    if ($info['color'] === 'yellow') $porVencer++;
                }
            }
            if ($e === 'cerrada') $cerrados++;
        }

        return compact('activos', 'vencidos', 'porVencer', 'cerrados');
    }

    public static function getPlazoInfo(array $denuncia): ?array
    {
        $estadosActivos = ['ingresada', 'admitida', 'asignada', 'investigacion', 'informe'];
        if (!in_array($denuncia['estado'] ?? '', $estadosActivos)) return null;
        if (!in_array($denuncia['tipo'] ?? '', ['corrupcion', 'negacion'])) return null;
        if (empty($denuncia['created_at'])) return null;

        $plazoBase = self::getPlazoDias($denuncia['tipo']);
        $sumaAmpliaciones = array_sum(array_column($denuncia['ampliaciones'] ?? [], 'dias'));
        $plazoTotal = $plazoBase + $sumaAmpliaciones;

        // Si fue reabierta y tiene nuevo plazo manual, calcular desde fecha_reapertura hasta plazo_reapertura
        if (!empty($denuncia['plazo_reapertura'])) {
            $fechaLimite = Carbon::parse($denuncia['plazo_reapertura']);
            $diasRestantes = (int) now()->diffInDays($fechaLimite, false);
        } else {
            $created = Carbon::parse($denuncia['created_at']);
            $diasTranscurridos = (int) $created->diffInDays(now(), false);
            $diasRestantes = $plazoTotal - $diasTranscurridos;
        }

        $fechaVencimiento = !empty($denuncia['plazo_reapertura'])
            ? Carbon::parse($denuncia['plazo_reapertura'])->format('Y-m-d')
            : Carbon::parse($denuncia['created_at'])->addDays($plazoTotal)->format('Y-m-d');

        $result = ['dias_restantes' => $diasRestantes, 'color' => 'green', 'fecha_vencimiento' => $fechaVencimiento];

        if ($diasRestantes > 5)  return $result;
        if ($diasRestantes >= 1) { $result['color'] = 'yellow'; return $result; }
        $result['color'] = 'red'; return $result;
    }

    public static function getPlazoDias(string $tipo): int
    {
        return match ($tipo) {
            'corrupcion' => 45,
            'negacion'   => 20,
            default      => 0,
        };
    }

    public static function getMaxAmpliacion(string $tipo): int
    {
        return match ($tipo) {
            'corrupcion' => 45,
            'negacion'   => 10,
            default      => 0,
        };
    }

    public static function aprobarAmpliacion(string $ticket, int $dias, string $justificacion, ?string $solicitadoPor = null): array|false
    {
        $items = session(self::SESSION_KEY, []);
        foreach ($items as $i => $d) {
            if (($d['ticket'] ?? '') !== $ticket) continue;

            $tipo = $d['tipo'] ?? '';
            $maxAmpliacion = self::getMaxAmpliacion($tipo);
            $sumaActual = array_sum(array_column($d['ampliaciones'] ?? [], 'dias'));

            if (($sumaActual + $dias) > $maxAmpliacion) {
                return ['error' => "Excede el máximo legal de {$maxAmpliacion} días adicionales para {$tipo}"];
            }

            $numAmpliacion = count($d['ampliaciones'] ?? []) + 1;
            $items[$i]['ampliaciones'][] = [
                'id' => $numAmpliacion,
                'fecha' => now()->toDateTimeString(),
                'dias' => $dias,
                'justificacion' => $justificacion,
                'aprobado_por' => 'Jefe de Unidad',
                'solicitado_por' => $solicitadoPor,
                'archivo_respaldo' => null,
            ];

            self::addBitacoraEntry($items, $i, 'ampliacion_plazo', "Plazo ampliado {$dias} días (ampliación #{$numAmpliacion}). Justificación: {$justificacion}", 'sistema');
            session()->put(self::SESSION_KEY, $items);
            return $items[$i];
        }
        return false;
    }

    public static function getCategorias(): array
    {
        return [
            'cohecho' => 'Cohecho (Soborno)',
            'concusion' => 'Concusión',
            'malversacion' => 'Malversación',
            'negociaciones' => 'Negociaciones incompatibles',
            'enriquecimiento' => 'Enriquecimiento ilícito',
            'trafico' => 'Tráfico de influencias',
            'peculado' => 'Peculado',
            'omision' => 'Omisión de denuncia',
            'incumplimiento' => 'Incumplimiento de deberes',
            'otro' => 'Otro',
        ];
    }

    // ──────────────────────────────────────────────
    //  SEED DE DEMO
    // ──────────────────────────────────────────────

    public static function seedDemoData(): void
    {
        if (!empty(self::getAll())) return;

        $denuncias = [];
        foreach (self::buildSeedItems() as $item) {
            $base = self::makeDenuncia();
            $denuncias[] = array_merge($base, $item);
        }

        session()->put(self::SESSION_KEY, $denuncias);
        session()->put(self::COUNTER_KEY, count($denuncias));

        // Seed solicitudes and descargos demo (Sprint 4)
        SolicitudData::seedDemoData();
        DescargoData::seedDemoData();
    }

    private static function buildSeedItems(): array
    {
        $now = now();

        return [
            [
                'ticket' => 'DEN-2026-0001',
                'token_consulta' => '1001',
                'tipo' => 'corrupcion', 'estado' => 'ingresada',
                'created_at' => (clone $now)->subDays(7)->toDateTimeString(),
                'denunciante' => ['nombres' => 'Juan Pérez', 'ci' => '1234567', 'email' => 'juan@example.com', 'telefono' => '70123456'],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'María García', 'dependencia' => 'Dirección Administrativa', 'descripcion' => '']],
                'detalles' => ['categoria' => 'cohecho', 'fecha' => '2026-05-15', 'hora' => '10:30', 'lugar' => 'Oficina Central GAMEA, piso 3'],
                'hechos' => 'Solicité un permiso de construcción y el funcionario me pidió Bs 500 para "agilizar el trámite". Me indicó que sin ese pago el permiso tardaría meses.',
                'pruebas' => [['tipo' => 'testigo', 'descripcion' => 'Mi vecino presenció la conversación', 'testigo_nombre' => 'Pedro Mamani', 'testigo_telefono' => '71234567']],
            ],
            [
                'ticket' => 'DEN-2026-0002',
                'token_consulta' => '1002',
                'tipo' => 'negacion', 'estado' => 'ingresada',
                'created_at' => (clone $now)->subDays(17)->toDateTimeString(),
                'denunciante' => ['nombres' => 'Rosa Choque', 'ci' => '7654321', 'email' => 'rosa@mail.com', 'telefono' => '68765432'],
                'denunciados' => [['conoce_identidad' => false, 'nombres' => '', 'dependencia' => '', 'descripcion' => 'Funcionario de ventanilla única, varón, cabello corto, lentes, de aproximadamente 40 años']],
                'detalles' => ['categoria' => 'incumplimiento', 'fecha' => '2026-04-10', 'hora' => '15:00', 'lugar' => 'Ventanilla Única de Trámites'],
                'hechos' => 'Solicité copias certificadas de mi título de propiedad. El funcionario se negó a entregármelas argumentando que "no había sistema". Han pasado 3 semanas y cada vez que voy me dicen lo mismo. Ya presenté 3 solicitudes formales por escrito y ninguna fue respondida.',
                'pruebas' => [],
            ],
            [
                'ticket' => 'DEN-2026-0003',
                'token_consulta' => '1003',
                'tipo' => 'corrupcion', 'estado' => 'ingresada',
                'created_at' => (clone $now)->subDays(15)->toDateTimeString(),
                'escenario' => 'anonimo',
                'denunciante' => ['nombres' => '', 'ci' => '', 'email' => '', 'telefono' => ''],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'Roberto Quispe', 'dependencia' => 'Departamento de Compras', 'descripcion' => '']],
                'detalles' => ['categoria' => 'peculado', 'fecha' => '2026-03-20', 'hora' => '', 'lugar' => 'Almacenes Municipales'],
                'hechos' => 'Se han detectado faltantes en el inventario de materiales de construcción adquiridos para el bacheo de calles. Los registros muestran compras por Bs 50,000 pero los materiales recibidos no corresponden con las facturas presentadas. Hay al menos 3 facturas sospechosas con montos elevados.',
                'pruebas' => [],
            ],
            [
                'ticket' => 'DEN-2026-0004',
                'token_consulta' => '1004',
                'tipo' => 'corrupcion', 'estado' => 'admitida',
                'created_at' => (clone $now)->subDays(20)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(18)->toDateTimeString(),
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(18)->toDateTimeString(), 'accion' => 'admitida', 'detalle' => 'Admitida sin justificación', 'usuario' => 'sistema'],
                ],
                'denunciante' => ['nombres' => 'Carlos Siles', 'ci' => '3456789', 'email' => 'csiles@correo.com', 'telefono' => '72345678'],
                'denunciados' => [
                    ['conoce_identidad' => true, 'nombres' => 'Ana Condori', 'dependencia' => 'Unidad de Adjudicaciones', 'descripcion' => ''],
                    ['conoce_identidad' => true, 'nombres' => 'Pedro Vargas', 'dependencia' => 'Unidad de Adjudicaciones', 'descripcion' => ''],
                ],
                'detalles' => ['categoria' => 'negociaciones', 'fecha' => '2026-03-01', 'hora' => '', 'lugar' => 'Dirección de Adquisiciones'],
                'hechos' => 'La licitación LPE-026-2026 para la adquisición de equipos de cómputo fue adjudicada a una empresa que no cumplía los requisitos técnicos mínimos. La empresa ganadora presentó su propuesta 5 minutos después del cierre de la convocatoria. Existe evidencia de comunicación previa entre los funcionarios y la empresa.',
                'pruebas' => [
                    ['tipo' => 'archivo', 'descripcion' => 'Copia de la convocatoria y acta de adjudicación', 'archivo_nombre' => 'licitacion_lpe026.pdf'],
                    ['tipo' => 'testigo', 'descripcion' => 'Otro postor que presenció la irregularidad', 'testigo_nombre' => 'Felipe Choque', 'testigo_telefono' => '73456789'],
                ],
            ],
            [
                'ticket' => 'DEN-2026-0005',
                'token_consulta' => '1005',
                'tipo' => 'negacion', 'estado' => 'rechazada',
                'created_at' => (clone $now)->subDays(10)->toDateTimeString(),
                'fecha_rechazada' => (clone $now)->subDays(10)->toDateTimeString(),
                'justificacion_rechazo' => 'La denuncia no especifica el periodo en que ocurrieron los hechos ni proporciona datos suficientes del presunto responsable. Se invita al denunciante a subsanar las omisiones y presentar una nueva denuncia según Art. 22 §III de la Ley 974.',
                'resumen_rechazo' => 'La denuncia no proporciona suficientes datos del presunto responsable ni del periodo de los hechos.',
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(10)->toDateTimeString(), 'accion' => 'rechazada', 'detalle' => 'Rechazada: La denuncia no especifica el periodo en que ocurrieron los hechos ni proporciona datos suficientes del presunto responsable.', 'usuario' => 'sistema'],
                ],
                'denunciante' => ['nombres' => 'Martha Loza', 'ci' => '5678901', 'email' => 'mloza@yahoo.com', 'telefono' => '75678901'],
                'denunciados' => [['conoce_identidad' => false, 'nombres' => '', 'dependencia' => '', 'descripcion' => 'Funcionario de la Unidad de Catastro, sexo masculino, contextura delgada']],
                'detalles' => ['categoria' => 'otro', 'fecha' => '2026-05-01', 'hora' => '', 'lugar' => 'Unidad de Catastro'],
                'hechos' => 'Fui a la Unidad de Catastro a solicitar un plano y el funcionario me atendió de mala manera diciendo que "vuelva mañana". Esto pasó varias veces. Quiero que tomen cartas en el asunto.',
                'pruebas' => [],
            ],
            [
                'ticket' => 'DEN-2026-0006',
                'token_consulta' => '1006',
                'tipo' => 'corrupcion', 'estado' => 'asignada',
                'tecnico' => 'tec-1',
                'created_at' => (clone $now)->subDays(5)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(4)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(3)->toDateTimeString(),
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(4)->toDateTimeString(), 'accion' => 'admitida', 'detalle' => 'Admitida sin justificación', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(3)->toDateTimeString(), 'accion' => 'asignada', 'detalle' => 'Asignada a Carlos Quispe', 'usuario' => 'sistema'],
                ],
                'denunciante' => ['nombres' => 'Lucía Flores', 'ci' => '2345678', 'email' => 'lucia.flores@mail.com', 'telefono' => '71239876'],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'Jorge Miranda', 'dependencia' => 'Dirección de Ingresos', 'descripcion' => '']],
                'detalles' => ['categoria' => 'trafico', 'fecha' => '2026-04-20', 'hora' => '11:00', 'lugar' => 'Dirección de Ingresos, segundo piso'],
                'hechos' => 'El Director de Ingresos me ofreció "reducir" el monto de mi deuda municipal a cambio de un pago directo a su cuenta personal. Me mostró casos anteriores donde había hecho lo mismo. Tengo capturas de pantalla de la conversación de WhatsApp donde menciona los montos.',
                'pruebas' => [
                    ['tipo' => 'archivo', 'descripcion' => 'Capturas de conversación de WhatsApp', 'archivo_nombre' => 'conversacion_whatsapp.pdf'],
                    ['tipo' => 'fisica', 'descripcion' => 'Nota manuscrita con el número de cuenta donde debo depositar'],
                ],
            ],
            [
                'ticket' => 'DEN-2026-0007',
                'token_consulta' => '1007',
                'tipo' => 'negacion', 'estado' => 'asignada',
                'tecnico' => 'tec-2',
                'created_at' => (clone $now)->subDays(16)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(14)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(13)->toDateTimeString(),
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(14)->toDateTimeString(), 'accion' => 'admitida', 'detalle' => 'Admitida sin justificación', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(13)->toDateTimeString(), 'accion' => 'asignada', 'detalle' => 'Asignada a Ana Torres', 'usuario' => 'sistema'],
                ],
                'denunciante' => ['nombres' => 'Alberto Ríos', 'ci' => '8901234', 'email' => 'arios@hotmail.com', 'telefono' => '79012345'],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'Sonia Fernández', 'dependencia' => 'Oficina de Información y Quejas', 'descripcion' => '']],
                'detalles' => ['categoria' => 'omision', 'fecha' => '2026-04-01', 'hora' => '09:30', 'lugar' => 'Oficina de Información'],
                'hechos' => 'Solicité información sobre el estado de mi trámite de licencia de funcionamiento mediante carta con fecha 01/04/2026 con número de registro REG-2026-0891. A la fecha no he recibido ninguna respuesta. He acudido personalmente 4 veces y siempre me dicen que "la encargada no está" o "está en reunión".',
                'pruebas' => [],
            ],
            [
                'ticket' => 'DEN-2026-0008',
                'token_consulta' => '1008',
                'tipo' => 'corrupcion', 'estado' => 'investigacion',
                'tecnico' => 'tec-1',
                'created_at' => (clone $now)->subDays(40)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(38)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(37)->toDateTimeString(),
                'ampliaciones' => [
                    ['id' => 1, 'fecha' => (clone $now)->subDays(20)->toDateTimeString(), 'dias' => 15, 'justificacion' => 'Unidad externa de Auditoría Interna solicitó tiempo adicional para recopilar documentación.', 'aprobado_por' => 'Jefe de Unidad', 'solicitado_por' => 'Técnico Carlos Quispe'],
                    ['id' => 2, 'fecha' => (clone $now)->subDays(10)->toDateTimeString(), 'dias' => 15, 'justificacion' => 'Denunciado presentó solicitud de ampliación de plazo para descargo con justificación válida.', 'aprobado_por' => 'Jefe de Unidad', 'solicitado_por' => 'Técnico Carlos Quispe'],
                ],
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(38)->toDateTimeString(), 'accion' => 'admitida', 'detalle' => 'Admitida sin justificación', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(37)->toDateTimeString(), 'accion' => 'asignada', 'detalle' => 'Asignada a Carlos Quispe', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(35)->toDateTimeString(), 'accion' => 'investigacion', 'detalle' => 'Investigación iniciada', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(20)->toDateTimeString(), 'accion' => 'ampliacion_plazo', 'detalle' => 'Plazo ampliado 15 días (ampliación #1). Justificación: Unidad externa de Auditoría Interna solicitó tiempo adicional para recopilar documentación.', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(10)->toDateTimeString(), 'accion' => 'ampliacion_plazo', 'detalle' => 'Plazo ampliado 15 días (ampliación #2). Justificación: Denunciado presentó solicitud de ampliación de plazo para descargo con justificación válida.', 'usuario' => 'sistema'],
                ],
                'denunciante' => ['nombres' => 'Gabriela Huanca', 'ci' => '4567890', 'email' => 'ghuanca@gmail.com', 'telefono' => '74567890'],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'Marcelo Álvarez', 'dependencia' => 'Unidad de Contrataciones', 'descripcion' => '']],
                'detalles' => ['categoria' => 'malversacion', 'fecha' => '2026-02-10', 'hora' => '', 'lugar' => 'Unidad de Contrataciones'],
                'hechos' => 'Se han desviado fondos destinados a la compra de ambulancias para el hospital municipal. Los vehículos adquiridos son de menor especificación a los contratados pero se pagó el monto completo. La diferencia de precio (Bs 120,000) no tiene justificación. El informe técnico de recepción fue firmado por el jefe de la unidad a pesar de las observaciones del área de mantenimiento.',
                'pruebas' => [
                    ['tipo' => 'archivo', 'descripcion' => 'Contrato original y facturas de compra', 'archivo_nombre' => 'contrato_ambulancias.pdf'],
                    ['tipo' => 'testigo', 'descripcion' => 'Técnico de mantenimiento que detectó las diferencias', 'testigo_nombre' => 'Rubén Quisbert', 'testigo_telefono' => '77890123'],
                ],
            ],
            [
                'ticket' => 'DEN-2026-0009',
                'token_consulta' => '1009',
                'tipo' => 'negacion', 'estado' => 'investigacion',
                'tecnico' => 'tec-2',
                'created_at' => (clone $now)->subDays(22)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(20)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(19)->toDateTimeString(),
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(20)->toDateTimeString(), 'accion' => 'admitida', 'detalle' => 'Admitida sin justificación', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(19)->toDateTimeString(), 'accion' => 'asignada', 'detalle' => 'Asignada a Ana Torres', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(17)->toDateTimeString(), 'accion' => 'investigacion', 'detalle' => 'Investigación iniciada', 'usuario' => 'sistema'],
                ],
                'denunciante' => ['nombres' => 'Daniel Condo', 'ci' => '6789012', 'email' => 'dcondo@outlook.com', 'telefono' => '76789012'],
                'denunciados' => [
                    ['conoce_identidad' => true, 'nombres' => 'Silvia López', 'dependencia' => 'Secretaría General', 'descripcion' => ''],
                    ['conoce_identidad' => true, 'nombres' => 'Jorge Rojas', 'dependencia' => 'Secretaría General', 'descripcion' => ''],
                ],
                'detalles' => ['categoria' => 'incumplimiento', 'fecha' => '2026-03-15', 'hora' => '14:00', 'lugar' => 'Secretaría General del GAMEA'],
                'hechos' => 'Solicité un informe de auditoría correspondiente a la gestión 2025 mediante nota dirigida a la Secretaría General. Ambas autoridades se niegan a proporcionar el documento argumentando que "es información clasificada". Sin embargo, el Art. 24 de la Ley 974 establece que los informes de auditoría interna son de acceso público. Han transcurrido más de 22 días sin respuesta.',
                'pruebas' => [
                    ['tipo' => 'archivo', 'descripcion' => 'Copia de la solicitud con sello de recepción', 'archivo_nombre' => 'solicitud_informe_2025.pdf'],
                ],
            ],
            [
                'ticket' => 'DEN-2026-0010',
                'token_consulta' => '1010',
                'tipo' => 'corrupcion', 'estado' => 'informe',
                'tecnico' => 'tec-1',
                'created_at' => (clone $now)->subDays(33)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(31)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(30)->toDateTimeString(),
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(31)->toDateTimeString(), 'accion' => 'admitida', 'detalle' => 'Admitida sin justificación', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(30)->toDateTimeString(), 'accion' => 'asignada', 'detalle' => 'Asignada a Carlos Quispe', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(28)->toDateTimeString(), 'accion' => 'investigacion', 'detalle' => 'Investigación iniciada', 'usuario' => 'sistema'],
                ],
                'denunciante' => ['nombres' => 'Elena Vargas', 'ci' => '9012345', 'email' => 'evargas@correo.net', 'telefono' => '78012345'],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'Guillermo Méndez', 'dependencia' => 'Dirección de Recursos Humanos', 'descripcion' => '']],
                'detalles' => ['categoria' => 'concusion', 'fecha' => '2026-02-20', 'hora' => '16:30', 'lugar' => 'Oficina de Recursos Humanos'],
                'hechos' => 'El Director de Recursos Humanos me exigió el pago de Bs 2,000 para "agilizar" mi proceso de contratación como personal eventual. Me dijo que sin ese pago no se procesaría mi expediente. Entregué el dinero en su oficina y posteriormente fui contratado. Otros 3 compañeros en situación similar han denunciado el mismo patrón.',
                'pruebas' => [
                    ['tipo' => 'testigo', 'descripcion' => 'Compañero que también pagó', 'testigo_nombre' => 'Sergio Paredes', 'testigo_telefono' => '75612345'],
                    ['tipo' => 'archivo', 'descripcion' => 'Contrato firmado y constancia de pago', 'archivo_nombre' => 'contrato_personal.pdf'],
                ],
            ],
            [
                'ticket' => 'DEN-2026-0011',
                'token_consulta' => '1011',
                'tipo' => 'corrupcion', 'estado' => 'cerrada',
                'subestado' => null,
                'tecnico' => 'tec-1',
                'created_at' => (clone $now)->subDays(60)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(58)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(57)->toDateTimeString(),
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(58)->toDateTimeString(), 'accion' => 'admitida', 'detalle' => 'Admitida sin justificación', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(57)->toDateTimeString(), 'accion' => 'asignada', 'detalle' => 'Asignada a Carlos Quispe', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(55)->toDateTimeString(), 'accion' => 'investigacion', 'detalle' => 'Investigación iniciada', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(50)->toDateTimeString(), 'accion' => 'informe_redactado', 'detalle' => 'Informe Final redactado. Clasificación: penal. Fojas: 45', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(45)->toDateTimeString(), 'accion' => 'cierre_registrado', 'detalle' => 'Cierre registrado. SITPRECO: SIT-UML-CC1-2026-0501. Estado: cerrada', 'usuario' => 'sistema'],
                ],
                'informe_clasificacion' => 'penal',
                'informe_fojas' => 45,
                'informe_justificacion' => 'Se encontraron elementos suficientes que acreditan responsabilidad penal del denunciado. Se remite al Ministerio Público.',
                'informe_archivos' => [['nombre' => 'informe_final_0011.pdf', 'tamano' => '2.4 MB', 'fecha_subida' => (clone $now)->subDays(50)->toDateTimeString()]],
                'informe_redactado_at' => (clone $now)->subDays(50)->toDateTimeString(),
                'informe_concluido_por' => 'Carlos Quispe',
                'cierre_sitpreco' => 'SIT-UML-CC1-2026-0501',
                'cierre_notificado_denunciante' => true,
                'cierre_notificacion_medio' => 'email',
                'cierre_notificacion_fecha' => (clone $now)->subDays(45)->toDateTimeString(),
                'cierre_notificacion_descripcion' => 'Notificado al denunciante por correo electrónico con copia del acta de cierre.',
                'cierre_concluido_por' => 'Carlos Quispe',
                'cierre_descripcion' => 'Caso cerrado con remisión al Ministerio Público. Se adjunta documentación completa del expediente.',
                'cierre_archivos' => [['nombre' => 'acta_cierre_0011.pdf', 'tamano' => '1.1 MB', 'fecha_subida' => (clone $now)->subDays(45)->toDateTimeString()]],
                'cierre_cerrado_at' => (clone $now)->subDays(45)->toDateTimeString(),
                'denunciante' => ['nombres' => 'Carmen Illanes', 'ci' => '1122334', 'email' => 'cillanes@yahoo.es', 'telefono' => '71122334'],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'Félix Mendoza', 'dependencia' => 'Departamento de Obras Públicas', 'descripcion' => '']],
                'detalles' => ['categoria' => 'peculado', 'fecha' => '2026-01-10', 'hora' => '', 'lugar' => 'Obras Públicas GAMEA'],
                'hechos' => 'Se apropió indebidamente de materiales de construcción destinados a la reparación de aceras en el Distrito 5. Los materiales fueron vendidos a una ferretería particular. Existen facturas que demuestran la compra de materiales por parte del municipio que no fueron usados en las obras.',
                'pruebas' => [
                    ['tipo' => 'archivo', 'descripcion' => 'Facturas y registro de materiales', 'archivo_nombre' => 'facturas_materiales.pdf'],
                    ['tipo' => 'fisica', 'descripcion' => 'Notas de remisión internas'],
                ],
            ],
            [
                'ticket' => 'DEN-2026-0012',
                'token_consulta' => '1012',
                'tipo' => 'corrupcion', 'estado' => 'cerrada',
                'subestado' => 'archivada',
                'tecnico' => 'tec-2',
                'created_at' => (clone $now)->subDays(90)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(88)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(87)->toDateTimeString(),
                'bitacora' => [
                    ['fecha' => (clone $now)->subDays(88)->toDateTimeString(), 'accion' => 'admitida', 'detalle' => 'Admitida sin justificación', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(87)->toDateTimeString(), 'accion' => 'asignada', 'detalle' => 'Asignada a Ana Torres', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(85)->toDateTimeString(), 'accion' => 'investigacion', 'detalle' => 'Investigación iniciada', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(80)->toDateTimeString(), 'accion' => 'informe_redactado', 'detalle' => 'Informe Final redactado. Clasificación: archivado. Fojas: 12', 'usuario' => 'sistema'],
                    ['fecha' => (clone $now)->subDays(75)->toDateTimeString(), 'accion' => 'cierre_registrado', 'detalle' => 'Cierre registrado. SITPRECO: SIT-UML-CC1-2026-0302. Estado: cerrada', 'usuario' => 'sistema'],
                ],
                'informe_clasificacion' => 'archivado',
                'informe_fojas' => 12,
                'informe_justificacion' => 'No se encontraron elementos suficientes para determinar responsabilidad. Se archivan los antecedentes según Art. 27 de la Ley 974.',
                'informe_archivos' => [['nombre' => 'informe_final_0012.pdf', 'tamano' => '1.8 MB', 'fecha_subida' => (clone $now)->subDays(80)->toDateTimeString()]],
                'informe_redactado_at' => (clone $now)->subDays(80)->toDateTimeString(),
                'informe_concluido_por' => 'Ana Torres',
                'cierre_sitpreco' => 'SIT-UML-CC1-2026-0302',
                'cierre_notificado_denunciante' => false,
                'cierre_no_notificado_motivo' => 'Denunciante anónimo sin datos de contacto.',
                'cierre_concluido_por' => 'Ana Torres',
                'cierre_descripcion' => 'Caso archivado por falta de indicios. Se conservan antecedentes para futuras remisiones.',
                'cierre_archivos' => [['nombre' => 'acta_archivo_0012.pdf', 'tamano' => '0.9 MB', 'fecha_subida' => (clone $now)->subDays(75)->toDateTimeString()]],
                'cierre_cerrado_at' => (clone $now)->subDays(75)->toDateTimeString(),
                'escenario' => 'reservada',
                'denunciante' => ['nombres' => 'Hugo Ticona', 'ci' => '9988776', 'email' => 'hticona@mail.com', 'telefono' => '79887766'],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'Ramiro Castillo', 'dependencia' => 'Dirección de Tránsito', 'descripcion' => '']],
                'detalles' => ['categoria' => 'cohecho', 'fecha' => '2025-12-01', 'hora' => '08:00', 'lugar' => 'Dirección de Tránsito'],
                'hechos' => 'Solicitaba la renovación de mi licencia de conducir y el funcionario me ofreció "saltarme la fila" y no rendir el examen práctico por Bs 300. Acepté por la premura del tiempo. Luego supe que esto era una práctica común en esa oficina.',
                'pruebas' => [],
            ],
        ];
    }

    private static function makeDenuncia(): array
    {
        return [
            'ticket' => '',
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'denunciante' => ['nombres' => '', 'ci' => '', 'email' => '', 'telefono' => ''],
            'denunciados' => [],
            'detalles' => ['categoria' => 'otro', 'fecha' => '', 'hora' => '', 'lugar' => ''],
            'hechos' => '',
            'pruebas' => [],
            'declaracion_jurada' => true,
            'created_at' => '',
            'estado' => 'ingresada',
            'subestado' => null,
            'tecnico' => null,
            'fecha_admitida' => null,
            'fecha_asignada' => null,
            'justificacion_admision' => null,
            'justificacion_rechazo' => null,
            'fecha_rechazada' => null,
            'justificacion_traspaso' => null,
            'fecha_traspaso' => null,
            'tecnico_anterior' => null,
            'fecha_reapertura' => null,
            'justificacion_reapertura' => null,
            'plazo_reapertura' => null,
            'ampliaciones' => [],
            'bitacora' => [],
            'token_consulta' => '',
            'resumen_rechazo' => null,
            'informe_clasificacion' => null,
            'informe_fojas' => null,
            'informe_justificacion' => null,
            'informe_archivos' => [],
            'informe_redactado_at' => null,
            'informe_concluido_por' => null,
            'informe_ediciones' => [],
            'informe_eliminado' => false,
            'informe_fecha_eliminacion' => null,
            'cierre_sitpreco' => null,
            'cierre_notificado_denunciante' => null,
            'cierre_notificacion_medio' => null,
            'cierre_notificacion_fecha' => null,
            'cierre_notificacion_descripcion' => null,
            'cierre_no_notificado_motivo' => null,
            'cierre_concluido_por' => null,
            'cierre_descripcion' => null,
            'cierre_archivos' => [],
            'cierre_cerrado_at' => null,
            'cierre_ediciones' => [],
            'cierre_eliminado' => false,
            'cierre_fecha_eliminacion' => null,
        ];
    }
}
