# Solicitud técnica a Potentor — API para Encuesta de Clima Organizacional (ECO)

**Para:** Equipo de desarrollo de Potentor / FleetHR
**De:** Equipo de integración Dashboard RH — SIMCO
**Fecha:** 2026-06-02

## Contexto

Estamos construyendo un dashboard ejecutivo para el CEO de SIMCO que consolida 4 módulos de RH. Reclutamiento y Head Count ya están integrados contra su API REST contra credenciales sandbox. Falta integrar **Encuesta de Clima Organizacional (ECO)**, que es una feature listada como módulo en su sitio público ([fleethr.ai](https://www.fleethr.ai)) pero que no aparece en su OpenAPI spec actual (`https://campus.potentor.com.mx/docs/api_rest/`).

Búsqueda exhaustiva en la spec por las palabras `clima`, `encuesta`, `eco`, `survey`, `cuestionario` → **0 hits** en ningún path, summary, description o definition.

## Necesidad funcional

El dashboard debe mostrar, **para el comparativo 2025 vs 2026**:
- Score global de ECO por año
- Score por dimensión (ej. liderazgo, ambiente, comunicación, desarrollo, etc.)
- Tasa de respuesta (% de invitados que contestaron)
- Granularidad opcional por sucursal y/o área
- Delta entre años por dimensión

NO necesitamos respuestas individuales — solo agregados a nivel empresa, sucursal y dimensión.

## Solicitudes técnicas concretas

### 1. Confirmación de existencia

**Pregunta principal:** ¿exponen ECO vía API? Posibles respuestas:

- **(a) Sí, pero no está en el OpenAPI público** — pasen documentación y endpoints.
- **(b) Sí, pero bajo otro nombre** — díganos cuál (`/sondeo/*`, `/cuestionario/*`, `/cultura/*`, etc.).
- **(c) No, solo está disponible vía UI** — propongan alternativa (ver sección 5).

### 2. Endpoints sugeridos (si la respuesta es (a) o (b))

Estos son los endpoints que el dashboard necesitaría. Los nombres son sugeridos — usen los suyos:

#### 2.1 Listar ciclos de ECO
```
GET /eco/ciclos
  ?year=2025|2026   (opcional, filtrar por año)
  ?sucursal_id=X    (opcional, filtrar por sucursal)
```
**Respuesta esperada:**
```json
[
  {
    "ciclo_id": "string",
    "nombre": "ECO 2026 Anual",
    "year": 2026,
    "fecha_inicio": "2026-03-01",
    "fecha_fin": "2026-03-31",
    "estatus": "cerrado",
    "total_invitados": 1240,
    "total_respuestas": 1056,
    "tasa_respuesta": 0.852,
    "sucursales_incluidas": ["restaurante-1", "corporativo", "..."]
  }
]
```

#### 2.2 Resultados agregados de un ciclo
```
GET /eco/ciclos/{ciclo_id}/resultados
  ?sucursal_id=X    (opcional, filtrar)
  ?area=X           (opcional, filtrar)
```
**Respuesta esperada:**
```json
{
  "ciclo_id": "string",
  "score_global": 4.12,
  "escala": { "min": 1, "max": 5 },
  "por_dimension": [
    {
      "dimension_id": "liderazgo",
      "nombre": "Liderazgo",
      "score": 4.3,
      "n_respuestas": 1056,
      "peso": 0.20
    }
  ],
  "por_sucursal": [
    { "sucursal_id": "X", "nombre": "Restaurante 1", "score": 4.05 }
  ],
  "por_pregunta": [
    {
      "pregunta_id": "Q01",
      "texto": "Mi jefe directo me reconoce mi trabajo",
      "dimension_id": "liderazgo",
      "promedio": 4.2,
      "distribucion": { "1": 12, "2": 30, "3": 80, "4": 400, "5": 534 }
    }
  ]
}
```

#### 2.3 Catálogo de dimensiones
```
GET /eco/dimensiones
```
**Respuesta esperada:**
```json
[
  { "dimension_id": "liderazgo", "nombre": "Liderazgo", "descripcion": "...", "peso": 0.20 },
  { "dimension_id": "ambiente", "nombre": "Ambiente de trabajo", "descripcion": "...", "peso": 0.15 }
]
```

#### 2.4 (Opcional) Comparativo directo entre dos ciclos
Si existe un endpoint nativo de comparación, mejor. Si no, lo construimos client-side llamando 2.2 dos veces.

### 3. Autenticación y autorización

- Mismo método actual: header `POTENTOR-API-KEY: <key>`
- Confirmar si el API key actual del cliente tiene permisos para leer ECO, o si requiere uno nuevo
- ¿Hay scopes/roles específicos para datos de ECO (ej. solo HR Manager los puede ver)?

### 4. Detalles operativos

- **Rate limits** del módulo ECO
- **Paginación** si los resultados se devuelven en listados grandes
- **Sandbox** — ¿hay un ciclo de ECO de prueba con datos demo que podamos usar en desarrollo?

### 5. Plan B si NO exponen ECO vía API

Si la respuesta es (c) "solo UI", proponemos en orden de preferencia:

1. **Webhook al cierre de ciclo** — al cerrar un ECO, Potentor llama a un endpoint nuestro y empuja los resultados agregados.
2. **Export programado** — Potentor genera un CSV/JSON con resultados por dimensión al cerrar cada ciclo, lo deja en un SFTP / Google Drive / S3 nuestro. Nosotros lo ingestamos.
3. **Export bajo demanda con URL temporal** — al cerrar ciclo, generan un export descargable y nos mandan el link.

Cualquiera de estas tres es viable para el dashboard.

## Resumen de lo que necesitamos de su lado

| # | Item | Bloquea |
|---|---|---|
| 1 | Confirmación: ¿ECO se expone vía API? | Todo el módulo |
| 2 | Documentación de endpoints (si existen) | Implementación |
| 3 | Credenciales con permiso para leer ECO | Pruebas |
| 4 | Ciclo de ECO con data demo en sandbox | Desarrollo |
| 5 | Si no hay API: definir export / webhook | Implementación alternativa |

## Contacto

[Aquí pones tu nombre / mail / teléfono para que respondan]
