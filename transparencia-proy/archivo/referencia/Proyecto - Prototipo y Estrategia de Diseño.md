> ⚠️ **Referencia histórica — diseño original Fase 0.** No es estado actual. Ver AI-CONTEXT.md.
#transparencia
# ðŸŽ¨ Estrategia de Prototipo y DiseÃ±o â€” Sistema Transparencia

> [!NOTE] PropÃ³sito de este archivo
> Documenta las decisiones de diseÃ±o y estrategia de la **Fase 0 (Prototipo / Maqueta)** del proyecto. Cubre: quÃ© datos usar sin base de datos, quÃ© estilo visual usar, cÃ³mo presentar mÃºltiples opciones al cliente, y cÃ³mo hacer que un cambio de tema sea indoloro.

---

## 1. Estrategia de Prototipo (Fase 0 â€” Maqueta DinÃ¡mica vÃ­a Laravel Controllers)

### Â¿QuÃ© es una maqueta dinÃ¡mica?
Es una aplicaciÃ³n que simula el flujo completo y las interacciones del sistema final. Para evitar el costo y la rigidez de estar modificando constantemente la base de datos (migraciones, rollback, redefiniciÃ³n de esquemas) ante comentarios y cambios solicitados por el cliente en la fase de prototipado, utilizaremos un **enfoque de controladores con datos mock**.

**CÃ³mo funciona:**
* **Laravel en el Backend**: Los controladores de Laravel sirviendo las pÃ¡ginas mediante Inertia enviarÃ¡n colecciones y arrays de datos ficticios (nombres de denuncias, tÃ©cnicos, plazos, etc.) directamente como variables y propiedades en PHP.
* **React en el Frontend**: Los componentes de React consumen los datos de forma transparente mediante `props` estÃ¡ndares de Inertia.
* **Ventajas de esta arquitectura**:
  * **Cero fricciÃ³n ante cambios de datos**: AÃ±adir, renombrar o quitar un campo en la denuncia toma solo unos segundos (cambiar una llave en un array de PHP en el controlador) en lugar de alterar migraciones.
  * **Cero reescritura de cÃ³digo**: La comunicaciÃ³n ya usa la infraestructura definitiva (`Laravel -> Inertia -> React`), por lo que al conectar la base de datos real en la fase posterior, el cÃ³digo de los componentes React no cambiarÃ¡ en lo absoluto.
  * **Persistencia bÃ¡sica**: Las acciones interactivas de cambio de estado (ej. mover una tarjeta en el Kanban) se pueden sincronizar en la sesiÃ³n de Laravel o localmente en el estado del cliente.

### Â¿QuÃ© datos usar? ElecciÃ³n del proyecto
Utilizaremos **arrays y colecciones mock definidos en los controladores de Laravel**, junto con persistencia de estado selectiva en el cliente. De este modo, la conexiÃ³n de red local a MySQL de Laragon se posterga de forma intencional hasta que el cliente final valide por completo la interfaz y el comportamiento del prototipo.

### Estructura de datos sugerida para el prototipo

```typescript
// src/data/denuncias.json  â† datos de ejemplo para el prototipo
[
  {
    "id": "DEN-2024-001",
    "tipo": "CORRUPCION",
    "estado": "ADMISION",
    "denunciante": "Juan PÃ©rez",
    "anonima": false,
    "fechaIngreso": "2024-01-15",
    "plazoTotal": 45,
    "diasRestantes": 38,
    "tecnicoAsignado": null,
    "descripcion": "Irregularidades en proceso de contrataciÃ³n...",
    "prioridad": "ALTA"
  }
]

// src/data/usuarios.json
[
  { "id": 1, "nombre": "MarÃ­a LÃ³pez", "rol": "registrador", "avatar": "ML" },
  { "id": 2, "nombre": "Carlos Quispe", "rol": "asignador",     "avatar": "CQ" },
  { "id": 3, "nombre": "Ana Torres",   "rol": "tecnico",        "avatar": "AT" }
]
```

## 2. El DiseÃ±o Visual â€” DecisiÃ³n Final: Morado & Amarillo Institucional

### ðŸ“Œ DecisiÃ³n del Proyecto: Colores Oficiales en OKLCH
Para este proyecto se ha establecido de forma oficial el uso de la **paleta institucional de colores**:
*   **Morado (`#690bb2`)**: Como color primario de acento, marcas y estados activos.
*   **Amarillo (`#fecd2a`)**: Como color secundario para llamadas de atenciÃ³n y contrastes altos de UI.

Se descarta el uso de estilos Neo-brutalistas o paletas genÃ©ricas para mantener la seriedad de la instituciÃ³n pÃºblica. Para asegurar la mÃ¡xima precisiÃ³n cromÃ¡tica y soporte nativo de opacidades y modo oscuro, toda la paleta se ha implementado utilizando el espacio de color **`OKLCH`** mediante variables CSS centralizadas.

#### Ventajas de este enfoque:
1. **Estilos Centralizados:** Modificando Ãºnicamente el archivo `app.css` podemos cambiar el color primario, el radio de las esquinas (`--radius`), el grosor de los bordes o el sombreado de todo el sistema.
2. **Cero dolor ante cambios futuros:** Si en el futuro la instituciÃ³n decidiera renovar su imagen o ajustar la tonalidad, solo se actualizan las variables de color en `app.css`. No hay que tocar ni una lÃ­nea de cÃ³digo `.tsx` de los componentes.
3. **Modo Oscuro Integrado:** El uso de las variables en los bloques `:root` y `.dark` de CSS permite una transiciÃ³n instantÃ¡nea y fluida de todos los componentes de Shadcn (botones, tarjetas, dropdowns) sin cÃ³digo condicional en React.

---

## 3. EstructuraciÃ³n del Layout en el Prototipo

Para la presentaciÃ³n con el cliente, el prototipo estructurarÃ¡ de forma clara los dos tipos de acceso:
*   **Acceso PÃºblico (Buscador y Login)**: PÃ¡ginas totalmente independientes, minimalistas y despejadas, sin la estructura del Header ni Sidebar. Esto da una experiencia limpia al ciudadano denunciante.
*   **Acceso Privado (Funcionarios)**: Una vez iniciada la sesiÃ³n, las pÃ¡ginas privadas (Kanban general, Kanban personal, detalles de investigaciÃ³n, reportes) se renderizan dentro del layout global **`AppLayout.tsx`**, heredando automÃ¡ticamente la cabecera y el sidebar responsivo de forma cohesiva.

---

## 4. Â¿QuÃ© tan doloroso es cambiar el tema si el cliente no queda satisfecho?

**Si construyes bien desde el principio: casi nada de dolor.**

La clave es seguir estas reglas al escribir el cÃ³digo del prototipo:

### âœ… Siempre usa las clases semÃ¡nticas de shadcn (no colores hardcodeados)

```tsx
// âŒ MAL â€” Si el cliente quiere otro color primario, tienes que buscar y reemplazar
// en TODOS los archivos:
<button className="bg-yellow-400 text-black border-2 border-black">

// âœ… BIEN â€” Solo cambias la variable --primary en app.css y TODOS los botones
// del sistema se actualizan solos:
<Button variant="default">    {/* usa var(--primary) internamente */}
```

### âœ… Usa `cn()` y variantes `cva` para los colores especÃ­ficos del negocio

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
// Si el cliente quiere "naranja en vez de rojo para las vencidas", cambias 1 lÃ­nea.
```

### âœ… MantÃ©n la lÃ³gica y el estilo separados

La arquitectura de componentes que ya aprendes en tus notas de React (`03 Componentes y Props`) aplica aquÃ­: un componente `<TarjetaDenuncia>` solo muestra datos, no decide colores. Los colores vienen de las props o de las variantes `cva`. Cambiar el look es un cambio de CSS, no un cambio de lÃ³gica.

---

## 5. Resumen de Decisiones

| DecisiÃ³n | ElecciÃ³n | RazÃ³n |
|----------|----------|-------|
| **Datos del prototipo** | `localStorage` + archivos `.json` | Persiste, simula DB, fÃ¡cil de reemplazar por Inertia |
| **Estilo Visual Base** | **Shadcn estÃ¡ndar + Variables CSS** | Evita acoplar estilos rÃ­gidos en el `.tsx` (Neobrutalism). Facilita cambios de colores, bordes y radios en `app.css` |
| **Estrategia de 2 temas** | CSS Variables + `ThemeSwitcher` (Violeta vs Azul) | El cliente compara en vivo propuestas cromÃ¡ticas sin alterar el cÃ³digo |
| **ProtecciÃ³n contra cambio de tema** | Clases semÃ¡nticas de shadcn, nunca hardcoded | Cambiar tema = editar `app.css`, no tocar componentes |
| **Colores de negocio** | Centralizados en variantes `cva` | 1 lÃ­nea = cambia todo el sistema |

---

## 6. Plan de Pantallas para el Prototipo (Sugerido)

Cada pantalla tendrÃ¡ su versiÃ³n A (Neobrutalism) y versiÃ³n B (Profesional) para la presentaciÃ³n:

| Pantalla                         | DescripciÃ³n                                                                |
| ----------------------------------| ----------------------------------------------------------------------------|
| **Login**                        | Formulario de ingreso segÃºn rol                                            |
| **Dashboard / Inicio**           | Resumen: contadores, alertas de plazos, denuncias urgentes                 |
| **Kanban de Denuncias**          | Columnas por estado del proceso (RecepciÃ³n â†’ AdmisiÃ³n â†’ Informe â†’ Cerrado) |
| **Detalle de Denuncia**          | Modal o Sheet con toda la info de la denuncia, fases, documentos           |
| **Formulario de Nueva Denuncia** | Para el registrador: datos del denunciante + tipo + pruebas              |
| **Panel de AsignaciÃ³n**          | Vista del asignador: denuncias sin tÃ©cnico + selector de asignaciÃ³n        |
| **Seguimiento PÃºblico**          | PÃ¡gina pÃºblica donde el denunciante busca su ticket y ve el estado         |
| **Reportes**                     | GrÃ¡ficas y tablas: denuncias por mes, por tipo, tasas de aceptaciÃ³n        |

