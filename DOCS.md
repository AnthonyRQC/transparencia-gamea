# DOCS.md — Gobierno Documental y Jerarquía de Verdad

## 1. Pirámide de Autoridad y Jerarquía de Verdad (ADR D30)

La definición y fundamentación completa de la jerarquía de verdad vive en este documento y en el [ADR D30](transparencia-proy/decisiones/D30-jerarquia-fuentes-de-verdad.md). Ante cualquier contradicción entre artefactos, prevalece el siguiente orden innegociable:

1. **Ley N° 974:** Manda sobre cualquier decisión técnica. Una discrepancia legal en código o tests es un defecto del sistema, nunca de la ley.
2. **ADRs vigentes y OpenSpec:** Contratos formales de arquitectura e intención. Cualquier desvío intencional exige un nuevo ADR.
3. **Código de producción:** Verdad operativa de facto. En dominios sin especificación formal, el código ejecutado manda provisionalmente.
4. **Tests automatizados:** Guardarraíl mecánico de no-regresión. Verifican que lo programado no se altere, pero no legislan reglas de negocio.

## 2. Capas Documentales, Dueños y Disparadores

| Capa | Archivos representativos | Dueño | Disparador de actualización |
| :--- | :--- | :--- | :--- |
| **Leyes y Fundamento** | `transparencia-proy/RESUMEN LEY 974.md` | Legal / UTLCC | Promulgación o reglamentación normativa. |
| **Decisiones y Contratos** | `transparencia-proy/decisiones/D*.md`, `openspec/` | Arquitecto / Tech Lead | Todo cambio estructural, de límites o de contrato. |
| **Glosario y Dominio** | `GLOSSARY.md` | Analista / Dominio | Aparición o aclaración de términos institucionales. |
| **Generado desde código** | `docs/ROUTES.md`, `docs/PERMISSIONS.md`, `docs/SCHEMA.md`, `docs/STATUS.md` | Tooling / Constructor | Cambio en `routes/`, migraciones o `PermisosCatalogo`. No editar a mano; se regenera con `composer docs` y se verifica con `composer docs:check`. |
| **Diseño y Producto** | `PRODUCT.md`, `DESIGN.md`, `README.md` | Producto / UI-UX | Nuevas superficies, roles o tokens visuales. |
| **Contexto Técnico Vivo** | `transparencia-proy/AI-CONTEXT.md`, `transparencia-proy/Deuda Tecnica y Riesgos.md` | Equipo de desarrollo | Cierre de fase, hallazgo o bump de dependencias. |
| **Memoria Histórica (Inmutable)** | `transparencia-proy/Plan de Desarrollo.md`, `Notas * Cierre.md`, `archivo/` | Histórico | **NUNCA.** Son registros testimoniales cerrados. |

## 3. Qué LEER y qué IGNORAR (Guía de contexto para Agentes y Humanos)

- **LEER SIEMPRE AL INICIAR:**
  - `DOCS.md` (jerarquía de verdad y reglas de gobernanza).
  - `AGENTS.md` (instrucciones normativas para agentes).
  - `transparencia-proy/AI-CONTEXT.md` (mapa vivo del estado actual del sistema).
  - `GLOSSARY.md` (vocabulario canónico obligatorio).
  - `transparencia-proy/decisiones/Indice.md` (últimas decisiones arquitectónicas vigentes).
- **LEER SEGÚN DEMANDA ESPECÍFICA:**
  - `Esquema BD - Negocio.md` o `Esquema BD - Catálogos.md` si se tocan migraciones, modelos o persistencia.
  - `DESIGN.md` si se toca interfaz de usuario, accesibilidad o componentes Shadcn/Tailwind.
  - `openspec/specs/` correspondientes a la funcionalidad o dominio específico a modificar.
- **NO LEER PARA CONTEXTO OPERATIVO (leer solo para investigación histórica o defensa; no editar):**
  - `transparencia-proy/Plan de Desarrollo.md` (documento fundacional histórico; no refleja el código actual).
  - Directorio `archivo/` o notas de sprints cerrados (`Notas Sprint 10 - Cierre.md`, etc.).

## 4. Enforcement

La consistencia documental se fiscaliza en dos niveles complementarios:

1. **Nivel OpenSpec nativo:**
   - `openspec validate --all`: valida la sintaxis y coherencia estructural de specs y changes activos.
   - `openspec validate --archived`: verifica que ningún change archivado conserve tareas pendientes (`- [ ]`).
2. **Nivel Generado desde código (herramienta interna propia):**
   - `composer docs`: script para regenerar automáticamente `docs/ROUTES.md`, `docs/PERMISSIONS.md`, `docs/SCHEMA.md` y `docs/STATUS.md`.
   - `composer docs:check`: gate portátil para hook local o CI; verifica solo `docs/ROUTES.md` y `docs/PERMISSIONS.md`, que dependen únicamente del código.
    - `composer docs:check:full`: verificación completa de los 4 archivos; requiere el entorno real porque `docs/SCHEMA.md` depende del motor de BD y `docs/STATUS.md` de rama/versiones.
    - `docs/STATUS.md` es informativo (rama, versiones, conteo de tests del reporte JUnit o `no disponible` si no existe) y no entra en el check exacto portátil.

Ninguna rama de feature se mergea sin su delta spec correspondiente en OpenSpec y sus documentos derivados regenerados.
