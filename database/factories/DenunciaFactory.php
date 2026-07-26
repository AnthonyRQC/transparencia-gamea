<?php

namespace Database\Factories;

use App\Models\Denuncia;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DenunciaFactory extends Factory
{
    protected $model = Denuncia::class;

    public function definition(): array
    {
        return [
            'ticket' => 'DEN-' . now()->year . '-' . fake()->unique()->numerify('####'),
            'token_consulta' => fake()->numerify('####'),
            'tipo' => fake()->randomElement(['corrupcion', 'negacion']),
            'escenario' => 'revelada',
            'estado' => 'ingresada',
            'categoria_id' => null,
            'hechos' => fake()->sentence(20),
            'declaracion_jurada' => true,
            'registrado_por_id' => User::factory(),
        ];
    }
}
