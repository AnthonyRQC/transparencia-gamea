<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('descargos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('denuncia_id')->constrained()->cascadeOnDelete();
            $table->foreignId('denunciado_id')->constrained('denunciados');
            $table->dateTime('fecha_notificacion')->nullable();
            $table->string('medio', 200)->nullable();
            $table->string('respaldo_archivo_nombre')->nullable();
            $table->string('respaldo_archivo_path')->nullable();
            $table->string('respaldo_archivo_tamano')->nullable();
            $table->dateTime('fecha_vencimiento')->nullable();
            $table->dateTime('fecha_respuesta')->nullable();
            $table->text('resumen_descargo')->nullable();
            $table->string('estado', 20)->default('pendiente_notif');
            $table->text('motivo_cancelacion')->nullable();
            $table->dateTime('fecha_cancelacion')->nullable();
            $table->boolean('eliminado')->default(false);
            $table->dateTime('fecha_eliminacion')->nullable();
            $table->json('historial_ediciones')->nullable();
            $table->timestamps();

            $table->index('denuncia_id');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('descargos');
    }
};
