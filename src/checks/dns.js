/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
// Regla dura de este módulo: NUNCA afirmar que falta un registro si no hemos podido
// leer la zona con fiabilidad. Decirle a un cliente "no tienes SPF" cuando sí lo tiene
// es el fallo que te quema comercialmente y el que casi todos los escáneres cometen.
// Los TXT del apex suelen pasar de 512 bytes -> truncan por UDP -> respuesta vacía.
// Por eso: doble resolutor (propio + el del sistema) y, si aun así no hay NINGÚN TXT,
// el resultado es "no verificable", no "ausente".
import { Resolver, resolveTxt as sysResolveTxt } from 'node:dns/promises';

// Sin límite de tiempo, un solo dominio lento cuelga un lote de 200. Todo lo que
// salga a la red lleva reloj.
const DNS_TIMEOUT_MS = 6000;
function withTimeout(promise, ms = DNS_TIMEOUT_MS) {
  let t;
  const timer = new Promise((_, rej) => { t = setTimeout(() => rej(Object.assign(new Error('dns-timeout'), { code: 'ETIMEOUT' })), ms); });
  return Promise.race([promise, timer]).finally(() => clearTimeout(t));
}

async function txtWithFallback(name, servers) {
  const r = new Resolver();
  r.setServers(servers);
  try {
    const a = await withTimeout(r.resolveTxt(name));
    if (a && a.length) return { records: a.map(c => c.join('')), reliable: true };
  } catch (e) { if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') return { records: [], reliable: true }; }
  try {
    const b = await withTimeout(sysResolveTxt(name));
    if (b && b.length) return { records: b.map(c => c.join('')), reliable: true };
    return { records: [], reliable: true };
  } catch (e) {
    if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') return { records: [], reliable: true };
    return { records: [], reliable: false, error: e.code || e.message };
  }
}

export async function checkDns(domain, { dnsServers = ['1.1.1.1', '8.8.8.8'] } = {}) {
  const findings = [];
  const apex = await txtWithFallback(domain, dnsServers);
  const dm = await txtWithFallback(`_dmarc.${domain}`, dnsServers);

  const spf = apex.records.find(r => /^v=spf1/i.test(r)) || null;
  const dmarc = dm.records.find(r => /^v=DMARC1/i.test(r)) || null;

  const r = new Resolver(); r.setServers(dnsServers);
  let caa = [], mx = [];
  try { caa = await withTimeout(r.resolveCaa(domain)); } catch {}
  try { mx = await withTimeout(r.resolveMx(domain)); } catch {}

  // ¿Podemos fiarnos de la lectura del apex? Si no hay NI UN SOLO TXT, lo más probable
  // es que la respuesta se truncara o la filtrara la red, no que la zona esté vacía.
  const apexTrustworthy = apex.reliable && apex.records.length > 0;

  if (!spf) {
    if (apexTrustworthy) {
      findings.push({ id: 'dns-spf-missing', severity: 'high',
        title: 'Sin registro SPF',
        detail: 'Cualquiera puede enviar correo haciéndose pasar por tu dominio. Es el vector nº1 de fraude al cliente y de facturas falsas.',
        fix: 'Publicar un TXT: v=spf1 include:<tu-proveedor-de-correo> -all' });
    } else {
      findings.push({ id: 'dns-spf-unverified', severity: 'low',
        title: 'SPF no verificable desde esta red',
        detail: 'No se obtuvo ningún registro TXT del dominio, lo que apunta a truncamiento o filtrado DNS, no necesariamente a ausencia de SPF. No se afirma nada al respecto.',
        fix: 'Repetir la comprobación desde otra red, o verificar a mano: dig +tcp TXT ' + domain });
    }
  } else if (/[~?]all\s*$/.test(spf)) {
    findings.push({ id: 'dns-spf-soft', severity: 'medium',
      title: 'SPF en modo permisivo',
      detail: `El registro termina en "${/[~?]all/.exec(spf)[0]}", que solo marca el correo falso en vez de rechazarlo.`,
      fix: 'Cuando hayas verificado todos tus emisores legítimos, cerrar con -all' });
  }

  if (!dmarc) {
    if (dm.reliable) {
      findings.push({ id: 'dns-dmarc-missing', severity: 'high',
        title: 'Sin registro DMARC',
        detail: 'Sin DMARC no hay política de qué hacer con el correo que suplanta tu dominio, ni informes de quién lo intenta.',
        fix: 'Publicar TXT en _dmarc: v=DMARC1; p=none; rua=mailto:dmarc@tu-dominio (y endurecer después).' });
    }
  } else if (/p=none/i.test(dmarc)) {
    findings.push({ id: 'dns-dmarc-none', severity: 'medium',
      title: 'DMARC en p=none (solo observa)',
      detail: 'La política está en modo observación: se registra la suplantación pero no se bloquea.',
      fix: 'Tras 2-4 semanas revisando informes, pasar a p=quarantine y luego a p=reject.' });
  }

  // Solo cruzamos MX con SPF si la lectura del apex es de fiar.
  if (mx.length && !spf && apexTrustworthy) {
    findings.push({ id: 'dns-mx-without-spf', severity: 'high',
      title: 'El dominio recibe correo pero no protege su envío',
      detail: `Hay ${mx.length} servidor(es) de correo configurados y ningún SPF: combinación ideal para el fraude del CEO.`,
      fix: 'Publicar SPF y DMARC antes que cualquier otra cosa de esta lista.' });
  }

  if (!caa.length) {
    findings.push({ id: 'dns-caa-missing', severity: 'low',
      title: 'Sin registro CAA',
      detail: 'Cualquier autoridad certificadora puede emitir un certificado para tu dominio.',
      fix: 'Publicar CAA: 0 issue "letsencrypt.org" (o tu CA).' });
  }

  return { ok: true, findings, evidence: {
    spf, dmarc, mxCount: mx.length, caaCount: caa.length,
    apexTxtCount: apex.records.length, apexReadReliable: apexTrustworthy
  }};
}
