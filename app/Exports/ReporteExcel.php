<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReporteExcel implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function __construct(private readonly Collection $denuncias)
    {
    }

    public function collection(): Collection
    {
        return $this->denuncias->map(function ($d) {
            $estado = strtoupper($d->estado);
            if ($d->estado === 'cerrada' && $d->subestado === 'archivada') {
                $estado = 'CERRADA · ARCHIVADA';
            }

            return [
                $d->ticket,
                $d->tipo === 'corrupcion' ? 'CORRUPCIÓN' : 'NEGACIÓN DE INFORMACIÓN',
                $d->categoria?->nombre ?? '',
                $d->tecnico?->name ?? '',
                $estado,
                $d->created_at?->format('d/m/Y'),
                $d->fecha_admitida?->format('d/m/Y'),
                $d->fecha_rechazada?->format('d/m/Y'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'TICKET',
            'TIPO',
            'CATEGORÍA',
            'TÉCNICO',
            'ESTADO',
            'FECHA INGRESO',
            'FECHA ADMISIÓN',
            'FECHA RECHAZO',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->getFont()->setBold(true)->getColor()->setARGB('FFFFFF');
        $sheet->getStyle('A1:H1')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('690BB2');

        return [];
    }
}
