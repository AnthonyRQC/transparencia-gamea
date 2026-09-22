<?php

namespace Tests\Feature;

use App\Enums\EscenarioDenuncia;
use App\Enums\EstadoDenuncia;
use App\Enums\RolUsuario;
use App\Enums\TipoDenuncia;
use App\Services\CatalogoConfigStore;
use Database\Seeders\CatalogosConfigSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Contrato triple de catálogos: enum PHP ↔ semilla catalogo_* ↔ constante TS.
 * El test falla si cualquiera de las tres copias se desincroniza.
 */
class EnumsParidadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(CatalogosConfigSeeder::class);
    }

    private function archivoTs(string $rutaRelativa): string
    {
        $contenido = file_get_contents(base_path($rutaRelativa));

        $this->assertNotFalse($contenido, "No se pudo leer {$rutaRelativa}");

        return $contenido;
    }

    /**
     * Valores string de un `export const NOMBRE = { ... } as const`.
     *
     * @return array<int, string>
     */
    private function valoresDeObjetoTs(string $fuente, string $constante): array
    {
        $patron = '/export const ' . preg_quote($constante, '/') . '\s*=\s*\{(?<cuerpo>.*?)\}\s*as const/s';

        $this->assertSame(1, preg_match($patron, $fuente, $coincidencias), "No se encontró {$constante} como objeto 'as const'");

        preg_match_all("/'([^']+)'/", $coincidencias['cuerpo'], $valores);

        return $valores[1];
    }

    /**
     * Valores string de una unión `export type NOMBRE = 'a' | 'b';`.
     *
     * @return array<int, string>
     */
    private function valoresDeUnionTs(string $fuente, string $tipo): array
    {
        $patron = '/export type ' . preg_quote($tipo, '/') . '\s*=\s*(?<cuerpo>[^;]+);/';

        $this->assertSame(1, preg_match($patron, $fuente, $coincidencias), "No se encontró la unión {$tipo}");

        return array_map(fn (string $valor): string => trim($valor, " '\""), explode('|', $coincidencias['cuerpo']));
    }

    /**
     * @param  array<int, string>  $esperados
     * @param  array<int, string>  $obtenidos
     */
    private function assertMismoConjunto(array $esperados, array $obtenidos, string $mensaje): void
    {
        $esperados = array_values(array_unique($esperados));
        $obtenidos = array_values(array_unique($obtenidos));

        sort($esperados);
        sort($obtenidos);

        $this->assertSame($esperados, $obtenidos, $mensaje);
    }

    public function test_roles_paridad_enum_permisos_y_tipos(): void
    {
        $this->assertSame(['jefe', 'investigador', 'registrador', 'admin'], RolUsuario::valores());
        $this->assertSame(RolUsuario::ADMIN, RolUsuario::from('admin'));
        $this->assertNotNull(RolUsuario::tryFrom('admin'));
        $this->assertNull(RolUsuario::tryFrom('desconocido'));

        $permisos = $this->archivoTs('resources/js/permissions.ts');
        $tipos = $this->archivoTs('resources/js/types/denuncia.ts');

        $this->assertMismoConjunto(
            RolUsuario::valores(),
            $this->valoresDeUnionTs($permisos, 'Rol'),
            'El tipo Rol de permissions.ts no cubre RolUsuario::valores()'
        );

        $this->assertMismoConjunto(
            RolUsuario::valores(),
            $this->valoresDeUnionTs($tipos, 'RolUsuario'),
            'El tipo RolUsuario de types/denuncia.ts no cubre RolUsuario::valores()'
        );

        $estados = $this->archivoTs('resources/js/constants/estados.ts');

        $this->assertMismoConjunto(
            RolUsuario::valores(),
            $this->valoresDeObjetoTs($estados, 'ROLES'),
            'La const ROLES de estados.ts no cubre RolUsuario::valores()'
        );

        foreach (RolUsuario::valores() as $rol) {
            $this->assertStringContainsString("'{$rol}'", $permisos, "Falta '{$rol}' en permissions.ts");
            $this->assertStringContainsString("'{$rol}'", $tipos, "Falta '{$rol}' en types/denuncia.ts");
        }
    }

    public function test_estados_paridad_catalogo_enum_y_ts(): void
    {
        $claves = array_column(CatalogoConfigStore::getConfigArray('catalogo_estados'), 'clave');

        $esperados = array_values(array_diff(EstadoDenuncia::valores(), [EstadoDenuncia::ARCHIVADA->value]));

        $this->assertSame($esperados, $claves, 'catalogo_estados no coincide con EstadoDenuncia (sin el subestado archivada)');
        $this->assertContains(EstadoDenuncia::ARCHIVADA->value, EstadoDenuncia::valores());

        $ts = $this->archivoTs('resources/js/constants/estados.ts');

        $this->assertSame($esperados, $this->valoresDeObjetoTs($ts, 'ESTADOS_DENUNCIA'));
        $this->assertMatchesRegularExpression("/SUBESTADO_ARCHIVADA\s*=\s*'archivada'/", $ts, 'Falta SUBESTADO_ARCHIVADA en estados.ts');
    }

    public function test_tipos_y_escenarios_paridad_catalogo_enum_y_ts(): void
    {
        $claves = array_column(CatalogoConfigStore::getConfigArray('catalogo_tipos_denuncia'), 'clave');

        $this->assertSame(TipoDenuncia::valores(), $claves, 'catalogo_tipos_denuncia no coincide con TipoDenuncia');

        $ts = $this->archivoTs('resources/js/constants/estados.ts');

        $this->assertSame(TipoDenuncia::valores(), $this->valoresDeObjetoTs($ts, 'TIPOS_DENUNCIA'));
        $this->assertSame(EscenarioDenuncia::valores(), $this->valoresDeObjetoTs($ts, 'ESCENARIOS'));
    }
}
