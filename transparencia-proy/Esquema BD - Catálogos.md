# Esquema BD — Catálogos del Sistema

> Tablas pequeñas con datos de referencia (valores fijos, <50 registros cada una).
> Se cargan vía seeders y se administran desde el Panel Administrativo (Sprint 10).

---

## 1. Tabla: `categorias_denuncia`

**Propósito:** Catálogo de tipos de faltas o delitos tipificados en la Ley 974.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `clave` | varchar(50) UNIQUE | ej: 'cohecho', 'peculado', 'malversacion' |
| `nombre` | varchar(255) | ej: "Cohecho (Soborno)" |
| `descripcion` | text nullable | MAYÚSCULAS |
| `parent_id` | int nullable FK → self(id) | Subcategorías (jerarquía) |
| `tipo_denuncia` | enum('corrupcion','negacion', 'ambos') nullable | Filtro por tipo para dropdown |
| `activa` | boolean default true | |

**Seed esperado:** ~12 registros (cohecho, concusión, malversación, negociaciones, enriquecimiento ilícito, tráfico de influencias, peculado, omisión de denuncia, incumplimiento de deberes, otro + subcategorías opcionales)

**Cardinalidad:** Self-join via `parent_id` (subcategorías ilimitadas por tipo de denuncia).

---

## 2. Tabla: `unidades_externas`

**Propósito:** Catálogo de dependencias GAMEA y entidades externas a las que la UTLCC dirige solicitudes de información (Art. 25 Ley 974).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `clave` | varchar(50) UNIQUE | ej: 'contrataciones', 'recursos-humanos' |
| `nombre` | varchar(255) | ej: "Unidad de Contrataciones" |
| `activa` | boolean default true | |

**Seed esperado:** ~13 registros (Sistemas, Adquisiciones, RRHH, Tránsito, Catastro, Obras Públicas, Ingresos, Secretaría General, Contrataciones, Hacienda, Auditoría Interna, Archivo Central, Ministerio de Justicia)

**Cardinalidad:** Referenciada por `solicitudes_informacion.unidad_destino_id`.

---

## 3. Tabla: `feriados`

**Propósito:** Días feriados nacionales y departamentales (La Paz) para el cálculo de plazos en días hábiles (Sprint 18/19).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `fecha` | date UNIQUE | Día feriado |
| `nombre` | varchar(255) | ej: "DÍA DEL ESTADO PLURINACIONAL" (MAYÚSCULAS) |
| `recurrente` | boolean default false | Si se repite cada año (solo día y mes) |

**Seed esperado:** ~15 registros/año (feriados nacionales + departamentales La Paz)

**Cardinalidad:** Independiente, consultada por helper `DiasHabiles`.

**Admin:** CRUD por el Jefe desde `/admin/feriados`.

---

## 4. Tabla: `configuracion_sistema`

**Propósito:** Parámetros clave-valor para configuración del sistema.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `clave` | varchar(100) UNIQUE | ej: 'siguiente_numero_ticket', 'anio_vigente' |
| `valor` | varchar(255) | |
| `descripcion` | text nullable | MAYÚSCULAS |
| `actualizado_por_id` | int nullable FK → `users(id)` | |
| `actualizado_at` | timestamp nullable | |

**Seed esperado:** 2-5 registros:
- `siguiente_numero_ticket` → "47" (continuación de 46 casos legacy, Sprint 23)
- `anio_vigente` → "2026"

**Admin:** Solo Jefe puede modificar desde Panel Administrativo (Sprint 23).

---

## Resumen de tablas de catálogos

| Tabla | Propósito | Registros esperados | Admin |
|-------|-----------|---------------------|-------|
| `categorias_denuncia` | Categorías y subcategorías | ~12 + hijos | Sprint 10 |
| `unidades_externas` | Unidades GAMEA externas | ~13 | Sprint 10 |
| `feriados` | Días feriados | ~15/año | Sprint 10/18 |
| `configuracion_sistema` | Parámetros del sistema | ~5 | Sprint 23 |
| **Total** | **4 tablas** | **<50 registros c/u** | |

---

> **Nota:** Los datos seed de catálogos se cargan en `database/seeders/DatabaseSeeder.php`.
> En Fase 0 (mock), estos catálogos viven en archivos PHP (`UnidadData.php`, `DenunciaData::getCategorias()`).
