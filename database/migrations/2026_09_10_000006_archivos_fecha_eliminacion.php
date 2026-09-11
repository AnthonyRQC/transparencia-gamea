<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publicacion_archivos', function (Blueprint $table) {
            $table->dateTime('fecha_eliminacion')->nullable()->after('hash');
        });
    }

    public function down(): void
    {
        Schema::table('publicacion_archivos', function (Blueprint $table) {
            $table->dropColumn('fecha_eliminacion');
        });
    }
};
