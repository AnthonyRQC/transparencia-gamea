> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 10 â€” Base de Datos Real (Eloquent + MySQL)

**Estado:** âœ… Cerrado (Julio 2026). Implementado en su totalidad.
**Antes:** Sprint 9.2 (renumerado a Sprint 10 en Julio 2026).
**Depende de:** Sprint 9.1 cerrado.
**Bloquea:** Sprint 11 (CatÃ¡logos), Sprint 16 (Roles), y todos los sprints posteriores.
**Ver detalle de cierre:** `Notas Sprint 10 - Cierre.md`.

---

## 1. Resumen

Migrar el sistema de mocks basados en sesiÃ³n (`app/Data/*`) a MySQL real con Laravel migrations,
modelos Eloquent y seeders. El esquema estÃ¡ diseÃ±ado, aprobado y documentado en
`Esquema BD - Negocio.md`, `Esquema BD - CatÃ¡logos.md` y `Esquema BD - LibrerÃ­as.md`.

### Stack

| Componente | TecnologÃ­a |
|------------|-----------|
| Motor BD   | MySQL (Laragon) |
| ORM        | Eloquent (Laravel 13) | *HistÃ³rico 11 hasta Sprint 11, migrado a 13 el 01-sep-2026* |
| Migraciones| `php artisan make:migration` |
| Relaciones polimÃ³rficas | `morphTo()` |
| Auth       | Laravel Breeze (username en vez de email) |
| Storage    | Local: `storage/app/archivos/` |
| AuditorÃ­a  | Diferida a Sprint 17 |

### Decisiones clave

| DecisiÃ³n | Valor |
|----------|-------|
| Estrategia | Reemplazo total de `app/Data/*` por Eloquent |
| Polimorfismo | `morphTo()` completo para `Ampliacion` y `DenunciaArchivo` |
| Auth | `username` + `password` (sin email en MVP) |
| Soft delete | Solo `Denuncia` usa `SoftDeletes` trait. Resto usa `fecha_eliminacion` |
| Testing | Tests feature completos para flujos crÃ­ticos |
| AuditorÃ­a | Diferida a Sprint 17 |
| Storage | Local: `storage/app/archivos/` |

---

## 2. Fases de implementaciÃ³n

### Fase 1: Cimientos (dÃ­as 1-2)

1. **Configurar `.env`**
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=transparencia
   DB_USERNAME=root
   DB_PASSWORD=
   ```

2. **Crear migraciones** (orden especÃ­fico para respetar FKs):
   - CatÃ¡logos: `categorias_denuncia`, `unidades_externas`, `feriados`, `configuracion_sistema`
   - Auth: `users` (extender con `username`, `rol`, `iniciales`, `color`, `activo`, `telefono`, `preferencias`)
   - RaÃ­z: `denuncias`
   - Entidades relacionadas: `denunciantes`, `denunciados`, `pruebas`, `evaluaciones_tecnicas`, `solicitudes_informacion`, `descargos`, `informes_finales`, `cierres`
   - PolimÃ³rficas: `denuncias_archivos`, `ampliaciones`
   - Historial: `bitacora`, `notificaciones`

3. **Crear modelos Eloquent** (ver `Sprint 10 - Convenciones de Modelos Eloquent.md`)

4. **Crear DatabaseSeeder** que invoque seeders en orden correcto

### Fase 2: Entidades nÃºcleo (dÃ­as 3-5)

Implementar modelos + controladores para las entidades principales.
**No refactorizar controllers aÃºn** â€” primero models, luego controllers en Fase 4.

### Fase 3: Tablas polimÃ³rficas (dÃ­as 6-7)

Implementar `morphTo()` en `Ampliacion` y `DenunciaArchivo`.
Configurar storage de archivos.

### Fase 4: Auth y refactor de controllers (dÃ­as 8-10)

1. Configurar Breeze con `username` (modificar `App\Models\User` para usar `username` como login field)
2. Substituir `SesionUsuarioData::getCurrent()` por `Auth::user()` en controllers
3. Refactorizar UN controller a la vez:
   - Empezar por `ArchivosCasoController` (mÃ¡s simple)
   - Seguir por `BandejaController`, `MisCasosController` (solo lectura)
   - Terminar con `DenunciaController` (mÃ¡s complejo, CRUD + flujo)
4. Eliminar `SelectorUsuarioDemo.tsx` del Header

### Fase 5: Testing (dÃ­as 11-12)

Tests feature con `RefreshDatabase` para flujos crÃ­ticos (ver secciÃ³n Testing).

---

## 3. Migraciones (orden y detalles)

### 3.1 CatÃ¡logos

```php
Schema::create('categorias_denuncia', function (Blueprint $table) {
    $table->id();
    $table->string('clave', 50)->unique();
    $table->string('nombre', 255);
    $table->text('descripcion')->nullable();
    $table->foreignId('parent_id')->nullable()->constrained('categorias_denuncia');
    $table->string('tipo_denuncia', 20)->nullable(); // corrupcion|negacion|ambos
    $table->boolean('activa')->default(true);
    $table->timestamps();
});

// unidades_externas, feriados, configuracion_sistema
// Ver esquema completo en Esquema BD - CatÃ¡logos.md
```

### 3.2 Users (extendido)

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('username', 50)->unique()->after('id');
    $table->string('rol', 20)->after('password'); // registrador|jefe|tecnico
    $table->string('iniciales', 2)->nullable()->after('rol');
    $table->string('color', 20)->nullable()->after('iniciales');
    $table->boolean('activo')->default(true)->after('color');
    $table->string('telefono', 20)->nullable()->after('activo');
    $table->json('preferencias')->nullable()->after('telefono');
    $table->string('email', 255)->nullable()->change(); // opcional
});
```

### 3.3 Denuncias

```php
Schema::create('denuncias', function (Blueprint $table) {
    $table->id();
    $table->string('ticket', 20)->unique();
    $table->string('token_consulta', 4);
    $table->string('tipo', 20); // corrupcion|negacion
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
    $table->softDeletes(); // solo Jefe puede eliminar
    $table->timestamps();

    $table->index('estado');
    $table->index('tecnico_id');
});
```

### 3.4 Tablas polimÃ³rficas

```php
// Ampliaciones
Schema::create('ampliaciones', function (Blueprint $table) {
    $table->id();
    $table->morphs('entidad'); // entidad_type + entidad_id
    $table->integer('dias');
    $table->text('justificacion');
    $table->integer('numero')->nullable();
    $table->foreignId('aprobado_por_id')->nullable()->constrained('users');
    $table->string('solicitado_por')->nullable();
    $table->string('archivo_respaldo')->nullable();
    $table->dateTime('fecha');
    $table->timestamps();

    $table->index(['entidad_type', 'entidad_id']);
});

// Denuncias Archivos
Schema::create('denuncias_archivos', function (Blueprint $table) {
    $table->id();
    $table->foreignId('denuncia_id')->constrained()->cascadeOnDelete();
    $table->foreignId('usuario_id')->constrained('users');
    $table->string('nombre');
    $table->string('path');
    $table->string('tamano')->nullable();
    $table->string('mime_type')->nullable();
    $table->text('descripcion')->nullable();
    $table->string('contexto', 20)->default('general'); // registro|general|solicitud|descargo|informe|cierre
    $table->nullableMorphs('contexto_entidad'); // contexto_entidad_type + contexto_entidad_id
    $table->dateTime('fecha_eliminacion')->nullable();
    $table->dateTime('fecha_subida');
    $table->timestamps();

    $table->index(['denuncia_id', 'fecha_eliminacion']);
    $table->index('contexto');
});
```

### 3.5 Resto de tablas

Ver `Esquema BD - Negocio.md` para estructura detallada de:
- `denunciantes`, `denunciados`, `pruebas`
- `evaluaciones_tecnicas`, `solicitudes_informacion`, `descargos`
- `informes_finales`, `cierres`
- `bitacora`, `notificaciones`

---

## 4. Modelos Eloquent

Ver archivo adjunto: `Sprint 10 - Convenciones de Modelos Eloquent.md`

### Relaciones clave

**Ampliacion** (polimÃ³rfica):
```php
class Ampliacion extends Model
{
    public function entidad(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeWhereEntidad(Builder $query, string $type, int $id): Builder
    {
        return $query->where('entidad_type', $type)->where('entidad_id', $id);
    }
}
```

**DenunciaArchivo** (polimÃ³rfica):
```php
class DenunciaArchivo extends Model
{
    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contextoEntidad(): MorphTo
    {
        return $this->morphTo();
    }

    // Scope: archivos activos
    public function scopeActivos(Builder $query): Builder
    {
        return $query->whereNull('fecha_eliminacion');
    }
}
```

---

## 5. Refactor de controladores (guÃ­a general)

### PatrÃ³n para reemplazar mock â†’ Eloquent

```php
// ANTES (mock)
$denuncia = DenunciaData::find($ticket);
$solicitudes = SolicitudData::getByTicket($ticket);

// DESPUÃ‰S (Eloquent)
$denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();
$solicitudes = $denuncia->solicitudes()->activas()->get();
```

### Orden de refactor sugerido

1. `ArchivosCasoController` â†’ simple, independiente
2. `EvaluacionController` â†’ simple, independiente
3. `SolicitudController` â†’ CRUD simple
4. `DescargoController` â†’ CRUD simple
5. `NotificacionController` â†’ CRUD simple
6. `BandejaController` â†’ solo lectura, filtros por rol
7. `MisCasosController` â†’ solo lectura, filtros por tÃ©cnico
8. `ConsultaCasosController` â†’ solo lectura, filtros mÃºltiples
9. `DenunciaController` â†’ complejo, flujo completo

### Instrucciones para la IA implementadora

1. **NO eliminar `app/Data/*` hasta que todos los controllers estÃ©n refactorizados**
2. **TRABAJAR un controlador a la vez**, probando con la UI
3. **DespuÃ©s de refactorizar un controlador**, eliminar su correspondiente `*Data.php`
4. **Al final**, eliminar archivos mock no usados y la carpeta `app/Data/`

---

## 6. Testing

### ConfiguraciÃ³n

```bash
composer require laravel/sanctum  # ya deberÃ­a estar
php artisan make:test DenunciaTest
```

### Tests crÃ­ticos a implementar

1. **Registro de denuncia** (POST denuncias.store)
   - Crear denuncia con todos los campos
   - Validar que se genera ticket correcto
   - Validar mayÃºsculas en textos libres

2. **AdmisiÃ³n de denuncia** (POST denuncias.admitir)
   - Jefe admite denuncia â†’ estado cambia a 'admitida'
   - Registrador intenta admitir â†’ 403

3. **Archivos del caso**
   - Subir archivo (POST denuncias.archivos.subir)
   - Listar archivos activos (GET denuncias.archivos.listar)
   - Soft delete archivo (POST denuncias.archivos.eliminar)
   - Archivo eliminado no aparece en listado

4. **AutenticaciÃ³n**
   - Login con username correcto â†’ 200
   - Login con password incorrecto â†’ 422
   - Usuario inactivo no puede loguearse

5. **Roles**
   - Jefe ve Bandeja
   - TÃ©cnico ve MisCasos
   - Registrador ve ConsultarCasos

6. **Ampliaciones polimÃ³rficas**
   - Crear ampliaciÃ³n para denuncia
   - Crear ampliaciÃ³n para solicitud
   - Validar que `aprobado_por_id` solo es requerido para `tipo=denuncia`

### EjecuciÃ³n

```bash
php artisan test --filter=DenunciaTest
php artisan test --filter=ArchivoTest
php artisan test --filter=AuthTest
```

---

## 7. Seeder de datos demo

Ver archivo adjunto: `Sprint 10 - Seeders Iniciales.md`

---

## 8. Criterios de "Done" (hecho âœ…)

- [ ] `php artisan migrate:fresh` corre sin errores
- [ ] `php artisan db:seed` carga todos los datos demo
- [ ] Login con `jefe`/`demo123` funciona y muestra Bandeja
- [ ] Login con `tecnico1`/`demo123` muestra MisCasos
- [ ] Login con `registrador`/`demo123` muestra ConsultarCasos
- [ ] Se puede crear una denuncia desde el formulario
- [ ] Se pueden subir/eliminar archivos del caso
- [ ] Tests feature pasan en verde
- [ ] `SelectorUsuarioDemo.tsx` eliminado del Header
- [ ] `SesionUsuarioData.php` ya no se usa
- [ ] Todos los `*Data.php` eliminados o marcados como deprecated

---

*Documento creado: Julio 2026. Sprint 10 â€” Base de datos real.*

