# 07 — Demo Kit (credenciales, checklist y guion de prueba)

> Para la demo ante los ingenieros y para pruebas rápidas antes de defender.
> Datos verificados contra `database/seeders/UserSeeder.php` (13 usuarios) y `DenunciaSeeder.php` (tokens 1001–1012) el 22-sep-2026.
> Instalación y problemas de entorno: ver `Guia - Instalación Local.md`. Guion de exposición: `04-Guion-Exposicion.md`.

## Credenciales (todas usan `demo123`)

| Usuario | Contraseña | Rol | Nombre |
|---|---|---|---|
| `PM4864213` | `demo123` | Jefe de Unidad | PEDRO MAMANI |
| `MG7551234` | `demo123` | Registrador | MARÍA GARCÍA |
| `CQ6123457` | `demo123` | Investigador | CARLOS QUISPE |
| `AT6123458` | `demo123` | Investigador | ANA TORRES |
| `LM6123459` | `demo123` | Investigador | LUIS MAMANI |
| `JA6123460` | `demo123` | Investigador | JORGE APAZA |
| `KV6123461` | `demo123` | Investigador | KARINA VILLCA |
| `MC6123462` | `demo123` | Investigador | MIGUEL CONDORI |
| `VM6123463` | `demo123` | Investigador | VERÓNICA MAMANI |
| `RH6123464` | `demo123` | Investigador | RODRIGO HUANCA |
| `CL6123465` | `demo123` | Investigador | CINDY LIMACHI |
| `PS6123466` | `demo123` | Investigador | PABLO SILES |
| `AS9000001` | `demo123` | Administrador (Sistemas) | ADMINISTRADOR SISTEMAS |

Notas:
- **Login case-insensitive**: `pm4864213` funciona igual que `PM4864213`.
- **Fórmula del username**: iniciales + CI (18A). Un humano = un CI = una cuenta.
- **Solo desarrollo**: estas claves viven en seeders; producción usará `AdminInicialSeeder` con password por variable de entorno (deuda B8, Sprint 21).

## URLs de acceso

| Vía | URL | Cuándo usarla |
|---|---|---|
| Configurada en `.env` (LAN) | `http://192.168.1.10/transparencia/public` | Para que los ingenieros entren desde su celular/PC en la misma red |
| `php artisan serve` | `http://localhost:8000` | Plan B si cambia la red o el IP |

> Si cambia la red del lugar de la demo, o actualizás `APP_URL` en `.env`, o usás `php artisan serve` (no depende del IP).

## Checklist pre-demo (5 minutos antes)

```bash
php artisan cache:clear
php artisan config:clear
php artisan migrate:fresh --seed   # opcional: demo fresca (124 casos, siguiente ticket 125)
npm run dev                        # o npm run build si no querés Vite corriendo
php artisan serve                  # o Laragon; verificar login con PM4864213
```

- [ ] Login del jefe entra a la Bandeja.
- [ ] Franjas de color visibles en MisCasos (rojo/ámbar/verde).
- [ ] Campana abre y muestra alertas.
- [ ] No se toca `.env` durante la demo.

## Guion por rol (qué probar con cada uno)

| Rol | Usuario | Probar | Lo que NO debe ver (también es demo) |
|---|---|---|---|
| Registrador | `MG7551234` | Registrar denuncia; Consultar casos | **Sin campana** (no tiene `notificacion.ver`) |
| Jefe | `PM4864213` | Bandeja completa: admitir/rechazar, asignar/traspasar, ampliar plazo, delegar evaluación; Reportes; Catálogos; Usuarios; Delegaciones | — |
| Investigador | `CQ6123457` | Mis Casos (solo los suyos), Mi Resumen, solicitudes/descargos, informe/cierre, archivos, campana | Sin Bandeja general |
| Admin | `AS9000001` | Usuarios, Catálogos, Reportes, Avisos | **Sin casos**: no existe bandeja ni `caso.*` para admin |

## Time Machine (solo local)

- Ruta: `/dev/tiempo` (enlace dev-only en el Sidebar).
- Sirve para **simular la fecha** y mostrar en vivo el semáforo de plazos (amarillo/rojo) y las alertas derivadas.
- Al terminar la demo: limpiar la fecha simulada desde la misma pantalla.

## Seguimiento público (ticket + token)

- URL: `/seguimiento`. Formato de entrada: `DEN-AAAA-NNNN-TOKEN`.
- Tickets demo con token simple: **`DEN-2026-0001-1001`** (los 12 primeros usan tokens `1001`–`1012`).
- Muestra estado, fechas e informe/cierre sin datos del denunciante (anonimizado).

## Checklist de features clave para mostrar

- [ ] Semáforo: franja + badge con "días hábiles" + fecha estimada en tarjetas amarillas/rojas (D28).
- [ ] Ficha del caso: "Vencimiento estimado (sin nuevas ampliaciones)".
- [ ] Campana con alertas derivadas (SSE, sin websockets).
- [ ] Archivos del caso: subir/descargar (pdf/jpg/png/docx, 50MB).
- [ ] Reportes: preview + export Excel (columnas únicas en `ReporteController`).
- [ ] Portal público: muro de publicaciones + avisos por caso.
- [ ] Delegación temporal: jefe delega evaluación y reasume (permiso efectivo = rol ∪ delegaciones).
- [ ] Admin sin casos: intentar entrar a `/denuncias` → redirige (diseño, no bug).

## Si algo falla en vivo (30 segundos por caso)

| Síntoma | Qué hacer |
|---|---|
| 403 "NO TIENES PERMISO" | Es la autorización funcionando; mostrar el `->can()` de `routes/denuncias.php:39-69` |
| Plazo no cuadra | Abrir `DiasHabiles` + tabla `feriados`; el cálculo es en días hábiles (Ley 2341) |
| Campana vacía | Es preferencia del usuario (Mi Cuenta) o rol sin permiso (registrador) |
| UI sin estilos | `npm run dev` (o `npm run build`) |
| Datos raros / demo sucia | `php artisan migrate:fresh --seed` (última opción; resetea a 124 casos) |
| Cambios de config no toman | `php artisan config:clear` + `php artisan cache:clear` |

## Enlaces

- Guion de exposición: `04-Guion-Exposicion.md`
- Preguntas ensayadas: `03-Preguntas-Respuestas.md`
- Instalación y entorno: `Guia - Instalación Local.md`
- Arquitectura para estudiar: `06-Estructura-y-Arquitectura.md`
