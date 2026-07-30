<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            $table->foreignId('denuncia_id')->nullable()->change();
            $table->string('entidad_tipo', 50)->nullable()->after('denuncia_id');
            $table->unsignedBigInteger('entidad_id')->nullable()->after('entidad_tipo');
            $table->index(['entidad_tipo', 'entidad_id']);
        });
    }

    public function down(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            $table->foreignId('denuncia_id')->nullable(false)->change();
            $table->dropIndex(['entidad_tipo', 'entidad_id']);
            $table->dropColumn(['entidad_tipo', 'entidad_id']);
        });
    }
};
