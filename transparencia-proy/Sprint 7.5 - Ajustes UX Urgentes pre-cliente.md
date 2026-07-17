#transparencia
# Sprint 7.5 — Ajustes UX Urgentes pre-cliente (NUEVO — Julio 2026) ⏳ URGENTE

**Objetivo:** Ajustes urgentes solicitados por el cliente para antes de la próxima reunión. Cubre 6 áreas de ajustes UX más 1 refactor arquitectónico (catálogo de permisos).

**Origen:** Múltiples pedidos del cliente en reunión Julio 2026.

**Estimación:** 3-4 días.

**Dependencias:** Sprint 7.A cerrado.

---

## 1. Contexto

El cliente pidió en la reunión de Julio 2026 una serie de ajustes para antes de la próxima reunión. Estos ajustes se agrupan en este sprint para entrega conjunta. Algunos son arreglos puntuales, otros son refactors arquitectónicos.

### Filosofía general del sprint
- **Flexibilizar** el sistema: menos burocracia, más poder al usuario (técnicos y jefe).
- **Convención institucional:** MAYÚSCULAS en todos los textos libres.
- **Buenas prácticas:** frontend por permisos, no por roles.
- **Eliminar funcionalidades no núcleo:** Acompañamiento/Intervención se difieren a v2.

---

## 2. Bloque 1: Catálogo de permisos (refactor arquitectónico)

### 2.1 Objetivo
Introducir un sistema de **permisos** desacoplado de los roles, para que el frontend pueda hacer chequeos por capacidad (`useCan('denuncia.editar')`) y no por nombre de rol (`user.rol === 'jefe'`). Esto es una buena práctica que prepara el terreno para Sprint 15 (Roles y Permisos formales con BD).

### 2.2 Catálogo inicial de permisos

```php
// app/Data/PermisosCatalogo.php
return [
    // Denuncias
    'denuncia.registrar' => 'Registrar nuevas denuncias',
    'denuncia.buscar' => 'Buscar y consultar denuncias (Registrador)',
    'denuncia.consultar_codigo' => 'Consultar ticket + PIN de un caso',
    'denuncia.editar' => 'Editar denuncia raíz (solo `ingresada`)',
    'denuncia.eliminar' => 'Eliminar denuncia raíz (solo `ingresada`)',
    'denuncia.conciliar_fechas' => 'Modificar fechas retroactivas (Jefe)',
    
    // Admisión / Rechazo
    'denuncia.admitir' => 'Admitir una denuncia',
    'denuncia.rechazar' => 'Rechazar una denuncia',
    'denuncia.delegar_evaluacion' => 'Delegar evaluación técnica',
    'denuncia.reasumir_evaluacion' => 'Reasumir evaluación técnica',
    
    // Asignación / Traspaso
    'denuncia.asignar' => 'Asignar técnico a una denuncia admitida',
    'denuncia.traspasar' => 'Traspasar denuncia entre técnicos',
    'denuncia.ampliar_plazo' => 'Aprobar ampliación de plazo',
    'denuncia.reabrir' => 'Reabrir denuncia cerrada/rechazada',
    
    // Investigación
    'denuncia.saltar_fase' => 'Saltar fase de investigación',
    'solicitud.crear' => 'Crear solicitud de información',
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
    
    // Administración
    'admin.catalogos' => 'Administrar catálogos (Sprint 10)',
    'admin.feriados' => 'Administrar feriados',
    'admin.preferencias' => 'Configurar preferencias de alertas',
];
```

### 2.3 Mapeo `rol → permisos`

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
- `resources/js/Components/Layout/Sidebar.tsx` (filtra menú por permisos)
- `resources/js/Components/Layout/Header.tsx` (muestra/oculta campana, items de admin)
- `resources/js/Components/Denuncias/Bandeja.tsx` (muestra acciones por permiso)
- `resources/js/Components/Denuncias/MisCasos.tsx` (muestra acciones por permiso)
- `resources/js/Components/Denuncias/DenunciaSheet.tsx` (muestra botones por permiso)

**Patrón:**
```tsx
// ANTES
{user.rol === 'jefe' && <Button>Asignar</Button>}

// DESPUÉS
<Can permiso="denuncia.asignar">
  <Button>Asignar</Button>
</Can>
```

---

## 3. Bloque 2: MAYÚSCULAS obligatorias en textos libres

### 3.1 Objetivo
Por convención institucional, todos los campos de texto libre se almacenan en MAYÚSCULAS.

### 3.2 Implementación backend

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

### 3.3 Implementación frontend

- CSS global en `resources/css/app.css`:
  ```css
  input[type="text"]:not(.no-uppercase),
  textarea:not(.no-uppercase) {
    text-transform: uppercase;
  }
  ```
- Helper visual: placeholder "Se guardará en MAYÚSCULAS" en inputs/textareas afectados.
- **NO aplicar a:** email, password, ticket (auto), token_consulta (auto), nombres de archivo, paths.

### 3.4 Lista de campos afectados (completa)
Ver `Esquema de Base de Datos.md` → sección MAYÚSCULAS para la lista completa (20 tablas).

---

## 4. Bloque 3: CRUD denuncia raíz (solo en `ingresada`)

### 4.1 Objetivo
El cliente pidió que el Registrador y el Jefe puedan editar/eliminar denuncias cuando aún están en estado `ingresada` (errores humanos al registrar). Una vez admitida o rechazada, NO se puede editar/eliminar — solo acciones formales (traspaso, reapertura, ampliación, conciliación).

### 4.2 `ModalEditarDenuncia.tsx` (nuevo)
- Modal que permite editar todos los campos editables de una denuncia `ingresada`:
  - Escenario (revelada, anónimo, reservada)
  - Categoría
  - Fecha, hora, lugar de los hechos
  - Hechos
  - Datos del denunciante
  - Denunciados (agregar/eliminar/editar)
  - Pruebas (agregar/eliminar/editar)
- **NO se puede** cambiar el tipo (corrupción/negación) ni el ticket.
- Reusa los componentes existentes: `SeccionDenunciante`, `BloqueDenunciado`, `SeccionDetalles`, `SeccionRelacionHechos`, `BloquePrueba`.

### 4.3 Acción "Eliminar denuncia"
- Botón en la card de `ingresada` (en Bandeja y MisCasos)
- Abre `ModalConfirmarEliminar` (ya existe, reutilizar)
- Soft delete: la denuncia se marca como `eliminado: true` y se quita de las bandejas
- Solo permitido a Jefe y Registrador
- **NO permitido** en estados `admitida`, `rechazada`, `evaluacion_tecnica`, `asignada`, `investigacion`, `informe`, `cerrada`

### 4.4 Backend

#### `app/Http/Controllers/DenunciaController.php` (nuevos métodos)
- `editar(Request, $ticket)` — valida `estado === 'ingresada'`, actualiza campos, registra en bitácora
- `eliminar(Request, $ticket)` — valida `estado === 'ingresada'` y `permiso denuncia.eliminar`, soft delete

#### `app/Data/DenunciaData.php` (nuevos métodos)
- `editar(string $ticket, array $cambios, int $usuarioId): bool`
- `eliminar(string $ticket, int $usuarioId): bool`

### 4.5 Frontend

#### `Bandeja.tsx` y `MisCasos.tsx`
- En card de denuncia `ingresada`: botones "Editar" y "Eliminar" (con permiso)
- Usar `useCan('denuncia.editar')` y `useCan('denuncia.eliminar')`

---

## 5. Bloque 4: `descargos.medio` libre

### 5.1 Objetivo
El campo `medio` de notificación en descargos pasa de ENUM cerrado a texto libre. La realidad operativa es más diversa que las 4 categorías del ENUM.

### 5.2 Cambios

#### `ModalNotificarDescargo.tsx` (modificar)
- Reemplazar `<Select>` con valores enum por `<Input>` libre
- Label: "Medio de notificación"
- Placeholder: "Ej: Cédula de notificación N° 234, Email institucional, WhatsApp, Presencial, etc."
- Opcional (no required)
- Max 200 caracteres
- MAYÚSCULAS (Sprint 7.5)

#### `app/Http/Controllers/DescargoController.php` (modificar `notificar`)
- Cambiar validación `'medio' => 'required|in:personal,cedula,email,otro'` por `'medio' => 'nullable|string|max:200'`

#### `app/Data/DescargoData.php` (modificar `notificar`)
- Quitar validación enum
- Aceptar string libre

### 5.3 Base de datos (Sprint 14)
- `descargos.medio`: ENUM → TEXT(200) NULLABLE
- Ver `Esquema de Base de Datos.md` → tabla `descargos` → campo `medio`

### 5.4 Migración de seed
- Actualizar seed `DEN-2026-0009` (que usa medio) para reflejar el nuevo formato libre.

---

## 6. Bloque 5: Solicitud con date picker manual

### 6.1 Objetivo
El cliente pidió que las Solicitudes tengan el mismo nivel de flexibilidad que los Descargos: el técnico puede capturar manualmente la fecha en que realmente se envió la solicitud (no la fecha de hoy automáticamente).

### 6.2 Cambios

#### `ModalNuevaSolicitud.tsx` (modificar)
- Agregar `<Input type="date">` para `fecha_envio`
- Default: hoy
- Atributos: `min={hace 90 días}`, `max={hoy}`
- Requerido (no opcional)
- Helper text: "Fecha real en que se envió la solicitud (puede ser anterior a hoy)"

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
- `add(string $ticket, ..., Carbon $fechaEnvio)` — usar `fechaEnvio` en lugar de `now()`
- `responder(int $id, ..., Carbon $fechaRespuesta)` — usar `fechaRespuesta` en lugar de `now()`
- `fecha_vencimiento` se recalcula desde `fecha_envio` (no desde hoy)

### 6.3 Comportamiento
- Coincide con el patrón de `ModalNotificarDescargo`
- Permite paridad con descargos: el técnico registra la fecha real, no la del sistema

---

## 7. Bloque 6: Eliminar acomp/intervención

### 7.1 Objetivo
El cliente decidió que Acompañamiento e Intervención no son núcleo del MVP. Se eliminan del dropdown de registro y se difieren a Sprint 22 (v2).

### 7.2 Cambios

#### `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (modificar)
- Dropdown selector de tipo: solo 2 opciones
  - "Corrupción (Plazo: hasta 45 días)"
  - "Negación de Información (Plazo: hasta 20 días)"
- Eliminar opciones "Acompañamiento" e "Intervención / Medida Correctiva"
- Lógica condicional: solo se renderiza el formulario complejo (corrupción/negación). No se renderizan los formularios de acomp/intervención.

#### Eliminar componentes
- `resources/js/Components/Denuncias/FormularioAcompaniamiento.tsx` (ELIMINAR)
- `resources/js/Components/Denuncias/FormularioIntervencion.tsx` (ELIMINAR)

#### Eliminar referencias en otros componentes
- `resources/js/Components/Denuncias/FormularioComplejo.tsx` (verificar que no se referencia)
- `Plan de Desarrollo.md` (actualizar árbol de archivos)

### 7.3 Base de datos (Sprint 14)
- `denuncias.tipo`: ENUM solo con `'corrupcion'`, `'negacion'`
- Ver `Esquema de Base de Datos.md` → tabla `denuncias` → campo `tipo`

---

## 8. Bloque 7: Hechos 5000 → 8000 caracteres

### 8.1 Objetivo
El Registrador reportó que 5000 caracteres es muy limitante. El cliente sugirió ilimitado pero acordamos 8000 como límite razonable (≈ 1.5 páginas A4).

### 8.2 Cambios

#### `app/Http/Controllers/DenunciaController.php` (modificar `store`)
- Cambiar `'hechos' => 'required|string|min:20|max:5000'` → `'hechos' => 'required|string|min:20|max:8000'`

#### `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (modificar)
- Actualizar contador visible: "Mín. 20, Máx. 8000 caracteres"
- Componente `SeccionRelacionHechos.tsx`: actualizar `maxLength={8000}`

### 8.3 Base de datos (Sprint 14)
- `denuncias.hechos`: TEXT (ya lo es), documentar `max 8000`

---

## 9. Archivos a crear (resumen)

| Archivo | Tipo |
|---------|------|
| `app/Data/PermisosCatalogo.php` | Backend (catálogo) |
| `app/Helpers/UppercaseText.php` | Backend (trait) |
| `resources/js/permissions.ts` | Frontend (catálogo) |
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
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (quitar acomp/intervención, 8000 chars)
- `resources/js/Pages/Denuncias/Bandeja.tsx` (+botones editar/eliminar/conciliar en `ingresada`)
- `resources/js/Pages/Denuncias/MisCasos.tsx` (+botón editar en `ingresada`)
- `resources/js/Components/Denuncias/ModalRechazo.tsx` (Sprint 7.A — SITPRECO opcional)
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

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Frontend por permisos (no roles) | Mantener chequeo por rol | Buena práctica, prepara Sprint 15 |
| 2 | MAYÚSCULAS en backend con trait + frontend con CSS | Solo CSS o solo backend | Doble seguridad |
| 3 | Edición/eliminación solo en `ingresada` | En cualquier estado | Integridad legal; post-admisión, solo acciones formales |
| 4 | `descargos.medio` libre (200 chars) | Mantener ENUM cerrado | Realidad operativa más diversa |
| 5 | Solicitud: date picker manual en `fecha_envio` y `fecha_respuesta` | Auto `now()` | Paridad con descargos |
| 6 | Eliminar acomp/intervención del MVP | Mantenerlas | No son núcleo del objetivo (Ley 974) |
| 7 | Hechos: 5000 → 8000 chars | Ilimitado | Necesario, pero 8000 es razonable |
| 8 | MAYÚSCULAS NO aplica a email, ticket, paths | Aplicar a todo | Respetar case técnico de archivos y auto-generados |

## 13. Verificación de cierre

### Pruebas manuales
1. ✅ Cambiar de usuario demo en el dropdown — el sidebar refleja solo los items del rol
2. ✅ Intentar editar una denuncia `admitida` — el botón "Editar" NO aparece
3. ✅ Intentar eliminar una denuncia `admitida` — el botón "Eliminar" NO aparece
4. ✅ Crear un descargo con medio "Cédula de notificación N° 234" — se guarda en MAYÚSCULAS
5. ✅ Crear una solicitud con fecha_envio de hace 3 días — el plazo se calcula desde esa fecha
6. ✅ Intentar registrar una denuncia de "Acompañamiento" — la opción no aparece
7. ✅ Verificar contador de "hechos" — muestra "0 / 8000"

### Verificación de docs
- ✅ Todos los .md actualizados
- ✅ `Esquema de Base de Datos.md` con campos y tipos correctos
- ✅ `AI-CONTEXT.md` con decisiones del sprint

## 14. Cierre

Al cerrar Sprint 7.5, el sistema queda con:
- Permisos granulares (preparado para Sprint 15)
- MAYÚSCULAS en todos los textos libres
- CRUD flexible en denuncias `ingresada`
- Textos libres en descargos y solicitudes
- Sin acomp/intervención (diferido a Sprint 22 v2)
- Hechos con 8000 chars

**Siguiente sprint urgente:** Sprint 7.6 — Repositorio de Archivos del Caso.

---
*Documento creado: Julio 2026. Sprint 7.5 — Ajustes UX Urgentes pre-cliente.*
