> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 6 â€” Seguimiento PÃºblico âœ… COMPLETADO (Junio 2026)

**Objetivo:** PÃ¡gina pÃºblica sin autenticaciÃ³n para que los ciudadanos consulten el estado de su denuncia mediante nÃºmero de ticket + token de seguridad de 4 dÃ­gitos. La bÃºsqueda utiliza una llave compuesta (ticket, token) para evitar enumeraciÃ³n de denuncias.

---

## 1. Backend (PHP)

### 1.1 Backend creado

| Archivo | DescripciÃ³n |
|---------|-------------|
| `app/Http/Controllers/SeguimientoController.php` | MÃ©todo `buscar(Request)`: valida regex `^DEN-\d{4}-\d{4}-\d{4}$`, busca con `findByTicketAndToken()`, mapea solo campos pÃºblicos (whitelist explÃ­cita), retorna Inertia. Rate limit: throttle 30 requests/min por IP. |

### 1.2 Backend modificado

| Archivo | Cambio |
|---------|--------|
| `app/Data/DenunciaData.php` | Nuevos campos: `token_consulta` (4 dÃ­gitos, STR_PAD_LEFT), `resumen_rechazo` (string nullable). Nuevos mÃ©todos: `generateToken()` (random_int 1000-9999), `findByTicketAndToken(ticket, token)`. `add()`: inicializa ambos campos. `rechazar()`: acepta 3er parÃ¡metro opcional `?string $resumenRechazo = null`. `makeDenuncia()`: defaults `token_consulta` (''), `resumen_rechazo` (null). Seed: 12 tokens determinÃ­sticos (1001-1012). Seed DEN-2026-0005 +resumen_rechazo. |
| `app/Http/Controllers/DenunciaController.php` | `rechazar()`: +validaciÃ³n `resumen_rechazo` (nullable, string, max:200), pasa como 3er argumento a `DenunciaData::rechazar()`. `store()`: +token en flash response (lee desde `DenunciaData::find()` post-add). |
| `routes/web.php` | `GET /seguimiento` â†’ `[SeguimientoController::class, 'buscar']` con `->middleware('throttle:30,1')`. Import `use App\Http\Controllers\SeguimientoController`. |

### 1.3 Whitelist de campos pÃºblicos (sanitizaciÃ³n en SeguimientoController::mapPublicData)

Campos que **SÃ** se exponen al ciudadano:
- `ticket`, `tipo`, `tipo_legible` (mapeado desde tipo raw)
- `estado`, `estado_legible` (mapeado desde estado raw)
- `fecha_ingreso` (`created_at`)
- `fecha_vencimiento` (calculado via `getPlazoInfo()`)
- `plazo_total_dias` (45 o 20 segÃºn tipo)
- `mensaje_avance` (texto semi-dinÃ¡mico por estado + items relacionados)
- `pasos` (4 booleans para el stepper + rechazada)
- `resumen_rechazo` (solo si existe, mÃ¡x 200 chars)
- `clasificacion` (informe_clasificacion, solo si cerrada)
- `fecha_cierre` (cierre_cerrado_at, solo si cerrada)

Campos que **NUNCA** se exponen:
- `denunciante` (nombres, CI, email, telÃ©fono)
- `denunciados` (nombres, dependencia, descripciÃ³n)
- `hechos` (relaciÃ³n de hechos)
- `pruebas` (tipo, descripciÃ³n, testigos, archivos)
- `tecnico`, `tecnico_anterior`
- `bitacora` (historial interno del caso)
- `justificacion_admision`, `justificacion_rechazo` (interno)
- `justificacion_traspaso`, `justificacion_reapertura`
- `informe_*` (a excepciÃ³n de clasificaciÃ³n)
- `cierre_*` (a excepciÃ³n de fecha_cierre)
- `informe_archivos`, `cierre_archivos`

---

## 2. Frontend (React + TypeScript)

### 2.1 Componentes creados (6 nuevos en `Components/Publico/`)

| Componente | DescripciÃ³n |
|------------|-------------|
| `BuscadorTicket.tsx` | Input controlado de texto plano. Auto-uppercase via `e.target.value.toUpperCase()`. ValidaciÃ³n regex `^DEN-\d{4}-\d{4}-\d{4}$`. Submit con `router.get()` vÃ­a Inertia. Estados: processing (spinner), disabled. Atributos: `maxLength={19}`, `autoComplete="off"`, `spellCheck={false}`. Foco automÃ¡tico en mount. |
| `StepperProgreso.tsx` | 4 pasos visuales (RecepciÃ³n â†’ EvaluaciÃ³n del Jefe â†’ InvestigaciÃ³n â†’ ResoluciÃ³n/Cierre). Colores: completado (primary/bg-primary), actual (secondary + animate-pulse), pendiente (border + muted). Rama roja para estado `rechazada` (paso 2 cambia a XCircle + label "Rechazada"). |
| `ResultadoSeguimiento.tsx` | Card completa con 4 secciones: (1) header con badge estado + tipo + ticket + fechas, (2) StepperProgreso, (3) mensaje de avance con icono, (4) sello legal UTLCC. Badges dinÃ¡micos por estado y clasificaciÃ³n. Formatea fechas con `toLocaleDateString('es-BO')`. |
| `EstadoVacio.tsx` | Empty state inicial: icono Search + texto "Ingresa tu nÃºmero de ticket y cÃ³digo de seguridad para consultar". |
| `EstadoNoEncontrado.tsx` | Error state: icono AlertCircle + tÃ­tulo "Denuncia no encontrada" + descripciÃ³n + botÃ³n "Volver a buscar" (dispara `router.get()` limpio). |
| `EsqueletoBusqueda.tsx` | Skeleton con `animate-pulse`: 4 bloques circulares (steps) + 2 lÃ­neas de texto. Se muestra mientras `processing === true`. |

### 2.2 Componentes modificados (5)

| Componente | Cambio |
|------------|--------|
| `Pages/Seguimiento/Buscar.tsx` | **Refactor completo**. Antes: placeholder estÃ¡tico sin lÃ³gica. Ahora: integra `usePage().props` con `encontrado`, `denuncia`, `error`. 4 estados condicionales: inicial (EstadoVacio), procesando (EsqueletoBusqueda), encontrado (ResultadoSeguimiento), no-encontrado (EstadoNoEncontrado), formato-invÃ¡lido (mensaje inline danger). `handleReintentar` con `router.get()` limpio. |
| `Pages/Welcome.tsx` | Removida toda lÃ³gica de bÃºsqueda mock (MOCK_TICKETS, handleSearch, handleQuickSelect, searchedTicket, steps, stepper, resultados). Agregado botÃ³n CTA hero `<Link href={route('seguimiento.buscar')}>` con Search + ArrowRight. Se mantienen: header, hero, FAQ, soporte, footer, dark mode toggle. |
| `Components/Denuncias/ModalRechazo.tsx` | +textarea "Resumen breve para el denunciante (opcional, mÃ¡x 200 chars)" con Separator visual. +subtÃ­tulo "Visible solo en el sistema interno" para la justificaciÃ³n. +subtÃ­tulo "Este texto se mostrarÃ¡ al ciudadano en la consulta pÃºblica" para el resumen. +state `resumenRechazo`, reset en submit. |
| `Components/Denuncias/ModalExito.tsx` | +prop `token?: string`. Si existe, se renderiza bloque "CÃ³digo de Seguridad" con el PIN de 4 dÃ­gitos, separado del ticket por un borde. Texto del pÃ¡rrafo informativo actualizado a "Guarde este nÃºmero y cÃ³digo para dar seguimiento". |
| `Pages/Denuncias/RegistroDenuncia.tsx` | +extracciÃ³n de `successToken` desde `usePage().props`. +state `token: string`. En `useEffect`, si `successToken` existe, setToken. `ModalExito` recibe `token={token}`. |

---

## 3. Rutas

```
GET  /seguimiento?ticket=DEN-AAAA-NNNN-PPPP  â†’ SeguimientoController@buscar (throttle:30,1)
```

La ruta es pÃºblica (sin middleware `auth`). Usa `throttle:30,1` para limitar a 30 requests/minuto por IP.

---

## 4. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Token 4 dÃ­gitos numÃ©rico + ticket como llave compuesta | Token UUID largo / sin token | Par (ticket, token) = Ãºnico. 10.000 combinaciones mitigado con rate limit. FÃ¡cil de recordar por el ciudadano. |
| 2 | Token generado al registrar la denuncia (en `add()`) | Al admitir/rechazar | El ciudadano puede consultar desde el dÃ­a 1, incluso si estÃ¡ `ingresada` |
| 3 | Campo `token_consulta` en mock data persistente | Generar en cada consulta | Persistencia para todo el ciclo de vida de la denuncia en la sesiÃ³n |
| 4 | Input plano controlado con regex directo (sin auto-formato) | Auto-formato con guiones automÃ¡ticos | Bug detectado post-implementaciÃ³n: `formatTicketInput()` solo aceptaba la primera letra del prefijo DEN. Input plano con `toUpperCase()` + regex es mÃ¡s robusto. |
| 5 | `only: ['encontrado', 'denuncia', 'error']` en `router.get()` | Full page reload / preserveState completo | Solo hidrata las props que cambian. Input preservado sin recargar el componente. |
| 6 | Whitelist explÃ­cita de campos pÃºblicos en SeguimientoController | Enviar toda la denuncia y filtrar en frontend | Seguridad por capas: el backend nunca envÃ­a datos sensibles. Si hay un bug en frontend, los datos no se exponen. |
| 7 | Stepper 4 pasos: RecepciÃ³n â†’ EvaluaciÃ³n â†’ InvestigaciÃ³n â†’ ResoluciÃ³n | 3 pasos o timeline cronolÃ³gico | Refleja los "gates" legales del proceso. Rama roja para rechazada. |
| 8 | Mensaje de avance semi-dinÃ¡mico desde backend | Texto fijo / detallado con nombres | Combina estado + indicadores de actividad (solicitudes/descargos) sin exponer nombres ni cantidades exactas. |
| 9 | No mostrar conteo especÃ­fico de solicitudes/descargos | Mostrar "Se emitieron 2 solicitudes" | Privacidad: no revelar cuÃ¡ntas dependencias externas ni cuÃ¡ntos denunciados estÃ¡n involucrados. |
| 10 | ClasificaciÃ³n visible en denuncias cerradas + nota "pase por oficina" | Todo el contenido del FormCierre | Balance entre transparencia y privacidad. El ciudadano sabe la clasificaciÃ³n pero los detalles los ve en oficina. |
| 11 | `resumen_rechazo` opcional en ModalRechazo | Obligatorio | No forzar al Jefe a redactar un resumen pÃºblico si el caso es evidente. Si vacÃ­o, texto genÃ©rico por defecto. |
| 12 | Dos textareas separadas en ModalRechazo (justificaciÃ³n + resumen) | Un textarea con switch pÃºblico/interno | SeparaciÃ³n clara de audiencias. Cada textarea tiene su propio label, placeholder y texto de ayuda. |
| 13 | Solo fecha estimada de cierre (sin contador de dÃ­as restantes) | Con contador "Quedan X dÃ­as" | El ciudadano ve la fecha sin generar ansinnecesaria si el plazo estÃ¡ por vencer. |
| 14 | Welcome mÃ­nima: CTA a /seguimiento en hero | Landing con stats o sin cambios | Mantiene hero visual, FAQ informativo y soporte. Remueve search mock que duplicaba funcionalidad de /seguimiento. |
| 15 | Regex `^DEN-\d{4}-\d{4}-\d{4}$` como Ãºnico validador | Formateo inteligente / auto-guiones | Simplicidad: el usuario escribe exactamente lo que ve en su comprobante. Cero magia, cero bugs. |
| 16 | Mismo error "no encontrado" para ticket no existe vs token incorrecto | Error especÃ­fico "PIN incorrecto" | Security through obscurity: no revelar si el ticket existe o no. |
| 17 | `noindex` no implementado (puede agregarse despuÃ©s) | `<meta name="robots" content="noindex">` | La ruta /seguimiento no tiene datos sensibles en la pÃ¡gina base. Solo si se indexaran las URLs con query params serÃ­a relevante. |

---

## 5. Tokens seed determinÃ­sticos

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

Para testear, usar cualquier combinaciÃ³n ej: `DEN-2026-0001-1001`, `DEN-2026-0005-1005` (rechazada con resumen).

---

## 6. Mensajes de avance por estado

Los mensajes son semi-dinÃ¡micos: el backend calcula el texto segÃºn el estado y la existencia de solicitudes/descargos relacionados, sin exponer nombres ni cantidades exactas.

| Estado | CondiciÃ³n | Mensaje |
|--------|-----------|---------|
| `ingresada` | â€” | Su denuncia fue recibida y se encuentra en evaluaciÃ³n inicial. La UTLCC tiene un plazo mÃ¡ximo de 5 dÃ­as hÃ¡biles para admitirla o rechazarla. |
| `admitida` | â€” | Su denuncia ha sido admitida y estÃ¡ siendo preparada para asignarse a un equipo tÃ©cnico. |
| `asignada` | â€” | Su denuncia ha sido asignada a un equipo tÃ©cnico. La investigaciÃ³n se iniciarÃ¡ en los prÃ³ximos dÃ­as. |
| `investigacion` | Sin solicitudes ni descargos | Su denuncia estÃ¡ siendo investigada por la UTLCC. |
| `investigacion` | Con solicitudes activas | Su denuncia estÃ¡ siendo investigada. Se realizaron solicitudes de informaciÃ³n a unidades externas. |
| `investigacion` | Con descargos notificados | Su denuncia estÃ¡ siendo investigada. Se notificÃ³ a las personas denunciadas para que presenten sus descargos. |
| `informe` | â€” | La investigaciÃ³n ha concluido. Se estÃ¡ redactando el Informe Final que serÃ¡ remitido a la MÃ¡xima Autoridad Institucional. |
| `cerrada` | â€” | Su denuncia ha sido cerrada ({clasificaciÃ³n}). Para mÃ¡s informaciÃ³n, acÃ©rquese a la oficina de la UTLCC. |
| `rechazada` | Con resumen | Su denuncia no fue admitida. {resumen_rechazo} |
| `rechazada` | Sin resumen | Su denuncia no fue admitida por no cumplir los requisitos establecidos en la Ley NÂ° 974. |

**Clasificaciones (para cerrada):** Penal Â· Civil Â· Administrativo Â· Sin Indicios Â· Medida Correctiva Â· Archivado

---

## 7. Bug fix post-implementaciÃ³n

**Problema:** El `BuscadorTicket.tsx` original tenÃ­a una funciÃ³n `formatTicketInput()` que intentaba formatear automÃ¡ticamente el ticket con guiones. La condiciÃ³n `if (result === '')` solo aceptaba la **primera letra** del prefijo `DEN`, ignorando la "E" y la "N". Al tipear "DE" se perdÃ­a la "E". Al pegar `DEN-2026-0004-1004` el resultado era `D2026-0004-1004` (sin "EN"), y el botÃ³n "Consultar Estado" quedaba deshabilitado porque `canSubmit` verificaba el regex `^DEN-\d{4}-\d{4}-\d{4}$`.

**SoluciÃ³n:** Reemplazar toda la lÃ³gica de auto-formato por un input de texto plano controlado:

```tsx
const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value.toUpperCase());
}, []);
const canSubmit = /^DEN-\d{4}-\d{4}-\d{4}$/.test(value);
```

El usuario escribe el formato completo `DEN-2026-0004-1004` con guiones manuales (tal como aparece en su comprobante). El input solo convierte a mayÃºsculas automÃ¡ticamente. La validaciÃ³n es directa por regex.

---

## 8. TODO â€” Preguntar al cliente

> âš ï¸ **TODO â€” Preguntar al cliente:** Â¿La funcionalidad de "archivar casos" debe ser un subestado de `cerrada` (actual: `subestado: 'archivada'`) o un estado/proceso separado con flujo propio? Por el momento se mantiene como subestado sin afectar UX de la vista pÃºblica. Agendar consulta con cliente.

---

## 9. Notas tÃ©cnicas

- **Throttle:** La ruta `/seguimiento` usa `middleware('throttle:30,1')` para limitar a 30 requests/minuto por IP.
- **Seguridad de la bÃºsqueda:** Si el token no coincide o el ticket no existe, se retorna el mismo error "no encontrado". No se revela si el ticket existe pero el token es incorrecto.
- **Formato de input:** El input tiene `maxLength={19}` (coincide con `DEN-XXXX-XXXX-XXXX` = 17 chars + 2 guiones), `autoComplete="off"` y `spellCheck={false}`.
- **Inertia `only`:** El `router.get()` usa `only: ['encontrado', 'denuncia', 'error']` para preservar el estado del input y otros componentes de la pÃ¡gina.
- **Fechas:** Se formatean en el frontend con `toLocaleDateString('es-BO')` para consistencia regional.
- **shadcn:** No se instalaron componentes nuevos. Se reusan `card`, `badge`, `button`, `separator`, `input`, `sonner`, `dialog`.

