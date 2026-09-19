/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const SEV = {
  critical: { label: 'CRÍTICO', color: '#c0392b' },
  high:     { label: 'ALTO',    color: '#d35400' },
  medium:   { label: 'MEDIO',   color: '#b7950b' },
  low:       { label: 'BAJO',   color: '#5d6d7e' }
};
const BAND = { 'ROJO': '#c0392b', 'ÁMBAR': '#d35400', 'VERDE-BAJO': '#b7950b', 'VERDE': '#1e8449' };

export function renderHtml(result, { brand = 'AUX Design', contact = 'auxdesign.nl' } = {}) {
  const { domain, risk, pricing, findings, evidence } = result;
  const bandColor = BAND[risk.band] || '#5d6d7e';
  const date = new Date(result.startedAt).toLocaleDateString('es-ES', { day:'2-digit', month:'long', year:'numeric' });

  const rows = findings.map((f, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td><span class="sev" style="background:${SEV[f.severity].color}">${SEV[f.severity].label}</span></td>
      <td>
        <div class="t">${esc(f.title)}</div>
        <div class="d">${esc(f.detail)}</div>
        <div class="fix"><strong>Cómo se arregla:</strong> ${esc(f.fix)}</div>
      </td>
    </tr>`).join('');

  const counts = pricing.counts;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Informe de exposición web — ${esc(domain)}</title>
<style>
 *{box-sizing:border-box}
 body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      color:#1c2833;margin:0;background:#f4f6f7;line-height:1.5}
 .page{max-width:900px;margin:0 auto;background:#fff;padding:40px 44px 56px}
 header{border-bottom:3px solid ${bandColor};padding-bottom:18px;margin-bottom:26px}
 h1{font-size:23px;margin:0 0 6px}
 .meta{color:#5d6d7e;font-size:13px}
 .score{display:flex;gap:26px;align-items:center;margin:26px 0;padding:20px 22px;background:#fbfcfc;border:1px solid #e5e8e8;border-radius:8px}
 .dial{width:104px;height:104px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;
       background:conic-gradient(${bandColor} calc(var(--p)*1%), #e5e8e8 0);}
 .dial i{width:80px;height:80px;border-radius:50%;background:#fff;display:grid;place-items:center;
         font-style:normal;font-size:25px;font-weight:700;color:${bandColor}}
 .score h2{margin:0 0 4px;font-size:17px}
 .score p{margin:0;color:#5d6d7e;font-size:14px}
 .tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:22px 0}
 .tile{border:1px solid #e5e8e8;border-radius:7px;padding:12px;text-align:center}
 .tile b{display:block;font-size:21px}
 .tile span{font-size:11px;color:#5d6d7e;text-transform:uppercase;letter-spacing:.06em}
 h3{font-size:15px;text-transform:uppercase;letter-spacing:.07em;color:#5d6d7e;margin:30px 0 10px}
 table{width:100%;border-collapse:collapse;font-size:14px}
 td{border-bottom:1px solid #eaecee;padding:12px 8px;vertical-align:top}
 td.num{color:#aeb6bf;width:26px}
 .sev{color:#fff;font-size:10px;font-weight:700;padding:3px 7px;border-radius:3px;white-space:nowrap}
 .t{font-weight:600}
 .d{color:#566573;font-size:13px;margin-top:3px}
 .fix{color:#1e8449;font-size:13px;margin-top:5px}
 .quote{margin-top:26px;border:2px solid ${bandColor};border-radius:8px;overflow:hidden}
 .quote .qh{background:${bandColor};color:#fff;padding:10px 16px;font-weight:700;font-size:14px}
 .quote table{font-size:14px}
 .quote td{padding:11px 16px}
 .quote tr:last-child td{border-bottom:0;font-weight:700;font-size:16px;background:#fbfcfc}
 .ev{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#566573;
     background:#fbfcfc;border:1px solid #e5e8e8;border-radius:6px;padding:12px}
 footer{margin-top:34px;padding-top:16px;border-top:1px solid #e5e8e8;color:#85929e;font-size:12px}
 @media print{body{background:#fff}.page{padding:0}}
</style></head><body><div class="page">
<header>
  <h1>Informe de exposición web — ${esc(domain)}</h1>
  <div class="meta">${esc(brand)} · ${date} · análisis pasivo, sin intrusión</div>
</header>

<div class="score">
  <div class="dial" style="--p:${risk.score}"><i>${risk.score}</i></div>
  <div>
    <h2>Nivel de riesgo: ${risk.band}</h2>
    <p>Se han detectado <strong>${findings.length}</strong> puntos de mejora en la configuración pública
    de ${esc(domain)}. Todos son visibles desde fuera, sin acceder a ningún sistema interno:
    exactamente lo que vería un atacante — o un cliente desconfiado.</p>
  </div>
</div>

<div class="tiles">
  <div class="tile"><b style="color:${SEV.critical.color}">${counts.critical}</b><span>Críticos</span></div>
  <div class="tile"><b style="color:${SEV.high.color}">${counts.high}</b><span>Altos</span></div>
  <div class="tile"><b style="color:${SEV.medium.color}">${counts.medium}</b><span>Medios</span></div>
  <div class="tile"><b style="color:${SEV.low.color}">${counts.low}</b><span>Bajos</span></div>
</div>

<h3>Hallazgos</h3>
<table>${rows || '<tr><td colspan="3">Sin hallazgos: la configuración pública es correcta.</td></tr>'}</table>

<div class="quote">
  <div class="qh">Propuesta de intervención</div>
  <table>
    <tr><td>Auditoría documentada y verificación posterior</td><td style="text-align:right">${pricing.auditFee} €</td></tr>
    <tr><td>Remediación de los ${findings.length} hallazgos</td><td style="text-align:right">${pricing.remediation} €</td></tr>
    <tr><td>Paquete completo (auditoría + remediación + re-test)</td><td style="text-align:right">${pricing.bundle} €</td></tr>
  </table>
</div>

<h3>Evidencia técnica</h3>
<div class="ev">
TLS: ${esc(evidence.tls.protocol || 'n/d')} · cifrado ${esc(evidence.tls.cipher || 'n/d')} · emisor ${esc(evidence.tls.issuer || 'n/d')} · caduca ${esc(evidence.tls.validTo || 'n/d')}<br>
HTTP: estado ${esc(evidence.http.statusCode || 'n/d')} · servidor ${esc(evidence.http.server || 'oculto')} · cabeceras de seguridad presentes: ${evidence.http.presentSecurityHeaders ? evidence.http.presentSecurityHeaders.length : 0}<br>
DNS: SPF ${evidence.dns.spf ? 'sí' : 'NO'} · DMARC ${evidence.dns.dmarc ? 'sí' : 'NO'} · MX ${esc(evidence.dns.mxCount)} · CAA ${esc(evidence.dns.caaCount)}
</div>

<footer>
Informe generado por web-exposure-scan v${esc(result.version)} el ${date}. Análisis exclusivamente pasivo:
un handshake TLS, una petición HTTPS a la portada y consultas DNS públicas. No se ha accedido a ningún
sistema, no se han probado credenciales ni se ha eludido ningún control.<br>
Precios orientativos, revisables antes de contratar. ${esc(brand)} — ${esc(contact)}
</footer>
</div></body></html>`;
}
