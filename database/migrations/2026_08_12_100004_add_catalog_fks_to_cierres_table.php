<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cierres', function (Blueprint $table) {
            $table->foreignId('notificacion_medio_id')->nullable()->after('notificado_denunciante')
                ->constrained('medios_notificacion');
            $table->foreignId('cerrado_por_id')->nullable()->after('notificacion_medio_id')
                ->constrained('users');
            $table->dropColumn('notificacion_medio');
        });
    }

    public function down(): void
    {
        Schema::table('cierres', function (Blueprint $table) {
            $table->string('notificacion_medio', 200)->nullable()->after('notificado_denunciante');
            $table->dropForeign(['notificacion_medio_id']);
            $table->dropColumn('notificacion_medio_id');
            $table->dropForeign(['cerrado_por_id']);
            $table->dropColumn('cerrado_por_id');
        });
    }
};
