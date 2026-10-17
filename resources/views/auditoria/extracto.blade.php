<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Extracto {{ $proyeccion }} — Caso {{ $meta['ticket'] }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 12mm 15mm;
        }
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 8.5px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }
        .membrete {
            text-align: center;
            border-bottom: 2.5px solid #4B0090;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .membrete h1 {
            font-size: 12px;
            margin: 0 0 2px 0;
            color: #4B0090;
            letter-spacing: 0.8px;
        }
        .membrete h2 {
            font-size: 10px;
            margin: 0 0 3px 0;
            font-weight: bold;
        }
        .titulo {
            font-size: 11px;
            font-weight: bold;
            margin: 4px 0 2px 0;
            color: #4B0090;
            letter-spacing: 0.5px;
        }
        .meta-box {
            background-color: #faf8fd;
            border: 1px solid #e5d7f5;
            border-radius: 4px;
            padding: 6px 10px;
            margin-bottom: 10px;
            font-size: 8.5px;
            line-height: 1.4;
        }
        .meta-row {
            display: table;
            width: 100%;
        }
        .meta-col {
            display: table-cell;
            width: 33.33%;
            vertical-align: top;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            table-layout: fixed;
        }
        th {
            background: #4B0090;
            color: #ffffff;
            font-weight: bold;
            padding: 5px 6px;
            text-align: left;
            font-size: 8px;
            letter-spacing: 0.5px;
            border: 1px solid #4B0090;
        }
        td {
            padding: 4px 6px;
            border: 1px solid #e5e7eb;
            font-size: 8px;
            vertical-align: top;
            word-break: break-word;
            overflow-wrap: break-word;
        }
        tr:nth-child(even) td {
            background: #fbf9fe;
        }
        .col-id { width: 5%; text-align: center; font-weight: bold; }
        .col-fecha { width: 13%; white-space: nowrap; }
        .col-actor { width: 18%; }
        .col-accion { width: 18%; }
        .footer {
            margin-top: 10px;
            padding-top: 6px;
            border-top: 1px solid #e5e7eb;
            font-size: 7.5px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="membrete">
        <h1>GOBIERNO AUTÓNOMO MUNICIPAL DE EL ALTO</h1>
        <h2>UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCIÓN</h2>
        <div class="titulo">EXTRACTO {{ $proyeccion }} — CASO {{ $meta['ticket'] }}</div>
    </div>

    <div class="meta-box">
        <div class="meta-row">
            <div class="meta-col">
                <strong>Caso:</strong> #{{ $meta['caso_id'] }} ({{ $meta['ticket'] }})<br>
                <strong>Tipo:</strong> {{ $meta['tipo'] }}<br>
                <strong>Estado:</strong> {{ $meta['estado'] }}
            </div>
            <div class="meta-col">
                <strong>Fecha Ingreso:</strong> {{ $meta['fecha_ingreso'] }}<br>
                <strong>Generado el:</strong> {{ $meta['generado'] }}<br>
                <strong>Generado por:</strong> {{ $meta['generado_por'] }}
            </div>
            <div class="meta-col">
                <strong>Registros:</strong> {{ $meta['registros'] }}<br>
                <strong>Rango ID:</strong> {{ $meta['rango'] ?? '—' }}<br>
                <strong>Proyección:</strong> {{ $proyeccion }}
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                @foreach ($headings as $index => $heading)
                    <th @if($index === 0) class="col-id" @endif>{{ $heading }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($filas as $fila)
                <tr>
                    @foreach ($fila as $index => $valor)
                        <td @if($index === 0) class="col-id" @elseif($index === 1) class="col-fecha" @endif>
                            {{ $valor }}
                        </td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($headings) }}" style="text-align: center; padding: 16px; font-weight: bold; color: #6b7280;">
                        SIN EVENTOS REGISTRADOS
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Proyección: {{ $proyeccion }} (definida por el sistema según el rol del solicitante) · Documento oficial emitido conforme a la Ley N° 974.
    </div>
</body>
</html>
