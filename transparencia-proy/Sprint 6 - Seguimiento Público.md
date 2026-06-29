#transparencia
# Sprint 6 — Seguimiento Público ✅ COMPLETADO (Junio 2026)

**Objetivo:** Página pública sin autenticación para que los ciudadanos consulten el estado de su denuncia mediante número de ticket + token de seguridad de 4 dígitos. La búsqueda utiliza una llave compuesta (ticket, token) para evitar enumeración de denuncias.

---

## 1. Backend (PHP)

### 1.1 Backend creado

| Archivo | Descripción |
|---------|-------------|
| `app/Http/Controllers/SeguimientoController.php` | Método `buscar(Request)`: valida regex `^DEN-\d{4}-\d{4}-\d{4}$`, busca con `findByTicketAndToken()`, mapea solo campos públicos (whitelist explícita), retorna Inertia. Rate limit: throttle 30 requests/min por IP. |

### 1.2 Backend modificado

| Archivo | Cambio |
|---------|--------|
| `app/Data/DenunciaData.php` | Nuevos campos: `token_consulta` (4 dígitos, STR_PAD_LEFT), `resumen_rechazo` (string nullable). Nuevos métodos: `generateToken()` (random_int 1000-9999), `findByTicketAndToken(ticket, token)`. `add()`: inicializa ambos campos. `rechazar()`: acepta 3er parámetro opcional `?string $resumenRechazo = null`. `makeDenuncia()`: defaults `token_consulta` (''), `resumen_rechazo` (null). Seed: 12 tokens determinísticos (1001-1012). Seed DEN-2026-0005 +resumen_rechazo. |
| `app/Http/Controllers/DenunciaController.php` | `rechazar()`: +validación `resumen_rechazo` (nullable, string, max:200), pasa como 3er argumento a `DenunciaData::rechazar()`. `store()`: +token en flash response (lee desde `DenunciaData::find()` post-add). |
| `routes/web.php` | `GET /seguimiento` → `[SeguimientoController::class, 'buscar']` con `->middleware('throttle:30,1')`. Import `use App\Http\Controllers\SeguimientoController`. |

### 1.3 Whitelist de campos públicos (sanitización en SeguimientoController::mapPublicData)

Campos que **SÍ** se exponen al ciudadano:
- `ticket`, `tipo`, `tipo_legible` (mapeado desde tipo raw)
- `estado`, `estado_legible` (mapeado desde estado raw)
- `fecha_ingreso` (`created_at`)
- `fecha_vencimiento` (calculado via `getPlazoInfo()`)
- `plazo_total_dias` (45 o 20 según tipo)
- `mensaje_avance` (texto semi-dinámico por estado + items relacionados)
- `pasos` (4 booleans para el stepper + rechazada)
- `resumen_rechazo` (solo si existe, máx 200 chars)
- `clasificacion` (informe_clasificacion, solo si cerrada)
- `fecha_cierre` (cierre_cerrado_at, solo si cerrada)

Campos que **NUNCA** se exponen:
- `denunciante` (nombres, CI, email, teléfono)
- `denunciados` (nombres, dependencia, descripción)
- `hechos` (relación de hechos)
- `pruebas` (tipo, descripción, testigos, archivos)
- `tecnico`, `tecnico_anterior`
- `bitacora` (historial interno del caso)
- `justificacion_admision`, `justificacion_rechazo` (interno)
- `justificacion_traspaso`, `justificacion_reapertura`
- `informe_*` (a excepción de clasificación)
- `cierre_*` (a excepción de fecha_cierre)
- `informe_archivos`, `cierre_archivos`

---

## 2. Frontend (React + TypeScript)

### 2.1 Componentes creados (6 nuevos en `Components/Publico/`)

| Componente | Descripción |
|------------|-------------|
| `BuscadorTicket.tsx` | Input controlado de texto plano. Auto-uppercase via `e.target.value.toUpperCase()`. Validación regex `^DEN-\d{4}-\d{4}-\d{4}$`. Submit con `router.get()` vía Inertia. Estados: processing (spinner), disabled. Atributos: `maxLength={19}`, `autoComplete="off"`, `spellCheck={false}`. Foco automático en mount. |
| `StepperProgreso.tsx` | 4 pasos visuales (Recepción → Evaluación del Jefe → Investigación → Resolución/Cierre). Colores: completado (primary/bg-primary), actual (secondary + animate-pulse), pendiente (border + muted). Rama roja para estado `rechazada` (paso 2 cambia a XCircle + label "Rechazada"). |
| `ResultadoSeguimiento.tsx` | Card completa con 4 secciones: (1) header con badge estado + tipo + ticket + fechas, (2) StepperProgreso, (3) mensaje de avance con icono, (4) sello legal UTLCC. Badges dinámicos por estado y clasificación. Formatea fechas con `toLocaleDateString('es-BO')`. |
| `EstadoVacio.tsx` | Empty state inicial: icono Search + texto "Ingresa tu número de ticket y código de seguridad para consultar". |
| `EstadoNoEncontrado.tsx` | Error state: icono AlertCircle + título "Denuncia no encontrada" + descripción + botón "Volver a buscar" (dispara `router.get()` limpio). |
| `EsqueletoBusqueda.tsx` | Skeleton con `animate-pulse`: 4 bloques circulares (steps) + 2 líneas de texto. Se muestra mientras `processing === true`. |

### 2.2 Componentes modificados (5)

| Componente | Cambio |
|------------|--------|
| `Pages/Seguimiento/Buscar.tsx` | **Refactor completo**. Antes: placeholder estático sin lógica. Ahora: integra `usePage().props` con `encontrado`, `denuncia`, `error`. 4 estados condicionales: inicial (EstadoVacio), procesando (EsqueletoBusqueda), encontrado (ResultadoSeguimiento), no-encontrado (EstadoNoEncontrado), formato-inválido (mensaje inline danger). `handleReintentar` con `router.get()` limpio. |
| `Pages/Welcome.tsx` | Removida toda lógica de búsqueda mock (MOCK_TICKETS, handleSearch, handleQuickSelect, searchedTicket, steps, stepper, resultados). Agregado botón CTA hero `<Link href={route('seguimiento.buscar')}>` con Search + ArrowRight. Se mantienen: header, hero, FAQ, soporte, footer, dark mode toggle. |
| `Components/Denuncias/ModalRechazo.tsx` | +textarea "Resumen breve para el denunciante (opcional, máx 200 chars)" con Separator visual. +subtítulo "Visible solo en el sistema interno" para la justificación. +subtítulo "Este texto se mostrará al ciudadano en la consulta pública" para el resumen. +state `resumenRechazo`, reset en submit. |
| `Components/Denuncias/ModalExito.tsx` | +prop `token?: string`. Si existe, se renderiza bloque "Código de Seguridad" con el PIN de 4 dígitos, separado del ticket por un borde. Texto del párrafo informativo actualizado a "Guarde este número y código para dar seguimiento". |
| `Pages/Denuncias/RegistroDenuncia.tsx` | +extracción de `successToken` desde `usePage().props`. +state `token: string`. En `useEffect`, si `successToken` existe, setToken. `ModalExito` recibe `token={token}`. |

---

## 3. Rutas

```
GET  /seguimiento?ticket=DEN-AAAA-NNNN-PPPP  → SeguimientoController@buscar (throttle:30,1)
```

La ruta es pública (sin middleware `auth`). Usa `throttle:30,1` para limitar a 30 requests/minuto por IP.

---

## 4. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Token 4 dígitos numérico + ticket como llave compuesta | Token UUID largo / sin token | Par (ticket, token) = único. 10.000 combinaciones mitigado con rate limit. Fácil de recordar por el ciudadano. |
| 2 | Token generado al registrar la denuncia (en `add()`) | Al admitir/rechazar | El ciudadano puede consultar desde el día 1, incluso si está `ingresada` |
| 3 | Campo `token_consulta` en mock data persistente | Generar en cada consulta | Persistencia para todo el ciclo de vida de la denuncia en la sesión |
| 4 | Input plano controlado con regex directo (sin auto-formato) | Auto-formato con guiones automáticos | Bug detectado post-implementación: `formatTicketInput()` solo aceptaba la primera letra del prefijo DEN. Input plano con `toUpperCase()` + regex es más robusto. |
| 5 | `only: ['encontrado', 'denuncia', 'error']` en `router.get()` | Full page reload / preserveState completo | Solo hidrata las props que cambian. Input preservado sin recargar el componente. |
| 6 | Whitelist explícita de campos públicos en SeguimientoController | Enviar toda la denuncia y filtrar en frontend | Seguridad por capas: el backend nunca envía datos sensibles. Si hay un bug en frontend, los datos no se exponen. |
| 7 | Stepper 4 pasos: Recepción → Evaluación → Investigación → Resolución | 3 pasos o timeline cronológico | Refleja los "gates" legales del proceso. Rama roja para rechazada. |
| 8 | Mensaje de avance semi-dinámico desde backend | Texto fijo / detallado con nombres | Combina estado + indicadores de actividad (solicitudes/descargos) sin exponer nombres ni cantidades exactas. |
| 9 | No mostrar conteo específico de solicitudes/descargos | Mostrar "Se emitieron 2 solicitudes" | Privacidad: no revelar cuántas dependencias externas ni cuántos denunciados están involucrados. |
| 10 | Clasificación visible en denuncias cerradas + nota "pase por oficina" | Todo el contenido del FormCierre | Balance entre transparencia y privacidad. El ciudadano sabe la clasificación pero los detalles los ve en oficina. |
| 11 | `resumen_rechazo` opcional en ModalRechazo | Obligatorio | No forzar al Jefe a redactar un resumen público si el caso es evidente. Si vacío, texto genérico por defecto. |
| 12 | Dos textareas separadas en ModalRechazo (justificación + resumen) | Un textarea con switch público/interno | Separación clara de audiencias. Cada textarea tiene su propio label, placeholder y texto de ayuda. |
| 13 | Solo fecha estimada de cierre (sin contador de días restantes) | Con contador "Quedan X días" | El ciudadano ve la fecha sin generar ansinnecesaria si el plazo está por vencer. |
| 14 | Welcome mínima: CTA a /seguimiento en hero | Landing con stats o sin cambios | Mantiene hero visual, FAQ informativo y soporte. Remueve search mock que duplicaba funcionalidad de /seguimiento. |
| 15 | Regex `^DEN-\d{4}-\d{4}-\d{4}$` como único validador | Formateo inteligente / auto-guiones | Simplicidad: el usuario escribe exactamente lo que ve en su comprobante. Cero magia, cero bugs. |
| 16 | Mismo error "no encontrado" para ticket no existe vs token incorrecto | Error específico "PIN incorrecto" | Security through obscurity: no revelar si el ticket existe o no. |
| 17 | `noindex` no implementado (puede agregarse después) | `<meta name="robots" content="noindex">` | La ruta /seguimiento no tiene datos sensibles en la página base. Solo si se indexaran las URLs con query params sería relevante. |

---

## 5. Tokens seed determinísticos

```
DEN-2026-0001-1001 (ingresada)
DEN-2026-0002-1002 (ingresada)
DEN-2026-0003-1003 (ingresada)
DEN-2026-0004-1004 (admitida)
DEN-2026-0005-1005 (rechazada)
DEN-2026-0006-1006 (asignada)
DEN-2026-0007-1007 (asignada)
DEN-2026-0008-1008 (investigacion)
DEN-2026-0009-1009 (investigacion)
DEN-2026-0010-1010 (informe)
DEN-2026-0011-1011 (cerrada)
DEN-2026-0012-1012 (cerrada/archivada)
```

Para testear, usar cualquier combinación ej: `DEN-2026-0001-1001`, `DEN-2026-0005-1005` (rechazada con resumen).

---

## 6. Mensajes de avance por estado

Los mensajes son semi-dinámicos: el backend calcula el texto según el estado y la existencia de solicitudes/descargos relacionados, sin exponer nombres ni cantidades exactas.

| Estado | Condición | Mensaje |
|--------|-----------|---------|
| `ingresada` | — | Su denuncia fue recibida y se encuentra en evaluación inicial. La UTLCC tiene un plazo máximo de 5 días hábiles para admitirla o rechazarla. |
| `admitida` | — | Su denuncia ha sido admitida y está siendo preparada para asignarse a un equipo técnico. |
| `asignada` | — | Su denuncia ha sido asignada a un equipo técnico. La investigación se iniciará en los próximos días. |
| `investigacion` | Sin solicitudes ni descargos | Su denuncia está siendo investigada por la UTLCC. |
| `investigacion` | Con solicitudes activas | Su denuncia está siendo investigada. Se realizaron solicitudes de información a unidades externas. |
| `investigacion` | Con descargos notificados | Su denuncia está siendo investigada. Se notificó a las personas denunciadas para que presenten sus descargos. |
| `informe` | — | La investigación ha concluido. Se está redactando el Informe Final que será remitido a la Máxima Autoridad Institucional. |
| `cerrada` | — | Su denuncia ha sido cerrada ({clasificación}). Para más información, acérquese a la oficina de la UTLCC. |
| `rechazada` | Con resumen | Su denuncia no fue admitida. {resumen_rechazo} |
| `rechazada` | Sin resumen | Su denuncia no fue admitida por no cumplir los requisitos establecidos en la Ley N° 974. |

**Clasificaciones (para cerrada):** Penal · Civil · Administrativo · Sin Indicios · Medida Correctiva · Archivado

---

## 7. Bug fix post-implementación

**Problema:** El `BuscadorTicket.tsx` original tenía una función `formatTicketInput()` que intentaba formatear automáticamente el ticket con guiones. La condición `if (result === '')` solo aceptaba la **primera letra** del prefijo `DEN`, ignorando la "E" y la "N". Al tipear "DE" se perdía la "E". Al pegar `DEN-2026-0004-1004` el resultado era `D2026-0004-1004` (sin "EN"), y el botón "Consultar Estado" quedaba deshabilitado porque `canSubmit` verificaba el regex `^DEN-\d{4}-\d{4}-\d{4}$`.

**Solución:** Reemplazar toda la lógica de auto-formato por un input de texto plano controlado:

```tsx
const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value.toUpperCase());
}, []);
const canSubmit = /^DEN-\d{4}-\d{4}-\d{4}$/.test(value);
```

El usuario escribe el formato completo `DEN-2026-0004-1004` con guiones manuales (tal como aparece en su comprobante). El input solo convierte a mayúsculas automáticamente. La validación es directa por regex.

---

## 8. TODO — Preguntar al cliente

> ⚠️ **TODO — Preguntar al cliente:** ¿La funcionalidad de "archivar casos" debe ser un subestado de `cerrada` (actual: `subestado: 'archivada'`) o un estado/proceso separado con flujo propio? Por el momento se mantiene como subestado sin afectar UX de la vista pública. Agendar consulta con cliente.

---

## 9. Notas técnicas

- **Throttle:** La ruta `/seguimiento` usa `middleware('throttle:30,1')` para limitar a 30 requests/minuto por IP.
- **Seguridad de la búsqueda:** Si el token no coincide o el ticket no existe, se retorna el mismo error "no encontrado". No se revela si el ticket existe pero el token es incorrecto.
- **Formato de input:** El input tiene `maxLength={19}` (coincide con `DEN-XXXX-XXXX-XXXX` = 17 chars + 2 guiones), `autoComplete="off"` y `spellCheck={false}`.
- **Inertia `only`:** El `router.get()` usa `only: ['encontrado', 'denuncia', 'error']` para preservar el estado del input y otros componentes de la página.
- **Fechas:** Se formatean en el frontend con `toLocaleDateString('es-BO')` para consistencia regional.
- **shadcn:** No se instalaron componentes nuevos. Se reusan `card`, `badge`, `button`, `separator`, `input`, `sonner`, `dialog`.
