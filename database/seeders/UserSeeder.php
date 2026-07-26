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
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
