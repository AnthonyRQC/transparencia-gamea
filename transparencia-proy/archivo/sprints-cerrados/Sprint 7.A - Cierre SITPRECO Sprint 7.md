> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 7.A â€” Cierre SITPRECO Sprint 7 (NUEVO â€” Julio 2026) â³ URGENTE

**Objetivo:** Ajustar el bloque SITPRECO del Sprint 7 al nuevo lineamiento del cliente. Eliminar toda referencia a "SITPRECO obligatorio al admitir" y "SITPRECO heredado en cierre". Agregar SITPRECO opcional en `ModalRechazo`.

**Origen:** DecisiÃ³n del cliente Julio 2026 â€” el SITPRECO es un cÃ³digo del sistema externo SITPRECO que puede tardar; pedirlo al admitir genera burocracia innecesaria.

**EstimaciÃ³n:** 1-2 dÃ­as. Cambios pequeÃ±os.

---

## 1. Contexto

### 1.1 SituaciÃ³n actual (post-Sprint 7 cerrado)
- El Sprint 7 planificÃ³ SITPRECO **obligatorio al admitir**, **opcional al rechazar**, y **read-only heredado en cierre**.
- Sin embargo, en la prÃ¡ctica operativa del UTLCC, el cÃ³digo SITPRECO del sistema externo puede tardar varios dÃ­as.
- Pedirlo en admisiÃ³n bloquea el flujo del caso.

### 1.2 Nueva decisiÃ³n (Julio 2026)
- **SITPRECO NO se pide al admitir.** El caso puede pasar a `admitida` sin SITPRECO.
- **SITPRECO se mantiene en el informe final** (donde ya estaba desde Sprint 5), con su propio campo.
- **SITPRECO se agrega opcional al rechazar** (Ãºnica instancia en la que se puede capturar fuera del informe).

### 1.3 Diagrama del nuevo flujo SITPRECO

```
[Registrador registra] â†’ ingresada
                              â”‚
                              â”œâ”€â†’ [Jefe admite] â†’ admitida  (NO pide SITPRECO)
                              â”‚
                              â””â”€â†’ [Jefe rechaza] â†’ rechazada (SITPRECO opcional)
                                                                  â”‚
                                                                  â””â”€â†’ si hay SITPRECO, se guarda en `denuncias.sitpreco_rechazo`

(...)
                              â”‚
                              â””â”€â†’ [TÃ©cnico redacta Informe Final] â†’ informe
                                                                       â”‚
                                                                       â””â”€â†’ SITPRECO se captura en FormInformeFinal (Ãºnica instancia formal)
```

---

## 2. Cambios a realizar

### 2.1 Frontend

#### `resources/js/Components/Denuncias/ModalRechazo.tsx` (modificar)
- **Agregar** input opcional `sitpreco_rechazo` despuÃ©s del textarea de justificaciÃ³n interna.
- Comportamiento:
  - Label: "SITPRECO (opcional)"
  - Sin required, sin hint de formato
  - Texto libre, max 50 caracteres
  - Helper text: "CÃ³digo del sistema SITPRECO si estÃ¡ disponible al momento del rechazo"
- **Estilo:** MAYÃšSCULAS con `text-transform: uppercase` (consistente con Sprint 7.5)
- **NO cambiar** el resto del modal (justificaciÃ³n obligatoria, resumen pÃºblico opcional)

#### `resources/js/Components/Denuncias/ModalAdmision.tsx` (NO TOCAR)
- Queda como estÃ¡. Sin input SITPRECO.

#### `resources/js/Components/Denuncias/FormCierre.tsx` (NO TOCAR)
- Queda como estÃ¡. Sin SITPRECO heredado de admisiÃ³n.

### 2.2 Backend

#### `app/Http/Controllers/DenunciaController.php` (modificar `rechazar`)
- Agregar validaciÃ³n:
  ```php
  'sitpreco' => 'nullable|string|max:50',
  ```
- Pasar `sitpreco` al mÃ©todo `DenunciaData::rechazar()`.

#### `app/Data/DenunciaData.php` (modificar `rechazar`)
- Agregar parÃ¡metro opcional `?string $sitpreco = null`.
- Si viene, guardar en `denuncia.sitpreco_rechazo`.

#### `app/Http/Controllers/DenunciaController.php` (`admitir`) (NO TOCAR)
- Queda como estÃ¡. Sin SITPRECO.

### 2.3 Base de datos (Sprint 10)

#### `denuncias` (modificar tabla)
- Agregar columna `sitpreco_rechazo` (TEXT 50, NULLABLE).
- Ver `Esquema de Base de Datos.md` â†’ tabla `denuncias` â†’ campo `sitpreco_rechazo`.

---

## 3. VerificaciÃ³n de cierre

### 3.1 Casos de prueba manuales

| Caso | Pasos | Resultado esperado |
|------|-------|---------------------|
| 1. Rechazar con SITPRECO | Click "Rechazar" â†’ Llenar justificaciÃ³n â†’ Llenar SITPRECO â†’ "Rechazar" | Denuncia pasa a `rechazada`, `sitpreco_rechazo` guardado |
| 2. Rechazar sin SITPRECO | Click "Rechazar" â†’ Llenar justificaciÃ³n â†’ Dejar SITPRECO vacÃ­o â†’ "Rechazar" | Denuncia pasa a `rechazada`, `sitpreco_rechazo = null` |
| 3. Admitir (sin SITPRECO) | Click "Admitir" â†’ JustificaciÃ³n opcional â†’ "Admitir" | Denuncia pasa a `admitida`, ningÃºn campo SITPRECO tocado |
| 4. Cierre (sin SITPRECO heredado) | Caso avanzado a cierre â†’ Abrir FormCierre | NO aparece SITPRECO heredado; usa su propio `cierre_sitpreco` si existe |
| 5. Informe Final (SITPRECO formal) | Caso en `informe` â†’ Redactar Informe Final | Aparece input SITPRECO como siempre (Sprint 5) |

### 3.2 VerificaciÃ³n de docs
- âœ… `Sprint 7 - EvaluaciÃ³n TÃ©cnica Previa.md` â€” decisiones 5, 6, 7, 12 revocadas, nueva secciÃ³n "Nuevo lineamiento SITPRECO"
- âœ… `AI-CONTEXT.md` â€” Sprint 7 marcado cerrado
- âœ… `Plan de Desarrollo.md` â€” Sprint 7 cerrado, Sprint 7.A documentado
- âœ… `Sprints Pendientes - Contexto.md` â€” Sprint 7.A creado
- âœ… `Esquema de Base de Datos.md` â€” campo `sitpreco_rechazo` agregado

---

## 4. Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `resources/js/Components/Denuncias/ModalRechazo.tsx` | +input SITPRECO opcional |
| `app/Http/Controllers/DenunciaController.php` | `rechazar()` acepta `sitpreco` opcional |
| `app/Data/DenunciaData.php` | `rechazar()` guarda `sitpreco_rechazo` |

**NO se tocan:** `ModalAdmision.tsx`, `FormCierre.tsx`, ningÃºn otro.

---

## 5. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | SITPRECO NO se pide al admitir | Mantener obligatorio | El sistema externo puede tardar; pedirlo genera bloqueo |
| 2 | SITPRECO opcional al rechazar | Siempre opcional o siempre obligatorio | El rechazo puede o no tener SITPRECO disponible |
| 3 | SITPRECO se mantiene en Informe Final (Sprint 5) | Quitarlo | Es la Ãºnica instancia formal del cÃ³digo |
| 4 | NO hay SITPRECO heredado en cierre | Heredar de admisiÃ³n | Ya no se pide al admitir, no hay quÃ© heredar |
| 5 | Input SITPRECO en rechazo: max 50, sin hint | Mostrar placeholder | Consistencia con Sprint 5 y Sprint 7 original |

---

## 6. Cierre

Al cerrar Sprint 7.A, Sprint 7 queda **completamente cerrado al 100%** y se puede proceder con los siguientes sprints urgentes:
1. **Sprint 7.5** â€” Ajustes UX Urgentes pre-cliente
2. **Sprint 7.6** â€” Repositorio de Archivos del Caso
3. **Sprint 7.7** â€” BÃºsqueda y Consulta para Registrador

---
*Documento creado: Julio 2026. Sprint 7.A del Sprint 7.*

