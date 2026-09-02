> ⚠️ **Referencia histórica — diseño original Fase 0.** No es estado actual. Ver AI-CONTEXT.md.
#transparencia
# ðŸ›ï¸ Proyecto: Sistema de Transparencia â€” Stack y Hoja de Ruta

> [!NOTE] PropÃ³sito de este archivo
> Este documento sirve como referencia central del proyecto de gestiÃ³n de denuncias de la Unidad de Transparencia. Describe el stack tecnolÃ³gico confirmado, el contexto del sistema, y los conceptos de React/TypeScript que necesitarÃ¡s dominar para construirlo. Ãšsalo como punto de entrada para consultas con la IA.

---

## 1. Contexto del Sistema

**Â¿QuÃ© hace este sistema?**
Es un sistema de **gestiÃ³n de denuncias por pestaÃ±as (tabs)** para la Unidad de Transparencia y Lucha Contra la CorrupciÃ³n (UTLCC), bajo la **Ley 974** de Bolivia. El modelo de pestaÃ±as reemplazÃ³ al Kanban drag&drop original por ser mÃ¡s mobile-friendly, mantenible y reflejar mejor los "gates" legales de admisiÃ³n (justificaciÃ³n de rechazo obligatoria por Art. 23).

**Tipos de denuncia:**
- `CORRUPCION` â€” Plazo mÃ¡ximo: 45 dÃ­as hÃ¡biles (ampliable a 90 dÃ­as)
- `NEGACION_DE_INFORMACION` â€” Plazo mÃ¡ximo: 20 dÃ­as hÃ¡biles (ampliable a 30 dÃ­as)
- `OTROS` â€” AcompaÃ±amiento / Medida Correctiva (plazos variables)

**Flujo de una denuncia (fases/estados):**
```
[RECEPCION] â†’ [ADMISION/RECHAZO (5 dÃ­as)] â†’ [SOLICITUD_INFORMACION] 
    â†’ [DESCARGO_DENUNCIADO (10 dÃ­as)] â†’ [INFORME_FINAL] â†’ [CERRADO]
```

**Roles de usuario (3):**
| Rol | Responsabilidad |
|-----|-----------------|
| **Registrador** | Registra la denuncia inicial con datos y pruebas |
| **Asignador / Jefe** | Asigna denuncias a tÃ©cnicos, aprueba ampliaciones de plazo |
| **TÃ©cnico** | Realiza el seguimiento, registra la fase del proceso |

**Usuarios concurrentes estimados:** ~15 personas.

---

## 2. Stack TecnolÃ³gico Confirmado

| Capa | TecnologÃ­a | VersiÃ³n | Nota |
|------|-----------|---------|------|
| **Backend** | Laravel | 13.x | *HistÃ³rico 11.x hasta Sprint 11, migrado a 13.x el 01-sep-2026 (pre-laravel13:01bcc42 â†’ laravel-13:b91e404)* |
| **Frontend (Bridge)** | Inertia.js | Latest | â€” |
| **Frontend (UI)** | React | 18.x | â€” |
| **Lenguaje** | TypeScript | Latest |
| **Estilos** | Tailwind CSS | **v3** (no v4) |
| **Componentes UI** | shadcn/ui | **2.3.0** (compatible con Tailwind v3) |
| **AutenticaciÃ³n** | Laravel Breeze (con React + TS) | Latest |
| **Base de Datos** | MySQL (vÃ­a Laragon) | Latest (Postergado en maqueta) |
| **Entorno Local** | Laragon | Latest |
| **Gestor de paquetes** | npm | Latest |
| **Bundler** | Vite | Latest |

> [!NOTE] Base de Datos en la Maqueta Interactiva
> Durante la maqueta inicial (Fase 0), para permitir cambios ultra-rÃ¡pidos sobre los campos solicitados por el cliente, los controladores de Laravel servirÃ¡n arrays de datos ficticios directo a React vÃ­a Inertia. La base de datos MySQL en Laragon se conectarÃ¡ y configurarÃ¡ al finalizar la aprobaciÃ³n de la interfaz.

### Notas crÃ­ticas de la instalaciÃ³n
> [!WARNING] Problema de mayÃºsculas (RESUELTO)
> Laravel Breeze crea `resources/js/Components` (C mayÃºscula). shadcn quiere `components` (minÃºscula). La soluciÃ³n es forzar el alias de shadcn a `@/Components` (C mayÃºscula) durante el `npx shadcn@2.3.0 init`.

> [!IMPORTANT] Fijar siempre la versiÃ³n de shadcn
> Usar siempre `npx shadcn@2.3.0 add [componente]`. Si se omite la versiÃ³n, shadcn instalarÃ¡ la Ãºltima (que usa Tailwind v4 y romperÃ¡ el proyecto).

---

## 3. Conceptos de React ya documentados (Archivos existentes)

Estos conceptos estÃ¡n cubiertos en tus notas `React - 0X` y **no necesitan reaprenderse desde cero**:

| Archivo | Conceptos cubiertos |
|---------|---------------------|
| **01 Fundamentos JSX** | JSX, Fragments, Expressions |
| **02 Hooks BÃ¡sicos** | `useState`, Lazy Init, `useEffect`, `useRef`, TS Generics |
| **03 Componentes y Props** | Props, `children`, valores por defecto |
| **04 Renderizado** | Virtual DOM, Condicional, `.map` y `.filter` |
| **05 Hooks Avanzados** | `useMemo`, `useContext`, `useReducer`, Custom Hooks |
| **06 JavaScript Esencial** | Destructuring, Spread, Import/Export, Array Methods |
| **07 Eventos y Patrones** | Eventos, Callbacks, Inmutabilidad |
| **08 Tailwind y shadcn** | Tailwind v3, shadcn/ui, `cn()`, variantes `cva` |
| **09 TypeScript en React** | Tipos, interfaces, generics, `forwardRef`, forms |

---

## 4. Conceptos Nuevos Necesarios para este Proyecto

Esta secciÃ³n lista los temas que **aÃºn no estÃ¡n en tus notas** pero que necesitarÃ¡s para construir este sistema. EstÃ¡n ordenados de mayor a menor prioridad para este proyecto.

---

### ðŸŸ¥ PRIORIDAD ALTA â€” Sin estos, el proyecto no arranca

#### A. Inertia.js + Laravel (El Puente)
El concepto mÃ¡s importante de todo el stack. Sin entender Inertia, no entenderÃ¡s cÃ³mo fluyen los datos entre Laravel y React.

| Concepto | Â¿QuÃ© es y por quÃ© lo necesitas? |
|----------|----------------------------------|
| **`<Link>` de Inertia** | Reemplaza `<a>`. Navega entre pÃ¡ginas de Laravel sin recargar el browser. Lo usarÃ¡s en TODOS los menÃºs de navegaciÃ³n. |
| **`usePage()` y `PageProps`** | Hook de Inertia para leer datos que Laravel comparte globalmente (usuario autenticado, roles, mensajes flash). Fundamental para el control de acceso por roles. |
| **`useForm()` de Inertia** | Hook para manejar formularios que se envÃ­an a Laravel. Gestiona automÃ¡ticamente el estado `processing` (botÃ³n de carga), errores de validaciÃ³n de Laravel y el mÃ©todo HTTP. |
| **`router.visit()` / `router.patch()` / `router.delete()`** | Para acciones programÃ¡ticas (ej. mover una tarjeta Kanban entre columnas, cambiar el estado de una denuncia). |
| **Shared Data (`HandleInertiaRequests.php`)** | CÃ³mo Laravel comparte datos globales (como `auth.user` y su `role`) a TODOS los componentes React automÃ¡ticamente en cada peticiÃ³n. |

#### B. AutenticaciÃ³n y Roles en React con Inertia
| Concepto | Â¿QuÃ© es y por quÃ© lo necesitas? |
|----------|----------------------------------|
| **Leer el `auth.user` de Inertia** | Acceder al usuario autenticado y su rol desde cualquier componente. `const { auth } = usePage<PageProps>().props;` |
| **Renderizado Condicional por Rol** | Mostrar/ocultar elementos UI (botones, columnas del Kanban, menÃºs) segÃºn el rol: `{auth.user.role === 'asignador' && <BotonAsignar />}` |
| **Rutas Protegidas (Middleware de Laravel)** | Las rutas se protegen en Laravel (`->middleware('role:tecnico')`), pero en React debes manejar las redirecciones. Esto lo provee Breeze automÃ¡ticamente. |

---

### ðŸŸ§ PRIORIDAD MEDIA â€” Para las funcionalidades principales del Kanban

#### C. GestiÃ³n de Estado Complejo
| Concepto                           | Â¿QuÃ© es y por quÃ© lo necesitas?                                                                                                                                                                       |
| ------------------------------------| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`useReducer` (Repaso aplicado)** | Ya estÃ¡ en el archivo 05, pero en este proyecto lo usarÃ¡s extensamente para manejar el estado de las columnas del Kanban (agregar, mover, archivar tarjetas).                                         |
| **Zustand (Estado Global Ligero)** | LibrerÃ­a ligera de estado global. Ideal para el estado del Kanban compartido entre mÃºltiples componentes sin usar `useContext` que puede causar re-renders excesivos. Alternativa mÃ¡s simple a Redux. |
| **Optimistic Updates**             | TÃ©cnica donde actualizas la UI *inmediatamente* al mover una tarjeta Kanban y luego sincronizas con Laravel en background. Si Laravel falla, revertir el estado. Hace la UI sentirse instantÃ¡nea.     |

#### D. Drag and Drop (El Kanban)
| Concepto                                  | Â¿QuÃ© es y por quÃ© lo necesitas?                                                                                                                                                                                            |
| -------------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`@dnd-kit/core` + `@dnd-kit/sortable`** | LibrerÃ­a estÃ¡ndar actual para Drag and Drop en React. UsarÃ¡s `DndContext`, `SortableContext`, `useSortable`. Permite arrastrar tarjetas entre columnas del Kanban. Es la opciÃ³n mÃ¡s accesible y compatible con TypeScript. |

#### E. Notificaciones en Tiempo Real
| Concepto                             | Â¿QuÃ© es y por quÃ© lo necesitas?                                                                                                                                                                                            |
| --------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Laravel Echo + Pusher (o Reverb)** | El sistema de notificaciones en tiempo real. Cuando el Jefe asigna una denuncia, el TÃ©cnico debe ver una notificaciÃ³n inmediata sin refrescar la pÃ¡gina. Laravel Reverb es la opciÃ³n gratuita y self-hosted de Laravel 13 (*histÃ³rico 11 hasta Sprint 11*). |
| **`useEffect` para WebSockets**      | CÃ³mo suscribirte a un canal de WebSocket dentro de un componente React usando `useEffect` y limpiar la suscripciÃ³n en el cleanup. Ya sabes `useEffect`, esto es la aplicaciÃ³n prÃ¡ctica.                                    |
| **Componente Toast/NotificaciÃ³n**    | shadcn tiene el componente `<Sonner>` o `<Toast>`. Integra el evento WebSocket con una notificaciÃ³n visual al usuario.                                                                                                     |

---

### ðŸŸ¨ PRIORIDAD MEDIA-BAJA â€” Para reportes y fechas

#### F. CÃ¡lculo y Display de Plazos Legales
| Concepto                           | Â¿QuÃ© es y por quÃ© lo necesitas?                                                                                                                           |
| ------------------------------------| -----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`date-fns` o `dayjs`**           | LibrerÃ­as para calcular dÃ­as hÃ¡biles, fechas de vencimiento y formatear fechas en espaÃ±ol. Fundamental para los plazos de la Ley 974.                     |
| **Indicadores de estado de plazo** | Componentes visuales que muestran si una denuncia estÃ¡ `EN_TIEMPO`, `PROXIMA_A_VENCER` (menos de 5 dÃ­as) o `VENCIDA`, cambiando de color automÃ¡ticamente. |

#### G. Tablas de Datos y Filtros
| Concepto | Â¿QuÃ© es y por quÃ© lo necesitas? |
|----------|----------------------------------|
| **`TanStack Table` (React Table)** | LibrerÃ­a estÃ¡ndar para tablas con paginaciÃ³n, ordenamiento y filtros. La usarÃ¡s en las vistas de reportes (denuncias por mes, por tipo, aceptadas/rechazadas). |
| **Filtros controlados con `useState`** | CÃ³mo manejar los filtros de bÃºsqueda (por tipo de denuncia, por fecha, por estado) como state de React y pasarlos a Laravel vÃ­a Inertia como query params. |

---

### ðŸŸ© PRIORIDAD BAJA â€” Pulido y experiencia de usuario

#### H. Animaciones y Transiciones
| Concepto                        | Â¿QuÃ© es y por quÃ© lo necesitas?                                                                               |
| ---------------------------------| ---------------------------------------------------------------------------------------------------------------|
| **`framer-motion`**             | Para animar el movimiento de tarjetas Kanban y las transiciones entre pÃ¡ginas. Hace la app sentirse premium.  |
| **Animaciones CSS de Tailwind** | `transition`, `duration-300`, `animate-pulse` para indicadores de carga y estados. Ya estÃ¡n en el archivo 08. |

#### I. Subida de Archivos
| Concepto | Â¿QuÃ© es y por quÃ© lo necesitas? |
|----------|----------------------------------|
| **Input `type="file"` con `useForm` de Inertia** | Para que el Registrador adjunte las pruebas de la denuncia (documentos, imÃ¡genes). Inertia maneja la subida multipart automÃ¡ticamente. |
| **PrevisualizaciÃ³n de archivos adjuntos** | Mostrar los archivos subidos (PDFs, imÃ¡genes) como lista descargable en la tarjeta de la denuncia. |

---

## 5. Orden de Aprendizaje Recomendado

Dado que ya tienes los fundamentos de React, este es el orden sugerido para ir construyendo el proyecto de forma incremental:

```
FASE 1 (Base del proyecto)
  âœ… Ya tienes: React, TypeScript, Tailwind, shadcn
  ðŸ“– Aprender: Inertia.js (usePage, useForm, Link, router)
  ðŸ“– Aprender: Lectura del rol de usuario desde PageProps

FASE 2 (Listados por pestaÃ±as - Tabs)
  âœ… Ya tienes: TabsDenuncias, ListaVacia, ContadorCard
  ðŸ“– Aprender: Filtros con query params + router.get()
  ðŸ“– Aprender: Dropdown "Ver como" cambio de tÃ©cnico mock

FASE 3 (Plazos y alertas)
  ðŸ“– Aprender: date-fns para cÃ¡lculo de dÃ­as hÃ¡biles
  ðŸ“– Aprender: PlazoBadge con color dinÃ¡mico (verde/amarillo/rojo)

FASE 4 (Notificaciones en tiempo real)
  ðŸ“– Aprender: Laravel Reverb + Echo + WebSockets
  ðŸ“– Aprender: useEffect como listener de WebSocket

FASE 5 (Reportes)
  ðŸ“– Aprender: TanStack Table
  ðŸ“– Aprender: Filtros controlados por state + query params de Inertia

FASE 6 (Pulido final)
  ðŸ“– Aprender: framer-motion para animaciones
  ðŸ“– Aprender: Subida de archivos adjuntos con Inertia
```

---

## 6. Componentes shadcn Sugeridos para este Proyecto

| Componente | Uso en el sistema |
|-----------|-------------------|
| `<Badge>` | Indicar el estado y tipo de denuncia en las tarjetas |
| `<Card>` | Tarjetas del Kanban (una por denuncia) |
| `<Dialog>` | Modal para ver el detalle completo de una denuncia |
| `<Sheet>` | Panel lateral deslizante para editar datos de una denuncia |
| `<Select>` | Dropdown para asignar tÃ©cnico o cambiar estado |
| `<Textarea>` | Campo de texto largo para descargos e informes |
| `<Progress>` | Barra de progreso visual del plazo restante |
| `<Sonner>` o `<Toast>` | Notificaciones en tiempo real y confirmaciones |
| `<Table>` | Vista de reportes y listados |
| `<DropdownMenu>` | MenÃº contextual en cada tarjeta (Asignar, Archivar, etc.) |
| `<Avatar>` | Foto/inicial del tÃ©cnico asignado en la tarjeta |
| `<Tabs>` | Separar las vistas del Kanban por tipo de denuncia |

