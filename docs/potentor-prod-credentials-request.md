# Solicitud técnica a Potentor — API Key de Producción para SIMCO

**Para:** Equipo de Potentor / FleetHR
**De:** Equipo de integración Dashboard RH — SIMCO
**Fecha:** 2026-06-02

## Contexto

El dashboard ejecutivo de RH para SIMCO ya está funcionando contra su sandbox (api-key demo `1e991eaac0b0c52fab5600d5c8ba7d04`). Los 4 módulos del CEO (Reclutamiento, Head Count, ECO, Evaluación 360) están integrados y validados.

Para pasar a piloto con el CEO necesitamos las credenciales de producción de SIMCO con permisos suficientes para los endpoints listados abajo.

## Lo que necesitamos de su lado

### 1. Credenciales

| Item | Detalle |
|---|---|
| **API Key de producción** | Para la cuenta de SIMCO |
| **`potentor_id` de SIMCO** | El ID de la empresa (lo necesitamos para algunos endpoints) |
| **`sucursal_id` por cada sucursal** | Restaurantes + corporativo — lista completa |
| **API Key de staging (si existe)** | Opcional, para no quemar prod en pruebas |

### 2. Permisos por endpoint que necesita la API Key

Por favor confirmen que la key de producción tiene acceso a:

| Endpoint | Para qué módulo | Observación |
|---|---|---|
| `GET /empresa/info` | Header del dashboard | — |
| `GET /empresa/sucursales` | Catálogo sucursales | Restaurantes + corporativo |
| `GET /reclutamiento/lista` | Reclutamiento | Listado vacantes |
| `GET /reclutamiento/candidatos` | Reclutamiento | Candidatos por vacante |
| `GET /reclutamiento/candidato` | Reclutamiento | Detalle candidato |
| `GET /vacante/etapas` | Reclutamiento | ⚠️ En sandbox responde **403 "You don't have permissions"** — necesitamos que prod sí tenga acceso |
| `GET /vacante/find` | Reclutamiento | Detalle vacante |
| `GET /vacante/info` | Reclutamiento | Info vacante |
| `GET /headcount/reporte` | Head Count | Posiciones SIMCO |
| `GET /headcount/campos` | Head Count | Catálogo campos |
| `GET /diagnostico/lista_ip` | ECO (Clima Organizacional) | Resultados de encuestas |
| `GET /desempeno/working_process_by_date` | Evaluación 360 | Procesos por año |

### 3. Infraestructura y operación

- **Rate limits**: ¿cuántas requests por minuto/hora soporta la cuenta? El dashboard cachea 10 min por defecto, pero queremos confirmar margen.
- **Whitelist de IPs**: ¿requieren que registremos las IPs salientes de Vercel? Si sí, las pasamos.
- **Webhooks**: ¿soportan? Útil para invalidar caché cuando se cierra un ciclo de ECO o se publica una vacante.
- **Versionado**: ¿cómo nos avisan de breaking changes en la API?
- **Soporte técnico**: contacto y SLA esperado.

### 4. Aclaraciones pendientes sobre data

Estas son dudas finas del módulo ECO descubiertas en sandbox — útiles para terminar de afinar la presentación al CEO:

1. **Escala del campo `ip`** en `/diagnostico/lista_ip`. Sandbox tiene scores de 0 a 63 — ¿el rango es 0-100? ¿Otro?
2. **Breakdown por dimensión**: el endpoint actual da score global por persona. ¿Hay endpoint que devuelva score por dimensión (liderazgo, ambiente, comunicación, etc.)?
3. **Wrapper `total` y `enviados`**: en sandbox vienen como `"0"` y `0`. ¿En producción reflejan invitados/respondieron? ¿Cómo se calculan?
4. **Endpoint `/desempeno/working_process_by_date`**: ¿es donde viven los procesos de Evaluación 360, o trae procesos de desempeño en general? Si trae todos, ¿cómo distinguimos 360 vs evaluación de desempeño normal vs 9-box?

## ¿Cómo nos lo entregan?

Lo más seguro:

- **Por correo cifrado** (PGP o equivalente), o
- **Compartido vía 1Password / Bitwarden** invitando a [TU EMAIL], o
- **Llamada de 15 min** con su dev para entregarla en vivo y cubrir las dudas técnicas del punto 4

Por favor NO la manden en WhatsApp ni Slack en texto plano.

## Lo que haremos cuando llegue

1. La cargamos en `.env.local` (luego en Vercel como env var secreta de producción)
2. Corremos un script de verificación que tenemos listo — confirma que cada uno de los 12 endpoints responde correctamente
3. Comparamos el dashboard sandbox vs prod side-by-side
4. Si todo OK, levantamos a piloto con el CEO

## Contacto

[TU NOMBRE]
[TU EMAIL]
[TU TELÉFONO]
