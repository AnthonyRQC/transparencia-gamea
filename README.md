# Sistema de Transparencia — UTLCC / GAMEA

Sistema web para la gestión de denuncias ciudadanas por corrupción
y negación de información, de la Unidad de Transparencia y Lucha
Contra la Corrupción (UTLCC) del Gobierno Autónomo Municipal de
El Alto (GAMEA, Bolivia). Cumple con la Ley 974.

## Funcionalidades

- Registro de denuncias con ticket de seguimiento para la ciudadanía.
- Admisión, asignación y traspaso de casos entre investigadores.
- Investigación, solicitudes de información y descargos con plazos legales.
- Ampliaciones de plazo, informes finales y cierres con archivo.
- Dashboard con KPIs operativos y reportes exportables a Excel y PDF.
- Auditoría y trazabilidad: panel técnico (`/admin/auditoria`), extractos por rol (operativo/técnico) y constancia personal de acciones.
- Seguimiento público de denuncias (ticket + token, sin cuenta).
- Notificaciones internas, catálogos administrables y muro informativo.
- Gestión de usuarios, roles y dependencias (organigrama GAMEA).

## Roles y accesos

| Rol | Acceso |
| --- | ------ |
| Administrador (Sistemas) | Usuarios, catálogos, reportes y panel técnico de auditoría (`/admin/auditoria` + extracto técnico). No tramita causas Ley 974 ni emite constancia propia. |
| Jefe de Unidad | Opera el flujo completo y administra a su equipo. |
| Investigador | Solo sus casos asignados. |
| Registrador | Registra y consulta denuncias. |
| Ciudadanía | Seguimiento público, sin cuenta. |

El acceso es con nombre de usuario (insensible a mayúsculas).
No hay auto-registro ni recuperación de contraseña: las cuentas
las crea el administrador o el jefe de unidad.

## Stack tecnológico

Laravel 13 · PHP 8.3 · Inertia.js v2 · React 18 · TypeScript ·
Tailwind CSS v3 · shadcn/ui · MySQL · Vite.

## Requisitos

- PHP 8.3 con extensiones habituales de Laravel
- Composer 2
- Node.js 18+ y npm
- MySQL 8 (Laragon en desarrollo local)
- Git

## Instalación local (Laragon)

```bash
git clone <url-del-repositorio> transparencia
cd transparencia

composer install
npm install

copy .env.example .env
php artisan key:generate
```

Configurar la base de datos en `.env` (`DB_DATABASE`, `DB_USERNAME`,
`DB_PASSWORD`) y crear la base vacía. Después:

```bash
php artisan migrate:fresh --seed
```

Levantar el entorno en dos terminales:

```bash
php artisan serve
npm run dev
```

Abrir `http://127.0.0.1:8000`. Los seeders crean usuarios y casos
de demostración.

## Despliegue

> Sección provisional: se actualizará con el procedimiento definitivo
> del servidor institucional (servidor web, certificados, colas,
> programador de tareas).

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build

php artisan migrate --force

php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Puntos a definir en el procedimiento final:

- Variables de `.env` en producción (`APP_ENV=production`,
  `APP_DEBUG=false`, `APP_URL` real, credenciales de BD y correo).
- Enlace de almacenamiento (`php artisan storage:link`) si aplica.
- Permisos de escritura en `storage/` y `bootstrap/cache/`.
- Colas y tareas programadas (si se habilitan notificaciones diferidas).
- Estrategia de seeders: solo catálogos base, sin datos de demostración.

## Comandos útiles

| Comando | Uso |
| ------- | --- |
| `npm run dev` | Servidor Vite de desarrollo |
| `npm run build` | Compilación de producción (`tsc` + Vite) |
| `php artisan serve` | Servidor Laravel local |
| `php artisan migrate:fresh --seed` | Reconstruir BD de desarrollo |
| `php artisan test` | Suite de pruebas (SQLite en memoria) |
| `php artisan cache:clear` | Limpiar caché de configuración |

## Estructura del proyecto

```text
app/Models/        Modelos Eloquent (denuncias, casos, catálogos, usuarios)
app/Queries/       Consultas complejas (dashboard, catálogos, usuarios)
app/Services/      Lógica de dominio (permisos, bitácora, archivos)
app/Http/          Controladores, requests de validación y middleware
app/Helpers/       Días hábiles (plazos legales lun–vie sin feriados)
resources/js/      Frontend React (Pages, Components, hooks, tipos)
database/          Migraciones, seeders y factories
transparencia-proy/ Documentación del proyecto y marco legal (Ley 974)
```

## Convenciones operativas

- Todos los textos libres se guardan en MAYÚSCULAS (norma institucional).
- Los plazos se calculan en días hábiles (lunes a viernes sin feriados).
- Los archivos del caso se guardan en almacenamiento privado
  (`archivos/{ticket}/`: PDF, JPG, PNG, DOCX, máx. 50 MB).
- Las categorías de denuncia se comparten desde la base de datos
  como fuente única de verdad.

## Seguridad y privacidad

- La identidad del denunciante está protegida (Ley 974, Art. 24/29).
- Bitácora append-only: los registros de auditoría no se editan ni eliminan; se captura `user_agent` (truncado a 512) y no se persiste la dirección IP.
- Exportaciones con sanitización anti-fórmulas (CWE-1236); las descargas y eliminaciones de adjuntos quedan registradas en bitácora.
- Las pruebas se ejecutan aisladas en SQLite en memoria, sin tocar
  la base de desarrollo.

## Documentación relacionada

- `transparencia-proy/AI-CONTEXT.md` — estado y mapa del proyecto
- `transparencia-proy/Plan de Desarrollo.md` — hoja de ruta
- `transparencia-proy/RESUMEN LEY 974.md` — marco legal
- `transparencia-proy/Esquema BD - Negocio.md` — tablas del dominio
- `transparencia-proy/Esquema BD - Catálogos.md` — tablas de referencia
- `PRODUCT.md` — definición del producto
- `DESIGN.md` — sistema visual (paleta, tipografías, modo oscuro)

## Uso

Sistema de uso interno institucional (UTLCC / GAMEA).
