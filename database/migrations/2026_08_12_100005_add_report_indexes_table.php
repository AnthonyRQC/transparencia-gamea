<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('denuncias', function (Blueprint $table) {
            $table->index('tipo');
            $table->index('created_at');
        });

        Schema::table('informes_finales', function (Blueprint $table) {
            $table->index('redactado_at');
        });

        Schema::table('cierres', function (Blueprint $table) {
            $table->index('cerrado_at');
        });
    }

    public function down(): void
    {
        Schema::table('denuncias', function (Blueprint $table) {
            $table->dropIndex(['tipo']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('informes_finales', function (Blueprint $table) {
            $table->dropIndex(['redactado_at']);
        });

        Schema::table('cierres', function (Blueprint $table) {
            $table->dropIndex(['cerrado_at']);
        });
    }
};
