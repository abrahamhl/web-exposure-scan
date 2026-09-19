#!/usr/bin/env node
/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { scanMany } from '../src/engine.js';
import { renderHtml } from '../src/report/html.js';
import { AUTHORIZATION_NOTICE } from '../src/authorization.js';

const HELP = `
web-exposure-scan (wxs) — auditoría pasiva de exposición web

  wxs <dominio...> --i-am-authorized [opciones]
  wxs --file dominios.txt --i-am-authorized [opciones]

Opciones
  --i-am-authorized   Obligatorio. Confirmas que eres dueño del dominio o tienes permiso escrito.
  --file <ruta>       Lee dominios de un fichero, uno por línea.
  --out <carpeta>     Dónde escribir los informes (por defecto: ./out)
  --market <ES|NL>    Tarifa a aplicar en el presupuesto (por defecto: ES)
  --brand <nombre>    Nombre que firma el informe (por defecto: AUX Design)
  --json              Escribe solo JSON, sin informe HTML
  --quiet             Sin salida por consola salvo errores

${AUTHORIZATION_NOTICE}
`;

function parseArgs(argv) {
  const o = { domains: [], out: 'out', market: 'ES', brand: 'AUX Design', json: false, quiet: false, authorized: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--i-am-authorized') o.authorized = true;
    else if (a === '--json') o.json = true;
    else if (a === '--quiet') o.quiet = true;
    else if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--market') o.market = (argv[++i] || 'ES').toUpperCase();
    else if (a === '--brand') o.brand = argv[++i];
    else if (a === '--file') o.file = argv[++i];
    else if (a.startsWith('--')) { console.error(`Opción desconocida: ${a}`); process.exit(2); }
    else o.domains.push(a);
  }
  return o;
}

const BAND_ICON = { 'ROJO': '🔴', 'ÁMBAR': '🟠', 'VERDE-BAJO': '🟡', 'VERDE': '🟢' };

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help || (!o.domains.length && !o.file)) { console.log(HELP); process.exit(o.help ? 0 : 2); }

  if (o.file) {
    const txt = await fs.readFile(o.file, 'utf8');
    o.domains.push(...txt.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')));
  }
  if (!o.authorized) {
    console.error('\n✋ Falta --i-am-authorized.\n');
    console.error(AUTHORIZATION_NOTICE + '\n');
    process.exit(3);
  }

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
      if (!o.quiet) console.error(`⚠ ${r.domain}: INCONCLUSO — ${r.reason}`);
      summary.push({ domain: r.domain, status: 'inconclusive', reason: r.reason });
      continue;
    }
    const base = path.join(o.out, r.domain.replace(/[^a-z0-9.-]/g, '_'));
    await fs.writeFile(`${base}.json`, JSON.stringify(r, null, 2), 'utf8');
    if (!o.json) await fs.writeFile(`${base}.html`, renderHtml(r, { brand: o.brand }), 'utf8');
    summary.push({ domain: r.domain, score: r.risk.score, band: r.risk.band,
                   findings: r.findings.length, bundle: r.pricing ? r.pricing.bundle : null });
    if (!o.quiet) {
      console.log(`${BAND_ICON[r.risk.band]} ${r.domain.padEnd(28)} riesgo ${String(r.risk.score).padStart(3)}/100 ` +
        `· ${String(r.findings.length).padStart(2)} hallazgos` +
        (r.pricing ? ` · presupuesto ${r.pricing.bundle} €` : ''));
    }
  }

  await fs.writeFile(path.join(o.out, '_resumen.json'), JSON.stringify(summary, null, 2), 'utf8');
  if (!o.quiet) {
    const ok = summary.filter(s => !s.error);
    const total = ok.reduce((a, s) => a + (s.bundle || 0), 0);
    console.log(`\n${ok.length} dominio(s) analizado(s). Informes en ./${o.out}`);
    if (ok.length) console.log(`Valor total del pipeline si se cerraran todos: ${total} €`);
  }
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
