/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
import https from 'node:https';
import http from 'node:http';

const RULES = [
  { header: 'strict-transport-security', id: 'hdr-hsts', severity: 'high',
    title: 'Falta HSTS (Strict-Transport-Security)',
    detail: 'Sin HSTS, un visitante puede ser degradado a HTTP en la primera conexión y quedar expuesto a interceptación en redes públicas.',
    fix: 'Añadir: Strict-Transport-Security: max-age=31536000; includeSubDomains' },
  { header: 'content-security-policy', id: 'hdr-csp', severity: 'high',
    title: 'Falta Content-Security-Policy',
    detail: 'CSP es la defensa principal contra XSS e inyección de scripts de terceros. Sin ella, cualquier script inyectado se ejecuta.',
    fix: "Empezar en modo aviso: Content-Security-Policy-Report-Only: default-src 'self', y endurecer desde ahí." },
  { header: 'x-frame-options', id: 'hdr-xfo', severity: 'medium', alt: 'content-security-policy',
    title: 'Falta X-Frame-Options',
    detail: 'Permite que la web se cargue dentro de un iframe ajeno (clickjacking): un atacante superpone tu web bajo su interfaz.',
    fix: 'Añadir: X-Frame-Options: SAMEORIGIN (o frame-ancestors en la CSP).' },
  { header: 'x-content-type-options', id: 'hdr-xcto', severity: 'medium',
    title: 'Falta X-Content-Type-Options',
    detail: 'El navegador puede adivinar el tipo de un archivo y ejecutar como script algo que no lo era.',
    fix: 'Añadir: X-Content-Type-Options: nosniff' },
  { header: 'referrer-policy', id: 'hdr-ref', severity: 'low',
    title: 'Falta Referrer-Policy',
    detail: 'Las URLs internas de tu sitio se filtran a terceros al hacer clic en enlaces salientes.',
    fix: 'Añadir: Referrer-Policy: strict-origin-when-cross-origin' },
  { header: 'permissions-policy', id: 'hdr-pp', severity: 'low',
    title: 'Falta Permissions-Policy',
    detail: 'No se restringe qué APIs del navegador (cámara, micrófono, geolocalización) pueden usar los scripts embebidos.',
    fix: 'Añadir: Permissions-Policy: camera=(), microphone=(), geolocation=()' }
];

export function checkHeaders(domain, { timeout = 12000 } = {}) {
  return new Promise((resolve) => {
    const req = https.request({ host: domain, port: 443, path: '/', method: 'GET', timeout,
      headers: { 'User-Agent': 'web-exposure-scan/1.0 (+defensive posture check)' } }, (res) => {
      res.resume();
      const h = res.headers;
      const findings = [];
      const code = res.statusCode || 0;

      // Si la portada no devuelve una respuesta normal (403 de un WAF, 5xx, etc.), las
      // cabeceras que vemos son las de la página de error, no las del sitio real.
      // Afirmar "te faltan cabeceras" sobre un 403 es un falso positivo.
      const trustworthy = code >= 200 && code < 400;
      if (!trustworthy) {
        findings.push({ id: 'http-abnormal-status', severity: 'low',
          title: `La portada respondió ${code}, no una página normal`,
          detail: 'Puede ser un WAF o un bloqueo a clientes sin navegador. Las cabeceras de seguridad no se evalúan porque las de una página de error no representan al sitio.',
          fix: 'Repetir la comprobación desde un navegador real o permitir el user-agent del escáner.' });
        return resolve({ ok: true, findings, evidence: {
          statusCode: code, headersEvaluated: false,
          server: h['server'] || null, poweredBy: h['x-powered-by'] || null,
          presentSecurityHeaders: RULES.filter(r => h[r.header] != null).map(r => r.header),
          cookieCount: (h['set-cookie'] || []).length }});
      }

      for (const rule of RULES) {
        const present = h[rule.header] != null;
        const altCovers = rule.alt && typeof h[rule.alt] === 'string' && /frame-ancestors/i.test(h[rule.alt]);
        if (!present && !altCovers) {
          findings.push({ id: rule.id, severity: rule.severity, title: rule.title, detail: rule.detail, fix: rule.fix });
        }
      }

      const hsts = h['strict-transport-security'];
      if (hsts) {
        const m = /max-age=(\d+)/i.exec(hsts);
        if (m && Number(m[1]) < 15552000) {
          findings.push({ id: 'hdr-hsts-short', severity: 'low',
            title: 'HSTS con max-age demasiado corto',
            detail: `max-age=${m[1]} (menos de 180 días). Reduce mucho su eficacia.`,
            fix: 'Subir a max-age=31536000 (1 año).' });
        }
      }

      if (h['server'] && /\d+\.\d+/.test(h['server'])) {
        findings.push({ id: 'hdr-server-version', severity: 'low',
          title: `El servidor publica su versión exacta (${h['server']})`,
          detail: 'Facilita a un atacante emparejar tu versión con exploits públicos conocidos.',
          fix: 'Ocultar la versión: server_tokens off (nginx) o ServerTokens Prod (Apache).' });
      }
      if (h['x-powered-by']) {
        findings.push({ id: 'hdr-powered-by', severity: 'low',
          title: `Cabecera X-Powered-By expuesta (${h['x-powered-by']})`,
          detail: 'Revela el framework y su versión sin ninguna necesidad funcional.',
          fix: 'Eliminar la cabecera (app.disable("x-powered-by") en Express).' });
      }

      const setCookie = res.headers['set-cookie'] || [];
      for (const c of setCookie) {
        const name = c.split('=')[0];
        const flags = [];
        if (!/;\s*secure/i.test(c)) flags.push('Secure');
        if (!/;\s*httponly/i.test(c)) flags.push('HttpOnly');
        if (flags.length) {
          findings.push({ id: 'cookie-flags-' + name, severity: 'medium',
            title: `Cookie "${name}" sin ${flags.join(' ni ')}`,
            detail: 'Una cookie sin estas marcas puede viajar en claro o ser leída por JavaScript inyectado.',
            fix: `Emitir la cookie con: ${flags.join('; ')}; SameSite=Lax` });
        }
      }

      resolve({ ok: true, findings, evidence: {
        statusCode: code, headersEvaluated: true,
        server: h['server'] || null,
        poweredBy: h['x-powered-by'] || null,
        presentSecurityHeaders: RULES.filter(r => h[r.header] != null).map(r => r.header),
        cookieCount: setCookie.length
      }});
    });

    req.on('timeout', () => { req.destroy(); resolve(unreachable('timeout')); });
    req.on('error', (e) => resolve(unreachable(e.message)));
    req.end();
  });
}

function unreachable(msg) {
  return { ok: false, evidence: { error: msg }, findings: [{
    id: 'http-unreachable', severity: 'high',
    title: 'No se pudo leer la home por HTTPS',
    detail: `La petición falló (${msg}), así que no se pudieron comprobar las cabeceras de seguridad.`,
    fix: 'Revisar que el sitio responde en https:// y que no bloquea peticiones sin navegador.'
  }]};
}
