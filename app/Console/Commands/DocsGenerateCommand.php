<?php

namespace App\Console\Commands;

use App\Data\PermisosCatalogo;
use Illuminate\Console\Command;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

class DocsGenerateCommand extends Command
{
    protected $signature = 'docs:generate
        {--check : Regenerate in memory and compare with committed files without writing (exit 1 on differences)}
        {--full : With --check, also verify SCHEMA.md and STATUS.md (require the real environment)}
        {--output= : Target directory for generated docs (defaults to docs/)}';

    protected $description = 'Generate docs/ROUTES.md, PERMISSIONS.md, SCHEMA.md and STATUS.md from code';

    private const PORTABLE_FILES = ['ROUTES.md', 'PERMISSIONS.md'];

    private const ENV_FILES = ['SCHEMA.md', 'STATUS.md'];

    public function handle(): int
    {
        $target = $this->targetDirectory();

        $generated = [
            'ROUTES.md' => $this->buildRoutes(),
            'PERMISSIONS.md' => $this->buildPermissions(),
            'SCHEMA.md' => $this->buildSchema(),
            'STATUS.md' => $this->buildStatus(),
        ];

        if ($this->option('check')) {
            return $this->check($target, $generated);
        }

        if (! is_dir($target) && ! mkdir($target, 0755, true) && ! is_dir($target)) {
            $this->error("No se pudo crear el directorio: {$target}");

            return 1;
        }

        foreach ($generated as $file => $content) {
            file_put_contents($target.DIRECTORY_SEPARATOR.$file, $content);
            $this->info("Generado {$file}");
        }

        return 0;
    }

    private function targetDirectory(): string
    {
        $output = $this->option('output');

        if (! $output) {
            return base_path('docs');
        }

        if (preg_match('/^([A-Za-z]:[\\\\\\/]|\\\\\\\\|\\/)/', $output)) {
            return $output;
        }

        return base_path($output);
    }

    private function check(string $target, array $generated): int
    {
        // Portable gate: ROUTES.md and PERMISSIONS.md only depend on code.
        // SCHEMA.md depends on the DB engine and STATUS.md on versions/test counts,
        // so they are only verified with --full in the target environment.
        if (! $this->option('full')) {
            $generated = array_intersect_key($generated, array_flip(self::PORTABLE_FILES));
            $this->info('Omite '.implode(' y ', self::ENV_FILES).' (dependen del entorno). Usa --full para incluirlos.');
        }

        $differ = [];

        foreach ($generated as $file => $content) {
            $path = $target.DIRECTORY_SEPARATOR.$file;
            $current = is_file($path) ? file_get_contents($path) : null;

            if ($current === $content) {
                $this->info("OK {$file}");
            } else {
                $differ[] = $file;
                $this->error($current === null ? "Falta {$file}" : "Difiere {$file}");
            }
        }

        if ($differ !== []) {
            $this->error('docs:check fallo en: '.implode(', ', $differ).'. Ejecuta `composer docs` para regenerar.');

            return 1;
        }

        $this->info('docs:check OK: '.count($generated).' archivos coinciden con el codigo.');

        return 0;
    }

    private function buildRoutes(): string
    {
        $rows = [];

        foreach (Route::getRoutes() as $route) {
            $methods = array_values(array_unique($route->methods()));
            sort($methods);

            $middleware = array_values(array_unique(array_filter(
                $route->gatherMiddleware(),
                fn ($m) => is_string($m) && ! str_starts_with($m, 'can:')
            )));

            $permissions = array_values(array_unique(array_filter(
                array_map(
                    fn ($m) => is_string($m) && str_starts_with($m, 'can:') ? substr($m, 4) : null,
                    $route->gatherMiddleware()
                )
            )));

            $rows[] = [
                'methods' => implode('|', $methods),
                'uri' => $route->uri(),
                'name' => $route->getName() ?? '-',
                'middleware' => $middleware === [] ? '-' : implode(',', $middleware),
                'permission' => $permissions === [] ? '-' : implode(',', $permissions),
            ];
        }

        usort($rows, fn ($a, $b) => [$a['uri'], $a['methods']] <=> [$b['uri'], $b['methods']]);

        $lines = [
            '# ROUTES.md — Rutas generadas desde el codigo',
            '',
            '> No editar a mano. Se regenera con `composer docs` y se verifica con `composer docs:check`.',
            '',
            '| Metodo | URI | Nombre | Middleware | Permiso |',
            '| --- | --- | --- | --- | --- |',
        ];

        foreach ($rows as $row) {
            $lines[] = '| '.$this->cell($row['methods']).' | /'.$this->cell(ltrim($row['uri'], '/'))
                .' | '.$this->cell($row['name']).' | '.$this->cell($row['middleware'])
                .' | '.$this->cell($row['permission']).' |';
        }

        return implode("\n", $lines)."\n";
    }

    private function buildPermissions(): string
    {
        $permisos = PermisosCatalogo::PERMISOS;
        ksort($permisos);

        $delegables = array_flip(PermisosCatalogo::DELEGABLE);

        $roles = PermisosCatalogo::ROLES;
        ksort($roles);
        foreach ($roles as $rol => $lista) {
            sort($lista);
            $roles[$rol] = $lista;
        }

        $lines = [
            '# PERMISSIONS.md — Permisos y roles generados desde el codigo',
            '',
            '> No editar a mano. Fuente: `app/Data/PermisosCatalogo.php`. Se regenera con `composer docs`.',
            '',
            '## Catalogo de permisos',
            '',
            '| Permiso | Descripcion | Delegable |',
            '| --- | --- | --- |',
        ];

        foreach ($permisos as $permiso => $descripcion) {
            $lines[] = '| '.$this->cell($permiso).' | '.$this->cell($descripcion)
                .' | '.(isset($delegables[$permiso]) ? 'si' : '-').' |';
        }

        $lines[] = '';
        $lines[] = '## Matriz de roles';
        $lines[] = '';
        $lines[] = '| Permiso | '.implode(' | ', array_map(fn ($r) => $this->cell($r), array_keys($roles))).' |';
        $lines[] = '| --- | '.implode(' | ', array_fill(0, count($roles), '---')).' |';

        foreach (array_keys($permisos) as $permiso) {
            $cells = array_map(
                fn ($lista) => in_array($permiso, $lista, true) ? 'x' : '',
                array_values($roles)
            );
            $lines[] = '| '.$this->cell($permiso).' | '.implode(' | ', $cells).' |';
        }

        return implode("\n", $lines)."\n";
    }

    private function buildSchema(): string
    {
        $tables = [];

        foreach (Schema::getTables() as $table) {
            $name = is_array($table) ? ($table['name'] ?? null) : (string) $table;
            if (! $name || str_starts_with($name, 'sqlite_')) {
                continue;
            }
            $tables[] = $name;
        }
        sort($tables);

        $lines = [
            '# SCHEMA.md — Esquema de base de datos generado desde el codigo',
            '',
            '> No editar a mano. Fuente: introspeccion del esquema (`Schema::getTables()` / `Schema::getColumns()`). Se regenera con `composer docs`.',
            '',
        ];

        foreach ($tables as $table) {
            $lines[] = "## {$table}";
            $lines[] = '';
            $lines[] = '| Columna | Tipo | Nullable | Default |';
            $lines[] = '| --- | --- | --- | --- |';

            $columns = Schema::getColumns($table);
            usort($columns, fn ($a, $b) => ($a['name'] ?? '') <=> ($b['name'] ?? ''));

            foreach ($columns as $column) {
                $lines[] = '| '.$this->cell($column['name'] ?? '?')
                    .' | '.$this->cell($column['type'] ?? ($column['type_name'] ?? '?'))
                    .' | '.(($column['nullable'] ?? false) ? 'si' : 'no')
                    .' | '.$this->cell($this->formatDefault($column['default'] ?? null)).' |';
            }

            $lines[] = '';
        }

        while (end($lines) === '') {
            array_pop($lines);
        }

        return implode("\n", $lines)."\n";
    }

    private function buildStatus(): string
    {
        $node = $this->runQuietly('node -v');
        [$tests, $assertions, $source] = $this->testCount();

        $lines = [
            '# STATUS.md — Estado generado desde el codigo',
            '',
            '> No editar a mano. Se regenera con `composer docs`. Sin timestamps: el contenido solo cambia si cambia el codigo o el entorno.',
            '',
            '| Dato | Valor |',
            '| --- | --- |',
            '| PHP | '.$this->cell(PHP_VERSION).' |',
            '| Laravel | '.$this->cell(Application::VERSION).' |',
            '| Node | '.$this->cell($node).' |',
            '| Tests'.($source ? " ({$source})" : '').' | '.$this->cell($tests).' |',
            '| Assertions | '.$this->cell($assertions).' |',
        ];

        while (end($lines) === '') {
            array_pop($lines);
        }

        return implode("\n", $lines)."\n";
    }

    private function testCount(): array
    {
        $candidates = [
            'storage/test-results/junit.xml',
            'build/junit.xml',
            'junit.xml',
        ];

        foreach ($candidates as $relative) {
            $path = base_path($relative);

            if (! is_file($path)) {
                continue;
            }

            [$tests, $assertions] = $this->readTestSuiteTotals($path);

            if ($tests === null || $assertions === null) {
                continue;
            }

            return [$tests, $assertions, $relative];
        }

        return ['no disponible', 'no disponible', null];
    }

    private function readTestSuiteTotals(string $path): array
    {
        try {
            $xml = new \SimpleXMLElement(file_get_contents($path));
            $suite = $xml->getName() === 'testsuites' ? $xml->testsuite[0] : $xml;

            if ($suite === null || ! isset($suite['tests']) || ! isset($suite['assertions'])) {
                return [null, null];
            }

            return [(string) $suite['tests'], (string) $suite['assertions']];
        } catch (\Throwable) {
            return [null, null];
        }
    }

    private function runQuietly(string $command): string
    {
        try {
            $result = Process::run($command);

            if (! $result->successful()) {
                return 'no disponible';
            }

            $output = trim($result->output());

            return $output === '' ? 'no disponible' : $output;
        } catch (\Throwable) {
            return 'no disponible';
        }
    }

    private function formatDefault(mixed $default): string
    {
        if ($default === null) {
            return '-';
        }

        return (string) $default;
    }

    private function cell(string $value): string
    {
        return trim(str_replace(['|', "\n", "\r"], ['\\|', ' ', ' '], $value));
    }
}
