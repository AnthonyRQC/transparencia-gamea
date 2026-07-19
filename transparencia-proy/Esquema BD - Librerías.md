# Esquema BD — Librerías Externas (generadas por paquetes)

> Este archivo documenta las tablas **generadas automáticamente** por librerías de Laravel.
> No requieren diseño manual. Se listan aquí para referencia y para separarlas del esquema de negocio.

---

## 1. Laravel Breeze (Autenticación)

**Paquete:** `laravel/breeze` (ya instalado — ver `composer.json`)

**Propósito:** Sistema de autenticación con login, registro, recuperación de contraseña y sesiones.

### Tabla: `users`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | bigint PK | Auto-incremental |
| `name` | varchar(255) | Nombre completo del usuario |
| `email` | varchar(255) | Único, login principal |
| `email_verified_at` | timestamp nullable | |
| `password` | varchar(255) | Hash bcrypt |
| `remember_token` | varchar(100) nullable | Laravel auth |
| `created_at` / `updated_at` | timestamp | |

**Campos personalizados a agregar (Sprint 14/15):**

| Columna | Tipo | Notas |
|---------|------|-------|
| `rol` | enum('registrador','jefe','tecnico') | Permisos base del sistema |
| `iniciales` | varchar(2) | Para avatares (ej: "CQ") |
| `color` | varchar(20) | Clase CSS del avatar (ej: "bg-blue-500") |
| `activo` | boolean default true | Desactivar usuarios sin eliminar historial |
| `telefono` | varchar(20) nullable | Contacto |

### Tabla: `password_reset_tokens`

| Columna | Tipo |
|---------|------|
| `email` | varchar(255) PK |
| `token` | varchar(255) |
| `created_at` | timestamp nullable |

### Tabla: `sessions`

| Columna | Tipo |
|---------|------|
| `id` | varchar(255) PK |
| `user_id` | bigint nullable FK → users(id) |
| `ip_address` | varchar(45) nullable |
| `user_agent` | text nullable |
| `payload` | longtext |
| `last_activity` | int |

> **Total Breeze:** ~4 tablas (`users`, `password_reset_tokens`, `sessions` + `personal_access_tokens` si se usa Sanctum)

---

## 2. owen-it/laravel-auditing (Auditoría)

**Paquete:** `owen-it/laravel-auditing` (a instalar en Sprint 16)

**Propósito:** Auditoría automática de cambios a nivel de campo en modelos Eloquent. Registra old_values, new_values, user, IP, URL y evento (created/updated/deleted).

### Tabla: `audits`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | bigint PK | |
| `user_type` | varchar nullable | Discriminador polimórfico |
| `user_id` | bigint nullable | FK polimórfica → usuario |
| `event` | varchar(255) | 'created', 'updated', 'deleted', 'restored' |
| `auditable_type` | varchar(255) | Modelo auditado (polimórfico) |
| `auditable_id` | bigint | ID del modelo auditado |
| `old_values` | json nullable | Valores anteriores |
| `new_values` | json nullable | Valores nuevos |
| `url` | varchar(1024) nullable | URL donde ocurrió el cambio |
| `ip_address` | varchar(45) nullable | |
| `user_agent` | text nullable | |
| `tags` | varchar(255) nullable | Para categorizar |
| `created_at` | timestamp | |

> **Total Auditing:** 1 tabla (`audits`)

---

## Resumen de tablas de librerías

| Paquete | Tablas | Instalación |
|---------|--------|-------------|
| Laravel Breeze | `users`, `password_reset_tokens`, `sessions` | ✅ Ya instalado |
| owen-it/laravel-auditing | `audits` | ⏳ Sprint 16 |
| **Total** | **~5 tablas** | Generadas automáticamente |

---

> **Nota:** No hay que diseñar ni migrar estas tablas manualmente. Los paquetes generan sus propias migraciones al ejecutar `php artisan migrate`. En Sprint 14 se extiende la tabla `users` con una migración adicional para agregar `rol`, `iniciales`, `color` y `activo`.
