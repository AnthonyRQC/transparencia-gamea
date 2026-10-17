<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExtractoExcel implements FromCollection, WithHeadings, WithColumnWidths, WithStyles
{
    public function __construct(
        private readonly array $headings,
        private readonly Collection $filas,
        private readonly array $widths = [],
    ) {
    }

    public function collection(): Collection
    {
        return $this->filas->map(fn ($fila) => array_map(
            fn ($val) => self::sanitizar((string) ($val ?? '')),
            is_array($fila) ? $fila : (array) $fila
        ));
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function columnWidths(): array
    {
        $map = [];
        $colLetter = 'A';
        foreach ($this->widths as $width) {
            $map[$colLetter] = $width;
            $colLetter++;
        }
        return $map;
    }

    public function styles(Worksheet $sheet): ?array
    {
        $ultima = $sheet->getHighestColumn();
        $sheet->getStyle("A1:{$ultima}1")->getFont()->setBold(true)->getColor()->setARGB('FFFFFF');
        $sheet->getStyle("A1:{$ultima}1")->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('4B0090');

        $highestRow = $sheet->getHighestRow();
        if ($highestRow >= 1) {
            $sheet->getStyle("A1:{$ultima}{$highestRow}")->getAlignment()->setWrapText(true);
        }

        return [];
    }

    /**
     * Neutraliza formula injection (OWASP CSV): las celdas de texto que
     * inician con = + - @ se prefijan con comilla simple.
     */
    public static function sanitizar(string $valor): string
    {
        return $valor !== '' && preg_match('/^[=+\-@]/', $valor) === 1
            ? "'" . $valor
            : $valor;
    }
}
