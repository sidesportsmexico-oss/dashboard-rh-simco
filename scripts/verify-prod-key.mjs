#!/usr/bin/env node
/**
 * Verifica que una API key de Potentor funcione para todos los endpoints
 * que usa el dashboard.
 *
 * Uso:
 *   POTENTOR_API_KEY=xxx POTENTOR_POTENTOR_ID=N POTENTOR_DEFAULT_SUCURSAL=M \
 *     node scripts/verify-prod-key.mjs
 *
 * O carga desde .env.local automáticamente si estás en la carpeta del proyecto:
 *   node scripts/verify-prod-key.mjs
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Intentar cargar .env.local
async function loadEnv() {
  try {
    const txt = await readFile(resolve(projectRoot, ".env.local"), "utf8");
    for (const line of txt.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    // OK si no existe
  }
}
await loadEnv();

const BASE =
  process.env.POTENTOR_BASE_URL ?? "https://campus.potentor.com.mx/api_rest";
const KEY = process.env.POTENTOR_API_KEY;
const SUCURSAL = process.env.POTENTOR_DEFAULT_SUCURSAL ?? "4";
const POTENTOR_ID = process.env.POTENTOR_POTENTOR_ID ?? SUCURSAL;

if (!KEY) {
  console.error("❌ Falta POTENTOR_API_KEY en env o .env.local");
  process.exit(1);
}

const TESTS = [
  {
    name: "Empresa info",
    path: "/empresa/info",
    must: (j) => typeof j === "object" && j.nombre,
  },
  {
    name: "Empresa sucursales",
    path: "/empresa/sucursales",
    // Potentor devuelve `{"0":{...},"1":{...}}` — dict con keys numéricas. Permitimos varias formas.
    must: (j) =>
      Array.isArray(j) ||
      (j?.data && Array.isArray(j.data)) ||
      (typeof j === "object" && j !== null && Object.keys(j).every((k) => /^\d+$/.test(k))),
  },
  {
    name: "Reclutamiento — listado vacantes",
    path: "/reclutamiento/lista",
    must: (j) => Array.isArray(j),
  },
  {
    name: "Vacantes — catálogo de etapas",
    path: `/vacante/etapas?sucursal=${SUCURSAL}`,
    must: (j) =>
      Array.isArray(j) ||
      (j?.data && Array.isArray(j.data)) ||
      (typeof j === "object" && j !== null && Object.keys(j).every((k) => /^\d+$/.test(k))),
    softFail: true,
    note: "Sandbox da 403; en PROD debe tener permiso — verificar al cargar la key real",
  },
  {
    name: "Vacantes — tipos de contratación",
    path: "/vacante/tipo_contratacion",
    must: (j) =>
      Array.isArray(j) ||
      (j?.data && Array.isArray(j.data)) ||
      (typeof j === "object" && j !== null && Object.keys(j).every((k) => /^\d+$/.test(k))),
    softFail: true,
    note: "Sandbox suele dar 403; en PROD debe tener permiso",
  },
  {
    name: "Head Count — catálogo campos",
    path: "/headcount/campos",
    must: (j) => Array.isArray(j),
  },
  {
    name: "Head Count — reporte",
    path: `/headcount/reporte?potentor_id=${POTENTOR_ID}`,
    must: (j) => Array.isArray(j),
  },
  {
    name: "ECO — Diagnóstico Clima (lista_ip)",
    path: "/diagnostico/lista_ip",
    must: (j) => j && Array.isArray(j.data),
  },
  {
    name: "Evaluación 360 / Desempeño — procesos por año (2025)",
    path: `/desempeno/working_process_by_date?sucursal_id=${SUCURSAL}&year=2025`,
    must: (j) => Array.isArray(j) || (j?.status === false), // sandbox dice "No se encontraron procesos"
    softFail: true,
  },
  {
    name: "Evaluación 360 / Desempeño — procesos por año (2026)",
    path: `/desempeno/working_process_by_date?sucursal_id=${SUCURSAL}&year=2026`,
    must: (j) => Array.isArray(j) || (j?.status === false),
    softFail: true,
  },
];

console.log(`\nProbando contra ${BASE}`);
console.log(`API Key: ${KEY.slice(0, 6)}…${KEY.slice(-4)} (${KEY.length} chars)`);
console.log(`sucursal=${SUCURSAL}, potentor_id=${POTENTOR_ID}\n`);

let pass = 0,
  warn = 0,
  fail = 0;

for (const t of TESTS) {
  const url = `${BASE}${t.path}`;
  const t0 = Date.now();
  let res, body, parsed;
  try {
    res = await fetch(url, { headers: { "POTENTOR-API-KEY": KEY } });
    body = await res.text();
    try {
      parsed = body ? JSON.parse(body) : null;
    } catch {
      parsed = body;
    }
  } catch (err) {
    console.log(`❌ ${t.name}\n   → network error: ${err.message}`);
    fail++;
    continue;
  }
  const ms = Date.now() - t0;
  const status = res.status;
  const isStatusFalse =
    parsed && typeof parsed === "object" && parsed.status === false;
  const okShape = t.must(parsed);

  if (status >= 200 && status < 300 && okShape) {
    const count = Array.isArray(parsed)
      ? parsed.length
      : Array.isArray(parsed?.data)
        ? parsed.data.length
        : "—";
    console.log(`✅ ${t.name}  [${status} · ${ms}ms · n=${count}]`);
    pass++;
  } else if (isStatusFalse && t.softFail) {
    console.log(
      `⚠️  ${t.name}  [${status} · status:false · "${parsed.error ?? ""}"] — soft fail (probablemente sin data en este año)`,
    );
    warn++;
  } else {
    const errMsg =
      typeof parsed === "object" ? JSON.stringify(parsed).slice(0, 200) : String(parsed).slice(0, 200);
    console.log(`❌ ${t.name}  [${status} · ${ms}ms]`);
    console.log(`   → ${errMsg}`);
    if (t.note) console.log(`   nota: ${t.note}`);
    fail++;
  }
}

console.log(
  `\nResultado: ${pass} OK · ${warn} warning · ${fail} fallaron · ${TESTS.length} total`,
);
process.exit(fail > 0 ? 1 : 0);
