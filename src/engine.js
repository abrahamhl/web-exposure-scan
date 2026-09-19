/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
import { checkTls } from './checks/tls.js';
import { checkHeaders } from './checks/headers.js';
import { checkDns } from './checks/dns.js';
import { preflight } from './checks/reachability.js';
import { quote, riskScore } from './report/pricing.js';
import { assertAuthorized, normalizeDomain } from './authorization.js';

const ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export async function scanDomain(rawDomain, opts = {}) {
  const domain = normalizeDomain(rawDomain);
  assertAuthorized(domain, opts);

  const startedAt = new Date().toISOString();

  // Pre-vuelo: nunca emitir un informe si el fallo es de NUESTRA red.
  const pre = await preflight(domain, opts);
  if (pre.state === 'inconclusive') {
    return { tool: 'web-exposure-scan', version: '1.0.0', domain, startedAt,
      finishedAt: new Date().toISOString(), status: 'inconclusive', reason: pre.reason,
      findings: [], risk: null, pricing: null };
  }
  if (pre.state === 'nxdomain') {
    return { tool: 'web-exposure-scan', version: '1.0.0', domain, startedAt,
      finishedAt: new Date().toISOString(), status: 'nxdomain', reason: pre.reason,
      findings: [{ id: 'dns-nxdomain', severity: 'critical', title: 'El dominio no resuelve',
        detail: pre.reason, fix: 'Comprobar el registro del dominio y sus servidores DNS.' }],
      risk: { score: 100, band: 'ROJO' }, pricing: null };
  }

  const [tlsRes, hdrRes, dnsRes] = await Promise.all([
    checkTls(domain, opts),
    checkHeaders(domain, opts),
    checkDns(domain, opts)
  ]);

  const findings = [...tlsRes.findings, ...hdrRes.findings, ...dnsRes.findings]
    .sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  const risk = riskScore(findings);
  const pricing = quote(findings, opts.market || 'ES');

  return {
    tool: 'web-exposure-scan', version: '1.0.0', status: 'ok',
    domain, startedAt, finishedAt: new Date().toISOString(),
    risk, pricing, findings,
    evidence: { tls: tlsRes.evidence, http: hdrRes.evidence, dns: dnsRes.evidence },
    reachable: { tls: tlsRes.ok, http: hdrRes.ok, dns: dnsRes.ok }
  };
}

export async function scanMany(domains, opts = {}) {
  const out = [];
  for (const d of domains) {
    try { out.push(await scanDomain(d, opts)); }
    catch (e) { out.push({ domain: d, error: e.message, code: e.code || null }); }
  }
  return out;
}
