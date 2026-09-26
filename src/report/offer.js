// Fixed-price packages shown on the client report. A small business buys a clear
// package, not an estimate built from severity weights. Prices are EUR excl. VAT and
// are the single source of truth for PRICING.md -- change them here, not in the docs.
// Override per run with --offer-file <json> (same shape as PACKAGES).

export const PACKAGES = {
  domainlock: {
    price: 49, recurring: false,
    name: { nl: 'Domeinslot', en: 'Domain lock', es: 'Candado de dominio' },
    what: {
      nl: 'Voor een domein dat geen mail gebruikt: SPF "-all" en DMARC "reject" publiceren, controleren en vastleggen.',
      en: 'For a domain that sends no mail: publish SPF "-all" and DMARC "reject", verify and document.',
      es: 'Para un dominio sin correo: publicar SPF "-all" y DMARC "reject", verificar y documentar.'
    }
  },
  basis: {
    price: 149, recurring: false,
    name: { nl: 'Mailslot Basis', en: 'Mail lock Basic', es: 'Correo blindado Básico' },
    what: {
      nl: 'SPF correct instellen, DKIM aanzetten waar de mailprovider dat ondersteunt, DMARC met rapportage (p=none) en een voor/na-rapport. Klaar binnen 1 werkdag na DNS-toegang.',
      en: 'Correct SPF, DKIM enabled where the mail provider supports it, DMARC with reporting (p=none), and a before/after report. Done within 1 working day of DNS access.',
      es: 'SPF correcto, DKIM activado si el proveedor lo permite, DMARC con informes (p=none) e informe antes/después. En 1 día laborable desde el acceso DNS.'
    }
  },
  compleet: {
    price: 349, recurring: false,
    name: { nl: 'Mailslot Compleet', en: 'Mail lock Complete', es: 'Correo blindado Completo' },
    what: {
      nl: 'Alles uit Basis, plus: in kaart brengen wie namens u mailt (webshop, boekhoudpakket, nieuwsbrief), 4 weken rapporten lezen en DMARC stap voor stap naar p=reject. Afsluiting met opleverrapport en internet.nl-test.',
      en: 'Everything in Basic, plus: map who sends mail on your behalf (webshop, accounting software, newsletter), 4 weeks of report review and a step-by-step move to DMARC p=reject. Closes with a hand-over report and an internet.nl test.',
      es: 'Todo lo de Básico, más: inventario de quién envía en tu nombre (tienda, contabilidad, newsletter), 4 semanas de informes y paso gradual a DMARC p=reject. Cierre con informe de entrega y test de internet.nl.'
    }
  },
  web: {
    price: 149, from: true, recurring: false,
    name: { nl: 'Website-beveiliging (headers & HTTPS)', en: 'Website hardening (headers & HTTPS)', es: 'Endurecimiento web (cabeceras y HTTPS)' },
    what: {
      nl: 'HTTPS-doorverwijzing en beveiligingsheaders instellen bij uw hosting of CMS, met hercontrole. Prijs hangt af van de hosting; vaste prijs vooraf.',
      en: 'HTTPS redirect and security headers at your hosting or CMS, with re-check. Price depends on the hosting; fixed quote up front.',
      es: 'Redirección HTTPS y cabeceras de seguridad en tu hosting o CMS, con re-test. El precio depende del hosting; cerrado de antemano.'
    }
  },
  watch: {
    price: 15, recurring: true,
    name: { nl: 'Wachter', en: 'Watch', es: 'Vigilancia' },
    what: {
      nl: 'Elke maand hercontrole van dit domein en de DMARC-rapporten; bericht als er iets verandert of misgaat. Maandelijks opzegbaar.',
      en: 'Monthly re-check of this domain and its DMARC reports; a message when something changes or breaks. Cancel monthly.',
      es: 'Re-test mensual del dominio y de los informes DMARC; aviso si algo cambia o se rompe. Cancelable cada mes.'
    }
  }
};

const EMAIL = /^dns-(spf|dmarc|mx|dkim|no-mail)/;
const WEB = /^(hdr-|http-|tls-|cookie-)/;

// Decide which packages to show and which one to mark as recommended.
export function recommend(result, packages = PACKAGES) {
  const ids = (result.findings || []).map(f => f.key || f.id);
  const email = ids.filter(id => EMAIL.test(id));
  const web = ids.filter(id => WEB.test(id) && id !== 'http-abnormal-status' && id !== 'http-unreachable');
  const receivesMail = (result.evidence?.dns?.mxCount || 0) > 0;
  const lines = [];

  if (email.length === 1 && email[0] === 'dns-no-mail-unprotected') {
    lines.push({ code: 'domainlock', recommended: true });
  } else if (email.length) {
    const needsEnforcement = email.some(id => /dmarc-(missing|none)|spf-(missing|soft)|mx-without-spf/.test(id));
    lines.push({ code: 'basis', recommended: !(receivesMail && needsEnforcement) });
    lines.push({ code: 'compleet', recommended: receivesMail && needsEnforcement });
  }
  if (web.length) lines.push({ code: 'web', recommended: !email.length });
  if (lines.length) lines.push({ code: 'watch', recommended: false });

  return lines.filter(l => packages[l.code]).map(l => ({ ...l, ...packages[l.code] }));
}
