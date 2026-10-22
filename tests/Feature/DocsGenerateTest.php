<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class DocsGenerateTest extends TestCase
{
    use RefreshDatabase;

    private string $tmp;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tmp = sys_get_temp_dir().'/docs-generate-test-'.uniqid();
        mkdir($this->tmp, 0755, true);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->tmp);

        parent::tearDown();
    }

    public function test_generates_expected_docs_to_output_dir(): void
    {
        $this->artisan('docs:generate', ['--output' => $this->tmp])->assertOk();

        $this->assertFileExists($this->tmp.'/ROUTES.md');
        $this->assertFileExists($this->tmp.'/PERMISSIONS.md');
        $this->assertFileExists($this->tmp.'/SCHEMA.md');
        $this->assertFileExists($this->tmp.'/STATUS.md');

        $this->assertStringContainsString('/seguimiento', File::get($this->tmp.'/ROUTES.md'));
        $this->assertStringContainsString('menu.auditoria', File::get($this->tmp.'/PERMISSIONS.md'));
        $this->assertStringContainsString('denuncias', File::get($this->tmp.'/SCHEMA.md'));
    }

    public function test_check_passes_when_up_to_date_and_fails_when_altered(): void
    {
        $this->artisan('docs:generate', ['--output' => $this->tmp])->assertOk();

        $this->artisan('docs:generate', ['--check' => true, '--output' => $this->tmp])->assertOk();

        File::append($this->tmp.'/ROUTES.md', "\n<!-- alterado -->\n");

        $this->artisan('docs:generate', ['--check' => true, '--output' => $this->tmp])->assertFailed();
    }

    public function test_check_is_portable_but_full_covers_env_files(): void
    {
        $this->artisan('docs:generate', ['--output' => $this->tmp])->assertOk();

        // Alterar ROUTES.md hace fallar el check portatil.
        File::append($this->tmp.'/ROUTES.md', "\n<!-- alterado -->\n");
        $this->artisan('docs:generate', ['--check' => true, '--output' => $this->tmp])->assertFailed();

        // Restaurar: el check portatil y el full pasan en el mismo entorno.
        $this->artisan('docs:generate', ['--output' => $this->tmp])->assertOk();
        $this->artisan('docs:generate', ['--check' => true, '--output' => $this->tmp])->assertOk();
        $this->artisan('docs:generate', ['--check' => true, '--full' => true, '--output' => $this->tmp])->assertOk();

        // Alterar STATUS.md o SCHEMA.md NO hace fallar el check portatil,
        // pero si el check full.
        File::append($this->tmp.'/STATUS.md', "\n<!-- alterado -->\n");
        File::append($this->tmp.'/SCHEMA.md', "\n<!-- alterado -->\n");
        $this->artisan('docs:generate', ['--check' => true, '--output' => $this->tmp])->assertOk();
        $this->artisan('docs:generate', ['--check' => true, '--full' => true, '--output' => $this->tmp])->assertFailed();
    }
}
