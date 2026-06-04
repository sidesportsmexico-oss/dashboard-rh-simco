# Mensaje listo para enviar a Potentor

Copia desde la siguiente línea hacia abajo y envíalo por correo al contacto técnico de Potentor.

---

**Asunto:** Solicitud de API key de producción y aclaraciones técnicas — Dashboard RH SIMCO

Hola equipo Potentor,

Les escribo del equipo de integración del Dashboard de RH para el CEO de SIMCO. Ya tenemos la integración funcionando contra su sandbox y necesitamos cerrar dos puntos para pasar a piloto con el CEO. Son 3 solicitudes concretas:

---

## 1. API Key de producción para SIMCO

Necesitamos:

- **API Key de producción** para la cuenta de SIMCO
- **`potentor_id`** de SIMCO (el ID de la empresa)
- **`sucursal_id`** de cada sucursal (restaurantes + corporativo) — la lista completa

**Confirmar que la key tiene permisos para estos 12 endpoints** (sandbox da 403 en algunos, queremos que producción no):

| Endpoint | Módulo del dashboard |
|---|---|
| `GET /empresa/info` | Header / contexto |
| `GET /empresa/sucursales` | Desglose por sucursal |
| `GET /reclutamiento/lista` | Reclutamiento |
| `GET /reclutamiento/candidatos` | Reclutamiento |
| `GET /reclutamiento/candidato` | Reclutamiento |
| `GET /vacante/etapas` | Reclutamiento ⚠️ sandbox da 403 |
| `GET /vacante/tipo_contratacion` | Reclutamiento ⚠️ sandbox da 403 |
| `GET /vacante/find` | Reclutamiento |
| `GET /vacante/info` | Reclutamiento |
| `GET /headcount/reporte` | Head Count |
| `GET /headcount/campos` | Head Count |
| `GET /diagnostico/lista_ip` | ECO (Clima Organizacional) |
| `GET /desempeno/working_process_by_date` | Evaluación 360 |

**Operación:**
- ¿Cuáles son los **rate limits** por cuenta?
- ¿Requieren **whitelist de IPs**? Nuestro dashboard corre en Vercel (IPs salientes variables); si necesitan whitelist, podemos discutir alternativas.
- ¿Soportan **webhooks** para invalidar caché cuando se cierra un ciclo de ECO o se publica una vacante?

---

## 2. Endpoint correcto para resultados de Encuesta de Clima Organizacional (ECO)

**Hallazgo crítico (2026-06-04):** descubrimos que el endpoint `/diagnostico/lista_ip` que estábamos usando NO devuelve los resultados de las encuestas ECO. Devuelve datos de **Índice de Potencial** (per-empleado, evaluaciones continuas) — métrica distinta.

**Evidencia:**

El módulo "Diagnóstico de Clima Organizacional" en la UI de SIMCO (`/diagnostico_clima_organizacional`) muestra 3 encuestas:

| Título | Tipo | Participantes | Periodo aplicación | Avance | Estatus |
|---|---|---|---|---|---|
| ECO 2025 SIMCo | Privada | 47 | 01-12 Sep 2025 | 87% | TERMINADO |
| ECO 2025 CONCEPTS | Pública | 52 | 01-08 Sep 2025 | N/A | TERMINADO |
| ECO 2024 (2) | Privada | 91 | 01-04 Nov 2024 | 0% | TERMINADO |

Cruzamos los periodos de aplicación con la respuesta del endpoint `/diagnostico/lista_ip`:
- Filas en API con `fecha_termino` ∈ [2025-09-01, 2025-09-12]: **0** (esperábamos ~41 para ECO 2025 SIMCo)
- Filas en API con `fecha_termino` ∈ [2025-09-01, 2025-09-08]: **0** (esperábamos ~52 para CONCEPTS)
- Filas en API con `fecha_termino` ∈ [2024-11-01, 2024-11-04]: **0** (esperábamos 91 para 2024(2))

**Conclusión:** `/diagnostico/lista_ip` expone Índice de Potencial, NO Clima Organizacional. Las 3 encuestas ECO que ve el CEO en la UI no están disponibles en el API público.

**Solicitudes:**

1. **¿Cuál es el endpoint REST para resultados de encuestas ECO?** Necesitamos:
   - Listar las encuestas registradas (id, título, tipo, periodo, participantes, avance, estatus)
   - Score global por encuesta
   - Breakdown por dimensión (liderazgo, ambiente, comunicación, etc.) si existe
   - Distribución de respuestas
   - Idealmente: respuestas individuales agregadas (sin PII) para correlaciones

2. **Si NO hay endpoint para encuestas ECO:** ¿pueden agregar uno equivalente a las pantallas de `/diagnostico_clima_organizacional/*`?

3. **Plan B viable mientras tanto:** webhook al cierre de cada encuesta que empuje resultados agregados a un endpoint nuestro, o export programado en CSV.

**Aclaración adicional sobre `/diagnostico/lista_ip` (que SÍ sirve para Índice de Potencial):**

- Escala del campo `ip`: vemos rango 0-100. ¿Es 0-100 oficialmente?
- Wrapper devuelve `total: 3, enviados: 3` (no sabemos a qué se refiere — ¿total de IPs registrados? ¿total de diagnósticos? Confirmar).

---

## 3. Endpoint para Evaluación 360 — la data existe en su UI pero no en el API

Identificamos que en su plataforma la Evaluación 360 vive en:
`https://campus.potentor.com.mx/procesos_360/grupos_asignados`

Sin embargo, probamos todas las variantes razonables en el API REST y **ninguna existe**:

| URL probada | Resultado |
|---|---|
| `GET /api_rest/procesos_360/grupos_asignados` | 404 |
| `GET /api_rest/procesos_360/lista` | 404 |
| `GET /api_rest/procesos_360/resultados` | 404 |
| `GET /api_rest/procesos_360` | 404 |
| `GET /api_rest/procesos_360/info` | 404 |

(verificado con la API key sandbox)

Entendemos que la data de 360 está disponible en su sistema (la UI funciona), pero no hay un endpoint REST para consumirla.

**Necesitamos UNA de estas tres opciones, en orden de preferencia:**

### Opción A — Exponer endpoints REST para 360 (preferida)

Que expongan endpoints equivalentes a las pantallas de `/procesos_360/*`:

- `GET /procesos_360/grupos_asignados?sucursal_id=X&year=Y` — listado de grupos/procesos
- `GET /procesos_360/resultados/{proceso_id}` — resultados agregados (score por competencia, n respuestas)
- `GET /procesos_360/ciclos?year=Y` — ciclos por año

### Opción B — Confirmar que `/desempeno/working_process_by_date` cubre 360

¿El endpoint existente `/desempeno/working_process_by_date?sucursal_id=X&year=Y` incluye los procesos de 360? Si sí, ¿cómo distinguimos cuáles son 360 vs evaluación de desempeño normal vs 9-box? ¿Hay un campo `tipo` en la respuesta?

### Opción C — Export programado o webhook

Si exponer endpoints toma tiempo, podemos arrancar con:
- **CSV/JSON de los resultados agregados** dejado en SFTP/Drive nuestro cada vez que se cierre un ciclo de 360
- **Webhook al cierre** de un proceso que nos empuje los resultados

Cualquiera de estas tres nos destraba para el comparativo 2025 vs 2026.

---

## Entrega segura

Por favor manden la **API key por canal cifrado**:

- Correo con PGP, o
- 1Password / Bitwarden compartiendo con [TU EMAIL], o
- Llamada de 15 min en vivo (preferida — cubrimos también las dudas técnicas de los puntos 2 y 3)

**No la manden en WhatsApp, Slack ni correo en texto plano.**

---

## Cuándo lo necesitamos

Idealmente esta semana para arrancar piloto con el CEO la próxima. Cualquier duda, respondo a este correo o por [TU TELÉFONO].

Gracias,

[TU NOMBRE]
[TU CARGO]
[TU EMAIL]
[TU TELÉFONO]
