<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('informes_finales', function (Blueprint $table) {
            $table->foreignId('clasificacion_id')->nullable()->after('denuncia_id')
                ->constrained('clasificaciones');
            $table->foreignId('clasificado_por_id')->nullable()->after('clasificacion_id')
                ->constrained('users');
            $table->dropColumn('clasificacion');
        });
    }

    public function down(): void
    {
        Schema::table('informes_finales', function (Blueprint $table) {
            $table->string('clasificacion', 30)->nullable()->after('denuncia_id');
            $table->dropForeign(['clasificacion_id']);
            $table->dropColumn('clasificacion_id');
            $table->dropForeign(['clasificado_por_id']);
            $table->dropColumn('clasificado_por_id');
        });
    }
};
