<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publicaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tipo_id')->constrained('tipos_publicacion');
            $table->foreignId('prioridad_id')->constrained('prioridades_publicacion');
            $table->string('cite', 255)->nullable();
            $table->date('fecha_documento')->nullable();
            $table->string('emisor', 255)->default('UTLCC');
            $table->string('destinatario_display', 255)->nullable();
            $table->string('ref_titulo', 140);
            $table->text('resumen')->nullable();
            $table->text('cuerpo')->nullable();
            $table->string('referencia_externa', 255)->nullable();
            $table->foreignId('denuncia_id')->nullable()->constrained('denuncias');
            $table->string('evento', 30)->nullable();
            $table->foreignId('publicado_por_id')->nullable()->constrained('users');
            $table->dateTime('publicado_at')->nullable();
            $table->boolean('fijada')->default(false);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();

            $table->index(['fijada', 'orden', 'publicado_at']);
            $table->index('publicado_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publicaciones');
    }
};
