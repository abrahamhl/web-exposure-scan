/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
import tls from 'node:tls';

const WEAK_PROTOCOLS = new Set(['TLSv1', 'TLSv1.1', 'SSLv3']);
const WEAK_CIPHER_HINTS = [/RC4/i, /3DES/i, /DES-/i, /MD5/i, /NULL/i, /EXPORT/i, /CBC3/i];

export function checkTls(domain, { timeout = 10000 } = {}) {
  return new Promise((resolve) => {
    const findings = [];
    const started = Date.now();
    let settled = false;
    const done = (data) => { if (!settled) { settled = true; resolve(data); } };

    let socket;
    try {
      socket = tls.connect({ host: domain, port: 443, servername: domain, timeout }, () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();
        const authorized = socket.authorized;
        const authError = socket.authorizationError;

        if (!authorized) {
          findings.push({
            id: 'tls-invalid-chain', severity: 'critical', params: { authError: authError || null },
            title: 'Certificado TLS no válido',
            detail: `El navegador rechaza el certificado (${authError || 'cadena no verificable'}). Chrome y Firefox mostrarán "No es seguro".`,
            fix: 'Reemitir el certificado con una CA de confianza (Let’s Encrypt sirve y es gratis) e instalar la cadena intermedia completa.'
          });
        }

        let daysLeft = null;
        if (cert && cert.valid_to) {
          daysLeft = Math.floor((new Date(cert.valid_to) - Date.now()) / 86400000);
          if (daysLeft < 0) {
            findings.push({
              id: 'tls-expired', severity: 'critical', params: { days: Math.abs(daysLeft), validTo: cert.valid_to },
              title: 'Certificado TLS caducado',
              detail: `Caducó hace ${Math.abs(daysLeft)} días (${cert.valid_to}).`,
              fix: 'Renovar de inmediato y automatizar la renovación (certbot / ACME).'
            });
          } else if (daysLeft < 21) {
            findings.push({
              id: 'tls-expiring', severity: 'high', params: { days: daysLeft, validTo: cert.valid_to },
              title: 'Certificado TLS a punto de caducar',
              detail: `Le quedan ${daysLeft} días (caduca el ${cert.valid_to}).`,
              fix: 'Renovar ya y activar la renovación automática.'
            });
          }
        }

        if (protocol && WEAK_PROTOCOLS.has(protocol)) {
          findings.push({
            id: 'tls-weak-protocol', severity: 'high', params: { protocol },
            title: `Protocolo TLS obsoleto (${protocol})`,
            detail: 'Protocolos anteriores a TLS 1.2 están retirados y suspenden cualquier cuestionario de seguridad.',
            fix: 'Habilitar únicamente TLS 1.2 y TLS 1.3 en el servidor o el CDN.'
          });
        }

        if (cipher && cipher.name && WEAK_CIPHER_HINTS.some((re) => re.test(cipher.name))) {
          findings.push({
            id: 'tls-weak-cipher', severity: 'medium', params: { cipher: cipher.name },
            title: `Suite de cifrado débil (${cipher.name})`,
            detail: 'La suite negociada usa primitivas consideradas débiles.',
            fix: 'Restringir la lista de cifrados a suites AEAD modernas (AES-GCM, ChaCha20-Poly1305).'
          });
        }

        const evidence = {
          protocol, cipher: cipher ? cipher.name : null,
          issuer: cert && cert.issuer ? (cert.issuer.O || cert.issuer.CN || null) : null,
          subject: cert && cert.subject ? cert.subject.CN || null : null,
          validTo: cert ? cert.valid_to || null : null,
          daysUntilExpiry: daysLeft,
          chainAuthorized: authorized,
          handshakeMs: Date.now() - started
        };
        socket.end();
        done({ ok: true, findings, evidence });
      });
    } catch (e) {
      return done({ ok: false, findings: [tlsUnreachable(e.message)], evidence: { error: e.message } });
    }

    socket.on('timeout', () => { socket.destroy(); done({ ok: false, findings: [tlsUnreachable('timeout')], evidence: { error: 'timeout' } }); });
    socket.on('error', (e) => { done({ ok: false, findings: [tlsUnreachable(e.message)], evidence: { error: e.message } }); });
  });
}

function tlsUnreachable(msg) {
  return {
    id: 'tls-unreachable', severity: 'critical', params: { msg },
    title: 'No se pudo establecer HTTPS',
    detail: `El puerto 443 no respondió correctamente (${msg}). El sitio puede estar sirviéndose solo por HTTP.`,
    fix: 'Publicar el sitio por HTTPS con un certificado válido y redirigir todo el tráfico HTTP a HTTPS.'
  };
}
