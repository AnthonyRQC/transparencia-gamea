> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 10 â€” Seeders Iniciales

> âš ï¸ **ActualizaciÃ³n (Agosto 2026):** Este documento describe el seed original de Sprint 10.
> Tras la reestructuraciÃ³n de catÃ¡logos, `CatalogoSeeder` cambiÃ³:
> - `dependencias_externas` pasÃ³ de ~13 filas planas a **185 nodos en Ã¡rbol** (organigrama GAMEA 2026 con `parent_id`).
> - Se agregaron **6 clasificaciones** y **4 medios de notificaciÃ³n** (tablas nuevas).
> - `CatalogosConfigSeeder` ahora siembra solo `catalogo_estados` y `catalogo_tipos_denuncia`.
>
> Ver `Notas ReestructuraciÃ³n BD - CatÃ¡logos y Ãrbol (Cierre).md` para el estado vigente.

## 1. Orden de seeders (en DatabaseSeeder.php)

```php
// database/seeders/DatabaseSeeder.php
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CatalogoSeeder::class,     // 1. CatÃ¡logos primero (FK de otras tablas)
            UserSeeder::class,         // 2. Usuarios (referenciados por denuncias)
            DenunciaSeeder::class,     // 3. Denuncias y todo su grafo de relaciones
            NotificacionSeeder::class, // 4. Notificaciones demo
        ]);
    }
}
```

## 2. CatalogoSeeder

### 2.1 CategorÃ­as de denuncia (~12 registros)

```php
// database/seeders/CatalogoSeeder.php
$categorias = [
    ['clave' => 'cohecho', 'nombre' => 'COHECHO (SOBORNO)', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'concusion', 'nombre' => 'CONCUSIÃ“N', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'malversacion', 'nombre' => 'MALVERSACIÃ“N', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'negociaciones', 'nombre' => 'NEGOCIACIONES INCOMPATIBLES', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'enriquecimiento', 'nombre' => 'ENRIQUECIMIENTO ILÃCITO', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'trafico', 'nombre' => 'TRÃFICO DE INFLUENCIAS', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'peculado', 'nombre' => 'PECULADO', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'omision', 'nombre' => 'OMISIÃ“N DE DENUNCIA', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'incumplimiento', 'nombre' => 'INCUMPLIMIENTO DE DEBERES', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'otra_corrupcion', 'nombre' => 'OTRA (CORRUPCIÃ“N)', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'negacion_info', 'nombre' => 'NEGACIÃ“N DE INFORMACIÃ“N', 'tipo_denuncia' => 'negacion'],
    ['clave' => 'otra_negacion', 'nombre' => 'OTRA (NEGACIÃ“N)', 'tipo_denuncia' => 'negacion'],
];
```

### 2.2 Dependencias externas (~13 registros)

```php
$dependencias = [
    ['nombre' => 'UNIDAD DE SISTEMAS'],
    ['nombre' => 'UNIDAD DE ADQUISICIONES'],
    ['nombre' => 'RECURSOS HUMANOS'],
    ['nombre' => 'TRÃNSITO'],
    ['nombre' => 'CATASTRO'],
    ['nombre' => 'OBRAS PÃšBLICAS'],
    ['nombre' => 'INGRESOS'],
    ['nombre' => 'SECRETARÃA GENERAL'],
    ['nombre' => 'CONTRATACIONES'],
    ['nombre' => 'HACIENDA'],
    ['nombre' => 'AUDITORÃA INTERNA'],
    ['nombre' => 'ARCHIVO CENTRAL'],
    ['nombre' => 'MINISTERIO DE JUSTICIA'],
];
```

> **Nota:** La tabla se llama `dependencias_externas` (no `unidades_externas`). NO tiene columna `clave`.

### 2.3 Feriados (~15 registros)

```php
$feriados = [
    ['fecha' => '2026-01-01', 'nombre' => 'AÃ‘O NUEVO'],
    ['fecha' => '2026-01-22', 'nombre' => 'DÃA DEL ESTADO PLURINACIONAL'],
    ['fecha' => '2026-02-02', 'nombre' => 'DÃA DE LA VIRGEN DE COPACABANA'],
    ['fecha' => '2026-03-03', 'nombre' => 'CARNAVAL'],
    ['fecha' => '2026-04-04', 'nombre' => 'CARNAVAL'],
    ['fecha' => '2026-05-01', 'nombre' => 'DÃA DEL TRABAJO'],
    ['fecha' => '2026-06-21', 'nombre' => 'AÃ‘O NUEVO AYMARA'],
    ['fecha' => '2026-08-06', 'nombre' => 'DÃA DE LA PATRIA'],
    ['fecha' => '2026-11-02', 'nombre' => 'DÃA DE LOS DIFUNTOS'],
    ['fecha' => '2026-12-25', 'nombre' => 'NAVIDAD'],
    // Feriados departamentales La Paz
    ['fecha' => '2026-07-16', 'nombre' => 'DÃA DEL DEPARTAMENTO DE LA PAZ'],
    ['fecha' => '2026-07-24', 'nombre' => 'DÃA DE LA VIRGEN DEL CARMEN'],
    // Feriados puente
    ['fecha' => '2026-01-23', 'nombre' => 'PUENTE ESTADO PLURINACIONAL'],
    ['fecha' => '2026-11-03', 'nombre' => 'PUENTE DIFUNTOS'],
    ['fecha' => '2026-12-24', 'nombre' => 'PUENTE NAVIDAD'],
];
```

> **Nota:** La tabla `feriados` NO tiene columna `recurrente`. Usa `SoftDeletes` (desactivar/restaurar).

## 3. UserSeeder (5 usuarios demo)

```php
// database/seeders/UserSeeder.php
$users = [
    [
        'username' => 'jefe',
        'name' => 'PEDRO MAMANI',
        'email' => null,
        'password' => Hash::make('demo123'),
        'rol' => 'jefe',
        'iniciales' => 'PM',
        'color' => 'bg-purple-500',
        'activo' => true,
        'telefono' => '71234567',
    ],
    [
        'username' => 'registrador',
        'name' => 'MARÃA GARCÃA',
        'email' => null,
        'password' => Hash::make('demo123'),
        'rol' => 'registrador',
        'iniciales' => 'MG',
        'color' => 'bg-blue-500',
        'activo' => true,
        'telefono' => '71234568',
    ],
    [
        'username' => 'tecnico1',
        'name' => 'CARLOS QUISPE',
        'email' => null,
        'password' => Hash::make('demo123'),
        'rol' => 'tecnico',
        'iniciales' => 'CQ',
        'color' => 'bg-amber-500',
        'activo' => true,
        'telefono' => '71234569',
    ],
    [
        'username' => 'tecnico2',
        'name' => 'ANA TORRES',
        'email' => null,
        'password' => Hash::make('demo123'),
        'rol' => 'tecnico',
        'iniciales' => 'AT',
        'color' => 'bg-green-500',
        'activo' => true,
        'telefono' => '71234570',
    ],
    [
        'username' => 'tecnico3',
        'name' => 'LUIS MAMANI',
        'email' => null,
        'password' => Hash::make('demo123'),
        'rol' => 'tecnico',
        'iniciales' => 'LM',
        'color' => 'bg-rose-500',
        'activo' => true,
        'telefono' => '71234571',
    ],
];
```

**Nota sobre Login:** El auth de Breeze debe configurarse para usar `username` en lugar de `email`.
Ver `config/auth.php` o implementar `AuthenticatesUsers` trait con `username()` method.

## 4. DenunciaSeeder (10 denuncias demo)

Este seeder debe portar las 10 denuncias que actualmente estÃ¡n en `DenunciaData::seed()`.
Incluir todas las relaciones: denunciantes, denunciados, pruebas, solicitudes, descargos, etc.

**Estructura de cada denuncia:**

```php
$denuncias = [
    [
        'ticket' => 'DEN-2026-0001',
        'token_consulta' => '1001',
        'tipo' => 'corrupcion',
        'escenario' => 'revelada',
        'estado' => 'rechazada',
        'categoria_id' => 1,  // cohecho
        'fecha_hechos' => '2026-01-10',
        'lugar_hechos' => 'GOBERNACIÃ“N DE LA PAZ',
        'hechos' => 'EL SEÃ‘OR JUAN PEREZ, FUNCIONARIO DE LA GOBERNACIÃ“N...',
        'declaracion_jurada' => true,
        'tecnico_id' => null,
        'fecha_rechazada' => '2026-01-20 10:00:00',
        'justificacion_rechazo' => 'LOS HECHOS NO CONSTITUYEN ACTO DE CORRUPCIÃ“N...',
        'resumen_rechazo' => 'LOS HECHOS DESCRITOS NO CORRESPONDEN A ACTOS DE CORRUPCIÃ“N.',
        'registrado_por_id' => 2, // registrador
        'created_at' => '2026-01-15 09:00:00',
        'updated_at' => '2026-01-20 10:00:00',

        // Relaciones
        'denunciante' => [
            'nombres' => 'MARÃA RODRÃGUEZ',
            'ci' => '1234567',
            'email' => 'maria@email.com',
            'telefono' => '71234567',
        ],
        'denunciados' => [
            [
                'orden' => 0,
                'conoce_identidad' => true,
                'nombres' => 'JUAN PEREZ',
                'dependencia' => 'GOBERNACIÃ“N DE LA PAZ',
            ],
        ],
        'pruebas' => [
            ['tipo' => 'fisica', 'descripcion' => 'COPIA DE DOCUMENTO FÃSICO'],
            ['tipo' => 'testigo', 'descripcion' => 'TESTIGO PRESENCIAL', 'testigo_nombre' => 'PEDRO GARCÃA', 'testigo_telefono' => '71234568'],
        ],
    ],
    // ... 9 denuncias mÃ¡s (portar de DenunciaData::seed() actual)
];
```

## 5. NotificacionSeeder (~5 notificaciones demo)

```php
$notificaciones = [
    [
        'usuario_id' => 3, // tecnico1
        'tipo' => 'traspaso',
        'titulo' => 'CASO TRASPASADO',
        'mensaje' => 'DEN-2026-0006 FUE ASIGNADO A CARLOS QUISPE',
        'ticket' => 'DEN-2026-0006',
        'destino_url' => '/denuncias/mis-casos',
        'icono' => 'Bell',
        'color' => 'primary',
        'fecha' => now()->subDays(2),
    ],
    // ... 4 mÃ¡s
];
```

## 6. Archivos demo (para denuncias de prueba)

Se pueden generar archivos demo como parte del DenunciaSeeder o en un seeder separado.
Los archivos deben tener un path simbÃ³lico (no necesitan archivo fÃ­sico real en disco):

```php
$archivos = [
    [
        'denuncia_id' => 11, // DEN-2026-0011
        'usuario_id' => 3,   // tecnico1
        'nombre' => 'INFORME_FINAL_0011.PDF',
        'path' => 'archivos/demo/DEN-2026-0011/informe_final_0011.pdf',
        'tamano' => '2.4 MB',
        'mime_type' => 'application/pdf',
        'contexto' => 'informe',
        'fecha_subida' => now()->subDays(50),
    ],
    // ... mÃ¡s archivos
];
```

## 7. Helper para calcular plazos en seed

```php
// FunciÃ³n helper en DenunciaSeeder
function calcularPlazo(string $tipo): int
{
    return $tipo === 'corrupcion' ? 45 : 20;
}
```

## 8. Reset del contador de tickets

```php
// La numeraciÃ³n de tickets debe continuar desde el Ãºltimo ticket en la BD
// Usar el valor en configuracion_sistema o calcular desde max(id)
$ultimoTicket = Denuncia::withTrashed()->max('ticket');
$siguienteNumero = $ultimoTicket ? intval(substr($ultimoTicket, -4)) + 1 : 1;
```

---

## 9. CatalogosConfigSeeder (5 catÃ¡logos JSON)

```php
// database/seeders/CatalogosConfigSeeder.php
// Semilla idempotente: usa updateOrCreate sobre configuracion_sistema
// 5 claves: catalogo_clasificaciones, catalogo_tipos_denuncia, catalogo_estados,
//           catalogo_medios_notificacion, catalogo_tipos_prueba
// Cada item tiene: id, clave (excepto tipos_prueba), nombre, activo
```

> **Nota:** La clave `anio_vigente` fue eliminada del sistema (el aÃ±o se deriva de las fechas reales).

---

*Documento creado: Julio 2026. Seeders iniciales para Sprint 10.*

