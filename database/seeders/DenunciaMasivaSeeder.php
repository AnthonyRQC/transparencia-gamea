<?php

namespace Database\Seeders;

use App\Helpers\DiasHabiles;
use App\Models\Ampliacion;
use App\Models\Cierre;
use App\Models\Clasificacion;
use App\Models\ConfiguracionSistema;
use App\Models\Denuncia;
use App\Models\Denunciado;
use App\Models\Denunciante;
use App\Models\DependenciaExterna;
use App\Models\Descargo;
use App\Models\InformeFinal;
use App\Models\MedioNotificacion;
use App\Models\Prueba;
use App\Models\SolicitudInformacion;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DenunciaMasivaSeeder extends Seeder
{
    private array $nombresComunes = [
        'ALBERTO QUISPE', 'MARCO ANTONIO GUTIERREZ', 'ROCIO MAMANI',
        'ELSA FLORES HUANCA', 'JHONNY CHOQUE', 'CINTIA VARGAS',
        'EDUARDO POMA', 'NANCY TARQUI', 'GROVER ARANCIBIA',
        'SILVIA TITO', 'GERMAN HUANCA', 'MONICA LAZO',
        'SAMUEL APRA', 'RUTH CHOQUE VARGAS', 'FRANKLIN ZEGARRA',
        'VANIA TORREZ', 'CHRISTIAN MENDOZA', 'ADRIANA PACA',
        'GONZALO VILLAFUERTE', 'LUZ MERY AGUILAR', 'BETTY CHOQUE',
        'RONALD ARCE', 'IVAN CARDENAS', 'MARIELA QUISBERT',
        'OSCAR FERNANDEZ', 'TATYANA HERRERA', 'REYNALDO BUSTAMANTE',
        'JESSICA ZUNIGA', 'ALEX PAREDES', 'DIANA SALAZAR',
        'MAURICIO COAQUIRA', 'PAOLA RIOS', 'CARLOS GUMUCIO',
        'ANDREA MEDINA', 'HUGO SALVATIERRA', 'VALERIA TORRICO',
        'RODRIGO VELASCO', 'NADIA CONDORI', 'LUIS ALBERTO PINTO',
        'CAMILA VALVERDE', 'DIEGO ARANIBAR', 'INES QUISPE MAMANI',
        'PABLO ROCHA', 'TANIA APARICIO', 'FELIX MAMANI CONDORI',
        'VIVIANA FLORES', 'MAURO QUISPE VARGAS', 'KARLA ESCOBAR',
        'GUSTAVO HINOJOSA', 'MIREYA LIMACHI', 'ERNESTO CHOQUE',
        'LILIANA ZEGARRA', 'RAUL VILLCA', 'EMILCE MENDOZA',
    ];

    private array $nombresDenunciados = [
        'MARCOS QUISPE FLORES', 'RUTH HUANCA PEREZ', 'JAVIER GUTIERREZ ORTIZ',
        'CARMEN VARGAS DE MENDOZA', 'HENRY CHOQUE LOPEZ', 'YOLANDA POMA TORREZ',
        'FERNANDO ARANCIBIA VARGAS', 'SANDRA TITO QUISPE', 'ROBERTO HUANCA FLORES',
        'LILIAN VARGAS HUANCA', 'OSCAR GUTIERREZ QUISPE', 'MARINA CHOQUE DE ARCE',
        'GUSTAVO FERNANDEZ MEDINA', 'NATALY VELASCO TAPARA', 'DANIEL MENDOZA PACA',
        'PAULA HINOJOSA VARGAS', 'MAURICIO QUISPE CONDORI', 'ALEJANDRA SALAZAR TORREZ',
        'JORGE ARCE PEREZ', 'VANESA TORRICO QUISPE', 'LUIS CHOQUE GUMUCIO',
        'ELENA APARICIO DE VARGAS', 'CARLOS FLORES VILLCA', 'SILVIA MEDINA QUISPE',
        'RUBEN CONDORI HUANCA', 'GLORIA PAREDES MENDOZA', 'ANTONIO GUTIERREZ QUISPE',
        'MARTA ROCHA DE FERNANDEZ', 'CLAUDIA ZUNIGA POMA', 'JORGE ESCOBAR VARGAS',
        'CESAR BUSTAMANTE ARCE', 'LILIAN TAPARA QUISPE', 'PEDRO HUANCA FLORES',
        'MARIA DE LOS ANGELES QUISPE', 'ALFREDO VARGAS CONDORI',
    ];

    private array $lugares = [
        'ALCALDIA MUNICIPAL DE EL ALTO',
        'SECRETARIA DE ADMINISTRACION TRIBUTARIA',
        'DIRECCION DE OBRAS PUBLICAS',
        'HOSPITAL MUNICIPAL EL ALTO',
        'MERCADO CENTRAL DE EL ALTO',
        'UNIDAD DE TESORERIA MUNICIPAL',
        'DIRECCION DE INGRESOS MUNICIPALES',
        'UNIDAD DE CATASTRO MUNICIPAL',
        'UNIDAD DE ADQUISICIONES GAMEA',
        'SECRETARIA GENERAL GAMEA',
        'TERMINAL METROPOLITANA DE EL ALTO',
        'DIRECCION DE ALUMBRADO PUBLICO',
        'UNIDAD DE AUDITORIA INTERNA',
        'UNIDAD DE SISTEMAS GAMEA',
        'DIRECCION DE CONTRATACIONES',
        'UNIDAD DE FISCALIZACION Y RECAUDACIONES',
        'UNIDAD DE REGISTRO DE TALENTO HUMANO',
        'DIRECCION DE MOVILIDAD URBANA',
        'DIRECCION DE EDUCACION Y CULTURA',
        'UNIDAD DE GESTION SOCIAL',
    ];

    private array $hechosCorrupcion = [
        'FUNCIONARIO MUNICIPAL SOLICITO RETRIBUCION ECONOMICA A CAMBIO DE ACELERAR PROCESO DE CONTRATACION PUBLICA EN FAVOR DE UNA EMPRESA FAVORECIDA.',
        'SE DENUNCIA PAGO EXTRAOFICIAL POR PARTE DE COMERCIANTES PARA OBTENER LICENCIAS DE FUNCIONAMIENTO EN LA DIRECCION DE INGRESOS.',
        'FUNCIONARIO ADQUIRIO EQUIPAMIENTO A SOBREPRECIO GENERANDO BENEFICIO ECONOMICO PERSONAL Y A UNA PROVEEDORA RELACIONADA.',
        'SE DENUNCIA NEGLIGENCIA EN LA ADMINISTRACION DE RECURSOS PUBLICOS DESTINADOS A PROGRAMAS SOCIALES, CON DESVIO PARCIAL DE FONDOS.',
        'FUNCIONARIO HABRIA FAVORECIDO A EMPRESA CONSTRUCTORA EN ADJUDICACION DIRECTA DE OBRA PUBLICA A CAMBIO DE BENEFICIOS PERSONALES.',
        'SE DENUNCIA QUE RECAUDADORES MUNICIPALES COBRAN MONTOS SUPERIORES A LOS AUTORIZADOS, RETENIENDO LA DIFERENCIA PARA BENEFICIO PERSONAL.',
        'JEFA DE ADQUISICIONES HABRIA ADQUIRIDO BIENES A PRECIOS INFLACIONADOS, GENERANDO PERJUICIO ECONOMICO AL MUNICIPIO.',
        'FUNCIONARIO REALIZO NEGOCIACIONES INCOMPATIBLES CON SU CARGO, FAVORECIENDO A EMPRESA DE SU CONYUGE EN PROCESOS DE CONTRATACION.',
        'SE DENUNCIA EL USO INDEBIDO DE VEHICULOS Y RECURSOS MUNICIPALES PARA ACTIVIDADES PRIVADAS DEL FUNCIONARIO.',
        'FUNCIONARIO HABRIA OMITIDO DENUNCIAR IRREGULARIDADES EN LA GESTION DE RECURSOS PUBLICOS DE SU UNIDAD.',
        'SE DENUNCIA INCUMPLIMIENTO SISTEMATICO DE DEBERES FORMALES EN LA ATENCION A SOLICITUDES DE LA CIUDADANIA.',
        'FUNCIONARIO SOLICITO COBRO EXTRAOFICIAL POR EMISION DE PERMISOS DE CONSTRUCCION EN LA DIRECCION DE OBRAS.',
    ];

    private array $hechosNegacion = [
        'EL DENUNCIANTE SOLICITO INFORMACION PUBLICA SOBRE EL PROCESO DE CONTRATACION Y LA UNIDAD SE NEG A PROPORCIONARLA ALEGANDO CONFIDENCIALIDAD.',
        'MEDIANTE CARTA SOLICITO DATOS SOBRE EL PRESUPUESTO DE SU UNIDAD CORRESPONDIENTE A LA GESTION PASADA. A LA FECHA NO HA RECIBIDO RESPUESTA.',
        'SE DENUNCIA QUE LA UNIDAD DE INFORMACION SISTEMATICAMENTE DENIEGA ACCESO A DOCUMENTOS PUBLICOS SOLICITADOS POR CIUDADANOS.',
        'EL DENUNCIANTE SOLICITO COPIA DE RESOLUCIONES MUNICIPALES Y LA UNIDAD SE NEG A ENTREGARLAS SIN JUSTIFICACION LEGAL.',
        'SE DENUNCIA NEGACION REITERADA DE INFORMACION SOBRE PROCESOS DE CONTRATACION PUBLICA SOLICITADA POR ORGANIZACIONES DE LA SOCIEDAD CIVIL.',
    ];

    private array $lugarDep = [
        'ALCALDIA MUNICIPAL DE EL ALTO' => 'ALCALDIA MUNICIPAL DE EL ALTO',
        'SECRETARIA DE ADMINISTRACION TRIBUTARIA' => 'UNIDAD DE INGRESOS Y CONTROL TRIBUTARIO',
        'DIRECCION DE OBRAS PUBLICAS' => 'UNIDAD DE INFRAESTRUCTURA MUNICIPAL',
        'HOSPITAL MUNICIPAL EL ALTO' => 'HOSPITAL MUNICIPAL MODELO BOLIVIANO JAPONESES',
        'MERCADO CENTRAL DE EL ALTO' => 'UNIDAD DE MERCADOS',
        'UNIDAD DE TESORERIA MUNICIPAL' => 'UNIDAD DE TESORERIA',
        'DIRECCION DE INGRESOS MUNICIPALES' => 'UNIDAD DE INGRESOS Y CONTROL TRIBUTARIO',
        'UNIDAD DE CATASTRO MUNICIPAL' => 'UNIDAD DE CATASTRO MUNICIPAL Y CARTOGRAFIA',
        'UNIDAD DE ADQUISICIONES GAMEA' => 'UNIDAD DE ADQUISICIONES Y CONTRATACIONES MENORES',
        'SECRETARIA GENERAL GAMEA' => 'SECRETARIA MUNICIPAL DE GESTION INSTITUCIONAL',
        'TERMINAL METROPOLITANA DE EL ALTO' => 'TERMINAL METROPOLITANA DE EL ALTO',
        'DIRECCION DE ALUMBRADO PUBLICO' => 'UNIDAD OPERATIVA DE ALUMBRADO PUBLICO',
        'UNIDAD DE AUDITORIA INTERNA' => 'UNIDAD DE AUDITORIA INTERNA',
        'UNIDAD DE SISTEMAS GAMEA' => 'UNIDAD DE ADMINISTRACION DE SISTEMAS DE INFORMACION',
        'DIRECCION DE CONTRATACIONES' => 'UNIDAD DE LICITACIONES',
        'UNIDAD DE FISCALIZACION Y RECAUDACIONES' => 'UNIDAD DE FISCALIZACION Y RECAUDACIONES',
        'UNIDAD DE REGISTRO DE TALENTO HUMANO' => 'UNIDAD DE REGISTRO',
        'DIRECCION DE MOVILIDAD URBANA' => 'UNIDAD DE REGULACION DEL TRANSPORTE',
        'DIRECCION DE EDUCACION Y CULTURA' => 'UNIDAD DE PROGRAMAS EDUCATIVOS',
        'UNIDAD DE GESTION SOCIAL' => 'UNIDAD DE POBLACIONES DIVERSAS',
    ];

    public function run(): void
    {
        $this->crearCasosPipeline();
        $this->crearCasosAsignados();
        $this->actualizarSiguienteTicket();
    }

    private function now(): Carbon
    {
        return Carbon::now();
    }

    private function fecha(int $dias, int $hora = 9, int $min = 0): Carbon
    {
        return $this->now()->subDays($dias)->setTime($hora, $min, 0);
    }

    private function ticket(int $num): string
    {
        return sprintf('DEN-%04d-%04d', 2026, $num);
    }

    private function dependenciaId(string $nombre): int
    {
        return DependenciaExterna::where('nombre', $nombre)->value('id')
            ?? DependenciaExterna::whereNotNull('parent_id')->first()->id;
    }

    private function tipoFor(int $num): string
    {
        return ($num % 4 === 0) ? 'negacion' : 'corrupcion';
    }

    private function escenarioFor(int $num): string
    {
        $pool = ['revelada', 'revelada', 'revelada', 'anonima', 'reservada'];
        return $pool[$num % 5];
    }

    private function crearDenuncia(array $c): void
    {
        $num = (int) preg_replace('/^DEN-\d{4}-(\d{4})$/', '$1', $c['ticket']);
        $tipo = $c['tipo'] ?? $this->tipoFor($num);
        $escenario = $c['escenario'] ?? $this->escenarioFor($num);
        $catPool = $tipo === 'negacion' ? [11, 12] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        $categoriaId = $catPool[$num % count($catPool)];
        $lugar = $this->lugares[$num % count($this->lugares)];
        $hechos = $tipo === 'negacion'
            ? $this->hechosNegacion[$num % count($this->hechosNegacion)]
            : $this->hechosCorrupcion[$num % count($this->hechosCorrupcion)];

        $estado = $c['estado'] === 'cerrada_archivada' ? 'cerrada' : $c['estado'];
        $subestado = $c['sub'] ?? ($c['estado'] === 'cerrada_archivada' ? 'archivada' : null);

        $data = [
            'ticket' => $c['ticket'],
            'token_consulta' => (string) (1000 + $num),
            'tipo' => $tipo,
            'escenario' => $escenario,
            'estado' => $estado,
            'subestado' => $subestado,
            'categoria_id' => $categoriaId,
            'fecha_hechos' => $this->fecha($c['cr'] + random_int(0, 10), 10)->toDateString(),
            'lugar_hechos' => $lugar,
            'hechos' => $hechos,
            'declaracion_jurada' => true,
            'registrado_por_id' => 2,
            'created_at' => $this->fecha($c['cr'], 8),
            'updated_at' => $this->fecha(max(0, $c['cr'] - 5), 16),
        ];

        if (!empty($c['adm'])) {
            $data['fecha_admitida'] = $this->fecha($c['adm'], 10);
            $data['justificacion_admision'] = 'EXISTEN INDICIOS SUFICIENTES PARA CONTINUAR CON EL PROCESO.';
        }
        if (!empty($c['asg'])) {
            $data['tecnico_id'] = $c['tecnico_id'];
            $data['fecha_asignada'] = $this->fecha($c['asg'], 11);
        } elseif ($c['estado'] === 'ingresada' || $c['estado'] === 'evaluacion_tecnica' || $c['estado'] === 'admitida') {
            // sin asignar
        }
        if ($c['estado'] === 'rechazada' && !empty($c['rc'])) {
            $data['fecha_rechazada'] = $this->fecha($c['rc'], 16);
            $data['justificacion_rechazo'] = 'LOS HECHOS NO CONSTITUYEN ACTOS DE CORRUPCION SEGUN LA LEY N 974.';
            $data['resumen_rechazo'] = 'HECHOS SIN INDICIOS SUFICIENTES PARA CONTINUAR.';
        }

        $d = Denuncia::create($data);

        // Denunciante
        if ($escenario !== 'anonima') {
            $d->denunciante()->create([
                'nombres' => $this->nombresComunes[$num % count($this->nombresComunes)],
                'ci' => (string) random_int(1000000, 9999999),
                'email' => strtolower(str_replace(' ', '.', $this->nombresComunes[$num % count($this->nombresComunes)])) . '@email.com',
                'telefono' => '7' . random_int(10000000, 99999999),
            ]);
        } else {
            $d->denunciante()->create([
                'nombres' => null, 'ci' => null, 'email' => null, 'telefono' => null,
            ]);
        }

        // Denunciados
        $cantDen = ($num % 3 === 0) ? 2 : 1;
        $denunciadoIds = [];
        for ($i = 0; $i < $cantDen; $i++) {
            $ndx = ($num + $i) % count($this->nombresDenunciados);
            $dd = $d->denunciados()->create([
                'orden' => $i,
                'conoce_identidad' => $escenario !== 'anonima',
                'nombres' => $escenario !== 'anonima' ? $this->nombresDenunciados[$ndx] : null,
                'dependencia' => $escenario !== 'anonima' ? $lugar : null,
                'descripcion' => $escenario === 'anonima' ? 'FUNCIONARIO DE ' . $lugar . ', DESCRIPCION FISICA NO ESPECIFICADA' : null,
            ]);
            $denunciadoIds[] = $dd->id;
        }

        // Pruebas
        $cantPruebas = ($num % 5 === 0) ? 1 : 2;
        $pruebasTipos = ['fisica', 'fisica', 'testigo', 'archivo'];
        $pruebasDescs = [
            'fisica' => ['COPIA DE DOCUMENTO OFICIAL RELACIONADO', 'FOTO DEL LUGAR DE LOS HECHOS', 'RECIBOS Y COMPROBANTES DE PAGO', 'DOCUMENTACION CONTABLE SOLICITADA', 'CARTA DE SOLICITUD CON SELLO DE RECEPCION'],
            'testigo' => ['TESTIGO PRESENCIAL DEL HECHO', 'FUNCIONARIO QUE CONOCE LOS HECHOS', 'OTRO AFECTADO POR LA SITUACION'],
            'archivo' => ['GRABACION DE AUDIO DEL HECHO', 'REGISTRO DIGITAL DE COMUNICACIONES', 'CAPTURA DE PANTALLA DE SOLICITUD'],
        ];
        for ($i = 0; $i < $cantPruebas; $i++) {
            $tipoP = $pruebasTipos[($num + $i) % count($pruebasTipos)];
            $descP = $pruebasDescs[$tipoP][$num % count($pruebasDescs[$tipoP])];
            $prData = ['tipo' => $tipoP, 'descripcion' => $descP];
            if ($tipoP === 'testigo') {
                $prData['testigo_nombre'] = $this->nombresComunes[($num + $i + 5) % count($this->nombresComunes)];
                $prData['testigo_telefono'] = '7' . random_int(10000000, 99999999);
            }
            $d->pruebas()->create($prData);
        }

        // Bitacora
        $this->crearBitacora($d, $c, $num);

        // Ampliaciones
        if (!empty($c['amp']) && !empty($c['asg'])) {
            $d->ampliaciones()->create([
                'entidad_type' => Denuncia::class,
                'entidad_id' => $d->id,
                'dias' => $c['amp'],
                'justificacion' => 'SE REQUIERE MAS TIEMPO PARA LA INVESTIGACION DEL CASO.',
                'numero' => 1,
                'aprobado_por_id' => 1,
                'solicitado_por' => $this->tecnicoName($c['tecnico_id']),
                'fecha' => $this->fecha($c['asg'] - 3, 14),
            ]);
        }

        // Solicitudes (para investigacion/informe)
        if (!empty($c['sol']) && !empty($c['inv'])) {
            $this->crearSolicitudes($d, $num, $c['inv'], $tipo);
        }

        // Descargos (para investigacion/informe)
        if (!empty($c['des']) && count($denunciadoIds) > 0 && !empty($c['inv'])) {
            $this->crearDescargos($d, $denunciadoIds, $num, $c['inv']);
        }

        // Informe final (para informe/cerrada/archivada)
        if (in_array($c['estado'], ['informe', 'cerrada', 'cerrada_archivada']) && !empty($c['inf'])) {
            $this->crearInforme($d, $c, $num);
        }

        // Cierre (para cerrada/archivada)
        if (in_array($c['estado'], ['cerrada', 'cerrada_archivada']) && !empty($c['crt'])) {
            $this->crearCierre($d, $c, $num);
        }
    }

    private function crearBitacora(Denuncia $d, array $c, int $num): void
    {
        $bitacoraEntries = [
            ['accion' => 'ingresada', 'detalle' => 'DENUNCIA REGISTRADA CON TICKET ' . $c['ticket'], 'usuario_id' => 2, 'fecha' => $this->fecha($c['cr'], 8)],
        ];

        if (!empty($c['adm'])) {
            $bitacoraEntries[] = ['accion' => 'admitida', 'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACION', 'usuario_id' => 1, 'fecha' => $this->fecha($c['adm'], 10)];
        }
        if ($c['estado'] === 'rechazada' && !empty($c['rc'])) {
            $bitacoraEntries[] = ['accion' => 'rechazada', 'detalle' => 'DENUNCIA RECHAZADA POR NO CONSTITUIR ACTO DE CORRUPCION', 'usuario_id' => 1, 'fecha' => $this->fecha($c['rc'], 16)];
        }
        if (!empty($c['asg']) && !empty($c['tecnico_id'])) {
            $techName = $this->tecnicoName($c['tecnico_id']);
            $bitacoraEntries[] = ['accion' => 'asignada', 'detalle' => 'DENUNCIA ASIGNADA A ' . $techName, 'usuario_id' => 1, 'fecha' => $this->fecha($c['asg'], 11)];
        }
        if (!empty($c['inv'])) {
            $bitacoraEntries[] = ['accion' => 'investigacion', 'detalle' => 'INVESTIGACION INICIADA', 'usuario_id' => $c['tecnico_id'], 'fecha' => $this->fecha($c['inv'], 9)];
        }
        if (!empty($c['inf'])) {
            $clas = $c['clas'] ?? 'administrativo';
            $bitacoraEntries[] = ['accion' => 'informe_redactado', 'detalle' => 'INFORME FINAL REDACTADO CON CLASIFICACION ' . strtoupper($clas), 'usuario_id' => $c['tecnico_id'], 'fecha' => $this->fecha($c['inf'], 14)];
        }
        if (in_array($c['estado'], ['cerrada', 'cerrada_archivada']) && !empty($c['crt'])) {
            $sub = $c['sub'] ?? '';
            $bitacoraEntries[] = ['accion' => 'cierre_registrado', 'detalle' => 'CASO CERRADO' . ($sub ? ' Y ' . strtoupper($sub) : ''), 'usuario_id' => $c['tecnico_id'], 'fecha' => $this->fecha($c['crt'], 16)];
        }

        foreach ($bitacoraEntries as $b) {
            $d->bitacora()->create($b);
        }
    }

    private function crearSolicitudes(Denuncia $d, int $num, int $invDias, string $tipo): void
    {
        $deps = [
            'UNIDAD DE AUDITORIA INTERNA',
            'UNIDAD DE TESORERIA',
            'UNIDAD DE ADQUISICIONES Y CONTRATACIONES MENORES',
            'UNIDAD DE CATASTRO MUNICIPAL Y CARTOGRAFIA',
            'UNIDAD DE FISCALIZACION Y RECAUDACIONES',
            'UNIDAD DE LICITACIONES',
            'UNIDAD DE PRESUPUESTO',
            'UNIDAD DE CONTABILIDAD',
        ];

        $cantSol = ($num % 3 === 0) ? 2 : 1;
        for ($i = 0; $i < $cantSol; $i++) {
            $depNombre = $deps[($num + $i) % count($deps)];
            $depId = $this->dependenciaId($depNombre);
            $envio = $this->fecha($invDias - 2 - $i, 9);
            $venc = DiasHabiles::agregar(10, $envio);
            $esRespondida = ($i === 0) || ($num % 3 !== 0);

            $s = $d->solicitudes()->create([
                'dependencia_destino_id' => $depId,
                'detalle' => 'SOLICITUD DE INFORMACION SOBRE DOCUMENTACION RELACIONADA AL CASO ' . $d->ticket,
                'plazo_dias' => 10,
                'fecha_envio' => $envio,
                'fecha_vencimiento' => $venc,
                'estado' => $esRespondida ? 'respondida' : 'pendiente',
                'fecha_respuesta' => $esRespondida ? $venc->copy()->subDays(1) : null,
                'respuesta' => $esRespondida ? 'SE ADJUNTA LA DOCUMENTACION SOLICITADA RELACIONADA AL CASO.' : null,
            ]);

            $d->bitacora()->create([
                'accion' => 'solicitud_creada',
                'detalle' => 'SOLICITUD DE INFORMACION A ' . $depNombre,
                'usuario_id' => $d->tecnico_id,
                'fecha' => $envio,
            ]);

            if ($esRespondida) {
                $d->bitacora()->create([
                    'accion' => 'solicitud_respondida',
                    'detalle' => 'SOLICITUD RESPONDIDA POR ' . $depNombre,
                    'usuario_id' => $d->tecnico_id,
                    'fecha' => $venc->copy()->subDays(1),
                ]);
            }
        }
    }

    private function crearDescargos(Denuncia $d, array $denunciadoIds, int $num, int $invDias): void
    {
        $denunciadoId = $denunciadoIds[0];
        $notif = $this->fecha($invDias - 5, 10);
        $venc = DiasHabiles::agregar(14, $notif);
        $estadosDescargo = ['respondido', 'notificado', 'pendiente_notif'];
        $estado = $estadosDescargo[$num % 3];

        $descData = [
            'denunciado_id' => $denunciadoId,
            'fecha_notificacion' => $notif,
            'medio' => ($num % 2 === 0) ? 'CEDULA DE NOTIFICACION' : 'NOTIFICACION PERSONAL',
            'fecha_vencimiento' => $venc,
            'estado' => $estado,
        ];
        if ($estado === 'respondido') {
            $descData['fecha_respuesta'] = $venc->copy()->subDays(3);
            $descData['resumen_descargo'] = 'EL DENUNCIADO PRESENTO DOCUMENTACION QUE DEMUESTRA QUE LA ACCION CUESTIONADA SIGUIO LOS PROCEDIMIENTOS ESTABLECIDOS.';
        }

        $d->descargos()->create($descData);

        $d->bitacora()->create([
            'accion' => 'descargo_notificado',
            'detalle' => 'DESCARGO NOTIFICADO AL DENUNCIADO',
            'usuario_id' => $d->tecnico_id,
            'fecha' => $notif,
        ]);

        if ($estado === 'respondido') {
            $d->bitacora()->create([
                'accion' => 'descargo_respondido',
                'detalle' => 'DESCARGO RESPONDIDO POR EL DENUNCIADO',
                'usuario_id' => $d->tecnico_id,
                'fecha' => $descData['fecha_respuesta'],
            ]);
        }
    }

    private function crearInforme(Denuncia $d, array $c, int $num): void
    {
        $clasClaves = ['penal', 'civil', 'administrativo', 'sin_indicios', 'medida_correctiva'];
        $clas = $c['clas'] ?? $clasClaves[$num % count($clasClaves)];
        $clasId = Clasificacion::where('clave', $clas)->value('id');

        InformeFinal::create([
            'denuncia_id' => $d->id,
            'clasificacion_id' => $clasId,
            'clasificado_por_id' => $c['tecnico_id'],
            'sitpreco' => 'SIT-' . date('Y') . '-' . str_pad($num, 3, '0', STR_PAD_LEFT),
            'fojas' => random_int(15, 65),
            'justificacion' => 'SE HA VERIFICADO LA INFORMACION PRESENTADA EN LA DENUNCIA. SE RECOMIENDA LAS ACCIONES CORRESPONDIENTES SEGUN EL ARTICULO CORRESPONDIENTE DE LA LEY 974.',
            'concluido_por' => $this->tecnicoName($c['tecnico_id']),
            'redactado_at' => $this->fecha($c['inf'], 14),
        ]);
    }

    private function crearCierre(Denuncia $d, array $c, int $num): void
    {
        $medios = ['presencial', 'email', 'whatsapp', 'otro'];
        $medioClave = $c['med'] ?? $medios[$num % count($medios)];
        $medioId = MedioNotificacion::where('clave', $medioClave)->value('id');
        $techName = $this->tecnicoName($c['tecnico_id']);

        Cierre::create([
            'denuncia_id' => $d->id,
            'notificado_denunciante' => true,
            'notificacion_medio_id' => $medioId,
            'notificacion_fecha' => $this->fecha($c['crt'] - 1, 10),
            'notificacion_descripcion' => 'SE NOTIFICO AL DENUNCIANTE SOBRE EL CIERRE DEL CASO ' . $d->ticket,
            'concluido_por' => $techName,
            'descripcion' => 'CASO CERRADO DESPUES DE LA INVESTIGACION CORRESPONDIENTE.',
            'cerrado_at' => $this->fecha($c['crt'], 16),
            'cerrado_por_id' => $c['tecnico_id'],
        ]);
    }

    private function tecnicoName(?int $tecnicoId): string
    {
        return User::where('id', $tecnicoId)->value('name') ?? 'TECNICO';
    }

    private function actualizarSiguienteTicket(): void
    {
        ConfiguracionSistema::where('clave', 'siguiente_numero_ticket')->update(['valor' => '85']);
    }

    private function crearCasosPipeline(): void
    {
        $pipeline = [
            // ingresada x7
            ['ticket' => $this->ticket(13), 'estado' => 'ingresada', 'cr' => 1],
            ['ticket' => $this->ticket(14), 'estado' => 'ingresada', 'cr' => 2],
            ['ticket' => $this->ticket(15), 'estado' => 'ingresada', 'cr' => 4],
            ['ticket' => $this->ticket(16), 'estado' => 'ingresada', 'cr' => 6, 'escenario' => 'anonima'],
            ['ticket' => $this->ticket(17), 'estado' => 'ingresada', 'cr' => 9, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(18), 'estado' => 'ingresada', 'cr' => 3],
            ['ticket' => $this->ticket(19), 'estado' => 'ingresada', 'cr' => 12, 'escenario' => 'reservada'],

            // evaluacion_tecnica x4
            ['ticket' => $this->ticket(20), 'estado' => 'evaluacion_tecnica', 'cr' => 2, 'adm' => null],
            ['ticket' => $this->ticket(21), 'estado' => 'evaluacion_tecnica', 'cr' => 5, 'adm' => null, 'escenario' => 'anonima'],
            ['ticket' => $this->ticket(22), 'estado' => 'evaluacion_tecnica', 'cr' => 8, 'adm' => null, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(23), 'estado' => 'evaluacion_tecnica', 'cr' => 3, 'adm' => null],

            // admitida sin asignar x4
            ['ticket' => $this->ticket(24), 'estado' => 'admitida', 'cr' => 4, 'adm' => 3],
            ['ticket' => $this->ticket(25), 'estado' => 'admitida', 'cr' => 6, 'adm' => 5, 'escenario' => 'reservada'],
            ['ticket' => $this->ticket(26), 'estado' => 'admitida', 'cr' => 9, 'adm' => 8, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(27), 'estado' => 'admitida', 'cr' => 12, 'adm' => 10],

            // rechazada x5
            ['ticket' => $this->ticket(28), 'estado' => 'rechazada', 'cr' => 8, 'adm' => 6, 'rc' => 3],
            ['ticket' => $this->ticket(29), 'estado' => 'rechazada', 'cr' => 15, 'adm' => 12, 'rc' => 8],
            ['ticket' => $this->ticket(30), 'estado' => 'rechazada', 'cr' => 25, 'adm' => 20, 'rc' => 15, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(31), 'estado' => 'rechazada', 'cr' => 40, 'adm' => 35, 'rc' => 30, 'escenario' => 'anonima'],
            ['ticket' => $this->ticket(32), 'estado' => 'rechazada', 'cr' => 65, 'adm' => 60, 'rc' => 55],
        ];

        foreach ($pipeline as $c) {
            $this->crearDenuncia($c);
        }
    }

    private function crearCasosAsignados(): void
    {
        $t3 = User::where('username', 'tecnico1')->first()->id;
        $t4 = User::where('username', 'tecnico2')->first()->id;
        $t5 = User::where('username', 'tecnico3')->first()->id;
        $t6 = User::where('username', 'tecnico4')->first()->id;
        $t7 = User::where('username', 'tecnico5')->first()->id;
        $t8 = User::where('username', 'tecnico6')->first()->id;
        $t9 = User::where('username', 'tecnico7')->first()->id;
        $t10 = User::where('username', 'tecnico8')->first()->id;
        $t11 = User::where('username', 'tecnico9')->first()->id;
        $t12 = User::where('username', 'tecnico10')->first()->id;

        $casos = [
            // tecnico1 (Carlos Quispe) +3: investigacion, asignada, informe
            ['ticket' => $this->ticket(33), 'estado' => 'investigacion', 'tecnico_id' => $t3, 'cr' => 60, 'adm' => 55, 'asg' => 50, 'inv' => 48, 'sol' => true, 'des' => true, 'amp' => 30],
            ['ticket' => $this->ticket(34), 'estado' => 'asignada', 'tecnico_id' => $t3, 'cr' => 10, 'adm' => 7, 'asg' => 5],
            ['ticket' => $this->ticket(35), 'estado' => 'informe', 'tecnico_id' => $t3, 'cr' => 35, 'adm' => 30, 'asg' => 28, 'inv' => 25, 'inf' => 3, 'sol' => true],

            // tecnico2 (Ana Torres) +4: asignada, investigacion x2, cerrada
            ['ticket' => $this->ticket(36), 'estado' => 'asignada', 'tecnico_id' => $t4, 'cr' => 35, 'adm' => 28, 'asg' => 25],
            ['ticket' => $this->ticket(37), 'estado' => 'investigacion', 'tecnico_id' => $t4, 'cr' => 15, 'adm' => 10, 'asg' => 8, 'inv' => 6, 'sol' => true, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(38), 'estado' => 'investigacion', 'tecnico_id' => $t4, 'cr' => 80, 'adm' => 70, 'asg' => 65, 'inv' => 60, 'amp' => 90, 'des' => true],
            ['ticket' => $this->ticket(39), 'estado' => 'cerrada', 'tecnico_id' => $t4, 'cr' => 50, 'adm' => 45, 'asg' => 42, 'inv' => 38, 'inf' => 12, 'crt' => 8, 'sol' => true],

            // tecnico3 (Luis Mamani) +4: asignada, investigacion, cerrada, archivada
            ['ticket' => $this->ticket(40), 'estado' => 'asignada', 'tecnico_id' => $t5, 'cr' => 55, 'adm' => 48, 'asg' => 45],
            ['ticket' => $this->ticket(41), 'estado' => 'investigacion', 'tecnico_id' => $t5, 'cr' => 48, 'adm' => 42, 'asg' => 38, 'inv' => 35, 'sol' => true, 'des' => true, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(42), 'estado' => 'cerrada', 'tecnico_id' => $t5, 'cr' => 65, 'adm' => 55, 'asg' => 50, 'inv' => 45, 'inf' => 22, 'crt' => 20],
            ['ticket' => $this->ticket(43), 'estado' => 'cerrada_archivada', 'tecnico_id' => $t5, 'cr' => 50, 'adm' => 42, 'asg' => 38, 'inv' => 32, 'inf' => 18, 'crt' => 12, 'sub' => 'archivada', 'clas' => 'sin_indicios'],

            // tecnico4 (Jorge Apaza) +6
            ['ticket' => $this->ticket(44), 'estado' => 'asignada', 'tecnico_id' => $t6, 'cr' => 14, 'adm' => 10, 'asg' => 8],
            ['ticket' => $this->ticket(45), 'estado' => 'investigacion', 'tecnico_id' => $t6, 'cr' => 20, 'adm' => 15, 'asg' => 12, 'inv' => 9, 'sol' => true, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(46), 'estado' => 'investigacion', 'tecnico_id' => $t6, 'cr' => 100, 'adm' => 95, 'asg' => 90, 'inv' => 85, 'amp' => 30, 'des' => true],
            ['ticket' => $this->ticket(47), 'estado' => 'informe', 'tecnico_id' => $t6, 'cr' => 38, 'adm' => 28, 'asg' => 25, 'inv' => 22, 'inf' => 5],
            ['ticket' => $this->ticket(48), 'estado' => 'cerrada', 'tecnico_id' => $t6, 'cr' => 55, 'adm' => 40, 'asg' => 37, 'inv' => 32, 'inf' => 12, 'crt' => 5],
            ['ticket' => $this->ticket(49), 'estado' => 'cerrada_archivada', 'tecnico_id' => $t6, 'cr' => 70, 'adm' => 60, 'asg' => 55, 'inv' => 50, 'inf' => 20, 'crt' => 15, 'sub' => 'archivada', 'clas' => 'archivado'],

            // tecnico5 (Karina Villca) +6
            ['ticket' => $this->ticket(50), 'estado' => 'asignada', 'tecnico_id' => $t7, 'cr' => 22, 'adm' => 16, 'asg' => 14, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(51), 'estado' => 'investigacion', 'tecnico_id' => $t7, 'cr' => 30, 'adm' => 25, 'asg' => 22, 'inv' => 18, 'sol' => true, 'des' => true],
            ['ticket' => $this->ticket(52), 'estado' => 'informe', 'tecnico_id' => $t7, 'cr' => 95, 'adm' => 90, 'asg' => 85, 'inv' => 80, 'inf' => 10],
            ['ticket' => $this->ticket(53), 'estado' => 'informe', 'tecnico_id' => $t7, 'cr' => 42, 'adm' => 35, 'asg' => 32, 'inv' => 28, 'inf' => 4, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(54), 'estado' => 'cerrada', 'tecnico_id' => $t7, 'cr' => 80, 'adm' => 70, 'asg' => 65, 'inv' => 60, 'inf' => 18, 'crt' => 8],
            ['ticket' => $this->ticket(55), 'estado' => 'cerrada_archivada', 'tecnico_id' => $t7, 'cr' => 55, 'adm' => 48, 'asg' => 44, 'inv' => 40, 'inf' => 15, 'crt' => 6, 'sub' => 'archivada', 'clas' => 'sin_indicios'],

            // tecnico6 (Miguel Condori) +5
            ['ticket' => $this->ticket(56), 'estado' => 'asignada', 'tecnico_id' => $t8, 'cr' => 16, 'adm' => 12, 'asg' => 9],
            ['ticket' => $this->ticket(57), 'estado' => 'asignada', 'tecnico_id' => $t8, 'cr' => 40, 'adm' => 35, 'asg' => 33, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(58), 'estado' => 'investigacion', 'tecnico_id' => $t8, 'cr' => 65, 'adm' => 60, 'asg' => 56, 'inv' => 52, 'amp' => 30, 'sol' => true],
            ['ticket' => $this->ticket(59), 'estado' => 'informe', 'tecnico_id' => $t8, 'cr' => 52, 'adm' => 48, 'asg' => 44, 'inv' => 40, 'inf' => 12],
            ['ticket' => $this->ticket(60), 'estado' => 'cerrada', 'tecnico_id' => $t8, 'cr' => 60, 'adm' => 50, 'asg' => 46, 'inv' => 42, 'inf' => 20, 'crt' => 15, 'sol' => true],

            // tecnico7 (Veronica Mamani) +6
            ['ticket' => $this->ticket(61), 'estado' => 'asignada', 'tecnico_id' => $t9, 'cr' => 11, 'adm' => 7, 'asg' => 5, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(62), 'estado' => 'investigacion', 'tecnico_id' => $t9, 'cr' => 18, 'adm' => 12, 'asg' => 9, 'inv' => 7, 'sol' => true, 'des' => true],
            ['ticket' => $this->ticket(63), 'estado' => 'investigacion', 'tecnico_id' => $t9, 'cr' => 55, 'adm' => 50, 'asg' => 47, 'inv' => 44, 'des' => true],
            ['ticket' => $this->ticket(64), 'estado' => 'informe', 'tecnico_id' => $t9, 'cr' => 65, 'adm' => 60, 'asg' => 56, 'inv' => 52, 'inf' => 8],
            ['ticket' => $this->ticket(65), 'estado' => 'cerrada', 'tecnico_id' => $t9, 'cr' => 90, 'adm' => 85, 'asg' => 80, 'inv' => 76, 'inf' => 20, 'crt' => 10, 'sol' => true],
            ['ticket' => $this->ticket(66), 'estado' => 'cerrada_archivada', 'tecnico_id' => $t9, 'cr' => 45, 'adm' => 38, 'asg' => 34, 'inv' => 30, 'inf' => 15, 'crt' => 8, 'sub' => 'archivada'],

            // tecnico8 (Rodrigo Huanca) +6
            ['ticket' => $this->ticket(67), 'estado' => 'asignada', 'tecnico_id' => $t10, 'cr' => 28, 'adm' => 22, 'asg' => 20],
            ['ticket' => $this->ticket(68), 'estado' => 'investigacion', 'tecnico_id' => $t10, 'cr' => 38, 'adm' => 33, 'asg' => 30, 'inv' => 26, 'sol' => true],
            ['ticket' => $this->ticket(69), 'estado' => 'informe', 'tecnico_id' => $t10, 'cr' => 80, 'adm' => 75, 'asg' => 70, 'inv' => 65, 'inf' => 15, 'des' => true],
            ['ticket' => $this->ticket(70), 'estado' => 'informe', 'tecnico_id' => $t10, 'cr' => 35, 'adm' => 30, 'asg' => 27, 'inv' => 24, 'inf' => 6, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(71), 'estado' => 'cerrada', 'tecnico_id' => $t10, 'cr' => 70, 'adm' => 60, 'asg' => 55, 'inv' => 50, 'inf' => 25, 'crt' => 18],
            ['ticket' => $this->ticket(72), 'estado' => 'cerrada_archivada', 'tecnico_id' => $t10, 'cr' => 85, 'adm' => 78, 'asg' => 73, 'inv' => 68, 'inf' => 22, 'crt' => 12, 'sub' => 'archivada', 'clas' => 'sin_indicios'],

            // tecnico9 (Cindy Limachi) +6
            ['ticket' => $this->ticket(73), 'estado' => 'asignada', 'tecnico_id' => $t11, 'cr' => 35, 'adm' => 30, 'asg' => 27, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(74), 'estado' => 'investigacion', 'tecnico_id' => $t11, 'cr' => 22, 'adm' => 18, 'asg' => 15, 'inv' => 12, 'des' => true],
            ['ticket' => $this->ticket(75), 'estado' => 'investigacion', 'tecnico_id' => $t11, 'cr' => 85, 'adm' => 80, 'asg' => 76, 'inv' => 72, 'amp' => 90, 'sol' => true],
            ['ticket' => $this->ticket(76), 'estado' => 'informe', 'tecnico_id' => $t11, 'cr' => 45, 'adm' => 40, 'asg' => 37, 'inv' => 33, 'inf' => 9],
            ['ticket' => $this->ticket(77), 'estado' => 'cerrada', 'tecnico_id' => $t11, 'cr' => 50, 'adm' => 44, 'asg' => 40, 'inv' => 36, 'inf' => 15, 'crt' => 10, 'sol' => true],
            ['ticket' => $this->ticket(78), 'estado' => 'cerrada_archivada', 'tecnico_id' => $t11, 'cr' => 58, 'adm' => 50, 'asg' => 46, 'inv' => 42, 'inf' => 22, 'crt' => 18, 'sub' => 'archivada'],

            // tecnico10 (Pablo Siles) +6
            ['ticket' => $this->ticket(79), 'estado' => 'asignada', 'tecnico_id' => $t12, 'cr' => 45, 'adm' => 40, 'asg' => 37],
            ['ticket' => $this->ticket(80), 'estado' => 'investigacion', 'tecnico_id' => $t12, 'cr' => 50, 'adm' => 45, 'asg' => 41, 'inv' => 38, 'sol' => true, 'des' => true, 'tipo' => 'negacion'],
            ['ticket' => $this->ticket(81), 'estado' => 'informe', 'tecnico_id' => $t12, 'cr' => 60, 'adm' => 55, 'asg' => 50, 'inv' => 46, 'inf' => 11],
            ['ticket' => $this->ticket(82), 'estado' => 'informe', 'tecnico_id' => $t12, 'cr' => 32, 'adm' => 26, 'asg' => 23, 'inv' => 20, 'inf' => 2, 'escenario' => 'anonima'],
            ['ticket' => $this->ticket(83), 'estado' => 'cerrada', 'tecnico_id' => $t12, 'cr' => 100, 'adm' => 95, 'asg' => 90, 'inv' => 86, 'inf' => 30, 'crt' => 22],
            ['ticket' => $this->ticket(84), 'estado' => 'cerrada_archivada', 'tecnico_id' => $t12, 'cr' => 75, 'adm' => 68, 'asg' => 63, 'inv' => 58, 'inf' => 25, 'crt' => 18, 'sub' => 'archivada'],
        ];

        foreach ($casos as $c) {
            $this->crearDenuncia($c);
        }
    }
}
