<?php

namespace Database\Seeders;

use App\Models\Bitacora;
use App\Models\Cierre;
use App\Models\Denuncia;
use App\Models\DenunciaArchivo;
use App\Models\Denunciado;
use App\Models\Denunciante;
use App\Models\Descargo;
use App\Models\InformeFinal;
use App\Models\Prueba;
use App\Models\SolicitudInformacion;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DenunciaSeeder extends Seeder
{
    public function run(): void
    {
        $this->denuncia001();
        $this->denuncia002();
        $this->denuncia003();
        $this->denuncia004();
        $this->denuncia005();
        $this->denuncia006();
        $this->denuncia007();
        $this->denuncia008();
        $this->denuncia009();
        $this->denuncia010();
        $this->denuncia011();
        $this->denuncia012();
    }

    private function makeDenuncia(array $data, array $relations): Denuncia
    {
        $d = Denuncia::create($data);

        if (isset($relations['denunciante'])) {
            $d->denunciante()->create($relations['denunciante']);
        }

        if (isset($relations['denunciados'])) {
            foreach ($relations['denunciados'] as $dd) {
                $d->denunciados()->create($dd);
            }
        }

        if (isset($relations['pruebas'])) {
            foreach ($relations['pruebas'] as $p) {
                $d->pruebas()->create($p);
            }
        }

        if (isset($relations['solicitudes'])) {
            foreach ($relations['solicitudes'] as $s) {
                $d->solicitudes()->create($s);
            }
        }

        if (isset($relations['descargos'])) {
            foreach ($relations['descargos'] as $desc) {
                $d->descargos()->create($desc);
            }
        }

        if (isset($relations['informe'])) {
            $d->informe()->create($relations['informe']);
        }

        if (isset($relations['cierre'])) {
            $d->cierre()->create($relations['cierre']);
        }

        if (isset($relations['archivos'])) {
            foreach ($relations['archivos'] as $a) {
                $d->archivos()->create($a);
            }
        }

        if (isset($relations['bitacora'])) {
            foreach ($relations['bitacora'] as $b) {
                $d->bitacora()->create($b);
            }
        }

        return $d;
    }

    // DEN-2026-0001 — INGRESADA, CORRUPCIÓN
    private function denuncia001(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0001',
                'token_consulta' => '1001',
                'tipo' => 'corrupcion',
                'escenario' => 'revelada',
                'estado' => 'ingresada',
                'categoria_id' => 1,
                'fecha_hechos' => '2026-02-15',
                'lugar_hechos' => 'ALCALDÍA MUNICIPAL DE EL ALTO',
                'hechos' => 'EL SEÑOR JUAN PEREZ, FUNCIONARIO MUNICIPAL, HABRÍA SOLICITADO UNA RETRIBUCIÓN ECONÓMICA A CAMBIO DE ACELERAR UN PROCESO DE CONTRATACIÓN. EL DENUNCIANTE FUE CITADO EN LAS OFICINAS DE LA ALCALDÍA DONDE SE LE HIZO LA SOLICITUD.',
                'declaracion_jurada' => true,
                'registrado_por_id' => 2,
                'created_at' => '2026-02-16 08:30:00',
                'updated_at' => '2026-02-16 08:30:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'MARÍA RODRÍGUEZ',
                    'ci' => '1234567',
                    'email' => 'maria@email.com',
                    'telefono' => '71234567',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'JUAN PEREZ',
                        'dependencia' => 'ALCALDÍA DE EL ALTO - CONTRATACIONES',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'COPIA DEL MEMORÁNDUM DE SOLICITUD DE PAGO'],
                    ['tipo' => 'testigo', 'descripcion' => 'TESTIGO PRESENCIAL DE LA REUNIÓN', 'testigo_nombre' => 'PEDRO GARCÍA', 'testigo_telefono' => '71234568'],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0001',
                        'usuario_id' => 2,
                        'fecha' => '2026-02-16 08:30:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0002 — INGRESADA, NEGACIÓN
    private function denuncia002(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0002',
                'token_consulta' => '1002',
                'tipo' => 'negacion',
                'escenario' => 'anonimo',
                'estado' => 'ingresada',
                'categoria_id' => 11,
                'fecha_hechos' => '2026-03-10',
                'lugar_hechos' => 'OFICINAS DE RECURSOS HUMANOS',
                'hechos' => 'MEDIANTE CARTA DE FECHA 10 DE MARZO, EL CIUDADANO SOLICITÓ INFORMACIÓN SOBRE EL PROCESO DE CONVOCATORIA DE PERSONAL. A LA FECHA NO HA RECIBIDO RESPUESTA. HAN TRANSCURRIDO MÁS DE 30 DÍAS SIN PRONUNCIAMIENTO.',
                'declaracion_jurada' => true,
                'registrado_por_id' => 2,
                'created_at' => '2026-03-15 10:00:00',
                'updated_at' => '2026-03-15 10:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => null,
                    'ci' => null,
                    'email' => null,
                    'telefono' => null,
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => false,
                        'descripcion' => 'FUNCIONARIO DE RECURSOS HUMANOS DE LA ALCALDÍA, VARÓN DE APROXIMADAMENTE 40 AÑOS, COMPLEXIÓN MEDIANA, USABA TRAJE AZUL DURANTE LA ATENCIÓN',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'COPIA DE LA CARTA DE SOLICITUD DE INFORMACIÓN CON SELLO DE RECEPCIÓN'],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0002 EN MODO ANÓNIMO',
                        'usuario_id' => 2,
                        'fecha' => '2026-03-15 10:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0003 — INGRESADA, CORRUPCIÓN
    private function denuncia003(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0003',
                'token_consulta' => '1003',
                'tipo' => 'corrupcion',
                'escenario' => 'reservada',
                'estado' => 'ingresada',
                'categoria_id' => 7,
                'fecha_hechos' => '2026-04-01',
                'lugar_hechos' => 'MERCADO CENTRAL DE EL ALTO',
                'hechos' => 'SE DENUNCIA QUE RECAUDADORES DEL MERCADO CENTRAL ESTARÍAN COBRANDO MONTOS SUPERIORES A LOS AUTORIZADOS POR LA LEY MUNICIPAL, RETENIENDO LA DIFERENCIA PARA BENEFICIO PERSONAL.',
                'declaracion_jurada' => true,
                'registrado_por_id' => 2,
                'created_at' => '2026-04-05 09:15:00',
                'updated_at' => '2026-04-05 09:15:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'CARLOS LÓPEZ',
                    'ci' => '7654321',
                    'email' => 'carlos@email.com',
                    'telefono' => '71234569',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'ROBERTO FLORES',
                        'dependencia' => 'MERCADO CENTRAL - ADMINISTRACIÓN',
                    ],
                    [
                        'orden' => 1,
                        'conoce_identidad' => true,
                        'nombres' => 'MARTHA MENDOZA',
                        'dependencia' => 'MERCADO CENTRAL - RECAUDACIONES',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'RECIBOS DE PAGO ORIGINALES DE LOS ÚLTIMOS 3 MESES'],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0003 EN MODO RESERVADA',
                        'usuario_id' => 2,
                        'fecha' => '2026-04-05 09:15:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0004 — ADMITIDA, CORRUPCIÓN
    private function denuncia004(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0004',
                'token_consulta' => '1004',
                'tipo' => 'corrupcion',
                'escenario' => 'revelada',
                'estado' => 'admitida',
                'categoria_id' => 3,
                'fecha_hechos' => '2026-04-20',
                'lugar_hechos' => 'HOSPITAL MUNICIPAL EL ALTO',
                'hechos' => 'LA DENUNCIANTE FUE ATENDIDA EN EL HOSPITAL MUNICIPAL DONDE LE EXIGIERON UN PAGO EXTRAOFICIAL POR DEBAJO DE MESA PARA ACCEDER A UNA CIRUGÍA CON URGENCIA. EL PAGO FUE SOLICITADO POR LA ADMINISTRADORA DEL HOSPITAL.',
                'declaracion_jurada' => true,
                'registrado_por_id' => 2,
                'fecha_admitida' => '2026-04-25 14:00:00',
                'justificacion_admision' => 'LOS HECHOS DESCRITOS CONSTITUYEN PRESUNTOS ACTOS DE CORRUPCIÓN EN EL SECTOR SALUD',
                'created_at' => '2026-04-22 11:00:00',
                'updated_at' => '2026-04-25 14:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'SOFÍA RAMÍREZ',
                    'ci' => '9876543',
                    'email' => 'sofia@email.com',
                    'telefono' => '71234570',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'ELENA VARGAS',
                        'dependencia' => 'HOSPITAL MUNICIPAL EL ALTO - ADMINISTRACIÓN',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'FOTO DEL MONTO EXIGIDO ESCRITO EN UN PAPEL'],
                    ['tipo' => 'testigo', 'descripcion' => 'OTRO PACIENTE QUE PRESENCIÓ LA SOLICITUD', 'testigo_nombre' => 'MARTA SUÁREZ', 'testigo_telefono' => '71234571'],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0004',
                        'usuario_id' => 2,
                        'fecha' => '2026-04-22 11:00:00',
                    ],
                    [
                        'accion' => 'admitida',
                        'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-04-25 14:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0005 — RECHAZADA, CORRUPCIÓN
    private function denuncia005(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0005',
                'token_consulta' => '1005',
                'tipo' => 'corrupcion',
                'escenario' => 'revelada',
                'estado' => 'rechazada',
                'categoria_id' => 10,
                'fecha_hechos' => '2026-05-05',
                'lugar_hechos' => 'OFICINA DE ATENCIÓN AL CIUDADANO',
                'hechos' => 'EL DENUNCIANTE REPORTA QUE UN FUNCIONARIO LE NEGÓ LA ATENCIÓN POR NO CONTRATAR UN SERVICIO DE ASESORAMIENTO OFRECIDO POR UN TERCERO EN LAS INSTALACIONES.',
                'declaracion_jurada' => true,
                'registrado_por_id' => 2,
                'fecha_rechazada' => '2026-05-10 16:00:00',
                'justificacion_rechazo' => 'LOS HECHOS NO CONSTITUYEN ACTOS DE CORRUPCIÓN EN LOS TÉRMINOS DE LA LEY N° 974',
                'resumen_rechazo' => 'LOS HECHOS DESCRITOS NO CORRESPONDEN A ACTOS DE CORRUPCIÓN SEGÚN LA LEY 974',
                'created_at' => '2026-05-07 08:00:00',
                'updated_at' => '2026-05-10 16:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'LUIS TORRES',
                    'ci' => '4567890',
                    'email' => 'luis@email.com',
                    'telefono' => '71234572',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'FERNANDO GUTIÉRREZ',
                        'dependencia' => 'OFICINA DE ATENCIÓN AL CIUDADANO',
                    ],
                ],
                'pruebas' => [],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0005',
                        'usuario_id' => 2,
                        'fecha' => '2026-05-07 08:00:00',
                    ],
                    [
                        'accion' => 'rechazada',
                        'detalle' => 'DENUNCIA RECHAZADA POR NO CONSTITUIR ACTO DE CORRUPCIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-05-10 16:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0006 — ASIGNADA, CORRUPCIÓN (técnico1)
    private function denuncia006(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0006',
                'token_consulta' => '1006',
                'tipo' => 'corrupcion',
                'escenario' => 'revelada',
                'estado' => 'asignada',
                'categoria_id' => 6,
                'fecha_hechos' => '2026-05-20',
                'lugar_hechos' => 'DIRECCIÓN DE OBRAS PÚBLICAS',
                'hechos' => 'SE DENUNCIA QUE EL DIRECTOR DE OBRAS PÚBLICAS HABRÍA FAVORECIDO A UNA EMPRESA CONSTRUCTORA CON LA ADJUDICACIÓN DIRECTA DE UNA OBRA A CAMBIO DE BENEFICIOS PERSONALES.',
                'declaracion_jurada' => true,
                'tecnico_id' => 3,
                'registrado_por_id' => 2,
                'fecha_admitida' => '2026-05-25 09:00:00',
                'justificacion_admision' => 'EXISTEN INDICIOS SUFICIENTES DE ACTOS DE CORRUPCIÓN EN CONTRATACIÓN',
                'fecha_asignada' => '2026-05-26 10:00:00',
                'created_at' => '2026-05-22 10:30:00',
                'updated_at' => '2026-05-26 10:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'ANA BELÉN CASTRO',
                    'ci' => '1122334',
                    'email' => 'ana@email.com',
                    'telefono' => '71234573',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'ALBERTO MORALES',
                        'dependencia' => 'DIRECCIÓN DE OBRAS PÚBLICAS',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'COPIA DE LA RESOLUCIÓN DE ADJUDICACIÓN DIRECTA'],
                    ['tipo' => 'testigo', 'descripcion' => 'FUNCIONARIO QUE CONOCE DEL FAVORECIMIENTO', 'testigo_nombre' => 'JOSÉ LUIS PAREDES', 'testigo_telefono' => '71234574'],
                ],
                'archivos' => [
                    [
                        'usuario_id' => 3,
                        'nombre' => 'resolucion_adjudicacion.pdf',
                        'path' => 'archivos/demo/DEN-2026-0006/resolucion_adjudicacion.pdf',
                        'tamano' => '1.2 MB',
                        'mime_type' => 'application/pdf',
                        'contexto' => 'registro',
                        'fecha_subida' => '2026-05-27 09:00:00',
                    ],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0006',
                        'usuario_id' => 2,
                        'fecha' => '2026-05-22 10:30:00',
                    ],
                    [
                        'accion' => 'admitida',
                        'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-05-25 09:00:00',
                    ],
                    [
                        'accion' => 'asignada',
                        'detalle' => 'DENUNCIA ASIGNADA A CARLOS QUISPE',
                        'usuario_id' => 1,
                        'fecha' => '2026-05-26 10:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0007 — ASIGNADA, NEGACIÓN (técnico2)
    private function denuncia007(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0007',
                'token_consulta' => '1007',
                'tipo' => 'negacion',
                'escenario' => 'revelada',
                'estado' => 'asignada',
                'categoria_id' => 11,
                'fecha_hechos' => '2026-06-01',
                'lugar_hechos' => 'UNIDAD DE SISTEMAS GAMEA',
                'hechos' => 'EL DENUNCIANTE SOLICITÓ INFORMACIÓN SOBRE EL PRESUPUESTO DE SISTEMAS CORRESPONDIENTE A LA GESTIÓN 2025. LA UNIDAD DE SISTEMAS SE NEGÓ A PROPORCIONARLA ALEGANDO CONFIDENCIALIDAD.',
                'declaracion_jurada' => true,
                'tecnico_id' => 4,
                'registrado_por_id' => 2,
                'fecha_admitida' => '2026-06-06 11:00:00',
                'justificacion_admision' => 'LA NEGACIÓN DE INFORMACIÓN CONSTITUYE PRESUNTA INFRACCIÓN A LA LEY 974',
                'fecha_asignada' => '2026-06-07 09:00:00',
                'created_at' => '2026-06-03 08:00:00',
                'updated_at' => '2026-06-07 09:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'RAÚL MONTAÑO',
                    'ci' => '9988776',
                    'email' => 'raul@email.com',
                    'telefono' => '71234575',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'SILVIA ANDRADE',
                        'dependencia' => 'UNIDAD DE SISTEMAS GAMEA',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'CARTA DE SOLICITUD DE INFORMACIÓN CON NEGATIVA ESCRITA'],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0007',
                        'usuario_id' => 2,
                        'fecha' => '2026-06-03 08:00:00',
                    ],
                    [
                        'accion' => 'admitida',
                        'detalle' => 'DENUNCIA ADMITIDA POR NEGACIÓN DE INFORMACIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-06-06 11:00:00',
                    ],
                    [
                        'accion' => 'asignada',
                        'detalle' => 'DENUNCIA ASIGNADA A ANA TORRES',
                        'usuario_id' => 1,
                        'fecha' => '2026-06-07 09:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0008 — INVESTIGACION, CORRUPCIÓN (técnico1, con solicitudes)
    private function denuncia008(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0008',
                'token_consulta' => '1008',
                'tipo' => 'corrupcion',
                'escenario' => 'revelada',
                'estado' => 'investigacion',
                'categoria_id' => 2,
                'fecha_hechos' => '2026-05-15',
                'lugar_hechos' => 'DIRECCIÓN DE INGRESOS MUNICIPALES',
                'hechos' => 'SE DENUNCIA LA EXIGENCIA DE PAGOS EXTRAOFICIALES POR PARTE DE FUNCIONARIOS DE LA DIRECCIÓN DE INGRESOS MUNICIPALES PARA LA EMISIÓN DE LICENCIAS DE FUNCIONAMIENTO.',
                'declaracion_jurada' => true,
                'tecnico_id' => 3,
                'registrado_por_id' => 2,
                'fecha_admitida' => '2026-05-20 10:00:00',
                'justificacion_admision' => 'HAY ELEMENTOS DE JUICIO SUFICIENTES PARA INVESTIGAR',
                'fecha_asignada' => '2026-05-21 11:00:00',
                'created_at' => '2026-05-17 09:00:00',
                'updated_at' => '2026-05-21 11:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'GABRIELA ROJAS',
                    'ci' => '5544332',
                    'email' => 'gabriela@email.com',
                    'telefono' => '71234576',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'HÉCTOR MAMANI',
                        'dependencia' => 'DIRECCIÓN DE INGRESOS MUNICIPALES',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'COMPROBANTE DE PAGO EXTRAOFICIAL Bs 500'],
                    ['tipo' => 'testigo', 'descripcion' => 'OTRO COMERCIANTE AFECTADO', 'testigo_nombre' => 'JUAN CARLOS MAMANI', 'testigo_telefono' => '71234577'],
                ],
                'solicitudes' => [
                    [
                        'dependencia_destino_id' => 1,
                        'detalle' => 'SOLICITUD DE INFORMACIÓN SOBRE EL LISTADO DE LICENCIAS DE FUNCIONAMIENTO EMITIDAS EN LA GESTIÓN 2026',
                        'plazo_dias' => 10,
                        'fecha_envio' => '2026-05-28 09:00:00',
                        'fecha_vencimiento' => '2026-06-11 09:00:00',
                        'estado' => 'respondida',
                        'fecha_respuesta' => '2026-06-08 15:00:00',
                        'respuesta' => 'SE ADJUNTA LISTADO COMPLETO DE LICENCIAS DE FUNCIONAMIENTO EMITIDAS EN LA GESTIÓN 2026',
                    ],
                    [
                        'dependencia_destino_id' => 2,
                        'detalle' => 'SOLICITUD DE INFORMACIÓN SOBRE CONTRATACIONES DE LA DIRECCIÓN DE INGRESOS',
                        'plazo_dias' => 10,
                        'fecha_envio' => '2026-06-01 09:00:00',
                        'fecha_vencimiento' => '2026-06-15 09:00:00',
                        'estado' => 'pendiente',
                    ],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0008',
                        'usuario_id' => 2,
                        'fecha' => '2026-05-17 09:00:00',
                    ],
                    [
                        'accion' => 'admitida',
                        'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-05-20 10:00:00',
                    ],
                    [
                        'accion' => 'asignada',
                        'detalle' => 'DENUNCIA ASIGNADA A CARLOS QUISPE',
                        'usuario_id' => 1,
                        'fecha' => '2026-05-21 11:00:00',
                    ],
                    [
                        'accion' => 'investigacion',
                        'detalle' => 'INVESTIGACIÓN INICIADA',
                        'usuario_id' => 3,
                        'fecha' => '2026-05-28 09:00:00',
                    ],
                    [
                        'accion' => 'solicitud_creada',
                        'detalle' => 'SOLICITUD DE INFORMACIÓN A UNIDAD DE SISTEMAS',
                        'usuario_id' => 3,
                        'fecha' => '2026-05-28 09:00:00',
                    ],
                    [
                        'accion' => 'solicitud_creada',
                        'detalle' => 'SOLICITUD DE INFORMACIÓN A UNIDAD DE ADQUISICIONES',
                        'usuario_id' => 3,
                        'fecha' => '2026-06-01 09:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0009 — INVESTIGACION, CORRUPCIÓN (técnico2, con descargos)
    private function denuncia009(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0009',
                'token_consulta' => '1009',
                'tipo' => 'corrupcion',
                'escenario' => 'revelada',
                'estado' => 'investigacion',
                'categoria_id' => 4,
                'fecha_hechos' => '2026-06-10',
                'lugar_hechos' => 'SECRETARÍA GENERAL GAMEA',
                'hechos' => 'SE DENUNCIA QUE UN FUNCIONARIO DE LA SECRETARÍA GENERAL HABRÍA REALIZADO NEGOCIACIONES INCOMPATIBLES CON SU CARGO, FAVORECIENDO A UNA EMPRESA DE SU CÓNYUGE EN PROCESOS DE CONTRATACIÓN.',
                'declaracion_jurada' => true,
                'tecnico_id' => 4,
                'registrado_por_id' => 2,
                'fecha_admitida' => '2026-06-16 09:00:00',
                'justificacion_admision' => 'LOS HECHOS PRESENTAN INDICIOS DE NEGOCIACIONES INCOMPATIBLES',
                'fecha_asignada' => '2026-06-17 10:00:00',
                'created_at' => '2026-06-13 11:00:00',
                'updated_at' => '2026-06-17 10:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'DIEGO VELASCO',
                    'ci' => '3322110',
                    'email' => 'diego@email.com',
                    'telefono' => '71234578',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'MARCELO SOLIZ',
                        'dependencia' => 'SECRETARÍA GENERAL GAMEA',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'CONTRATOS FIRMADOS CON LA EMPRESA RELACIONADA'],
                ],
                'descargos' => [
                    [
                        'denunciado_id' => 10,
                        'fecha_notificacion' => '2026-06-20 10:00:00',
                        'medio' => 'CÉDULA DE NOTIFICACIÓN N° 234/2026',
                        'fecha_vencimiento' => '2026-07-04 10:00:00',
                        'fecha_respuesta' => '2026-06-30 16:00:00',
                        'resumen_descargo' => 'EL DENUNCIADO PRESENTÓ DOCUMENTACIÓN QUE DEMUESTRA QUE LA CONTRATACIÓN SIGUIÓ LOS PROCEDIMIENTOS ESTABLECIDOS',
                        'estado' => 'respondido',
                    ],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0009',
                        'usuario_id' => 2,
                        'fecha' => '2026-06-13 11:00:00',
                    ],
                    [
                        'accion' => 'admitida',
                        'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-06-16 09:00:00',
                    ],
                    [
                        'accion' => 'asignada',
                        'detalle' => 'DENUNCIA ASIGNADA A ANA TORRES',
                        'usuario_id' => 1,
                        'fecha' => '2026-06-17 10:00:00',
                    ],
                    [
                        'accion' => 'investigacion',
                        'detalle' => 'INVESTIGACIÓN INICIADA',
                        'usuario_id' => 4,
                        'fecha' => '2026-06-20 10:00:00',
                    ],
                    [
                        'accion' => 'descargo_notificado',
                        'detalle' => 'DESCARGO NOTIFICADO A MARCELO SOLIZ POR CÉDULA N° 234/2026',
                        'usuario_id' => 4,
                        'fecha' => '2026-06-20 10:00:00',
                    ],
                    [
                        'accion' => 'descargo_respondido',
                        'detalle' => 'DESCARGO RESPONDIDO POR MARCELO SOLIZ',
                        'usuario_id' => 4,
                        'fecha' => '2026-06-30 16:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0010 — INFORME, CORRUPCIÓN (técnico3)
    private function denuncia010(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0010',
                'token_consulta' => '1010',
                'tipo' => 'corrupcion',
                'escenario' => 'revelada',
                'estado' => 'informe',
                'categoria_id' => 5,
                'fecha_hechos' => '2026-06-01',
                'lugar_hechos' => 'UNIDAD DE ADQUISICIONES GAMEA',
                'hechos' => 'SE DENUNCIA QUE LA JEFA DE ADQUISICIONES HABRÍA ADQUIRIDO EQUIPAMIENTO A SOBREPRECIO, GENERANDO UN BENEFICIO ECONÓMICO A LA PROVEEDORA.',
                'declaracion_jurada' => true,
                'tecnico_id' => 5,
                'registrado_por_id' => 2,
                'fecha_admitida' => '2026-06-06 10:00:00',
                'justificacion_admision' => 'HAY ELEMENTOS SUFICIENTES PARA INICIAR INVESTIGACIÓN',
                'fecha_asignada' => '2026-06-07 11:00:00',
                'created_at' => '2026-06-03 08:30:00',
                'updated_at' => '2026-07-01 14:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'PAOLA ZENTENO',
                    'ci' => '6677889',
                    'email' => 'paola@email.com',
                    'telefono' => '71234579',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'PATRICIA FLORES',
                        'dependencia' => 'UNIDAD DE ADQUISICIONES GAMEA',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'COTIZACIONES COMPARATIVAS QUE DEMUESTRAN EL SOBREPRECIO'],
                    ['tipo' => 'testigo', 'descripcion' => 'EX FUNCIONARIO DE ADQUISICIONES', 'testigo_nombre' => 'ALVARO RIVERA', 'testigo_telefono' => '71234580'],
                ],
                'informe' => [
                    'clasificacion' => 'administrativo',
                    'fojas' => 45,
                    'justificacion' => 'SE HA VERIFICADO QUE EXISTE UN SOBREPRECIO EN LA ADQUISICIÓN DE EQUIPAMIENTO DE CÓMPUTO POR UN MONTO ESTIMADO DE BS 45,000. SE RECOMIENDA REMITIR A LA MAE PARA ACCIONES ADMINISTRATIVAS.',
                    'concluido_por' => 'LUIS MAMANI',
                    'redactado_at' => '2026-07-01 14:00:00',
                ],
                'solicitudes' => [
                    [
                        'dependencia_destino_id' => 2,
                        'detalle' => 'SOLICITUD DE INFORMACIÓN SOBRE PROCESO DE ADQUISICIÓN',
                        'plazo_dias' => 10,
                        'fecha_envio' => '2026-06-10 09:00:00',
                        'fecha_vencimiento' => '2026-06-24 09:00:00',
                        'estado' => 'respondida',
                        'fecha_respuesta' => '2026-06-20 15:00:00',
                        'respuesta' => 'SE ADJUNTA EXPEDIENTE COMPLETO DE LA ADQUISICIÓN',
                    ],
                    [
                        'dependencia_destino_id' => 10,
                        'detalle' => 'SOLICITUD DE INFORMACIÓN SOBRE FLUJO DE PAGO',
                        'plazo_dias' => 10,
                        'fecha_envio' => '2026-06-15 09:00:00',
                        'fecha_vencimiento' => '2026-06-29 09:00:00',
                        'estado' => 'respondida',
                        'fecha_respuesta' => '2026-06-25 12:00:00',
                        'respuesta' => 'SE ADJUNTA REGISTRO DE PAGOS',
                    ],
                ],
                'descargos' => [
                    [
                        'denunciado_id' => 11,
                        'fecha_notificacion' => '2026-06-12 10:00:00',
                        'medio' => 'NOTIFICACIÓN PERSONAL',
                        'fecha_vencimiento' => '2026-06-26 10:00:00',
                        'estado' => 'pendiente_notif',
                    ],
                ],
                'archivos' => [
                    [
                        'usuario_id' => 5,
                        'nombre' => 'EXPEDIENTE_COMPLETO.PDF',
                        'path' => 'archivos/demo/DEN-2026-0010/expediente.pdf',
                        'tamano' => '5.8 MB',
                        'mime_type' => 'application/pdf',
                        'contexto' => 'informe',
                        'fecha_subida' => '2026-07-01 15:00:00',
                    ],
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0010',
                        'usuario_id' => 2,
                        'fecha' => '2026-06-03 08:30:00',
                    ],
                    [
                        'accion' => 'admitida',
                        'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-06-06 10:00:00',
                    ],
                    [
                        'accion' => 'asignada',
                        'detalle' => 'DENUNCIA ASIGNADA A LUIS MAMANI',
                        'usuario_id' => 1,
                        'fecha' => '2026-06-07 11:00:00',
                    ],
                    [
                        'accion' => 'investigacion',
                        'detalle' => 'INVESTIGACIÓN INICIADA',
                        'usuario_id' => 5,
                        'fecha' => '2026-06-10 09:00:00',
                    ],
                    [
                        'accion' => 'informe_redactado',
                        'detalle' => 'INFORME FINAL REDACTADO CON CLASIFICACIÓN ADMINISTRATIVO',
                        'usuario_id' => 5,
                        'fecha' => '2026-07-01 14:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0011 — CERRADA, NEGACIÓN (técnico3)
    private function denuncia011(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0011',
                'token_consulta' => '1011',
                'tipo' => 'negacion',
                'escenario' => 'revelada',
                'estado' => 'cerrada',
                'categoria_id' => 11,
                'fecha_hechos' => '2026-03-05',
                'lugar_hechos' => 'UNIDAD DE CATASTRO',
                'hechos' => 'EL DENUNCIANTE SOLICITÓ INFORMACIÓN OFICIAL SOBRE PLANOS CATASTRALES DE SU PROPIEDAD. LA UNIDAD DE CATASTRO SE NEGÓ SISTEMÁTICAMENTE A PROPORCIONAR LA INFORMACIÓN ALEGANDO QUE LOS PLANOS ESTABAN EN DIGITALIZACIÓN.',
                'declaracion_jurada' => true,
                'tecnico_id' => 5,
                'registrado_por_id' => 2,
                'fecha_admitida' => '2026-03-10 10:00:00',
                'justificacion_admision' => 'LA NEGACIÓN DE INFORMACIÓN ES PRESUNTA INFRACCIÓN A LA LEY 974',
                'fecha_asignada' => '2026-03-11 11:00:00',
                'created_at' => '2026-03-08 09:00:00',
                'updated_at' => '2026-05-15 16:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'ROSA MARÍA FLORES',
                    'ci' => '4455667',
                    'email' => 'rosa@email.com',
                    'telefono' => '71234581',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'VÍCTOR HUGO SÁNCHEZ',
                        'dependencia' => 'UNIDAD DE CATASTRO',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'SOLICITUD FORMAL CON SELLO DE RECEPCIÓN Y NEGATIVA'],
                ],
                'informe' => [
                    'clasificacion' => 'administrativo',
                    'sitpreco' => 'SIT-2026-011',
                    'fojas' => 30,
                    'justificacion' => 'SE VERIFICÓ QUE LA UNIDAD DE CATASTRO NEGÓ INFORMACIÓN PÚBLICA SIN CAUSA LEGAL. SE RECOMIENDA REMITIR A LA MAE.',
                    'concluido_por' => 'LUIS MAMANI',
                    'redactado_at' => '2026-05-10 14:00:00',
                ],
                'cierre' => [
                    'notificado_denunciante' => true,
                    'notificacion_medio' => 'NOTIFICACIÓN PERSONAL EN OFICINAS',
                    'notificacion_fecha' => '2026-05-15 10:00:00',
                    'notificacion_descripcion' => 'SE NOTIFICÓ A LA DENUNCIANTE SOBRE EL CIERRE DEL CASO',
                    'concluido_por' => 'LUIS MAMANI',
                    'descripcion' => 'SE CERRÓ EL CASO CON CLASIFICACIÓN ADMINISTRATIVO. SE REMITIRÁ A LA MAE PARA LAS ACCIONES CORRESPONDIENTES.',
                    'cerrado_at' => '2026-05-15 16:00:00',
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0011',
                        'usuario_id' => 2,
                        'fecha' => '2026-03-08 09:00:00',
                    ],
                    [
                        'accion' => 'admitida',
                        'detalle' => 'DENUNCIA ADMITIDA POR NEGACIÓN DE INFORMACIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-03-10 10:00:00',
                    ],
                    [
                        'accion' => 'asignada',
                        'detalle' => 'DENUNCIA ASIGNADA A LUIS MAMANI',
                        'usuario_id' => 1,
                        'fecha' => '2026-03-11 11:00:00',
                    ],
                    [
                        'accion' => 'investigacion',
                        'detalle' => 'INVESTIGACIÓN INICIADA',
                        'usuario_id' => 5,
                        'fecha' => '2026-03-15 09:00:00',
                    ],
                    [
                        'accion' => 'informe_redactado',
                        'detalle' => 'INFORME FINAL REDACTADO',
                        'usuario_id' => 5,
                        'fecha' => '2026-05-10 14:00:00',
                    ],
                    [
                        'accion' => 'cierre_registrado',
                        'detalle' => 'CIERRE REGISTRADO CON CLASIFICACIÓN ADMINISTRATIVO',
                        'usuario_id' => 5,
                        'fecha' => '2026-05-15 16:00:00',
                    ],
                ],
            ]
        );
    }

    // DEN-2026-0012 — CERRADA (ARCHIVADA), CORRUPCIÓN (técnico1)
    private function denuncia012(): void
    {
        $this->makeDenuncia(
            [
                'ticket' => 'DEN-2026-0012',
                'token_consulta' => '1012',
                'tipo' => 'corrupcion',
                'escenario' => 'revelada',
                'estado' => 'cerrada',
                'subestado' => 'archivada',
                'categoria_id' => 8,
                'fecha_hechos' => '2026-02-10',
                'lugar_hechos' => 'MERCADO CENTRAL',
                'hechos' => 'SE DENUNCIÓ QUE FUNCIONARIOS MUNICIPALES COBRABAN CUOTAS EXTRAOFICIALES A COMERCIANTES DEL MERCADO CENTRAL POR ASIGNACIÓN DE PUESTOS.',
                'declaracion_jurada' => true,
                'tecnico_id' => 3,
                'registrado_por_id' => 2,
                'fecha_admitida' => '2026-02-14 10:00:00',
                'justificacion_admision' => 'EXISTEN INDICIOS DE ACTOS DE CORRUPCIÓN',
                'fecha_asignada' => '2026-02-15 11:00:00',
                'created_at' => '2026-02-12 09:00:00',
                'updated_at' => '2026-04-10 16:00:00',
            ],
            [
                'denunciante' => [
                    'nombres' => 'HUGO MAMANI',
                    'ci' => '2233445',
                    'email' => 'hugo@email.com',
                    'telefono' => '71234582',
                ],
                'denunciados' => [
                    [
                        'orden' => 0,
                        'conoce_identidad' => true,
                        'nombres' => 'JOSÉ LUIS QUISBERT',
                        'dependencia' => 'MERCADO CENTRAL - ADMINISTRACIÓN',
                    ],
                ],
                'pruebas' => [
                    ['tipo' => 'fisica', 'descripcion' => 'REGISTRO DE PAGOS MENSUALES REALIZADOS DURANTE 6 MESES'],
                ],
                'informe' => [
                    'clasificacion' => 'sin_indicios',
                    'fojas' => 25,
                    'justificacion' => 'NO SE PUDIERON VERIFICAR LOS HECHOS DENUNCIADOS. LOS TESTIGOS NO RATIFICARON LA DENUNCIA Y NO SE ENCONTRARON REGISTROS CONTABLES QUE ACREDITEN LOS PAGOS.',
                    'concluido_por' => 'CARLOS QUISPE',
                    'redactado_at' => '2026-04-05 14:00:00',
                ],
                'cierre' => [
                    'notificado_denunciante' => true,
                    'notificacion_medio' => 'EMAIL',
                    'notificacion_fecha' => '2026-04-10 10:00:00',
                    'notificacion_descripcion' => 'SE NOTIFICÓ AL DENUNCIANTE SOBRE EL ARCHIVO DEL CASO',
                    'concluido_por' => 'CARLOS QUISPE',
                    'descripcion' => 'CASO ARCHIVADO POR NO ENCONTRARSE INDICIOS SUFICIENTES DE ACTOS DE CORRUPCIÓN',
                    'cerrado_at' => '2026-04-10 16:00:00',
                ],
                'bitacora' => [
                    [
                        'accion' => 'ingresada',
                        'detalle' => 'DENUNCIA REGISTRADA CON TICKET DEN-2026-0012',
                        'usuario_id' => 2,
                        'fecha' => '2026-02-12 09:00:00',
                    ],
                    [
                        'accion' => 'admitida',
                        'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACIÓN',
                        'usuario_id' => 1,
                        'fecha' => '2026-02-14 10:00:00',
                    ],
                    [
                        'accion' => 'asignada',
                        'detalle' => 'DENUNCIA ASIGNADA A CARLOS QUISPE',
                        'usuario_id' => 1,
                        'fecha' => '2026-02-15 11:00:00',
                    ],
                    [
                        'accion' => 'investigacion',
                        'detalle' => 'INVESTIGACIÓN INICIADA',
                        'usuario_id' => 3,
                        'fecha' => '2026-02-20 09:00:00',
                    ],
                    [
                        'accion' => 'informe_redactado',
                        'detalle' => 'INFORME FINAL REDACTADO CON CLASIFICACIÓN SIN INDICIOS',
                        'usuario_id' => 3,
                        'fecha' => '2026-04-05 14:00:00',
                    ],
                    [
                        'accion' => 'cierre_registrado',
                        'detalle' => 'CASO CERRADO Y ARCHIVADO POR SIN INDICIOS',
                        'usuario_id' => 3,
                        'fecha' => '2026-04-10 16:00:00',
                    ],
                ],
            ]
        );
    }
}
