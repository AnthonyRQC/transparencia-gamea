<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ampliaciones', function (Blueprint $table) {
            $table->id();
            $table->morphs('entidad');
            $table->integer('dias');
            $table->text('justificacion');
            $table->integer('numero')->nullable();
            $table->foreignId('aprobado_por_id')->nullable()->constrained('users');
            $table->string('solicitado_por')->nullable();
            $table->string('archivo_respaldo')->nullable();
            $table->dateTime('fecha');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ampliaciones');
    }
};
