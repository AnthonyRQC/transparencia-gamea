<?php

namespace App\Data;

class DenunciaData
{
    private const SESSION_KEY = 'denuncias_mock';
    private const COUNTER_KEY = 'denuncia_counter';

    public static function getAll(): array
    {
        return session()->get(self::SESSION_KEY, []);
    }

    public static function add(array $data): string
    {
        $ticket = self::generateTicket();
        $data['ticket'] = $ticket;
        $data['created_at'] = now()->toDateTimeString();
        $data['estado'] = 'ingresada';

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
}
