<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            $table->string('user_agent', 512)->nullable()->after('usuario_id');
            $table->index(['usuario_id', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            $table->dropIndex(['usuario_id', 'fecha']);
            $table->dropColumn(['user_agent']);
        });
    }
};
