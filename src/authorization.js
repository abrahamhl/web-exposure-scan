/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
// Authorization gate. This tool only performs passive, unauthenticated checks that a
// normal browser or mail server performs anyway, but it still refuses to run against a
// domain the operator has not explicitly claimed the right to assess.

export const AUTHORIZATION_NOTICE = `
This scanner performs PASSIVE checks only: a TLS handshake, one HTTPS GET of the
homepage, and public DNS lookups. It sends no payloads, tries no credentials, and
never attempts to bypass any control. Even so, only run it against domains you own
or have written permission to assess.
`.trim();

export function assertAuthorized(domain, { authorized }) {
  if (!authorized) {
    const err = new Error(
      `Refusing to scan "${domain}": authorization not confirmed.\n` +
      `Re-run with --i-am-authorized once you own the domain or hold written permission.`
    );
    err.code = 'E_NOT_AUTHORIZED';
    throw err;
  }
  return true;
}

export function normalizeDomain(input) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('Domain required');
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
  if (d.startsWith('www.')) d = d.slice(4);
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(d)) {
    throw new Error(`"${input}" is not a valid domain name`);
  }
  return d;
}
