# Guia - Instalacion Local del Proyecto

## Prerrequisitos
- PHP 8.2+ con extensiones: mbstring, xml, curl, zip, mysql, gd
- MySQL 8.x (Laragon recomendado)
- Node.js 18+ con npm
- Composer
- Git

## Pasos de Instalacion

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPO>
cd transparencia
```

### 2. Crear archivo `.env`
Copiar `.env.example` y configurar los valores de MySQL de tu equipo:
```bash
cp .env.example .env
```

Editar `.env` con estos valores (ajustar segun tu instalacion de MySQL):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=transparencia
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Generar APP_KEY
```bash
php artisan key:generate
```

### 4. Importar base de datos desde backup
Colocar el archivo `backup-transparencia-2026-08-04.sql` en el raiz del proyecto y ejecutar:
```bash
mysql -h 127.0.0.1 -P 3306 -u root transparencia < backup-transparencia-2026-08-04.sql
```

> **Nota:** Si MySQL tiene contrasena, agregar `-p` y sera pedido por consola.

### 5. Verificar migraciones (opcional)
```bash
php artisan migrate:status
```
Si hay migraciones pendientes, ejecutar:
```bash
php artisan migrate
```

### 6. Limpiar cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

### 7. Iniciar servidores
En una terminal:
```bash
php artisan serve
```

En otra terminal:
```bash
npm run dev
```

### 8. Acceder
Abrir en el navegador: `http://localhost:8000`

## Usuarios de Prueba

| Usuario     | Contrasena | Rol            |
|-------------|------------|----------------|
| jefe        | demo123    | Jefe de Unidad  |
| registrador | demo123    | Registrador    |
| tecnico1    | demo123    | Tecnico        |
| tecnico2    | demo123    | Tecnico        |
| tecnico3    | demo123    | Tecnico        |

> Todos los usuarios usan `username` (case-sensitive) para login.

## Datos Incluidos en el Backup
- 12 categorias de denuncia
- 177 dependencias externas
- 15 feriados
- 6 configuraciones del sistema (1 parametro + 5 catalogos JSON)
- 5 usuarios de prueba
- 12 denuncias demo (DEN-2026-0001 a 0012)
- 5 notificaciones demo

## Problemas Comunes

### Error "SQLSTATE[HY000] could not connect"
- Verificar que MySQL este corriendo (Laragon)
- Revisar `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` en `.env`

### Error "APP_KEY not set"
```bash
php artisan key:generate
```

### Error "No such file or directory" al importar backup
- Verificar la ruta al archivo `.sql`
- Usar ruta absoluta si es necesario

### Error "Access denied for user"
- Verificar credenciales de MySQL
- Si no hay contrasena, asegurarse de que `DB_PASSWORD=` este vacio

### Error de permisos en storage
```bash
chmod -R 775 storage bootstrap/cache
```

### Tabla no existe despues de importar
```bash
php artisan migrate
```

## Comandos Utiles
```bash
php artisan migrate:fresh --seed    # Reset completo de BD (SOLO DESARROLLO)
php artisan test                    # Ejecutar tests
php artisan cache:clear             # Limpiar cache
php artisan config:clear            # Limpiar config
php artisan route:list              # Listar rutas
```

## Estructura del Proyecto
```
transparencia/
├── app/
│   ├── Data/           # Catalogos
│   ├── Helpers/        # UppercaseText, DiasHabiles
│   ├── Http/
│   │   └── Controllers/
│   └── Models/         # 18 modelos Eloquent
├── database/
│   ├── migrations/     # 26 migraciones
│   └── seeders/        # 5 seeders
├── resources/
│   └── js/
│       ├── Components/ # Componentes React
│       ├── hooks/      # useCan
│       └── Pages/      # Vistas
├── routes/
├── transparencia-proy/ # Documentacion
└── .env.example
```
