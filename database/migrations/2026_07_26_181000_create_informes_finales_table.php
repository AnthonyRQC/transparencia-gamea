<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('informes_finales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('denuncia_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('clasificacion', 30);
            $table->string('sitpreco', 50)->nullable();
            $table->integer('fojas')->nullable();
            $table->text('justificacion')->nullable();
            $table->string('concluido_por');
            $table->dateTime('redactado_at');
            $table->boolean('eliminado')->default(false);
            $table->dateTime('fecha_eliminacion')->nullable();
            $table->json('historial_ediciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('informes_finales');
    }
};
