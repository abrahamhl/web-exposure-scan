/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDomain, assertAuthorized } from '../src/authorization.js';
import { quote, riskScore } from '../src/report/pricing.js';
import { renderHtml } from '../src/report/html.js';

test('normalizeDomain limpia esquema, www, puerto y ruta', () => {
  assert.equal(normalizeDomain('https://www.Ejemplo.com:443/algo?x=1'), 'ejemplo.com');
  assert.equal(normalizeDomain('  SUB.dominio.co.uk '), 'sub.dominio.co.uk');
});

test('normalizeDomain rechaza basura', () => {
  for (const bad of ['', 'no-dominio', 'espacios en medio.com', '...']) {
    assert.throws(() => normalizeDomain(bad));
  }
});

test('el gate de autorizacion bloquea por defecto', () => {
  assert.throws(() => assertAuthorized('x.com', {}), /authorization not confirmed/);
  assert.equal(assertAuthorized('x.com', { authorized: true }), true);
});

test('riskScore pondera por gravedad y satura en 100', () => {
  assert.deepEqual(riskScore([]), { score: 0, band: 'VERDE' });
  assert.equal(riskScore([{ severity: 'low' }]).score, 3);
  assert.equal(riskScore([{ severity: 'critical' }, { severity: 'high' }]).score, 60);
  assert.equal(riskScore(Array(10).fill({ severity: 'critical' })).score, 100);
  assert.equal(riskScore([{ severity: 'critical' }, { severity: 'critical' }]).band, 'ROJO');
});

test('quote calcula presupuesto, respeta el tope y cambia con el mercado', () => {
  const f = [{ severity: 'critical' }, { severity: 'high' }, { severity: 'low' }];
  const es = quote(f, 'ES');
  assert.equal(es.counts.critical, 1);
  assert.equal(es.remediation, 350 + 200 + 45);
  assert.ok(es.bundle > es.remediation, 'el paquete incluye parte de la auditoria');
  const nl = quote(f, 'NL');
  assert.ok(nl.remediation < es.remediation, 'NL es mas barato que ES');
  const capped = quote(Array(30).fill({ severity: 'critical' }), 'ES');
  assert.equal(capped.remediation, 2400, 'se aplica el tope');
});

test('quote sin hallazgos cobra solo la auditoria', () => {
  const q = quote([], 'ES');
  assert.equal(q.remediation, 0);
  assert.equal(q.bundle, q.auditFee);
});

test('el informe HTML escapa el contenido (sin inyeccion)', () => {
  const html = renderHtml({
    version: '1.0.0', domain: 'x<script>alert(1)</script>.com',
    startedAt: new Date().toISOString(),
    risk: { score: 40, band: 'ÁMBAR' },
    pricing: quote([{ severity: 'high' }], 'ES'),
    findings: [{ severity: 'high', title: '<img src=x onerror=alert(1)>', detail: 'd', fix: 'f' }],
    evidence: { tls: {}, http: {}, dns: {} }
  });
  // Lo que importa no es que la cadena "onerror=" no aparezca -- aparece, como TEXTO
  // visible e inerte. Lo que importa es que el contenido inyectado no llegue a formar
  // una etiqueta: si el "<" va escapado, el navegador lo pinta, no lo ejecuta.
  assert.ok(!/<script>alert\(1\)<\/script>/.test(html), 'no debe existir una etiqueta script viva');
  assert.ok(!/<img\s/i.test(html), 'no debe existir una etiqueta img viva');
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'), 'debe aparecer escapado y completo');
  assert.ok(html.includes('&lt;script&gt;'), 'el dominio inyectado tambien va escapado');
});

test('el informe HTML no revienta con campos vacios o nulos', () => {
  const html = renderHtml({
    version: '1.0.0', domain: 'vacio.com', startedAt: new Date().toISOString(),
    risk: { score: 0, band: 'VERDE' }, pricing: quote([], 'ES'), findings: [],
    evidence: { tls: {}, http: {}, dns: {} }
  });
  assert.ok(html.includes('Sin hallazgos'), 'debe mostrar el caso sin hallazgos');
  assert.ok(!html.includes('undefined'), 'no debe imprimir undefined en el informe de un cliente');
});

// ---------- v1.1: i18n, offer, compare ----------
import fs from 'node:fs';
import { localizeFinding, UI } from '../src/i18n.js';
import { recommend, PACKAGES } from '../src/report/offer.js';
import { diffResults, renderCompareHtml } from '../src/report/compare.js';

function emittedIds() {
  const src = ['src/checks/tls.js', 'src/checks/headers.js', 'src/checks/dns.js', 'src/engine.js']
    .map(p => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8')).join('\n');
  const ids = new Set();
  for (const m of src.matchAll(/(?:key|id): '([a-z0-9-]+)'/g)) ids.add(m[1]);
  for (const m of src.matchAll(/header: '[^']+', id: '([a-z-]+)'/g)) ids.add(m[1]);
  return [...ids].filter(id => !id.endsWith('-')); // 'cookie-flags-' + name carries key 'cookie-flags'
}

test('every finding the checks can emit has Dutch and English text', () => {
  const ids = emittedIds();
  assert.ok(ids.length >= 25, `expected many ids, got ${ids.length}`);
  for (const id of ids) {
    for (const lang of ['nl', 'en']) {
      const f = { id, title: 'ES', detail: 'ES', fix: 'ES',
        params: { authError: 'x', days: 3, validTo: 'd', protocol: 'TLSv1', cipher: 'RC4', msg: 'm', maxAge: 10,
                  server: 's/1.0', value: 'v', name: 'sid', flags: ['Secure'], code: 200, domain: 'x.nl',
                  reason: 'r', tail: '~all', mx: 2, selectors: ['google'] } };
      const t = localizeFinding(f, lang);
      assert.notEqual(t.title, 'ES', `${id} has no ${lang} title`);
      for (const k of ['title', 'detail', 'fix']) assert.ok(!String(t[k]).includes('undefined'), `${id}/${lang}/${k}`);
    }
  }
});

test('localizeFinding falls back to the check text for unknown ids and for es', () => {
  const f = { id: 'something-new', title: 'T', detail: 'D', fix: 'F' };
  assert.deepEqual(localizeFinding(f, 'nl'), { title: 'T', detail: 'D', fix: 'F' });
  assert.equal(localizeFinding({ id: 'dns-spf-missing', title: 'T', detail: 'D', fix: 'F' }, 'es').title, 'T');
});

const res = (ids, mx = 1) => ({ findings: ids.map(id => ({ id, severity: 'high' })), evidence: { dns: { mxCount: mx } } });

test('offer: a domain that receives mail and lacks DMARC gets Compleet recommended', () => {
  const lines = recommend(res(['dns-dmarc-missing', 'hdr-csp']));
  const codes = lines.map(l => l.code);
  assert.deepEqual(codes, ['basis', 'compleet', 'web', 'watch']);
  assert.equal(lines.find(l => l.recommended).code, 'compleet');
});

test('offer: a mail-less unprotected domain gets only the cheap domain lock', () => {
  const lines = recommend(res(['dns-no-mail-unprotected'], 0));
  assert.equal(lines[0].code, 'domainlock');
  assert.equal(lines[0].price, PACKAGES.domainlock.price);
});

test('offer: web-only findings recommend web hardening, nothing when clean', () => {
  assert.equal(recommend(res(['hdr-hsts'])).find(l => l.recommended).code, 'web');
  assert.deepEqual(recommend(res([])), []);
});

test('compare: resolved / remaining / added are computed by finding id', () => {
  const before = { domain: 'a.nl', risk: { score: 60 }, findings: [{ id: 'x', severity: 'high' }, { id: 'y', severity: 'low' }] };
  const after = { domain: 'a.nl', risk: { score: 3 }, findings: [{ id: 'y', severity: 'low' }, { id: 'z', severity: 'low' }] };
  const d = diffResults(before, after);
  assert.deepEqual(d.resolved.map(f => f.id), ['x']);
  assert.deepEqual(d.remaining.map(f => f.id), ['y']);
  assert.deepEqual(d.added.map(f => f.id), ['z']);
  assert.throws(() => diffResults(before, { ...after, domain: 'b.nl' }), /mismatch/);
});

test('compare report renders in Dutch with the internet.nl link and escapes content', () => {
  const before = { domain: 'a.nl', startedAt: new Date().toISOString(), risk: { score: 40 },
    findings: [{ id: 'dns-dmarc-missing', severity: 'high', title: '<b>x</b>' }] };
  const after = { domain: 'a.nl', startedAt: new Date().toISOString(), risk: { score: 0 }, findings: [],
    evidence: { dns: { spf: 'v=spf1 <script> -all', dmarc: 'v=DMARC1; p=reject' } } };
  const html = renderCompareHtml(before, after, { lang: 'nl' });
  assert.ok(html.includes('Opleverrapport'));
  assert.ok(html.includes('Geen DMARC-record'));
  assert.ok(html.includes('https://internet.nl/mail/a.nl/'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('undefined'));
});

test('Dutch client report: translated, grouped, with offer and no undefined', () => {
  const html = renderHtml({
    version: '1.1.0', domain: 'bakker.nl', startedAt: new Date().toISOString(),
    risk: { score: 48, band: 'ÁMBAR' },
    findings: [{ id: 'dns-dmarc-missing', severity: 'high', title: 'es' }, { id: 'hdr-hsts', severity: 'high', title: 'es' }],
    evidence: { tls: {}, http: {}, dns: { mxCount: 1 } }
  }, { lang: 'nl' });
  for (const s of ['lang="nl"', 'Geen DMARC-record', 'HSTS ontbreekt', 'ORANJE', 'Mailslot Compleet', 'excl. btw', 'internet.nl/mail/bakker.nl'])
    assert.ok(html.includes(s), `missing: ${s}`);
  assert.ok(!html.includes('undefined'));
  assert.ok(!renderHtml({ domain: 'bakker.nl', findings: [], risk: { score: 0, band: 'VERDE' } }, { lang: 'nl', offer: false }).includes('Mailslot'));
});

test('report survives an nxdomain result without evidence', () => {
  const html = renderHtml({ domain: 'gone.nl', status: 'nxdomain', startedAt: new Date().toISOString(),
    risk: { score: 100, band: 'ROJO' }, pricing: null,
    findings: [{ id: 'dns-nxdomain', severity: 'critical', params: { reason: 'no IP' }, title: 't', detail: 'd', fix: 'f' }] }, { lang: 'en' });
  assert.ok(html.includes('Domain does not resolve'));
  assert.ok(!html.includes('undefined'));
});

test('UI dictionaries expose the same keys in every language', () => {
  const keys = Object.keys(UI.es).sort();
  for (const l of ['nl', 'en']) assert.deepEqual(Object.keys(UI[l]).sort(), keys);
});
