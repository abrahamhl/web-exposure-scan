/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
// Pre-vuelo. Distingue tres cosas que un escáner ingenuo confunde, y que confundidas
// producen informes FALSOS (decirle a un cliente "no tienes HTTPS" cuando sí lo tiene
// destruye la credibilidad comercial del informe y del que lo firma):
//   1. El dominio no existe            -> hallazgo real
//   2. El dominio existe y responde    -> seguimos
//   3. NUESTRA red no resuelve/llega   -> INCONCLUSO, no se emite informe
import { Resolver } from 'node:dns/promises';

const PREFLIGHT_TIMEOUT_MS = 6000;
function withTimeout(promise, ms = PREFLIGHT_TIMEOUT_MS) {
  let t;
  const timer = new Promise((_, rej) => { t = setTimeout(() => rej(Object.assign(new Error('dns-timeout'), { code: 'ETIMEOUT' })), ms); });
  return Promise.race([promise, timer]).finally(() => clearTimeout(t));
}

const LOCAL_NETWORK_ERRORS = new Set(['EAI_AGAIN', 'ETIMEOUT', 'ETIMEDOUT', 'ECONNREFUSED', 'ESERVFAIL']);

export async function preflight(domain, { dnsServers = ['1.1.1.1', '8.8.8.8'] } = {}) {
  const resolver = new Resolver();
  resolver.setServers(dnsServers);

  // Sonda de control: si un dominio que SIEMPRE existe tampoco resuelve,
  // el problema es nuestro, no del objetivo.
  let controlOk = true;
  try { await withTimeout(resolver.resolve4('cloudflare.com')); }
  catch { controlOk = false; }

  if (!controlOk) {
    return { state: 'inconclusive', reason:
      'Este equipo no puede resolver DNS público (ni siquiera un dominio de control). ' +
      'El escaneo se aborta: cualquier resultado sería un falso positivo. ' +
      'Ejecútalo desde una red sin restricciones de salida.' };
  }

  try {
    const a = await withTimeout(resolver.resolve4(domain)).catch(() => null);
    const aaaa = a ? null : await withTimeout(resolver.resolve6(domain)).catch(() => null);
    if (!a && !aaaa) {
      return { state: 'nxdomain', reason: `El dominio ${domain} no resuelve a ninguna dirección IP.` };
    }
    return { state: 'ok', addresses: a || aaaa };
  } catch (e) {
    if (LOCAL_NETWORK_ERRORS.has(e.code)) {
      return { state: 'inconclusive', reason: `Fallo de red local al resolver ${domain} (${e.code}).` };
    }
    return { state: 'nxdomain', reason: `No se pudo resolver ${domain} (${e.code || e.message}).` };
  }
}
