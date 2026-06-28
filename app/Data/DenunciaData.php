<?php

namespace App\Data;

use Carbon\Carbon;

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

    public static function admitir(string $ticket, ?string $justificacion): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket) {
                $denuncias[$i]['estado'] = 'admitida';
                $denuncias[$i]['fecha_admitida'] = now()->toDateTimeString();
                $denuncias[$i]['justificacion_admision'] = $justificacion;
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
    }

    public static function rechazar(string $ticket, string $justificacion): bool
    {
        $denuncias = self::getAll();
        foreach ($denuncias as $i => $d) {
            if (($d['ticket'] ?? '') === $ticket) {
                $denuncias[$i]['estado'] = 'rechazada';
                $denuncias[$i]['justificacion_rechazo'] = $justificacion;
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
                session()->put(self::SESSION_KEY, $denuncias);
                return true;
            }
        }
        return false;
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

        $plazoTotal = self::getPlazoDias($denuncia['tipo']);
        $created = Carbon::parse($denuncia['created_at']);
        $diasTranscurridos = (int) $created->diffInDays(now(), false);
        $diasRestantes = $plazoTotal - $diasTranscurridos;

        if ($diasRestantes > 5)  return ['dias_restantes' => $diasRestantes, 'color' => 'green'];
        if ($diasRestantes >= 1) return ['dias_restantes' => $diasRestantes, 'color' => 'yellow'];
        return ['dias_restantes' => $diasRestantes, 'color' => 'red'];
    }

    public static function getPlazoDias(string $tipo): int
    {
        return match ($tipo) {
            'corrupcion' => 45,
            'negacion'   => 20,
            default      => 0,
        };
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
    }

    private static function buildSeedItems(): array
    {
        $now = now();

        return [
            [
                'ticket' => 'DEN-2026-0001',
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
                'tipo' => 'corrupcion', 'estado' => 'admitida',
                'created_at' => (clone $now)->subDays(20)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(18)->toDateTimeString(),
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
                'tipo' => 'negacion', 'estado' => 'rechazada',
                'created_at' => (clone $now)->subDays(10)->toDateTimeString(),
                'justificacion_rechazo' => 'La denuncia no especifica el periodo en que ocurrieron los hechos ni proporciona datos suficientes del presunto responsable. Se invita al denunciante a subsanar las omisiones y presentar una nueva denuncia según Art. 22 §III de la Ley 974.',
                'denunciante' => ['nombres' => 'Martha Loza', 'ci' => '5678901', 'email' => 'mloza@yahoo.com', 'telefono' => '75678901'],
                'denunciados' => [['conoce_identidad' => false, 'nombres' => '', 'dependencia' => '', 'descripcion' => 'Funcionario de la Unidad de Catastro, sexo masculino, contextura delgada']],
                'detalles' => ['categoria' => 'otro', 'fecha' => '2026-05-01', 'hora' => '', 'lugar' => 'Unidad de Catastro'],
                'hechos' => 'Fui a la Unidad de Catastro a solicitar un plano y el funcionario me atendió de mala manera diciendo que "vuelva mañana". Esto pasó varias veces. Quiero que tomen cartas en el asunto.',
                'pruebas' => [],
            ],
            [
                'ticket' => 'DEN-2026-0006',
                'tipo' => 'corrupcion', 'estado' => 'asignada',
                'tecnico' => 'tec-1',
                'created_at' => (clone $now)->subDays(5)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(4)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(3)->toDateTimeString(),
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
                'tipo' => 'negacion', 'estado' => 'asignada',
                'tecnico' => 'tec-2',
                'created_at' => (clone $now)->subDays(16)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(14)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(13)->toDateTimeString(),
                'denunciante' => ['nombres' => 'Alberto Ríos', 'ci' => '8901234', 'email' => 'arios@hotmail.com', 'telefono' => '79012345'],
                'denunciados' => [['conoce_identidad' => true, 'nombres' => 'Sonia Fernández', 'dependencia' => 'Oficina de Información y Quejas', 'descripcion' => '']],
                'detalles' => ['categoria' => 'omision', 'fecha' => '2026-04-01', 'hora' => '09:30', 'lugar' => 'Oficina de Información'],
                'hechos' => 'Solicité información sobre el estado de mi trámite de licencia de funcionamiento mediante carta con fecha 01/04/2026 con número de registro REG-2026-0891. A la fecha no he recibido ninguna respuesta. He acudido personalmente 4 veces y siempre me dicen que "la encargada no está" o "está en reunión".',
                'pruebas' => [],
            ],
            [
                'ticket' => 'DEN-2026-0008',
                'tipo' => 'corrupcion', 'estado' => 'investigacion',
                'tecnico' => 'tec-1',
                'created_at' => (clone $now)->subDays(40)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(38)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(37)->toDateTimeString(),
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
                'tipo' => 'negacion', 'estado' => 'investigacion',
                'tecnico' => 'tec-2',
                'created_at' => (clone $now)->subDays(22)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(20)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(19)->toDateTimeString(),
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
                'tipo' => 'corrupcion', 'estado' => 'informe',
                'tecnico' => 'tec-1',
                'created_at' => (clone $now)->subDays(33)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(31)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(30)->toDateTimeString(),
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
                'tipo' => 'corrupcion', 'estado' => 'cerrada',
                'subestado' => null,
                'tecnico' => 'tec-1',
                'created_at' => (clone $now)->subDays(60)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(58)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(57)->toDateTimeString(),
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
                'tipo' => 'corrupcion', 'estado' => 'cerrada',
                'subestado' => 'archivada',
                'tecnico' => 'tec-2',
                'created_at' => (clone $now)->subDays(90)->toDateTimeString(),
                'fecha_admitida' => (clone $now)->subDays(88)->toDateTimeString(),
                'fecha_asignada' => (clone $now)->subDays(87)->toDateTimeString(),
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
        ];
    }
}
