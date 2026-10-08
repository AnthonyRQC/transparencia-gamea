# 05 — Matriz de perfil (Formato I · Proyecto de Grado / Trabajo Dirigido)

> Adaptada de `MATRIZ 1 PARA PERFIL.pdf` (Taller de Grado I, Ing. Fanny Helen Pérez) — **Formato I**. Si tu modalidad final es **Tesis**, pedime la versión Formato II (lleva hipótesis + diseño metodológico en vez de metodología de desarrollo).

## Datos de encabezado

| Campo | Contenido propuesto (ajustable) |
|-------|----------------------------------|
| Título del proyecto | **Desarrollo de una plataforma digital para la gestión de denuncias de corrupción y negación de información en la UTLCC del GAMEA con control de plazos de la Ley 974** |
| Objeto de investigación | El proceso de gestión de denuncias ciudadanas por corrupción y negación de acceso a la información en la UTLCC del GAMEA, mediante una plataforma digital con control de plazos en días hábiles, matriz de permisos y tablero de seguimiento |
| Modalidad | Proyecto de Grado / Trabajo Dirigido (Formato I) |
| Marco legal | Ley 974 (Arts. 20–30). Detalle en `transparencia-proy/RESUMEN LEY 974.md` |
| Sistema | Transparencia GAMEA/UTLCC — ver `transparencia-proy/pre-defensa/01-Examinacion-Sistema.md` |

> Fórmula del título (del PDF): [Desarrollo] + [plataforma digital] + [gestión de denuncias] + [UTLCC/GAMEA] + [control de plazos Ley 974]. "Plataforma digital" porque integra varios módulos y usuarios (denuncias, dashboard, reportes, notificaciones, portal). Alternativas válidas: "Solución tecnológica…" / "Módulo web…".

## Opciones de Título y Sigla (Propuestas para debate con el Tutor)

> **Criterios del Tutor y Estándar UPEA / UMSA:**
> 1. **Estructura institucional:** Ubicar la unidad y el caso al cierre: `... para la Unidad de Transparencia y Lucha Contra la Corrupción CASO: Gobierno Autónomo Municipal de El Alto`.
> 2. **Síntesis de alcance:** Evaluar acortar "corrupción y negación de información" usando *«denuncias conforme a la Ley 974»* o *«denuncias ciudadanas»* (la Ley 974 define ambos hechos, por lo que no se pierde alcance legal ni técnico).
> 3. **Seguimiento externo:** El término *«gestión y seguimiento»* da respaldo académico al portal público de consulta de estado por ticket.
> 4. **Acrónimos pronunciables:** Evitar siglas complejas de deletreo (como `SISGDP`); preferir acrónimos fonéticos según la tradición pública boliviana (*SITRAD*, *PLATRAD*, *SISDEN*).

### Banco de Opciones

| Opción | Título Propuesto | Enfoque / Justificación | Sigla Sugerida |
|--------|------------------|-------------------------|----------------|
| **A (Recomendada)** | **Plataforma digital para la gestión y seguimiento de denuncias con control de plazos conforme a la Ley 974 para la Unidad de Transparencia y Lucha Contra la Corrupción CASO: Gobierno Autónomo Municipal de El Alto** | Destaca la arquitectura moderna (portal ciudadano + dashboard interno + motor de días hábiles). Redacción balanceada y fluida. | **PLATRAD** / **PLAGED** |
| **B (Clásica UPEA/UMSA)** | **Sistema web para la gestión, seguimiento y control de plazos de denuncias ciudadanas para la Unidad de Transparencia y Lucha Contra la Corrupción CASO: Gobierno Autónomo Municipal de El Alto** | Fórmula clásica de Ingeniería de Sistemas. Muy natural y probada ante tribunales académicos. | **SITRAD** / **SISDEN** |
| **C (Enfocada en Procesos)** | **Sistema de información web para la gestión de procesos de denuncias conforme a la Ley 974 para la Unidad de Transparencia y Lucha Contra la Corrupción CASO: Gobierno Autónomo Municipal de El Alto** | Retoma la inquietud del tutor de reflejar "gestión de procesos" y marco legal, con estilo formal. | **SISDEN-974** |
| **D (Descriptiva Completa)** | **Plataforma web para la gestión y seguimiento de denuncias de corrupción y negación de información para la Unidad de Transparencia y Lucha Contra la Corrupción CASO: Gobierno Autónomo Municipal de El Alto** | Mantiene explícitos ambos tipos de denuncia si el tutor prefiere no sintetizarlos. | **SITRAD-GAMEA** |

---

## Matriz (copiable a Word)

| PROBLEMAS DE LA INVESTIGACIÓN | OBJETIVOS | METODOLOGÍA DE DESARROLLO | ÍNDICE DEL MARCO TEÓRICO | CONCLUSIÓN |
|-------------------------------|-----------|---------------------------|--------------------------|------------|
| **PROBLEMA PRINCIPAL:**<br>La UTLCC del GAMEA gestiona denuncias de corrupción y negación de información sin una herramienta centralizada que controle estados, responsables, plazos legales y evidencia documental, con riesgo de vencimientos, pérdida de trazabilidad y reportes manuales. | **OBJETIVO GENERAL:**<br>Desarrollar una plataforma digital que gestione el ciclo completo de la denuncia (registro, admisión, investigación, informe y cierre) con control de plazos de la Ley 974, matriz de permisos, notificaciones y reportes para la UTLCC del GAMEA. | **Metodología ágil iterativa por sprints** (levantamiento → diseño → implementación → pruebas → despliegue y cierre).<br>Fases:<br>1. Análisis de requerimientos Ley 974 y procesos UTLCC.<br>2. Diseño de arquitectura (monolito Laravel + Inertia + React, MySQL, máquina de estados, matriz de permisos, días hábiles).<br>3. Implementación por módulos con commits como unidades revisables.<br>4. Pruebas (suite automatizada + verificación de plazos/permisos por unidad).<br>5. Despliegue piloto y cierre con evidencia. | 1. Lucha contra la corrupción y Ley 974 (UTLCC, Arts. 20–30).<br>2. Ingeniería de software y metodologías ágiles.<br>3. Aplicaciones web (monolito Laravel + Inertia + React).<br>4. Flujos y máquinas de estado.<br>5. Plazos en días hábiles y feriados.<br>6. Control de acceso por permisos, delegaciones y auditoría.<br>7. Tableros de control y reportes (KPI, Excel/PDF).<br>8. Seguridad y confidencialidad del denunciante. | Se espera que la plataforma centralice las denuncias con ticket y expediente digital, controle los plazos legales con alertas, asegure quién puede operar cada caso, genere reportes para la MAE y el Ministerio, y ofrezca seguimiento ciudadano, mejorando eficacia, trazabilidad y transparencia de la UTLCC. |
| **PROBLEMAS SECUNDARIOS:**<br>1. Registro disperso, sin ticket único ni expediente digital con archivos.<br>2. Sin cálculo sistemático de días hábiles (fines de semana/feriados) ni alertas de mora.<br>3. Sin matriz formal de permisos/delegaciones ni bitácora auditable; riesgo de accesos y ediciones concurrentes.<br>4. Sin tablero ni reportes automáticos (Excel/PDF) ni consulta pública de seguimiento.<br><br>**FORMULACIÓN:**<br>¿Cómo mejorar la gestión de denuncias en la UTLCC del GAMEA mediante una plataforma digital que controle ciclo, plazos Ley 974, permisos y reportes? | **OBJETIVOS ESPECÍFICOS:**<br>1. Analizar el proceso Ley 974 y relevar requerimientos (admisión 5 d, información 10 d, descargo 10+5 d, cierre 45 d, remisión 2 d).<br>2. Diseñar la arquitectura (estados, permisos, días hábiles, BD, dashboard).<br>3. Implementar los módulos: registro, admisión, asignación/investigación, solicitudes/descargos, informe/cierre, delegaciones, notificaciones, archivos, dashboard/reportes y seguimiento público.<br>4. Validar con pruebas automatizadas y piloto en UTLCC (plazos, permisos, concurrencia, reportes). | (Ver columna izquierda: las 5 fases aplican a los 4 objetivos; el detalle sprint por sprint vive en `odd/tasks/` y `transparencia-proy/archivo/sprints-cerrados/`.) | (El índice cubre las 5 fases: lo legal → lo técnico → lo operativo.) | (La conclusión responde al objetivo general; cada objetivo específico se verifica con su módulo + prueba.) |

## Respaldo rápido (qué citar si el tribunal pregunta)

| Columna | Evidencia en tu repo |
|---------|----------------------|
| Plazos 5/10/10+5/45/2 d | `RESUMEN LEY 974.md:19-41`; código `DiasHabiles.php`, `Denuncia.php:80-86` |
| Ciclo y estados | `01-Examinacion-Sistema.md §1`; `EstadoDenuncia.php:7-17`; `routes/denuncias.php:39-69` |
| Permisos/delegaciones | `PermisosCatalogo.php:7-86` (66 permisos, 28 delegables); `CasoAuth.php`; `PermisosEfectivos.php` |
| Stack y porqués | `02-Tecnologias-Justificacion.md` (Laravel 13/PHP 8.3, Inertia v2, React 18+TS, MySQL, Tailwind+shadcn, Vite…) |
| Preguntas y guion | `03-Preguntas-Respuestas.md` (24) + `04-Guion-Exposicion.md` (35 min) |

## Pendiente (completar con tu tutor)

- [ ] Nombre del tutor y modalidad exacta (Proyecto / Trabajo Dirigido / Tesis).
- [ ] Título final palabra por palabra (el propuesto sigue la fórmula del PDF).
- [ ] Si es Tesis: generar versión Formato II (hipótesis Ha/H0 + diseño metodológico) — la armo en 5 min.
- [ ] Alcance piloto: ¿solo UTLCC o incluye MAE/Ministerio como actores?

## Siguiente paso

Ensayar la defensa de la matriz con `04-Guion-Exposicion.md`; si el tutor pide Formato II, pedirlo explícitamente.
