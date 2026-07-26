<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('denuncias', function (Blueprint $table) {
            $table->id();
            $table->string('ticket', 20)->unique();
            $table->string('token_consulta', 4);
            $table->string('tipo', 20);
            $table->string('escenario', 20)->default('revelada');
            $table->string('estado', 30)->default('ingresada');
            $table->string('subestado', 30)->nullable();
            $table->foreignId('categoria_id')->nullable()->constrained('categorias_denuncia');
            $table->date('fecha_hechos')->nullable();
            $table->string('hora_hechos', 10)->nullable();
            $table->text('lugar_hechos')->nullable();
            $table->text('hechos');
            $table->boolean('declaracion_jurada')->default(true);
            $table->foreignId('tecnico_id')->nullable()->constrained('users');
            $table->foreignId('tecnico_anterior_id')->nullable()->constrained('users');
            $table->dateTime('fecha_admitida')->nullable();
            $table->text('justificacion_admision')->nullable();
            $table->dateTime('fecha_rechazada')->nullable();
            $table->text('justificacion_rechazo')->nullable();
            $table->string('resumen_rechazo', 200)->nullable();
            $table->dateTime('fecha_asignada')->nullable();
            $table->foreignId('registrado_por_id')->nullable()->constrained('users');
            $table->string('sitpreco_rechazo', 50)->nullable();
            $table->boolean('es_legacy')->default(false);
            $table->json('traspaso_json')->nullable();
            $table->json('reapertura_json')->nullable();
            $table->json('conciliacion_json')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('estado');
            $table->index('tecnico_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('denuncias');
    }
};
