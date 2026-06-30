# Sprint 1 — Registro de Denuncia (Formulario Complejo)

> **Plan detallado** — Basado en las decisiones tomadas con el cliente.
> Actualizado: Junio 2026 — v2 (bugs corregidos, terminología actualizada)

---

## 1. Selector de tipo de denuncia

Dropdown `<Select>` de shadcn en la parte superior de la página con 4 opciones:

| Opción | Plazo | Formulario |
|---|---|---|
| Corrupción | Hasta 45 días | Complejo (8 secciones) |
| Negación de Información | Hasta 20 días | Complejo (8 secciones) |
| Acompañamiento | Resolución en el momento | Simple |
| Intervención / Medida Correctiva | — | Simple |

**Comportamiento:**
- El dropdown permanece siempre habilitado (se puede cambiar en cualquier momento con 2 clics, previene misclics)
- No hay botón "¿Cambiar tipo?" — es innecesario

---

## 2. Escenarios del Denunciante (RadioGroup)

Según Ley 974, Art. 22 y Art. 24. Tres opciones con `RadioGroup` de shadcn:

| Opción | Etiqueta | Qué pasa con los datos |
|---|---|---|
| A | Identidad Revelada | Se muestran todos los campos. La UTLCC conoce y divulga la identidad. |
| B | Identidad Reservada | Se muestran todos los campos. La UTLCC conoce la identidad **pero no la divulga** (Art. 24). |
| C | Anónimo | Solo email y/o teléfono (opcionales). Mensaje: "Si proporciona contacto podrá recibir actualizaciones. Si no, solo podrá consultar el estado con el código generado en la UTLCC — sin posibilidad de seguimiento por correo o celular si no los proporciona." |

**Tooltip con icono `?` en el label de cada opción explicando la diferencia.**

---

## 3. Estructura del Formulario Complejo

Una página con scroll dentro de un `div` con `max-h`, sin tabs ni acordeones.

### Secciones visibles:

```
┌───────────────────────────────────────────────────┐
│  ═══ PROGRESS BAR (sticky) ═══                    │
│  ████████████░░░░░░░ 60%                          │
│                                                    │
│  1. Encabezado (fecha auto + N° pendiente)        │
│  ─── separator ───                                 │
│  2. Confidencialidad (RadioGroup 3 opciones)       │
│  ─── separator ───                                 │
│  3. Denunciante (campos según escenario)           │
│  ─── separator ───                                 │
│  4. Denunciado(s) — [bloques dinámicos]            │
│  ─── separator ───                                 │
│  5. Detalles del Incidente                         │
│  ─── separator ───                                 │
│  6. Relación de Hechos (textarea)                  │
│  ─── separator ───                                 │
│  7. Pruebas / Testigos — [bloques dinámicos]       │
│  ─── separator ───                                 │
│  8. Pie (declaración jurada + Enviar)              │
│                                                    │
│  ═══ STICKY FOOTER (solo al scrollear) ═══        │
│  [Cancelar]  [Enviar denuncia]                     │
└───────────────────────────────────────────────────┘
```

### Sticky Progress Bar
- Se fija en la parte superior del card (position: sticky, top: 0) al hacer scroll
- Se adapta automáticamente a mobile y desktop (sin valores hardcodeados)
- Calcula el % real de campos obligatorios completados (según el tipo de formulario)
- Estilo: barra gold (`bg-sidebar-accent`) sobre fondo suave

### Sticky Footer
- Aparece solo cuando el botón "Enviar" original no está visible (scroll hacia abajo)
- Barra delgada (40-48px), no tapa campos
- Botones: Cancelar (confirma antes de resetear) + Enviar (primary)
- Se desvanece al volver arriba
- El form agrega padding inferior (pb-16) cuando el footer está visible para que el último campo no quede tapado

### Bordes laterales por sección
- `border-l-2 border-sidebar-accent/40` (gold muy suave)
- Al hacer focus en la sección, la opacidad sube a `100%` (transición 200ms)

---

## 4. Detalle de Campos por Sección

### Sección 1: Encabezado
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Fecha | Texto (solo lectura) | — | Se muestra la fecha actual del sistema |
| N° de Denuncia | Texto (solo lectura) | — | "Se generará al enviar" |

### Sección 2: Confidencialidad
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Escenario | RadioGroup | ✅ | Debe seleccionar una opción |

### Sección 3: Denunciante

#### Escenario A (Revelada) y B (Reservada)
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Nombres y Apellidos | Input | ✅ | 2-100 caracteres |
| Cédula de Identidad | Input | ✅ | 6-9 dígitos |
| Email | Input (email) | ✅ | formato email |
| Teléfono / Celular | Input (tel) | ✅ | 8 dígitos |

#### Escenario C (Anónimo)
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Email | Input (email) | ❌ Opcional | formato email si se llena |
| Teléfono / Celular | Input (tel) | ❌ Opcional | 8 dígitos si se llena |
| Mensaje informativo | Texto | — | "Si no proporciona contacto, solo podrá consultar con el código del sistema o presencialmente" |

### Sección 4: Denunciado(s)
**Al menos 1 bloque obligatorio.**

Por bloque:
| Campo | Tipo | Obligatorio |
|---|---|---|
| ¿Conoce la identidad? | Switch (SÍ/NO) | ✅ |

**Si SÍ:**
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Nombres y Apellidos | Input | ✅ | 2-100 caracteres |
| Cargo y/o Dependencia de trabajo | Input | ✅ | texto |

**Si NO:**
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Descripción física y vestimenta | Textarea | ✅ | No vacío |

**Botones:**
- `+ Añadir otro denunciado` — agrega nuevo bloque independiente
- 🗑️ Icono de basurero — elimina el bloque (no eliminar si es el único bloque)

### Sección 5: Detalles del Incidente
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Categoría | Select + "Otro" | ✅ | Debe seleccionar o escribir |
| Fecha del incidente | Datepicker (shadcn) | ✅ | No futura, no anterior a 5 años |
| Hora del incidente | Timepicker (opcional) | ❌ | Sin validación |
| Lugar | Input | ✅ | Texto |

**Tooltip `?` en hora:** "Opcional. Si no la recuerda exacta, indique un aproximado en 'Relación de Hechos'."

### Sección 6: Relación de Hechos
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Textarea | Textarea grande | ✅ | Mín 20 caracteres, máx 5000 |
| Contador | — | — | "XX / 5000 caracteres" |

**Tooltip `?`:** "Describa con claridad: qué pasó, cómo pasó, dónde, cuándo, quiénes participaron."

### Sección 7: Pruebas / Testigos
**Opcional (0 o más bloques).**

Por bloque:
| Campo | Tipo | Obligatorio |
|---|---|---|
| Tipo de Evidencia | Select | ✅ si se agrega bloque |

**Si Archivo:**
| Campo | Obligatorio |
|---|---|
| Archivo (upload) | ❌ Opcional |
| Descripción de la prueba | ✅ |

**Si Prueba Física:**
| Campo | Obligatorio |
|---|---|
| Descripción de la prueba | ✅ |

**Si Testigo:**
| Campo | Obligatorio | Validación |
|---|---|---|
| Nombre del Testigo | ✅ | texto |
| Teléfono de Contacto | ✅ | 8 dígitos |

**Modal de subida de archivos (ModalSubirArchivo):**
- Al hacer clic en "Subir archivo (opcional)" se abre un modal con:
  - Drag & drop zone grande con preview del archivo
  - Botones "Subir archivo" / "Cancelar"
- Descripción es un Textarea separado fuera del modal (visible en los 3 tipos)
- En la vista principal se muestra el nombre del archivo con truncado (`formatFilename(name, 28)`) + botón Quitar/Reemplazar

**Restricciones de archivo:**
- Tamaño máximo: 50MB
- Formatos aceptados: PDF, JPG, PNG, DOCX
- Mostrar explícitamente en el modal: "Formatos: PDF, JPG, PNG, DOCX · Máx: 50MB"

**Select de tipo de evidencia:**
- Usa shadcn `<Select>` con `<SelectItem>` en texto plano (sin iconos dentro del item)
- El icono del tipo se renderiza en un `<div>` separado a la izquierda del trigger
- `onValueChange` consolida todas las actualizaciones de estado en un solo `onChange` (`Partial<PruebaItem>` patch) para evitar closure stale

**Botones:**
- `+ Añadir otra prueba/testigo` — agrega nuevo bloque
- 🗑️ Icono de basurero — elimina el bloque

### Sección 8: Pie
| Campo | Tipo | Obligatorio |
|---|---|---|
| Declaración Jurada | Checkbox | ✅ |
| Botón Enviar | Button (submit) | Solo se habilita si checkbox está marcado |

**Texto del checkbox:**
"Declaro bajo juramento que los hechos descritos son verdaderos y que la presente denuncia no es presentada de mala fe."

---

## 5. Errores y Validación

### Comportamiento
- **No hay validación en tiempo real** (ni en typing ni en onBlur)
- La validación ocurre **solo al hacer clic en "Enviar"**
- Backend mock valida todos los campos y devuelve errores

### Visualización de errores
- El input con error recibe: `border-destructive/50` (borde rojo suave)
- Aparece icono `AlertCircle` a la derecha del input
- Hover sobre el icono → **tooltip** con el mensaje corto de error (usando shadcn Popover o Tooltip)
- El label del campo cambia a `text-destructive`
- **No hay texto de error inline** (no invade visualmente)
- Scroll automático al primer campo con error
- **No hay toast/sonner** con resumen de errores

### Ejemplos de mensajes en tooltip
| Error | Mensaje en tooltip |
|---|---|
| Campo vacío obligatorio | **Requerido** |
| Cédula inválida | **6-9 dígitos** |
| Email inválido | **Email inválido** |
| Teléfono inválido | **8 dígitos** |
| Fecha futura | **Fecha no válida** |
| Hechos muy cortos | **Mínimo 20 caracteres** |

### Éxito
- Si todo es válido → `sonner` toast: "Denuncia N° **DEN-2024-0001** registrada exitosamente"
- Modal opcional con el ticket y resumen

---

## 6. Backend Mock

### `app/Data/DenunciaData.php`
```php
class DenunciaData {
    static function getAll(): array  // devuelve todas (de sesión)
    static function add(array $data): string  // guarda en sesión, genera ticket
    static function getNextTicket(): string  // DEN-2024-0001, incrementa
}
```

### `app/Http/Controllers/DenunciaController.php`
```php
class DenunciaController {
    function create()  // devuelve props vacías a RegistroDenuncia
    function store(Request $request)  // valida, guarda mock, devuelve ticket
}
```

### Rutas nuevas en `routes/web.php`
```php
use App\Http\Controllers\DenunciaController;

// Reemplazar Closure de GET /denuncias/registrar
Route::get('/registrar', [DenunciaController::class, 'create'])->name('denuncias.registrar');

// Nueva ruta POST
Route::post('/denuncias', [DenunciaController::class, 'store'])->name('denuncias.store');
```

---

## 7. shadcn a Instalar

```bash
npx shadcn@2.3.0 add switch radio-group checkbox calendar popover textarea select input label separator sonner
```

Total: 11 componentes.

Componentes Breeze existentes que NO se usarán en este formulario (se reemplazan por shadcn):
- `Form/TextInput.tsx` → shadcn `Input`
- `Form/InputLabel.tsx` → shadcn `Label`
- `Form/Checkbox.tsx` → shadcn `Checkbox`
- `Buttons/PrimaryButton.tsx` → shadcn `Button`

---

## 8. Iconos de Ayuda (?) con Tooltip

En campos donde el título no es autoexplicativo, se agrega:
```
Label [icono ?]
```
- Icono: `HelpCircle` de lucide-react (12-14px)
- Color: `text-muted-foreground`
- Tooltip: shadcn `Popover` o `Tooltip` con descripción + ejemplos

### Campos con tooltip `?`

| Campo | Tooltip |
|---|---|
| Cédula de Identidad | "Ingrese el número sin puntos ni guiones. Ej: 1234567" |
| Email | "Correo electrónico válido para notificaciones del caso" |
| Teléfono | "8 dígitos, sin código de país. Ej: 70123456" |
| Hora del incidente | "Opcional. Si no la recuerda exacta, indique un aproximado en 'Relación de Hechos'." |
| Descripción física/vestimenta | "Indique rasgos físicos visibles (estatura, complexión, cabello) y vestimenta." |
| Relación de Hechos | "Describa con claridad: qué pasó, cómo, dónde, cuándo, quiénes. Mínimo 20 caracteres." |
| Referencia de la Nota (Intervención) | "Número o código de la nota interna que motiva la intervención." |

---

## 9. Cambios de Terminología

| Antes | Después |
|---|---|
| Unidad o Funcionario Involucrado (Acompañamiento) | Dependencia o Funcionario Involucrado |
| Unidad Observada o Denunciada (Intervención) | Dependencia Observada o Denunciada |
| Cargo y/o área de trabajo (Denunciado) | Cargo y/o Dependencia de trabajo |
| Dependencia Observada o Denunciada (Intervención — v2) | Dependencia o Funcionario Observado/Denunciado |

---

## 10. Archivos a Crear

### Backend
| Archivo | Descripción |
|---|---|
| `app/Data/DenunciaData.php` | Clase mock con datos en sesión + generación de ticket |
| `app/Http/Controllers/DenunciaController.php` | Controller con create() y store() |

### Frontend — Página principal
| Archivo | Descripción |
|---|---|
| `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` | Reemplazar placeholder. Dropdown selector + render condicional de formularios |

### Frontend — Componentes del formulario
| Archivo | Descripción |
|---|---|
| `Components/Denuncias/SeccionEncabezado.tsx` | Fecha auto + N° pendiente |
| `Components/Denuncias/SeccionConfidencialidad.tsx` | RadioGroup: Revelada / Reservada / Anónimo |
| `Components/Denuncias/SeccionDenunciante.tsx` | Campos según escenario (3 variantes) |
| `Components/Denuncias/BloqueDenunciado.tsx` | Switch identidad + campos condicionales, add/remove |
| `Components/Denuncias/SeccionDetalles.tsx` | Categoría (select+otro), fecha, hora (opcional), lugar |
| `Components/Denuncias/SeccionRelacionHechos.tsx` | Textarea + contador |
| `Components/Denuncias/BloquePrueba.tsx` | Switch tipo + campos condicionales, add/remove |
| `Components/Denuncias/ModalSubirArchivo.tsx` | Drag&drop + preview + descripción |
| `Components/Denuncias/PieFormulario.tsx` | Checkbox declaración jurada + botón Enviar |
| `Components/Denuncias/FormularioAcompaniamiento.tsx` | Formulario simple (5 campos) |
| `Components/Denuncias/FormularioIntervencion.tsx` | Formulario simple (4 campos) |
| `Components/Denuncias/ModalExito.tsx` | Modal con ticket generado |
| `Components/Denuncias/ProgressBar.tsx` | Sticky progress bar |
| `Components/Denuncias/StickyFooter.tsx` | Sticky footer condicional |
| `Components/Denuncias/FieldHelp.tsx` | Icono ? + tooltip |
| `Components/Denuncias/InputError.tsx` | Icono ⚠ + tooltip de error |

---

## 11. Archivos a Modificar

| Archivo | Cambio |
|---|---|
| `routes/web.php` | Reemplazar Closure de `/denuncias/registrar` por controller + agregar `POST /denuncias` |

---

## 12. Archivos a NO Modificar

- `Sidebar.tsx`, `Header.tsx`, `InstitutionalLogo.tsx`, `AppLayout.tsx` (Fase 0)
- `tailwind.config.js`, `app.css` (ya tienen las variables necesarias)
- `routes/auth.php` (autenticación intacta)
- `resources/js/Components/ui/button.tsx` (shadcn button ya instalado)

---

## 13. Orden de Implementación

```
1. Instalar shadcn: switch radio-group checkbox calendar popover textarea select input label separator sonner
2. Crear backend: DenunciaData.php + DenunciaController.php + actualizar rutas
3. Crear página RegistroDenuncia.tsx con dropdown selector de tipo
4. Componentes del formulario Complejo en orden:
   4.1 SeccionEncabezado
   4.2 SeccionConfidencialidad (incluir FieldHelp)
   4.3 SeccionDenunciante (3 variantes)
   4.4 BloqueDenunciado (bloques dinámicos)
   4.5 SeccionDetalles (incluir datepicker, select categoría)
   4.6 SeccionRelacionHechos (textarea + contador)
   4.7 BloquePrueba + ModalSubirArchivo
   4.8 PieFormulario
5. Componentes de UI global:
   - ProgressBar (sticky)
   - StickyFooter
   - FieldHelp (icono ?)
   - InputError (icono ⚠ + tooltip)
   - ModalExito
6. Wire-up: submit → store() → toast éxito
7. Formularios simples (Acompañamiento, Intervención)
8. Probar flujo completo
```

---

## 14. Diseño Visual

### Colores (variables CSS del sistema, sin cambios nuevos)
| Variable | Uso |
|---|---|
| `bg-card` / `border` / `rounded-2xl` | Contenedor del formulario |
| `text-foreground` | Texto general |
| `text-muted-foreground` | Labels secundarios, iconos ? |
| `bg-primary` / `text-primary-foreground` | Botón Enviar, focus states |
| `bg-sidebar-accent` / `text-sidebar` | Progress bar (gold institucional) |
| `border-destructive/50` | Inputs con error |
| `text-destructive` | Labels con error |
| `border-sidebar-accent/40` → `border-sidebar-accent` | Bordes laterales de sección |

### Separadores entre secciones
Usar shadcn `<Separator />` con `className="my-6"`.

### Responsive
- Desktop (md+): grid de 2 columnas para Denunciante y Detalles
- Mobile (<md): 1 columna, campos verticales

---

## 15. Categorías por Defecto (Select + "Otro")

> **Nota (Junio 2026):** Las categorías y subcategorías listadas a continuación son los valores por defecto en mock. En el **Sprint 10 (Panel Administración Catálogos + Subcategorías)** estos valores serán editables desde un panel administrativo único, junto con todos los demás catálogos del sistema (clasificaciones finales, tipos, estados, medios de notificación, etc.). Cada tipo de denuncia (corrupción / negación de información) tendrá sus propias subcategorías como filtro adicional.

| Opción |
|---|
| Cohecho (Soborno) |
| Concusión |
| Malversación |
| Negociaciones incompatibles |
| Enriquecimiento ilícito |
| Tráfico de influencias |
| Peculado |
| Omisión de denuncia |
| Incumplimiento de deberes |
| Otro (campo libre) |

---

## 16. Número de Ticket

Formato: `DEN-AAAA-NNNN`

| Componente | Descripción |
|---|---|
| DEN | Prefijo fijo "Denuncia" |
| AAAA | Año actual (2026) |
| NNNN | Secuencial 0001-9999 |

El contador vive en sesión (mock). Se resetea al cerrar sesión o se lee de un archivo/cookie (persistencia básica de mock).

---

## 17. Estructura del State (FormState)

El estado del formulario en React se estructura con:

### Formulario Complejo (Corrupción / Negación)
```
form.tipo                → tipo de denuncia
form.escenario           → revelada | reservada | anonimo
form.denunciante         → { nombres, ci, email, telefono }
form.denunciados         → [ { id, conoce_identidad, nombres, dependencia, descripcion }, ... ]
form.detalles            → { categoria, categoria_otro, fecha, hora, lugar }
form.hechos              → string
form.pruebas             → [ { id, tipo, archivo_nombre, archivo_data, descripcion, testigo_nombre, testigo_telefono }, ... ]
form.declaracion_jurada  → boolean
```

### Formulario Simple (Acompañamiento / Intervención)
Todos los campos van a **root** de `form` (plano), no anidados en sub-objetos:

**Acompañamiento:** `form.nombres`, `form.ci`, `form.dependencia_funcionario`, `form.motivo`, `form.resolucion`

**Intervención:** `form.dependencia_observada`, `form.referencia_nota`, `form.motivo`, `form.archivo`, `form.archivo_data`

Esto es compatible con el backend mock actual (que espera campos a root) y fácilmente migrable a JSONB en MySQL.

---

## 18. Decisiones del Sprint 1 (Registro de decisiones)

| Fecha | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| Junio 2026 | Dropdown de tipo de denuncia **siempre habilitado** (sin "¿Cambiar tipo?") | Dropdown se deshabilita + botón "¿Cambiar tipo?" | El dropdown con 2 clics previene misclics sin necesidad de botón extra redundante |
| Junio 2026 | **Sin** FieldHelp individual por opción de Confidencialidad | Tooltip ? en cada radio button | Las descripciones de 1 línea son suficientemente claras; tooltips agregarían ruido visual |
| Junio 2026 | State plano a root para formularios simples | State anidado por sección | Compatible con backend actual y más simple de migrar a JSONB |
| Junio 2026 | Modal con `role="dialog"` y `aria-modal` | Sin accesibilidad | Requisito de a11y para modales |
| Junio 2026 | Label cambia a `text-destructive` en error (per-spec) | — | Mejora feedback visual del error |
| Junio 2026 | ProgressBar: Ubicación en `headerBottom` de `AppLayout` | `position: sticky` dentro de la tarjeta del formulario | Evita que haya un espacio de scroll o padding entre la cabecera y el progreso. Queda fijo en el layout y alinea el padding dinámicamente (`px-4 sm:px-6 md:px-8`). |
| Junio 2026 | Vinculación del ticket mediante Inertia global share | Parsing manual de `page.props` en el callback `onSuccess` | Más robusto e independiente del ciclo de vida del callback. Permite usar un `useEffect` para gatillar el modal de confirmación y limpiar el estado al recibir los flashes del servidor. |
| Junio 2026 | Modo Demostración temporal | Llenado manual para pruebas | Permite validar rápidamente los 4 flujos en la maqueta sin tener que teclear campos largos repetidamente. |
| Junio 2026 | StickyFooter: `pb-16` spacer en el form | `position: sticky` en el footer | Cambio rápido, 1 línea, evita tapar último campo |
| Junio 2026 | `updateItem` consolidado con `Partial<PruebaItem>` patch (1 solo `onChange` por evento) | Múltiples llamadas `updateItem` secuenciales (causaban closure stale) | Previene race condition: elimina closure stale (solo el último `setForm` ganaba y se perdían cambios) |
| Junio 2026 | SelectItem simplificado a texto plano (sin `<span>` con iconos) | `<span className="flex items-center gap-2"><Icon/> Texto</span>` dentro de SelectItem | Radix SelectValue no renderiza bien children complejos; el icono se mantiene fuera del Select en el `div` del trigger |
| Junio 2026 | `formatFilename(name, 28)` trunca nombres largos con `..extension` | Mostrar nombre completo sin truncar | Evita desbordamiento visual cuando el nombre es muy largo (ej: documento_con_nombre_muy..aa.jpg) |
| Junio 2026 | Archivo upload es opcional en todos los tipos de prueba | Archivo obligatorio solo en tipo 'archivo' | El usuario indicó que en los 3 tipos (archivo, física, testigo) la subida es opcional |
| Junio 2026 | Label Intervención: "Dependencia o Funcionario Observado/Denunciado" | Sólo "Dependencia Observada o Denunciada" | El campo puede referirse tanto a una dependencia como a un funcionario específico; se unificaron ambos términos |

---

## 19. Post-Sprint 1

Queda pendiente para sprints futuros:
- Conexión a BD real (Fase 1.5+)
- Cálculo de días hábiles con feriados
- Reportes
- Roles y permisos
- Notificaciones
