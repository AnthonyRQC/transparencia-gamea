#transparencia
# 🏛️ Proyecto: Sistema de Transparencia — Stack y Hoja de Ruta

> [!NOTE] Propósito de este archivo
> Este documento sirve como referencia central del proyecto de gestión de denuncias de la Unidad de Transparencia. Describe el stack tecnológico confirmado, el contexto del sistema, y los conceptos de React/TypeScript que necesitarás dominar para construirlo. Úsalo como punto de entrada para consultas con la IA.

---

## 1. Contexto del Sistema

**¿Qué hace este sistema?**
Es un sistema tipo **Kanban avanzado** para la gestión integral de denuncias ciudadanas en una Unidad de Transparencia y Lucha Contra la Corrupción (UTLCC), bajo la **Ley 974** de Bolivia.

**Tipos de denuncia:**
- `CORRUPCION` — Plazo máximo: 45 días hábiles (ampliable a 90 días)
- `NEGACION_DE_INFORMACION` — Plazo máximo: 20 días hábiles (ampliable a 30 días)
- `OTROS` — Acompañamiento / Medida Correctiva (plazos variables)

**Flujo de una denuncia (fases/estados del Kanban):**
```
[RECEPCION] → [ADMISION/RECHAZO (5 días)] → [SOLICITUD_INFORMACION] 
    → [DESCARGO_DENUNCIADO (10 días)] → [INFORME_FINAL] → [CERRADO]
```

**Roles de usuario (3):**
| Rol | Responsabilidad |
|-----|-----------------|
| **Recepcionista** | Registra la denuncia inicial con datos y pruebas |
| **Asignador / Jefe** | Asigna denuncias a técnicos, aprueba ampliaciones de plazo |
| **Técnico** | Realiza el seguimiento, registra la fase del proceso |

**Usuarios concurrentes estimados:** ~15 personas.

---

## 2. Stack Tecnológico Confirmado

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Backend** | Laravel | 11.x |
| **Frontend (Bridge)** | Inertia.js | Latest |
| **Frontend (UI)** | React | 18.x |
| **Lenguaje** | TypeScript | Latest |
| **Estilos** | Tailwind CSS | **v3** (no v4) |
| **Componentes UI** | shadcn/ui | **2.3.0** (compatible con Tailwind v3) |
| **Autenticación** | Laravel Breeze (con React + TS) | Latest |
| **Base de Datos** | MySQL (vía Laragon) | Latest |
| **Entorno Local** | Laragon | Latest |
| **Gestor de paquetes** | npm | Latest |
| **Bundler** | Vite | Latest |

### Notas críticas de la instalación
> [!WARNING] Problema de mayúsculas (RESUELTO)
> Laravel Breeze crea `resources/js/Components` (C mayúscula). shadcn quiere `components` (minúscula). La solución es forzar el alias de shadcn a `@/Components` (C mayúscula) durante el `npx shadcn@2.3.0 init`.

> [!IMPORTANT] Fijar siempre la versión de shadcn
> Usar siempre `npx shadcn@2.3.0 add [componente]`. Si se omite la versión, shadcn instalará la última (que usa Tailwind v4 y romperá el proyecto).

---

## 3. Conceptos de React ya documentados (Archivos existentes)

Estos conceptos están cubiertos en tus notas `React - 0X` y **no necesitan reaprenderse desde cero**:

| Archivo | Conceptos cubiertos |
|---------|---------------------|
| **01 Fundamentos JSX** | JSX, Fragments, Expressions |
| **02 Hooks Básicos** | `useState`, Lazy Init, `useEffect`, `useRef`, TS Generics |
| **03 Componentes y Props** | Props, `children`, valores por defecto |
| **04 Renderizado** | Virtual DOM, Condicional, `.map` y `.filter` |
| **05 Hooks Avanzados** | `useMemo`, `useContext`, `useReducer`, Custom Hooks |
| **06 JavaScript Esencial** | Destructuring, Spread, Import/Export, Array Methods |
| **07 Eventos y Patrones** | Eventos, Callbacks, Inmutabilidad |
| **08 Tailwind y shadcn** | Tailwind v3, shadcn/ui, `cn()`, variantes `cva` |
| **09 TypeScript en React** | Tipos, interfaces, generics, `forwardRef`, forms |

---

## 4. Conceptos Nuevos Necesarios para este Proyecto

Esta sección lista los temas que **aún no están en tus notas** pero que necesitarás para construir este sistema. Están ordenados de mayor a menor prioridad para este proyecto.

---

### 🟥 PRIORIDAD ALTA — Sin estos, el proyecto no arranca

#### A. Inertia.js + Laravel (El Puente)
El concepto más importante de todo el stack. Sin entender Inertia, no entenderás cómo fluyen los datos entre Laravel y React.

| Concepto | ¿Qué es y por qué lo necesitas? |
|----------|----------------------------------|
| **`<Link>` de Inertia** | Reemplaza `<a>`. Navega entre páginas de Laravel sin recargar el browser. Lo usarás en TODOS los menús de navegación. |
| **`usePage()` y `PageProps`** | Hook de Inertia para leer datos que Laravel comparte globalmente (usuario autenticado, roles, mensajes flash). Fundamental para el control de acceso por roles. |
| **`useForm()` de Inertia** | Hook para manejar formularios que se envían a Laravel. Gestiona automáticamente el estado `processing` (botón de carga), errores de validación de Laravel y el método HTTP. |
| **`router.visit()` / `router.patch()` / `router.delete()`** | Para acciones programáticas (ej. mover una tarjeta Kanban entre columnas, cambiar el estado de una denuncia). |
| **Shared Data (`HandleInertiaRequests.php`)** | Cómo Laravel comparte datos globales (como `auth.user` y su `role`) a TODOS los componentes React automáticamente en cada petición. |

#### B. Autenticación y Roles en React con Inertia
| Concepto | ¿Qué es y por qué lo necesitas? |
|----------|----------------------------------|
| **Leer el `auth.user` de Inertia** | Acceder al usuario autenticado y su rol desde cualquier componente. `const { auth } = usePage<PageProps>().props;` |
| **Renderizado Condicional por Rol** | Mostrar/ocultar elementos UI (botones, columnas del Kanban, menús) según el rol: `{auth.user.role === 'asignador' && <BotonAsignar />}` |
| **Rutas Protegidas (Middleware de Laravel)** | Las rutas se protegen en Laravel (`->middleware('role:tecnico')`), pero en React debes manejar las redirecciones. Esto lo provee Breeze automáticamente. |

---

### 🟧 PRIORIDAD MEDIA — Para las funcionalidades principales del Kanban

#### C. Gestión de Estado Complejo
| Concepto                           | ¿Qué es y por qué lo necesitas?                                                                                                                                                                       |
| ------------------------------------| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`useReducer` (Repaso aplicado)** | Ya está en el archivo 05, pero en este proyecto lo usarás extensamente para manejar el estado de las columnas del Kanban (agregar, mover, archivar tarjetas).                                         |
| **Zustand (Estado Global Ligero)** | Librería ligera de estado global. Ideal para el estado del Kanban compartido entre múltiples componentes sin usar `useContext` que puede causar re-renders excesivos. Alternativa más simple a Redux. |
| **Optimistic Updates**             | Técnica donde actualizas la UI *inmediatamente* al mover una tarjeta Kanban y luego sincronizas con Laravel en background. Si Laravel falla, revertir el estado. Hace la UI sentirse instantánea.     |

#### D. Drag and Drop (El Kanban)
| Concepto                                  | ¿Qué es y por qué lo necesitas?                                                                                                                                                                                            |
| -------------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`@dnd-kit/core` + `@dnd-kit/sortable`** | Librería estándar actual para Drag and Drop en React. Usarás `DndContext`, `SortableContext`, `useSortable`. Permite arrastrar tarjetas entre columnas del Kanban. Es la opción más accesible y compatible con TypeScript. |

#### E. Notificaciones en Tiempo Real
| Concepto                             | ¿Qué es y por qué lo necesitas?                                                                                                                                                                                            |
| --------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Laravel Echo + Pusher (o Reverb)** | El sistema de notificaciones en tiempo real. Cuando el Jefe asigna una denuncia, el Técnico debe ver una notificación inmediata sin refrescar la página. Laravel Reverb es la opción gratuita y self-hosted de Laravel 11. |
| **`useEffect` para WebSockets**      | Cómo suscribirte a un canal de WebSocket dentro de un componente React usando `useEffect` y limpiar la suscripción en el cleanup. Ya sabes `useEffect`, esto es la aplicación práctica.                                    |
| **Componente Toast/Notificación**    | shadcn tiene el componente `<Sonner>` o `<Toast>`. Integra el evento WebSocket con una notificación visual al usuario.                                                                                                     |

---

### 🟨 PRIORIDAD MEDIA-BAJA — Para reportes y fechas

#### F. Cálculo y Display de Plazos Legales
| Concepto                           | ¿Qué es y por qué lo necesitas?                                                                                                                           |
| ------------------------------------| -----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`date-fns` o `dayjs`**           | Librerías para calcular días hábiles, fechas de vencimiento y formatear fechas en español. Fundamental para los plazos de la Ley 974.                     |
| **Indicadores de estado de plazo** | Componentes visuales que muestran si una denuncia está `EN_TIEMPO`, `PROXIMA_A_VENCER` (menos de 5 días) o `VENCIDA`, cambiando de color automáticamente. |

#### G. Tablas de Datos y Filtros
| Concepto | ¿Qué es y por qué lo necesitas? |
|----------|----------------------------------|
| **`TanStack Table` (React Table)** | Librería estándar para tablas con paginación, ordenamiento y filtros. La usarás en las vistas de reportes (denuncias por mes, por tipo, aceptadas/rechazadas). |
| **Filtros controlados con `useState`** | Cómo manejar los filtros de búsqueda (por tipo de denuncia, por fecha, por estado) como state de React y pasarlos a Laravel vía Inertia como query params. |

---

### 🟩 PRIORIDAD BAJA — Pulido y experiencia de usuario

#### H. Animaciones y Transiciones
| Concepto                        | ¿Qué es y por qué lo necesitas?                                                                               |
| ---------------------------------| ---------------------------------------------------------------------------------------------------------------|
| **`framer-motion`**             | Para animar el movimiento de tarjetas Kanban y las transiciones entre páginas. Hace la app sentirse premium.  |
| **Animaciones CSS de Tailwind** | `transition`, `duration-300`, `animate-pulse` para indicadores de carga y estados. Ya están en el archivo 08. |

#### I. Subida de Archivos
| Concepto | ¿Qué es y por qué lo necesitas? |
|----------|----------------------------------|
| **Input `type="file"` con `useForm` de Inertia** | Para que el Recepcionista adjunte las pruebas de la denuncia (documentos, imágenes). Inertia maneja la subida multipart automáticamente. |
| **Previsualización de archivos adjuntos** | Mostrar los archivos subidos (PDFs, imágenes) como lista descargable en la tarjeta de la denuncia. |

---

## 5. Orden de Aprendizaje Recomendado

Dado que ya tienes los fundamentos de React, este es el orden sugerido para ir construyendo el proyecto de forma incremental:

```
FASE 1 (Base del proyecto)
  ✅ Ya tienes: React, TypeScript, Tailwind, shadcn
  📖 Aprender: Inertia.js (usePage, useForm, Link, router)
  📖 Aprender: Lectura del rol de usuario desde PageProps

FASE 2 (El Kanban básico)
  📖 Aprender: Zustand para estado global del tablero
  📖 Aprender: @dnd-kit para drag & drop de tarjetas
  📖 Aprender: Optimistic Updates con Inertia

FASE 3 (Plazos y alertas)
  📖 Aprender: date-fns para cálculo de días hábiles
  📖 Aprender: Componentes de badge/chip de estado con color dinámico

FASE 4 (Notificaciones en tiempo real)
  📖 Aprender: Laravel Reverb + Echo + WebSockets
  📖 Aprender: useEffect como listener de WebSocket

FASE 5 (Reportes)
  📖 Aprender: TanStack Table
  📖 Aprender: Filtros controlados por state + query params de Inertia

FASE 6 (Pulido final)
  📖 Aprender: framer-motion para animaciones
  📖 Aprender: Subida de archivos adjuntos con Inertia
```

---

## 6. Componentes shadcn Sugeridos para este Proyecto

| Componente | Uso en el sistema |
|-----------|-------------------|
| `<Badge>` | Indicar el estado y tipo de denuncia en las tarjetas |
| `<Card>` | Tarjetas del Kanban (una por denuncia) |
| `<Dialog>` | Modal para ver el detalle completo de una denuncia |
| `<Sheet>` | Panel lateral deslizante para editar datos de una denuncia |
| `<Select>` | Dropdown para asignar técnico o cambiar estado |
| `<Textarea>` | Campo de texto largo para descargos e informes |
| `<Progress>` | Barra de progreso visual del plazo restante |
| `<Sonner>` o `<Toast>` | Notificaciones en tiempo real y confirmaciones |
| `<Table>` | Vista de reportes y listados |
| `<DropdownMenu>` | Menú contextual en cada tarjeta (Asignar, Archivar, etc.) |
| `<Avatar>` | Foto/inicial del técnico asignado en la tarjeta |
| `<Tabs>` | Separar las vistas del Kanban por tipo de denuncia |
