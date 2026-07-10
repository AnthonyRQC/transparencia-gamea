<?php

namespace App\Data;

class SesionUsuarioData
{
    private const SESSION_KEY = 'demo_user_id';

    public const USUARIOS = [
        'registrador-1' => [
            'id' => 'registrador-1',
            'nombre' => 'María García',
            'iniciales' => 'MG',
            'color' => 'bg-purple-500',
            'rol' => 'registrador',
            'rol_label' => 'Registrador',
        ],
        'jefe-1' => [
            'id' => 'jefe-1',
            'nombre' => 'Pedro Mamani',
            'iniciales' => 'PM',
            'color' => 'bg-amber-600',
            'rol' => 'jefe',
            'rol_label' => 'Jefe de Unidad',
        ],
        'tec-1' => [
            'id' => 'tec-1',
            'nombre' => 'Carlos Quispe',
            'iniciales' => 'CQ',
            'color' => 'bg-blue-500',
            'rol' => 'tecnico',
            'rol_label' => 'Técnico',
        ],
        'tec-2' => [
            'id' => 'tec-2',
            'nombre' => 'Ana Torres',
            'iniciales' => 'AT',
            'color' => 'bg-pink-500',
            'rol' => 'tecnico',
            'rol_label' => 'Técnico',
        ],
        'tec-3' => [
            'id' => 'tec-3',
            'nombre' => 'Luis Mamani',
            'iniciales' => 'LM',
            'color' => 'bg-green-500',
            'rol' => 'tecnico',
            'rol_label' => 'Técnico',
        ],
    ];

    public static function getAll(): array
    {
        return self::USUARIOS;
    }

    public static function getCurrent(): array
    {
        $userId = session()->get(self::SESSION_KEY, 'jefe-1');
        return self::USUARIOS[$userId] ?? self::USUARIOS['jefe-1'];
    }

    public static function switchTo(string $userId): bool
    {
        if (!isset(self::USUARIOS[$userId])) {
            return false;
        }
        session()->put(self::SESSION_KEY, $userId);
        return true;
    }
}
