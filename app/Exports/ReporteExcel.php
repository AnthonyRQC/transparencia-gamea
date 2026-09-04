<?php

namespace App\Exports;

use App\Http\Controllers\ReporteController;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReporteExcel implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    /** @param array<int,string> $columnas claves de ReporteController::COLUMNAS_EXCEL */
    public function __construct(
        private readonly Collection $denuncias,
        private readonly array $columnas = ReporteController::COLUMNAS_DEFAULT,
    ) {
    }

    public function collection(): Collection
    {
        return $this->denuncias->map(fn ($d) => array_map(
            fn (string $col) => $this->valor($d, $col),
            $this->columnas
        ));
    }

    public function headings(): array
    {
        return array_map(
            fn (string $col) => ReporteController::COLUMNAS_EXCEL[$col] ?? strtoupper($col),
            $this->columnas
        );
    }

    public function styles(Worksheet $sheet): ?array
    {
        $ultima = $sheet->getHighestColumn();
        $sheet->getStyle("A1:{$ultima}1")->getFont()->setBold(true)->getColor()->setARGB('FFFFFF');
        $sheet->getStyle("A1:{$ultima}1")->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('690BB2');

        return [];
    }

    private function valor(mixed $d, string $col): string
    {
        return match ($col) {
            'ticket' => (string) $d->ticket,
            'tipo' => $d->tipo === 'corrupcion' ? 'CORRUPCIÓN' : 'NEGACIÓN DE INFORMACIÓN',
            'categoria' => (string) ($d->categoria?->nombre ?? ''),
            'tecnico' => (string) ($d->tecnico?->name ?? 'SIN ASIGNAR'),
            'estado' => $d->estado === 'cerrada' && $d->subestado === 'archivada'
                ? 'CERRADA · ARCHIVADA'
                : strtoupper(str_replace('_', ' ', (string) $d->estado)),
            'fecha_ingreso' => $d->created_at?->format('d/m/Y') ?? '',
            'fecha_admision' => $d->fecha_admitida?->format('d/m/Y') ?? '',
            'fecha_rechazo' => $d->fecha_rechazada?->format('d/m/Y') ?? '',
            'escenario' => strtoupper((string) ($d->escenario ?? '')),
            'clasificacion' => (string) ($d->informe?->clasificacionRel?->nombre ?? ''),
            'medio_cierre' => (string) ($d->cierre?->medioNotificacion?->nombre ?? ''),
            'fecha_cierre' => $d->cierre?->cerrado_at?->format('d/m/Y') ?? '',
            'dias_restantes' => ($p = $d->plazo) !== null ? (string) $p['dias_restantes'] : '—',
            // Columnas formato cliente (informe a la MAE)
            'denunciante' => $this->denunciante($d),
            'denunciados' => $this->denunciados($d),
            'sitpreco' => (string) ($d->informe?->sitpreco ?? ''),
            'fecha_conclusion' => $d->informe?->redactado_at?->format('d/m/Y') ?? '',
            'resumen_conclusion' => (string) ($d->informe?->justificacion ?? ''),
            default => '',
        };
    }

    /**
     * Solo nombres (sin CI ni contactos, Ley 974 Art. 24/29).
     * Anónimo o sin registro → ANÓNIMO.
     */
    private function denunciante(mixed $d): string
    {
        if (($d->escenario ?? '') === 'anonimo') {
            return 'ANÓNIMO';
        }
        $nombre = trim((string) ($d->denunciante?->nombres ?? ''));

        return $nombre !== '' ? $nombre : 'ANÓNIMO';
    }

    /** Nombres separados por coma; sin identidad → NO IDENTIFICADO. */
    private function denunciados(mixed $d): string
    {
        $lista = $d->relationLoaded('denunciados')
            ? $d->denunciados
            : $d->denunciados()->get();

        if ($lista->isEmpty()) {
            return '—';
        }

        return $lista->map(function ($dd) {
            if (! $dd->conoce_identidad || trim((string) ($dd->nombres ?? '')) === '') {
                return 'NO IDENTIFICADO';
            }
            $dep = trim((string) ($dd->dependencia ?? ''));

            return $dep !== '' ? "{$dd->nombres} ({$dep})" : (string) $dd->nombres;
        })->implode(', ');
    }
}
