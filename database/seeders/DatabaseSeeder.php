<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CatalogoSeeder::class,
            UserSeeder::class,
            DenunciaSeeder::class,
            DenunciaMasivaSeeder::class,
            NotificacionSeeder::class,
        ]);
    }
}
