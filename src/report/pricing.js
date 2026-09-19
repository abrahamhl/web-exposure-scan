/* Generated/Audited by: .claude | Agent-Role: Architect | Timestamp: 2026-09-19 */
// Precios por defecto en EUR. Ajusta MARKET a "ES" o "NL" al invocar.
// Estos números son un PUNTO DE PARTIDA editable, no una tarifa oficial.

const REMEDIATION_UNIT = {
  critical: { ES: 350, NL: 300 },
  high:     { ES: 200, NL: 175 },
  medium:   { ES: 110, NL: 95  },
  low:      { ES: 45,  NL: 40  }
};

const AUDIT_FEE = { ES: 200, NL: 175 };
const CAP = { ES: 2400, NL: 2100 };

export function quote(findings, market = 'ES') {
  const m = REMEDIATION_UNIT.critical[market] ? market : 'ES';
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) if (counts[f.severity] != null) counts[f.severity]++;

  let remediation = 0;
  for (const sev of Object.keys(counts)) remediation += counts[sev] * REMEDIATION_UNIT[sev][m];
  remediation = Math.min(remediation, CAP[m]);

  const audit = AUDIT_FEE[m];
  // El paquete completo descuenta la auditoría: incentivo clásico para cerrar en una sola venta.
  const bundle = remediation > 0 ? remediation + Math.round(audit * 0.5) : audit;

  return {
    market: m, currency: 'EUR', counts,
    auditFee: audit,
    remediation,
    bundle,
    note: 'Precios orientativos generados por el motor. Revísalos antes de enviarlos a un cliente.'
  };
}

export function riskScore(findings) {
  const W = { critical: 40, high: 20, medium: 8, low: 3 };
  let raw = 0;
  for (const f of findings) raw += W[f.severity] || 0;
  const score = Math.min(100, raw);
  const band = score >= 70 ? 'ROJO' : score >= 35 ? 'ÁMBAR' : score > 0 ? 'VERDE-BAJO' : 'VERDE';
  return { score, band };
}
