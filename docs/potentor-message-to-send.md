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

## 2. Aclaraciones sobre ECO (Encuesta de Clima Organizacional)

El endpoint `/diagnostico/lista_ip` está mal etiquetado en su OpenAPI spec como "Índice de Potencial", pero confirmamos con el cliente que es el Diagnóstico de Clima Organizacional (ECO). Funcionando contra sandbox. Quedan 4 dudas finas para presentar bien al CEO:

1. **Escala del campo `ip`** — sandbox tiene scores de 0 a 63. ¿El rango es 0-100? ¿Otro? Lo necesitamos para que el "46.3 / 100" tenga la escala correcta.

2. **Breakdown por dimensión** — el endpoint actual da un score global (`ip`) por persona. ¿Existe endpoint o parámetro para traer el score desglosado por dimensión (liderazgo, ambiente, comunicación, desarrollo, etc.)? Eso le da mucho más valor al CEO.

3. **Wrapper `total` y `enviados`** — en sandbox vienen como `"0"` y `0`. ¿En producción reflejan invitados / respondieron? ¿Cómo los calculan?

4. **Filtro por año** — hoy filtramos client-side por `fecha_termino.year` para hacer comparativo 2025 vs 2026. ¿Hay parámetro `year` nativo en este endpoint, o esa es la forma correcta?

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
