> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 1 â€” Registro de Denuncia (Formulario Complejo)

> **Plan detallado** â€” Basado en las decisiones tomadas con el cliente.
> Actualizado: Junio 2026 â€” v2 (bugs corregidos, terminologÃ­a actualizada)

---

## 1. Selector de tipo de denuncia

Dropdown `<Select>` de shadcn en la parte superior de la pÃ¡gina con 4 opciones:

| OpciÃ³n | Plazo | Formulario |
|---|---|---|
| CorrupciÃ³n | Hasta 45 dÃ­as | Complejo (8 secciones) |
| NegaciÃ³n de InformaciÃ³n | Hasta 20 dÃ­as | Complejo (8 secciones) |
| AcompaÃ±amiento | ResoluciÃ³n en el momento | Simple |
| IntervenciÃ³n / Medida Correctiva | â€” | Simple |

**Comportamiento:**
- El dropdown permanece siempre habilitado (se puede cambiar en cualquier momento con 2 clics, previene misclics)
- No hay botÃ³n "Â¿Cambiar tipo?" â€” es innecesario

---

## 2. Escenarios del Denunciante (RadioGroup)

SegÃºn Ley 974, Art. 22 y Art. 24. Tres opciones con `RadioGroup` de shadcn:

| OpciÃ³n | Etiqueta | QuÃ© pasa con los datos |
|---|---|---|
| A | Identidad Revelada | Se muestran todos los campos. La UTLCC conoce y divulga la identidad. |
| B | Identidad Reservada | Se muestran todos los campos. La UTLCC conoce la identidad **pero no la divulga** (Art. 24). |
| C | AnÃ³nimo | Solo email y/o telÃ©fono (opcionales). Mensaje: "Si proporciona contacto podrÃ¡ recibir actualizaciones. Si no, solo podrÃ¡ consultar el estado con el cÃ³digo generado en la UTLCC â€” sin posibilidad de seguimiento por correo o celular si no los proporciona." |

**Tooltip con icono `?` en el label de cada opciÃ³n explicando la diferencia.**

---

## 3. Estructura del Formulario Complejo

Una pÃ¡gina con scroll dentro de un `div` con `max-h`, sin tabs ni acordeones.

### Secciones visibles:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â•â•â• PROGRESS BAR (sticky) â•â•â•                    â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘ 60%                          â”‚
â”‚                                                    â”‚
â”‚  1. Encabezado (fecha auto + NÂ° pendiente)        â”‚
â”‚  â”€â”€â”€ separator â”€â”€â”€                                 â”‚
â”‚  2. Confidencialidad (RadioGroup 3 opciones)       â”‚
â”‚  â”€â”€â”€ separator â”€â”€â”€                                 â”‚
â”‚  3. Denunciante (campos segÃºn escenario)           â”‚
â”‚  â”€â”€â”€ separator â”€â”€â”€                                 â”‚
â”‚  4. Denunciado(s) â€” [bloques dinÃ¡micos]            â”‚
â”‚  â”€â”€â”€ separator â”€â”€â”€                                 â”‚
â”‚  5. Detalles del Incidente                         â”‚
â”‚  â”€â”€â”€ separator â”€â”€â”€                                 â”‚
â”‚  6. RelaciÃ³n de Hechos (textarea)                  â”‚
â”‚  â”€â”€â”€ separator â”€â”€â”€                                 â”‚
â”‚  7. Pruebas / Testigos â€” [bloques dinÃ¡micos]       â”‚
â”‚  â”€â”€â”€ separator â”€â”€â”€                                 â”‚
â”‚  8. Pie (declaraciÃ³n jurada + Enviar)              â”‚
â”‚                                                    â”‚
â”‚  â•â•â• STICKY FOOTER (solo al scrollear) â•â•â•        â”‚
â”‚  [Cancelar]  [Enviar denuncia]                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Sticky Progress Bar
- Se fija en la parte superior del card (position: sticky, top: 0) al hacer scroll
- Se adapta automÃ¡ticamente a mobile y desktop (sin valores hardcodeados)
- Calcula el % real de campos obligatorios completados (segÃºn el tipo de formulario)
- Estilo: barra gold (`bg-sidebar-accent`) sobre fondo suave

### Sticky Footer
- Aparece solo cuando el botÃ³n "Enviar" original no estÃ¡ visible (scroll hacia abajo)
- Barra delgada (40-48px), no tapa campos
- Botones: Cancelar (confirma antes de resetear) + Enviar (primary)
- Se desvanece al volver arriba
- El form agrega padding inferior (pb-16) cuando el footer estÃ¡ visible para que el Ãºltimo campo no quede tapado

### Bordes laterales por secciÃ³n
- `border-l-2 border-sidebar-accent/40` (gold muy suave)
- Al hacer focus en la secciÃ³n, la opacidad sube a `100%` (transiciÃ³n 200ms)

---

## 4. Detalle de Campos por SecciÃ³n

### SecciÃ³n 1: Encabezado
| Campo | Tipo | Obligatorio | ValidaciÃ³n |
|---|---|---|---|
| Fecha | Texto (solo lectura) | â€” | Se muestra la fecha actual del sistema |
| NÂ° de Denuncia | Texto (solo lectura) | â€” | "Se generarÃ¡ al enviar" |

### SecciÃ³n 2: Confidencialidad
| Campo | Tipo | Obligatorio | ValidaciÃ³n |
|---|---|---|---|
| Escenario | RadioGroup | âœ… | Debe seleccionar una opciÃ³n |

### SecciÃ³n 3: Denunciante

#### Escenario A (Revelada) y B (Reservada)
| Campo | Tipo | Obligatorio | ValidaciÃ³n |
|---|---|---|---|
| Nombres y Apellidos | Input | âœ… | 2-100 caracteres |
| CÃ©dula de Identidad | Input | âœ… | 6-9 dÃ­gitos |
| Email | Input (email) | âœ… | formato email |
| TelÃ©fono / Celular | Input (tel) | âœ… | 8 dÃ­gitos |

#### Escenario C (AnÃ³nimo)
| Campo | Tipo | Obligatorio | ValidaciÃ³n |
|---|---|---|---|
| Email | Input (email) | âŒ Opcional | formato email si se llena |
| TelÃ©fono / Celular | Input (tel) | âŒ Opcional | 8 dÃ­gitos si se llena |
| Mensaje informativo | Texto | â€” | "Si no proporciona contacto, solo podrÃ¡ consultar con el cÃ³digo del sistema o presencialmente" |

### SecciÃ³n 4: Denunciado(s)
**Al menos 1 bloque obligatorio.**

Por bloque:
| Campo | Tipo | Obligatorio |
|---|---|---|
| Â¿Conoce la identidad? | Switch (SÃ/NO) | âœ… |

**Si SÃ:**
| Campo | Tipo | Obligatorio | ValidaciÃ³n |
|---|---|---|---|
| Nombres y Apellidos | Input | âœ… | 2-100 caracteres |
| Cargo y/o Dependencia de trabajo | Input | âœ… | texto |

**Si NO:**
| Campo | Tipo | Obligatorio | ValidaciÃ³n |
|---|---|---|---|
| DescripciÃ³n fÃ­sica y vestimenta | Textarea | âœ… | No vacÃ­o |

**Botones:**
- `+ AÃ±adir otro denunciado` â€” agrega nuevo bloque independiente
- ðŸ—‘ï¸ Icono de basurero â€” elimina el bloque (no eliminar si es el Ãºnico bloque)

### SecciÃ³n 5: Detalles del Incidente
| Campo | Tipo | Obligatorio | ValidaciÃ³n |
|---|---|---|---|
| CategorÃ­a | Select + "Otro" | âœ… | Debe seleccionar o escribir |
| Fecha del incidente | Datepicker (shadcn) | âœ… | No futura, no anterior a 5 aÃ±os |
| Hora del incidente | Timepicker (opcional) | âŒ | Sin validaciÃ³n |
| Lugar | Input | âœ… | Texto |

**Tooltip `?` en hora:** "Opcional. Si no la recuerda exacta, indique un aproximado en 'RelaciÃ³n de Hechos'."

### SecciÃ³n 6: RelaciÃ³n de Hechos
| Campo | Tipo | Obligatorio | ValidaciÃ³n |
|---|---|---|---|
| Textarea | Textarea grande | âœ… | MÃ­n 20 caracteres, mÃ¡x 5000 |
| Contador | â€” | â€” | "XX / 5000 caracteres" |

**Tooltip `?`:** "Describa con claridad: quÃ© pasÃ³, cÃ³mo pasÃ³, dÃ³nde, cuÃ¡ndo, quiÃ©nes participaron."

### SecciÃ³n 7: Pruebas / Testigos
**Opcional (0 o mÃ¡s bloques).**

Por bloque:
| Campo | Tipo | Obligatorio |
|---|---|---|
| Tipo de Evidencia | Select | âœ… si se agrega bloque |

**Si Archivo:**
| Campo | Obligatorio |
|---|---|
| Archivo (upload) | âŒ Opcional |
| DescripciÃ³n de la prueba | âœ… |

**Si Prueba FÃ­sica:**
| Campo | Obligatorio |
|---|---|
| DescripciÃ³n de la prueba | âœ… |

**Si Testigo:**
| Campo | Obligatorio | ValidaciÃ³n |
|---|---|---|
| Nombre del Testigo | âœ… | texto |
| TelÃ©fono de Contacto | âœ… | 8 dÃ­gitos |

**Modal de subida de archivos (ModalSubirArchivo):**
- Al hacer clic en "Subir archivo (opcional)" se abre un modal con:
  - Drag & drop zone grande con preview del archivo
  - Botones "Subir archivo" / "Cancelar"
- DescripciÃ³n es un Textarea separado fuera del modal (visible en los 3 tipos)
- En la vista principal se muestra el nombre del archivo con truncado (`formatFilename(name, 28)`) + botÃ³n Quitar/Reemplazar

**Restricciones de archivo:**
- TamaÃ±o mÃ¡ximo: 50MB
- Formatos aceptados: PDF, JPG, PNG, DOCX
- Mostrar explÃ­citamente en el modal: "Formatos: PDF, JPG, PNG, DOCX Â· MÃ¡x: 50MB"

**Select de tipo de evidencia:**
- Usa shadcn `<Select>` con `<SelectItem>` en texto plano (sin iconos dentro del item)
- El icono del tipo se renderiza en un `<div>` separado a la izquierda del trigger
- `onValueChange` consolida todas las actualizaciones de estado en un solo `onChange` (`Partial<PruebaItem>` patch) para evitar closure stale

**Botones:**
- `+ AÃ±adir otra prueba/testigo` â€” agrega nuevo bloque
- ðŸ—‘ï¸ Icono de basurero â€” elimina el bloque

### SecciÃ³n 8: Pie
| Campo | Tipo | Obligatorio |
|---|---|---|
| DeclaraciÃ³n Jurada | Checkbox | âœ… |
| BotÃ³n Enviar | Button (submit) | Solo se habilita si checkbox estÃ¡ marcado |

**Texto del checkbox:**
"Declaro bajo juramento que los hechos descritos son verdaderos y que la presente denuncia no es presentada de mala fe."

---

## 5. Errores y ValidaciÃ³n

### Comportamiento
- **No hay validaciÃ³n en tiempo real** (ni en typing ni en onBlur)
- La validaciÃ³n ocurre **solo al hacer clic en "Enviar"**
- Backend mock valida todos los campos y devuelve errores

### VisualizaciÃ³n de errores
- El input con error recibe: `border-destructive/50` (borde rojo suave)
- Aparece icono `AlertCircle` a la derecha del input
- Hover sobre el icono â†’ **tooltip** con el mensaje corto de error (usando shadcn Popover o Tooltip)
- El label del campo cambia a `text-destructive`
- **No hay texto de error inline** (no invade visualmente)
- Scroll automÃ¡tico al primer campo con error
- **No hay toast/sonner** con resumen de errores

### Ejemplos de mensajes en tooltip
| Error | Mensaje en tooltip |
|---|---|
| Campo vacÃ­o obligatorio | **Requerido** |
| CÃ©dula invÃ¡lida | **6-9 dÃ­gitos** |
| Email invÃ¡lido | **Email invÃ¡lido** |
| TelÃ©fono invÃ¡lido | **8 dÃ­gitos** |
| Fecha futura | **Fecha no vÃ¡lida** |
| Hechos muy cortos | **MÃ­nimo 20 caracteres** |

### Ã‰xito
- Si todo es vÃ¡lido â†’ `sonner` toast: "Denuncia NÂ° **DEN-2024-0001** registrada exitosamente"
- Modal opcional con el ticket y resumen

---

## 6. Backend Mock

### `app/Data/DenunciaData.php`
```php
class DenunciaData {
    static function getAll(): array  // devuelve todas (de sesiÃ³n)
    static function add(array $data): string  // guarda en sesiÃ³n, genera ticket
    static function getNextTicket(): string  // DEN-2024-0001, incrementa
}
```

### `app/Http/Controllers/DenunciaController.php`
```php
class DenunciaController {
    function create()  // devuelve props vacÃ­as a RegistroDenuncia
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

Componentes Breeze existentes que NO se usarÃ¡n en este formulario (se reemplazan por shadcn):
- `Form/TextInput.tsx` â†’ shadcn `Input`
- `Form/InputLabel.tsx` â†’ shadcn `Label`
- `Form/Checkbox.tsx` â†’ shadcn `Checkbox`
- `Buttons/PrimaryButton.tsx` â†’ shadcn `Button`

---

## 8. Iconos de Ayuda (?) con Tooltip

En campos donde el tÃ­tulo no es autoexplicativo, se agrega:
```
Label [icono ?]
```
- Icono: `HelpCircle` de lucide-react (12-14px)
- Color: `text-muted-foreground`
- Tooltip: shadcn `Popover` o `Tooltip` con descripciÃ³n + ejemplos

### Campos con tooltip `?`

| Campo | Tooltip |
|---|---|
| CÃ©dula de Identidad | "Ingrese el nÃºmero sin puntos ni guiones. Ej: 1234567" |
| Email | "Correo electrÃ³nico vÃ¡lido para notificaciones del caso" |
| TelÃ©fono | "8 dÃ­gitos, sin cÃ³digo de paÃ­s. Ej: 70123456" |
| Hora del incidente | "Opcional. Si no la recuerda exacta, indique un aproximado en 'RelaciÃ³n de Hechos'." |
| DescripciÃ³n fÃ­sica/vestimenta | "Indique rasgos fÃ­sicos visibles (estatura, complexiÃ³n, cabello) y vestimenta." |
| RelaciÃ³n de Hechos | "Describa con claridad: quÃ© pasÃ³, cÃ³mo, dÃ³nde, cuÃ¡ndo, quiÃ©nes. MÃ­nimo 20 caracteres." |
| Referencia de la Nota (IntervenciÃ³n) | "NÃºmero o cÃ³digo de la nota interna que motiva la intervenciÃ³n." |

---

## 9. Cambios de TerminologÃ­a

| Antes | DespuÃ©s |
|---|---|
| Unidad o Funcionario Involucrado (AcompaÃ±amiento) | Dependencia o Funcionario Involucrado |
| Unidad Observada o Denunciada (IntervenciÃ³n) | Dependencia Observada o Denunciada |
| Cargo y/o Ã¡rea de trabajo (Denunciado) | Cargo y/o Dependencia de trabajo |
| Dependencia Observada o Denunciada (IntervenciÃ³n â€” v2) | Dependencia o Funcionario Observado/Denunciado |

---

## 10. Archivos a Crear

### Backend
| Archivo | DescripciÃ³n |
|---|---|
| `app/Data/DenunciaData.php` | Clase mock con datos en sesiÃ³n + generaciÃ³n de ticket |
| `app/Http/Controllers/DenunciaController.php` | Controller con create() y store() |

### Frontend â€” PÃ¡gina principal
| Archivo | DescripciÃ³n |
|---|---|
| `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` | Reemplazar placeholder. Dropdown selector + render condicional de formularios |

### Frontend â€” Componentes del formulario
| Archivo | DescripciÃ³n |
|---|---|
| `Components/Denuncias/SeccionEncabezado.tsx` | Fecha auto + NÂ° pendiente |
| `Components/Denuncias/SeccionConfidencialidad.tsx` | RadioGroup: Revelada / Reservada / AnÃ³nimo |
| `Components/Denuncias/SeccionDenunciante.tsx` | Campos segÃºn escenario (3 variantes) |
| `Components/Denuncias/BloqueDenunciado.tsx` | Switch identidad + campos condicionales, add/remove |
| `Components/Denuncias/SeccionDetalles.tsx` | CategorÃ­a (select+otro), fecha, hora (opcional), lugar |
| `Components/Denuncias/SeccionRelacionHechos.tsx` | Textarea + contador |
| `Components/Denuncias/BloquePrueba.tsx` | Switch tipo + campos condicionales, add/remove |
| `Components/Denuncias/ModalSubirArchivo.tsx` | Drag&drop + preview + descripciÃ³n |
| `Components/Denuncias/PieFormulario.tsx` | Checkbox declaraciÃ³n jurada + botÃ³n Enviar |
| `Components/Denuncias/FormularioAcompaniamiento.tsx` | Formulario simple (5 campos) |
| `Components/Denuncias/FormularioIntervencion.tsx` | Formulario simple (4 campos) |
| `Components/Denuncias/ModalExito.tsx` | Modal con ticket generado |
| `Components/Denuncias/ProgressBar.tsx` | Sticky progress bar |
| `Components/Denuncias/StickyFooter.tsx` | Sticky footer condicional |
| `Components/Denuncias/FieldHelp.tsx` | Icono ? + tooltip |
| `Components/Denuncias/InputError.tsx` | Icono âš  + tooltip de error |

---

## 11. Archivos a Modificar

| Archivo | Cambio |
|---|---|
| `routes/web.php` | Reemplazar Closure de `/denuncias/registrar` por controller + agregar `POST /denuncias` |

---

## 12. Archivos a NO Modificar

- `Sidebar.tsx`, `Header.tsx`, `InstitutionalLogo.tsx`, `AppLayout.tsx` (Fase 0)
- `tailwind.config.js`, `app.css` (ya tienen las variables necesarias)
- `routes/auth.php` (autenticaciÃ³n intacta)
- `resources/js/Components/ui/button.tsx` (shadcn button ya instalado)

---

## 13. Orden de ImplementaciÃ³n

```
1. Instalar shadcn: switch radio-group checkbox calendar popover textarea select input label separator sonner
2. Crear backend: DenunciaData.php + DenunciaController.php + actualizar rutas
3. Crear pÃ¡gina RegistroDenuncia.tsx con dropdown selector de tipo
4. Componentes del formulario Complejo en orden:
   4.1 SeccionEncabezado
   4.2 SeccionConfidencialidad (incluir FieldHelp)
   4.3 SeccionDenunciante (3 variantes)
   4.4 BloqueDenunciado (bloques dinÃ¡micos)
   4.5 SeccionDetalles (incluir datepicker, select categorÃ­a)
   4.6 SeccionRelacionHechos (textarea + contador)
   4.7 BloquePrueba + ModalSubirArchivo
   4.8 PieFormulario
5. Componentes de UI global:
   - ProgressBar (sticky)
   - StickyFooter
   - FieldHelp (icono ?)
   - InputError (icono âš  + tooltip)
   - ModalExito
6. Wire-up: submit â†’ store() â†’ toast Ã©xito
7. Formularios simples (AcompaÃ±amiento, IntervenciÃ³n)
8. Probar flujo completo
```

---

## 14. DiseÃ±o Visual

### Colores (variables CSS del sistema, sin cambios nuevos)
| Variable | Uso |
|---|---|
| `bg-card` / `border` / `rounded-2xl` | Contenedor del formulario |
| `text-foreground` | Texto general |
| `text-muted-foreground` | Labels secundarios, iconos ? |
| `bg-primary` / `text-primary-foreground` | BotÃ³n Enviar, focus states |
| `bg-sidebar-accent` / `text-sidebar` | Progress bar (gold institucional) |
| `border-destructive/50` | Inputs con error |
| `text-destructive` | Labels con error |
| `border-sidebar-accent/40` â†’ `border-sidebar-accent` | Bordes laterales de secciÃ³n |

### Separadores entre secciones
Usar shadcn `<Separator />` con `className="my-6"`.

### Responsive
- Desktop (md+): grid de 2 columnas para Denunciante y Detalles
- Mobile (<md): 1 columna, campos verticales

---

## 15. CategorÃ­as por Defecto (Select + "Otro")

> **Nota (Junio 2026):** Las categorÃ­as y subcategorÃ­as listadas a continuaciÃ³n son los valores por defecto en mock. En el **Sprint 10 (Panel AdministraciÃ³n CatÃ¡logos + SubcategorÃ­as)** estos valores serÃ¡n editables desde un panel administrativo Ãºnico, junto con todos los demÃ¡s catÃ¡logos del sistema (clasificaciones finales, tipos, estados, medios de notificaciÃ³n, etc.). Cada tipo de denuncia (corrupciÃ³n / negaciÃ³n de informaciÃ³n) tendrÃ¡ sus propias subcategorÃ­as como filtro adicional.

| OpciÃ³n |
|---|
| Cohecho (Soborno) |
| ConcusiÃ³n |
| MalversaciÃ³n |
| Negociaciones incompatibles |
| Enriquecimiento ilÃ­cito |
| TrÃ¡fico de influencias |
| Peculado |
| OmisiÃ³n de denuncia |
| Incumplimiento de deberes |
| Otro (campo libre) |

---

## 16. NÃºmero de Ticket

Formato: `DEN-AAAA-NNNN`

| Componente | DescripciÃ³n |
|---|---|
| DEN | Prefijo fijo "Denuncia" |
| AAAA | AÃ±o actual (2026) |
| NNNN | Secuencial 0001-9999 |

El contador vive en sesiÃ³n (mock). Se resetea al cerrar sesiÃ³n o se lee de un archivo/cookie (persistencia bÃ¡sica de mock).

---

## 17. Estructura del State (FormState)

El estado del formulario en React se estructura con:

### Formulario Complejo (CorrupciÃ³n / NegaciÃ³n)
```
form.tipo                â†’ tipo de denuncia
form.escenario           â†’ revelada | reservada | anonimo
form.denunciante         â†’ { nombres, ci, email, telefono }
form.denunciados         â†’ [ { id, conoce_identidad, nombres, dependencia, descripcion }, ... ]
form.detalles            â†’ { categoria, categoria_otro, fecha, hora, lugar }
form.hechos              â†’ string
form.pruebas             â†’ [ { id, tipo, archivo_nombre, archivo_data, descripcion, testigo_nombre, testigo_telefono }, ... ]
form.declaracion_jurada  â†’ boolean
```

### Formulario Simple (AcompaÃ±amiento / IntervenciÃ³n)
Todos los campos van a **root** de `form` (plano), no anidados en sub-objetos:

**AcompaÃ±amiento:** `form.nombres`, `form.ci`, `form.dependencia_funcionario`, `form.motivo`, `form.resolucion`

**IntervenciÃ³n:** `form.dependencia_observada`, `form.referencia_nota`, `form.motivo`, `form.archivo`, `form.archivo_data`

Esto es compatible con el backend mock actual (que espera campos a root) y fÃ¡cilmente migrable a JSONB en MySQL.

---

## 18. Decisiones del Sprint 1 (Registro de decisiones)

| Fecha | DecisiÃ³n | Alternativa descartada | Motivo |
|---|---|---|---|
| Junio 2026 | Dropdown de tipo de denuncia **siempre habilitado** (sin "Â¿Cambiar tipo?") | Dropdown se deshabilita + botÃ³n "Â¿Cambiar tipo?" | El dropdown con 2 clics previene misclics sin necesidad de botÃ³n extra redundante |
| Junio 2026 | **Sin** FieldHelp individual por opciÃ³n de Confidencialidad | Tooltip ? en cada radio button | Las descripciones de 1 lÃ­nea son suficientemente claras; tooltips agregarÃ­an ruido visual |
| Junio 2026 | State plano a root para formularios simples | State anidado por secciÃ³n | Compatible con backend actual y mÃ¡s simple de migrar a JSONB |
| Junio 2026 | Modal con `role="dialog"` y `aria-modal` | Sin accesibilidad | Requisito de a11y para modales |
| Junio 2026 | Label cambia a `text-destructive` en error (per-spec) | â€” | Mejora feedback visual del error |
| Junio 2026 | ProgressBar: UbicaciÃ³n en `headerBottom` de `AppLayout` | `position: sticky` dentro de la tarjeta del formulario | Evita que haya un espacio de scroll o padding entre la cabecera y el progreso. Queda fijo en el layout y alinea el padding dinÃ¡micamente (`px-4 sm:px-6 md:px-8`). |
| Junio 2026 | VinculaciÃ³n del ticket mediante Inertia global share | Parsing manual de `page.props` en el callback `onSuccess` | MÃ¡s robusto e independiente del ciclo de vida del callback. Permite usar un `useEffect` para gatillar el modal de confirmaciÃ³n y limpiar el estado al recibir los flashes del servidor. |
| Junio 2026 | Modo DemostraciÃ³n temporal | Llenado manual para pruebas | Permite validar rÃ¡pidamente los 4 flujos en la maqueta sin tener que teclear campos largos repetidamente. |
| Junio 2026 | StickyFooter: `pb-16` spacer en el form | `position: sticky` en el footer | Cambio rÃ¡pido, 1 lÃ­nea, evita tapar Ãºltimo campo |
| Junio 2026 | `updateItem` consolidado con `Partial<PruebaItem>` patch (1 solo `onChange` por evento) | MÃºltiples llamadas `updateItem` secuenciales (causaban closure stale) | Previene race condition: elimina closure stale (solo el Ãºltimo `setForm` ganaba y se perdÃ­an cambios) |
| Junio 2026 | SelectItem simplificado a texto plano (sin `<span>` con iconos) | `<span className="flex items-center gap-2"><Icon/> Texto</span>` dentro de SelectItem | Radix SelectValue no renderiza bien children complejos; el icono se mantiene fuera del Select en el `div` del trigger |
| Junio 2026 | `formatFilename(name, 28)` trunca nombres largos con `..extension` | Mostrar nombre completo sin truncar | Evita desbordamiento visual cuando el nombre es muy largo (ej: documento_con_nombre_muy..aa.jpg) |
| Junio 2026 | Archivo upload es opcional en todos los tipos de prueba | Archivo obligatorio solo en tipo 'archivo' | El usuario indicÃ³ que en los 3 tipos (archivo, fÃ­sica, testigo) la subida es opcional |
| Junio 2026 | Label IntervenciÃ³n: "Dependencia o Funcionario Observado/Denunciado" | SÃ³lo "Dependencia Observada o Denunciada" | El campo puede referirse tanto a una dependencia como a un funcionario especÃ­fico; se unificaron ambos tÃ©rminos |

---

## 19. Post-Sprint 1

Queda pendiente para sprints futuros:
- ConexiÃ³n a BD real (Fase 1.5+)
- CÃ¡lculo de dÃ­as hÃ¡biles con feriados
- Reportes
- Roles y permisos
- Notificaciones

