# Deploy a Vercel — paso a paso

Guía para desplegar el dashboard a producción. Repo: https://github.com/sidesportsmexico-oss/dashboard-rh-simco

## 1. Crear cuenta de Vercel y conectar GitHub

1. Ve a https://vercel.com
2. Click en **Sign Up** (o **Login** si ya tienes cuenta)
3. Elige **Continue with GitHub** y autoriza con la cuenta `sidesportsmexico-oss`
4. Acepta los permisos para que Vercel pueda leer tus repos

## 2. Importar el proyecto

1. En el dashboard de Vercel, click en **Add New...** (arriba a la derecha) → **Project**
2. En "Import Git Repository" busca `dashboard-rh-simco`
3. Click en **Import**

> Si no aparece el repo: click en **Adjust GitHub App Permissions** y dale acceso al repo.

## 3. Configurar el build

Vercel detecta Next.js automáticamente. Solo verifica que:

| Campo | Valor |
|---|---|
| **Framework Preset** | Next.js (auto) |
| **Root Directory** | `.` (default) |
| **Build Command** | `next build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |
| **Node Version** | 20.x o superior |

## 4. Agregar variables de entorno (CRÍTICO)

Esta es la parte importante. Antes de hacer click en **Deploy**, expande la sección **Environment Variables** y agrega:

### Para empezar con sandbox (mientras llega la key de prod):

| Name | Value |
|---|---|
| `POTENTOR_BASE_URL` | `https://campus.potentor.com.mx/api_rest` |
| `POTENTOR_API_KEY` | `1e991eaac0b0c52fab5600d5c8ba7d04` |
| `POTENTOR_DEFAULT_SUCURSAL` | `4` |
| `POTENTOR_POTENTOR_ID` | `4` |
| `POTENTOR_CACHE_TTL` | `600` |

### Cuando llegue la key de producción de SIMCO:

Reemplaza los valores de:
- `POTENTOR_API_KEY` → la key real
- `POTENTOR_DEFAULT_SUCURSAL` → ID de la sucursal principal de SIMCO
- `POTENTOR_POTENTOR_ID` → ID de SIMCO (o de sucursal, según contexto del endpoint)

> **MUY IMPORTANTE**: marca `POTENTOR_API_KEY` con el checkbox **Sensitive / Encrypted** para que ni siquiera tú puedas verla después en la UI. Vercel la encripta en reposo.

### Para los tres entornos (Production, Preview, Development):

Vercel pide elegir en cuáles entornos aplica cada variable. **Marca las 3 casillas** (Production, Preview, Development) para todas las vars de Potentor.

## 5. Deploy

1. Click en el botón grande **Deploy**
2. Vercel descarga el repo, instala deps, builda Next.js y despliega — toma ~2 minutos
3. Cuando termine, te da una URL tipo `https://dashboard-rh-simco.vercel.app`

## 6. Verificar que todo funcione

1. Abre la URL que te dio Vercel
2. Deberías ver el dashboard con sidebar y los 4 módulos
3. Navega a:
   - `/` Overview
   - `/reclutamiento` — debe mostrar 26 vacantes (sandbox demo)
   - `/headcount` — debe mostrar 1 posición + 24 vacantes abiertas
   - `/eco` — debe mostrar **ECO 2025 = 46.3 / 100**
   - `/evaluacion-360` — debe mostrar 0 procesos (sandbox no tiene)

Si algún módulo falla con "Error al cargar", revisa Vercel → Deployments → Functions Logs.

## 7. Dominio personalizado (opcional)

1. En Vercel, ve a tu proyecto → **Settings** → **Domains**
2. Click en **Add**
3. Escribe el dominio (ej. `dashboard.simco.com.mx`)
4. Vercel te da los registros DNS para apuntar:
   - **A record** o **CNAME** según tu proveedor de dominio
5. Espera ~10 min a que propague
6. Vercel emite el certificado SSL automáticamente

## 8. Deploys automáticos a partir de aquí

Vercel queda conectado al repo de GitHub. Cada `git push` a `main` dispara un deploy automático a producción. Cada Pull Request crea un Preview Deploy con su propia URL temporal — útil para revisar cambios antes de mergear.

## Cómo cambiar variables de entorno después

1. Vercel → tu proyecto → **Settings** → **Environment Variables**
2. Editar la variable
3. **IMPORTANTE**: cambiar una env var NO redeploya automáticamente. Después de editar:
   - Ve a **Deployments**
   - En el último deploy click los `...` → **Redeploy**

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Build falla con "Module not found" | Falta dependencia | Verificar `package.json`, `npm install` local primero |
| Páginas dan 500 | Env var falta o mal escrita | Revisar Settings → Environment Variables |
| "POTENTOR_API_KEY is not set" | La var no aplicó al entorno actual | Marcar las 3 casillas (Production/Preview/Dev) |
| Data desactualizada | Caché de 10 min | Esperar o invalidar manualmente (ver lib/potentor/client.ts) |
| `/eco` da error 200 con array vacío | Sandbox demo limitada o filtro `year` muy estricto | Revisar logs de Vercel — Functions |

## Costo

Con tu plan **Vercel Hobby (gratis)** este proyecto cabe sin problema:
- 100 GB de bandwidth/mes (muy lejos de gastar con 3-10 usuarios internos)
- Serverless functions ilimitadas (con timeout de 10s en Hobby)
- HTTPS automático

Si en el futuro suben muchos usuarios o necesitas analytics avanzados, **Vercel Pro = $20/mes** por miembro.
