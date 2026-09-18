<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sprint 18A — identidad real: un humano = un CI = una cuenta.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nombres', 100)->after('name');
            $table->string('apellidos', 100)->after('nombres');
            $table->string('ci', 20)->unique()->after('apellidos');
            $table->foreignId('creado_por_id')->nullable()->after('preferencias')->constrained('users')->nullOnDelete();
            $table->foreignId('desactivado_por_id')->nullable()->after('creado_por_id')->constrained('users')->nullOnDelete();
            $table->timestamp('desactivado_at')->nullable()->after('desactivado_por_id');
            $table->text('motivo_baja')->nullable()->after('desactivado_at');
            $table->boolean('debe_cambiar_password')->default(false)->after('motivo_baja');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('creado_por_id');
            $table->dropConstrainedForeignId('desactivado_por_id');
            $table->dropColumn(['nombres', 'apellidos', 'ci', 'desactivado_at', 'motivo_baja', 'debe_cambiar_password']);
        });
    }
};
