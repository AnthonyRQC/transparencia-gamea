# Sprint 13 — Portal Panel Informativo (Plan)

> **Estado:** PLANIFICADO (no ejecutado) · **Fecha plan:** 09-sep-2026 ·
> **Congelado:** D8 10-sep-2026 (ver `Decisiones 12.5 - 13 (Log).md`) — sin dudas abiertas.
> **Origen:** digitalizar el panel físico colgado afuera de la UTLCC (hojas de avisos:
> instructivos generales, respuestas a notas de otras unidades/direcciones/dependencias,
> notificaciones a denunciantes, comunicados a la población y de la unidad).
> **Reemplaza:** `Sprints Pendientes - Contexto.md` § Sprint 13 viejo
> (TableroCasosCerrados mínimo) — queda como DEPRECATED, se conserva por historia.
> **Referencia visual (guía, NO importar):** `portal-informativo/vista-externa/` (muro)
> + `portal-informativo/posible-form/` (editor). Ver `portal-informativo/README.md`.
> **Decisiones previas:** ver `Decisiones 12.5 - 13 (Log).md`.

## 1. Principios (cerrados 09-sep-2026)

1. **Todo público y anonimizado**, como la hoja pegada: `DEN-2026-XXXX parcial`,
   `identidad reservada del caso N`, nunca el PIN de 4 dígitos (queda solo en
   `/seguimiento` privado) ni PII (denunciante, denunciados, hechos, token).
2. **Muro unidireccional, no red social:** sin comentarios/likes. Tablón paginado
   con filtros, + historial/archivo por vigencia.
3. **Dos carriles:** generales = formulario email simple; casos = publicación
   estructurada vinculada a denuncia (más trabajo, §4).
4. **Tipos como catálogo BD** (no enum): si a mitad del sprint cambian los tipos,
   es un insert, no una migración.
5. **Detalle legal en el PDF**, no en el muro: el cuerpo del muro es breve;
   el documento adjunto lleva el contenido formal.
6. **Adaptar a `DESIGN.md`** (Outfit + morado `#1E0A33`/gold + shadcn + lucide +
   dark `.dark`), nunca importar el HTML de referencia (CDN Tailwind, `Public Sans`,
   navy/teal, Material Symbols).

## 2. Cortes de ejecución

| Corte | Contenido | Reusa |
|---|---|---|
| **13.1 Muro público + catálogos** | Sección en Welcome bajo consulta (info/preguntas al final): grid filtrable (tipo + texto + fecha, server-side) + cards por tipo + `Paginacion server` (6-9 por página) + botón en `/seguimiento` ("ver avisos de mi caso" → `?buscar=` parcial, sin PIN). Migración + seed `tipos_publicacion` (7) y `prioridades_publicacion` (3) + 2 pestañas en Panel Catálogos | `R1.1 semantica` (chips/badges), `R1.2 fechas`, `R1.4 Paginacion`, `ListaVacia` |
| **13.2 Generales (email simple)** | Página `/admin/publicaciones` (Jefe + Registrador): tabla con flechas para `orden` de fijadas + form (tipo, prioridad, CITE, fecha_doc, emisor default UTLCC, destinatario, ref/título, resumen, cuerpo, PDF opcional + warning `ConfirmDialog`, referencia_externa). Regla: exige `cuerpo o PDF` | `R1.5 ConfirmDialog`, `PageHeader`, `helpers/fechas.ts` |
| **13.3 Casos (estructurada)** | Checkbox default-on en `ModalAdmision`/`ModalRechazo` + borrador auto en cierre (evento admitida/rechazada/cerrada) → borrador editable (downgrade destinatario, PDF, referencia_externa) → publica Jefe o Registrador. Unicidad (denuncia,evento) → banner Sheet + badge "Sin aviso". Publicado editable con fecha de actualización | `SeguimientoController`, `TableroCasosCerrados` (13-viejo como base del query) |

## 3. Modelo BD (propuesta mínima)

```
tipos_publicacion        — catálogo (clave UNIQUE, nombre MAYÚSCULAS, activa,
                           fecha_desactivacion, desactivado_por_id). Seed (7):
                           admitida, rechazada, cierre_caso, instructivo,
                           respuesta_nota, comunicado, otro.
prioridades_publicacion  — catálogo (ordinario, prioritario, urgente; protegidas).
publicaciones            — id, tipo_id FK, prioridad_id FK, cite (texto libre,
                           searchable), fecha_documento date, emisor (texto,
                           default UTLCC), destinatario_display (texto),
                           ref_titulo (máx 140), resumen nullable,
                           cuerpo nullable, denuncia_id nullable FK → denuncias,
                           evento nullable (admitida/rechazada/cerrada),
                           publicado_por_id FK → users, publicado_at,
                           fijada bool default false, orden int default 0,
                           UNIQUE (denuncia_id, evento) donde aplica.
publicacion_archivos     — id, publicacion_id FK, path (disco PÚBLICO),
                           mime (pdf/jpg/png), tamano, hash SHA256.
```

> **Notas:** `denuncia_id` + `evento` permiten N avisos por caso (unicidad =
> indicador "sin aviso"). `referencia_externa` va en `ref_titulo`/`resumen`
> (texto libre: SIPRECO/RA/CITE/HR, sin validación). Adjuntos en disco
> público (distinto de `denuncias_archivos`, que es privado). Límite sugerido:
> 20 MB, máx 3-5 archivos. Muro permanente (sin `vence_at`, sin archivo):
> fijadas por `orden` manual, resto por `publicado_at` desc. Tipos/prioridades
> se gestionan en Panel Catálogos (7 → 9 pestañas, mismo patrón que
> `clasificaciones`/`medios_notificacion`).

## 4. Whitelist de anonimización (muro + PDFs listados)

**Permitido:** ticket DEN completo (`DEN-2026-0001`, sin PIN en ningún lado), tipo denuncia, evento/estado,
clasificación final (si cerrada), fechas publicación/cierre, dependencia emisora,
radicado/expediente del aviso.
**Prohibido:** denunciante, denunciados, hechos, token/PIN, archivos privados del caso.

## 5. Validaciones

- `ref_titulo` requerido, máx 140. `tipo_id` + `prioridad_id` requeridos.
- `cuerpo` o ≥1 adjunto requerido (uno de los dos) + warning si no hay PDF.
- `denuncia_id` solo con `tipo` de caso + `evento` válido (admitida/rechazada/cerrada).
- Publican Jefe + Registrador (frontend `useCan`, formal en Sprint 16); trazabilidad
  en `publicado_por_id`. Sin `vence_at`: muro permanente.
- Ticket DEN completo visible y buscable (sin PIN en ningún lado).

## 6. Gates por corte (igual que 12.5)

`tsc` exit 0 + `vite build` OK + `php artisan test` verde + `detect` limpio en
targets + visual light/dark 1280×720. Commit por corte tras revisión del usuario.

## 7. Fuera de alcance (13.3+ o v2)

Stat-card builder, preview vivo, firma Ley 527, difusión push/WhatsApp/gaceta
automática, comentarios, suscripciones con datos personales (ver mock: solo como
idea, requiere definición legal de tratamiento de datos).

## 8. Referencias

- `portal-informativo/README.md` + `vista-externa/{code.html,DESIGN.md,screen.png}`
  + `posible-form/{code.html,DESIGN.md,screen.png}` (guía visual).
- `Decisiones 12.5 - 13 (Log).md` (por qué R1 antes, R2/backend a 21).
- `Sprint 12.5 - Plan Refactor Mantenibilidad.md` (R1 que el muro reusa).
- Ley 974: ver `RESUMEN LEY 974.md` (marco de anonimización).
