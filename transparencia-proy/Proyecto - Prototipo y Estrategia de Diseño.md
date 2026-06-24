#transparencia
# 🎨 Estrategia de Prototipo y Diseño — Sistema Transparencia

> [!NOTE] Propósito de este archivo
> Documenta las decisiones de diseño y estrategia de la **Fase 0 (Prototipo / Maqueta)** del proyecto. Cubre: qué datos usar sin base de datos, qué estilo visual usar, cómo presentar múltiples opciones al cliente, y cómo hacer que un cambio de tema sea indoloro.

---

## 1. Estrategia de Prototipo (Fase 0 — Sin Backend Real)

### ¿Qué es un prototipo funcional?
Un prototipo funcional (también llamado *mockup interactivo*) es una aplicación React completamente navegable, con flujos reales, estados reales y transiciones reales — pero cuyos datos viven en el frontend, no en una base de datos.

**Objetivo de esta fase:** Mostrar al cliente el flujo completo del sistema y la interfaz gráfica antes de escribir una sola línea de Laravel, para validar requerimientos y evitar cambios costosos en la base de datos después.

---

### ¿Qué datos usar? Mi consejo según el caso

| Opción | Cuándo usarla | Ventajas | Desventajas |
|--------|--------------|----------|-------------|
| **Arrays/Objetos en el código** | Estado inicial de componentes sencillos (lista de usuarios, roles) | Cero configuración, cambia al vuelo | Se pierde al refrescar la página |
| **Archivos `.json` locales** | Datos grandes o estructurados que importas con `import data from './data.json'` | Fácil de editar, simula una API | Se pierde al refrescar; no persiste cambios |
| **`localStorage`** | ✅ **RECOMENDADO para el Kanban** | Persiste entre recargas, simula una DB real | Solo funciona en ese navegador |
| **SQLite (vía `sql.js` o Turso)** | Si necesitas queries complejas tipo JOIN | Muy cercano a producción | Configuración más compleja, innecesario para un prototipo |

> [!TIP] Mi recomendación para este proyecto
> Usa **`localStorage` + archivos `.json` estáticos**. Es el balance perfecto:
> - Los datos base (denuncias de ejemplo, usuarios, roles) viven en archivos `.json` que importas al arranque.
> - El **estado del Kanban** (qué columna tiene qué tarjeta, qué cambios hizo el usuario) se guarda en `localStorage` para que el cliente pueda navegar, mover tarjetas, y volver a entrar sin perder los cambios.
> - Cuando llegue el momento de conectar Laravel, solo reemplazas la capa de datos (las funciones que leen del `.json` / `localStorage`) por llamadas a la API de Inertia. **Los componentes React no cambian nada.**

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

---

## 2. El Diseño Visual — Decisión Final: Plantilla Base de Shadcn

### 📌 Decisión del Proyecto: Shadcn Base + Personalización mediante CSS
Tras analizar las opciones de diseño, se ha decidido **no utilizar Neobrutalism** debido a que requiere hardcodear clases y estilos complejos (`border-2 border-black`, sombras rígidas offset, etc.) directamente en los archivos `.tsx` de cada componente. Esto dificulta enormemente los cambios de estilo si el cliente no está satisfecho.

En su lugar, utilizaremos la **plantilla base de Shadcn** y personalizaremos los estilos visuales mediante **variables de CSS** en `app.css` (o `global.css`).

#### Ventajas de este enfoque:
1. **Estilos Centralizados:** Modificando únicamente el archivo `app.css` podemos cambiar el color primario, el radio de las esquinas (`--radius`), el grosor de los bordes o el sombreado de todo el sistema.
2. **Cero dolor en cambios de tema:** Si el cliente solicita pasar de un estilo moderno/violeta a uno clásico/azul, solo editamos las variables de CSS en un solo lugar. No hay que tocar ni una línea de código `.tsx` de los componentes.
3. **Alineación con la UI propuesta:** Podemos lograr el estilo moderno con tonos pasteles, morados/violetas y sombras suaves que te gustaron modificando solo las variables de `:root`.

---

## 3. Cómo Presentar Opciones de UI (Ej. Violeta Moderno vs Azul Corporativo)

Dado que todo el sistema de Shadcn se basa en **variables CSS** dentro del archivo `app.css`, podemos configurar múltiples combinaciones de color y bordes para que el cliente elija.

### La magia: CSS Variables en `:root`

Aquí tienes un ejemplo de cómo definir las variables en `app.css` para dos propuestas diferentes:

```css
/* Opción A: Tema Violeta Moderno (Pasteles, violeta vibrante, bordes curvos y suaves) */
:root {
  --background: 260 30% 98%;
  --foreground: 263 39% 12%;
  --primary: 262 83% 58%;       /* Violeta */
  --primary-foreground: 210 20% 98%;
  --border: 260 20% 90%;
  --radius: 0.75rem;            /* Bordes bastante redondeados y modernos */
}

/* Opción B: Tema Azul Corporativo (Estilo limpio, serio, bordes estándar) */
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 221 83% 53%;       /* Azul corporativo */
  --primary-foreground: 210 20% 98%;
  --border: 214 32% 91%;
  --radius: 0.5rem;             /* Bordes clásicos */
}
```

### Estrategia práctica: Selector de Tema en el Prototipo

Para permitir que el cliente cambie y compare ambas opciones visuales en vivo durante la presentación, podemos implementar este componente:

```tsx
// src/Components/ThemeSwitcher.tsx
// ── Un archivo, dos temas de Shadcn — el cliente decide en vivo ──
import { useState } from 'react';

const TEMAS = {
  violeta: {
    nombre: "Violeta Moderno",
    variables: {
      "--background": "260 30% 98%",
      "--foreground": "263 39% 12%",
      "--primary": "262 83% 58%",
      "--primary-foreground": "210 20% 98%",
      "--border": "260 20% 90%",
      "--radius": "0.75rem",
    }
  },
  azul: {
    nombre: "Azul Corporativo",
    variables: {
      "--background": "0 0% 100%",
      "--foreground": "222 47% 11%",
      "--primary": "221 83% 53%",
      "--primary-foreground": "210 20% 98%",
      "--border": "214 32% 91%",
      "--radius": "0.5rem",
    }
  }
};

export function ThemeSwitcher() {
  const [tema, setTema] = useState<keyof typeof TEMAS>("violeta");

  const cambiarTema = (nuevoTema: keyof typeof TEMAS) => {
    const root = document.documentElement;
    // Aplica cada variable CSS directamente en el :root
    Object.entries(TEMAS[nuevoTema].variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    setTema(nuevoTema);
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-card text-card-foreground shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">🎨 Propuesta UI:</span>
      <div className="flex gap-1">
        {Object.entries(TEMAS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => cambiarTema(key as keyof typeof TEMAS)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all border
              ${tema === key 
                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                : "bg-background text-foreground hover:bg-muted border-input"}`}
          >
            {config.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
```

> [!TIP] Dónde poner el ThemeSwitcher para la presentación
> Ubícalo temporalmente en la barra de navegación superior (Navbar) durante la demo con el cliente. Una vez que aprueben el estilo visual definitivo, retiras este componente y dejas los valores fijos en el archivo `app.css`.

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
