<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('denunciados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('denuncia_id')->constrained()->cascadeOnDelete();
            $table->integer('orden')->default(0);
            $table->boolean('conoce_identidad');
            $table->string('nombres')->nullable();
            $table->string('dependencia')->nullable();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('denunciados');
    }
};
