# Análisis de Viabilidad — Migración de Laravel 11 → 12/13

## ⚠️ Contexto Urgente: Laravel 11 ya está sin soporte

| Versión | Bug Fixes | Security Fixes | Estado |
|---|---|---|---|
| **Laravel 11** | ❌ Terminó Sep 2025 | ❌ **Terminó 12 Marzo 2026** | 🔴 **EOL — SIN SOPORTE** |
| **Laravel 12** | ❌ Terminó 13 Agosto 2026 | ✅ Hasta 24 Feb 2027 | 🟡 Solo parches seguridad |
| **Laravel 13** | ✅ Hasta ~Q3 2027 | ✅ Hasta ~Q1 2028 | 🟢 **Versión activa actual** |

> [!CAUTION]
> **Laravel 11 dejó de recibir parches de seguridad el 12 de Marzo de 2026.** Tu proyecto lleva ~5 meses sin cobertura de seguridad. La migración es urgente, especialmente para un sistema gubernamental que maneja denuncias ciudadanas confidenciales.

---

## 📦 Inventario de Dependencias y Compatibilidad

### Backend (composer.json)

| Paquete | Versión Actual | Compatible L12 | Compatible L13 | Acción Requerida |
|---|---|---|---|---|
| `php` | `^8.2` (Laragon: **8.2.31**) | ✅ (min 8.2) | ⚠️ **Requiere 8.3+** | Cambiar a PHP 8.3 en Laragon |
| `laravel/framework` | `^11.0` | → `^12.0` | → `^13.0` | Cambiar constraint |
| `inertiajs/inertia-laravel` | `^2.0` | ✅ Compatible | ✅ Compatible | Sin cambios |
| `laravel/sanctum` | `^4.0` | ✅ Compatible | ✅ Compatible | Sin cambios |
| `laravel/tinker` | `^2.9` | ✅ Compatible | ⚠️ → `^3.0` (L13) | Cambiar constraint |
| `barryvdh/laravel-dompdf` | `^3.1` | ✅ v3.1.2 | ✅ v3.1.2 | Sin cambios |
| `maatwebsite/excel` | `^3.1` | ⚠️ → `^4.0` | ⚠️ → `^4.0` (req PHP 8.3) | **Bump mayor + revisar API** |
| `tightenco/ziggy` | `^2.0` | ✅ Compatible | ✅ Compatible | Sin cambios |

| Dev Dependency | Versión Actual | Compatible L12 | Compatible L13 | Acción Requerida |
|---|---|---|---|---|
| `laravel/breeze` | `^2.4` | ✅ Compatible | ✅ Compatible | Sin cambios |
| `phpunit/phpunit` | `^10.5` | ⚠️ → `^11.0` | ⚠️ → `^12.0` | Cambiar constraint |
| `nunomaduro/collision` | `^8.0` | ⚠️ → `^8.0` o `^9.0` | ⚠️ Revisar versión | Actualizar |
| `spatie/laravel-ignition` | `^2.4` | ✅ Compatible | ✅ Compatible | Sin cambios |
| `laravel/pint` | `^1.13` | ✅ Compatible | ✅ Compatible | Sin cambios |
| `laravel/sail` | `^1.26` | ✅ Compatible | ✅ Compatible | Sin cambios |

### Frontend (package.json)

| Paquete | Versión Actual | ¿Afectado por migración? | Notas |
|---|---|---|---|
| `@inertiajs/react` | `^2.0.0` | ❌ No | Paquete npm, totalmente independiente de Laravel |
| `laravel-vite-plugin` | `^1.0` | ❌ No | Compatible con L12/L13 |
| `react` / `react-dom` | `^18.2.0` | ❌ No | No tiene ninguna dependencia de Laravel |
| `tailwindcss` | `^3.2.1` | ❌ No | Paquete npm, Laravel no lo controla |
| `shadcn/ui` (componentes) | New York style | ❌ No | Son archivos `.tsx` copiados al proyecto, sin deps de Laravel |
| Todos los `@radix-ui/*` | Varios | ❌ No | Primitivos UI puros, sin relación con Laravel |
| `tailwindcss-animate` | `^1.0.7` | ❌ No | Plugin CSS, independiente |
| `next-themes` | `^0.4.6` | ❌ No | Modo oscuro, independiente |
| `recharts` | `^3.10.1` | ❌ No | Librería de gráficos, independiente |
| `lucide-react` | `^1.21.0` | ❌ No | Íconos, independiente |

> [!NOTE]
> **El frontend es 100% independiente de Laravel.** Solo el backend (PHP/Composer) requiere cambios. `npm install` no es necesario — `node_modules/` no se toca.

#### 📌 Aclaraciones puntuales sobre el frontend

**Inertia.js — Son dos paquetes separados:**
- `inertiajs/inertia-laravel` → vive en **Composer** (backend). Este puede subir a `^3.0` si `composer update` lo requiere, pero `^2.0` sigue siendo compatible con L13.
- `@inertiajs/react` → vive en **npm** (frontend). **No cambia.** Inertia funciona como un protocolo HTTP entre backend y frontend; el adapter de React no sabe ni le importa qué versión de Laravel corre.

**React 18 — No es necesario actualizar a React 19:**
- Los starter kits nuevos de Laravel 13 usan React 19 por defecto, pero eso solo aplica a proyectos nuevos.
- Tu React 18 (`^18.2.0`) es perfectamente compatible con Inertia v2 y con L13. No hay ningún requisito de actualizar.

**Tailwind CSS — Estás en v3, no v4:**
- El proyecto usa `"tailwindcss": "^3.2.1"` (v3), no "Tailwind v13" (no existe esa versión).
- Laravel 13 **no requiere Tailwind v4**. El nuevo standard de los starter kits de L13 es v4, pero es opcional — tu `tailwind.config.js` + `postcss.config.js` actuales siguen funcionando sin cambios.
- Tailwind v4 sería una migración separada e independiente de la migración de Laravel, con su propia complejidad (cambio a configuración CSS-first, eliminación de `tailwind.config.js`). No es recomendable hacerla al mismo tiempo.

**shadcn/ui — Sin impacto:**
- shadcn/ui no es una dependencia instalada como paquete. Son archivos `.tsx` copiados directamente al proyecto en `resources/js/Components/ui/`.
- Tu `components.json` (style: `new-york`, Tailwind v3, CSS variables OKLCH) seguirá funcionando igual.
- shadcn/ui soporta tanto Tailwind v3 como v4. Si en el futuro migras a Tailwind v4, los componentes necesitarían re-agregarse con el CLI, pero eso es independiente de Laravel.

---

## 🔍 Análisis de Riesgo por Componente del Proyecto

### Riesgo BAJO ✅

| Componente | Por qué es bajo riesgo |
|---|---|
| **20 modelos Eloquent** | La API de Eloquent no tiene breaking changes entre L11→L12→L13. Los casts, relations, SoftDeletes, etc. son idénticos. |
| **`bootstrap/app.php`** | Ya usa la estructura "slim" de L11 (`Application::configure()`). L12/L13 mantienen esta estructura. |
| **Middleware `HandleInertiaRequests`** | Registrado via `withMiddleware()` — ya es el patrón moderno. Sin cambios. |
| **11 controladores** | La API de controladores (`Request`, `Inertia::render()`, `redirect()`, etc.) es estable. |
| **Migraciones (22)** | Las migraciones existentes no se re-ejecutan. Solo importa que el Schema Builder sea compatible (lo es). |
| **Seeders** | Sin cambios en la API de seeders. |
| **63 tests** | La lógica de los tests es igual. Solo PHPUnit cambia de versión (ver abajo). |
| **Sistema de permisos** (`PermisosCatalogo`) | Es código puro PHP, sin dependencias de framework. |
| **Helpers** (`DiasHabiles`, `RollUpDependencias`, `UppercaseText`) | Código puro, sin riesgo. |

### Riesgo MEDIO ⚠️

| Componente | Riesgo | Mitigación |
|---|---|---|
| **`maatwebsite/excel` → v4.0** | La v4 usa `phpoffice/phpspreadsheet` 5.x y tipado estricto. Tu [ReporteExcel.php](file:///c:/laragon/www/transparencia/app/Exports/ReporteExcel.php) (1.8 KB) podría necesitar ajustes en las firmas de métodos. | Archivo pequeño, revisión rápida. |
| **PHPUnit 10 → 11 (o 12)** | Algunos métodos deprecados pueden romperse. Tu `phpunit.xml` ya usa la estructura moderna con `<source>`. | Correr `php artisan test` después de la migración y ajustar assertions si fallan. |
| **Carbon 2 → Carbon 3** (en L12+) | Si hay uso directo de métodos de Carbon que cambiaron. Tu proyecto usa `Carbon::now()`, `$date->format()`, `subYears()`, etc. — todos estables. | Riesgo bajo en la práctica. |

### Riesgo ALTO ❌

| Componente | Riesgo |
|---|---|
| Ninguno identificado | — |

---

## ⚖️ Comparativa: ¿Migrar a L12 o directo a L13?

### Opción A: Laravel 11 → Laravel 12

| Pros | Contras |
|---|---|
| PHP 8.2 compatible (no necesitas cambiar PHP en Laragon) | L12 **ya no recibe bug fixes** (terminó 13 Ago 2026) |
| Menor delta de cambios (Carbon 3, PHPUnit 11) | Solo quedan ~6 meses de security fixes (hasta Feb 2027) |
| Paso intermedio más seguro si hay miedo a romper | Tendrás que migrar a L13 de todos modos pronto |

### Opción B: Laravel 11 → Laravel 13 (directa)

| Pros | Contras |
|---|---|
| **Versión activa actual** con soporte completo hasta 2028 | Requiere cambiar Laragon a **PHP 8.3** |
| Bug fixes + security fixes activos | `maatwebsite/excel` salta a v4.0 (tipado estricto) |
| Laravel minimizó breaking changes en L13 | PHPUnit salta a v12 (más saltos) |
| PHP Attributes nativos (opcional, no obligatorio) | Dos versiones de delta en un solo paso |
| No necesitas migrar otra vez en 6 meses | — |

### 🏆 Recomendación: **Migrar directo a Laravel 13**

**Razones:**
1. Ya tienes **PHP 8.3.30 instalado en Laragon** — solo necesitas cambiar la versión activa en la configuración de Laragon (click derecho → PHP → Version → 8.3.30).
2. Laravel 12 ya no recibe bug fixes y solo tiene 6 meses de security fixes. Migrar a L12 sería un parche temporal que te obligaría a migrar otra vez pronto.
3. Los breaking changes entre L11 → L13 son mínimos para tu proyecto porque:
   - Ya usas la estructura "slim" de L11 (sin `Kernel.php`)
   - Tu frontend es independiente (Inertia + React)
   - No usas features deprecados
4. Estás a tiempo: Laravel 13 salió hace 5 meses (Marzo 2026), el ecosistema ya está maduro.

---

## 🛠️ Plan de Ejecución (estimado: 2-4 horas)

### Fase 1: Preparación (~15 min)

```
1. ☐ Backup de la BD: mysqldump
2. ☐ Backup del proyecto: git commit de todo cambio pendiente
3. ☐ Crear rama: git checkout -b feature/laravel-13-upgrade
4. ☐ Cambiar PHP en Laragon: Menu → PHP → Version → php-8.3.30
5. ☐ Verificar: php -v → PHP 8.3.30
```

### Fase 2: Actualizar `composer.json` (~10 min)

```diff
 "require": {
-    "php": "^8.2",
+    "php": "^8.3",
     "barryvdh/laravel-dompdf": "^3.1",
     "inertiajs/inertia-laravel": "^2.0",
-    "laravel/framework": "^11.0",
+    "laravel/framework": "^13.0",
     "laravel/sanctum": "^4.0",
-    "laravel/tinker": "^2.9",
-    "maatwebsite/excel": "^3.1",
+    "laravel/tinker": "^3.0",
+    "maatwebsite/excel": "^4.0",
     "tightenco/ziggy": "^2.0"
 },
 "require-dev": {
     "fakerphp/faker": "^1.23",
     "laravel/breeze": "^2.4",
     "laravel/pint": "^1.13",
     "laravel/sail": "^1.26",
     "mockery/mockery": "^1.6",
-    "nunomaduro/collision": "^8.0",
-    "phpunit/phpunit": "^10.5",
+    "nunomaduro/collision": "^9.0",
+    "phpunit/phpunit": "^12.0",
     "spatie/laravel-ignition": "^2.4"
 },
```

### Fase 3: Ejecutar actualización (~15 min)

```bash
composer update
```

Resolver conflictos de dependencias si los hay. Puede que `composer update` pida resolver algún conflicto — leer los mensajes con cuidado.

### Fase 4: Revisar archivos afectados (~30-60 min)

```
1. ☐ app/Exports/ReporteExcel.php
   → Verificar que las firmas de métodos sean compatibles con maatwebsite/excel v4
   → Agregar return types si faltan (ej: `: array`, `: string`)

2. ☐ phpunit.xml
   → Verificar que la estructura es compatible con PHPUnit 12
   → La estructura actual con <source> probablemente funciona

3. ☐ bootstrap/app.php
   → Ya usa estructura moderna, probablemente sin cambios

4. ☐ config/*.php
   → Comparar con las configs de L13 por defecto (php artisan config:publish)
   → Los configs existentes deberían funcionar, pero revisar por claves nuevas
```

### Fase 5: Correr tests (~15 min)

```bash
php artisan test
```

- Corregir assertions de PHPUnit que hayan cambiado.
- Verificar que los 63 tests pasen.

### Fase 6: Verificación funcional (~30-60 min)

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan migrate:fresh --seed
npm run dev
php artisan serve
```

```
1. ☐ Login funciona
2. ☐ Registrar una denuncia nueva
3. ☐ Bandeja de admisión muestra datos
4. ☐ Dashboard carga con gráficos
5. ☐ Panel de catálogos CRUD funciona
6. ☐ Exportar reporte Excel funciona
7. ☐ Seguimiento público funciona
8. ☐ Notificaciones SSE funcionan
```

### Fase 7: Merge (~5 min)

```bash
git add .
git commit -m "chore: upgrade Laravel 11 → 13 + PHP 8.3"
git checkout main
git merge feature/laravel-13-upgrade
```

---

## 🔄 ¿Migrar ANTES o DESPUÉS de refactorizar?

> [!IMPORTANT]
> **Migrar PRIMERO, refactorizar DESPUÉS.** Las razones son:

| Factor | Migrar primero ✅ | Refactorizar primero ❌ |
|---|---|---|
| **Seguridad** | Cierras la brecha de seguridad inmediatamente | Sigues expuesto durante la refactorización |
| **Base estable** | Refactorizas sobre la versión actual del framework | Refactorizas sobre un framework obsoleto y luego migras — doble trabajo |
| **Tests** | Verificas que todo funciona con L13 antes de mover cosas | Si algo falla post-refactorización, no sabrás si fue la refactorización o la migración |
| **Tiempo** | La migración es rápida (2-4h). La refactorización es larga (días/semanas). | — |
| **Enums PHP** | L13 + PHP 8.3 tienen mejor soporte para Enums, puedes aprovecharlos al refactorizar | Con PHP 8.2 tienes Enums pero pierdes features de 8.3 |

### Orden recomendado:

```
1. 🔴 AHORA → Migrar Laravel 11 → 13 (esta semana, 2-4 horas)
2. 🟡 DESPUÉS → Refactorización del código (próximas semanas, por sprints)
   a. Dividir DenunciaController
   b. Crear Form Requests
   c. Organizar componentes frontend
   d. Crear tipos TypeScript
   e. Implementar Enums PHP 8.3
   f. Archivar docs históricos
```

---

## 📊 Resumen Final

| Pregunta | Respuesta |
|---|---|
| ¿Es viable migrar? | **Sí, altamente viable** |
| ¿Cuánto riesgo hay? | **Bajo** — tu proyecto usa patrones modernos de L11 |
| ¿A cuál versión? | **Laravel 13** (directo, sin pasar por L12) |
| ¿Requisito bloqueante? | Cambiar PHP en Laragon de 8.2 → **8.3** (ya lo tienes instalado) |
| ¿Cuánto tiempo? | **2-4 horas** (incluyendo verificación) |
| ¿Dependencia más riesgosa? | `maatwebsite/excel` 3.x → 4.x (revisar `ReporteExcel.php`) |
| ¿Orden con refactorización? | **Migrar PRIMERO**, refactorizar DESPUÉS |
| ¿Urgencia? | **Alta** — L11 lleva ~5 meses sin parches de seguridad |
| ¿Cambia React 18? | **No.** React no depende de Laravel. No necesitas React 19 |
| ¿Cambia Inertia frontend (`@inertiajs/react`)? | **No.** Solo podría cambiar el adapter backend (`inertia-laravel`) en Composer |
| ¿Necesitas Tailwind v4? | **No.** Laravel 13 no lo requiere. Tu Tailwind v3 sigue igual |
| ¿Cambia shadcn/ui? | **No.** Son archivos `.tsx` en tu proyecto, sin deps de Laravel |
| ¿Necesitas `npm install`? | **No.** `node_modules/` no se toca en absoluto |
