<?php

/**
 * Plantilla neutra de feriados de referencia para GAMEA/El Alto — NO inserta automáticamente.
 * Solo guía visual en Admin/Catalogos para que el encargado anticipe 2027+.
 * Base legal: DS 2750 + DS 5019 + DS 5521 (2026). Últimos 10 años muestran núcleo estable.
 *
 * - fijo: 01-01, 22-01, 01-05, 21-06, 06-08, 02-11, 25-12 (trasladable dom→lun salvo excepciones)
 * - movil: lunes/martes Carnaval, Viernes Santo, Corpus Christi (60d post-Pascua) — requiere DS anual
 * - departamental: 16-07 La Paz (incluye El Alto, trasladable)
 * - municipal: 06-03 Aniversario El Alto (solo GAMEA, sin traslado)
 * Feriados adicionales tipo puentes (ej. 05-06-2026, 07-08-2026) son ad-hoc y se cargan manual.
 */

return [
    // NACIONALES FIJOS
    ['clave' => 'ano_nuevo', 'nombre' => 'AÑO NUEVO', 'tipo' => 'fijo', 'mes' => 1, 'dia' => 1, 'trasladable' => true, 'ambito' => 'nacional', 'descripcion' => 'FIJO NACIONAL — DS 2750 Art.2 a)'],
    ['clave' => 'estado_plurinacional', 'nombre' => 'DÍA DEL ESTADO PLURINACIONAL', 'tipo' => 'fijo', 'mes' => 1, 'dia' => 22, 'trasladable' => true, 'ambito' => 'nacional', 'descripcion' => 'FIJO NACIONAL — DS 2750 Art.2 b)'],
    ['clave' => 'dia_trabajo', 'nombre' => 'DÍA DEL TRABAJO', 'tipo' => 'fijo', 'mes' => 5, 'dia' => 1, 'trasladable' => true, 'ambito' => 'nacional', 'descripcion' => 'FIJO NACIONAL — DS 2750 Art.2 e)'],
    ['clave' => 'ano_nuevo_andino', 'nombre' => 'AÑO NUEVO ANDINO AMAZÓNICO CHAQUEÑO', 'tipo' => 'fijo', 'mes' => 6, 'dia' => 21, 'trasladable' => true, 'ambito' => 'nacional', 'descripcion' => 'FIJO NACIONAL — DS 2750 Art.2 g)'],
    ['clave' => 'independencia', 'nombre' => 'DÍA DE LA INDEPENDENCIA', 'tipo' => 'fijo', 'mes' => 8, 'dia' => 6, 'trasladable' => true, 'ambito' => 'nacional', 'descripcion' => 'FIJO NACIONAL — DS 2750 Art.2 h)'],
    ['clave' => 'difuntos', 'nombre' => 'DÍA DE TODOS LOS DIFUNTOS', 'tipo' => 'fijo', 'mes' => 11, 'dia' => 2, 'trasladable' => false, 'ambito' => 'nacional', 'descripcion' => 'FIJO NACIONAL — DS 2750 Art.2 i) — NO trasladable per Art.3 DS 5019'],
    ['clave' => 'navidad', 'nombre' => 'NAVIDAD', 'tipo' => 'fijo', 'mes' => 12, 'dia' => 25, 'trasladable' => true, 'ambito' => 'nacional', 'descripcion' => 'FIJO NACIONAL — DS 2750 Art.2 j)'],

    // MÓVILES — requieren DS anual, no se pueden pre-calcular fijo
    ['clave' => 'carnaval_lunes', 'nombre' => 'CARNAVAL LUNES', 'tipo' => 'movil', 'regla' => 'lunes_carnaval', 'trasladable' => false, 'ambito' => 'nacional', 'descripcion' => 'MÓVIL NACIONAL — DS 2750 Art.2 c) — Lunes de Carnaval'],
    ['clave' => 'carnaval_martes', 'nombre' => 'CARNAVAL MARTES', 'tipo' => 'movil', 'regla' => 'martes_carnaval', 'trasladable' => false, 'ambito' => 'nacional', 'descripcion' => 'MÓVIL NACIONAL — DS 2750 Art.2 c) — Martes de Carnaval'],
    ['clave' => 'viernes_santo', 'nombre' => 'VIERNES SANTO', 'tipo' => 'movil', 'regla' => 'viernes_santo', 'trasladable' => false, 'ambito' => 'nacional', 'descripcion' => 'MÓVIL NACIONAL — DS 2750 Art.2 d)'],
    ['clave' => 'corpus_christi', 'nombre' => 'CORPUS CHRISTI', 'tipo' => 'movil', 'regla' => 'corpus_60d_pascua', 'trasladable' => false, 'ambito' => 'nacional', 'descripcion' => 'MÓVIL NACIONAL — DS 2750 Art.2 f) — 60 días post Pascua'],

    // DEPARTAMENTAL LA PAZ (incluye El Alto)
    ['clave' => 'la_paz_16_jul', 'nombre' => 'GRITO LIBERTARIO LA PAZ', 'tipo' => 'fijo', 'mes' => 7, 'dia' => 16, 'trasladable' => true, 'ambito' => 'departamental', 'depto' => 'La Paz', 'descripcion' => 'DEPARTAMENTAL LA PAZ — DS 2750/5019 — Incluye El Alto/GAMEA'],

    // MUNICIPAL GAMEA/EL ALTO
    ['clave' => 'el_alto_06_mar', 'nombre' => 'ANIVERSARIO EL ALTO', 'tipo' => 'fijo', 'mes' => 3, 'dia' => 6, 'trasladable' => false, 'ambito' => 'municipal', 'municipio' => 'El Alto', 'descripcion' => 'MUNICIPAL EL ALTO — Ley 728/1985 — Solo GAMEA, sin traslado nacional'],

    // REFERENCIAS ADICIONALES (puentes ad-hoc, ej. DS 5521 2026: 05-06 y 07-08) — no van en plantilla, se cargan manual como feriado extra con nota "PUENTE DS 5521"
];
