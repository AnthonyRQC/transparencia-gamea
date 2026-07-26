<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cierres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('denuncia_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('notificado_denunciante');
            $table->string('notificacion_medio')->nullable();
            $table->dateTime('notificacion_fecha')->nullable();
            $table->text('notificacion_descripcion')->nullable();
            $table->text('no_notificado_motivo')->nullable();
            $table->string('concluido_por');
            $table->text('descripcion')->nullable();
            $table->dateTime('cerrado_at');
            $table->boolean('eliminado')->default(false);
            $table->dateTime('fecha_eliminacion')->nullable();
            $table->json('historial_ediciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cierres');
    }
};
