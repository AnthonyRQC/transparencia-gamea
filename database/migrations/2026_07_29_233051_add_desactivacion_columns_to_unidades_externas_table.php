<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dependencias_externas', function (Blueprint $table) {
            $table->dateTime('fecha_desactivacion')->nullable()->after('activa');
            $table->foreignId('desactivado_por_id')->nullable()->constrained('users')->after('fecha_desactivacion');
        });
    }

    public function down(): void
    {
        Schema::table('dependencias_externas', function (Blueprint $table) {
            $table->dropColumn(['fecha_desactivacion', 'desactivado_por_id']);
        });
    }
};
