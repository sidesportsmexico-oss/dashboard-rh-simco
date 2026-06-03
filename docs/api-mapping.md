# Potentor API → Dashboard RH — Mapeo de endpoints

**Fecha de análisis:** 2026-06-02
**Spec OpenAPI cruda:** `potentor-openapi.json` (descargada de `https://campus.potentor.com.mx/docs/api_rest/api.json.php`)

## Autenticación

- **Método:** API Key en header
- **Header:** `POTENTOR-API-KEY: <key>`
- **Base URL:** `https://campus.potentor.com.mx/api_rest`
- **Formatos:** JSON o XML
- **Sandbox confirmado funcionando** con:
  - api-key: `1e991eaac0b0c52fab5600d5c8ba7d04`
  - sucursal: `4`
  - empleado: `MUSER04`
  - potentor_id (cuenta): `2316` (01 POTENTOR DEMO)

**Pendiente:** API key de producción del cliente.

## Mapeo por módulo del dashboard

### ✅ 1. Reclutamiento — COBERTURA COMPLETA

15 endpoints en el tag `Reclutamiento` + `Vacante`:

| Necesidad | Endpoint | Verificado |
|---|---|---|
| Listado de vacantes | `GET /reclutamiento/lista` | ✅ devuelve sucursal, puesto, estatus, link |
| Detalle vacante | `GET /vacante/find`, `GET /vacante/info` | — |
| Etapas (funnel) | `GET /vacante/etapas` | ⚠️ sandbox no tiene permiso, prod debería |
| Candidatos por vacante | `GET /reclutamiento/candidatos` | — |
| Detalle candidato | `GET /reclutamiento/candidato` | — |
| Reclutadores | `GET /vacante/reclutadores` | — |
| Tipos de contratación | `GET /vacante/tipo_contratacion` | — |

**Nota:** `/reclutamiento/lista` ya incluye `estatus` por vacante, lo que permite arrancar el módulo sin esperar a `/vacante/etapas`.

### ✅ 4. Head Count — COBERTURA COMPLETA

| Necesidad | Endpoint | Verificado |
|---|---|---|
| Reporte head count con campos configurables | `GET /headcount/reporte?potentor_id={id}` | ✅ funciona |
| Catálogo de campos disponibles | `GET /headcount/campos` | ✅ ~30+ campos |
| Sucursales (desglose restaurantes vs corporativo) | `GET /empresa/sucursales` | — |
| Vacantes abiertas (para complementar) | `GET /reclutamiento/lista` | ✅ |

### ✅ 2. ECO (Encuesta Clima Organizacional) — RESUELTO

**Hallazgo (2026-06-02):** el endpoint `/diagnostico/lista_ip` ESTÁ mal etiquetado en la spec como "Índice de Potencial" cuando realmente es la **Encuesta de Clima Organizacional**. "IP" = Índice de **Percepción**, no Potencial. Confirmado con el cliente.

**Endpoint:** `GET /diagnostico/lista_ip?sucursal_id=X&consecutivo=Y`

**Respuesta real (verificada en sandbox):**
```json
{
  "data": [
    {
      "consecutivo": "33502",
      "sucursal": "Admin DEMO",
      "area": "Area Nuevo Server",
      "departamento": "Departamento nuevo Servidor",
      "nombre": "Primer Usuario Nuevo Server",
      "curp": "",
      "email": "primeruser@correo.com",
      "fecha_termino": "2024-02-17 06:37:12",
      "fecha_descarga": "2026-06-02 13:42:27",
      "ip": "0"
    }
  ],
  "total": "0",
  "enviados": 0
}
```

**Sandbox tiene 18 respuestas** con scores 0-63, distribuidas entre 2024 (14) y 2025 (4). El módulo del dashboard agrupa por `fecha_termino.year` para comparativo entre años.

**Limitaciones conocidas:**
- ❌ No tiene parámetro `year` — agrupamos client-side por `fecha_termino`
- ❌ No expone breakdown por dimensión (liderazgo, ambiente, etc.) — solo score global por persona
- ⚠️ Los campos `total` y `enviados` del wrapper devuelven "0" en sandbox (inservibles); computamos nosotros: total = data.length, respondieron = data.filter(ip > 0).length
- ⚠️ Escala de `ip`: aparenta ser 0-100 pero no documentada. Pendiente confirmar con Potentor.

### ⚠️ 3. Evaluación 360 — **DATA EXISTE EN UI, NO EN API**

**Hallazgo crítico (2026-06-02, confirmado por SIMCO):** El módulo 360 vive en la UI de Potentor en `https://campus.potentor.com.mx/procesos_360/grupos_asignados`, pero NO hay endpoints REST equivalentes:

| Probado en API | Resultado |
|---|---|
| `/api_rest/procesos_360/grupos_asignados` | 404 |
| `/api_rest/procesos_360/lista`, `/resultados`, `/info` | 404 |
| Toda variante razonable de `/procesos_360/*` | 404 |

**Implementación actual provisional:** Usamos `/desempeno/working_process_by_date?sucursal_id=X&year=Y` (único endpoint con parámetro `year` en la spec) como placeholder. Puede o no traer la data de 360 — pendiente confirmar con Potentor.

**Acciones requeridas con Potentor (en orden de preferencia):**
1. (Preferido) Exponer endpoints REST equivalentes a `/procesos_360/*` UI
2. (Aceptable) Confirmar si `/desempeno/working_process_by_date` trae 360, y si trae todos los procesos, cómo distinguir (campo `tipo`?)
3. (Plan B) Export programado o webhook con resultados agregados al cerrar ciclo

**Endpoints secundarios (sandbox los rechaza):**
- `GET /empleado/ncp_detallado` — evaluaciones de nivel del empleado
- `GET /nine_box/potencial_desemp` — matriz 9-box
- `GET /empleado/calificar` — calificación por evento

## Otras tags útiles para contexto

- **Empleado** (22 endpoints) — CRUD completo, fotos, CV, calificación, NCP, bajas
- **Sucursal** (11) — útil para desglose restaurantes vs corporativo
- **Puesto** (9) — incluye `/puesto/organigrama` para vista jerárquica
- **Empresa** (4) — info de cuenta y paquetes contratados
- **Área**, **Departamento**, **Jerarquía** — taxonomía organizacional
- **Asistencia** (6) — entrada/salida (potencialmente útil para futuras métricas)
- **Bolsa de trabajo** (3) — formulario público de postulación

## Riesgos detectados

1. **Spec OpenAPI mal formada** (Swagger 2.0 con bugs: trailing commas, claves sin comillas, valores `object`/`string` sin comillas, quotes anidadas sin escape). Implicación: no se puede autogenerar el SDK con `openapi-generator`. **Solución:** escribir el cliente HTTP a mano (~96 endpoints, manejable). Ya está la spec descargada para referencia.
2. **Sin endpoint claro de ECO ni 360.** Bloqueante para 2 de los 4 módulos del dashboard.
3. **Sin parámetro `year` visible** en endpoints de evaluación/encuesta — la comparación 2025 vs 2026 requiere confirmar cómo se filtra históricamente.
4. **Sin info de rate limits** en la spec — hay que preguntar antes de implementar caché TTL.
5. **Sin paginación documentada** — los listados pueden ser pesados (ej. `/reclutamiento/lista` devolvió toda la data sin `limit`/`offset`).
