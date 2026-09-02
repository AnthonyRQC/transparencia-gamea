> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 10 â€” Mapa de MigraciÃ³n Mock a BD

## 1. Clases `app/Data/*` por reemplazar

| Clase Mock | Modelo Eloquent | Prioridad | Estado inicial |
|------------|----------------|-----------|---------------|
| `ArchivoData.php` | `DenunciaArchivo` | Alta | SesiÃ³n `archivos_mock` |
| `DenunciaData.php` | `Denuncia` | Alta | SesiÃ³n `denuncias_mock` |
| `SolicitudData.php` | `SolicitudInformacion` | Alta | SesiÃ³n `solicitudes_mock` |
| `DescargoData.php` | `Descargo` | Alta | SesiÃ³n `descargos_mock` |
| `EvaluacionData.php` | `EvaluacionTecnica` | Media | SesiÃ³n `evaluaciones_mock` |
| `NotificacionData.php` | `Notificacion` | Media | SesiÃ³n `notificaciones_mock` |
| `SesionUsuarioData.php` | `User` + Auth | Alta | SesiÃ³n `demo_user_id` |
| `UnidadData.php` | `UnidadExterna` | Baja | FunciÃ³n estÃ¡tica |
| `PermisosCatalogo.php` | `User.rol` (string) | Baja | Array estÃ¡tico |
| `FeriadoData.php` | `Feriado` | Baja | (futuro Sprint 20) |

## 2. Mapa mock â†’ BD por entidad

### 2.1 DenunciaData â†’ Denuncia

```php
// MOCK - DenunciaData.php
DenunciaData::find($ticket)                     â†’  Denuncia::where('ticket', $ticket)->first()
DenunciaData::all()                              â†’  Denuncia::with('denunciante', 'denunciados')->get()
DenunciaData::add($data)                         â†’  Denuncia::create($data) + DB::transaction
DenunciaData::update($ticket, $data)             â†’  Denuncia::where('ticket',$ticket)->update($data)
DenunciaData::getByEstado($estado)               â†’  Denuncia::where('estado', $estado)->get()
DenunciaData::getByTecnico($tecnicoId)           â†’  Denuncia::where('tecnico_id', $tecnicoId)->get()
DenunciaData::admitir($ticket, $data)            â†’  $denuncia->update(['estado'=>'admitida', ...])
DenunciaData::rechazar($ticket, $data)           â†’  $denuncia->update(['estado'=>'rechazada', ...])
DenunciaData::asignar($ticket, $tecnicoId)       â†’  $denuncia->update(['tecnico_id'=>$tecnicoId, ...])
DenunciaData::traspasar($ticket, $data)          â†’  $denuncia->update(['tecnico_anterior_id'=>..., 'tecnico_id'=>..., 'traspaso_json'=>...])
DenunciaData::reabrir($ticket, $data)            â†’  $denuncia->update(['estado'=>'ingresada', 'reapertura_json'=>...])
DenunciaData::aprobarAmpliacion($ticket, $data)  â†’  $denuncia->ampliaciones()->create($data)
DenunciaData::guardarInforme($ticket, $data)     â†’  DB::transaction(callback que crea/actualiza informe y denuncia)
DenunciaData::getPlazoInfo($ticket)              â†’  Helper DiasHabiles sobre $denuncia->created_at + ampliaciones
DenunciaData::getCategorias()                    â†’  CategoriaDenuncia::where('activa', true)->get()
```

### 2.2 SolicitudData â†’ SolicitudInformacion

```php
SolicitudData::getByTicket($ticket)              â†’  Denuncia::where('ticket',$ticket)->first()->solicitudes
SolicitudData::find($id)                         â†’  SolicitudInformacion::find($id)
SolicitudData::add($ticket, $data)               â†’  $denuncia->solicitudes()->create($data)
SolicitudData::responder($id, $data, $archivos)  â†’  $solicitud->update(['estado'=>'respondida', ...])
SolicitudData::cancelar($id, $motivo)            â†’  $solicitud->update(['estado'=>'cancelada', ...])
SolicitudData::ampliar($id, $dias)               â†’  $solicitud->ampliaciones()->create(['dias'=>$dias, ...])
```

### 2.3 DescargoData â†’ Descargo

```php
DescargoData::getByTicket($ticket)               â†’  Denuncia::where('ticket',$ticket)->first()->descargos
DescargoData::find($id)                          â†’  Descargo::find($id)
DescargoData::add($ticket, $data)                â†’  $denuncia->descargos()->create($data)
DescargoData::notificar($id, $data)              â†’  $descargo->update(['estado'=>'notificado', ...])
DescargoData::responder($id, $resumen, $docs)    â†’  $descargo->update(['estado'=>'respondido', ...])
```

### 2.4 ArchivoData â†’ DenunciaArchivo

```php
ArchivoData::getByDenuncia($ticket)              â†’  DenunciaArchivo::whereHas('denuncia', fn($q) => $q->where('ticket',$ticket))->activos()->get()
ArchivoData::find($id)                           â†’  DenunciaArchivo::find($id)
ArchivoData::add($ticket, $nombre, $desc, $ctx, $mime, $ctxId)
    â†’  DenunciaArchivo::create([
           'denuncia_id' => Denuncia::where('ticket',$ticket)->first()->id,
           'usuario_id' => Auth::id(),
           'nombre' => $nombre,
           'descripcion' => $desc,
           'contexto' => $ctx,
           'contexto_entidad_type' => ...,
           'contexto_entidad_id' => $ctxId,
           'fecha_subida' => now(),
       ])
ArchivoData::softDelete($id)                     â†’  $archivo->update(['fecha_eliminacion' => now()])
```

### 2.5 SesionUsuarioData â†’ User + Auth

```php
SesionUsuarioData::getCurrent()                  â†’  Auth::user()
SesionUsuarioData::getUsuario($id)               â†’  User::find($id)
SesionUsuarioData::getAll()                      â†’  User::where('activo', true)->get()
SesionUsuarioData::getTecnicos()                 â†’  User::where('rol', 'tecnico')->where('activo', true)->get()
session('demo_user_id')                          â†’  Auth::id()
```

### 2.6 NotificacionData â†’ Notificacion

```php
NotificacionData::getRecientes($limit, $userId)  â†’  Notificacion::where('usuario_id',$userId)->latest()->take($limit)->get()
NotificacionData::getUnreadCount($userId)         â†’  Notificacion::where('usuario_id',$userId)->where('leida',false)->count()
NotificacionData::generate($data)                 â†’  Notificacion::create($data)
NotificacionData::marcarLeida($id)                â†’  Notificacion::where('id',$id)->update(['leida'=>true, 'fecha_leida'=>now()])
NotificacionData::marcarTodasLeidas($userId)      â†’  Notificacion::where('usuario_id',$userId)->where('leida',false)->update(['leida'=>true, 'fecha_leida'=>now()])
```

### 2.7 EvaluacionData â†’ EvaluacionTecnica

```php
EvaluacionData::getByDenuncia($ticket)           â†’  EvaluacionTecnica::whereHas('denuncia', fn($q) => $q->where('ticket',$ticket))->get()
EvaluacionData::find($id)                        â†’  EvaluacionTecnica::find($id)
```

### 2.8 UnidadData â†’ UnidadExterna

```php
UnidadData::getAll()                             â†’  UnidadExterna::where('activa', true)->get()
```

## 3. Datos mock que DEBEN persistir en seeder

| Tipo | Registros | UbicaciÃ³n actual |
|------|-----------|-----------------|
| CategorÃ­as de denuncia | ~12 | `DenunciaData::getCategorias()` |
| Unidades externas | ~13 | `UnidadData::getAll()` |
| Usuarios demo | 5 | `SesionUsuarioData` array |
| Denuncias demo | 10 | `DenunciaData::seed()` mÃ©todo |
| Solicitudes demo | 3 | `SolicitudData::seed()` mÃ©todo |
| Descargos demo | 2 | `DescargoData::seed()` mÃ©todo |
| Evaluaciones demo | 1 | `EvaluacionData::seed()` mÃ©todo |
| Notificaciones demo | ~5 | `NotificacionData::seed()` mÃ©todo |
| Archivos demo | ~8 | `ArchivoData::seed()` mÃ©todo (futuro) |

## 4. Campos de sesiÃ³n por reemplazar

| Clave de sesiÃ³n | Reemplazo |
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

Las rutas existentes en `routes/web.php` (lÃ­neas 115-117) se mantienen pero ahora apuntan a Eloquent:

```php
Route::get('/{ticket}/archivos', [ArchivosCasoController::class, 'listar'])->name('archivos.listar');
Route::post('/{ticket}/archivos', [ArchivosCasoController::class, 'subir'])->name('archivos.subir');
Route::post('/archivos/{id}/eliminar', [ArchivosCasoController::class, 'eliminar'])->name('archivos.eliminar');
```

## 7. Helpers y traits legacy

| Helper/Trait | Estado post-Sprint 10 |
|-------------|---------------------|
| `app/Helpers/UppercaseText.php` | âœ… **MANTENER** (se aplica en modelos) |
| `app/Helpers/DiasHabiles.php` | â³ Diferido a Sprint 20 |
| `app/Data/PermisosCatalogo.php` | âœ… **MANTENER** como catÃ¡logo de referencia (no depende de BD) |

---

*Documento creado: Julio 2026. Mapa de migraciÃ³n para Sprint 10.*

