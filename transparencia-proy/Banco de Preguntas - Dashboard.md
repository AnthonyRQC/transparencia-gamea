# Banco de Preguntas — Dashboard y Reportes UTLCC

> Para probar que el dashboard y los informes responden. Marca ✔ cuando la pruebes
> y anota dudas o mejoras del dashboard en **Notas**.
> Leyenda: ✅ directa · 🔍 con drill-down/export.

## A. El día a día del Jefe (<2 min)

### 1. ¿Hay algo que atender hoy?
- **Dónde:** KPIs "Abiertos hoy / Por vencer / Vencidos".
- **Pasos:** 1) Entra a **Dashboard** (menú Inicio). 2) Mira la banda **HOY** (primera fila de tarjetas, no toques Filtros). 3) Lee los tres números.
- **Escenario:** lunes 8:00, abres el dashboard con tu café. Ves "Vencidos: 3". Antes de revisar correo ya sabes que el día es de apagar incendios y no de papeleo.
- **✔ Probada / Notas:**
- Excelente me encanta, solo que eh notado que podria cambiar de lugar las tarjetas sin tencico y la tarjeta cerrado a tiempo para que en las filas esten las tarjetas como la primera fila de tarjetas actuales que no responden a los filtros y la segunda fila seria de tarjetas reactivas a los filtros que opinas?.

### 2. ¿Qué atiendo primero?
- **Dónde:** Rendimiento → "¿Qué urge hoy?" (ordenada del más vencido al más holgado, ticket clicable).
- **Pasos:** 1) En **Dashboard**, abre la pestaña **Rendimiento**. 2) Mira la tabla **"¿Qué urge hoy?"**. 3) Clic en el ticket del primer caso → se abre su detalle en Bandeja/Mis Casos.
- **Escenario:** tienes reunión con la MAE a las 10:00 y solo alcanzas a ver 2 casos. La tabla te dice cuáles: el vencido hace días y uno que vence mañana.
- **✔ Probada / Notas:**

### 3. ¿Quién está saturado?
- **Dónde:** "¿Quién está saturado?" → clic en la barra → sus casos.
- **Pasos:** 1) En **Dashboard**, pestaña **Rendimiento**. 2) Mira el gráfico **"¿Quién está saturado?"** (barras por técnico: verde en plazo, dorado por vencer, magenta vencidos). 3) Clic en la barra del técnico → modal con sus casos → "Abrir en Reportes" para su informe.
- **Escenario:** Ana te pide vacaciones para la próxima semana. Miras su barra: 6 casos, 2 en rojo. Le das solo 3 días y le traspasas un caso a Pablo antes de que se vaya.
- **✔ Probada / Notas:**

### 4. ¿Hay casos sin técnico?
- **Dónde:** tarjeta "Sin técnico" → clic → Bandeja → asignar.
- **Pasos:** 1) En **Dashboard**, banda HOY, tarjeta **"Sin técnico"** → clic (te lleva a Bandeja). 2) Pestaña **Por asignar** → botón **Asignar técnico** en cada caso.
- **Escenario:** admitiste 3 denuncias el viernes y olvidaste asignarlas. El lunes la tarjeta marca 3 y con un clic las asignas antes de que pierdan días de plazo.
- **✔ Probada / Notas:**

### 5. ¿Qué se quedó sin admitir?
- **Dónde:** "Por admitir" (plazo legal: 5 días).
- **Pasos:** 1) En **Dashboard**, tarjeta **"Por admitir"** (banda HOY). 2) Ve a **Bandeja de Admisión** → pestaña **Por admitir** → admite o rechaza con justificación.
- **Escenario:** jueves por la tarde, ves 2 ingresadas con 4 días. Las admites hoy mismo: mañana vencen los 5 días del Art. 23 y un incumplimiento así se informa a la MAE.
- **✔ Probada / Notas:**

## B. La semana (seguimiento operativo)

### 6. ¿Cuántos casos se registraron esta semana?
- **Dónde:** preset "Últimos 7 días" → "Qué ingresó" + línea Ingresadas.
- **Pasos:** 1) En **Dashboard**, botón **Filtros** → en **Rango de fechas** elige el preset **"Últimos 7 días"** → **Aplicar filtros**. 2) Lee la tarjeta **"Qué ingresó"** y la línea morada **Ingresadas** del gráfico "¿Ingresamos más de lo que cerramos?".
- **Escenario:** hubo una feria ciudadana en El Alto donde difundieron la UTLCC. El lunes siguiente verificas si funcionó: 5 ingresadas en 7 días contra 1 habitual.
- **✔ Probada / Notas:**
- me encanta, podriamos arreglar un pequenio bug en la tarjeta de que ingreso, por que la barra de porcentaje de negacion de informacion no se muestra y solo aparece la barra de corrupcion talvez podria ser de color verde que estamos usando.
otra cosa que se me olvidaba es que estos colores que se estan usando en el dashboard podriamos hacer que sean por sistema en los colores que usan shadcn o react para que se puedan cambiar facilmente por los colores primarios, secundarios etc de todo el sistema y no estar cambiando colores componentes por componentes.

### 7. ¿Ingresamos más de lo que cerramos?
- **Dónde:** "¿Ingresamos más de lo que cerramos?" (morada vs verde).
- **Pasos:** 1) En **Dashboard**, pestaña **Operativo**. 2) Compara la línea morada (Ingresadas) con la verde (Cerradas) en el rango elegido. 3) Clic en un punto de una línea → modal con los casos de ese día/semana/mes.
- **Escenario:** hace 3 semanas la morada supera a la verde de forma sostenida. Con ese gráfico pides a la MAE un técnico de refuerzo temporal — con evidencia, no con sensaciones.
- **✔ Probada / Notas:**
- me gusta este grafico, creo que una posible mejora para que el cliente vea la utilidad de este grafico seria agregando mas casos no importa si en las partes de los campos libres se llene con lorem ipsum y los demas de seleccion se creen de forma aleatoria. otra posible mejora que veo aqui podria hacer que al hacer clic en una de las lineas de tiempo sean de cerradas, ingresadas y rechazadas se pueda ver el filtro en el modal que opinas de esto ultimo?


### 8. ¿Qué se rechazó y por qué?
- **Dónde:** KPI Rechazadas + clic en la barra gris del embudo → justificación en el Sheet.
- **Pasos:** 1) Lee la tarjeta **"Rechazadas"** (banda PERÍODO). 2) Pestaña **Operativo** → clic en la barra gris **Rechazada** del embudo → modal con los casos. 3) Clic en un ticket → pestaña **Bandeja** → abre el caso → lee la justificación de rechazo.
- **Escenario:** un vecino denuncia baches y alumbrado. Rechazas 4 casos similares en el mes. El patrón te dice que la ciudadanía confunde servicios municipales con corrupción: pides un folleto aclaratorio en Ventanilla Única.
- **✔ Probada / Notas:**
- me encanta, podriamos hacer que el card tambien funcione como funciona hacer clic como filtro de estos casos que an cido rechazados que opinas? 
y ya que estamos en esto tambien podriamos hacer que las tarjetas de abiertos hoy y por admitir sean interactivas que lleven a sus respectivas pestanias en la bandeja de admision que opinas?
otra cosa que puede ser un poco pesada talvez me podrias recomendar en esto es que los casos listados en los modalse de los filtros talvez podriamos hacer que sean reactivos y que se pueda hacer clic en alguno para ir a mas informacion de esos respectivos casos, talvez agregar como un icono de un ojo para que no se haga clic por accidente por que si se hace que se puede hacer clic en toda la fila del caso puede surgir estos problemas de miss clic.

### 9. ¿En qué fase se atasca el trabajo?
- **Dónde:** "¿En qué fase están los casos hoy?" (la barra más larga no-terminal).
- **Pasos:** 1) En **Dashboard**, pestaña **Operativo**. 2) Mira el gráfico **"¿En qué fase están los casos hoy?"** (foto de hoy, ignora fechas). 3) La barra morada más larga es el cuello de botella → clic para ver esos casos.
- **Escenario:** "Investigación" tiene 16 casos e "Informe" solo 2. El cuello no es la admisión sino el cierre de investigaciones: convocas reunión solo sobre cómo redactar informes más rápido.
- **✔ Probada / Notas:**

### 10. ¿Cómo va Carlos vs Ana?
- **Dónde:** Carga lado a lado → clic en cada uno → un Excel por técnico.
- **Pasos:** 1) Pestaña **Rendimiento** → compara las barras. 2) Clic en la barra de Carlos → modal → **Exportar** su Excel. 3) Repite con Ana. 4) Compara ambos archivos.
- **Escenario:** evaluación trimestral de personal. Extraes el informe de cada uno y comparas carga, vencidos y cerrados con datos, no con impresiones.
- **✔ Probada / Notas:**

## C. El mes / informe a la MAE

### 11. ¿Cuántos casos se registraron el último mes?
- **Dónde:** preset Último mes → Split + Reportes mismo rango (los totales deben coincidir).
- **Pasos:** 1) En **Dashboard**, verifica que el chip diga **"Fecha: Último mes"** (se aplica solo al entrar). 2) Lee la tarjeta **"Qué ingresó"**. 3) Ve a **Reportes**, pon el mismo rango desde/hasta → **Buscar** → compara el total con el dashboard.
- **Escenario:** la MAE te pide el dato para el informe de gestión mensual. Sacas el número del dashboard y adjuntas el Excel con el mismo total — cifra verificable.
- **✔ Probada / Notas:**
- creo que esto se podria mejorar, todavia no trabaje por completo en la ventana de reportes asi que posiblemente copiara las mejoras que se esta teniendo en el dashboard o simplemente cambiar el nombre a esta pesntania a listado de casos o algo asi por que casi cumple lo mismo que el dashboard, otra cosa que me acabo de dar cuenta es que esta tarjeta de "que ingreso" podriamos hacer que al hacer clic en esta o en un icono de mas informacion podriamos hacer que abra un modal en el cual esten filtrados los casos que se registraron en un determinado rango de fechas y tambien reaccionando a los filtros no? o esto es muy complejo? tambien me eh dado cuenta que estos modales de listados por filtros en este dashboard cumplen la misma mision de la pestania de reportes no?, me refiero a que si se podria talvez como agregar un boton para abrir en la ventana de reportes y poder ver mas detalles o algo por el estilo para que no haya mucha duplicicdad de codigo entre este modal y la ventana de reportes que opinas?


### 12. ¿Cuántos cerramos y qué % a tiempo?
- **Dónde:** "Cerrados a tiempo" + Evolución Cerradas → Excel con clasificación + fecha de cierre.
- **Pasos:** 1) Con el preset **Último mes**, lee la tarjeta **"Cerrados a tiempo"**. 2) Botón **Exportar** → formato **Excel** → verifica columnas (clasificación, fecha de cierre) → **Descargar**. 3) Ese archivo es el anexo del informe.
- **Escenario:** 89% a tiempo. Ese número va en grande en tu informe: demuestra que la unidad cumple la Ley 974. Si baja de 80%, actúas antes de que te lo pregunten.
- **✔ Probada / Notas:**
- actualmente ese porcentaje no se muestra en el informe y esta bien que no se muestre por que seria contraproducente mostrar eso en el informe contra la unidad de transparencia, esta bien que este porcentaje solo se muestre en el dashboard para que el jefe de unidad lo evalue.

### 13. ¿En qué termina cada caso?
- **Dónde:** "¿En qué termina cada caso?" → clic en PENAL → lista para el Ministerio Público (Art. 26).
- **Pasos:** 1) Pestaña **Resultados** → gráfico **"¿En qué termina cada caso?"**. 2) Clic en la barra **PENAL** (o la que corresponda) → modal con la lista → **Abrir en Reportes** → **Exportar**.
- **Escenario:** 3 casos con clasificación PENAL este mes. Con un clic tienes la lista para remitir con tickets, fechas y fojas.
- **✔ Probada / Notas:**
- en aqui parece que tengo un bug o podrias analizarlo, cuando hago clic en la barra de penal que me aparece con 4 datos cuando esta filtrado por el ultimo mes, me aparece solo uno listado en el modal hay algo que se esta tomando diferente en este lugar? o que podria ser?

### 14. ¿Qué unidades nos deben información?
- **Dónde:** "¿Qué unidades reciben más solicitudes?".
- **Pasos:** 1) Pestaña **Resultados** → gráfico **"¿Qué unidades reciben más solicitudes?"**. 2) Clic en una barra → modal con los casos (incluye subordinadas). 3) Si hace falta el detalle, abre un caso → pestaña **Solicitudes**.
- **Escenario:** Contrataciones acumula 6 solicitudes y responde tarde. Con el gráfico en mano, la MAE firma un instructivo de respuesta en plazo a todas las unidades.
- **✔ Probada / Notas:**
- en el grafico podriamos hacer que se puedan hacer clic en las barras del grafico de "que unidades reciben mas solicitudes?", si hacen clic en una unidades filtra el grafico de que casos son los que estan llegando a esa unidad. que opinas?

### 15. ¿Cómo notificamos los cierres?
- **Dónde:** "¿Cómo se notificó cada cierre?".
- **Pasos:** 1) Pestaña **Resultados** → gráfico **"¿Cómo se notificó cada cierre?"**. 2) Clic en una barra (ej. presencial) → modal → verifica un caso puntual abriéndolo.
- **Escenario:** un denunciante reclama que nunca le avisaron. Muestras que el 70% se notifica presencial con acta y revisas solo ese caso puntual.
- **✔ Probada / Notas:**

### 16. ¿Corrupción o negación de información?
- **Dónde:** "Qué ingresó".
- **Pasos:** 1) Lee la tarjeta **"Qué ingresó"** (banda PERÍODO) con el rango que te interese. 2) Si quieres el listado, **Reportes** → filtro **Tipo** → **Exportar**.
- **Escenario:** 80% corrupción / 20% negación sostenido. Propones un taller de acceso a la información para las unidades más denunciadas por negación.
- **✔ Probada / Notas:**
- me encanta este grafico, solo que parece que tambien tiene el bug de que cuando hago clic en la barra de "whatsapp" me aparece el modal pero no se lista ningun caso lo mismo pasa con los demas no se si el bug es el mismo que en el punto 13 o diferente.
- me acabo de dar cuenta que este bug solo pasa cuando el filtro del periodo esta en el ultimo mes pero cuando hago en el ultimo trimestre si aparecen listados correctamente con la misma cantidad de casos que muestra el grafico. que puede ser? podrias revisar tambien el comportamiento con los distintos filtros tambien?

## D. Las interesantes (demuestran valor)

### 17. ¿Estamos mejorando?
- **Dónde:** preset Trimestre → Evolución (¿la verde alcanza a la morada? ¿baja la mora?).
- **Pasos:** 1) Botón **Filtros** → preset **"Trimestre"** → **Aplicar filtros**. 2) Pestaña **Operativo** → lee las tres líneas y compara con los KPIs "Por vencer/Vencidos".
- **Escenario:** presentas a la MAE 3 meses: la mora bajó de 9 a 1 y los cierres subieron. Esa imagen vale más que 10 páginas.
- **✔ Probada / Notas:**

### 18. ¿Dónde mueren los casos?
- **Dónde:** Rechazadas del período vs cerradas "sin indicios" (clic en clasificación).
- **Pasos:** 1) Lee la tarjeta **"Rechazadas"**. 2) Pestaña **Resultados** → clic en la barra **SIN INDICIOS** (o ARCHIVADO) → modal → compara ambos conteos.
- **Escenario:** 8 rechazadas + 5 archivadas por sin indicios en el trimestre. El problema está en la admisión (se admite lo que luego no se prueba): ajustas criterios con tu equipo.
- **✔ Probada / Notas:**

### 19. ¿Qué pasaría en 30 días si no hacemos nada?
- **Dónde:** `/dev/tiempo` +30d → Mora y Urgentes futuros (solo demo).
- **Pasos:** 1) Abre **/dev/tiempo** (solo entorno local). 2) Botón **+30 días** → **Fijar**. 3) Vuelve al **Dashboard**: KPIs "Por vencer/Vencidos" y "¿Qué urge hoy?" muestran el futuro. 4) Botón **Hoy** para volver.
- **Escenario:** antes de vacaciones colectivas de fin de año simulas +30 días: 12 casos en rojo. Reasignas y amplías plazos justificadamente ANTES de irte.
- **✔ Probada / Notas:**
- hmmm no estoy viendo como surgen los cambios en el dashboard con el timemachine, talvez lo podriamos agregar a futuro por el momento podriamos agregar esta ruta del time machine en el sidebar  o navbar?

### 20. ¿Qué técnico cierra más y de qué tipo?
- **Dónde:** Carga + drill por técnico + filtro clasificación.
- **Pasos:** 1) Botón **Filtros** → **Clasificación** (ej. PENAL) → **Aplicar**. 2) Pestaña **Rendimiento** → compara barras. 3) Clic en un técnico → sus casos penales.
- **Escenario:** Luis cierra puros administrativos y nunca penales. El próximo penal complejo va a quien ya demostró manejo, y a Luis le asignas un mentor.
- **✔ Probada / Notas:**
- en aqui esta un poco raro, el grafico de quien esta saturado no reacciona a los filtros asi que no se podria realizar esta consulta como mencionas aqui y extraniamente la tarjeta de "que urge hoy" reacciona a los filtros siendo que este supuestamente solo muestre de hoy similar al grafico de que esta saturado, pero esta bien que reaccione a los filtros solo lo estoy mencionando como curiosidad.

### 21. ¿El plazo de admisión se cumple?
- **Dónde:** "Por admitir".
- **Pasos:** 1) Mira la tarjeta **"Por admitir"** (banda HOY). 2) Si hay casos, ve a **Bandeja de Admisión** → pestaña **Por admitir** → admite o rechaza hoy mismo.
- **Escenario:** viernes 16:00, ves una ingresada con 5 días justos. La admites antes de salir: el lunes sería el día 6 y quedaría registrado.
- **✔ Probada / Notas:**

### 22. ¿Qué categorías concentran denuncias?
- **Dónde:** Reportes por categoría (filtro).
- **Pasos:** 1) Ve a **Reportes**. 2) Filtro **Categoría** (ej. COHECHO) → **Buscar**. 3) Revisa el total y **Exportar** si lo necesitas para el informe.
- **Escenario:** "Cohecho" aparece 5 veces en contrataciones menores en 2 meses. Alertas a la MAE de un patrón antes de que escale a un penal grande.
- **✔ Probada / Notas:**

## Mejora propuesta (pendiente de implementar)
- **Reordenar tarjetas por reactividad** (idea del usuario, pregunta 1): fila 1 con las que NO responden a filtros (Abiertos hoy, Por admitir, Por vencer, Vencidos, Sin técnico) y fila 2 con las reactivas al período (Cerrados a tiempo, Rechazadas, Qué ingresó), cada fila con su etiqueta HOY / PERÍODO. Coherente con las bandas del dashboard.
- ✅ **Implementado Sep 2026:** filas reordenadas tal cual (Sin técnico subió a la fila 1).