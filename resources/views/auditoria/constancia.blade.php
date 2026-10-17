<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Constancia de Actuaciones — Caso {{ $meta['ticket'] }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm 18mm;
        }
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #1f2937;
            margin: 0;
            padding: 0;
            line-height: 1.4;
        }
        .membrete {
            text-align: center;
            border-bottom: 2.5px solid #4B0090;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .membrete h1 {
            font-size: 13px;
            margin: 0 0 3px 0;
            color: #4B0090;
            letter-spacing: 0.8px;
        }
        .membrete h2 {
            font-size: 10.5px;
            margin: 0 0 4px 0;
            font-weight: bold;
        }
        .titulo {
            font-size: 11px;
            font-weight: bold;
            margin: 6px 0 2px 0;
            color: #4B0090;
            letter-spacing: 0.5px;
        }
        .intro-box {
            background-color: #fcfbfe;
            border-left: 3px solid #4B0090;
            padding: 8px 12px;
            margin-bottom: 12px;
            font-size: 8.5px;
            color: #374151;
            line-height: 1.5;
        }
        .meta-box {
            background-color: #faf8fd;
            border: 1px solid #e5d7f5;
            border-radius: 4px;
            padding: 8px 12px;
            margin-bottom: 14px;
            font-size: 9px;
        }
        .meta-row {
            display: table;
            width: 100%;
        }
        .meta-col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            table-layout: fixed;
        }
        th {
            background: #4B0090;
            color: #ffffff;
            font-weight: bold;
            padding: 6px 8px;
            text-align: left;
            font-size: 8.5px;
            letter-spacing: 0.5px;
            border: 1px solid #4B0090;
        }
        td {
            padding: 5px 8px;
            border: 1px solid #e5e7eb;
            font-size: 8.5px;
            vertical-align: top;
            word-break: break-word;
            overflow-wrap: break-word;
        }
        tr:nth-child(even) td {
            background: #fbf9fe;
        }
        .col-id { width: 8%; text-align: center; font-weight: bold; }
        .col-fecha { width: 20%; white-space: nowrap; }
        .col-accion { width: 27%; }
        .footer {
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
            font-size: 8px;
            color: #6b7280;
            text-align: center;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <div class="membrete">
        <h1>GOBIERNO AUTÓNOMO MUNICIPAL DE EL ALTO</h1>
        <h2>UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCIÓN</h2>
        <div class="titulo">CONSTANCIA INDIVIDUAL DE ACTUACIONES — CASO {{ $meta['ticket'] }}</div>
    </div>

    <div class="intro-box">
        La presente constancia certifica las intervenciones individuales y oficiales registradas en el sistema informático institucional para el caso señalado, obtenidas directamente de la bitácora inmutable de auditoría (append-only). Este documento da fe de las actuaciones de la persona interesada y no altera el estado jurídico ni administrativo del expediente.
    </div>

    <div class="meta-box">
        <div class="meta-row">
            <div class="meta-col">
                <strong>Caso:</strong> #{{ $meta['caso_id'] }} ({{ $meta['ticket'] }})<br>
                <strong>Tipo de Caso:</strong> {{ $meta['tipo'] }}<br>
                <strong>Estado Actual:</strong> {{ $meta['estado'] }}
            </div>
            <div class="meta-col">
                <strong>Servidor/a Solicitante:</strong> {{ $meta['generado_por'] }} ({{ $meta['username'] }})<br>
                <strong>Fecha y Hora de Emisión:</strong> {{ $meta['generado'] }}<br>
                <strong>Actuaciones Registradas:</strong> {{ $meta['registros'] }} @if($meta['rango'])(Rango ID: {{ $meta['rango'] }})@endif
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="col-id">N°</th>
                <th class="col-fecha">FECHA</th>
                <th class="col-accion">ACCIÓN</th>
                <th>DETALLE DE LA ACTUACIÓN</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($filas as $fila)
                <tr>
                    <td class="col-id">{{ $fila['id'] }}</td>
                    <td class="col-fecha">{{ $fila['fecha'] }}</td>
                    <td class="col-accion">{{ $fila['accion'] }}</td>
                    <td>{{ $fila['detalle'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; padding: 18px; font-weight: bold; color: #6b7280;">
                        SIN ACCIONES REGISTRADAS
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Documento oficial de constancia de actuaciones emitido a solicitud de la persona interesada conforme a la Ley N° 974 · Registros de trazabilidad inmutables y auditados.
    </div>
</body>
</html>
