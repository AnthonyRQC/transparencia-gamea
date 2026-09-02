> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 7.5 â€” Ajustes UX Urgentes pre-cliente (Julio 2026) âœ… CERRADO

**Objetivo:** Ajustes urgentes solicitados por el cliente. Cubre 7 bloques: catÃ¡logo de permisos, MAYÃšSCULAS, CRUD denuncia raÃ­z, medio libre descargos, date picker solicitudes, eliminar acomp/intervenciÃ³n, hechos 8000, conciliaciÃ³n de fechas.

**Estado:** âœ… Completado â€” todos los bloques implementados y probados.

**Origen:** MÃºltiples pedidos del cliente en reuniÃ³n Julio 2026.

**EstimaciÃ³n real:** ~5 dÃ­as (incluye refactor de permisos y 7 bloques).

**Dependencias:** Sprint 7.A cerrado.

---

## 1. Contexto

El cliente pidiÃ³ en la reuniÃ³n de Julio 2026 una serie de ajustes para antes de la prÃ³xima reuniÃ³n. Estos ajustes se agrupan en este sprint para entrega conjunta. Algunos son arreglos puntuales, otros son refactors arquitectÃ³nicos.

### FilosofÃ­a general del sprint
- **Flexibilizar** el sistema: menos burocracia, mÃ¡s poder al usuario (tÃ©cnicos y jefe).
- **ConvenciÃ³n institucional:** MAYÃšSCULAS en todos los textos libres.
- **Buenas prÃ¡cticas:** frontend por permisos, no por roles.
- **Eliminar funcionalidades no nÃºcleo:** AcompaÃ±amiento/IntervenciÃ³n se difieren a v2.

---

## 2. Bloque 1: CatÃ¡logo de permisos (refactor arquitectÃ³nico)

### 2.1 Objetivo
Introducir un sistema de **permisos** desacoplado de los roles, para que el frontend pueda hacer chequeos por capacidad (`useCan('denuncia.editar')`) y no por nombre de rol (`user.rol === 'jefe'`). Esto es una buena prÃ¡ctica que prepara el terreno para Sprint 16 (Roles y Permisos formales con BD).

### 2.2 CatÃ¡logo inicial de permisos

```php
// app/Data/PermisosCatalogo.php
return [
    // Denuncias
    'denuncia.registrar' => 'Registrar nuevas denuncias',
    'denuncia.buscar' => 'Buscar y consultar denuncias (Registrador)',
    'denuncia.consultar_codigo' => 'Consultar ticket + PIN de un caso',
    'denuncia.editar' => 'Editar denuncia raÃ­z (solo `ingresada`)',
    'denuncia.eliminar' => 'Eliminar denuncia raÃ­z (solo `ingresada`)',
    'denuncia.conciliar_fechas' => 'Modificar fechas retroactivas (Jefe)',
    
    // AdmisiÃ³n / Rechazo
    'denuncia.admitir' => 'Admitir una denuncia',
    'denuncia.rechazar' => 'Rechazar una denuncia',
    'denuncia.delegar_evaluacion' => 'Delegar evaluaciÃ³n tÃ©cnica',
    'denuncia.reasumir_evaluacion' => 'Reasumir evaluaciÃ³n tÃ©cnica',
    
    // AsignaciÃ³n / Traspaso
    'denuncia.asignar' => 'Asignar tÃ©cnico a una denuncia admitida',
    'denuncia.traspasar' => 'Traspasar denuncia entre tÃ©cnicos',
    'denuncia.ampliar_plazo' => 'Aprobar ampliaciÃ³n de plazo',
    'denuncia.reabrir' => 'Reabrir denuncia cerrada/rechazada',
    
    // InvestigaciÃ³n
    'denuncia.saltar_fase' => 'Saltar fase de investigaciÃ³n',
    'solicitud.crear' => 'Crear solicitud de informaciÃ³n',
    'solicitud.responder' => 'Responder solicitud recibida',
    'solicitud.ampliar' => 'Ampliar plazo de solicitud',
    'solicitud.editar' => 'Editar solicitud existente',
    'solicitud.eliminar' => 'Eliminar (soft delete) solicitud',
    'solicitud.cancelar' => 'Cancelar solicitud pendiente',
    'descargo.crear' => 'Crear descargo',
    'descargo.notificar' => 'Notificar descargo a denunciado',
    'descargo.responder' => 'Responder descargo',
    'descargo.ampliar' => 'Ampliar plazo de descargo',
    'descargo.editar' => 'Editar descargo existente',
    'descargo.eliminar' => 'Eliminar (soft delete) descargo',
    'descargo.cancelar' => 'Cancelar descargo pendiente',
    
    // Informe / Cierre
    'informe.redactar' => 'Redactar Informe Final',
    'informe.editar' => 'Editar Informe Final',
    'informe.eliminar' => 'Eliminar Informe Final',
    'cierre.redactar' => 'Redactar Cierre',
    'cierre.editar' => 'Editar Cierre',
    'cierre.eliminar' => 'Eliminar Cierre',
    
    // Reportes
    'reporte.ver_interno' => 'Ver reportes internos (Jefe)',
    'reporte.exportar' => 'Exportar reportes PDF/Excel',
    
    // AdministraciÃ³n
    'admin.catalogos' => 'Administrar catÃ¡logos (Sprint 10)',
    'admin.feriados' => 'Administrar feriados',
    'admin.preferencias' => 'Configurar preferencias de alertas',
];
```

### 2.3 Mapeo `rol â†’ permisos`

```php
// app/Data/SesionUsuarioData.php (extender)
[
    'registrador-1' => [
        'denuncia.registrar',
        'denuncia.buscar',
        'denuncia.consultar_codigo',
    ],
    'jefe-1' => [
        // todos los permisos
        'denuncia.buscar', 'denuncia.consultar_codigo',
        'denuncia.editar', 'denuncia.eliminar', 'denuncia.conciliar_fechas',
        'denuncia.admitir', 'denuncia.rechazar', 'denuncia.delegar_evaluacion', 'denuncia.reasumir_evaluacion',
        'denuncia.asignar', 'denuncia.traspasar', 'denuncia.ampliar_plazo', 'denuncia.reabrir',
        'solicitud.eliminar', 'solicitud.cancelar', // solo lectura de solicitudes en Bandeja
        'descargo.eliminar', 'descargo.cancelar',
        'informe.eliminar', 'cierre.eliminar',
        'reporte.ver_interno', 'reporte.exportar',
        'admin.catalogos', 'admin.feriados', 'admin.preferencias',
    ],
    'tec-1' => ['denuncia.consultar_codigo', 'denuncia.saltar_fase',
        'solicitud.crear', 'solicitud.responder', 'solicitud.ampliar', 'solicitud.editar',
        'descargo.crear', 'descargo.notificar', 'descargo.responder', 'descargo.ampliar', 'descargo.editar',
        'informe.redactar', 'informe.editar', 'informe.eliminar',
        'cierre.redactar', 'cierre.editar', 'cierre.eliminar',
        'admin.preferencias',
    ],
    'tec-2' => [...mismo que tec-1],
    'tec-3' => [...mismo que tec-1],
]
```

### 2.4 Utilidad en frontend

#### `resources/js/permissions.ts`
```typescript
export const PERMISOS = {
  DENUNCIA_REGISTRAR: 'denuncia.registrar',
  DENUNCIA_BUSCAR: 'denuncia.buscar',
  // ... espejo de PermisosCatalogo.php
} as const;

export type Permiso = typeof PERMISOS[keyof typeof PERMISOS];
```

#### `resources/js/hooks/useCan.ts`
```typescript
import { usePage } from '@inertiajs/react';
import { Permiso } from '@/permissions';

export function useCan(permiso: Permiso | Permiso[]): boolean {
  const { auth } = usePage().props;
  const userPerms = auth?.user?.permisos ?? [];
  const needed = Array.isArray(permiso) ? permiso : [permiso];
  return needed.some(p => userPerms.includes(p));
}
```

#### `resources/js/Components/Can.tsx`
```typescript
import { useCan } from '@/hooks/useCan';
import { Permiso } from '@/permissions';

export function Can({ permiso, children, fallback = null }: {
  permiso: Permiso | Permiso[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return useCan(permiso) ? <>{children}</> : <>{fallback}</>;
}
```

### 2.5 Inertia shared data

`app/Http/Middleware/HandleInertiaRequests.php` (modificar):
```php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => fn () => $request->user()
                ? [
                    'id' => $request->user()->id,
                    'nombre' => $request->user()->nombre,
                    'rol' => SesionUsuarioData::getCurrent()['rol'],
                    'permisos' => SesionUsuarioData::getCurrent()['permisos'] ?? [],
                ]
                : null,
        ],
    ]);
}
```

### 2.6 Refactor de componentes existentes

Componentes que hoy chequean `user.rol` y deben pasar a `useCan()`:
- `resources/js/Components/Layout/Sidebar.tsx` (filtra menÃº por permisos)
- `resources/js/Components/Layout/Header.tsx` (muestra/oculta campana, items de admin)
- `resources/js/Components/Denuncias/Bandeja.tsx` (muestra acciones por permiso)
- `resources/js/Components/Denuncias/MisCasos.tsx` (muestra acciones por permiso)
- `resources/js/Components/Denuncias/DenunciaSheet.tsx` (muestra botones por permiso)

**PatrÃ³n:**
```tsx
// ANTES
{user.rol === 'jefe' && <Button>Asignar</Button>}

// DESPUÃ‰S
<Can permiso="denuncia.asignar">
  <Button>Asignar</Button>
</Can>
```

---

## 3. Bloque 2: MAYÃšSCULAS obligatorias en textos libres

### 3.1 Objetivo
Por convenciÃ³n institucional, todos los campos de texto libre se almacenan en MAYÃšSCULAS.

### 3.2 ImplementaciÃ³n backend

#### `app/Helpers/UppercaseText.php` (nuevo trait)
```php
namespace App\Helpers;

trait UppercaseText
{
    protected static function bootUppercaseText()
    {
        static::saving(function ($model) {
            $campos = [
                'nombres', 'ci', 'dependencia', 'descripcion',
                'lugar_hechos', 'hechos', 'justificacion_admision',
                'justificacion_rechazo', 'resumen_rechazo',
                'conciliacion_motivo', 'detalle', 'respuesta',
                'motivo_cancelacion', 'medio', 'resumen_descargo',
                'justificacion', 'solicitado_por', 'concluido_por',
                'notificacion_medio', 'notificacion_descripcion',
                'no_notificado_motivo', 'detalle_bitacora', 'titulo', 'mensaje',
                'nombre', 'texto_evaluacion', 'justificacion_delegacion',
            ];
            
            foreach ($campos as $campo) {
                if (isset($model->{$campo}) && is_string($model->{$campo})) {
                    $model->{$campo} = mb_strtoupper($model->{$campo}, 'UTF-8');
                }
            }
        });
    }
}
```

Aplicar el trait a los modelos: `Denuncia`, `Denunciante`, `Denunciado`, `Prueba`, `Solicitud`, `Descargo`, `AmpliacionPlazo`, `InformeFinal`, `Cierre`, `Bitacora`, `Notificacion`, `EvaluacionTecnica`, `Feriado`, `CategoriaDenuncia`, `UnidadExterna`, `Usuario`, `ConfiguracionSistema`.

### 3.3 ImplementaciÃ³n frontend

- CSS global en `resources/css/app.css`:
  ```css
  input[type="text"]:not(.no-uppercase),
  textarea:not(.no-uppercase) {
    text-transform: uppercase;
  }
  ```
- Helper visual: placeholder "Se guardarÃ¡ en MAYÃšSCULAS" en inputs/textareas afectados.
- **NO aplicar a:** email, password, ticket (auto), token_consulta (auto), nombres de archivo, paths.

### 3.4 Lista de campos afectados (completa)
Ver `Esquema de Base de Datos.md` â†’ secciÃ³n MAYÃšSCULAS para la lista completa (20 tablas).

---

## 4. Bloque 3: CRUD denuncia raÃ­z (solo en `ingresada`)

### 4.1 Objetivo
El cliente pidiÃ³ que el Registrador y el Jefe puedan editar/eliminar denuncias cuando aÃºn estÃ¡n en estado `ingresada` (errores humanos al registrar). Una vez admitida o rechazada, NO se puede editar/eliminar â€” solo acciones formales (traspaso, reapertura, ampliaciÃ³n, conciliaciÃ³n).

### 4.2 `ModalEditarDenuncia.tsx` (nuevo)
- Modal que permite editar todos los campos editables de una denuncia `ingresada`:
  - Escenario (revelada, anÃ³nimo, reservada)
  - CategorÃ­a
  - Fecha, hora, lugar de los hechos
  - Hechos
  - Datos del denunciante
  - Denunciados (agregar/eliminar/editar)
  - Pruebas (agregar/eliminar/editar)
- **NO se puede** cambiar el tipo (corrupciÃ³n/negaciÃ³n) ni el ticket.
- Reusa los componentes existentes: `SeccionDenunciante`, `BloqueDenunciado`, `SeccionDetalles`, `SeccionRelacionHechos`, `BloquePrueba`.

### 4.3 AcciÃ³n "Eliminar denuncia"
- BotÃ³n en la card de `ingresada` (en Bandeja y MisCasos)
- Abre `ModalConfirmarEliminar` (ya existe, reutilizar)
- Soft delete: la denuncia se marca como `eliminado: true` y se quita de las bandejas
- Solo permitido a Jefe y Registrador
- **NO permitido** en estados `admitida`, `rechazada`, `evaluacion_tecnica`, `asignada`, `investigacion`, `informe`, `cerrada`

### 4.4 Backend

#### `app/Http/Controllers/DenunciaController.php` (nuevos mÃ©todos)
- `editar(Request, $ticket)` â€” valida `estado === 'ingresada'`, actualiza campos, registra en bitÃ¡cora
- `eliminar(Request, $ticket)` â€” valida `estado === 'ingresada'` y `permiso denuncia.eliminar`, soft delete

#### `app/Data/DenunciaData.php` (nuevos mÃ©todos)
- `editar(string $ticket, array $cambios, int $usuarioId): bool`
- `eliminar(string $ticket, int $usuarioId): bool`

### 4.5 Frontend

#### `Bandeja.tsx` y `MisCasos.tsx`
- En card de denuncia `ingresada`: botones "Editar" y "Eliminar" (con permiso)
- Usar `useCan('denuncia.editar')` y `useCan('denuncia.eliminar')`

---

## 5. Bloque 4: `descargos.medio` libre

### 5.1 Objetivo
El campo `medio` de notificaciÃ³n en descargos pasa de ENUM cerrado a texto libre. La realidad operativa es mÃ¡s diversa que las 4 categorÃ­as del ENUM.

### 5.2 Cambios

#### `ModalNotificarDescargo.tsx` (modificar)
- Reemplazar `<Select>` con valores enum por `<Input>` libre
- Label: "Medio de notificaciÃ³n"
- Placeholder: "Ej: CÃ©dula de notificaciÃ³n NÂ° 234, Email institucional, WhatsApp, Presencial, etc."
- Opcional (no required)
- Max 200 caracteres
- MAYÃšSCULAS (Sprint 7.5)

#### `app/Http/Controllers/DescargoController.php` (modificar `notificar`)
- Cambiar validaciÃ³n `'medio' => 'required|in:personal,cedula,email,otro'` por `'medio' => 'nullable|string|max:200'`

#### `app/Data/DescargoData.php` (modificar `notificar`)
- Quitar validaciÃ³n enum
- Aceptar string libre

### 5.3 Base de datos (Sprint 10)
- `descargos.medio`: ENUM â†’ TEXT(200) NULLABLE
- Ver `Esquema de Base de Datos.md` â†’ tabla `descargos` â†’ campo `medio`

### 5.4 MigraciÃ³n de seed
- Actualizar seed `DEN-2026-0009` (que usa medio) para reflejar el nuevo formato libre.

---

## 6. Bloque 5: Solicitud con date picker manual

### 6.1 Objetivo
El cliente pidiÃ³ que las Solicitudes tengan el mismo nivel de flexibilidad que los Descargos: el tÃ©cnico puede capturar manualmente la fecha en que realmente se enviÃ³ la solicitud (no la fecha de hoy automÃ¡ticamente).

### 6.2 Cambios

#### `ModalNuevaSolicitud.tsx` (modificar)
- Agregar `<Input type="date">` para `fecha_envio`
- Default: hoy
- Atributos: `min={hace 90 dÃ­as}`, `max={hoy}`
- Requerido (no opcional)
- Helper text: "Fecha real en que se enviÃ³ la solicitud (puede ser anterior a hoy)"

#### `ModalResponderSolicitud.tsx` (modificar)
- Agregar `<Input type="date">` para `fecha_respuesta`
- Default: hoy
- Atributos: `min={fecha_envio}`, `max={hoy}`
- Requerido
- Helper text: "Fecha real de respuesta de la unidad externa"

#### `app/Http/Controllers/SolicitudController.php` (modificar `store` y `responder`)
- `store`: aceptar `fecha_envio` (required, date, before_or_equal:today, after_or_equal:fecha_envio_minima)
- `responder`: aceptar `fecha_respuesta` (required, date, after_or_equal:fecha_envio, before_or_equal:today)

#### `app/Data/SolicitudData.php` (modificar `add` y `responder`)
- `add(string $ticket, ..., Carbon $fechaEnvio)` â€” usar `fechaEnvio` en lugar de `now()`
- `responder(int $id, ..., Carbon $fechaRespuesta)` â€” usar `fechaRespuesta` en lugar de `now()`
- `fecha_vencimiento` se recalcula desde `fecha_envio` (no desde hoy)

### 6.3 Comportamiento
- Coincide con el patrÃ³n de `ModalNotificarDescargo`
- Permite paridad con descargos: el tÃ©cnico registra la fecha real, no la del sistema

---

## 7. Bloque 6: Eliminar acomp/intervenciÃ³n

### 7.1 Objetivo
El cliente decidiÃ³ que AcompaÃ±amiento e IntervenciÃ³n no son nÃºcleo del MVP. Se eliminan del dropdown de registro y se difieren a Sprint 22 (v2).

### 7.2 Cambios

#### `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (modificar)
- Dropdown selector de tipo: solo 2 opciones
  - "CorrupciÃ³n (Plazo: hasta 45 dÃ­as)"
  - "NegaciÃ³n de InformaciÃ³n (Plazo: hasta 20 dÃ­as)"
- Eliminar opciones "AcompaÃ±amiento" e "IntervenciÃ³n / Medida Correctiva"
- LÃ³gica condicional: solo se renderiza el formulario complejo (corrupciÃ³n/negaciÃ³n). No se renderizan los formularios de acomp/intervenciÃ³n.

#### Eliminar componentes
- `resources/js/Components/Denuncias/FormularioAcompaniamiento.tsx` (ELIMINAR)
- `resources/js/Components/Denuncias/FormularioIntervencion.tsx` (ELIMINAR)

#### Eliminar referencias en otros componentes
- `resources/js/Components/Denuncias/FormularioComplejo.tsx` (verificar que no se referencia)
- `Plan de Desarrollo.md` (actualizar Ã¡rbol de archivos)

### 7.3 Base de datos (Sprint 10)
- `denuncias.tipo`: ENUM solo con `'corrupcion'`, `'negacion'`
- Ver `Esquema de Base de Datos.md` â†’ tabla `denuncias` â†’ campo `tipo`

---

## 8. Bloque 7: Hechos 5000 â†’ 8000 caracteres

### 8.1 Objetivo
El Registrador reportÃ³ que 5000 caracteres es muy limitante. El cliente sugiriÃ³ ilimitado pero acordamos 8000 como lÃ­mite razonable (â‰ˆ 1.5 pÃ¡ginas A4).

### 8.2 Cambios

#### `app/Http/Controllers/DenunciaController.php` (modificar `store`)
- Cambiar `'hechos' => 'required|string|min:20|max:5000'` â†’ `'hechos' => 'required|string|min:20|max:8000'`

#### `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (modificar)
- Actualizar contador visible: "MÃ­n. 20, MÃ¡x. 8000 caracteres"
- Componente `SeccionRelacionHechos.tsx`: actualizar `maxLength={8000}`

### 8.3 Base de datos (Sprint 10)
- `denuncias.hechos`: TEXT (ya lo es), documentar `max 8000`

---

## 9. Archivos a crear (resumen)

| Archivo | Tipo |
|---------|------|
| `app/Data/PermisosCatalogo.php` | Backend (catÃ¡logo) |
| `app/Helpers/UppercaseText.php` | Backend (trait) |
| `resources/js/permissions.ts` | Frontend (catÃ¡logo) |
| `resources/js/hooks/useCan.ts` | Frontend (hook) |
| `resources/js/Components/Can.tsx` | Frontend (componente) |
| `resources/js/Components/Denuncias/ModalEditarDenuncia.tsx` | Frontend (modal) |
| `resources/js/Components/Denuncias/ModalConciliarFechas.tsx` | Frontend (modal) |

## 10. Archivos a modificar (resumen)

### Backend
- `app/Http/Controllers/DenunciaController.php` (+editar, +eliminar, +conciliarFechas, modificar `rechazar`, modificar `store`)
- `app/Data/DenunciaData.php` (+editar, +eliminar, +conciliarFechas, modificar `rechazar`, aplicar UppercaseText)
- `app/Data/SolicitudData.php` (modificar `add`, `responder`, aplicar UppercaseText)
- `app/Data/DescargoData.php` (modificar `notificar`, aplicar UppercaseText)
- `app/Data/SesionUsuarioData.php` (+permisos[] por usuario)
- `app/Http/Controllers/SolicitudController.php` (modificar `store`, `responder`)
- `app/Http/Controllers/DescargoController.php` (modificar `notificar`)
- `app/Http/Middleware/HandleInertiaRequests.php` (compartir permisos)

### Frontend
- `resources/js/Components/Layout/Sidebar.tsx` (refactor: chequeo por permisos)
- `resources/js/Components/Layout/Header.tsx` (refactor: chequeo por permisos)
- `resources/js/Components/Layout/SelectorUsuarioDemo.tsx` (mostrar permisos al hover)
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (quitar acomp/intervenciÃ³n, 8000 chars)
- `resources/js/Pages/Denuncias/Bandeja.tsx` (+botones editar/eliminar/conciliar en `ingresada`)
- `resources/js/Pages/Denuncias/MisCasos.tsx` (+botÃ³n editar en `ingresada`)
- `resources/js/Components/Denuncias/ModalRechazo.tsx` (Sprint 7.A â€” SITPRECO opcional)
- `resources/js/Components/Denuncias/ModalNotificarDescargo.tsx` (medio libre)
- `resources/js/Components/Denuncias/ModalNuevaSolicitud.tsx` (+date picker `fecha_envio`)
- `resources/js/Components/Denuncias/ModalResponderSolicitud.tsx` (+date picker `fecha_respuesta`)
- `resources/js/Components/Denuncias/SeccionRelacionHechos.tsx` (maxLength 8000)
- `resources/js/Components/Denuncias/FormularioAcompaniamiento.tsx` (ELIMINAR)
- `resources/js/Components/Denuncias/FormularioIntervencion.tsx` (ELIMINAR)
- `resources/css/app.css` (text-transform: uppercase global)

## 11. shadcn a instalar
- `dropdown-menu` (para `useCan` en componentes)

## 12. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Frontend por permisos (no roles) | Mantener chequeo por rol | Buena prÃ¡ctica, prepara Sprint 16 |
| 2 | MAYÃšSCULAS en backend con trait + frontend con CSS | Solo CSS o solo backend | Doble seguridad |
| 3 | EdiciÃ³n/eliminaciÃ³n solo en `ingresada` | En cualquier estado | Integridad legal; post-admisiÃ³n, solo acciones formales |
| 4 | `descargos.medio` libre (200 chars) | Mantener ENUM cerrado | Realidad operativa mÃ¡s diversa |
| 5 | Solicitud: date picker manual en `fecha_envio` y `fecha_respuesta` | Auto `now()` | Paridad con descargos |
| 6 | Eliminar acomp/intervenciÃ³n del MVP | Mantenerlas | No son nÃºcleo del objetivo (Ley 974) |
| 7 | Hechos: 5000 â†’ 8000 chars | Ilimitado | Necesario, pero 8000 es razonable |
| 8 | MAYÃšSCULAS NO aplica a email, ticket, paths | Aplicar a todo | Respetar case tÃ©cnico de archivos y auto-generados |

## 13. VerificaciÃ³n de cierre

### Pruebas manuales
1. âœ… Cambiar de usuario demo en el dropdown â€” el sidebar refleja solo los items del rol
2. âœ… Intentar editar una denuncia `admitida` â€” el botÃ³n "Editar" NO aparece
3. âœ… Intentar eliminar una denuncia `admitida` â€” el botÃ³n "Eliminar" NO aparece
4. âœ… Crear un descargo con medio "CÃ©dula de notificaciÃ³n NÂ° 234" â€” se guarda en MAYÃšSCULAS
5. âœ… Crear una solicitud con fecha_envio de hace 3 dÃ­as â€” el plazo se calcula desde esa fecha
6. âœ… Intentar registrar una denuncia de "AcompaÃ±amiento" â€” la opciÃ³n no aparece
7. âœ… Verificar contador de "hechos" â€” muestra "0 / 8000"

### VerificaciÃ³n de docs
- âœ… Todos los .md actualizados
- âœ… `Esquema de Base de Datos.md` con campos y tipos correctos
- âœ… `AI-CONTEXT.md` con decisiones del sprint

## 14. Cierre

Al cerrar Sprint 7.5, el sistema queda con:
- Permisos granulares (preparado para Sprint 16)
- MAYÃšSCULAS en todos los textos libres
- CRUD flexible en denuncias `ingresada`
- Textos libres en descargos y solicitudes
- Sin acomp/intervenciÃ³n (diferido a Sprint 22 v2)
- Hechos con 8000 chars

**Siguiente sprint urgente:** Sprint 7.6 â€” Repositorio de Archivos del Caso.

---
*Documento creado: Julio 2026. Sprint 7.5 â€” Ajustes UX Urgentes pre-cliente.*

