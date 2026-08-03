<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_informacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('denuncia_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dependencia_destino_id')->constrained('dependencias_externas');
            $table->text('detalle');
            $table->integer('plazo_dias')->default(10);
            $table->dateTime('fecha_envio');
            $table->dateTime('fecha_vencimiento');
            $table->dateTime('fecha_respuesta')->nullable();
            $table->text('respuesta')->nullable();
            $table->string('estado', 20)->default('pendiente');
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
        Schema::dropIfExists('solicitudes_informacion');
    }
};
