<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sprint 18C — delegaciones temporales de funciones (D23).
     * Aditivas, con vigencia perezosa y revocación lógica.
     */
    public function up(): void
    {
        Schema::create('delegaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->json('permisos');
            $table->timestamp('desde')->useCurrent();
            $table->timestamp('hasta')->nullable();
            $table->text('motivo');
            $table->foreignId('otorgado_por_id')->constrained('users');
            $table->timestamp('revocado_at')->nullable();
            $table->foreignId('revocado_por_id')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['user_id', 'revocado_at', 'hasta']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delegaciones');
    }
};
