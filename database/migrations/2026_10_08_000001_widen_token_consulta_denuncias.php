<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite no impone longitud en VARCHAR: solo MySQL necesita el cambio.
        if (DB::getDriverName() === 'mysql' && Schema::hasColumn('denuncias', 'token_consulta')) {
            DB::statement('ALTER TABLE `denuncias` MODIFY `token_consulta` VARCHAR(6) NOT NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql' && Schema::hasColumn('denuncias', 'token_consulta')) {
            DB::statement('ALTER TABLE `denuncias` MODIFY `token_consulta` VARCHAR(4) NOT NULL');
        }
    }
};
