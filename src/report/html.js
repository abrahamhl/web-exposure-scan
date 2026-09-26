/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
import { localizeFinding, ui } from '../i18n.js';
import { recommend, PACKAGES } from './offer.js';

export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

export const SEV_COLOR = { critical: '#b42318', high: '#c4320a', medium: '#a15c07', low: '#475467' };
const BAND = { 'ROJO': '#b42318', 'ÁMBAR': '#c4320a', 'VERDE-BAJO': '#a15c07', 'VERDE': '#067647' };
const EMAIL = /^dns-(spf|dmarc|mx|dkim|no-mail)/;

export const BASE_CSS = `
 *{box-sizing:border-box}
 body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      color:#101828;margin:0;background:#f2f4f7;line-height:1.5}
 .page{max-width:880px;margin:0 auto;background:#fff;padding:40px 44px 48px}
 header{border-bottom:3px solid var(--band);padding-bottom:16px;margin-bottom:22px}
 h1{font-size:22px;margin:0 0 6px}
 .meta{color:#475467;font-size:13px}
 h3{font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:#475467;margin:28px 0 8px}
 table{width:100%;border-collapse:collapse;font-size:14px}
 td,th{border-bottom:1px solid #eaecf0;padding:11px 8px;vertical-align:top;text-align:left}
 th{font-size:12px;color:#475467;font-weight:600}
 .sev{color:#fff;font-size:10px;font-weight:700;padding:3px 7px;border-radius:3px;white-space:nowrap}
 .t{font-weight:600}
 .d{color:#475467;font-size:13px;margin-top:3px}
 .fix{color:#067647;font-size:13px;margin-top:5px}
 .box{border:1px solid #d0d5dd;border-radius:8px;padding:14px 16px;margin:18px 0;font-size:14px}
 .box b{display:block;margin-bottom:4px}
 .box a{color:#175cd3}
 .ev{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#475467;
     background:#f9fafb;border:1px solid #eaecf0;border-radius:6px;padding:12px;word-break:break-all}
 footer{margin-top:30px;padding-top:14px;border-top:1px solid #eaecf0;color:#667085;font-size:12px}
 @media (max-width:600px){.page{padding:22px 16px}.tiles{grid-template-columns:repeat(2,1fr)!important}}
 @media print{body{background:#fff}.page{padding:0;max-width:none}a{color:inherit;text-decoration:none}}
`;

function findingRows(list, L, lang) {
  return list.map((f, i) => {
    const t = localizeFinding(f, lang);
    const sev = SEV_COLOR[f.severity] ? f.severity : 'low';
    return `
    <tr>
      <td style="color:#98a2b3;width:26px">${i + 1}</td>
      <td style="width:78px"><span class="sev" style="background:${SEV_COLOR[sev]}">${esc(L.sev[sev])}</span></td>
      <td>
        <div class="t">${esc(t.title)}</div>
        <div class="d">${esc(t.detail)}</div>
        <div class="fix"><strong>${esc(L.howFix)}</strong> ${esc(t.fix)}</div>
      </td>
    </tr>`;
  }).join('');
}

function offerBlock(result, L, lang, packages) {
  const lines = recommend(result, packages);
  if (!lines.length) return '';
  const rows = lines.map(p => `
    <tr${p.recommended ? ' style="background:#f0f9ff"' : ''}>
      <td><div class="t">${esc(p.name[lang] || p.name.en)}${p.recommended ? ` <span class="sev" style="background:#175cd3">${esc(L.recommended)}</span>` : ''}</div>
          <div class="d">${esc(p.what[lang] || p.what.en)}</div></td>
      <td style="text-align:right;white-space:nowrap;font-weight:700">${p.from ? (lang === 'nl' ? 'vanaf ' : lang === 'en' ? 'from ' : 'desde ') : ''}€ ${esc(p.price)}${p.recurring ? esc(L.perMonth) : ''}</td>
    </tr>`).join('');
  return `<h3>${esc(L.offerTitle)} <span style="text-transform:none;letter-spacing:0">(${esc(L.exVat)})</span></h3>
<table>${rows}</table>`;
}

export function renderHtml(result, { brand = 'AUX Design', contact = 'auxdesign.nl', lang = 'es', offer = true, packages = PACKAGES } = {}) {
  const L = ui(lang);
  const { domain } = result;
  const findings = result.findings || [];
  const risk = result.risk || { score: 0, band: 'VERDE' };
  const ev = result.evidence || {};
  const tls = ev.tls || {}, http = ev.http || {}, dns = ev.dns || {};
  const bandColor = BAND[risk.band] || '#475467';
  const date = new Date(result.startedAt || Date.now()).toLocaleDateString(L.locale, { day: '2-digit', month: 'long', year: 'numeric' });

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) if (counts[f.severity] != null) counts[f.severity]++;

  const mail = findings.filter(f => EMAIL.test(f.key || f.id));
  const web = findings.filter(f => !EMAIL.test(f.key || f.id));
  const section = (title, list) => list.length ? `<h3>${esc(title)}</h3><table>${findingRows(list, L, lang)}</table>` : '';

  return `<!doctype html>
<html lang="${L.htmlLang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(L.reportTitle)} — ${esc(domain)}</title>
<style>:root{--band:${bandColor}}${BASE_CSS}
 .score{display:flex;gap:24px;align-items:center;margin:20px 0;padding:18px 20px;background:#f9fafb;border:1px solid #eaecf0;border-radius:8px}
 .dial{width:96px;height:96px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;
       background:conic-gradient(var(--band) calc(var(--p)*1%), #eaecf0 0);}
 .dial i{width:74px;height:74px;border-radius:50%;background:#fff;display:grid;place-items:center;
         font-style:normal;font-size:24px;font-weight:700;color:var(--band)}
 .score h2{margin:0 0 4px;font-size:17px}
 .score p{margin:0;color:#475467;font-size:14px}
 .tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}
 .tile{border:1px solid #eaecf0;border-radius:7px;padding:10px;text-align:center}
 .tile b{display:block;font-size:20px}
 .tile span{font-size:11px;color:#475467;text-transform:uppercase;letter-spacing:.06em}
</style></head><body><div class="page">
<header>
  <h1>${esc(L.reportTitle)} — ${esc(domain)}</h1>
  <div class="meta">${esc(brand)} · ${esc(date)} · ${esc(L.passive)}</div>
</header>

<div class="score">
  <div class="dial" style="--p:${Number(risk.score) || 0}"><i>${Number(risk.score) || 0}</i></div>
  <div>
    <h2>${esc(L.level)}: ${esc(L.bands[risk.band] || risk.band)}</h2>
    <p>${L.summary(findings.length, esc(domain))}</p>
  </div>
</div>

<div class="tiles">
  ${['critical', 'high', 'medium', 'low'].map(s => `<div class="tile"><b style="color:${SEV_COLOR[s]}">${counts[s]}</b><span>${esc(L.sevPlural[s])}</span></div>`).join('')}
</div>

${findings.length ? section(L.email, mail) + section(L.web, web) : `<h3>${esc(L.findings)}</h3><p>${esc(L.none)}</p>`}

<div class="box"><b>${esc(L.verifyTitle)}</b>${L.verify(encodeURIComponent(domain))}</div>

${offer ? offerBlock(result, L, lang, packages) : ''}

<h3>${esc(L.evidence)}</h3>
<div class="ev">
TLS: ${esc(tls.protocol || L.na)} · ${esc(tls.cipher || L.na)} · ${esc(tls.issuer || L.na)} · ${esc(tls.validTo || L.na)}<br>
HTTP: ${esc(http.statusCode || L.na)} · server ${esc(http.server || L.hidden)} · headers ${http.presentSecurityHeaders ? http.presentSecurityHeaders.length : 0}/6${ev.redirect ? ` · http→https ${ev.redirect.redirectsToHttps ? L.yes : (ev.redirect.httpStatus ? L.no : L.na)}` : ''}<br>
SPF: ${esc(dns.spf || L.no)}<br>
DMARC: ${esc(dns.dmarc || L.no)}<br>
MX ${esc(dns.mxCount ?? L.na)} · DKIM ${esc(dns.dkimSelectorsFound && dns.dkimSelectorsFound.length ? dns.dkimSelectorsFound.join(', ') : L.na)} · CAA ${esc(dns.caaCount ?? L.na)}
</div>

<footer>
${esc(L.footer(result.version || '', date))}<br>
${esc(brand)} — ${esc(contact)}
</footer>
</div></body></html>`;
}
