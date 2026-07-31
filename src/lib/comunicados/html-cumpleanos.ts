/**
 * HTML mail-safe para comunicado de cumpleaños.
 *
 * Réplica EXACTA del template que RH manda por Gmail. Estructura:
 * - Tablas anidadas (Gmail no soporta flex/grid confiable)
 * - Inline styles (Gmail bloquea CSS externo)
 * - RGB colors (Gmail parsea RGB mejor que CSS vars)
 * - Fuentes: League Spartan + Nunito Sans con fallback Arial
 * - Imágenes decorativas hosteadas en imgur (URLs del correo original)
 * - Foto del festejado como data URI (sube analista → embed base64)
 *
 * Fuente: correo real de RH del 2026-07-31.
 * imgur URLs del original — si expiran hay que rehostear.
 */

interface Args {
  /** Nombre completo. Se separa primera palabra vs resto. */
  nombre: string;
  puesto: string;
  /** Día del mes 2 dígitos, e.g. "30" */
  dia: string;
  /** Mes 3 letras uppercase, e.g. "JUL" */
  mes: string;
  /** Foto como data URI base64 (data:image/jpeg;base64,...) o URL pública. */
  fotoDataUri: string | null;
}

const IMGUR_LOGO_SIMCO = "https://i.imgur.com/o8tfrlb.png";
const IMGUR_DECORACION = "https://i.imgur.com/a696RZR.png";
const IMGUR_INSTAGRAM = "https://i.imgur.com/fgdFVaP.png";
const IMGUR_LINKEDIN = "https://i.imgur.com/3eacegt.png";

const VERDE = "rgb(0,217,128)";
const BLANCO = "rgb(255,255,255)";
const GRIS_CLARO = "rgb(204,204,204)";
const GRIS_MEDIO = "rgb(170,170,170)";

export function buildHtmlCumpleanos(args: Args): string {
  const partes = args.nombre.trim().split(/\s+/);
  const primerNombre = (partes[0] ?? "").toUpperCase();
  const restoNombre = partes.slice(1).join(" ").toUpperCase();
  const puestoUpper = args.puesto.trim();

  // Foto: si no hay upload, mostramos placeholder gris con leyenda
  const fotoTag = args.fotoDataUri
    ? `<img src="${args.fotoDataUri}" alt="${escapeHtml(args.nombre)}" width="302" height="453" style="border:0;display:block;width:302px;height:453px;object-fit:cover;">`
    : `<div style="width:302px;height:453px;background-color:rgba(255,255,255,0.08);border:2px dashed rgba(255,255,255,0.3);color:rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;font-size:14px;text-align:center;padding:20px;box-sizing:border-box;">FOTO DEL FESTEJADO<br/>(sube desde el panel)</div>`;

  return `<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0" style="border-spacing:0;border-collapse:collapse;color:rgb(0,0,0);font-family:'Times New Roman';font-size:medium;background-color:rgb(240,240,240)">
  <tbody><tr>
    <td align="center" style="padding:20px 0 10px">
      <table class="gmail-container" width="600" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse;width:600px;background-color:rgb(0,0,0);background-image:linear-gradient(to top,rgba(0,217,128,0.5) 0%,rgb(0,0,0) 40%);border-radius:20px">
        <tbody>
          <tr><td style="padding:30px 40px 20px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse"><tbody><tr>
              <td align="left" valign="top" style="padding:0">
                <table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse"><tbody><tr>
                  <td align="center" style="padding:20px 25px;background-color:${VERDE};border-radius:8px">
                    <div style="font-family:'League Spartan',Arial,sans-serif;font-size:24px;font-weight:bold;color:${BLANCO};line-height:1">${escapeHtml(args.dia)}</div>
                    <div style="font-family:'League Spartan',Arial,sans-serif;font-size:12px;color:${BLANCO};text-transform:uppercase">${escapeHtml(args.mes)}</div>
                  </td>
                </tr></tbody></table>
              </td>
              <td align="right" valign="top" style="padding:0">
                <img src="${IMGUR_LOGO_SIMCO}" alt="SIMCo" width="140" style="border:0;display:block;width:140px">
              </td>
            </tr></tbody></table>
          </td></tr>
          <tr><td style="padding:5px 40px 0">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse"><tbody><tr>
              <td valign="middle" align="center" style="padding:0 20px 0 0;vertical-align:middle;text-align:center">
                <div style="margin-bottom:20px">
                  <p style="margin:0;font-family:'League Spartan',Arial,sans-serif;font-size:52px;line-height:46px;color:${BLANCO};text-transform:uppercase">HAPPY</p>
                  <p style="margin:0;font-family:'Nunito Sans',Arial,sans-serif;font-size:42px;line-height:42px;color:${VERDE};font-weight:800;font-style:italic;text-transform:uppercase">BIRTHDAY</p>
                </div>
                <div style="margin-bottom:20px">
                  <p style="margin:0;font-family:'Nunito Sans',Arial,sans-serif;font-size:32px;line-height:36px;color:${BLANCO};font-weight:800;text-transform:uppercase">${escapeHtml(primerNombre)}</p>
                  ${restoNombre ? `<p style="margin:0 0 8px;font-family:'Nunito Sans',Arial,sans-serif;font-size:32px;line-height:36px;color:${VERDE};font-weight:800;text-transform:uppercase">${escapeHtml(restoNombre)}</p>` : ""}
                  <p style="margin:0;font-family:'Nunito Sans',Arial,sans-serif;font-size:15px;color:${GRIS_CLARO};font-weight:700;letter-spacing:1px;text-transform:uppercase">${escapeHtml(puestoUpper)}</p>
                </div>
                <p style="margin:5px 0 15px;font-family:'Nunito Sans',Arial,sans-serif;font-size:16px;line-height:1.4;color:${GRIS_MEDIO};font-style:italic;font-weight:700">Te deseamos un día lleno de mucha alegría y momentos especiales.</p>
                <table cellpadding="0" cellspacing="0" align="center" style="border-spacing:0;border-collapse:collapse;margin-bottom:20px"><tbody><tr>
                  <td style="padding:0 10px 0 0"><a href="https://www.instagram.com/simco.mx/" target="_blank"><img src="${IMGUR_INSTAGRAM}" alt="Instagram" width="28" height="28" style="border:0;display:block;border-radius:6px"></a></td>
                  <td style="padding:0;background-color:${BLANCO};border-radius:50%;width:28px;height:28px;vertical-align:middle"><a href="https://www.linkedin.com/company/simco-company" target="_blank"><img src="${IMGUR_LINKEDIN}" alt="LinkedIn" width="28" height="28" style="border:0;display:block;border-radius:50%"></a></td>
                </tr></tbody></table>
              </td>
              <td width="260" valign="middle" style="padding:0;vertical-align:middle">
                ${fotoTag}
              </td>
            </tr></tbody></table>
          </td></tr>
          <tr><td align="center" style="padding:0">
            <img src="${IMGUR_DECORACION}" alt="Decoracion" width="500" style="border:0;display:block;width:600px;max-width:600px">
          </td></tr>
        </tbody>
      </table>
      <table width="600" cellpadding="0" cellspacing="0" style="border-spacing:0;border-collapse:collapse"><tbody><tr>
        <td align="center" style="padding:10px 0 20px;font-family:'Nunito Sans',Arial,sans-serif;font-size:11px;color:rgb(153,153,153)">© 2026 SIMCo. Todos los derechos reservados.</td>
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
