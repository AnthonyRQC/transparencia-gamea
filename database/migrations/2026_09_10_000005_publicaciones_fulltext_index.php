<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Solo MySQL soporta índices FULLTEXT (SQLite de tests usa LIKE).
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('publicaciones', function (Blueprint $table) {
            $table->fullText(
                ['cite', 'ref_titulo', 'resumen', 'referencia_externa', 'destinatario_display'],
                'publicaciones_fulltext'
            );
        });
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('publicaciones', function (Blueprint $table) {
            $table->dropFullText('publicaciones_fulltext');
        });
    }
};
