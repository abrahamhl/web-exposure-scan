// Before/after hand-over report. This is the document that closes a job: the client
// sees what was wrong, what is fixed now, and can re-check it on internet.nl.
import { localizeFinding, ui } from '../i18n.js';
import { esc, SEV_COLOR, BASE_CSS } from './html.js';

export function diffResults(before, after) {
  if (!before || !after) throw new Error('compare needs two scan results');
  if (before.domain !== after.domain) {
    throw new Error(`domain mismatch: "${before.domain}" vs "${after.domain}"`);
  }
  const idsAfter = new Set((after.findings || []).map(f => f.id));
  const idsBefore = new Set((before.findings || []).map(f => f.id));
  return {
    domain: after.domain,
    resolved: (before.findings || []).filter(f => !idsAfter.has(f.id)),
    remaining: (after.findings || []).filter(f => idsBefore.has(f.id)),
    added: (after.findings || []).filter(f => !idsBefore.has(f.id)),
    scoreBefore: before.risk?.score ?? null,
    scoreAfter: after.risk?.score ?? null,
    dateBefore: before.startedAt, dateAfter: after.startedAt
  };
}

const TXT = {
  nl: { title: 'Opleverrapport', resolved: 'Opgelost', remaining: 'Nog open', added: 'Nieuw sinds de eerste controle',
        before: 'Eerste controle', after: 'Hercontrole', score: 'Score (lager is beter)', nothing: 'Geen.',
        dns: 'DNS-instellingen na de werkzaamheden' },
  en: { title: 'Hand-over report', resolved: 'Fixed', remaining: 'Still open', added: 'New since the first check',
        before: 'First check', after: 'Re-check', score: 'Score (lower is better)', nothing: 'None.',
        dns: 'DNS settings after the work' },
  es: { title: 'Informe de entrega', resolved: 'Resuelto', remaining: 'Pendiente', added: 'Nuevo desde la primera revisión',
        before: 'Primera revisión', after: 'Re-test', score: 'Puntuación (menos es mejor)', nothing: 'Nada.',
        dns: 'Configuración DNS tras el trabajo' }
};

export function renderCompareHtml(before, after, { brand = 'AUX Design', contact = 'auxdesign.nl', lang = 'es' } = {}) {
  const d = diffResults(before, after);
  const L = ui(lang), X = TXT[lang] || TXT.es;
  const fmt = (iso) => iso ? new Date(iso).toLocaleDateString(L.locale, { day: '2-digit', month: 'long', year: 'numeric' }) : L.na;
  const list = (items, mark) => items.length
    ? `<table>${items.map(f => {
        const t = localizeFinding(f, lang);
        const sev = SEV_COLOR[f.severity] ? f.severity : 'low';
        return `<tr><td style="width:28px;font-size:18px">${mark}</td>
          <td style="width:78px"><span class="sev" style="background:${SEV_COLOR[sev]}">${esc(L.sev[sev])}</span></td>
          <td><div class="t">${esc(t.title)}</div></td></tr>`;
      }).join('')}</table>`
    : `<p>${esc(X.nothing)}</p>`;
  const dns = after.evidence?.dns || {};

  return `<!doctype html>
<html lang="${L.htmlLang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(X.title)} — ${esc(d.domain)}</title>
<style>:root{--band:#067647}${BASE_CSS}
 .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}
 .kpi div{border:1px solid #eaecf0;border-radius:8px;padding:12px;text-align:center}
 .kpi b{display:block;font-size:22px}
 .kpi span{font-size:12px;color:#475467}
</style></head><body><div class="page">
<header>
  <h1>${esc(X.title)} — ${esc(d.domain)}</h1>
  <div class="meta">${esc(brand)} · ${esc(X.before)}: ${esc(fmt(d.dateBefore))} · ${esc(X.after)}: ${esc(fmt(d.dateAfter))}</div>
</header>

<div class="kpi">
  <div><b style="color:#067647">${d.resolved.length}</b><span>${esc(X.resolved)}</span></div>
  <div><b style="color:#a15c07">${d.remaining.length}</b><span>${esc(X.remaining)}</span></div>
  <div><b>${esc(d.scoreBefore ?? L.na)} → ${esc(d.scoreAfter ?? L.na)}</b><span>${esc(X.score)}</span></div>
</div>

<h3>${esc(X.resolved)}</h3>${list(d.resolved, '✓')}
<h3>${esc(X.remaining)}</h3>${list(d.remaining, '•')}
${d.added.length ? `<h3>${esc(X.added)}</h3>${list(d.added, '!')}` : ''}

<h3>${esc(X.dns)}</h3>
<div class="ev">SPF: ${esc(dns.spf || L.no)}<br>DMARC: ${esc(dns.dmarc || L.no)}<br>DKIM: ${esc(dns.dkimSelectorsFound && dns.dkimSelectorsFound.length ? dns.dkimSelectorsFound.join(', ') : L.na)}</div>

<div class="box"><b>${esc(L.verifyTitle)}</b>${L.verify(encodeURIComponent(d.domain))}</div>

<footer>${esc(L.footer(after.version || '', fmt(d.dateAfter)))}<br>${esc(brand)} — ${esc(contact)}</footer>
</div></body></html>`;
}
