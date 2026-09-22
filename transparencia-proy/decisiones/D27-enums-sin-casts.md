# D27 — Enums de dominio sin casts de modelo

## 1. Contexto

Los estados y tipos del dominio viven como enums string de PHP (`app/Enums/`:
`EstadoDenuncia`, `TipoDenuncia`, `EscenarioDenuncia`, `RolUsuario`) mientras sus
columnas en MySQL son `string` (`denuncias.estado/tipo/escenario/subestado`,
`users.rol`, `categorias_denuncia.tipo_denuncia`). No se usa `ENUM` nativo (0
ocurrencias de `->enum(` en las 40 migraciones) ni casts de Eloquent.

La auditoría del 22-sep-2026 encontró 3 brechas, ya corregidas en la rama
`fix/enums-roles-paridad`: `RolUsuario` sin el caso `admin` (rol real del
sistema), validaciones con literales duplicados, y ausencia de test de
paridad enum ↔ catálogo ↔ TypeScript. Restaba decidir si agregar **casts de
modelo** (`'estado' => EstadoDenuncia::class`).

## 2. Opciones (con ventajas y desventajas)

- Opción A: Mantener columnas `string` + enums PHP como vocabulario + `Rule::enum()` en validación, **sin casts**. Ventaja: cero riesgo de regresión y valores legibles en BD y auditoría. Desventaja: las comparaciones siguen contra `->value`, sin tipado en propiedades.
- Opción B: Agregar casts de enum en los modelos. Ventaja: propiedades tipadas (`$d->estado instanceof EstadoDenuncia`). Desventaja: invierte de forma atómica 41 comparaciones string en `app/` (35 sobre campos de `Denuncia`), en controladores, queries y exportes.
- Opción C: Migrar estados y roles a `ENUM` nativo de MySQL o a tablas con FK. Ventaja: integridad a nivel de base de datos. Desventaja: los estados llevan comportamiento (guardas, transiciones `can:`, `terminales()`, plazos); SQLite `:memory:` de los tests no soporta ENUM nativo y cada valor nuevo exigiría migración.

## 3. Decisión

Opción A, vigente desde el 22-sep-2026. Alcance: los 4 enums de dominio y sus
columnas string asociadas. Los catálogos dinámicos (`clasificaciones`,
`medios_notificacion`) ya usan FK reales desde la reestructuración de agosto
2026 y quedan fuera. La opción B queda **diferida** como refactor planificado
con inventario levantado; no se ejecuta antes de la pre-defensa.

## 4. Por qué no las otras

- B: el costo (41 comparaciones en 17 archivos, migración atómica) no aporta
  valor funcional inmediato y arriesga la entrega. La garantía de fuente única
  para validación ya la dan `Rule::enum()` y el test de paridad. Requisito
  bloqueante si se retoma: migrar todas las comparaciones en el mismo commit,
  correr la suite completa y actualizar este ADR.
- C: la máquina de estados vive en código con guardas y transiciones; moverla
  a datos la deja sin compilador que la cuide. Además rompe los tests en SQLite
  y agrega una migración por cada valor nuevo.

## 5. Consecuencias

- Validación como fuente única vía `Rule::enum()` en `DashboardRequest`,
  `StoreDenunciaRequest` y `CatalogoRules`; `RolUsuario` completo con `admin` y
  helpers de `User` (`esJefe/esInvestigador/esRegistrador/esAdmin`) unificados
  contra `->value`.
- `tests/Feature/EnumsParidadTest.php` falla si enum, semilla `catalogo_*` o
  constante TS (`estados.ts`, `permissions.ts`, `types/denuncia.ts`) se
  desincronizan: un valor nuevo exige tocar las tres copias.
- Deuda registrada: (a) casts de modelo (Opción B) con inventario de 41 puntos;
  (b) `activo=false` en `catalogo_estados`/`catalogo_tipos_denuncia` no se
  aplica en validación — pendiente de decisión (o se respeta o se retira).

## Lista de aceptación

- [x] Los 5 campos están completos y son verificables.
- [x] Las opciones incluyen ventajas y desventajas.
- [x] La decisión indica fecha y alcance.
- [x] El documento evita datos no confirmados.
- [x] La fila correspondiente existe en `Indice.md`.

## Evidencia

- Brechas corregidas: commits `49af91f` (ADMIN), `e52c562` (Rule::enum),
  `9dd7822` (paridad), `96209f1` (helpers), `b52d29a` (ROLES + paridad).
- Suite completa: `php artisan test` → 185 passed (1310 assertions), 22-sep-2026.
- Inventario de no-casts: grep de comparaciones `===/!==` sobre
  `estado/tipo/escenario/subestado` en `app/`.
