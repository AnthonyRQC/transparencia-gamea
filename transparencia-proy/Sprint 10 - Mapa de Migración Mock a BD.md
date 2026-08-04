# Sprint 10 — Mapa de Migración Mock a BD

## 1. Clases `app/Data/*` por reemplazar

| Clase Mock | Modelo Eloquent | Prioridad | Estado inicial |
|------------|----------------|-----------|---------------|
| `ArchivoData.php` | `DenunciaArchivo` | Alta | Sesión `archivos_mock` |
| `DenunciaData.php` | `Denuncia` | Alta | Sesión `denuncias_mock` |
| `SolicitudData.php` | `SolicitudInformacion` | Alta | Sesión `solicitudes_mock` |
| `DescargoData.php` | `Descargo` | Alta | Sesión `descargos_mock` |
| `EvaluacionData.php` | `EvaluacionTecnica` | Media | Sesión `evaluaciones_mock` |
| `NotificacionData.php` | `Notificacion` | Media | Sesión `notificaciones_mock` |
| `SesionUsuarioData.php` | `User` + Auth | Alta | Sesión `demo_user_id` |
| `UnidadData.php` | `UnidadExterna` | Baja | Función estática |
| `PermisosCatalogo.php` | `User.rol` (string) | Baja | Array estático |
| `FeriadoData.php` | `Feriado` | Baja | (futuro Sprint 20) |

## 2. Mapa mock → BD por entidad

### 2.1 DenunciaData → Denuncia

```php
// MOCK - DenunciaData.php
DenunciaData::find($ticket)                     →  Denuncia::where('ticket', $ticket)->first()
DenunciaData::all()                              →  Denuncia::with('denunciante', 'denunciados')->get()
DenunciaData::add($data)                         →  Denuncia::create($data) + DB::transaction
DenunciaData::update($ticket, $data)             →  Denuncia::where('ticket',$ticket)->update($data)
DenunciaData::getByEstado($estado)               →  Denuncia::where('estado', $estado)->get()
DenunciaData::getByTecnico($tecnicoId)           →  Denuncia::where('tecnico_id', $tecnicoId)->get()
DenunciaData::admitir($ticket, $data)            →  $denuncia->update(['estado'=>'admitida', ...])
DenunciaData::rechazar($ticket, $data)           →  $denuncia->update(['estado'=>'rechazada', ...])
DenunciaData::asignar($ticket, $tecnicoId)       →  $denuncia->update(['tecnico_id'=>$tecnicoId, ...])
DenunciaData::traspasar($ticket, $data)          →  $denuncia->update(['tecnico_anterior_id'=>..., 'tecnico_id'=>..., 'traspaso_json'=>...])
DenunciaData::reabrir($ticket, $data)            →  $denuncia->update(['estado'=>'ingresada', 'reapertura_json'=>...])
DenunciaData::aprobarAmpliacion($ticket, $data)  →  $denuncia->ampliaciones()->create($data)
DenunciaData::guardarInforme($ticket, $data)     →  DB::transaction(callback que crea/actualiza informe y denuncia)
DenunciaData::getPlazoInfo($ticket)              →  Helper DiasHabiles sobre $denuncia->created_at + ampliaciones
DenunciaData::getCategorias()                    →  CategoriaDenuncia::where('activa', true)->get()
```

### 2.2 SolicitudData → SolicitudInformacion

```php
SolicitudData::getByTicket($ticket)              →  Denuncia::where('ticket',$ticket)->first()->solicitudes
SolicitudData::find($id)                         →  SolicitudInformacion::find($id)
SolicitudData::add($ticket, $data)               →  $denuncia->solicitudes()->create($data)
SolicitudData::responder($id, $data, $archivos)  →  $solicitud->update(['estado'=>'respondida', ...])
SolicitudData::cancelar($id, $motivo)            →  $solicitud->update(['estado'=>'cancelada', ...])
SolicitudData::ampliar($id, $dias)               →  $solicitud->ampliaciones()->create(['dias'=>$dias, ...])
```

### 2.3 DescargoData → Descargo

```php
DescargoData::getByTicket($ticket)               →  Denuncia::where('ticket',$ticket)->first()->descargos
DescargoData::find($id)                          →  Descargo::find($id)
DescargoData::add($ticket, $data)                →  $denuncia->descargos()->create($data)
DescargoData::notificar($id, $data)              →  $descargo->update(['estado'=>'notificado', ...])
DescargoData::responder($id, $resumen, $docs)    →  $descargo->update(['estado'=>'respondido', ...])
```

### 2.4 ArchivoData → DenunciaArchivo

```php
ArchivoData::getByDenuncia($ticket)              →  DenunciaArchivo::whereHas('denuncia', fn($q) => $q->where('ticket',$ticket))->activos()->get()
ArchivoData::find($id)                           →  DenunciaArchivo::find($id)
ArchivoData::add($ticket, $nombre, $desc, $ctx, $mime, $ctxId)
    →  DenunciaArchivo::create([
           'denuncia_id' => Denuncia::where('ticket',$ticket)->first()->id,
           'usuario_id' => Auth::id(),
           'nombre' => $nombre,
           'descripcion' => $desc,
           'contexto' => $ctx,
           'contexto_entidad_type' => ...,
           'contexto_entidad_id' => $ctxId,
           'fecha_subida' => now(),
       ])
ArchivoData::softDelete($id)                     →  $archivo->update(['fecha_eliminacion' => now()])
```

### 2.5 SesionUsuarioData → User + Auth

```php
SesionUsuarioData::getCurrent()                  →  Auth::user()
SesionUsuarioData::getUsuario($id)               →  User::find($id)
SesionUsuarioData::getAll()                      →  User::where('activo', true)->get()
SesionUsuarioData::getTecnicos()                 →  User::where('rol', 'tecnico')->where('activo', true)->get()
session('demo_user_id')                          →  Auth::id()
```

### 2.6 NotificacionData → Notificacion

```php
NotificacionData::getRecientes($limit, $userId)  →  Notificacion::where('usuario_id',$userId)->latest()->take($limit)->get()
NotificacionData::getUnreadCount($userId)         →  Notificacion::where('usuario_id',$userId)->where('leida',false)->count()
NotificacionData::generate($data)                 →  Notificacion::create($data)
NotificacionData::marcarLeida($id)                →  Notificacion::where('id',$id)->update(['leida'=>true, 'fecha_leida'=>now()])
NotificacionData::marcarTodasLeidas($userId)      →  Notificacion::where('usuario_id',$userId)->where('leida',false)->update(['leida'=>true, 'fecha_leida'=>now()])
```

### 2.7 EvaluacionData → EvaluacionTecnica

```php
EvaluacionData::getByDenuncia($ticket)           →  EvaluacionTecnica::whereHas('denuncia', fn($q) => $q->where('ticket',$ticket))->get()
EvaluacionData::find($id)                        →  EvaluacionTecnica::find($id)
```

### 2.8 UnidadData → UnidadExterna

```php
UnidadData::getAll()                             →  UnidadExterna::where('activa', true)->get()
```

## 3. Datos mock que DEBEN persistir en seeder

| Tipo | Registros | Ubicación actual |
|------|-----------|-----------------|
| Categorías de denuncia | ~12 | `DenunciaData::getCategorias()` |
| Unidades externas | ~13 | `UnidadData::getAll()` |
| Usuarios demo | 5 | `SesionUsuarioData` array |
| Denuncias demo | 10 | `DenunciaData::seed()` método |
| Solicitudes demo | 3 | `SolicitudData::seed()` método |
| Descargos demo | 2 | `DescargoData::seed()` método |
| Evaluaciones demo | 1 | `EvaluacionData::seed()` método |
| Notificaciones demo | ~5 | `NotificacionData::seed()` método |
| Archivos demo | ~8 | `ArchivoData::seed()` método (futuro) |

## 4. Campos de sesión por reemplazar

| Clave de sesión | Reemplazo |
|----------------|-----------|
| `denuncias_mock` | `DB::table('denuncias')` o Eloquent |
| `solicitudes_mock` | `DB::table('solicitudes_informacion')` |
| `descargos_mock` | `DB::table('descargos')` |
| `evaluaciones_mock` | `DB::table('evaluaciones_tecnicas')` |
| `notificaciones_mock` | `DB::table('notificaciones')` |
| `archivos_mock` | `DB::table('denuncias_archivos')` |
| `archivo_id_counter` | `DB::table('denuncias_archivos')->max('id') + 1` |
| `demo_user_id` | `Auth::id()` |
| `permisos_demo` | `Auth::user()->rol` |
| `feriados` | `DB::table('feriados')` |

## 5. Controllers por modificar

| Controller | Mock reemplazado | Dificultad |
|-----------|-----------------|-----------|
| `ArchivosCasoController` | `ArchivoData`, `DenunciaData` | Baja |
| `EvaluacionController` | `EvaluacionData`, `DenunciaData` | Baja |
| `SolicitudController` | `SolicitudData`, `DenunciaData` | Media |
| `DescargoController` | `DescargoData`, `DenunciaData` | Media |
| `NotificacionController` | `NotificacionData` | Baja |
| `BandejaController` | `DenunciaData`, `SolicitudData`, `DescargoData` | Media |
| `MisCasosController` | `DenunciaData`, `EvaluacionData` | Media |
| `DenunciaController` | `DenunciaData`, `EvaluacionData`, `ArchivoData` | Alta |
| `ConsultaCasosController` | `DenunciaData` | Media |
| `SeguimientoController` | `DenunciaData` | Baja |
| `SelectorUsuarioController` | `SesionUsuarioData` | **ELIMINAR** |
| `DemoNotificacionController` | `NotificacionData` | **ELIMINAR** |
| `UserPanelController` | Sprint 18 (Panel de Usuario) | N/A |
| `CatalogoController` | implementado (Sprint 11) | N/A |
| `ReporteController` | (futuro Sprint 12) | N/A |

## 6. Rutas del modal de archivos

Las rutas existentes en `routes/web.php` (líneas 115-117) se mantienen pero ahora apuntan a Eloquent:

```php
Route::get('/{ticket}/archivos', [ArchivosCasoController::class, 'listar'])->name('archivos.listar');
Route::post('/{ticket}/archivos', [ArchivosCasoController::class, 'subir'])->name('archivos.subir');
Route::post('/archivos/{id}/eliminar', [ArchivosCasoController::class, 'eliminar'])->name('archivos.eliminar');
```

## 7. Helpers y traits legacy

| Helper/Trait | Estado post-Sprint 10 |
|-------------|---------------------|
| `app/Helpers/UppercaseText.php` | ✅ **MANTENER** (se aplica en modelos) |
| `app/Helpers/DiasHabiles.php` | ⏳ Diferido a Sprint 20 |
| `app/Data/PermisosCatalogo.php` | ✅ **MANTENER** como catálogo de referencia (no depende de BD) |

---

*Documento creado: Julio 2026. Mapa de migración para Sprint 10.*
