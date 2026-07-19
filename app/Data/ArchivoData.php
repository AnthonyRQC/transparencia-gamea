<?php

namespace App\Data;

use Carbon\Carbon;
use Illuminate\Support\Str;

class ArchivoData
{
    private const SESSION_KEY = 'archivos_mock';
    private const ID_COUNTER_KEY = 'archivo_id_counter';

    public static function getAll(): array
    {
        return session()->get(self::SESSION_KEY, []);
    }

    public static function getByDenuncia(string $ticket): array
    {
        return array_values(array_filter(self::getAll(), fn($a) =>
            ($a['denuncia_ticket'] ?? '') === $ticket && empty($a['eliminado'])
        ));
    }

    public static function find(int $id): ?array
    {
        foreach (self::getAll() as $a) {
            if (($a['id'] ?? 0) === $id) return $a;
        }
        return null;
    }

    public static function add(string $ticket, string $nombre, string $descripcion, string $contexto = 'general', ?string $mimeType = null): int
    {
        $items = self::getAll();
        $id = session()->get(self::ID_COUNTER_KEY, 0) + 1;
        session()->put(self::ID_COUNTER_KEY, $id);

        $items[] = [
            'id' => $id,
            'denuncia_ticket' => $ticket,
            'nombre' => $nombre,
            'mime_type' => $mimeType ?? 'application/octet-stream',
            'tamano' => rand(100, 5000) . ' KB',
            'descripcion' => $descripcion !== '' ? Str::upper($descripcion) : null,
            'contexto' => in_array($contexto, ['general', 'informe', 'cierre']) ? $contexto : 'general',
            'fecha_subida' => Carbon::now()->toDateTimeString(),
            'eliminado' => false,
            'fecha_eliminacion' => null,
        ];

        session()->put(self::SESSION_KEY, $items);
        return $id;
    }

    public static function softDelete(int $id): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $a) {
            if (($a['id'] ?? 0) === $id) {
                if (!empty($a['eliminado'])) return false;
                $items[$i]['eliminado'] = true;
                $items[$i]['fecha_eliminacion'] = Carbon::now()->toDateTimeString();
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }
}
