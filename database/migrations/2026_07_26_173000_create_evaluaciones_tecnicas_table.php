<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluaciones_tecnicas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('denuncia_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tecnico_id')->constrained('users');
            $table->foreignId('delegada_por_id')->constrained('users');
            $table->dateTime('delegada_at');
            $table->text('justificacion_delegacion')->nullable();
            $table->text('texto_evaluacion')->nullable();
            $table->string('recomendacion', 20)->nullable();
            $table->dateTime('devuelta_at')->nullable();
            $table->foreignId('devuelta_por_id')->nullable()->constrained('users');
            $table->string('estado', 20)->default('pendiente');
            $table->timestamps();

            $table->index(['denuncia_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones_tecnicas');
    }
};
