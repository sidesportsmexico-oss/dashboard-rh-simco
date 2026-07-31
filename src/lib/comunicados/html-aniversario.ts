/**
 * HTML mail-safe para comunicado de aniversario.
 *
 * Réplica EXACTA del template que RH manda por Gmail. Diferencias
 * clave vs cumpleaños:
 *  - Container BLANCO (no negro) con gradient verde 5,255,139 (más brillante)
 *  - Logo SIMCo centrado arriba (no corner)
 *  - Sin cuadrito de fecha
 *  - Ordinal ("TERCER") en verde italic + "ANIVERSARIO" en negro
 *  - Íconos redes DEBAJO de la foto
 *  - Ilustración decorativa distinta (globos con confeti, imgur JlkjMfq)
 *  - Texto sobre fondo blanco → colores oscuros (no blanco)
 *
 * Fuente: correo real de RH del 2026-07-31.
 */

interface Args {
  nombre: string;
  puesto: string;
  /** Ordinal texto uppercase, e.g. "TERCER" | "CUARTO" | "PRIMER" */
  ordinalTexto: string;
  fotoDataUri: string | null;
}

const IMGUR_LOGO_SIMCO_DARK = "https://i.imgur.com/mPhfQ4i.png"; // versión oscura para fondo blanco
const IMGUR_CELEBRACION = "https://i.imgur.com/JlkjMfq.png";
const IMGUR_INSTAGRAM = "https://i.imgur.com/fgdFVaP.png";
const IMGUR_LINKEDIN = "https://i.imgur.com/3eacegt.png";

const VERDE = "rgb(5,255,139)";
const NEGRO = "rgb(0,0,0)";
const GRIS_PUESTO = "rgb(102,102,102)";
const GRIS_FRASE = "rgb(85,85,85)";

export function buildHtmlAniversario(args: Args): string {
  const partes = args.nombre.trim().split(/\s+/);
  const primerNombre = (partes[0] ?? "").toUpperCase();
  const restoNombre = partes.slice(1).join(" ").toUpperCase();
  const puestoUpper = args.puesto.trim();

  const fotoTag = args.fotoDataUri
    ? `<img src="${args.fotoDataUri}" alt="${escapeHtml(args.nombre)}" width="302" height="453" style="border:0;display:block;width:302px;height:453px;object-fit:cover;">`
    : `<div style="width:302px;height:453px;background-color:rgba(0,0,0,0.05);border:2px dashed rgba(0,0,0,0.2);color:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;font-size:14px;text-align:center;padding:20px;box-sizing:border-box;">FOTO DEL FESTEJADO<br/>(sube desde el panel)</div>`;

  return `<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0" style="border-spacing:0;border-collapse:collapse;color:rgb(0,0,0);font-family:'Times New Roman';font-size:medium;background-color:rgb(240,240,240)">
  <tbody><tr>
    <td align="center" style="padding:40px 0 20px">
      <table class="gmail-container" width="600" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse;width:600px;background-color:rgb(255,255,255);background-image:linear-gradient(to top,rgba(5,255,139,0.35) 0%,rgb(255,255,255) 40%);border-radius:20px">
        <tbody>
          <tr><td align="center" style="padding:40px 40px 10px">
            <img src="${IMGUR_LOGO_SIMCO_DARK}" alt="SIMCo Logo" width="140" style="border:0;display:block;width:140px;margin:0 auto">
          </td></tr>
          <tr><td style="padding:10px 40px 0">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse"><tbody><tr>
              <td valign="middle" align="center" style="padding:0 20px 0 0;vertical-align:middle;text-align:center">
                <div style="margin-bottom:25px">
                  <p style="margin:0;font-family:'League Spartan',Arial,sans-serif;font-size:52px;line-height:46px;color:${VERDE};font-weight:700;font-style:italic;text-transform:uppercase">${escapeHtml(args.ordinalTexto)}</p>
                  <p style="margin:0;font-family:'League Spartan',Arial,sans-serif;font-size:32px;line-height:32px;font-weight:700;text-transform:uppercase;color:${NEGRO}">ANIVERSARIO</p>
                </div>
                <div style="margin-bottom:25px">
                  <p style="margin:0;font-family:'Nunito Sans',Arial,sans-serif;font-size:24px;line-height:28px;font-weight:800;text-transform:uppercase;color:${NEGRO}">${escapeHtml(primerNombre)}</p>
                  ${restoNombre ? `<p style="margin:0 0 8px;font-family:'Nunito Sans',Arial,sans-serif;font-size:24px;line-height:28px;color:${VERDE};font-weight:800;text-transform:uppercase">${escapeHtml(restoNombre)}</p>` : ""}
                  <p style="margin:0;font-family:'Nunito Sans',Arial,sans-serif;font-size:15px;color:${GRIS_PUESTO};font-weight:700;letter-spacing:1px;text-transform:uppercase">${escapeHtml(puestoUpper)}</p>
                </div>
                <p style="margin:5px 0 20px;font-family:'Nunito Sans',Arial,sans-serif;font-size:18px;line-height:1.4;color:${GRIS_FRASE};font-style:italic">Más que un aniversario,<br>una historia que continúa.</p>
              </td>
              <td width="260" valign="middle" style="padding:0;vertical-align:middle">
                ${fotoTag}
                <table width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse"><tbody><tr>
                  <td align="center" valign="middle" style="padding:15px 0 0">
                    <table cellpadding="0" cellspacing="0" align="center" style="border-spacing:0;border-collapse:collapse"><tbody><tr>
                      <td style="padding:0 10px 0 0"><a href="https://www.instagram.com/simco.mx/" target="_blank"><img src="${IMGUR_INSTAGRAM}" alt="Instagram" width="28" height="28" style="border:0;display:block;border-radius:6px"></a></td>
                      <td style="padding:0"><a href="https://www.linkedin.com/company/simco-company" target="_blank"><img src="${IMGUR_LINKEDIN}" alt="LinkedIn" width="28" height="28" style="border:0;display:block;border-radius:6px"></a></td>
                    </tr></tbody></table>
                  </td>
                </tr></tbody></table>
              </td>
            </tr></tbody></table>
          </td></tr>
          <tr><td align="center" style="padding:10px 0 0">
            <img src="${IMGUR_CELEBRACION}" alt="Celebracion" width="500" style="border:0;display:block;width:600px;max-width:600px;border-radius:0 0 20px 20px">
          </td></tr>
        </tbody>
      </table>
      <table width="600" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse"><tbody><tr>
        <td align="center" style="padding:10px;font-family:'Nunito Sans',Arial,sans-serif;font-size:11px;color:rgb(153,153,153)">© 2026 SIMCo. Todos los derechos reservados.</td>
      </tr></tbody></table>
    </td>
  </tr></tbody>
</table>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
