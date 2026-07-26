<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('denuncias_archivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('denuncia_id')->constrained()->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('users');
            $table->string('nombre');
            $table->string('path');
            $table->string('tamano')->nullable();
            $table->string('mime_type')->nullable();
            $table->text('descripcion')->nullable();
            $table->string('contexto', 20)->default('general');
            $table->string('contexto_entidad_type')->nullable();
            $table->unsignedBigInteger('contexto_entidad_id')->nullable();
            $table->index(['contexto_entidad_type', 'contexto_entidad_id'], 'da_ctx_entidad_idx');
            $table->dateTime('fecha_eliminacion')->nullable();
            $table->dateTime('fecha_subida');
            $table->timestamps();

            $table->index('contexto');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('denuncias_archivos');
    }
};
