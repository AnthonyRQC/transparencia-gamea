<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('denunciantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('denuncia_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('nombres')->nullable();
            $table->string('ci')->nullable();
            $table->string('email')->nullable();
            $table->string('telefono')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('denunciantes');
    }
};
