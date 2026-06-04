# Mensaje listo para enviar a Potentor

Copia desde la siguiente línea hacia abajo y envíalo por correo al contacto técnico de Potentor.

---

**Asunto:** 4 puntos para terminar el dashboard ejecutivo de SIMCO

Hola equipo,

Soy [TU NOMBRE], estoy construyendo un dashboard ejecutivo de RH para el CEO de SIMCO usando su API REST. Ya tengo Reclutamiento, Head Count e Índice de Potencial funcionando en producción.

Para cerrar lo que falta, necesito su ayuda con **4 cosas concretas**:

---

## 1. Endpoint para resultados de las encuestas ECO

SIMCO tiene 3 encuestas registradas en su módulo "Diagnóstico de Clima Organizacional":

| Título | Periodo | Participantes |
|---|---|---|
| ECO 2025 SIMCo | 01 - 12 Sep 2025 | 47 |
| ECO 2025 CONCEPTS | 01 - 08 Sep 2025 | 52 |
| ECO 2024 (2) | 01 - 04 Nov 2024 | 91 |

Necesito obtener los resultados agregados de cada una: **score global, breakdown por dimensión y tasa de respuesta**.

El endpoint `/diagnostico/lista_ip` no devuelve esta data (devuelve Índice de Potencial, otra cosa).

**👉 ¿Cuál endpoint REST debo usar para los resultados de encuestas ECO?**

Si no existe, ¿pueden enviarnos un export (CSV o JSON) con los resultados cada vez que se cierra una encuesta?

---

## 2. Fecha de creación de vacantes

`/reclutamiento/lista` devuelve 13 campos por vacante pero ninguno con la fecha de creación. Sin ese campo no puedo filtrar "vacantes creadas en 2026".

**👉 ¿Pueden agregar el campo `fecha_creacion` al response de `/reclutamiento/lista`?**

Alternativa: habilitar permisos para `/vacante/find` (hoy responde 403) — el detalle también traería la fecha.

---

## 3. Endpoint para resultados de Evaluación 360

El módulo de 360 está disponible en su UI en `https://campus.potentor.com.mx/procesos_360/grupos_asignados`. Pero ningún endpoint REST de `/api_rest/procesos_360/*` existe (todos devuelven 404).

Necesito listar procesos 360 por año y obtener los **resultados agregados de cada uno** (score por competencia, número de evaluadores).

**👉 ¿Cuál es el endpoint REST para acceder a los datos del módulo de Evaluación 360?**

---

## 4. Ampliar permisos de la API key

Estos 5 endpoints responden **403 "You don't have permissions to view this data"** con la API key actual de SIMCO:

- `GET /vacante/etapas`
- `GET /vacante/tipo_contratacion`
- `GET /vacante/find`
- `GET /vacante/info`
- `GET /empleado/ncp_detallado`

**👉 ¿Pueden ampliar el alcance de la key para que los incluya?**

---

### Operativo (preguntas adicionales, no bloqueantes)

- ¿Cuáles son los rate limits que aplican a la cuenta SIMCO?
- ¿Requieren whitelist de IPs? El dashboard corre en Vercel.
- ¿Soportan webhooks? Útiles para invalidar caché al cerrar una encuesta o publicar una vacante.
- Contacto técnico para escalaciones futuras.

---

Idealmente esta semana para presentar al CEO la próxima. Cualquier duda respondo aquí o por [TU TELÉFONO].

Gracias,

[TU NOMBRE]
[TU CARGO]
[TU EMAIL]
[TU TELÉFONO]
