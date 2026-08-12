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

**Propósito:** Catálogo del organigrama GAMEA 2026 (dependencias internas del municipio) al que la UTLCC dirige solicitudes de información (Art. 25 Ley 974). Estructura **jerárquica en árbol** para consultas por nivel (unidad → dirección → secretaría → Gestión Institucional → GAMEA).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `nombre` | varchar(255) UNIQUE | ej: "Unidad de Contrataciones" |
| `parent_id` | int nullable FK → `dependencias_externas(id)` | Nodo padre en el árbol. `NULL` = raíz (GAMEA) |
| `activa` | boolean default true | |
| `fecha_desactivacion` | timestamp nullable | Se llena al desactivar |
| `desactivado_por_id` | int nullable FK → `users(id)` | |

**Índice:** `parent_id` (recorrido de árbol y roll-up).

**Seed esperado (Agosto 2026):** ~185 registros construidos desde el organigrama oficial:

```
GOBIERNO AUTÓNOMO MUNICIPAL DE EL ALTO (raíz, parent_id = null)
└── DESPACHO ALCALDE
    ├── [5 dependencias directas + 4 direcciones directas]
    ├── SECRETARÍA MUNICIPAL DE GESTIÓN INSTITUCIONAL
    │   ├── TERMINAL METROPOLITANA DE EL ALTO
    │   ├── DIRECCIÓN DE ATENCIÓN CIUDADANA → 4 unidades
    │   ├── DIRECCIÓN DE ALUMBRADO PÚBLICO → 2 unidades
    │   └── [las demás secretarías → direcciones → unidades]
    └── SUBALCALDÍAS MUNICIPALES → 14 subalcaldías (sin unidades internas)
```

**Reglas:**
- Gestión Institucional (ex Secretaría General) es padre de las demás secretarías.
- No se incluyen entidades externas (ej. Ministerio de Justicia fue eliminado).
- Validación **anti-ciclos** al mover un nodo (no puede ser padre de sí mismo ni de un descendiente).
- Los nombres almacenados son solo el nodo hoja (sin el prefijo de ruta).

**Cardinalidad:** Referenciada por `solicitudes_informacion.dependencia_destino_id`.

**Admin:** Panel de Catálogos con **vista de árbol** expandible y mover vía "Dependencia padre".

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

**Propósito:** Parámetros clave-valor para configuración del sistema. **Tras la reestructuración de Agosto 2026** solo conserva 2 catálogos JSON de referencia interna (el resto migró a tablas propias).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `clave` | varchar(100) UNIQUE | ej: 'catalogo_estados', 'catalogo_tipos_denuncia', 'siguiente_numero_ticket' |
| `valor` | text | JSON serializado (catálogos: array de items con id/clave/nombre/activo) |
| `descripcion` | text nullable | MAYÚSCULAS |
| `actualizado_por_id` | int nullable FK → `users(id)` | |
| `actualizado_at` | timestamp nullable | |

**Catálogos JSON vigentes (Agosto 2026):**
- `catalogo_estados` → 8 items (ingresada → cerrada) — solo-edición en panel
- `catalogo_tipos_denuncia` → 2 items (corrupcion, negacion) — solo-edición en panel

> ⚠️ **Eliminados de config (Agosto 2026):** `catalogo_clasificaciones`,
> `catalogo_medios_notificacion` y `catalogo_tipos_prueba` pasaron a tablas propias o
> se eliminaron (ver secciones 5 y 6).

---

## 5. Tabla: `clasificaciones` (nueva — Agosto 2026)

**Propósito:** Clasificaciones finales del Informe Final (Art. 26 Ley 974). Antes vivía como JSON en `configuracion_sistema`; ahora es tabla con FK para consultas en tiempo real del dashboard ("casos por clasificación").

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `clave` | varchar(50) UNIQUE | ej: 'penal', 'civil', 'administrativo', 'sin_indicios', 'medida_correctiva', 'archivado' |
| `nombre` | varchar(255) | MAYÚSCULAS |
| `descripcion` | text nullable | MAYÚSCULAS |
| `activa` | boolean default true | |
| `fecha_desactivacion` | timestamp nullable | Soft-deactivate |
| `desactivado_por_id` | int nullable FK → `users(id)` | |

**Protección:** `PROTECTED_CLASIFICACIONES = ['penal','civil','administrativo','sin_indicios','medida_correctiva','archivado']` no se pueden desactivar. Las no protegidas pueden desactivarse incluso en uso (el histórico se preserva vía FK).

**Cardinalidad:** Referenciada por `informes_finales.clasificacion_id`.
**Admin:** Panel de Catálogos (toggle activar/desactivar).
**Seed:** 6 registros en `CatalogoSeeder`.

---

## 6. Tabla: `medios_notificacion` (nueva — Agosto 2026)

**Propósito:** Medios de notificación del cierre (`FormCierre`). Antes JSON en `configuracion_sistema`; ahora tabla con FK para reportes "cierres por medio".

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | int PK | |
| `clave` | varchar(50) UNIQUE | ej: 'whatsapp', 'email', 'presencial', 'otro' |
| `nombre` | varchar(255) | MAYÚSCULAS |
| `activa` | boolean default true | |
| `fecha_desactivacion` | timestamp nullable | Soft-deactivate |
| `desactivado_por_id` | int nullable FK → `users(id)` | |

**Cardinalidad:** Referenciada por `cierres.notificacion_medio_id`.
**Admin:** Panel de Catálogos (toggle activar/desactivar).
**Seed:** 4 registros en `CatalogoSeeder`.

---

## Resumen de tablas de catálogos

| Tabla | Propósito | Registros esperados | Admin |
|-------|-----------|---------------------|-------|
| `categorias_denuncia` | Categorías de denuncia | ~12 | Panel Catálogos |
| `dependencias_externas` | Organigrama GAMEA en árbol | ~185 | Panel Catálogos (vista árbol) |
| `feriados` | Días feriados | ~15/año | Panel Catálogos |
| `clasificaciones` | Clasificaciones del informe final | 6 | Panel Catálogos |
| `medios_notificacion` | Medios de notificación del cierre | 4 | Panel Catálogos |
| `configuracion_sistema` | Catálogos JSON internos (estados, tipos) + params | ~3 | Panel Catálogos |
| **Total** | **6 tablas** | | |

---

> **Nota:** Los datos seed de catálogos se cargan en `database/seeders/CatalogoSeeder.php`
> (tablas) y `CatalogosConfigSeeder.php` (solo `catalogo_estados` y `catalogo_tipos_denuncia`).
> Los catálogos JSON se administran desde el Panel de Catálogos (Sprint 11).
> Los catálogos basados en tablas (categorías, dependencias, feriados, clasificaciones,
> medios) usan soft-deactivate (`activa = false` + `fecha_desactivacion`).
