#!/usr/bin/env node
/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { scanMany, VERSION } from '../src/engine.js';
import { renderHtml } from '../src/report/html.js';
import { renderCompareHtml, diffResults } from '../src/report/compare.js';
import { AUTHORIZATION_NOTICE } from '../src/authorization.js';
import { LANGS } from '../src/i18n.js';
import { PACKAGES } from '../src/report/offer.js';

const HELP = `
web-exposure-scan (wxs) v${VERSION} — passive e-mail & web exposure check

  wxs <domain...> --i-am-authorized [options]
  wxs --file domains.txt --i-am-authorized [options]
  wxs compare <before.json> <after.json> [--lang nl] [--out dir]

Options
  --i-am-authorized   Required for scans. You own the domain or hold written permission.
  --file <path>       Read domains from a file, one per line (# for comments).
  --out <dir>         Where reports go (default: ./out)
  --lang <es|nl|en>   Language of the client report (default: es)
  --brand <name>      Name that signs the report (default: AUX Design)
  --contact <text>    Contact line in the footer (default: auxdesign.nl)
  --no-offer          Leave the package/price block out of the report
  --offer-file <json> Override package prices/texts (same shape as src/report/offer.js)
  --market <ES|NL>    Legacy per-finding estimate kept in the JSON (default: NL if --lang nl)
  --json              Write JSON only, no HTML
  --quiet             No console output except errors

Examples
  wxs <domein.nl> --i-am-authorized --lang nl
  wxs compare out/<domein.nl>.json after/<domein.nl>.json --lang nl --out oplevering

${AUTHORIZATION_NOTICE}
`;

function parseArgs(argv) {
  const o = { domains: [], out: 'out', market: null, brand: 'AUX Design', contact: 'auxdesign.nl',
    lang: 'es', offer: true, json: false, quiet: false, authorized: false };
  const need = (i, flag) => { if (argv[i] == null || argv[i].startsWith('--')) { console.error(`${flag} needs a value`); process.exit(2); } return argv[i]; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--i-am-authorized') o.authorized = true;
    else if (a === '--json') o.json = true;
    else if (a === '--quiet') o.quiet = true;
    else if (a === '--no-offer') o.offer = false;
    else if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--version' || a === '-v') o.version = true;
    else if (a === '--out') o.out = need(++i, a);
    else if (a === '--market') o.market = need(++i, a).toUpperCase();
    else if (a === '--brand') o.brand = need(++i, a);
    else if (a === '--contact') o.contact = need(++i, a);
    else if (a === '--lang') o.lang = need(++i, a).toLowerCase();
    else if (a === '--file') o.file = need(++i, a);
    else if (a === '--offer-file') o.offerFile = need(++i, a);
    else if (a.startsWith('--')) { console.error(`Unknown option: ${a}`); process.exit(2); }
    else o.domains.push(a);
  }
  if (!LANGS.includes(o.lang)) { console.error(`--lang must be one of ${LANGS.join(', ')}`); process.exit(2); }
  if (!o.market) o.market = o.lang === 'nl' ? 'NL' : 'ES';
  return o;
}

async function readJson(p) {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); }
  catch (e) { throw new Error(`cannot read ${p}: ${e.message}`); }
}

async function runCompare(o) {
  const [a, b] = o.domains;
  if (!a || !b) { console.error('Usage: wxs compare <before.json> <after.json>'); process.exit(2); }
  const before = await readJson(a), after = await readJson(b);
  const d = diffResults(before, after);
  await fs.mkdir(o.out, { recursive: true });
  const file = path.join(o.out, `${d.domain.replace(/[^a-z0-9.-]/g, '_')}.oplevering.html`);
  await fs.writeFile(file, renderCompareHtml(before, after, { brand: o.brand, contact: o.contact, lang: o.lang }), 'utf8');
  if (!o.quiet) {
    console.log(`${d.domain}: ${d.resolved.length} resolved · ${d.remaining.length} still open · ${d.added.length} new · score ${d.scoreBefore} → ${d.scoreAfter}`);
    console.log(`Report: ${path.resolve(file)}`);
  }
}

const BAND_ICON = { 'ROJO': '🔴', 'ÁMBAR': '🟠', 'VERDE-BAJO': '🟡', 'VERDE': '🟢' };

async function main() {
  const argv = process.argv.slice(2);
  const isCompare = argv[0] === 'compare';
  const o = parseArgs(isCompare ? argv.slice(1) : argv);
  if (o.version) { console.log(VERSION); return; }
  if (isCompare) return runCompare(o);
  if (o.help || (!o.domains.length && !o.file)) { console.log(HELP); process.exit(o.help ? 0 : 2); }

  if (o.file) {
    const txt = await fs.readFile(o.file, 'utf8');
    o.domains.push(...txt.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')));
  }
  if (!o.authorized) {
    console.error('\n✋ Missing --i-am-authorized.\n');
    console.error(AUTHORIZATION_NOTICE + '\n');
    process.exit(3);
  }
  const packages = o.offerFile ? { ...PACKAGES, ...(await readJson(o.offerFile)) } : PACKAGES;

  await fs.mkdir(o.out, { recursive: true });
  const results = await scanMany(o.domains, o);
  const summary = [];

  for (const r of results) {
    if (r.error) {
      if (!o.quiet) console.error(`✗ ${r.domain}: ${r.error}`);
      summary.push({ domain: r.domain, error: r.error });
      continue;
    }
    if (r.status === 'inconclusive') {
      if (!o.quiet) console.error(`⚠ ${r.domain}: INCONCLUSIVE — ${r.reason}`);
      summary.push({ domain: r.domain, status: 'inconclusive', reason: r.reason });
      continue;
    }
    const base = path.join(o.out, r.domain.replace(/[^a-z0-9.-]/g, '_'));
    await fs.writeFile(`${base}.json`, JSON.stringify(r, null, 2), 'utf8');
    if (!o.json) await fs.writeFile(`${base}.html`,
      renderHtml(r, { brand: o.brand, contact: o.contact, lang: o.lang, offer: o.offer, packages }), 'utf8');
    summary.push({ domain: r.domain, status: r.status, score: r.risk.score, band: r.risk.band,
                   findings: r.findings.length, ids: r.findings.map(f => f.id) });
    if (!o.quiet) {
      console.log(`${BAND_ICON[r.risk.band] || '·'} ${r.domain.padEnd(28)} score ${String(r.risk.score).padStart(3)}/100 ` +
        `· ${String(r.findings.length).padStart(2)} findings`);
    }
  }

  await fs.writeFile(path.join(o.out, '_summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  if (!o.quiet) {
    const ok = summary.filter(s => !s.error && s.status !== 'inconclusive');
    console.log(`\n${ok.length} domain(s) scanned. Reports in ${path.resolve(o.out)}`);
  }
  // Non-zero exit only when nothing could be scanned at all.
  if (results.length && results.every(r => r.error || r.status === 'inconclusive')) process.exitCode = 1;
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
