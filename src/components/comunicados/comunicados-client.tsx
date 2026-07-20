"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Cake, Sparkles, Download, Copy, Upload, X, Check } from "lucide-react";
import { TemplateCumpleanos } from "./template-cumpleanos";
import { TemplateAniversario } from "./template-aniversario";
import type { PersonaComunicado } from "@/data/comunicados-personas";

type Tipo = "cumpleanos" | "aniversario";
type VarianteAniv = "dark" | "light";

const MESES_ES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const NUMEROS_ORDINALES: Record<number, string> = {
  1: "Primer",
  2: "Segundo",
  3: "Tercer",
  4: "Cuarto",
  5: "Quinto",
  6: "Sexto",
  7: "Séptimo",
  8: "Octavo",
  9: "Noveno",
  10: "Décimo",
  11: "Décimo Primer",
  12: "Décimo Segundo",
  13: "Décimo Tercer",
  14: "Décimo Cuarto",
  15: "Décimo Quinto",
  20: "Vigésimo",
};

function formatFechaCumple(iso: string): string {
  if (!iso) return "";
  const [_y, mm, dd] = iso.split("-");
  const mesIdx = Number(mm) - 1;
  return `${dd} DE ${MESES_ES[mesIdx] ?? ""}`;
}

/** Años cumplidos desde fecha_ingreso a hoy. Devuelve null si sin fecha. */
function calcAnios(iso: string): number | null {
  if (!iso) return null;
  const start = new Date(iso);
  const now = new Date();
  let anios = now.getFullYear() - start.getFullYear();
  const m = now.getMonth() - start.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < start.getDate())) anios--;
  return Math.max(0, anios);
}

function ordinalTexto(n: number): string {
  return NUMEROS_ORDINALES[n] ?? `${n}°`;
}

interface Props {
  personas: PersonaComunicado[];
}

export function ComunicadosClient({ personas }: Props) {
  const [tipo, setTipo] = useState<Tipo>("cumpleanos");
  const [variante, setVariante] = useState<VarianteAniv>("dark");
  const [personaId, setPersonaId] = useState<string>(personas[0]?.id ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [aniosOverride, setAniosOverride] = useState<string>("");
  const [copiedHtml, setCopiedHtml] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const persona = useMemo(
    () => personas.find((p) => p.id === personaId) ?? personas[0],
    [personas, personaId],
  );

  const aniosAutomaticos = persona ? calcAnios(persona.fecha_ingreso) : null;
  const aniosEfectivo = aniosOverride
    ? Math.max(0, Number(aniosOverride))
    : aniosAutomaticos;
  const aniversarioTexto =
    aniosEfectivo != null ? `${ordinalTexto(aniosEfectivo)}` : "Primer";

  const fechaCumpleFmt = persona ? formatFechaCumple(persona.fecha_nacimiento) : "";

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleDownloadPng() {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: variante === "dark" && tipo === "aniversario" ? "#000" : "#fff",
      });
      const link = document.createElement("a");
      const slug = persona?.id ?? "comunicado";
      link.download = `${tipo}-${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generando PNG:", err);
      alert("No se pudo generar el PNG. Ver consola.");
    }
  }

  async function handleCopyHtml() {
    if (!previewRef.current) return;
    // Serializamos el nodo con estilos inline resueltos por el navegador.
    // Para email lo empaquetamos con las dimensiones fijas.
    const html = previewRef.current.outerHTML;
    const wrapped = `<div style="max-width:1080px;margin:0 auto;">${html}</div>`;
    try {
      await navigator.clipboard.writeText(wrapped);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
      alert("No se pudo copiar. Usa el botón de PNG.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
      {/* PANEL IZQ: FORMULARIO */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 space-y-6 h-fit lg:sticky lg:top-6">
        {/* Selector tipo */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">
            Tipo de comunicado
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "cumpleanos" as const, label: "Cumpleaños", icon: Cake },
              { id: "aniversario" as const, label: "Aniversario", icon: Sparkles },
            ].map((t) => {
              const active = tipo === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  className={
                    active
                      ? "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium border bg-[var(--color-accent-teal)]/15 border-[var(--color-accent-teal)]/40 text-[var(--color-accent-teal)] cursor-pointer transition-all"
                      : "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] cursor-pointer transition-all"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector variante (solo aniversario) */}
        {tipo === "aniversario" && (
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">
              Variante
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "dark" as const, label: "Fondo negro" },
                { id: "light" as const, label: "Fondo blanco" },
              ].map((v) => {
                const active = variante === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariante(v.id)}
                    className={
                      active
                        ? "rounded-lg px-3 py-2 text-xs font-medium border bg-[var(--color-accent-teal)]/15 border-[var(--color-accent-teal)]/40 text-[var(--color-accent-teal)] cursor-pointer transition-all"
                        : "rounded-lg px-3 py-2 text-xs font-medium border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] cursor-pointer transition-all"
                    }
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Persona */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">
            Persona
          </label>
          <select
            value={personaId}
            onChange={(e) => setPersonaId(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-teal)]"
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {p.puesto} ({p.division})
              </option>
            ))}
          </select>
          {persona && (
            <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
              {persona.fecha_ingreso && `Ingreso: ${persona.fecha_ingreso}`}
              {persona.fecha_ingreso && persona.fecha_nacimiento && " · "}
              {persona.fecha_nacimiento && `Nace: ${persona.fecha_nacimiento}`}
            </p>
          )}
        </div>

        {/* Años (solo aniversario, con override) */}
        {tipo === "aniversario" && (
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">
              Años cumplidos{" "}
              {aniosAutomaticos != null && (
                <span className="text-[var(--color-text-dim)] normal-case font-normal">
                  (auto: {aniosAutomaticos})
                </span>
              )}
            </label>
            <input
              type="number"
              min={0}
              max={50}
              placeholder={aniosAutomaticos?.toString() ?? "0"}
              value={aniosOverride}
              onChange={(e) => setAniosOverride(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-teal)]"
            />
            <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
              Muestra: <b>{aniversarioTexto}</b> aniversario
            </p>
          </div>
        )}

        {/* Foto */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">
            Foto del festejado
          </label>
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputFileRef.current?.click()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border-subtle)] px-3 py-4 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] cursor-pointer transition-all"
          >
            <Upload className="h-4 w-4" />
            {fotoUrl ? "Cambiar foto" : "Subir foto (JPG / PNG)"}
          </button>
          {fotoUrl && (
            <button
              type="button"
              onClick={() => setFotoUrl(null)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)]/10 cursor-pointer transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Quitar foto
            </button>
          )}
          <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
            La foto se convierte a B&N automáticamente en el diseño final.
          </p>
        </div>

        {/* Acciones */}
        <div className="border-t border-[var(--color-border-subtle)] pt-5 space-y-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-teal)] px-4 py-3 text-sm font-semibold text-black hover:bg-[var(--color-accent-teal)]/90 cursor-pointer transition-all"
          >
            <Download className="h-4 w-4" />
            Descargar PNG
          </button>
          <button
            type="button"
            onClick={handleCopyHtml}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border-subtle)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] cursor-pointer transition-all"
          >
            {copiedHtml ? (
              <>
                <Check className="h-4 w-4 text-[var(--color-accent-teal)]" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar HTML
              </>
            )}
          </button>
          <p className="text-[10px] text-[var(--color-text-dim)]">
            Recomendado: usar PNG en el correo. El HTML sirve si tu cliente de
            correo lo soporta bien.
          </p>
        </div>
      </div>

      {/* PANEL DER: PREVIEW */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Preview
          </h3>
          <span className="text-[10px] text-[var(--color-text-dim)]">
            1080 × 1080 · escala 50% para visualizar
          </span>
        </div>
        <div
          style={{
            width: 540,
            height: 540,
            overflow: "hidden",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: 12,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              transform: "scale(0.5)",
              transformOrigin: "top left",
              width: 1080,
              height: 1080,
            }}
          >
            <div ref={previewRef}>
              {persona &&
                (tipo === "cumpleanos" ? (
                  <TemplateCumpleanos
                    nombre={persona.nombre}
                    puesto={persona.puesto}
                    fechaCumple={fechaCumpleFmt}
                    fotoUrl={fotoUrl}
                  />
                ) : (
                  <TemplateAniversario
                    nombre={persona.nombre}
                    puesto={persona.puesto}
                    aniversarioTexto={aniversarioTexto}
                    fotoUrl={fotoUrl}
                    variante={variante}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
