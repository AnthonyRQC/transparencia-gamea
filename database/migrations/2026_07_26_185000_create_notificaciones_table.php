<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->string('tipo');
            $table->string('titulo');
            $table->text('mensaje');
            $table->string('ticket')->nullable();
            $table->string('destino_url');
            $table->string('icono', 50)->default('Bell');
            $table->string('color', 20)->default('primary');
            $table->boolean('leida')->default(false);
            $table->dateTime('fecha_leida')->nullable();
            $table->dateTime('fecha');
            $table->timestamps();

            $table->index(['usuario_id', 'leida', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
