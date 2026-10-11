<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pruebas', function (Blueprint $table) {
            $table->string('testigo_ci', 20)->nullable()->after('testigo_telefono');
        });
    }

    public function down(): void
    {
        Schema::table('pruebas', function (Blueprint $table) {
            $table->dropColumn('testigo_ci');
        });
    }
};
