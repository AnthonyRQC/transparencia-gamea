<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'username' => 'admin',
                'name' => 'ADMINISTRADOR SISTEMAS',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'admin',
                'iniciales' => 'AD',
                'color' => 'bg-primary',
                'activo' => true,
                'telefono' => null,
            ],
            [
                'username' => 'jefe',
                'name' => 'PEDRO MAMANI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'jefe',
                'iniciales' => 'PM',
                'color' => 'bg-purple-500',
                'activo' => true,
                'telefono' => '71234567',
            ],
            [
                'username' => 'registrador',
                'name' => 'MARÍA GARCÍA',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'registrador',
                'iniciales' => 'MG',
                'color' => 'bg-blue-500',
                'activo' => true,
                'telefono' => '71234568',
            ],
            [
                'username' => 'investigador1',
                'name' => 'CARLOS QUISPE',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'CQ',
                'color' => 'bg-amber-500',
                'activo' => true,
                'telefono' => '71234569',
            ],
            [
                'username' => 'investigador2',
                'name' => 'ANA TORRES',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'AT',
                'color' => 'bg-green-500',
                'activo' => true,
                'telefono' => '71234570',
            ],
            [
                'username' => 'investigador3',
                'name' => 'LUIS MAMANI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'LM',
                'color' => 'bg-rose-500',
                'activo' => true,
                'telefono' => '71234571',
            ],
            [
                'username' => 'investigador4',
                'name' => 'JORGE APAZA',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'JA',
                'color' => 'bg-emerald-500',
                'activo' => true,
                'telefono' => '71234572',
            ],
            [
                'username' => 'investigador5',
                'name' => 'KARINA VILLCA',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'KV',
                'color' => 'bg-amber-500',
                'activo' => true,
                'telefono' => '71234573',
            ],
            [
                'username' => 'investigador6',
                'name' => 'MIGUEL CONDORI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'MC',
                'color' => 'bg-green-500',
                'activo' => true,
                'telefono' => '71234574',
            ],
            [
                'username' => 'investigador7',
                'name' => 'VERÓNICA MAMANI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'VM',
                'color' => 'bg-emerald-500',
                'activo' => true,
                'telefono' => '71234575',
            ],
            [
                'username' => 'investigador8',
                'name' => 'RODRIGO HUANCA',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'RH',
                'color' => 'bg-amber-500',
                'activo' => true,
                'telefono' => '71234576',
            ],
            [
                'username' => 'investigador9',
                'name' => 'CINDY LIMACHI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'CL',
                'color' => 'bg-green-500',
                'activo' => true,
                'telefono' => '71234577',
            ],
            [
                'username' => 'investigador10',
                'name' => 'PABLO SILES',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'investigador',
                'iniciales' => 'PS',
                'color' => 'bg-emerald-500',
                'activo' => true,
                'telefono' => '71234578',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
