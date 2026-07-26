# Sprint 10 — Seeders Iniciales

## 1. Orden de seeders (en DatabaseSeeder.php)

```php
// database/seeders/DatabaseSeeder.php
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CatalogoSeeder::class,     // 1. Catálogos primero (FK de otras tablas)
            UserSeeder::class,         // 2. Usuarios (referenciados por denuncias)
            DenunciaSeeder::class,     // 3. Denuncias y todo su grafo de relaciones
            NotificacionSeeder::class, // 4. Notificaciones demo
        ]);
    }
}
```

## 2. CatalogoSeeder

### 2.1 Categorías de denuncia (~12 registros)

```php
// database/seeders/CatalogoSeeder.php
$categorias = [
    ['clave' => 'cohecho', 'nombre' => 'COHECHO (SOBORNO)', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'concusion', 'nombre' => 'CONCUSIÓN', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'malversacion', 'nombre' => 'MALVERSACIÓN', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'negociaciones', 'nombre' => 'NEGOCIACIONES INCOMPATIBLES', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'enriquecimiento', 'nombre' => 'ENRIQUECIMIENTO ILÍCITO', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'trafico', 'nombre' => 'TRÁFICO DE INFLUENCIAS', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'peculado', 'nombre' => 'PECULADO', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'omision', 'nombre' => 'OMISIÓN DE DENUNCIA', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'incumplimiento', 'nombre' => 'INCUMPLIMIENTO DE DEBERES', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'otra_corrupcion', 'nombre' => 'OTRA (CORRUPCIÓN)', 'tipo_denuncia' => 'corrupcion'],
    ['clave' => 'negacion_info', 'nombre' => 'NEGACIÓN DE INFORMACIÓN', 'tipo_denuncia' => 'negacion'],
    ['clave' => 'otra_negacion', 'nombre' => 'OTRA (NEGACIÓN)', 'tipo_denuncia' => 'negacion'],
];
```

### 2.2 Unidades externas (~13 registros)

```php
$unidades = [
    ['clave' => 'sistemas',       'nombre' => 'UNIDAD DE SISTEMAS'],
    ['clave' => 'adquisiciones',  'nombre' => 'UNIDAD DE ADQUISICIONES'],
    ['clave' => 'rrhh',           'nombre' => 'RECURSOS HUMANOS'],
    ['clave' => 'transito',       'nombre' => 'TRÁNSITO'],
    ['clave' => 'catastro',       'nombre' => 'CATASTRO'],
    ['clave' => 'obras',          'nombre' => 'OBRAS PÚBLICAS'],
    ['clave' => 'ingresos',       'nombre' => 'INGRESOS'],
    ['clave' => 'secretaria',     'nombre' => 'SECRETARÍA GENERAL'],
    ['clave' => 'contrataciones', 'nombre' => 'CONTRATACIONES'],
    ['clave' => 'hacienda',       'nombre' => 'HACIENDA'],
    ['clave' => 'auditoria',      'nombre' => 'AUDITORÍA INTERNA'],
    ['clave' => 'archivo',        'nombre' => 'ARCHIVO CENTRAL'],
    ['clave' => 'min_justicia',   'nombre' => 'MINISTERIO DE JUSTICIA'],
];
```

### 2.3 Feriados (~15 registros)

```php
$feriados = [
    ['fecha' => '2026-01-01', 'nombre' => 'AÑO NUEVO', 'recurrente' => true],
    ['fecha' => '2026-01-22', 'nombre' => 'DÍA DEL ESTADO PLURINACIONAL', 'recurrente' => true],
    ['fecha' => '2026-02-02', 'nombre' => 'DÍA DE LA VIRGEN DE COPACABANA', 'recurrente' => true],
    ['fecha' => '2026-03-03', 'nombre' => 'CARNAVAL', 'recurrente' => true],
    ['fecha' => '2026-04-04', 'nombre' => 'CARNAVAL', 'recurrente' => true],
    ['fecha' => '2026-05-01', 'nombre' => 'DÍA DEL TRABAJO', 'recurrente' => true],
    ['fecha' => '2026-06-21', 'nombre' => 'AÑO NUEVO AYMARA', 'recurrente' => true],
    ['fecha' => '2026-08-06', 'nombre' => 'DÍA DE LA PATRIA', 'recurrente' => true],
    ['fecha' => '2026-11-02', 'nombre' => 'DÍA DE LOS DIFUNTOS', 'recurrente' => true],
    ['fecha' => '2026-12-25', 'nombre' => 'NAVIDAD', 'recurrente' => true],
    // Feriados departamentales La Paz
    ['fecha' => '2026-07-16', 'nombre' => 'DÍA DEL DEPARTAMENTO DE LA PAZ', 'recurrente' => true],
    ['fecha' => '2026-07-24', 'nombre' => 'DÍA DE LA VIRGEN DEL CARMEN', 'recurrente' => true],
    // Feriados puente (no recurrentes)
    ['fecha' => '2026-01-23', 'nombre' => 'PUENTE ESTADO PLURINACIONAL', 'recurrente' => false],
    ['fecha' => '2026-11-03', 'nombre' => 'PUENTE DIFUNTOS', 'recurrente' => false],
    ['fecha' => '2026-12-24', 'nombre' => 'PUENTE NAVIDAD', 'recurrente' => false],
];
```

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
        'name' => 'MARÍA GARCÍA',
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

Este seeder debe portar las 10 denuncias que actualmente están en `DenunciaData::seed()`.
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
        'lugar_hechos' => 'GOBERNACIÓN DE LA PAZ',
        'hechos' => 'EL SEÑOR JUAN PEREZ, FUNCIONARIO DE LA GOBERNACIÓN...',
        'declaracion_jurada' => true,
        'tecnico_id' => null,
        'fecha_rechazada' => '2026-01-20 10:00:00',
        'justificacion_rechazo' => 'LOS HECHOS NO CONSTITUYEN ACTO DE CORRUPCIÓN...',
        'resumen_rechazo' => 'LOS HECHOS DESCRITOS NO CORRESPONDEN A ACTOS DE CORRUPCIÓN.',
        'registrado_por_id' => 2, // registrador
        'created_at' => '2026-01-15 09:00:00',
        'updated_at' => '2026-01-20 10:00:00',

        // Relaciones
        'denunciante' => [
            'nombres' => 'MARÍA RODRÍGUEZ',
            'ci' => '1234567',
            'email' => 'maria@email.com',
            'telefono' => '71234567',
        ],
        'denunciados' => [
            [
                'orden' => 0,
                'conoce_identidad' => true,
                'nombres' => 'JUAN PEREZ',
                'dependencia' => 'GOBERNACIÓN DE LA PAZ',
            ],
        ],
        'pruebas' => [
            ['tipo' => 'fisica', 'descripcion' => 'COPIA DE DOCUMENTO FÍSICO'],
            ['tipo' => 'testigo', 'descripcion' => 'TESTIGO PRESENCIAL', 'testigo_nombre' => 'PEDRO GARCÍA', 'testigo_telefono' => '71234568'],
        ],
    ],
    // ... 9 denuncias más (portar de DenunciaData::seed() actual)
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
    // ... 4 más
];
```

## 6. Archivos demo (para denuncias de prueba)

Se pueden generar archivos demo como parte del DenunciaSeeder o en un seeder separado.
Los archivos deben tener un path simbólico (no necesitan archivo físico real en disco):

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
    // ... más archivos
];
```

## 7. Helper para calcular plazos en seed

```php
// Función helper en DenunciaSeeder
function calcularPlazo(string $tipo): int
{
    return $tipo === 'corrupcion' ? 45 : 20;
}
```

## 8. Reset del contador de tickets

```php
// La numeración de tickets debe continuar desde el último ticket en la BD
// Usar el valor en configuracion_sistema o calcular desde max(id)
$ultimoTicket = Denuncia::withTrashed()->max('ticket');
$siguienteNumero = $ultimoTicket ? intval(substr($ultimoTicket, -4)) + 1 : 1;
```

---

*Documento creado: Julio 2026. Seeders iniciales para Sprint 10.*
