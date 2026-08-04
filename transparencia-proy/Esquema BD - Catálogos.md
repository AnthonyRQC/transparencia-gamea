# Esquema BD — Catálogos del Sistema

> ✅ **Implementado en Sprint 10 (Julio 2026).** Datos cargados vía `CatalogoSeeder`.

> Tablas pequeñas con datos de referencia (valores fijos, <50 registros cada una).
> Se cargan vía seeders y se administran desde el Panel Administrativo (Sprint 11).

---

## 1. Tabla: `categorias_denuncia`

**Propósito:** Catálogo de tipos de faltas o delitos tipificados en la Ley 974.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `clave` | varchar(50) UNIQUE | ej: 'cohecho', 'peculado', 'malversacion' (generada desde nombre) |
| `nombre` | varchar(255) | ej: "COHECHO (SOBORNO)" |
| `descripcion` | text nullable | MAYÚSCULAS |
| `tipo_denuncia` | enum('corrupcion','negacion') | Filtro por tipo para dropdown |
| `activa` | boolean default true | |
| `fecha_desactivacion` | timestamp nullable | Se llena al desactivar |
| `desactivado_por_id` | int nullable FK → `users(id)` | |

**Seed esperado:** ~12 registros (cohecho, concusión, malversación, negociaciones, enriquecimiento ilícito, tráfico de influencias, peculado, omisión de denuncia, incumplimiento de deberes, otro)

**Nota:** No tiene `parent_id` (subcategorías jerárquicas pendientes de implementar).

---

## 2. Tabla: `dependencias_externas`

**Propósito:** Catálogo de dependencias GAMEA y entidades externas a las que la UTLCC dirige solicitudes de información (Art. 25 Ley 974).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `nombre` | varchar(255) UNIQUE | ej: "Unidad de Contrataciones" |
| `activa` | boolean default true | |
| `fecha_desactivacion` | timestamp nullable | Se llena al desactivar |
| `desactivado_por_id` | int nullable FK → `users(id)` | |

**Seed esperado:** ~13 registros (Sistemas, Adquisiciones, RRHH, Tránsito, Catastro, Obras Públicas, Ingresos, Secretaría General, Contrataciones, Hacienda, Auditoría Interna, Archivo Central, Ministerio de Justicia)

**Cardinalidad:** Referenciada por `solicitudes_informacion.unidad_destino_id`.

---

## 3. Tabla: `feriados`

**Propósito:** Días feriados nacionales y departamentales (La Paz) para el cálculo de plazos en días hábiles (Sprint 20).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `fecha` | date UNIQUE | Día feriado |
| `nombre` | varchar(255) | ej: "DÍA DEL ESTADO PLURINACIONAL" (MAYÚSCULAS) |
| `deleted_at` | timestamp nullable | SoftDeletes (desactivar/restaurar) |

**Seed esperado:** ~15 registros/año (feriados nacionales + departamentales La Paz)

**Cardinalidad:** Independiente, consultada por helper `DiasHabiles`.

**Admin:** CRUD por el Jefe desde `/admin/feriados`.

---

## 4. Tabla: `configuracion_sistema`

**Propósito:** Parámetros clave-valor para configuración del sistema. Alberga catálogos JSON (clasificaciones, tipos_denuncia, estados, medios_notificacion, tipos_prueba).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `clave` | varchar(100) UNIQUE | ej: 'catalogo_clasificaciones', 'catalogo_medios_notificacion' |
| `valor` | text | JSON serializado (catálogos: array de items con id/clave/nombre/activo) |
| `descripcion` | text nullable | MAYÚSCULAS |
| `actualizado_por_id` | int nullable FK → `users(id)` | |
| `actualizado_at` | timestamp nullable | |

**Seed esperado:** 5 registros (catálogos JSON) + parámetros del sistema:
- `catalogo_clasificaciones` → 6 items (penal, civil, administrativo, sin_indicios, medida_correctiva, archivado)
- `catalogo_tipos_denuncia` → 2 items (corrupcion, negacion)
- `catalogo_estados` → 8 items (ingresada → cerrada)
- `catalogo_medios_notificacion` → 4 items (whatsapp, email, presencial, otro)
- `catalogo_tipos_prueba` → 3 items (ARCHIVO, PRUEBA FÍSICA, TESTIGO)

**Admin:** CRUD de catálogos desde Panel Administrativo (Sprint 11). Helper: `ConfiguracionSistema::catalogItems($clave)`.

---

## Resumen de tablas de catálogos

| Tabla | Propósito | Registros esperados | Admin |
|-------|-----------|---------------------|-------|
| `categorias_denuncia` | Categorías de denuncia | ~12 | Sprint 11 |
| `dependencias_externas` | Dependencias externas | ~13 | Sprint 11 |
| `feriados` | Días feriados | ~15/año | Sprint 11 |
| `configuracion_sistema` | Catálogos JSON + parámetros | ~5 | Sprint 11 |
| **Total** | **4 tablas** | **<50 registros c/u** | |

---

> **Nota:** Los datos seed de catálogos se cargan en `database/seeders/CatalogoSeeder.php` (tablas) y `CatalogosConfigSeeder.php` (JSON config).
> Los catálogos JSON se administran desde el Panel de Catálogos (Sprint 11).
