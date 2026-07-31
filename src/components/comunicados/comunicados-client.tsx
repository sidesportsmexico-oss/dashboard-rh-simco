"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { Cake, Sparkles, Download, Copy, Upload, X, Check } from "lucide-react";
import { buildHtmlCumpleanos } from "@/lib/comunicados/html-cumpleanos";
import { buildHtmlAniversario } from "@/lib/comunicados/html-aniversario";
import type { PersonaComunicado } from "@/data/comunicados-personas";

type Tipo = "cumpleanos" | "aniversario";

const MESES_ES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

const NUMEROS_ORDINALES: Record<number, string> = {
  1: "Primer", 2: "Segundo", 3: "Tercer", 4: "Cuarto", 5: "Quinto",
  6: "Sexto", 7: "Séptimo", 8: "Octavo", 9: "Noveno", 10: "Décimo",
  11: "Décimo Primer", 12: "Décimo Segundo", 13: "Décimo Tercer",
  14: "Décimo Cuarto", 15: "Décimo Quinto", 20: "Vigésimo",
};

function parseFecha(iso: string): { dia: string; mes: string } | null {
  if (!iso) return null;
  const [_y, mm, dd] = iso.split("-");
  const mesIdx = Number(mm) - 1;
  if (!dd || Number.isNaN(mesIdx) || mesIdx < 0 || mesIdx > 11) return null;
  return { dia: dd.padStart(2, "0"), mes: MESES_ES[mesIdx] };
}

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
  /** Listado maestro. Ya viene ordenado A-Z desde el archivo de data. */
  personas: PersonaComunicado[];
}

export function ComunicadosClient({ personas }: Props) {
  const [tipo, setTipo] = useState<Tipo>("cumpleanos");
  const [fotoDataUri, setFotoDataUri] = useState<string | null>(null);
  const [aniosOverride, setAniosOverride] = useState<string>("");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  // Filtrado según tipo:
  //  - Cumpleaños  → solo personas con fecha_nacimiento
  //  - Aniversario → solo personas con fecha_ingreso
  const personasFiltradas = useMemo(
    () =>
      personas.filter((p) =>
        tipo === "cumpleanos"
          ? Boolean(p.fecha_nacimiento)
          : Boolean(p.fecha_ingreso),
      ),
    [personas, tipo],
  );

  const [personaId, setPersonaId] = useState<string>(
    personasFiltradas[0]?.id ?? "",
  );

  // Al cambiar de tipo, si la persona seleccionada ya no está en el
  // subset filtrado, brincamos automáticamente a la primera.
  useEffect(() => {
    if (!personasFiltradas.find((p) => p.id === personaId)) {
      setPersonaId(personasFiltradas[0]?.id ?? "");
    }
  }, [tipo, personasFiltradas, personaId]);

  const persona = useMemo(
    () =>
      personasFiltradas.find((p) => p.id === personaId) ??
      personasFiltradas[0],
    [personasFiltradas, personaId],
  );

  const aniosAutomaticos = persona ? calcAnios(persona.fecha_ingreso) : null;
  const aniosEfectivo = aniosOverride
    ? Math.max(0, Number(aniosOverride))
    : aniosAutomaticos;
  const aniversarioTextoStr =
    aniosEfectivo != null ? ordinalTexto(aniosEfectivo) : "Primer";

  const fechaCumple = persona ? parseFecha(persona.fecha_nacimiento) : null;

  // Genera el HTML según el tipo. Este mismo HTML es lo que se copia
  // y lo que se muestra en el preview via dangerouslySetInnerHTML.
  const html = useMemo(() => {
    if (!persona) return "";
    if (tipo === "cumpleanos") {
      return buildHtmlCumpleanos({
        nombre: persona.nombre,
        puesto: persona.puesto,
        dia: fechaCumple?.dia ?? "—",
        mes: fechaCumple?.mes ?? "—",
        fotoDataUri,
      });
    }
    return buildHtmlAniversario({
      nombre: persona.nombre,
      puesto: persona.puesto,
      ordinalTexto: aniversarioTextoStr,
      fotoDataUri,
    });
  }, [persona, tipo, fechaCumple, fotoDataUri, aniversarioTextoStr]);

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoDataUri(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCopyHtml() {
    try {
      // Copiamos con MIME type text/html + text/plain fallback. Gmail
      // renderiza el text/html al pegar, en vez de mostrar el código.
      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([html], { type: "text/plain" });
      const item = new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": textBlob,
      });
      await navigator.clipboard.write([item]);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch (err) {
      console.error("Clipboard error (rich):", err);
      // Fallback: solo texto. Peor UX pero al menos algo funciona.
      try {
        await navigator.clipboard.writeText(html);
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2500);
        alert(
          "Se copió como texto (tu navegador no soporta copiar HTML enriquecido). Prueba en Chrome/Edge.",
        );
      } catch {
        alert("No se pudo copiar. Selecciona el preview y usa Cmd/Ctrl+C.");
      }
    }
  }

  async function handleDownloadPng() {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      const slug = persona?.id ?? "comunicado";
      link.download = `${tipo}-${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error PNG:", err);
      alert("No se pudo generar PNG. Usa Copiar HTML.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
      {/* PANEL IZQ: FORMULARIO */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 space-y-6 h-fit lg:sticky lg:top-6">
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

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">
            Persona
          </label>
          <select
            value={personaId}
            onChange={(e) => setPersonaId(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-teal)]"
          >
            {personasFiltradas.map((p) => {
              // División o departamento como contexto (cumpleaños no trae división)
              const contexto = p.division || p.departamento || "";
              return (
                <option key={p.id} value={p.id}>
                  {p.nombre} · {p.puesto}
                  {contexto ? ` (${contexto})` : ""}
                </option>
              );
            })}
          </select>
          {persona && (
            <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
              {persona.fecha_ingreso && `Ingreso: ${persona.fecha_ingreso}`}
              {persona.fecha_ingreso && persona.fecha_nacimiento && " · "}
              {persona.fecha_nacimiento && `Nace: ${persona.fecha_nacimiento}`}
            </p>
          )}
        </div>

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
              Muestra: <b>{aniversarioTextoStr}</b> Aniversario
            </p>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">
            Foto del festejado (302×453 aprox)
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
            {fotoDataUri ? "Cambiar foto" : "Subir foto (JPG / PNG)"}
          </button>
          {fotoDataUri && (
            <button
              type="button"
              onClick={() => setFotoDataUri(null)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)]/10 cursor-pointer transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Quitar foto
            </button>
          )}
          <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
            La foto se embebe en el HTML como data URI. Recomendado &lt; 200 KB.
          </p>
        </div>

        <div className="border-t border-[var(--color-border-subtle)] pt-5 space-y-2">
          <button
            type="button"
            onClick={handleCopyHtml}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-teal)] px-4 py-3 text-sm font-semibold text-black hover:bg-[var(--color-accent-teal)]/90 cursor-pointer transition-all"
          >
            {copiedHtml ? (
              <>
                <Check className="h-4 w-4" />
                ¡Copiado! Pega en Gmail
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar HTML para Gmail
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={downloading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border-subtle)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-wait"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Generando…" : "Descargar como PNG (opcional)"}
          </button>
          <div className="text-[10px] text-[var(--color-text-dim)] leading-relaxed space-y-1 pt-1">
            <p><b>Cómo pegar en Gmail:</b></p>
            <ol className="list-decimal ml-4 space-y-0.5">
              <li>Click en &quot;Copiar HTML&quot;</li>
              <li>Abre Gmail y redacta un nuevo correo</li>
              <li>Pega con <b>Cmd/Ctrl+V</b> en el cuerpo</li>
              <li>Envía</li>
            </ol>
          </div>
        </div>
      </div>

      {/* PANEL DER: PREVIEW */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Preview
          </h3>
          <span className="text-[10px] text-[var(--color-text-dim)]">
            Vista Gmail · 600px width · fondo gris igual que el correo real
          </span>
        </div>
        <div
          ref={previewRef}
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ minHeight: 800 }}
        />
      </div>
    </div>
  );
}
