#transparencia
# 🎨 Estrategia de Prototipo y Diseño — Sistema Transparencia

> [!NOTE] Propósito de este archivo
> Documenta las decisiones de diseño y estrategia de la **Fase 0 (Prototipo / Maqueta)** del proyecto. Cubre: qué datos usar sin base de datos, qué estilo visual usar, cómo presentar múltiples opciones al cliente, y cómo hacer que un cambio de tema sea indoloro.

---

## 1. Estrategia de Prototipo (Fase 0 — Maqueta Dinámica vía Laravel Controllers)

### ¿Qué es una maqueta dinámica?
Es una aplicación que simula el flujo completo y las interacciones del sistema final. Para evitar el costo y la rigidez de estar modificando constantemente la base de datos (migraciones, rollback, redefinición de esquemas) ante comentarios y cambios solicitados por el cliente en la fase de prototipado, utilizaremos un **enfoque de controladores con datos mock**.

**Cómo funciona:**
* **Laravel en el Backend**: Los controladores de Laravel sirviendo las páginas mediante Inertia enviarán colecciones y arrays de datos ficticios (nombres de denuncias, técnicos, plazos, etc.) directamente como variables y propiedades en PHP.
* **React en el Frontend**: Los componentes de React consumen los datos de forma transparente mediante `props` estándares de Inertia.
* **Ventajas de esta arquitectura**:
  * **Cero fricción ante cambios de datos**: Añadir, renombrar o quitar un campo en la denuncia toma solo unos segundos (cambiar una llave en un array de PHP en el controlador) en lugar de alterar migraciones.
  * **Cero reescritura de código**: La comunicación ya usa la infraestructura definitiva (`Laravel -> Inertia -> React`), por lo que al conectar la base de datos real en la fase posterior, el código de los componentes React no cambiará en lo absoluto.
  * **Persistencia básica**: Las acciones interactivas de cambio de estado (ej. mover una tarjeta en el Kanban) se pueden sincronizar en la sesión de Laravel o localmente en el estado del cliente.

### ¿Qué datos usar? Elección del proyecto
Utilizaremos **arrays y colecciones mock definidos en los controladores de Laravel**, junto con persistencia de estado selectiva en el cliente. De este modo, la conexión de red local a MySQL de Laragon se posterga de forma intencional hasta que el cliente final valide por completo la interfaz y el comportamiento del prototipo.

### Estructura de datos sugerida para el prototipo

```typescript
// src/data/denuncias.json  ← datos de ejemplo para el prototipo
[
  {
    "id": "DEN-2024-001",
    "tipo": "CORRUPCION",
    "estado": "ADMISION",
    "denunciante": "Juan Pérez",
    "anonima": false,
    "fechaIngreso": "2024-01-15",
    "plazoTotal": 45,
    "diasRestantes": 38,
    "tecnicoAsignado": null,
    "descripcion": "Irregularidades en proceso de contratación...",
    "prioridad": "ALTA"
  }
]

// src/data/usuarios.json
[
  { "id": 1, "nombre": "María López", "rol": "recepcionista", "avatar": "ML" },
  { "id": 2, "nombre": "Carlos Quispe", "rol": "asignador",     "avatar": "CQ" },
  { "id": 3, "nombre": "Ana Torres",   "rol": "tecnico",        "avatar": "AT" }
]
```

## 2. El Diseño Visual — Decisión Final: Morado & Amarillo Institucional

### 📌 Decisión del Proyecto: Colores Oficiales en OKLCH
Para este proyecto se ha establecido de forma oficial el uso de la **paleta institucional de colores**:
*   **Morado (`#690bb2`)**: Como color primario de acento, marcas y estados activos.
*   **Amarillo (`#fecd2a`)**: Como color secundario para llamadas de atención y contrastes altos de UI.

Se descarta el uso de estilos Neo-brutalistas o paletas genéricas para mantener la seriedad de la institución pública. Para asegurar la máxima precisión cromática y soporte nativo de opacidades y modo oscuro, toda la paleta se ha implementado utilizando el espacio de color **`OKLCH`** mediante variables CSS centralizadas.

#### Ventajas de este enfoque:
1. **Estilos Centralizados:** Modificando únicamente el archivo `app.css` podemos cambiar el color primario, el radio de las esquinas (`--radius`), el grosor de los bordes o el sombreado de todo el sistema.
2. **Cero dolor ante cambios futuros:** Si en el futuro la institución decidiera renovar su imagen o ajustar la tonalidad, solo se actualizan las variables de color en `app.css`. No hay que tocar ni una línea de código `.tsx` de los componentes.
3. **Modo Oscuro Integrado:** El uso de las variables en los bloques `:root` y `.dark` de CSS permite una transición instantánea y fluida de todos los componentes de Shadcn (botones, tarjetas, dropdowns) sin código condicional en React.

---

## 3. Estructuración del Layout en el Prototipo

Para la presentación con el cliente, el prototipo estructurará de forma clara los dos tipos de acceso:
*   **Acceso Público (Buscador y Login)**: Páginas totalmente independientes, minimalistas y despejadas, sin la estructura del Header ni Sidebar. Esto da una experiencia limpia al ciudadano denunciante.
*   **Acceso Privado (Funcionarios)**: Una vez iniciada la sesión, las páginas privadas (Kanban general, Kanban personal, detalles de investigación, reportes) se renderizan dentro del layout global **`AppLayout.tsx`**, heredando automáticamente la cabecera y el sidebar responsivo de forma cohesiva.

---

## 4. ¿Qué tan doloroso es cambiar el tema si el cliente no queda satisfecho?

**Si construyes bien desde el principio: casi nada de dolor.**

La clave es seguir estas reglas al escribir el código del prototipo:

### ✅ Siempre usa las clases semánticas de shadcn (no colores hardcodeados)

```tsx
// ❌ MAL — Si el cliente quiere otro color primario, tienes que buscar y reemplazar
// en TODOS los archivos:
<button className="bg-yellow-400 text-black border-2 border-black">

// ✅ BIEN — Solo cambias la variable --primary en app.css y TODOS los botones
// del sistema se actualizan solos:
<Button variant="default">    {/* usa var(--primary) internamente */}
```

### ✅ Usa `cn()` y variantes `cva` para los colores específicos del negocio

```tsx
// Los colores de estado de denuncia (EN_TIEMPO, PROXIMA_A_VENCER, VENCIDA)
// deben estar centralizados en UN SOLO lugar:

const badgeVariants = cva("px-2 py-1 rounded-full text-xs font-semibold", {
  variants: {
    estado: {
      en_tiempo:       "bg-green-100  text-green-800  border border-green-300",
      proxima_vencer:  "bg-yellow-100 text-yellow-800 border border-yellow-300",
      vencida:         "bg-red-100    text-red-800    border border-red-300",
    }
  }
});
// Si el cliente quiere "naranja en vez de rojo para las vencidas", cambias 1 línea.
```

### ✅ Mantén la lógica y el estilo separados

La arquitectura de componentes que ya aprendes en tus notas de React (`03 Componentes y Props`) aplica aquí: un componente `<TarjetaDenuncia>` solo muestra datos, no decide colores. Los colores vienen de las props o de las variantes `cva`. Cambiar el look es un cambio de CSS, no un cambio de lógica.

---

## 5. Resumen de Decisiones

| Decisión | Elección | Razón |
|----------|----------|-------|
| **Datos del prototipo** | `localStorage` + archivos `.json` | Persiste, simula DB, fácil de reemplazar por Inertia |
| **Estilo Visual Base** | **Shadcn estándar + Variables CSS** | Evita acoplar estilos rígidos en el `.tsx` (Neobrutalism). Facilita cambios de colores, bordes y radios en `app.css` |
| **Estrategia de 2 temas** | CSS Variables + `ThemeSwitcher` (Violeta vs Azul) | El cliente compara en vivo propuestas cromáticas sin alterar el código |
| **Protección contra cambio de tema** | Clases semánticas de shadcn, nunca hardcoded | Cambiar tema = editar `app.css`, no tocar componentes |
| **Colores de negocio** | Centralizados en variantes `cva` | 1 línea = cambia todo el sistema |

---

## 6. Plan de Pantallas para el Prototipo (Sugerido)

Cada pantalla tendrá su versión A (Neobrutalism) y versión B (Profesional) para la presentación:

| Pantalla                         | Descripción                                                                |
| ----------------------------------| ----------------------------------------------------------------------------|
| **Login**                        | Formulario de ingreso según rol                                            |
| **Dashboard / Inicio**           | Resumen: contadores, alertas de plazos, denuncias urgentes                 |
| **Kanban de Denuncias**          | Columnas por estado del proceso (Recepción → Admisión → Informe → Cerrado) |
| **Detalle de Denuncia**          | Modal o Sheet con toda la info de la denuncia, fases, documentos           |
| **Formulario de Nueva Denuncia** | Para la recepcionista: datos del denunciante + tipo + pruebas              |
| **Panel de Asignación**          | Vista del asignador: denuncias sin técnico + selector de asignación        |
| **Seguimiento Público**          | Página pública donde el denunciante busca su ticket y ve el estado         |
| **Reportes**                     | Gráficas y tablas: denuncias por mes, por tipo, tasas de aceptación        |
