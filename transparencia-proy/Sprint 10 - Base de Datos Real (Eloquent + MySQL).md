# Sprint 10 — Base de Datos Real (Eloquent + MySQL)

**Estado:** ✅ Cerrado (Julio 2026). Implementado en su totalidad.
**Antes:** Sprint 9.2 (renumerado a Sprint 10 en Julio 2026).
**Depende de:** Sprint 9.1 cerrado.
**Bloquea:** Sprint 11 (Catálogos), Sprint 16 (Roles), y todos los sprints posteriores.
**Ver detalle de cierre:** `Notas Sprint 10 - Cierre.md`.

---

## 1. Resumen

Migrar el sistema de mocks basados en sesión (`app/Data/*`) a MySQL real con Laravel migrations,
modelos Eloquent y seeders. El esquema está diseñado, aprobado y documentado en
`Esquema BD - Negocio.md`, `Esquema BD - Catálogos.md` y `Esquema BD - Librerías.md`.

### Stack

| Componente | Tecnología |
|------------|-----------|
| Motor BD   | MySQL (Laragon) |
| ORM        | Eloquent (Laravel 13) | *Histórico 11 hasta Sprint 11, migrado a 13 el 01-sep-2026* |
| Migraciones| `php artisan make:migration` |
| Relaciones polimórficas | `morphTo()` |
| Auth       | Laravel Breeze (username en vez de email) |
| Storage    | Local: `storage/app/archivos/` |
| Auditoría  | Diferida a Sprint 17 |

### Decisiones clave

| Decisión | Valor |
|----------|-------|
| Estrategia | Reemplazo total de `app/Data/*` por Eloquent |
| Polimorfismo | `morphTo()` completo para `Ampliacion` y `DenunciaArchivo` |
| Auth | `username` + `password` (sin email en MVP) |
| Soft delete | Solo `Denuncia` usa `SoftDeletes` trait. Resto usa `fecha_eliminacion` |
| Testing | Tests feature completos para flujos críticos |
| Auditoría | Diferida a Sprint 17 |
| Storage | Local: `storage/app/archivos/` |

---

## 2. Fases de implementación

### Fase 1: Cimientos (días 1-2)

1. **Configurar `.env`**
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=transparencia
   DB_USERNAME=root
   DB_PASSWORD=
   ```

2. **Crear migraciones** (orden específico para respetar FKs):
   - Catálogos: `categorias_denuncia`, `unidades_externas`, `feriados`, `configuracion_sistema`
   - Auth: `users` (extender con `username`, `rol`, `iniciales`, `color`, `activo`, `telefono`, `preferencias`)
   - Raíz: `denuncias`
   - Entidades relacionadas: `denunciantes`, `denunciados`, `pruebas`, `evaluaciones_tecnicas`, `solicitudes_informacion`, `descargos`, `informes_finales`, `cierres`
   - Polimórficas: `denuncias_archivos`, `ampliaciones`
   - Historial: `bitacora`, `notificaciones`

3. **Crear modelos Eloquent** (ver `Sprint 10 - Convenciones de Modelos Eloquent.md`)

4. **Crear DatabaseSeeder** que invoque seeders en orden correcto

### Fase 2: Entidades núcleo (días 3-5)

Implementar modelos + controladores para las entidades principales.
**No refactorizar controllers aún** — primero models, luego controllers en Fase 4.

### Fase 3: Tablas polimórficas (días 6-7)

Implementar `morphTo()` en `Ampliacion` y `DenunciaArchivo`.
Configurar storage de archivos.

### Fase 4: Auth y refactor de controllers (días 8-10)

1. Configurar Breeze con `username` (modificar `App\Models\User` para usar `username` como login field)
2. Substituir `SesionUsuarioData::getCurrent()` por `Auth::user()` en controllers
3. Refactorizar UN controller a la vez:
   - Empezar por `ArchivosCasoController` (más simple)
   - Seguir por `BandejaController`, `MisCasosController` (solo lectura)
   - Terminar con `DenunciaController` (más complejo, CRUD + flujo)
4. Eliminar `SelectorUsuarioDemo.tsx` del Header

### Fase 5: Testing (días 11-12)

Tests feature con `RefreshDatabase` para flujos críticos (ver sección Testing).

---

## 3. Migraciones (orden y detalles)

### 3.1 Catálogos

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
// Ver esquema completo en Esquema BD - Catálogos.md
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

### 3.4 Tablas polimórficas

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

**Ampliacion** (polimórfica):
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

**DenunciaArchivo** (polimórfica):
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

## 5. Refactor de controladores (guía general)

### Patrón para reemplazar mock → Eloquent

```php
// ANTES (mock)
$denuncia = DenunciaData::find($ticket);
$solicitudes = SolicitudData::getByTicket($ticket);

// DESPUÉS (Eloquent)
$denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();
$solicitudes = $denuncia->solicitudes()->activas()->get();
```

### Orden de refactor sugerido

1. `ArchivosCasoController` → simple, independiente
2. `EvaluacionController` → simple, independiente
3. `SolicitudController` → CRUD simple
4. `DescargoController` → CRUD simple
5. `NotificacionController` → CRUD simple
6. `BandejaController` → solo lectura, filtros por rol
7. `MisCasosController` → solo lectura, filtros por técnico
8. `ConsultaCasosController` → solo lectura, filtros múltiples
9. `DenunciaController` → complejo, flujo completo

### Instrucciones para la IA implementadora

1. **NO eliminar `app/Data/*` hasta que todos los controllers estén refactorizados**
2. **TRABAJAR un controlador a la vez**, probando con la UI
3. **Después de refactorizar un controlador**, eliminar su correspondiente `*Data.php`
4. **Al final**, eliminar archivos mock no usados y la carpeta `app/Data/`

---

## 6. Testing

### Configuración

```bash
composer require laravel/sanctum  # ya debería estar
php artisan make:test DenunciaTest
```

### Tests críticos a implementar

1. **Registro de denuncia** (POST denuncias.store)
   - Crear denuncia con todos los campos
   - Validar que se genera ticket correcto
   - Validar mayúsculas en textos libres

2. **Admisión de denuncia** (POST denuncias.admitir)
   - Jefe admite denuncia → estado cambia a 'admitida'
   - Registrador intenta admitir → 403

3. **Archivos del caso**
   - Subir archivo (POST denuncias.archivos.subir)
   - Listar archivos activos (GET denuncias.archivos.listar)
   - Soft delete archivo (POST denuncias.archivos.eliminar)
   - Archivo eliminado no aparece en listado

4. **Autenticación**
   - Login con username correcto → 200
   - Login con password incorrecto → 422
   - Usuario inactivo no puede loguearse

5. **Roles**
   - Jefe ve Bandeja
   - Técnico ve MisCasos
   - Registrador ve ConsultarCasos

6. **Ampliaciones polimórficas**
   - Crear ampliación para denuncia
   - Crear ampliación para solicitud
   - Validar que `aprobado_por_id` solo es requerido para `tipo=denuncia`

### Ejecución

```bash
php artisan test --filter=DenunciaTest
php artisan test --filter=ArchivoTest
php artisan test --filter=AuthTest
```

---

## 7. Seeder de datos demo

Ver archivo adjunto: `Sprint 10 - Seeders Iniciales.md`

---

## 8. Criterios de "Done" (hecho ✅)

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

*Documento creado: Julio 2026. Sprint 10 — Base de datos real.*
