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

// Common DKIM selectors. Microsoft 365: selector1/selector2. Google Workspace: google.
// Mailchimp/Mandrill: k1, mandrill. Hostinger: hostingermail-a (CNAME). Proton: protonmail.
// Fastmail: fm1. Strato: strato-dkim-0001. Many hosts: default, dkim, mail, s1/s2.
// Finding none here does NOT prove DKIM is absent -- the report says exactly that.
export const DKIM_SELECTORS = ['selector1', 'selector2', 'google', 'default', 'dkim', 'mail', 'k1', 's1', 's2',
  'hostingermail-a', 'protonmail', 'fm1', 'mandrill', 'strato-dkim-0001'];

async function probeDkim(domain, resolver) {
  const hits = await Promise.all(DKIM_SELECTORS.map(async (sel) => {
    try {
      const t = await withTimeout(resolver.resolveTxt(`${sel}._domainkey.${domain}`), 4000);
      if (t.map(c => c.join('')).some(r => /v=DKIM1|k=rsa|k=ed25519|p=/i.test(r))) return sel;
    } catch {}
    // Providers that rotate keys (Hostinger, Microsoft 365) publish a CNAME to their own
    // zone; a CNAME under _domainkey is itself evidence that DKIM was set up.
    try {
      const c = await withTimeout(resolver.resolveCname(`${sel}._domainkey.${domain}`), 4000);
      if (c && c.length) return sel;
    } catch {}
    return null;
  }));
  return hits.filter(Boolean);
}

export async function checkDns(domain, { dnsServers = ['1.1.1.1', '8.8.8.8'] } = {}) {
  const findings = [];
  const apex = await txtWithFallback(domain, dnsServers);
  const dm = await txtWithFallback(`_dmarc.${domain}`, dnsServers);

  const spf = apex.records.find(r => /^v=spf1/i.test(r)) || null;
  const dmarc = dm.records.find(r => /^v=DMARC1/i.test(r)) || null;

  const r = new Resolver(); r.setServers(dnsServers);
  let caa = [], mx = [], mxReliable = true;
  try { caa = await withTimeout(r.resolveCaa(domain)); } catch {}
  try { mx = await withTimeout(r.resolveMx(domain)); }
  catch (e) { if (e.code !== 'ENODATA' && e.code !== 'ENOTFOUND') mxReliable = false; }
  // RFC 7505 null MX ("0 .") means: this domain explicitly accepts no mail.
  const realMx = mx.filter(m => m.exchange && m.exchange !== '.');
  const receivesMail = realMx.length > 0;
  const dkimSelectors = receivesMail ? await probeDkim(domain, r) : [];

  // Can we trust the apex read? If there is NOT A SINGLE TXT, the answer was most
  // likely truncated or filtered by the network, not an empty zone.
  const apexTrustworthy = apex.reliable && apex.records.length > 0;
  // A domain with no MX and no TXT at all is plausibly a mail-less domain; in that case
  // an empty apex is believable as long as the MX read itself was reliable.
  const mailless = mxReliable && !receivesMail;

  if (!spf && mailless && apex.reliable) {
    if (!dmarc || !/p=reject/i.test(dmarc)) {
      findings.push({ id: 'dns-no-mail-unprotected', severity: 'medium',
        title: 'Dominio sin correo, pero sin blindar',
        detail: 'Este dominio no recibe correo, pero tampoco declara que no lo envía. Los estafadores usan justo estos dominios como remitente.',
        fix: 'Publicar SPF "v=spf1 -all" y DMARC "v=DMARC1; p=reject". Cinco minutos de trabajo.' });
    }
  } else if (!spf) {
    if (apexTrustworthy) {
      findings.push({ id: 'dns-spf-missing', severity: 'high',
        title: 'Sin registro SPF',
        detail: 'No hay ninguna declaración de qué servidores pueden enviar correo en nombre del dominio, así que un remitente falsificado con tu dominio se detecta peor.',
        fix: 'Publicar un TXT: v=spf1 include:<tu-proveedor-de-correo> -all' });
    } else {
      findings.push({ id: 'dns-spf-unverified', severity: 'low', params: { domain },
        title: 'SPF no verificable desde esta red',
        detail: 'No se obtuvo ningún registro TXT del dominio, lo que apunta a truncamiento o filtrado DNS, no necesariamente a ausencia de SPF. No se afirma nada al respecto.',
        fix: 'Repetir la comprobación desde otra red, o verificar a mano: dig +tcp TXT ' + domain });
    }
  } else if (/[~?]all\s*$/.test(spf)) {
    const tail = /[~?]all/.exec(spf)[0];
    findings.push({ id: 'dns-spf-soft', severity: 'medium', params: { tail },
      title: 'SPF en modo permisivo',
      detail: `El registro termina en "${tail}", que solo marca el correo falso en vez de rechazarlo.`,
      fix: 'Cuando hayas verificado todos tus emisores legítimos, cerrar con -all' });
  }

  if (!dmarc) {
    // For a mail-less domain the dns-no-mail-unprotected finding already covers DMARC.
    if (dm.reliable && !(mailless && !spf)) {
      findings.push({ id: 'dns-dmarc-missing', severity: 'high',
        title: 'Sin registro DMARC',
        detail: 'Sin DMARC no hay política de qué hacer con el correo que suplanta tu dominio, ni informes de quién lo intenta.',
        fix: 'Publicar TXT en _dmarc: v=DMARC1; p=none; rua=mailto:dmarc@tu-dominio (y endurecer después).' });
    }
  } else {
    if (/p=none/i.test(dmarc)) {
      findings.push({ id: 'dns-dmarc-none', severity: 'medium',
        title: 'DMARC en p=none (solo observa)',
        detail: 'La política está en modo observación: se registra la suplantación pero no se bloquea.',
        fix: 'Tras 2-4 semanas revisando informes, pasar a p=quarantine y luego a p=reject.' });
    }
    if (!/rua=/i.test(dmarc) && receivesMail) {
      findings.push({ id: 'dns-dmarc-no-rua', severity: 'low',
        title: 'DMARC sin dirección de informes (rua)',
        detail: 'No llegan informes, así que nadie ve si hay abuso o si falla correo legítimo. Así no se puede endurecer con seguridad.',
        fix: 'Añadir rua=mailto:<buzón-de-informes> (un servicio gratuito de informes DMARC basta para un dominio pequeño).' });
    }
  }

  // Only cross MX with SPF if the apex read is trustworthy.
  if (receivesMail && !spf && apexTrustworthy) {
    findings.push({ id: 'dns-mx-without-spf', severity: 'high', params: { mx: realMx.length },
      title: 'El dominio recibe correo pero no protege su envío',
      detail: `Hay ${realMx.length} servidor(es) de correo configurados y ningún SPF: combinación ideal para el fraude del CEO.`,
      fix: 'Publicar SPF y DMARC antes que cualquier otra cosa de esta lista.' });
  }

  if (receivesMail && !dkimSelectors.length) {
    findings.push({ id: 'dns-dkim-not-found', severity: 'low', params: { selectors: DKIM_SELECTORS },
      title: 'No se encontró DKIM en los selectores habituales',
      detail: `Comprobados: ${DKIM_SELECTORS.join(', ')}. DKIM puede existir con otro nombre; desde fuera no se puede confirmar. Sin DKIM, DMARC suele fallar con el correo reenviado.`,
      fix: 'Activar la firma DKIM en el proveedor de correo (Microsoft 365, Google Workspace, hosting) y publicar sus registros DNS.' });
  }

  if (!caa.length) {
    findings.push({ id: 'dns-caa-missing', severity: 'low',
      title: 'Sin registro CAA',
      detail: 'Cualquier autoridad certificadora puede emitir un certificado para tu dominio.',
      fix: 'Publicar CAA: 0 issue "letsencrypt.org" (o tu CA).' });
  }

  return { ok: true, findings, evidence: {
    spf, dmarc, mxCount: realMx.length, mxReadReliable: mxReliable,
    mxHosts: realMx.map(m => m.exchange).slice(0, 5),
    dkimSelectorsFound: dkimSelectors,
    caaCount: caa.length,
    apexTxtCount: apex.records.length, apexReadReliable: apexTrustworthy
  }};
}
