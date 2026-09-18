<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'TEST USER',
                'telefono' => '71234567',
                'email' => null,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('TEST USER', $user->name);
        $this->assertSame('71234567', $user->telefono);
    }

    public function test_user_cannot_delete_their_account(): void
    {
        // 16.2: nunca delete físico (D16/D20). La ruta no existe.
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response->assertStatus(405);

        $this->assertAuthenticated();
        $this->assertNotNull($user->fresh());
    }
}
