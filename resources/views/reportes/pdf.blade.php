<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de Denuncias — UTLCC</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #1f2937;
            margin: 0;
            padding: 24px;
        }
        .membrete {
            text-align: center;
            border-bottom: 3px solid #690bb2;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .membrete h1 {
            font-size: 13px;
            margin: 0 0 2px 0;
            color: #690bb2;
            letter-spacing: 1px;
        }
        .membrete h2 { font-size: 11px; margin: 0 0 4px 0; font-weight: bold; }
        .membrete p { margin: 0; font-size: 9px; color: #4b5563; }
        .titulo { font-size: 11px; font-weight: bold; margin: 10px 0 6px 0; color: #690bb2; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th {
            background: #690bb2;
            color: #ffffff;
            font-weight: bold;
            padding: 5px 6px;
            text-align: left;
            font-size: 8px;
            letter-spacing: 0.5px;
        }
        td { padding: 4px 6px; border: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f9f5ff; }
        .kpi-row td { font-size: 10px; }
        .kpi-row td b { font-size: 13px; color: #690bb2; }
        .footer {
            margin-top: 16px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
            font-size: 8px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="membrete">
        <h1>GOBIERNO AUTÓNOMO MUNICIPAL DE EL ALTO</h1>
        <h2>UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCIÓN</h2>
        <p>Reporte de Denuncias — Ley N° 974 · Generado el {{ $generado }}</p>
    </div>

    <div class="titulo">RESUMEN EJECUTIVO</div>
    <table class="kpi-row">
        <tr>
            <td><b>{{ $resumen['total'] }}</b><br>TOTAL</td>
            <td><b>{{ $resumen['activas'] }}</b><br>ACTIVAS</td>
            <td><b>{{ $resumen['cerradas'] }}</b><br>CERRADAS</td>
            <td><b>{{ $resumen['rechazadas'] }}</b><br>RECHAZADAS</td>
            <td><b>{{ $resumen['corrupcion'] }}</b><br>CORRUPCIÓN</td>
            <td><b>{{ $resumen['negacion'] }}</b><br>NEGACIÓN</td>
        </tr>
    </table>

    <div class="titulo">LISTADO DE DENUNCIAS</div>
    <table>
        <thead>
            <tr>
                <th>TICKET</th>
                <th>TIPO</th>
                <th>CATEGORÍA</th>
                <th>TÉCNICO</th>
                <th>ESTADO</th>
                <th>FECHA INGRESO</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($denuncias as $d)
                <tr>
                    <td>{{ $d->ticket }}</td>
                    <td>{{ $d->tipo === 'corrupcion' ? 'CORRUPCIÓN' : 'NEGACIÓN DE INFORMACIÓN' }}</td>
                    <td>{{ $d->categoria?->nombre ?? '' }}</td>
                    <td>{{ $d->tecnico?->name ?? 'SIN ASIGNAR' }}</td>
                    <td>{{ $d->estado === 'cerrada' && $d->subestado === 'archivada' ? 'CERRADA · ARCHIVADA' : strtoupper(str_replace('_', ' ', $d->estado)) }}</td>
                    <td>{{ $d->created_at?->format('d/m/Y') }}</td>
                </tr>
            @empty
                <tr><td colspan="6" style="text-align:center">NO HAY DENUNCIAS PARA LOS FILTROS SELECCIONADOS</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        GAMEA · UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCIÓN · DOCUMENTO INSTITUCIONAL
    </div>
</body>
</html>
