#!/usr/bin/env node
// Offline demo: builds a FICTIONAL before/after pair for a made-up bakery on the
// reserved .example TLD (RFC 2606) and renders the client report and the hand-over
// report. No network, no real company. Run: npm run demo
import fs from 'node:fs/promises';
import path from 'node:path';
import { renderHtml } from '../src/report/html.js';
import { renderCompareHtml } from '../src/report/compare.js';
import { riskScore } from '../src/report/pricing.js';
import { VERSION } from '../src/engine.js';

const lang = (process.argv.find(a => a.startsWith('--lang=')) || '--lang=nl').slice(7);
const out = path.resolve('examples/demo');
const domain = 'bakkerij-voorbeeld.example';

const F = {
  spfSoft: { id: 'dns-spf-soft', severity: 'medium', params: { tail: '~all' }, title: 'SPF en modo permisivo', detail: '', fix: '' },
  dmarcMissing: { id: 'dns-dmarc-missing', severity: 'high', title: 'Sin registro DMARC', detail: '', fix: '' },
  dkim: { id: 'dns-dkim-not-found', severity: 'low', params: { selectors: ['selector1', 'selector2', 'google', 'default'] }, title: 'Sin DKIM', detail: '', fix: '' },
  redirect: { id: 'http-no-https-redirect', severity: 'medium', params: { domain, code: 200 }, title: 'Sin redirección', detail: '', fix: '' },
  hsts: { id: 'hdr-hsts', severity: 'high', title: 'Falta HSTS', detail: '', fix: '' },
  caa: { id: 'dns-caa-missing', severity: 'low', title: 'Sin CAA', detail: '', fix: '' }
};

function result(date, findings, dns, http) {
  return {
    tool: 'web-exposure-scan', version: VERSION, status: 'ok', domain, demo: true,
    startedAt: date, finishedAt: date, risk: riskScore(findings), findings,
    evidence: {
      tls: { protocol: 'TLSv1.3', cipher: 'TLS_AES_128_GCM_SHA256', issuer: "Let's Encrypt", validTo: 'Dec 14 09:00:00 2026 GMT', daysUntilExpiry: 79, chainAuthorized: true },
      http, dns, redirect: { httpStatus: http.redirect ? 301 : 200, redirectsToHttps: !!http.redirect }
    }
  };
}

const before = result('2026-09-28T09:10:00.000Z',
  [F.dmarcMissing, F.hsts, F.spfSoft, F.redirect, F.dkim, F.caa],
  { spf: 'v=spf1 include:spf.protection.outlook.com ~all', dmarc: null, mxCount: 1, dkimSelectorsFound: [], caaCount: 0 },
  { statusCode: 200, server: null, presentSecurityHeaders: ['x-content-type-options'], redirect: false });

const after = result('2026-10-27T14:30:00.000Z',
  [F.caa],
  { spf: 'v=spf1 include:spf.protection.outlook.com -all',
    dmarc: 'v=DMARC1; p=reject; rua=mailto:rapport@bakkerij-voorbeeld.example; adkim=r; aspf=r',
    mxCount: 1, dkimSelectorsFound: ['selector1', 'selector2'], caaCount: 0 },
  { statusCode: 200, server: null, presentSecurityHeaders: ['strict-transport-security', 'x-content-type-options'], redirect: true });

await fs.mkdir(out, { recursive: true });
const brand = 'AUX Design (DEMO — fictief bedrijf)';
await fs.writeFile(path.join(out, 'before.json'), JSON.stringify(before, null, 2));
await fs.writeFile(path.join(out, 'after.json'), JSON.stringify(after, null, 2));
await fs.writeFile(path.join(out, `report.${lang}.html`), renderHtml(before, { lang, brand }));
await fs.writeFile(path.join(out, `handover.${lang}.html`), renderCompareHtml(before, after, { lang, brand }));
console.log(`Demo written to ${out}\n  report.${lang}.html   — what the client sees first (score ${before.risk.score})\n  handover.${lang}.html — what closes the job (score ${before.risk.score} → ${after.risk.score})`);
