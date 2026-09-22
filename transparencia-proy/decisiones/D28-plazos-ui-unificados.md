# D28 — Semántica de plazos unificada y compilación de clases en `.ts`

## 1. Contexto

La auditoría UI del 22-sep-2026 encontró tres problemas en la semántica de
plazos: (a) tres copias de los umbrales de color (`Denuncia.php:118-123` usaba
rojo ≤3 / amarillo ≤8; `SolicitudInformacion.php:82` y `Descargo.php:85` usaban
rojo <0 / amarillo ≤5); (b) textos ambiguos ("45 d en plazo" sin decir que son
días hábiles); (c) las franjas laterales amarilla y verde no se veían porque
`tailwind.config.js` solo escaneaba `**/*.tsx` y `semantica.ts` es un `.ts`:
sus clases nunca se compilaban (evidencia: `border-l-yellow-500` y
`border-l-teal-600` ausentes del CSS compilado; `border-l-destructive`
sobrevivía solo por una mención literal en `DesignSystem.tsx`).

## 2. Opciones (con ventajas y desventajas)

- Opción A: Unificar a una sola escala (rojo ≤3, amarillo ≤8) en un helper backend, textos explícitos en "días hábiles", fecha estimada visible y arreglo del escaneo de Tailwind. Ventaja: una sola fuente de verdad y guía visual consistente. Desventaja: cambia el color de solicitudes/descargos en los tramos 0–3 (pasa a rojo) y 6–8 (pasa a amarillo).
- Opción B: Mantener escalas por tipo de plazo (denuncia larga vs. solicitud corta) y arreglar solo el build y los textos. Ventaja: cero cambio de comportamiento. Desventaja: tres semánticas distintas para el mismo semáforo; la inconsistencia que motivó la revisión persiste.
- Opción C: Llevar los umbrales a configuración en base de datos. Ventaja: ajustables sin deploy. Desventaja: configurabilidad sin caso de uso (nadie pidió cambiar umbrales por pantalla), complica tests y agrega superficie.

## 3. Decisión

Opción A, vigente desde el 22-sep-2026. Alcance: color visual de plazos de
`Denuncia`, `SolicitudInformacion` y `Descargo` vía
`DiasHabiles::colorPlazo()` (`UMBRAL_ROJO = 3`, `UMBRAL_AMARILLO = 8`;
negativos y 0 cuentan como rojo). Tailwind escanea `resources/js/**/*.{ts,tsx}`.
Quedan **fuera** de la unificación, por ser métricas distintas y no colores:
`KpiQuery` (contador "vencen en 5 días o menos", rótulo propio) y
`AlertasPlazo` (umbrales de notificación configurables por usuario, 0–10).

## 4. Por qué no las otras

- B: deja tres semánticas para el mismo semáforo; el pedido explícito fue estandarizar y el costo del cambio (tests verdes, sin migración) es bajo.
- C: los umbrales son política de urgencia, no dato de negocio; agregar configurabilidad sin caso de uso complica sin beneficio. Si se retoma, partir de `DiasHabiles::colorPlazo()`.

## 5. Consecuencias

- Un solo lugar cambia el color del semáforo; solicitud/descargo ahora marcan rojo a ≤3 días hábiles y amarillo ≤8 (cambio intencional, suite verde).
- `semantica.ts` compila completo: se recuperaron 5 clases que faltaban (`border-l-teal-600`, `border-l-yellow-500`, `dark:border-l-teal-400`, `dark:border-l-yellow-400`, `dark:border-l-destructive`); el amarillo de borde se alineó a `amber` para igualar el badge.
- Etiquetas explícitas "días hábiles" en badge, tooltip, helpers y textos backend; fecha de vencimiento visible en tarjeta (solo amarillo/rojo) y en la ficha del caso como "estimada (sin nuevas ampliaciones)".
- Deuda: si se quiere la fecha como compromiso legal exacto (no estimada), definir con el cliente el efecto de ampliaciones y reaperturas.

## Lista de aceptación

- [x] Los 5 campos están completos y son verificables.
- [x] Las opciones incluyen ventajas y desventajas.
- [x] La decisión indica fecha y alcance.
- [x] El documento evita datos no confirmados.
- [x] La fila correspondiente existe en `Indice.md`.

## Evidencia

- Commits: `aa1a324` (Tailwind `.ts`), `37403d0` (helper + textos), `7a29c94` (copy frontend), `b81cfcc` (fecha visible), `9ad49c6` (evidencia).
- Suite completa: `php artisan test` → 187 passed (1325 assertions), 22-sep-2026.
- Build: `npm run build` OK; auditoría de clases `semantica.ts` 44/44 y `bandeja/tipos.ts` 15/16 (la restante es un import, no una clase) contra el CSS compilado.
