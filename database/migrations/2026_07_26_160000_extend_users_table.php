<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->after('id');
            $table->string('rol', 20)->after('password');
            $table->string('iniciales', 2)->nullable()->after('rol');
            $table->string('color', 20)->nullable()->after('iniciales');
            $table->boolean('activo')->default(true)->after('color');
            $table->string('telefono', 20)->nullable()->after('activo');
            $table->json('preferencias')->nullable()->after('telefono');
            $table->string('email', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'rol', 'iniciales', 'color', 'activo', 'telefono', 'preferencias']);
            $table->string('email', 255)->nullable(false)->change();
        });
    }
};
