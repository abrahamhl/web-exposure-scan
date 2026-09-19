/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDomain, assertAuthorized } from '../src/authorization.js';
import { quote, riskScore } from '../src/report/pricing.js';
import { renderHtml } from '../src/report/html.js';

test('normalizeDomain limpia esquema, www, puerto y ruta', () => {
  assert.equal(normalizeDomain('https://www.Ejemplo.com:443/algo?x=1'), 'ejemplo.com');
  assert.equal(normalizeDomain('  SUB.dominio.co.uk '), 'sub.dominio.co.uk');
});

test('normalizeDomain rechaza basura', () => {
  for (const bad of ['', 'no-dominio', 'espacios en medio.com', '...']) {
    assert.throws(() => normalizeDomain(bad));
  }
});

test('el gate de autorizacion bloquea por defecto', () => {
  assert.throws(() => assertAuthorized('x.com', {}), /authorization not confirmed/);
  assert.equal(assertAuthorized('x.com', { authorized: true }), true);
});

test('riskScore pondera por gravedad y satura en 100', () => {
  assert.deepEqual(riskScore([]), { score: 0, band: 'VERDE' });
  assert.equal(riskScore([{ severity: 'low' }]).score, 3);
  assert.equal(riskScore([{ severity: 'critical' }, { severity: 'high' }]).score, 60);
  assert.equal(riskScore(Array(10).fill({ severity: 'critical' })).score, 100);
  assert.equal(riskScore([{ severity: 'critical' }, { severity: 'critical' }]).band, 'ROJO');
});

test('quote calcula presupuesto, respeta el tope y cambia con el mercado', () => {
  const f = [{ severity: 'critical' }, { severity: 'high' }, { severity: 'low' }];
  const es = quote(f, 'ES');
  assert.equal(es.counts.critical, 1);
  assert.equal(es.remediation, 350 + 200 + 45);
  assert.ok(es.bundle > es.remediation, 'el paquete incluye parte de la auditoria');
  const nl = quote(f, 'NL');
  assert.ok(nl.remediation < es.remediation, 'NL es mas barato que ES');
  const capped = quote(Array(30).fill({ severity: 'critical' }), 'ES');
  assert.equal(capped.remediation, 2400, 'se aplica el tope');
});

test('quote sin hallazgos cobra solo la auditoria', () => {
  const q = quote([], 'ES');
  assert.equal(q.remediation, 0);
  assert.equal(q.bundle, q.auditFee);
});

test('el informe HTML escapa el contenido (sin inyeccion)', () => {
  const html = renderHtml({
    version: '1.0.0', domain: 'x<script>alert(1)</script>.com',
    startedAt: new Date().toISOString(),
    risk: { score: 40, band: 'ÁMBAR' },
    pricing: quote([{ severity: 'high' }], 'ES'),
    findings: [{ severity: 'high', title: '<img src=x onerror=alert(1)>', detail: 'd', fix: 'f' }],
    evidence: { tls: {}, http: {}, dns: {} }
  });
  // Lo que importa no es que la cadena "onerror=" no aparezca -- aparece, como TEXTO
  // visible e inerte. Lo que importa es que el contenido inyectado no llegue a formar
  // una etiqueta: si el "<" va escapado, el navegador lo pinta, no lo ejecuta.
  assert.ok(!/<script>alert\(1\)<\/script>/.test(html), 'no debe existir una etiqueta script viva');
  assert.ok(!/<img\s/i.test(html), 'no debe existir una etiqueta img viva');
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'), 'debe aparecer escapado y completo');
  assert.ok(html.includes('&lt;script&gt;'), 'el dominio inyectado tambien va escapado');
});

test('el informe HTML no revienta con campos vacios o nulos', () => {
  const html = renderHtml({
    version: '1.0.0', domain: 'vacio.com', startedAt: new Date().toISOString(),
    risk: { score: 0, band: 'VERDE' }, pricing: quote([], 'ES'), findings: [],
    evidence: { tls: {}, http: {}, dns: {} }
  });
  assert.ok(html.includes('Sin hallazgos'), 'debe mostrar el caso sin hallazgos');
  assert.ok(!html.includes('undefined'), 'no debe imprimir undefined en el informe de un cliente');
});
