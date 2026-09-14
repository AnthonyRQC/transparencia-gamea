<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publicaciones', function (Blueprint $table) {
            $table->foreignId('portada_archivo_id')->nullable()->after('orden')
                ->constrained('publicacion_archivos')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('publicaciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('portada_archivo_id');
        });
    }
};
