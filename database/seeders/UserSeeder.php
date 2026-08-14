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
                'username' => 'tecnico1',
                'name' => 'CARLOS QUISPE',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'CQ',
                'color' => 'bg-amber-500',
                'activo' => true,
                'telefono' => '71234569',
            ],
            [
                'username' => 'tecnico2',
                'name' => 'ANA TORRES',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'AT',
                'color' => 'bg-green-500',
                'activo' => true,
                'telefono' => '71234570',
            ],
            [
                'username' => 'tecnico3',
                'name' => 'LUIS MAMANI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'LM',
                'color' => 'bg-rose-500',
                'activo' => true,
                'telefono' => '71234571',
            ],
            [
                'username' => 'tecnico4',
                'name' => 'JORGE APAZA',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'JA',
                'color' => 'bg-emerald-500',
                'activo' => true,
                'telefono' => '71234572',
            ],
            [
                'username' => 'tecnico5',
                'name' => 'KARINA VILLCA',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'KV',
                'color' => 'bg-amber-500',
                'activo' => true,
                'telefono' => '71234573',
            ],
            [
                'username' => 'tecnico6',
                'name' => 'MIGUEL CONDORI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'MC',
                'color' => 'bg-green-500',
                'activo' => true,
                'telefono' => '71234574',
            ],
            [
                'username' => 'tecnico7',
                'name' => 'VERÓNICA MAMANI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'VM',
                'color' => 'bg-emerald-500',
                'activo' => true,
                'telefono' => '71234575',
            ],
            [
                'username' => 'tecnico8',
                'name' => 'RODRIGO HUANCA',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'RH',
                'color' => 'bg-amber-500',
                'activo' => true,
                'telefono' => '71234576',
            ],
            [
                'username' => 'tecnico9',
                'name' => 'CINDY LIMACHI',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
                'iniciales' => 'CL',
                'color' => 'bg-green-500',
                'activo' => true,
                'telefono' => '71234577',
            ],
            [
                'username' => 'tecnico10',
                'name' => 'PABLO SILES',
                'email' => null,
                'password' => Hash::make('demo123'),
                'rol' => 'tecnico',
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
