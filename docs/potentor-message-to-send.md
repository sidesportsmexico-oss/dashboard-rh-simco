# Mensaje listo para enviar a Potentor

Copia desde la siguiente línea hacia abajo y envíalo por correo al contacto técnico de Potentor.

---

**Asunto:** Solicitud técnica — endpoints faltantes para dashboard ejecutivo de SIMCO

Hola equipo Potentor,

Estoy avanzando con el dashboard ejecutivo para el CEO de SIMCO. Tengo **Reclutamiento, Head Count e Índice de Potencial funcionando contra producción**. Para cerrar las 3 visualizaciones que aún faltan al CEO necesito su ayuda con lo siguiente.

---

## 1️⃣ Resultados de las encuestas ECO (Clima Organizacional)

**Lo que el CEO necesita ver:** los resultados de las 3 encuestas ECO que SIMCO tiene registradas en su plataforma (`/diagnostico_clima_organizacional`):

| Título | Tipo | Participantes | Periodo de aplicación | Estatus |
|---|---|---|---|---|
| ECO 2025 SIMCo | Privada | 47 | 01 - 12 Sep 2025 | TERMINADO |
| ECO 2025 CONCEPTS | Pública | 52 | 01 - 08 Sep 2025 | TERMINADO |
| ECO 2024 (2) | Privada | 91 | 01 - 04 Nov 2024 | TERMINADO |

**Problema:** el endpoint `/diagnostico/lista_ip` devuelve datos de **Índice de Potencial** (evaluaciones individuales continuas), **NO** resultados de ECO. Lo verificamos cruzando los periodos de arriba con el campo `fecha_termino` de las respuestas que devuelve el API: **0 filas en cada ventana** (deberíamos ver ~41 + 52 + 91).

**Lo que necesitamos del API (en orden de preferencia):**

1. **Endpoint REST para encuestas ECO**, equivalente a las pantallas que ven los administradores en la UI:
   - `GET /diagnostico/encuestas` — lista de encuestas: `{id, titulo, tipo, participantes, fecha_inicio, fecha_fin, avance, estatus}`
   - `GET /diagnostico/encuesta/{id}/resultados` — agregados de UNA encuesta: `{score_global, escala, por_dimension: [{nombre, score, peso}], por_sucursal, tasa_respuesta}`
   - `GET /diagnostico/encuesta/{id}/respuestas` — opcional: respuestas individuales agregadas (sin PII)

2. **Si no hay endpoint disponible:** export programado al cerrar cada encuesta (CSV/JSON con los agregados) a un SFTP / Google Drive / S3 nuestro, o webhook al evento "encuesta cerrada".

---

## 2️⃣ Fecha de creación de vacantes (para filtrar "Vacantes creadas en 2026")

**Lo que el CEO necesita ver:** vacantes creadas en 2026.

**Problema:** `/reclutamiento/lista` devuelve **13 campos** por vacante (`vacante_id`, `nombre`, `puesto`, `sucursal`, `sucursal_id`, `estatus`, `contratacion`, `requisitos`, `funciones`, `ofrecemos`, `localidad`, `confidencialidad`, `link`) — **ninguno con fecha**. El endpoint detalle `/vacante/find?vacante_id=X` responde 403 ("You don't have permissions to view this data") con nuestra API key.

**Lo que necesitamos del API (cualquiera de los dos):**

1. **Agregar `fecha_creacion`** (formato `YYYY-MM-DD HH:MM:SS`) al response de `/reclutamiento/lista`, **o**
2. **Habilitar permisos para `/vacante/find`** en la cuenta SIMCO (potentor_id `281811`, sucursal_id `646540`) para que devuelva el detalle con fecha.

Sin esto, hoy usamos `estatus = "En Proceso"` como **proxy** de "vacantes 2026" — pero no es precisamente lo mismo.

---

## 3️⃣ Resultados de Evaluación 360

**Lo que el CEO necesita ver:** resultados de las Evaluaciones 360 aplicadas en SIMCO.

**Lo que existe en la UI:** módulo accesible en `https://campus.potentor.com.mx/procesos_360/grupos_asignados` (grupos asignados, procesos, resultados).

**Problema:** ningún endpoint REST de `/api_rest/procesos_360/*` existe. Probamos exhaustivamente:

| URL probada | Resultado |
|---|---|
| `GET /api_rest/procesos_360/grupos_asignados` | 404 |
| `GET /api_rest/procesos_360/lista` | 404 |
| `GET /api_rest/procesos_360/resultados` | 404 |
| Toda variante razonable de `/procesos_360/*` | 404 |

Mientras tanto usamos provisionalmente `/desempeno/working_process_by_date?sucursal_id=X&year=Y` (único endpoint con parámetro `year`), pero no sabemos si efectivamente cubre 360.

**Lo que necesitamos del API (en orden de preferencia):**

1. **Exponer endpoints REST para 360**, equivalentes a las pantallas de `/procesos_360/*`:
   - `GET /procesos_360/grupos_asignados?sucursal_id=X&year=Y` — listado de grupos/procesos
   - `GET /procesos_360/resultados?proceso_id=X` — agregados (score por competencia, n respuestas, breakdown)
   - `GET /procesos_360/ciclos?year=Y` — ciclos por año

2. **O confirmar** si `/desempeno/working_process_by_date` ya trae los procesos 360 y, si trae varios tipos (360 + desempeño + 9-box), cuál es el campo que los distingue (un `tipo`, `categoria`, etc.).

3. **Plan B viable:** webhook al cierre de un proceso 360 o export programado con resultados agregados.

---

## 🔐 Permisos pendientes en la API key de SIMCO

Estos 5 endpoints responden **403 "You don't have permissions to view this data"** con la key actual (`5575...cb06`):

- `GET /vacante/etapas`
- `GET /vacante/tipo_contratacion`
- `GET /vacante/find`
- `GET /vacante/info`
- `GET /empleado/ncp_detallado`

¿Pueden ampliar el alcance de la key para que los incluya? Los necesitamos para el catálogo de etapas del pipeline de reclutamiento y para el detalle de vacantes.

---

## 🔄 Operativo (preguntas finas)

- **Rate limits** aplicables a la cuenta de SIMCO
- ¿Requieren **whitelist de IPs**? El dashboard corre en Vercel (IPs salientes variables) — si requieren whitelist podemos plantear alternativa con proxy
- ¿Soportan **webhooks**? Útiles para invalidar caché cuando se cierra una encuesta ECO o se publica una vacante nueva
- **Contacto técnico de soporte** + SLA esperado

---

## 📅 Tiempos

Idealmente esta semana para tener todo listo y presentar al CEO la próxima.

Cualquier duda respondo a este correo o por [TU TELÉFONO].

Gracias,

[TU NOMBRE]
[TU CARGO]
[TU EMAIL]
[TU TELÉFONO]
